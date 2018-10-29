const onetime = require(`onetime`)

const mutexify = function() {
	const queue = []
	// let used = null

	const call = function(fn) {
		const release = onetime(() => {
			if (queue.length) {
				call(queue.shift())
			} else {
				acquire.locked = false
			}
		}, { throw: true })

		fn(release)
	}

	const acquire = function(fn) {
		if (acquire.locked) {
			queue.push(fn)
		} else {
			acquire.locked = true
			call(fn)
		}
	}

	acquire.locked = false


	return acquire
}

module.exports = mutexify
