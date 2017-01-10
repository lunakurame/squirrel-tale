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
		 * }
		 */
	];
};

AnimationList.prototype.load = function () {
	// for all entities
	for (var i in this.app.map.entities) {
		var entity = this.app.map.entities[i];
		// for all animations of that entity
		for (var j in entity.animations) {
			// add new animation
			this.animations.push({});
			var animation = this.animations[this.animations.length - 1];

			// set data
			animation.owner     = entity;
			animation.parent    = this;
			animation.animation = entity.animations[j];
		}
	}

	// exec all auto animations
	for (var i in this.animations)
		if (this.animations[i].animation.type == 'auto')
			this.execAnimationScript(this.animations[i]);
};

AnimationList.prototype.execAnimationScript = function (animation, lineNum) {
	// default to lineNum = 0
	if (typeof lineNum === 'undefined')
		lineNum = 0;

	if (this.app.mode == 'pause') {
		setTimeout(function () {
			this.execAnimationScript(animation, lineNum);
		}.bind(this), 100);
		return;
	}

	// check if EOF
	if (typeof animation.animation.script[lineNum] === 'undefined')
		return;

	var line = animation.animation.script[lineNum];

	// skip empty lines and comments
	if (line.trim() == '' || line.trim().startsWith('#'))
		return;

	var args = line.split(' ');
	var jumpNext = () => this.execAnimationScript(animation, lineNum + 1);
	var jump = n => this.execAnimationScript(animation, n);
	var addToQueue = f => animation.owner.queue.push(f);
	var warn = s => console.warn('Nuthead: ' + s + ', ' +
		'owner "' + animation.owner.data.id + '", ' +
		'script "' + animation.animation.name + '", ' +
		'line ' + lineNum);

	// do things
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
		} else if (window.tools.isNumeric(args[1])) {
			jump(parseInt(args[1]));
		} else {
			var labelPos = animation.animation.script.indexOf('lbl ' + args[1]);
			if (labelPos === -1) {
				warn('Cannot jump to a nonexistent label "' + args[1] + '"');
				jumpNext();
			} else {
				jump(labelPos);
			}
		}
		break;
	case 'nop':
		if (typeof args[1] !== 'undefined' && window.tools.isNumeric(args[1]))
			setTimeout(jumpNext, parseInt(args[1]));
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
