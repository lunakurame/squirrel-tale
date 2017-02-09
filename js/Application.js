// prototype: Application //////////////////////////////////////////////////////

var Application = function () {
	console.log('%c////////////////////////////////////////////////////////////////////////////////', 'background: #3465a4;');
	console.log('Application instance created');

	// data
	this.lastPressedKey = 0;
	this.mode = 'game';
	this.modePrev = 'game';
	this.maps = [];

	// modules
	this.config = new Config(this);
	this.loadingScreen = new LoadingScreen(this);
	this.resourceLoader = new ResourceLoader(this);
	this.canvasList = new CanvasList(this);
	this.nuthead = new Nuthead(this);
	this.fontList = new FontList(this);
	this.controls = new Controls(this);
	this.maps.push(new Map(this, this.config.map.name, this.config.map.variant));
	this.map = this.maps[0];
	this.player = new Player(this, this.config.player.name, this.config.player.variant);
	this.hud = new Hud(this);
};

Application.prototype.loadMap = function (name, variant, arg, callback) {
	let map;
	// find the map in this.maps
	for (let i in this.maps)
		if (this.maps[i].name === name && this.maps[i].variant === variant) {
			map = this.maps[i];
			break;
		}

	switch (arg) {
	case undefined:
	case null:
		if (typeof map === 'undefined') {
			map = new Map(this, name, variant);
			this.maps.push(map);
		}
		this.resourceLoader.loadOnce('json', 'map', map.name);
		this.resourceLoader.loadOnce('image', 'map', map.fullName);
		this.loadingScreen.fadeIn(() =>
			this.resourceLoader.waitForAllFiles(
				() => this.loadMap(name, variant, 'resources-loaded', callback),
				() => this.loadingScreen.showError()
			)
		);
		break;
	case 'resources-loaded':
		console.log('Application: setting up the map');
		map.load(
			this.resourceLoader.resources['json/map/' + map.name],
			this.resourceLoader.resources['image/map/' + map.fullName]
		);
		map.loadEntities(() => this.loadMap(name, variant, 'setup-entities', callback));
		break;
	case 'setup-entities':
		this.map = map;
		this.map.setupEntities();
		this.nuthead.load();
		this.canvasList.resizeAll();
		this.map.draw();
		this.hud.draw();
		this.player.loadEntrances(
			this.resourceLoader.resources['json/map/' + this.map.name].file.entrances
		);
		this.player.react(0, true);
		this.loadingScreen.fadeOut();

		if (typeof callback === 'function')
			callback();

		break;
	}
};

