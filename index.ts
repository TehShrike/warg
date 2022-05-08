import makeEmitter, { Emitter } from 'better-emitter'

export interface BasicObservable<T> extends Emitter {
	get(): T,
	set(newValue: T): void,
	locked(): boolean
}

export interface WargObservable<T> extends BasicObservable<T> {
	subscribe(cb: (value: T) => void): () => void,
	map<R>(fn: (value: T) => R): WargObservable<R>
}

type DependencyObject<T extends { [key: string]: any }> = {
	[key in keyof T]: BasicObservable<T[key]>
}

export const value = <T>(value: T): WargObservable<T> => {
	const emitter = makeEmitter({
		get() {
			return value
		},
		set(newValue: T) {
			emitter.emit(`dirty`)
			value = newValue
			emitter.emit(`value`, value)
		},
		locked() {
			return false
		},
	})

	return addHelpers(emitter)
}

const combine = <D extends { [key: string]: any }>(dependencies: DependencyObject<D>): BasicObservable<D> => {
	let value: D = resolve(dependencies)
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
			value = resolve(dependencies)
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

export const computed = <D extends { [key: string]: any }, T>(dependencies: DependencyObject<D>, calculation: (D) => T): WargObservable<T> => {
	const combined = combine(dependencies)
	const observableValue: BasicObservable<T> = value(calculation(combined.get()))

	const onValueChange = dependencyValues => observableValue.set(calculation(dependencyValues))

	combined.on(`value`, onValueChange)

	return Object.assign(addHelpers(observableValue), {
		set() {
			throw new Error(`Transforms may not be set`)
		},
	})
}

type Resolved<T> = {
	[key in keyof T]: T[key]
}

const resolve = <D extends { [key: string]: any }, Values extends Resolved<D>>(dependencies: DependencyObject<D>): Values =>
	Object.entries(dependencies).reduce((previous, [ key, dependency ]) => ({
		...previous,
		[key]: dependency.get(),
	}), {} as Values)

const allDependenciesAreUnlocked = (dependencies: DependencyObject<any>) => Object.values(dependencies).every(
	dependency => !dependency.locked(),
)

const onEventFromAnyDependency = (dependencies: DependencyObject<any>, event: string, cb) => {
	Object.values(dependencies).forEach(dependency => {
		dependency.on(event, cb)
	})
}

const addHelpers = <T>(observable: BasicObservable<T>): WargObservable<T> => Object.assign({}, observable, {
	subscribe(cb) {
		const unsubscribe = observable.on(`value`, cb)

		cb(observable.get())

		return unsubscribe
	},
	map(fn) {
		return computed({ observable }, ({ observable }) => fn(observable))
	},
})
