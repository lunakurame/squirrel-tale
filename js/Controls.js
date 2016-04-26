// prototype: Controls /////////////////////////////////////////////////////////

var Controls = function () {
	console.log('Controls instance created');

	this.keys = {
		// primary keys
		up: 87,
		down: 83,
		right: 68,
		left: 65,
		slow: 16,

		// secondary keys
		up_alt: 38,
		down_alt: 40,
		right_alt: 39,
		left_alt: 37,
		slow_alt: 16
	};

	this.keysDown = {
		// 'true' if primary OR secondary key is down
		up: false,
		down: false,
		right: false,
		left: false,
		slow: false
	};
};

Controls.prototype.toggleKeyDown = function (e, state) {
	switch(e.which) {
	case this.keys.up:
	case this.keys.up_alt:
		this.keysDown.up = state;
		break;
	case this.keys.down:
	case this.keys.down_alt:
		this.keysDown.down = state;
		break;
	case this.keys.right:
	case this.keys.right_alt:
		this.keysDown.right = state;
		break;
	case this.keys.left:
	case this.keys.left_alt:
		this.keysDown.left = state;
		break;
	case this.keys.slow:
	case this.keys.slow_alt:
		this.keysDown.slow = state;
		break;
	}
};