Application.prototype.init = function (arg) {
	// alias for nested functions
	var app = this;

	switch (arg) {
	case 'start':
	case 'init':
	case 'load-resources':
		// load resources
		this.loadingScreen.rotateIcon();
		this.resourceLoader.load('image', 'image', 'loading', 'failed');
		this.resourceLoader.load('json', 'player', this.player.name);
		this.resourceLoader.load('json', 'font', 'basic');
		this.resourceLoader.load('image', 'player', this.player.fullName);
		this.resourceLoader.load('image', 'font', 'basic', 'white');
		this.resourceLoader.load('image', 'font', 'basic', 'black');
		this.resourceLoader.load('image', 'font', 'basic', 'teal');
		//this.resourceLoader.load('debug', 'debug', 'debug');
		this.resourceLoader.waitForAllFiles(
			() => this.init('setup-environment'),
			() => this.loadingScreen.showError()
		);
		break;

	case 'setup-environment':
		// canvas
		console.log('Application: setting up the canvasList');
		this.canvasList.addCanvas('map', $('#map')[0]);
		this.canvasList.addContext('map', $('#map')[0].getContext('2d'));
		this.canvasList.addCanvas('entity_under', $('#entity_under')[0]);
		this.canvasList.addContext('entity_under', $('#entity_under')[0].getContext('2d'));
		this.canvasList.addCanvas('player', $('#player')[0]);
		this.canvasList.addContext('player', $('#player')[0].getContext('2d'));
		this.canvasList.addCanvas('entity_over', $('#entity_over')[0]);
		this.canvasList.addContext('entity_over', $('#entity_over')[0].getContext('2d'));
		this.canvasList.addCanvas('hud', $('#hud')[0]);
		this.canvasList.addContext('hud', $('#hud')[0].getContext('2d'));
		this.canvasList.resizeAll();

		// player
		console.log('Application: setting up the player');
		this.player.load(
			this.resourceLoader.resources['json/player/' + this.player.name],
			this.resourceLoader.resources['image/player/' + this.player.fullName]
		);

		// hud
		console.log('Application: setting up the hud');
		this.hud.load();
		this.fontList.load();

		// map
		this.loadMap(this.config.map.name, this.config.map.variant, undefined, () => this.init('setup-window'));
		break;

	case 'setup-window':
		//controls
		document.onmousemove = function (e) {
			document.body.style.cursor = 'inherit';
		};

		document.onkeydown = function (e) {
			document.body.style.cursor = 'none';
			app.controls.toggleKeyDown(e, true);
		};

		document.onkeyup = function (e) {
			app.controls.toggleKeyDown(e, false);
		};
		
		window.onresize = function () {
			app.canvasList.resizeAll();
			app.map.draw();
			app.player.react(0, true);
			app.hud.resize();
		};

		// load controls config
		// TODO move it higher?
		// TODO new config
		this.controls.load();

		// debug
		this.controls.addToQueue(() => {
			this.config.debug.enabled = !this.config.debug.enabled;

			// clear all and redraw
			for (let i in this.canvasList.contexts)
				this.canvasList.contexts[i].clearRect(
					0,
					0,
					this.canvasList.canvases[i].width,
					this.canvasList.canvases[i].height
				);
			this.map.draw();
			this.hud.draw();
			this.player.draw();
			this.map.entities.forEach(entity => entity.draw());
		}, 'debug', true);

		// pause
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				this.hud.pauseMenu.category = 'main';
				this.hud.pauseMenu.selected = 0;
				this.hud.pauseMenu.stack = [];

				this.mode = this.modePrev;
				this.nuthead.resumeAll();
				break;
			default:
				this.modePrev = this.mode;
				this.mode = 'pause';
				this.nuthead.pauseAll();
			}

			this.hud.redraw();
		}, 'pause', true);

		// primary
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				let itemCount = 0;
				for (let i in this.hud.pauseMenu.items) {
					let item = this.hud.pauseMenu.items[i];
					if (this.hud.pauseMenu.category !== item.category)
						continue;
					if (itemCount === this.hud.pauseMenu.selected) {
						item.action();
						break;
					}
					++itemCount;
				}
				this.hud.redraw();
				break;
			case 'game':
				let closestEntity = null;
				let minDistance = Infinity;

				this.map.getVisibleEntities().forEach(entity => {
					let distance = entity.getDistanceFrom(this.player.posX, this.player.posY);

					let rightDirection = false;
					switch (this.player.direction) {
					case this.config.player.direction.up:
						rightDirection = entity.posY < this.player.posY;
						break;
					case this.config.player.direction.down:
						rightDirection = entity.posY > this.player.posY;
						break;
					case this.config.player.direction.left:
						rightDirection = entity.posX < this.player.posX;
						break;
					case this.config.player.direction.right:
						rightDirection = entity.posX > this.player.posX;
						break;
					}

					if (rightDirection && distance < minDistance) {
						closestEntity = entity;
						minDistance = distance;
					}
				});

				if (minDistance < 20) {
					this.nuthead.pauseAll(closestEntity);
					this.nuthead.execAll(closestEntity, {type: 'interaction'});
					this.hud.redraw();
				}
				break;
			case 'game-ui':
				if (this.hud.dialogue.items.length < 1)
					break;

				let dialogueItem = this.hud.dialogue.items[this.hud.dialogue.currentIndex];
				if (typeof dialogueItem.choices !== 'undefined' && dialogueItem.choices.length > 0) {
					let action = dialogueItem.choices[this.hud.dialogue.selectedChoice].action;
					this.hud.resetDialogue();
					action();
					this.hud.redraw();
				} else {
					++this.hud.dialogue.currentIndex;
					if (this.hud.dialogue.currentIndex >= this.hud.dialogue.items.length)
						this.hud.resetDialogue();
						this.hud.redraw();
				}
				break;
			}
		}, 'primary', true);

		// secondary
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'game':
				this.hud.toggleUserMenu();
				this.hud.redraw();
				this.modePrev = this.mode;
				this.mode = 'game-ui';
				break;
			case 'game-ui':
				if (this.hud.dialogue.items.length > 0)
					break;
				if (this.hud.state.userMenu)
					this.hud.toggleUserMenu();
				this.hud.redraw();
				this.modePrev = this.mode;
				this.mode = 'game';
				break;
			}
		}, 'secondary', true);

		// up
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				if (this.hud.pauseMenu.selected > 0)
					--this.hud.pauseMenu.selected;

				this.hud.redraw();
				break;
			case 'game':
				if (this.controls.isKeyDown('down'))
					this.player.tryingToMoveVert = 'none';
				else
					this.player.tryingToMoveVert = 'up';
				break;
			case 'game-ui':
				if (this.controls.isKeyDown('down'))
					break;
				if (this.hud.dialogue.items.length < 1)
					break;

				let dialogueItem = this.hud.dialogue.items[this.hud.dialogue.currentIndex];
				if (typeof dialogueItem.choices !== 'undefined' &&
				    this.hud.dialogue.selectedChoice > 0) {
					--this.hud.dialogue.selectedChoice;
					this.hud.redraw();
				}
			}
		}, 'up', true);
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'game':
				if (this.controls.isKeyDown('down'))
					this.player.tryingToMoveVert = 'down';
				else
					this.player.tryingToMoveVert = 'none';
				break;
			}
		}, 'up', false);

		// down
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				if (this.hud.pauseMenu.selected < this.hud.pauseMenu.items.length - 1)
					++this.hud.pauseMenu.selected;

				this.hud.redraw();
				break;
			case 'game':
				if (this.controls.isKeyDown('up'))
					this.player.tryingToMoveVert = 'none';
				else
					this.player.tryingToMoveVert = 'down';
				break;
			case 'game-ui':
				if (this.controls.isKeyDown('up'))
					break;
				if (this.hud.dialogue.items.length < 1)
					break;

				let dialogueItem = this.hud.dialogue.items[this.hud.dialogue.currentIndex];
				if (typeof dialogueItem.choices !== 'undefined' &&
				    this.hud.dialogue.selectedChoice < dialogueItem.choices.length - 1) {
					++this.hud.dialogue.selectedChoice;
					this.hud.redraw();
				}
			}
		}, 'down', true);
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'game':
				if (this.controls.isKeyDown('up'))
					this.player.tryingToMoveVert = 'up';
				else
					this.player.tryingToMoveVert = 'none';
				break;
			}
		}, 'down', false);

		// right
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				if (this.hud.pauseMenu.selected > 0)
					--this.hud.pauseMenu.selected;

				this.hud.redraw();
				break;
			case 'game':
				if (this.controls.isKeyDown('left'))
					this.player.tryingToMoveHorz = 'none';
				else
					this.player.tryingToMoveHorz = 'right';
				break;
			}
		}, 'right', true);
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'game':
				if (this.controls.isKeyDown('left'))
					this.player.tryingToMoveHorz = 'left';
				else
					this.player.tryingToMoveHorz = 'none';
				break;
			}
		}, 'right', false);

		// left
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				if (this.hud.pauseMenu.selected < this.hud.pauseMenu.items.length - 1)
					++this.hud.pauseMenu.selected;

				this.hud.redraw();
				break;
			case 'game':
				if (this.controls.isKeyDown('right'))
					this.player.tryingToMoveHorz = 'none';
				else
					this.player.tryingToMoveHorz = 'left';
				break;
			}
		}, 'left', true);
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'game':
				if (this.controls.isKeyDown('right'))
					this.player.tryingToMoveHorz = 'right';
				else
					this.player.tryingToMoveHorz = 'none';
				break;
			}
		}, 'left', false);



	case 'draw':
		this.hud.redraw();
		this.draw();

	case 'done':
		this.loadingScreen.fadeOut();
	}
};

