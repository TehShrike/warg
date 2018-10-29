const test = require(`zora`)
const { value, computed, arbitrary } = require(`./`)

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

const makeCrazyStreamContraption = streamOfStreams => arbitrary((setDirty, setValue) => {
	let unsubscribe = null

	const setUpSubscription = stream => {
		const latestValueSubscription = stream.on(`resolved`, () => setValue(stream.get()))
		const latestDirtySubscription = stream.on(`dirty`, setDirty)
		unsubscribe = () => {
			latestValueSubscription()
			latestDirtySubscription()
		}
	}
	setUpSubscription(streamOfStreams.get())

	streamOfStreams.on(`resolved`, () => {
		unsubscribe()
		setUpSubscription(streamOfStreams.get())
	})

	return streamOfStreams.get().get()
})

test(`A stream that emits streams, and a stream that is the value of whatever the last emitted thing was`, t => {
	const a = value(0)
	const doubled = computed({ a }, ({ a }) => a * 2)
	const streamOfStreams = value(a)

	const latestThingEmittedFromStream = makeCrazyStreamContraption(streamOfStreams)

	t.equal(latestThingEmittedFromStream.get(), 0)
	const b = value(1)
	streamOfStreams.set(b)
	t.equal(latestThingEmittedFromStream.get(), 0, `Still returns the old value for some weird reason`)
	b.set(2)
	t.equal(latestThingEmittedFromStream.get(), 2, `Now it returns the new value for some weird reason`)

	streamOfStreams.set(doubled)
	t.equal(latestThingEmittedFromStream.get(), 0)

	a.set(1)
	t.equal(latestThingEmittedFromStream.get(), 2)
})
