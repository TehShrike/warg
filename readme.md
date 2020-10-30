# A basic reactive/stream library

This library is designed to make [dirty reads](https://en.wikipedia.org/wiki/Isolation_%28database_systems%29#Dirty_reads) impossible - i.e. your computed properties will only be called when there is a consistent state for them to run on.

This library runs calculations synchronously and eagerly.  If you have a ton of upstream data changing and want lazy calculations, use [shiz](https://github.com/tehshrike/shiz).

## Install

```sh
npm i warg
```

CommonJS:
```ts
const { value, computed } = require('warg')
```

ESM:
```ts
import { value, computed } from 'warg'
```

<!--js
const { value, computed } = require('./index.cjs')
-->

## Examples

```js
const numbers = value([ 1, 2, 3, 42, 69])
const factor = value(2)
const multipliedArray = computed({
	numbers,
	factor,
}, ({ numbers, factor }) => numbers.map(number => number * factor))

multipliedArray.get() // => [ 2, 4, 6, 84, 138 ]
```

## API

### `wargObservable = value(initialValue)`

Returns a warg observable with a `set` method.

```js
const wat = value('sup')

wat.get() // => 'sup'

wat.set('dawg')

wat.get() // => 'dawg'
```

### `wargObservable = computed(dependencies, computeFunction)`

Returns a warg observable that takes in an object of dependencies and returns a new warg observable that combines them together with your given function.

```js
const small = value(1)

const bigger = computed({
	number: small
}, ({ number }) => number + 1)

const multiplied = computed({
	a: small,
	b: bigger,
}, ({ a, b }) => a * b)

multiplied.get() // => 2
```

### Warg observable

Besides any methods above, warg observables have these methods:

#### `wargObservable.get()`

Returns the current value.

#### `newWargObservable = wargObservable.map(computeFunction)`

Sugar for `newWargObservable = wargObservable.compute({ observable }, ({ observable }) => computeFunction(observable))`.

```js
const a = value(6)
const special = a.map(value => value * 7)
special.get() // 42
```

#### `unsubscribe = wargObservable.subscribe(callback)`

Calls the callback function whenever the observable value changes.

Also calls the callback function with the current value right away when `subscribe` is called.

```js
value('whu?').subscribe(str => {
	str // => 'whu?'
})
```

### Events

Warg observables are also [event emitters](https://github.com/TehShrike/better-emitter), though the events are more for internal library use.  You probably won't need them.

These events are fired:

- `dirty` - fired whenever a warg observable knows that it, or one of its dependencies, is changed.  You may not read from the observable after this point, until it finishes resolving.
- `value` - fired whenever a warg observable is resolved and becomes readable again - essentially, whenever its value has changed.

Because warg resolves all changes synchronously in the same tick, you should never need to worry about values becoming dirty and resolving themselves.  That all happens behind the scenes before your `set` call completes.

## License

[WTFPL](http://wtfpl2.com)
