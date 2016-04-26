// prototype: CanvasList ///////////////////////////////////////////////////////

var CanvasList = function (application) {
	console.log('CanvasList instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Player: constructor: application is required');

	this.app = application;
	this.canvas = {};
	this.context = {};
};

CanvasList.prototype.add = function (name, object) {
	console.log('CanvasList: adding canvas "' + name + '", object: "' + object + '"');

	// add canvas
	this.canvas[name] = object;
};

CanvasList.prototype.addContext = function (name, object) {
	console.log('CanvasList: adding context "' + name + '", object: "' + object + '"');

	// add context
	this.context[name] = object;
};

CanvasList.prototype.resizeAll = function () {
	// resize all canvases to match window size
	for (var property in this.canvas) {
		if (this.canvas.hasOwnProperty(property)) {
			// if the screen is 4:3 or wider
			if (window.innerHeight / window.innerWidth <= this.app.config.window.height / this.app.config.window.width) {
				this.canvas[property].width = (this.app.config.window.height * window.innerWidth) / window.innerHeight;
				this.canvas[property].height = this.app.config.window.height;
			// if it's not (some squares or portrait resolutions...?)
			} else {
				this.canvas[property].width = this.app.config.window.width;
				this.canvas[property].height = (this.app.config.window.width * window.innerHeight) / window.innerWidth;
			}
		}
	}
};
