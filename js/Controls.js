// prototype: Controls /////////////////////////////////////////////////////////

var Controls = function (application) {
	console.log('Controls instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Controls: constructor: application is required');

	// technical
	this.app = application;

	// data
	this.keys = {
		/* template
		debug: {
			states: {
				192: false,
				223: false,
				...
			},
			queue: [
				{
					callback: <function>,
					state: true
				},
				...
			]
		} */
	};
};

Controls.prototype.load = function () {
	this.keys = {};
	for (let i in this.app.config.controls) {
		this.keys[i] = {};
		let key = this.keys[i];
		let keyConf = this.app.config.controls[i];

		key.states = {};
		keyConf.forEach(keyCode => key.states[keyCode] = false);
		key.queue = [];
	}
};

Controls.prototype.toggleKeyDown = function (e, state) {
	this.app.lastPressedKey = e.which;

	// set key state
	for (let i in this.keys) {
		let key = this.keys[i];
		if (typeof key.states[e.which] === 'undefined')
			continue;

		key.states[e.which] = state;
	}

	// exec key's queue
	for (let i in this.keys) {
		let key = this.keys[i];
		if (typeof key.states[e.which] === 'undefined')
			continue;

		key.queue.filter(item => item.state === state).forEach(item => item.callback());
	}
};

Controls.prototype.isKeyDown = function (keyName) {
	let keyStates = this.keys[keyName].states;
	let state = false;
	for (let i in keyStates)
		if (keyStates[i])
			state = true;

	return state;
};

Controls.prototype.addToQueue = function (callback, keyName, state = true) {
	this.keys[keyName].queue.push({
		callback: callback,
		state: state
	});
};
