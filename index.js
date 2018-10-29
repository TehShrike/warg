const makeEmitter = require(`better-emitter`)

const value = (value = null) => {
	const emitter = makeEmitter({
		get() {
			return value
		},
		set(newValue) {
			emitter.emit(`dirty`)
			value = newValue
			emitter.emit(`resolved`)
		},
		locked() {
			return false
		},
	})

	return emitter
}

const recalculate = (dependencies, calculation) => {
	const resolvedDependencies = {}

	Object.entries(dependencies).forEach(([ key, dependency ]) => {
		resolvedDependencies[key] = dependency.get()
	})

	return calculation(resolvedDependencies)
}

const allDependenciesAreUnlocked = dependencies => Object.values(dependencies).every(dependency => !dependency.locked())

const onEventFromAnyDependency = (dependencies, event, cb) => {
	Object.values(dependencies).forEach(dependency => {
		dependency.on(event, cb)
	})
}


const computed = (dependencies, calculation) => {
	Object.freeze(dependencies)
	let value = recalculate(dependencies, calculation)
	let locked = false

	onEventFromAnyDependency(dependencies, `dirty`, () => {
		locked = true
		emitter.emit(`dirty`)
	})

	onEventFromAnyDependency(dependencies, `resolved`, () => {
		if (allDependenciesAreUnlocked(dependencies)) {
			value = recalculate(dependencies, calculation)
			locked = false
			emitter.emit(`resolved`)
		}
	})

	const emitter = makeEmitter({
		get() {
			if (locked) {
				throw new Error(`Unreadable!`)
			}

			return value
		},
		set() {
			throw new Error(`Computed values may not be set`)
		},
		locked() {
			return locked
		},
	})

	return emitter
}

const arbitrary = arbitraryFn => {
	let locked = false
	const setDirty = () => {
		emitter.emit(`dirty`)
		locked = true
	}
	const setValue = newValue => {
		value = newValue
		locked = false
		emitter.emit(`resolved`)
	}

	let value = arbitraryFn(setDirty, setValue)

	const emitter = makeEmitter({
		get() {
			if (locked) {
				throw new Error(`Unreadable!`)
			}

			return value
		},
		set() {
			throw new Error(`Arbitary function streams may not be set`)
		},
		locked() {
			return locked
		},
	})

	return emitter
}


module.exports = {
	value,
	computed,
	arbitrary,
}
