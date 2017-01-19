window.tools = {
	isNumeric: function (n) {
		// checks if n is numeric (even if it's a string)
		return !isNaN(parseFloat(n)) && isFinite(n);
	},
	Timer: function (callback, delay) {
		let timeout;
		let start;
		let remaining = delay;

		this.resume = function () {
			start = new Date();
			window.clearTimeout(timeout);
			if (remaining > 0)
				timeout = window.setTimeout(callback, remaining);
		};

		this.pause = function () {
			window.clearTimeout(timeout);
			remaining -= new Date() - start;
		};

		this.resume();
	}
};
