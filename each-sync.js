'use strict'
const onetime = require(`onetime`)

module.exports = function(arr, next, cb) {
	let failed = false
	let count = 0

	cb = cb || function() {}

	if (!Array.isArray(arr)) {
		throw new TypeError(`First argument must be an array`)
	}

	if (typeof next !== `function`) {
		throw new TypeError(`Second argument must be a function`)
	}

	const len = arr.length

	if (!len) {
		cb()
		return
	}

	function callback(err) {
		if (failed) {
			return
		}

		if (err !== undefined && err !== null) {
			failed = true
			cb(err)
			return
		}

		if (++count === len) {
			cb()
		}
	}

	for (let i = 0; i < len; i++) {
		next(arr[i], i, onetime(callback, true))
	}
}
