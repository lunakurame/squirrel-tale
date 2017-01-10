// prototype: Config ///////////////////////////////////////////////////////////

var Config = function (application) {
	console.log('Config instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Config: constructor: application is required');

	// technical
	this.app = application;

	//data
	this.debug = {
		enabled: false,
		collisions: {
			draw: true,
			color: 'rgba(208, 64, 218, 0.8)'
		},
		objects: {
			draw: true,
			color: 'rgba(26, 152, 152, 0.3)',
			ghostColor: 'rgba(26, 152, 152, 0.1)'
		},
		centers: {
			draw: true,
			color: 'rgba(255, 0, 0, 1)'
		}
	};
	this.fpsCap = 60;
	this.resourcePath = 'data';
	this.window = {
		// These numbers is the optimal (minimum) size.
		// If the proportions of the window are different,
		// the resolution will be higher (longer XOR taller).
		width: 320,
		height: 240
	};
	this.loaderStatus = {
		// 0 is reserved (I don't know for what, tho)
		loading: 1,
		completed: 2,
		error: 3
	};
	this.player = {
		name: 'shiro',
		variant: undefined,
		direction: {	// don't change those values
			up: 0,	// they are used in Player.prototype.draw
			down: 1,	// FIXME should it be fixed or not?
			right: 2,
			left: 3
		}
	};
	this.map = {
		name: 'grassland',
		variant: undefined
	};
};
