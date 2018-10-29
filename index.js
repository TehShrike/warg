const makeEmitter = require(`better-emitter`)

const value = (value = null) => {
	const emitter = makeEmitter({
		get() {
			return value
		},
		set(newValue) {
			emitter.emit(`dirty`)
			value = newValue
			emitter.emit(`value`, value)
		},
		locked() {
			return false
		},
	})

	return emitter
}

const combine = dependencies => {
	Object.freeze(dependencies)
	let value = resolve(dependencies)
	let locked = false

	const setDirty = () => {
		locked = true
		emitter.emit(`dirty`)
	}

	onEventFromAnyDependency(dependencies, `dirty`, setDirty)

	onEventFromAnyDependency(dependencies, `value`, () => {
		if (!locked) {
			setDirty()
		}

		if (allDependenciesAreUnlocked(dependencies)) {
			console.log(`updating combination:`)
			value = resolve(dependencies)
			console.log(`became`, value)
			locked = false
			emitter.emit(`value`, value)
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
			throw new Error(`Combinations may not be set`)
		},
		locked() {
			return locked
		},
	})

	return emitter
}

const transform = (dependencies, fn) => {
	const combined = combine(dependencies)
	const observableValue = value()

	const onValueChange = fn(observableValue.set)

	onValueChange(combined.get())

	combined.on(`value`, onValueChange)

	return Object.assign(Object.create(observableValue), {
		set() {
			throw new Error(`Transforms may not be set`)
		},
	})
}

const computed = (dependencies, calculation) => transform(
	dependencies,
	setValue => dependencyValues => setValue(calculation(dependencyValues))
)


module.exports = {
	value,
	combine,
	transform,
	computed,
}

const resolve = dependencies => {
	const resolvedDependencies = {}

	Object.entries(dependencies).forEach(([ key, dependency ]) => {
		resolvedDependencies[key] = dependency.get()
	})

	return resolvedDependencies
}

const allDependenciesAreUnlocked = dependencies => Object.values(dependencies).every(
	dependency => !dependency.locked()
)

const onEventFromAnyDependency = (dependencies, event, cb) => {
	Object.values(dependencies).forEach(dependency => {
		dependency.on(event, cb)
	})
}

