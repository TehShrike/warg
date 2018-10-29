const test = require(`zora`)
const { value, computed, transform } = require(`./`)

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

test(`can I implement filter`, t => {
	const a = value(1)

	const filter = (dependencies, condition) => transform(dependencies, set => dependencyValues => {
		if (condition(dependencyValues)) {
			set(dependencyValues)
		}
	})

	const even = filter({ a }, ({ a }) => (a % 2) === 0)

	t.equal(even.get(), null, `The initial value of even should be null`)

	let firstListenerFired = false
	even.once(`value`, ({ a }) => {
		firstListenerFired = true
		t.equal(a, 4, `The even stream first fires with a value of 4`)
	})

	a.set(4)

	t.ok(firstListenerFired, `The first event listener fired`)
	t.equal(even.get().a, 4, `The current value of the even stream is 4`)

	even.once(`value`, () => {
		t.fail()
	})
	a.set(3)
	t.equal(even.get().a, 4, `Even though its depenant changed to 3, the value of the even stream is still 4`)
})

