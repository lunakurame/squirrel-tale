// prototype: Hud //////////////////////////////////////////////////////////////

var Hud = function (canvas_context) {
	console.log('Hud instance created');

	this.context = canvas_context;

	this.fpsCounter = new function () {
		this.startTime = 0;
		this.frameNumber = 0;

		this.getValue = function () {
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
		}
	}
};

Hud.prototype.draw = function () {
//	this.context.font = '40px monospace';
//	this.context.textAlign = 'center';
//	this.context.textBaseline = 'top';
//	this.context.fillStyle = 'white';
//	this.context.fillText('WASD to move', window.innerWidth / 2, 20);
};

Hud.prototype.resetTextStyle = function () {
	this.context.font = '14px monospace';
	this.context.textAlign = 'left';
	this.context.textBaseline = 'top';
	this.context.fillStyle = 'white';
};
