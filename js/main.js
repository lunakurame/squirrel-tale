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

var Map = function () {
	console.log('Map instance created');
};

var Player = function () {
	console.log('Player instance created');

	this.speed = 2;
};

var fps = {
	startTime: 0,
	frameNumber: 0,
	getFps: function () {
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
};

$(document).ready(function() {

	var controls = new Controls();
	var map = new Map();
	var player = new Player();

	$(document).keydown(function(e) {
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

	$(document).keyup(function(e) {
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

	setInterval(function() {
		if (controls.keysDown.up)
			$('#player').css('margin-top', (parseInt($('#player').css('margin-top')) - player.speed) + 'px');
		if (controls.keysDown.down)
			$('#player').css('margin-top', (parseInt($('#player').css('margin-top')) + player.speed) + 'px');
		if (controls.keysDown.right)
			$('#player').css('margin-left', (parseInt($('#player').css('margin-left')) + player.speed) + 'px');
		if (controls.keysDown.left)
			$('#player').css('margin-left', (parseInt($('#player').css('margin-left')) - player.speed) + 'px');

		document.title = fps.getFps() + ' fps';
	}, 1);

});
