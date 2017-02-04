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
		 * 	timer: nut timer, which can be paused and resumed
		 * 	variables: {}, vars used in the script
		 * 	nut: pointer to Entity's nut object
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
				timer: undefined,
				variables: {},
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

Nuthead.prototype.execAll = function (entity, options) {
	this.nutshells.forEach(nutshell => {
		if ((typeof entity === 'undefined' || nutshell.owner === entity)) {
			for (let i in options)
				if (options[i] !== nutshell.nut[i])
					return;

			if (typeof nutshell.timer !== 'undefined') {
				nutshell.timer.pause();
				nutshell.timer = undefined;
			}
			this.execNutshell(nutshell);
		}
	});
};

Nuthead.prototype.pauseAll = function (entity) {
	this.nutshells.forEach(nutshell => {
		if ((typeof entity === 'undefined' || nutshell.owner === entity) &&
		    typeof nutshell.timer !== 'undefined')
			nutshell.timer.pause();
	});
};

Nuthead.prototype.resumeAll = function (entity) {
	this.nutshells.forEach(nutshell => {
		if ((typeof entity === 'undefined' || nutshell.owner === entity) &&
		    typeof nutshell.timer !== 'undefined')
			nutshell.timer.resume();
	});
};

Nuthead.prototype.isNutshellVariable = function (nutshell, variable) {
	return typeof variable !== 'undefined' &&
	       variable.startsWith('$') &&
	       typeof this.getNutshellVariable(nutshell, variable) !== 'undefined';
};

Nuthead.prototype.getNutshellVariable = function (nutshell, variable) {
	return nutshell.variables[variable.substr(1)];
};

Nuthead.prototype.execNutshell = function (nutshell, lineNum = 0) {
	// check if EOF
	if (typeof nutshell.nut.script[lineNum] === 'undefined')
		return;

	let line = nutshell.nut.script[lineNum];
	let args = line.split(' ').filter(item => item !== '');
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
	let arg1, arg2, arg3;
	switch (args[0]) {
	case 'lbl':
		jumpNext();
		break;
	case 'let':
		if (typeof args[1] === 'undefined')
			warn('Cannot set a variable without a name');
		else if (typeof args[2] === 'undefined')
			nutshell.variables[args[1]] = null;
		else if (tools.isNumeric(args[2]))
			nutshell.variables[args[1]] = +args[2];
		else
			nutshell.variables[args[1]] = args[2];
		jumpNext();
		break;
	case 'log':
		arg1 = args[1];
		if (this.isNutshellVariable(nutshell, arg1))
			arg1 = this.getNutshellVariable(nutshell, arg1);
		else
			arg1 = line.slice(4);

		console.log(arg1);
		jumpNext();
		break;
	case 'jmp':
		if (typeof args[1] === 'undefined') {
			warn('Cannot jump to nowhere, missing destination parameter');
			jumpNext();
			break;
		}

		arg1 = args[1];
		if (this.isNutshellVariable(nutshell, arg1))
			arg1 = this.getNutshellVariable(nutshell, arg1);

		if (tools.isNumeric(arg1)) {
			jump(parseInt(arg1));
		} else {
			let labelPos = nutshell.nut.script.indexOf('lbl ' + arg1);
			if (labelPos === -1) {
				warn('Cannot jump to a nonexistent label "' + arg1 + '"');
				jumpNext();
			} else {
				jump(labelPos);
			}
		}
		break;
	case 'nop':
		arg1 = args[1];
		if (this.isNutshellVariable(nutshell, arg1))
			arg1 = this.getNutshellVariable(nutshell, arg1);

		if (typeof arg1 !== 'undefined' && tools.isNumeric(arg1))
			nutshell.timer = new tools.Timer(jumpNext, parseInt(arg1));
		else
			jumpNext();
		break;
	case 'nut':
		arg1 = args[1];
		if (this.isNutshellVariable(nutshell, arg1))
			arg1 = this.getNutshellVariable(nutshell, arg1);

		let dest = this.nutshells.find(ns => ns.owner === nutshell.owner && ns.nut.name === arg1);
		if (typeof dest === 'undefined')
			warn('Cannot find nut "' + arg1 + '"');
		else
			this.execNutshell(dest);
		break;
	case 'ret':
		break;
	case 'set':
		arg1 = args[1];
		if (this.isNutshellVariable(nutshell, arg1))
			arg1 = this.getNutshellVariable(nutshell, arg1);
		arg2 = args[2];
		if (this.isNutshellVariable(nutshell, arg2))
			arg2 = this.getNutshellVariable(nutshell, arg2);
		arg3 = args[3];
		if (this.isNutshellVariable(nutshell, arg3))
			arg3 = this.getNutshellVariable(nutshell, arg3);


		switch (arg1) {
		case undefined:
		case '':
			warn('Cannot set nothing, missing required parameter');
			break;
		case 'view':
			addToQueue(() => nutshell.owner.setView(
				arg2,
				typeof arg3 === 'undefined' ? undefined : parseInt(arg3)
			));
			break;
		case 'frame':
			addToQueue(() => nutshell.owner.setFrame(
				typeof arg2 === 'undefined' ? undefined : parseInt(arg2)
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
