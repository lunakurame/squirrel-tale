// prototype: Controls /////////////////////////////////////////////////////////

var Controls = function (application) {
	console.log('Controls instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Controls: constructor: application is required');

	// technical
	this.app = application;

	// config	TODO move to Config?
	this.keys = {
		// primary keys
		debug: 192,
		up   : 87,
		down : 83,
		right: 68,
		left : 65,
		slow : 16,
		pause: 27,

		// secondary keys
		debug_alt: 192,
		up_alt   : 38,
		down_alt : 40,
		right_alt: 39,
		left_alt : 37,
		slow_alt : 16,
		pause_alt: 27
	};

	// states
	this.keysDown = {
		// primary keys
		debug: false,
		up   : false,
		down : false,
		right: false,
		left : false,
		slow : false,
		pause: false,

		// secondary keys
		debug_alt: false,
		up_alt   : false,
		down_alt : false,
		right_alt: false,
		left_alt : false,
		slow_alt : false,
		pause_alt: false
	};
};

Controls.prototype.toggleKeyDown = function (e, state) {
	this.app.lastPressedKey = e.which;
	// set key state
	switch(e.which) {
	case this.keys.debug:
		this.keysDown.debug = state;
		break;
	case this.keys.debug_alt:
		this.keysDown.debug_alt = state;
		break;
	case this.keys.up:
		this.keysDown.up = state;
		break;
	case this.keys.up_alt:
		this.keysDown.up_alt = state;
		break;
	case this.keys.down:
		this.keysDown.down = state;
		break;
	case this.keys.down_alt:
		this.keysDown.down_alt = state;
		break;
	case this.keys.right:
		this.keysDown.right = state;
		break;
	case this.keys.right_alt:
		this.keysDown.right_alt = state;
		break;
	case this.keys.left:
		this.keysDown.left = state;
		break;
	case this.keys.left_alt:
		this.keysDown.left_alt = state;
		break;
	case this.keys.slow:
		this.keysDown.slow = state;
		break;
	case this.keys.slow_alt:
		this.keysDown.slow_alt = state;
		break;
	case this.keys.pause:
		this.keysDown.pause = state;
		break;
	case this.keys.pause_alt:
		this.keysDown.pause_alt = state;
		break;
	}
};
