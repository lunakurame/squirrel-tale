// prototype: Map //////////////////////////////////////////////////////////////

var Map = function (canvas, canvas_context) {
	console.log('Map instance created');

	this.canvas = canvas;
	this.context = canvas_context;
	this.data; // loaded from JSON file
	this.image;
	this.left = 0;
	this.top = 0;
};

Map.prototype.draw = function () {
	// draw map TODO
	this.context.drawImage(
		this.image,
		this.left, this.top, this.canvas.width, this.canvas.height,
		0, 0, this.canvas.width, this.canvas.height
	);
};
