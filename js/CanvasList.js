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

CanvasList.prototype.addCanvas = function (name, canvas) {
	console.log('CanvasList: adding canvas "' + name + '", object: "' + canvas + '"');

	// add canvas
	this.canvas[name] = canvas;
};

CanvasList.prototype.addContext = function (name, context) {
	console.log('CanvasList: adding context "' + name + '", object: "' + context + '"');

	// add context
	this.context[name] = context;
};

CanvasList.prototype.initContext = function (context) {
	// imageSmoothingEnabled
	if (typeof context.imageSmoothingEnabled !== 'undefined')
		context.imageSmoothingEnabled = false;
	if (typeof context.mozImageSmoothingEnabled !== 'undefined')
		context.mozImageSmoothingEnabled = false;
	if (typeof context.oImageSmoothingEnabled !== 'undefined')
		context.oImageSmoothingEnabled = false;
	if (typeof context.webkitImageSmoothingEnabled !== 'undefined')
		context.webkitImageSmoothingEnabled = false;
};

CanvasList.prototype.resizeAll = function (ignoreHud) {
	// resize all canvases to match window size
	for (var i in this.canvas) {
		if (ignoreHud && i == 'hud')
			continue;

		if (this.canvas.hasOwnProperty(i)) {
			// if the screen is 4:3 or wider
			if (window.innerHeight / window.innerWidth <= this.app.config.window.height / this.app.config.window.width) {
				this.canvas[i].width = (this.app.config.window.height * window.innerWidth) / window.innerHeight;
				this.canvas[i].height = this.app.config.window.height;
			// if it's not (some squares or portrait resolutions...?)
			} else {
				this.canvas[i].width = this.app.config.window.width;
				this.canvas[i].height = (this.app.config.window.width * window.innerHeight) / window.innerWidth;
			}
		}
	}

	for (var i in this.context) {
		this.initContext(this.context[i]);
	}
};

CanvasList.prototype.resizeAllWithoutFlicker = function (ignoreHud) {
	// temp canvas
	var tempCanvas = document.createElement('canvas');
	var tempContext = tempCanvas.getContext('2d');

	// resize all canvases to match window size
	for (var i in this.canvas) {
		if (ignoreHud && i == 'hud')
			continue;

		if (this.canvas.hasOwnProperty(i)) {
			// copy canvas' context
			tempCanvas.width = this.canvas[i].width;
			tempCanvas.height = this.canvas[i].height;
			tempContext.drawImage(this.canvas[i], 0, 0);

			// if the screen is 4:3 or wider
			if (window.innerHeight / window.innerWidth <= this.app.config.window.height / this.app.config.window.width) {
				this.canvas[i].width = (this.app.config.window.height * window.innerWidth) / window.innerHeight;
				this.canvas[i].height = this.app.config.window.height;
			// if it's not (some squares or portrait resolutions...?)
			} else {
				this.canvas[i].width = this.app.config.window.width;
				this.canvas[i].height = (this.app.config.window.width * window.innerHeight) / window.innerWidth;
			}

			// restore old context
			this.context[i].drawImage(tempCanvas, 0, 0);
		}
	}
};

CanvasList.prototype.render = function (context, data, centerX, centerY, posX, posY, width, height, flipX, flipY, rotate) {
	// check if translating, saving and restoring context is necessary
	if (flipX || flipY || rotate != 0) {
		// transform context
		context.save();
		context.translate(posX, posY);
		context.rotate(rotate * Math.PI);
		context.scale(
			flipX ? -1 : 1,
			flipY ? -1 : 1
		);
		// draw
		if (typeof data === 'object') {
			context.drawImage(
				data,
				-centerX,
				-centerY,
				width,
				height
			);
		} else if (data === 'fill') {
			context.fillRect(
				-centerX,
				-centerY,
				width,
				height
			);
		} else if (data === 'clear') {
			// if the sprite is rotated, add some extra pixels on
			// all sides, because browsers sometimes use
			// antialiasing when rotating, even if it's disabled,
			// so the result is shitty and may be slightly larger
			if (rotate != 0) {
				context.clearRect(
					-centerX - 1,
					-centerY - 1,
					width + 2,
					height + 2
				);
			} else {
				context.clearRect(
					-centerX,
					-centerY,
					width,
					height
				);
			}
		} else {
			console.log('Error: Can\'t draw object, unrecognized type: ', data);
		}
		context.restore();
	} else {
		// no transformations, just draw
		if (typeof data === 'object') {
			context.drawImage(
				data,
				posX - centerX,
				posY - centerY,
				width,
				height
			);
		} else if (data === 'fill') {
			context.fillRect(
				posX - centerX,
				posY - centerY,
				width,
				height
			);
		} else if (data === 'clear') {
			context.clearRect(
				posX - centerX,
				posY - centerY,
				width,
				height
			);
		} else {
			console.log('Error: Can\'t draw object, unrecognized type: ', data);
		}
	}
}
