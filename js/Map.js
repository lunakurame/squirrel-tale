// prototype: Map //////////////////////////////////////////////////////////////

var Map = function (application, name, variant) {
	console.log('Map instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Player: constructor: application is required');

	this.app = application;
	this.name = name;
	this.variant = variant;
	this.fullName = name + (typeof variant === 'undefined' ? '' : '-' + variant);
	this.data;	// JSON resource
	this.image;	// Image resource
	this.canvas;
	this.context;

	this.left = 0;
	this.top = 0;
	this.marginLeft = 0;
	this.marginTop = 0;
	this.entities = [];
};

Map.prototype.draw = function () {
	if (this.canvas.width > this.image.file.width) {
		var width = this.image.file.width;
		this.marginLeft = (this.canvas.width - width) / 2;
	} else {
		var width = this.canvas.width;
		this.marginLeft = 0;
	}
	
	if (this.canvas.height > this.image.file.height) {
		var height = this.image.file.height;
		this.marginTop = (this.canvas.height - height) / 2;
	} else {
		var height = this.canvas.height;
		this.marginTop = 0;
	}

	this.context.drawImage(
		this.image.file,
		parseInt(this.left), parseInt(this.top), width, height,
		parseInt(this.marginLeft), parseInt(this.marginTop), width, height
	);
};
