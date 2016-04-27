// prototype: CanvasList ///////////////////////////////////////////////////////

var CanvasList = function (application) {
	console.log('CanvasList instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('CanvasList: constructor: application is required');

	// technical
	this.app = application;

	// data
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

CanvasList.prototype.resizeAll = function (ignoreHud) {
	// resize all canvases to match window size
	for (var property in this.canvas) {
		if (ignoreHud && property == 'hud')
			continue;

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

CanvasList.prototype.resizeAllWithoutFlicker = function (ignoreHud) {
	// temp canvas
	var tempCanvas = document.createElement('canvas');
	var tempContext = tempCanvas.getContext('2d');

	// resize all canvases to match window size
	for (var property in this.canvas) {
		if (ignoreHud && property == 'hud')
			continue;

		if (this.canvas.hasOwnProperty(property)) {
			// copy canvas' context
			tempCanvas.width = this.canvas[property].width;
			tempCanvas.height = this.canvas[property].height;
			tempContext.drawImage(this.canvas[property], 0, 0);

			// if the screen is 4:3 or wider
			if (window.innerHeight / window.innerWidth <= this.app.config.window.height / this.app.config.window.width) {
				this.canvas[property].width = (this.app.config.window.height * window.innerWidth) / window.innerHeight;
				this.canvas[property].height = this.app.config.window.height;
			// if it's not (some squares or portrait resolutions...?)
			} else {
				this.canvas[property].width = this.app.config.window.width;
				this.canvas[property].height = (this.app.config.window.width * window.innerHeight) / window.innerWidth;
			}

			// restore old context
			this.context[property].drawImage(tempCanvas, 0, 0);
		}
	}
};
