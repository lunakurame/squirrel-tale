window.tools = {
	isNumeric: function (n) {
		// checks if n is numeric (even if it's a string)
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
};
