// prototype: Canvas ///////////////////////////////////////////////////////////

var Canvas = function () {
	console.log('Canvas instance created');

	this.canvas = {};
	this.context = {};
};

Canvas.prototype.add = function (name, object) {
	console.log('Canvas: adding canvas "' + name + '", object: "' + object + '"');

	// add canvas
	this.canvas[name] = object;
};

Canvas.prototype.addContext = function (name, object) {
	console.log('Canvas: adding context "' + name + '", object: "' + object + '"');

	// add context
	this.context[name] = object;
};

Canvas.prototype.resizeAll = function () {
	// resize all canvases to match window size TODO
	for (var property in this.canvas) {
		if (this.canvas.hasOwnProperty(property)) {
			// if the screen is 4:3 or wider
			if (window.innerHeight / window.innerWidth <= 0.75) {
				this.canvas[property].width = (240 * window.innerWidth) / window.innerHeight;
				this.canvas[property].height = 240;
			// if it's not (some squares or portrait resolutions...?) TODO
			} else if (window.innerHeight / window.innerWidth <= 0.75) {
				this.canvas[property].width = 320;
				this.canvas[property].height = (320 * window.innerHeight) / window.innerWidth;
			}
		}
	}
};
