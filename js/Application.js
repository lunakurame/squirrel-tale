// prototype: Application //////////////////////////////////////////////////////

var Application = function () {
	console.log('%c////////////////////////////////////////////////////////////////////////////////', 'background: #3465a4;');
	console.log('Application instance created');

	// status
	this.lastPressedKey = 0;
	this.mode = 'game';
	this.modePrev = 'game';

	// modules
	this.config = new Config(this);
	this.loadingScreen = new LoadingScreen(this);
	this.resourceLoader = new ResourceLoader(this);
	this.canvasList = new CanvasList(this);
	this.nuthead = new Nuthead(this);
	this.fontList = new FontList(this);
	this.controls = new Controls(this);
	this.map = new Map(this, this.config.map.name, this.config.map.variant);
	this.player = new Player(this, this.config.player.name, this.config.player.variant);
	this.hud = new Hud(this);
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
		this.resourceLoader.load('json', 'map', this.map.name);
		this.resourceLoader.load('json', 'player', this.player.name);
		this.resourceLoader.load('json', 'font', 'basic');
		this.resourceLoader.load('image', 'map', this.map.fullName);
		this.resourceLoader.load('image', 'player', this.player.fullName);
		this.resourceLoader.load('image', 'font', 'basic', 'white');
		this.resourceLoader.load('image', 'font', 'basic', 'black');
		this.resourceLoader.load('image', 'font', 'basic', 'teal');
		//this.resourceLoader.load('debug', 'debug', 'debug');
		this.resourceLoader.waitForAllFiles(
			() => {
				this.init('setup-environment');
			},
			() => {
				this.loadingScreen.showError('Error – can\'t load all resources.');
			}
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

		// map
		console.log('Application: setting up the map');
		this.map.load(
			this.resourceLoader.resources['json/map/' + this.map.name],
			this.resourceLoader.resources['image/map/' + this.map.fullName]
		);

		// player
		console.log('Application: setting up the player');
		this.player.load(
			this.resourceLoader.resources['json/map/' + this.map.name].file.entrances,
			this.resourceLoader.resources['json/player/' + this.player.name],
			this.resourceLoader.resources['image/player/' + this.player.fullName]
		);

		// hud
		console.log('Application: setting up the hud');
		this.hud.load();
		this.fontList.load();

	case 'load-entities':
		// load entities
		this.map.loadEntities();
		break;

	case 'setup-entities':
		this.map.setupEntities();

	case 'nuthead':
		this.nuthead.load();

	case 'setup-window':
		//controls
		$(document).keydown(function (e) {
			app.controls.toggleKeyDown(e, true);
		});

		$(document).keyup(function (e) {
			app.controls.toggleKeyDown(e, false);
		});
		
		$(window).resize(function () {
			app.canvasList.resizeAll();
			app.map.draw();
			app.player.react(0, true);
			app.hud.resize();
		});

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
				this.mode = this.modePrev;
				this.nuthead.resumeAll();
				break;
			default:
				this.modePrev = this.mode;
				this.mode = 'pause';
				this.nuthead.pauseAll();
			}

			this.hud.clear();
			this.hud.draw();
		}, 'pause', true);

		// confirm
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				this.hud.pauseMenu.items[this.hud.pauseMenu.selected].action();
				this.hud.clear();
				this.hud.draw();
				break;
			}
		}, 'confirm', true);

		// up
		this.controls.addToQueue(() => {
			switch (this.mode) {
			case 'pause':
				if (this.hud.pauseMenu.selected > 0)
					--this.hud.pauseMenu.selected;

				this.hud.clear();
				this.hud.draw();
				break;
			case 'game':
				if (this.controls.isKeyDown('down'))
					this.player.tryingToMoveVert = 'none';
				else
					this.player.tryingToMoveVert = 'up';
				break;
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

				this.hud.clear();
				this.hud.draw();
				break;
			case 'game':
				if (this.controls.isKeyDown('up'))
					this.player.tryingToMoveVert = 'none';
				else
					this.player.tryingToMoveVert = 'down';
				break;
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

				this.hud.clear();
				this.hud.draw();
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

				this.hud.clear();
				this.hud.draw();
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
		this.map.draw();
		this.hud.draw();

		var drawingLoop = setInterval(() => {
			let fps = this.hud.fpsCounter.getValue();

			switch (this.mode) {
			case 'game':
				// adjust speed to fps, so the player will always move the same speed
				let speed = this.player.speed / fps;
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
				this.hud.drawDebugInfo(fps);
		}, 1000 / this.config.fpsCap);

	case 'done':
		this.loadingScreen.fadeOut();
	}
};
