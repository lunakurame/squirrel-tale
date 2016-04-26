// prototype: Entity ///////////////////////////////////////////////////////////

var Entity = function (application, name, variant) {
	console.log('Entity instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Entity: constructor: application is required');

	this.app = application;
	this.name = name;
	this.variant = variant;
	this.fullName = name + (typeof variant === 'undefined' ? '' : '-' + variant);
	this.data;	// JSON resource
	this.image;	// Image resource
	this.canvas;
	this.context;
	this.canvas_under;
	this.context_under;

	this.posX = 0;
	this.posY = 0;
	this.posZ = 'under';
};

Entity.prototype.clear = function () {
	var context = this.isUnder() ? this.context_under : this.context;
	context.clearRect(
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		parseInt(this.posX + this.data.file.width),
		parseInt(this.posY + this.data.file.height)
	);
};

Entity.prototype.draw = function () {
	var context = this.isUnder() ? this.context_under : this.context;
	context.drawImage(
		this.image.file,
		// draw at position:
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		this.data.file.width,
		this.data.file.height
	);
};

Entity.prototype.isUnder = function () {
	return (
		this.posZ == 'under' ||
		this.context == this.context_under ||
		this.app.player.posY > this.posY + this.data.file.height - this.app.player.data.file.height
	);
};
