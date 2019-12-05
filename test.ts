import { test } from 'zora'
import { value, computed } from './index'

test(`some forking case`, t => {
	const a = value(1)
	const b = value(2)

	const aDoubled = computed({ a }, ({ a }) => a * 2)
	const bDoubled = computed({ b }, ({ b }) => b * 2)

	let recombinedComputedCalculations = 0

	const recombined = computed({ aDoubled, bDoubled }, ({ aDoubled, bDoubled }) => {
		recombinedComputedCalculations += 1
		return aDoubled + bDoubled
	})

	t.equal(recombinedComputedCalculations, 1, `1 calculation so far`)
	t.equal(recombined.get(), 6, `recombined value is 6`)
	a.set(3)
	t.equal(recombinedComputedCalculations, 2, `2 calculations so far`)
	t.equal(recombined.get(), 10, `recombined value is 10`)
})

test(`subscribe method`, t => {
	const a = value(1)

	const tripled = computed({ a }, ({ a }) => a * 3)

	let aCalls = 0
	const aUnsubscribe = a.subscribe(value => {
		if (aCalls === 0) {
			t.equal(value, 1)
		} else if (aCalls === 1) {
			t.equal(value, 2)
		} else {
			t.fail(`a.subscribe callback called too many times`)
		}

		aCalls++
	})

	t.equal(aCalls, 1)

	let tripledCalls = 0
	const tripledUnsubscribe = tripled.subscribe(value => {
		if (tripledCalls === 0) {
			t.equal(value, 3)
		} else if (tripledCalls === 1) {
			t.equal(value, 6)
		} else {
			t.fail(`tripled.subscribe callback called too many times`)
		}

		tripledCalls++
	})

	t.equal(tripledCalls, 1)

	a.set(2)

	t.equal(aCalls, 2)
	t.equal(tripledCalls, 2)

	aUnsubscribe()
	tripledUnsubscribe()

	a.set(3)

	t.equal(aCalls, 2)
	t.equal(tripledCalls, 2)
})

test(`map`, t => {
	const makeExciting = str => str + `!`
	const word = value(`hi`)
	const loud = computed({ word }, ({ word }) => word.toUpperCase())

	const exciting = word.map(makeExciting)
	const loudExciting = loud.map(makeExciting)

	t.equal(exciting.get(), `hi!`)
	t.equal(loudExciting.get(), `HI!`)

	word.set(`what`)

	t.equal(exciting.get(), `what!`)
	t.equal(loudExciting.get(), `WHAT!`)
})