Application.prototype.draw = function () {
	if (typeof this.drawInterval !== 'undefined')
		clearInterval(this.drawInterval);

	this.drawInterval = setInterval(() => {
		let fps = this.hud.fpsCounter.refreshValue();

		switch (this.mode) {
		case 'game':
		case 'game-ui':
			// adjust speed to fps, so the player will always move the same speed
			let speed = this.player.speed / fps;

			let isMovingDiagonally = function (up, down, right, left) {
				return (
					( up && !down &&  right && !left) ||
					( up && !down && !right &&  left) ||
					(!up &&  down &&  right && !left) ||
					(!up &&  down && !right &&  left)
				);
			};

			if (isMovingDiagonally(
				this.controls.isKeyDown('up'),
				this.controls.isKeyDown('down'),
				this.controls.isKeyDown('right'),
				this.controls.isKeyDown('left'))
			)
				speed *= 0.7071067811865475;

			if (this.controls.isKeyDown('slow'))
				speed /= 2;

			// clear
			this.player.clear();
			this.map.entities.forEach(entity => entity.clear());

			// exec entities queue
			this.map.entities.forEach(entity => entity.execQueue());
// TODO bugfix: when animation changes collisions while player is not moving,
// then player can appear inside the collision, and then teleport though it
// when walking inside
			// player react
			this.player.react(speed);

			// draw
			this.player.draw();
			this.map.entities.forEach(entity => entity.draw());
		}

		if (this.config.debug.enabled)
			this.hud.redraw();
	}, 1000 / this.config.fpsCap);
};
