const test = require(`zora`)
const { value, computed } = require(`./`)

test(`some forking case`, t => {
	const a = value(1)
	const b = value(2)

	const aDoubled = computed({ a }, ({ a }) => a * 2, `aDoubled`)
	console.log(`SET UP aDoubled`)
	const bDoubled = computed({ b }, ({ b }) => b * 2, `bDoubled`)
	console.log(`SET UP bDoubled`)

	const recombined = computed({ aDoubled, bDoubled }, ({ aDoubled, bDoubled }) => aDoubled + bDoubled, `recombined`)

	console.log(`DONE STETTING UP!`)

	t.equal(recombined.get(), 6)
	a.set(3)
	t.equal(recombined.get(), 10)
})
