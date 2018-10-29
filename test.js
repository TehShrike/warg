const test = require(`zora`)
const { value, computed } = require(`./`)

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

	t.equal(recombinedComputedCalculations, 1)
	t.equal(recombined.get(), 6)
	a.set(3)
	t.equal(recombinedComputedCalculations, 2)
	t.equal(recombined.get(), 10)
})
