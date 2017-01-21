// prototype: AnimationList ////////////////////////////////////////////////////

var AnimationList = function (application) {
	console.log('AnimationList instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('AnimationList: constructor: application is required');

	// technical
	this.app = application;

	// data
	this.animations = [
		/* array of {
		 * 	owner: object
		 * 	parent: object
		 * 	animation: pointer to Entity's animation object
		 * 	timer: animation timer, which can be paused and resumed
		 * }
		 */
	];
};

AnimationList.prototype.load = function () {
	// get all animations of all entities
	this.app.map.entities.forEach(entity => {
		entity.animations.forEach(animation => {
			this.animations.push({
				owner: entity,
				parent: this,
				animation: animation
			});
		});
	});

	// exec all auto animations
	this.animations.forEach(animation => {
		if (animation.animation.type === 'auto')
			this.execAnimationScript(animation);
	});
};

AnimationList.prototype.pauseAll = function () {
	this.animations.forEach(animation => {
		if (typeof animation.timer !== 'undefined')
			animation.timer.pause();
	});
};

AnimationList.prototype.resumeAll = function () {
	this.animations.forEach(animation => {
		if (typeof animation.timer !== 'undefined')
			animation.timer.resume();
	});
};

AnimationList.prototype.execAnimationScript = function (animation, lineNum = 0) {
	// check if EOF
	if (typeof animation.animation.script[lineNum] === 'undefined')
		return;

	let line = animation.animation.script[lineNum];
	let args = line.split(' ');
	let jump = lineNum => this.execAnimationScript(animation, lineNum);
	let jumpNext = () => jump(lineNum + 1);
	let addToQueue = func => animation.owner.queue.push(func);
	let warn = text => console.warn('Nuthead: ' + text + ', ' +
		'owner "' + animation.owner.data.id + '", ' +
		'script "' + animation.animation.name + '", ' +
		'line ' + lineNum);

	// skip empty lines and comments
	if (line.trim() === '' || line.trim().startsWith('#')) {
		jumpNext();
		return;
	}

	// instructions
	switch (args[0]) {
	case 'lbl':
		jumpNext();
		break;
	case 'log':
		console.log(line.slice(4));
		jumpNext();
		break;
	case 'jmp':
		if (typeof args[1] === 'undefined') {
			warn('Cannot jump to nowhere, missing destination parameter');
			jumpNext();
		} else if (tools.isNumeric(args[1])) {
			jump(parseInt(args[1]));
		} else {
			let labelPos = animation.animation.script.indexOf('lbl ' + args[1]);
			if (labelPos === -1) {
				warn('Cannot jump to a nonexistent label "' + args[1] + '"');
				jumpNext();
			} else {
				jump(labelPos);
			}
		}
		break;
	case 'nop':
		if (typeof args[1] !== 'undefined' && tools.isNumeric(args[1]))
			animation.timer = new tools.Timer(jumpNext, parseInt(args[1]));
		else
			jumpNext();
		break;
	case 'set':
		switch (args[1]) {
		case undefined:
		case '':
			warn('Cannot set nothing, missing required parameter');
			break;
		case 'view':
			addToQueue(() => animation.owner.setView(
				args[2],
				typeof args[3] === 'undefined' ? undefined : parseInt(args[3])
			));
			break;
		case 'frame':
			addToQueue(() => animation.owner.setFrame(
				typeof args[2] === 'undefined' ? undefined : parseInt(args[2])
			));
			break;
		}
		jumpNext();
		break;
	default:
		warn('Invalid instruction "' + args[0] + '"');
		jumpNext();
	}
};
