// prototype: Hud //////////////////////////////////////////////////////////////

var Hud = function (application) {
	console.log('Hud instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Hud: constructor: application is required');

	// technical
	this.app = application;
	this.canvas;
	this.context;
	this.jail        = {};
	this.jail.left   = 0;
	this.jail.top    = 0;
	this.jail.width  = 0;
	this.jail.height = 0;

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
	this.canvas = this.app.canvasList.canvas['hud'];
	this.context = this.app.canvasList.context['hud'];

	this.setJail();
};

Hud.prototype.resize = function () {
	this.clear();
	this.setJail();
	this.draw();
};

Hud.prototype.setJail = function () {
	this.jail.left   = (this.canvas.width - this.app.config.window.width) / 2;
	this.jail.top    = (this.canvas.height - this.app.config.window.height) / 2;
	this.jail.width  = this.app.config.window.width;
	this.jail.height = this.app.config.window.height;
};

Hud.prototype.clear = function () {
	this.context.clearRect(
		0,
		0,
		this.canvas.width,
		this.canvas.height
	);
};

Hud.prototype.draw = function () {
//	this.context.fillStyle = 'rgba(0, 0, 127, .5)';
//	this.context.fillRect(
//		this.jail.left,
//		this.jail.top,
//		this.jail.width,
//		this.jail.height
//	);

	if (this.app.mode == 'pause')
		this.drawPauseMenu();
};

Hud.prototype.drawDebugInfo = function (fps) {
	// draw debug HUD
	this.context.clearRect(0, 0, 108, 40);
	if (this.app.mode == 'pause')
		this.context.fillStyle = 'rgba(0, 0, 0, .8)';
	else
		this.context.fillStyle = 'rgba(0, 127, 127, .8)';
	this.context.fillRect(0, 0, 108, 40);

	this.app.fontList.draw(
		'FPS ' + fps.toFixed(2) +
		'\nRES ' + this.app.canvasList.canvas['player'].width + 'x' + this.app.canvasList.canvas['player'].height +
		'\nKEY ' + this.app.lastPressedKey,
		'basic', 6, 4
	);

//	app.fontList.draw(
//		'1234567890\nQWERTYUIOP\nASDFGHJKL\nZXCVBNM\nqwertyuiop\nasdfghjkl\nzxcvbnm\n `-=[]\\;\',./~!@\n#$%^&*()_+{}\n|:"<>?',
//		'basic', 50, 50
//	);
//	app.fontList.draw(
//		'0123456789\nABCDEFGHIJ\nKLMNOPQRS\nTUVWXYZ\nabcdefghij\nklmnopqrs\ntuvwxyz',
//		'basic', 150, 50
//	);
};

Hud.prototype.drawPauseMenu = function () {
	this.context.fillStyle = 'rgba(0, 0, 0, .8)';
	this.context.fillRect(
		0,
		0,
		this.canvas.width,
		this.canvas.height
	);

	this.app.fontList.draw(
		'> CONTINUE\n  OPTIONS\n  EXIT',
		'basic', 100, 150
	);
};
