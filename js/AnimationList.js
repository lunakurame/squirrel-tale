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

	// check if EOF
	if (typeof animation.animation.script[lineNum] !== 'undefined') {
		var line = animation.animation.script[lineNum];
		var args = line.split(' ');

		// do things
		switch (args[0]) {
		case 'echo':
			console.log(line.slice(5));
			this.execAnimationScript(animation, lineNum + 1);
			break;
		case 'frame':
			animation.owner.queue.push(function () {
				animation.owner.setFrame(args[1], parseInt(args[2]));
			});
			this.execAnimationScript(animation, lineNum + 1);
			break;
		case 'goto':
			this.execAnimationScript(animation, parseInt(args[1]));
			break;
		case 'sleep':
			setTimeout(function () {
				this.execAnimationScript(animation, lineNum + 1);
			}.bind(this), args[1]);
			break;
		default:
			console.warn('Unrecognized command "' + args[0] + '"');
			this.execAnimationScript(animation, lineNum + 1);
		}
	}
};
