// prototype: Nuthead //////////////////////////////////////////////////////////

var Nuthead = function (application) {
	console.log('Nuthead instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Nuthead: constructor: application is required');

	// technical
	this.app = application;

	// data
	this.nutshells = [
		/* array of nutshells {
		 * 	owner: object
		 * 	parent: object
		 * 	nut: pointer to Entity's nut object
		 * 	timer: nut timer, which can be paused and resumed
		 * }
		 */
	];
};

Nuthead.prototype.load = function () {
	// get all nuts of all entities
	this.app.map.entities.forEach(entity => {
		entity.nuts.forEach(nut => {
			this.nutshells.push({
				owner: entity,
				parent: this,
				nut: nut
			});
		});
	});

	// exec all auto nuts
	this.nutshells.forEach(nutshell => {
		if (nutshell.nut.type === 'auto')
			this.execNutshell(nutshell);
	});
};

Nuthead.prototype.pauseAll = function () {
	this.nutshells.forEach(nutshell => {
		if (typeof nutshell.timer !== 'undefined')
			nutshell.timer.pause();
	});
};

Nuthead.prototype.resumeAll = function () {
	this.nutshells.forEach(nutshell => {
		if (typeof nutshell.timer !== 'undefined')
			nutshell.timer.resume();
	});
};

Nuthead.prototype.execNutshell = function (nutshell, lineNum = 0) {
	// check if EOF
	if (typeof nutshell.nut.script[lineNum] === 'undefined')
		return;

	let line = nutshell.nut.script[lineNum];
	let args = line.split(' ');
	let jump = lineNum => this.execNutshell(nutshell, lineNum);
	let jumpNext = () => jump(lineNum + 1);
	let addToQueue = func => nutshell.owner.queue.push(func);
	let warn = text => console.warn('Nuthead: ' + text + ', ' +
		'owner "' + nutshell.owner.data.id + '", ' +
		'script "' + nutshell.nut.name + '", ' +
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
			let labelPos = nutshell.nut.script.indexOf('lbl ' + args[1]);
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
			nutshell.timer = new tools.Timer(jumpNext, parseInt(args[1]));
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
			addToQueue(() => nutshell.owner.setView(
				args[2],
				typeof args[3] === 'undefined' ? undefined : parseInt(args[3])
			));
			break;
		case 'frame':
			addToQueue(() => nutshell.owner.setFrame(
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
