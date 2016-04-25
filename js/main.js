var Controls = function () {
	console.log('Controls instance created');

	this.keys = {
		up: 87,
		down: 83,
		right: 68,
		left: 65
	};

	this.keysDown = {
		up: false,
		down: false,
		right: false,
		left: false
	};
};

var Map = function (canvas_context) {
	console.log('Map instance created');

	this.ctx = canvas_context;

	this.image = new Image();
	this.image.src = 'map.png';
};

var Player = function (canvas_context) {
	console.log('Player instance created');

	this.ctx = canvas_context;
	this.image = new Image();
	this.image.src = 'player.png';
	this.width = 79;
	this.height = 75;
	this.posHor = 10;
	this.posVer = 10;
	this.speed = 600;
};

var Hud = function (canvas, canvas_context, fullscreen_canvas) {
	console.log('Hud instance created');

	this.canvas = canvas;
	this.canvasFullscreenEnabled = fullscreen_canvas;
	this.ctx = canvas_context;

	this.fpsCounter = new function () {
		this.startTime = 0;
		this.frameNumber = 0;

		this.getValue = function () {
			this.frameNumber++;
			var d = new Date().getTime(),
				currentTime = (d - this.startTime) / 1000,
				result = Math.floor((this.frameNumber / currentTime));

			if (currentTime > 1) {
				this.startTime = new Date().getTime();
				this.frameNumber = 0;
			}
			return result;
		}
	}

	hud_obj = this;
	this.canvasOnCreate();
	if (this.canvasFullscreenEnabled) {
		$(window).resize(function () {
			hud_obj.canvasOnCreate();
		});
	}
};

Hud.prototype.canvasOnCreate = function () {
	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	this.ctx.font = '40px monospace';
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = 'top';
	this.ctx.fillStyle = 'white';
	this.ctx.fillText('WASD to move', window.innerWidth / 2, 20);
};

Hud.prototype.resetTextStyle = function () {
	this.ctx.font = '20px monospace';
	this.ctx.textAlign = 'left';
	this.ctx.textBaseline = 'top';
	this.ctx.fillStyle = 'white';
};

/*
TODO
Loader for all images
      var imageObj = new Image();

      imageObj.onload = function() {
        context.drawImage(imageObj, 69, 50);
      };
      imageObj.src = '';
*/

$(document).ready(function () {

	var controls = new Controls();
	var hud = new Hud($('#hud')[0], $('#hud')[0].getContext('2d'), true);
	var map = new Map($('#map')[0].getContext('2d'));
	var player = new Player($('#player')[0].getContext('2d'));

	$('canvas').each(function () {
		$(this)[0].width = window.innerWidth;
		$(this)[0].height = window.innerHeight;
	});

	hud.canvasOnCreate();

	$(document).keydown(function (e) {
		switch(e.which) {
		case controls.keys.up:
			controls.keysDown.up = true;
			break;
		case controls.keys.down:
			controls.keysDown.down = true;
			break;
		case controls.keys.right:
			controls.keysDown.right = true;
			break;
		case controls.keys.left:
			controls.keysDown.left = true;
			break;
		}
	});

	$(document).keyup(function (e) {
		switch(e.which) {
		case controls.keys.up:
			controls.keysDown.up = false;
			break;
		case controls.keys.down:
			controls.keysDown.down = false;
			break;
		case controls.keys.right:
			controls.keysDown.right = false;
			break;
		case controls.keys.left:
			controls.keysDown.left = false;
			break;
		}
	});

//	ctx.fillStyle = '#000';

	map.image.onload = function () {	// TODO
		map.ctx.drawImage(map.image, 0, 0);
	};

	player.posHor = (window.innerWidth - player.width) / 2;
	player.posVer = (window.innerHeight - player.height) / 2;

	setInterval(function () {
		fps = hud.fpsCounter.getValue();
		speed = player.speed / fps;

		player.ctx.clearRect(player.posHor - 1, player.posVer - 1, player.posHor + player.width + 1, player.posVer + player.height + 1);

		if (controls.keysDown.up)
			player.posVer -= speed;
		if (controls.keysDown.down)
			player.posVer += speed;
		if (controls.keysDown.right)
			player.posHor += speed;
		if (controls.keysDown.left)
			player.posHor -= speed;

		if (player.posHor < 0)
			player.posHor = 0;
		else if (player.posHor > window.innerWidth - player.width)
			player.posHor = window.innerWidth - player.width;
		if (player.posVer < 0)
			player.posVer = 0;
		else if (player.posVer > window.innerHeight - player.height)
			player.posVer = window.innerHeight - player.height;

		player.ctx.drawImage(player.image, player.posHor, player.posVer, player.width, player.height);

		hud.resetTextStyle();
		hud.ctx.clearRect(0, 0, 200, 40);
		hud.ctx.fillText(fps + ' fps', 10, 10);
	}, 8);

});
