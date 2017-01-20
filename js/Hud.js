// prototype: Hud //////////////////////////////////////////////////////////////

var Hud = function (application) {
	console.log('Hud instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Hud: constructor: application is required');

	// technical
	this.app = application;
	this.canvas;
	this.context;

	// jail
	this.jail = {
		left  : 0,
		top   : 0,
		width : 0,
		height: 0
	};

	// pause menu
	this.pauseMenu = {
		selected: 0,
		items: [
			{
				'label': 'CONTINUE',
				'action': undefined
			},
			{
				'label': 'OPTIONS',
				'action': undefined
			}
		]
	};

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
	this.canvas  = this.app.canvasList.canvases['hud'];
	this.context = this.app.canvasList.contexts['hud'];

	// set up pause menu actions
	this.pauseMenu.items[0].action = function () {
		this.app.mode = this.app.modePrev;
		this.app.hud.clear();
		this.app.hud.draw();
	}.bind(this);
	this.pauseMenu.items[1].action = function () {
		// TODO
	}.bind(this);

	this.setJail();
};

Hud.prototype.resize = function () {
	this.clear();
	this.setJail();
	this.draw();
};

Hud.prototype.setJail = function () {
	this.jail.left   = parseInt((this.canvas.width - this.app.config.window.width) / 2);
	this.jail.top    = parseInt((this.canvas.height - this.app.config.window.height) / 2);
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
	this.context.clearRect(0, 0, 282, 40);
	if (this.app.mode == 'pause')
		this.context.fillStyle = 'rgba(0, 0, 0, .9)';
	else
		this.context.fillStyle = 'rgba(0, 127, 127, .8)';
	this.context.fillRect(0, 0, 282, 40);

	this.app.fontList.draw(
		'FPS ' + fps.toFixed(2) +
		'\nRES ' + this.app.canvasList.canvases['player'].width + 'x' + this.app.canvasList.canvases['player'].height +
		'\nKEY ' + this.app.lastPressedKey,
		'basic', 'white', 6, 4
	);

	this.app.fontList.draw(
		'MAP NAME   ' +
		'\nMAP SIZE   ' +
		'\nMAP OFFSET ',
		'basic', 'white', 115, 4
	);

	this.app.fontList.draw(
		this.app.map.name +
		'\n' + this.app.map.width + 'x' + this.app.map.height +
		'\n' + parseInt(this.app.map.left) + 'x' + parseInt(this.app.map.top),
		'basic', 'white', 210, 4
	);

//	app.fontList.draw(
//		'1234567890\nQWERTYUIOP\nASDFGHJKL\nZXCVBNM\nqwertyuiop\nasdfghjkl\nzxcvbnm\n `-=[]\\;\',./~!@\n#$%^&*()_+{}\n|:"<>?⯈ ',
//		'basic', 'white', 50, 50
//	);
//	app.fontList.draw(
//		'0123456789\nABCDEFGHIJ\nKLMNOPQRS\nTUVWXYZ\nabcdefghij\nklmnopqrs\ntuvwxyz',
//		'basic', 'white', 150, 50
//	);
};

Hud.prototype.drawPauseMenu = function () {
	// background
	this.context.fillStyle = 'rgba(0, 0, 0, .9)';
	this.context.fillRect(
		0,
		0,
		this.canvas.width,
		this.canvas.height
	);

	// calc text size
	var menuText = '';
	for (var i in this.pauseMenu.items) {
		if (i > 0)
			menuText += '\n';
		menuText += (this.pauseMenu.selected == i ? '⯈' : ' ') + this.pauseMenu.items[i].label;
	}
	var menuTextSize = this.app.fontList.getTextSize(menuText, 'basic');

	// draw text
	var topMargin = '';
	for (var i in this.pauseMenu.items) {
		this.app.fontList.draw(
			topMargin + (this.pauseMenu.selected == i ? '⯈' : ' ') + this.pauseMenu.items[i].label,
			'basic', (this.pauseMenu.selected == i ? 'teal' : 'white'),
			(this.jail.width - menuTextSize.width) / 2 + this.jail.left,
			(this.jail.height - menuTextSize.height) / 2 + this.jail.top
		);
		topMargin += '\n';
	}
};
