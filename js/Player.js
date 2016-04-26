// prototype: Player ///////////////////////////////////////////////////////////

var Player = function () {
	console.log('Player instance created');

	this.fileName;
	this.data; // loaded from JSON file
	this.speed; // loaded from JSON file (but can be modified)
	this.variant; // loaded from JSON file (but can be modified)
	this.moving = false;
	this.direction = 1; // 0 - up, 1 - down, 2 - right, 3 - left
	this.frame = 0;
	this.maxFrame;

	// TODO
	this.posHor = 80;
	this.posVer = 100;
};

Player.prototype.setMaxFrame = function (image) {
	this.maxFrame = image.width / this.data.width - 1;
};
