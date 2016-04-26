// prototype: Hud //////////////////////////////////////////////////////////////

var Hud = function (application) {
	console.log('Hud instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Player: constructor: application is required');

	this.app = application;
	this.canvas;
	this.context;

	this.fpsCounter = {};
	this.fpsCounter.startTime = 0;
	this.fpsCounter.frameNumber = 0;
	this.fpsCounter.getValue = function () {
		this.frameNumber++;
		var d = new Date().getTime(),
			currentTime = (d - this.startTime) / 1000,
			//result = Math.floor(this.frameNumber / currentTime);
			result = this.frameNumber / currentTime;

		if (currentTime > 1) {
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}
		return result;
	};
};

Hud.prototype.resetTextStyle = function () {
	this.context.font = '14px monospace';
	this.context.textAlign = 'left';
	this.context.textBaseline = 'top';
	this.context.fillStyle = 'white';
};



//Hud.prototype.draw = function () {
////	this.context.font = '40px monospace';
////	this.context.textAlign = 'center';
////	this.context.textBaseline = 'top';
////	this.context.fillStyle = 'white';
////	this.context.fillText('WASD to move', window.innerWidth / 2, 20);
//};
