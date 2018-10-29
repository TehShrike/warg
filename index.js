const mutexify = require(`./mutexify-sync`)
// const each = require(`./each-sync`)
const makeEmitter = require(`better-emitter`)

const noop = () => {}

const value = (value = null) => {
	const emitter = makeEmitter({
		get() {
			return value
		},
		set(newValue) {
			value = newValue
			emitter.emit(`dirty`)
		},
		acquireLock: cb => cb(value, noop),
	})

	return emitter
}

const recalculate = (dependencies, calculation) => {
	const resolvedDependencies = {}

	console.log(`when passed...`, Object.keys(dependencies), Object.values(dependencies).map(dependency => dependency.locked && dependency.locked()))
	acquireLocksOnAll(Object.entries(dependencies), resolvedDependencyEntries => {
		console.log(`inside the acquireLocksOnAll callback!`, resolvedDependencyEntries)
		resolvedDependencyEntries.forEach(([ key, value ]) => {
			resolvedDependencies[key] = value
		})
	})
	console.log(`calling`, calculation, `with`, resolvedDependencies)
	return calculation(resolvedDependencies)
}

const acquireLocksOnAll = (dependencyEntries, cb, resultEntries = []) => {
	console.log(`acquireLocksOnAll: entries`, dependencyEntries.length)
	if (dependencyEntries.length === 0) {
		throw new Error(`Shouldn't happen in testing`)
		// cb(noop)
	} else if (dependencyEntries.length === 1) {
		const [ key, dependency ] = dependencyEntries[0]
		dependency.acquireLock((value, done) => {
			console.log(`inside lock for`, key, `got`, value)
			const newResults = [ ...resultEntries, [ key, value ] ]
			cb(newResults)
			done()
		})
	} else {
		const [ nextDependency, ...rest ] = dependencyEntries
		const [ key, dependency ] = nextDependency

		console.log(`acquireLocksOnAll: locking`, key, `locked:`, dependency.locked && dependency.locked())
		dependency.acquireLock((value, done) => {
			console.log(`inside lock for`, key, `got`, value)
			const newResults = [ ...resultEntries, [ key, value ] ]
			// console.log(`acquired one lock...`)
			acquireLocksOnAll(rest, cb, newResults)
			done()
		})
	}
}

const onEventFromAnyDependency = (dependencies, event, cb) => {
	const mutex = mutexify()
	Object.entries(dependencies).forEach(([ key, dependency ]) => {
		console.log(`adding`, event, `listener to`, key)
		dependency.on(event, () => {
			console.log(`onEventFromAnyDependency:`, key, `fired`, event)
			if (!mutex.locked) {
				console.log(`onEventFromAnyDependency handling`, event)
				mutex(done => {
					cb()
					done()
				})
			}
		})
	})
}


const computed = (dependencies, calculation, name = null) => {
	Object.freeze(dependencies)
	let value = recalculate(dependencies, calculation)
	const mutex = mutexify()

	onEventFromAnyDependency(dependencies, `dirty`, () => {
		mutex(done => {
			emitter.emit(`dirty`)
			value = recalculate(dependencies, calculation)
			done()
		})
	})

	const emitter = makeEmitter({
		get() {
			if (mutex.locked) {
				throw new Error(`Unreadable!`)
			}

			return value
		},
		set() {
			throw new Error(`Computed values may not be set`)
		},
		acquireLock: fn => mutex(done => {
			console.log(name, `has been locked - returning value`, value)
			fn(value, done)
		}),
		locked() {
			return mutex.locked
		},
	})

	return emitter
}


module.exports = {
	value,
	computed,
}
