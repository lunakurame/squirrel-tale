// prototype: Hud //////////////////////////////////////////////////////////////

var Hud = function (application) {
	console.log('Hud instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Hud: constructor: application is required');

	// technical
	this.app = application;
	this.canvas;
	this.context;

	// fpsCounter
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

Hud.prototype.load = function () {
	// get canvas
	this.cavas = this.app.canvasList.canvas['hud'];
	this.context = this.app.canvasList.context['hud'];
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
