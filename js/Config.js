// prototype: Config ///////////////////////////////////////////////////////////

var Config = function (application) {
	console.log('Config instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Config: constructor: application is required');

	this.app = application;

	this.debug = {
		collisions: {
			draw: false,
			color: 'rgba(208, 64, 218, 0.8)'
		}
	};

	this.resourcePath = 'data';

	this.window = {
		// These numbers is the optimal (minimum) size.
		// If the proportions of the window are different,
		// the resolution will be higher (longer XOR taller).
		width: 320,
		height: 240
	};

	this.loaderStatus = {
		loading: 1,
		completed: 2,
		error: 3
	};

	this.player = {
		name: 'shiro',
		variant: undefined,
		direction: {
			up: 0,
			down: 1,
			right: 2,
			left: 3
		}
	};

	this.map = {
		name: 'test',
		variant: undefined
	};
};
