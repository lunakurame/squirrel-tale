// prototype: Application //////////////////////////////////////////////////////

var Application = function () {
	console.log('%c////////////////////////////////////////////////////////////////////////////////', 'background: #3465a4;');
	console.log('Application instance created');

	this.debugKey = 0;	// TODO move to Hud

	this.config = new Config(this);
	this.loadingScreen = new LoadingScreen(this);
	this.resourceLoader = new ResourceLoader(this);
	this.canvasList = new CanvasList(this);
	this.animationList = new AnimationList(this);
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
		this.resourceLoader.load('image', 'font', 'basic');
		//this.resourceLoader.load('debug', 'debug', 'debug');
		this.resourceLoader.waitForAllFiles('init-load-resources-ok', 'init-load-resources-error');
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
			this.resourceLoader.resource['json/map/' + this.map.name],
			this.resourceLoader.resource['image/map/' + this.map.fullName]
		);

		// player
		console.log('Application: setting up the player');
		this.player.load(
			this.resourceLoader.resource['json/player/' + this.player.name],
			this.resourceLoader.resource['image/player/' + this.player.fullName]
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

	case 'animations':
		this.animationList.load();

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
			//app.hud.draw(); // TODO
		});

	case 'draw':
		this.map.draw();
		//this.hud.draw(); // TODO

		var debugKeyState = false;

		var drawingLoop_interval = setInterval(function () { // TODO
			// debug mode
			if (debugKeyState && !(app.controls.keysDown.debug || app.controls.keysDown.debug_alt)) {
				debugKeyState = false;

				// toggle debug mode
				app.config.debug.enabled = !app.config.debug.enabled;

				// clear all canvases
				for (var i in app.canvasList.context)
					app.canvasList.context[i].clearRect(
						0,
						0,
						app.canvasList.canvas[i].width,
						app.canvasList.canvas[i].height
					);
				app.map.draw();
				//this.hud.draw(); // TODO
			} else if (!debugKeyState && (app.controls.keysDown.debug || app.controls.keysDown.debug_alt)) {
				debugKeyState = true;
			}

			// adjust speed to fps, so the player will always move the same speed
			var fps = app.hud.fpsCounter.getValue();
			var speed = app.player.speed / fps;
			if (app.controls.keysDown.slow)
				speed = speed / 2;

			// clear player
			app.player.clear();
			
			// clear entities
			for (var i in app.map.entities) {
				app.map.entities[i].clear();
			}

			// exec entities queue
			for (var i in app.map.entities) {
				app.map.entities[i].execQueue();
			}
// TODO bugfix: when animation changes collisions while player is not moving,
// then player can appear inside the collision, and then teleport though it
// when walking inside
			// player react
			app.player.react(speed);

			// draw player
			app.player.draw();

			// draw entities
			for (var i in app.map.entities) {
				app.map.entities[i].draw();
			}

			// reset HUD styles
			app.hud.resetTextStyle();

			// draw debug HUD
			app.canvasList.context['hud'].clearRect(0, 0, 108, 40);
			app.canvasList.context['hud'].fillStyle = 'rgba(0, 127, 127, .8)';
			app.canvasList.context['hud'].fillRect(0, 0, 108, 40);
			app.canvasList.context['hud'].fillStyle = '#fff';

			app.fontList.draw(
				'FPS ' + fps.toFixed(2) +
				'\nRES ' + app.canvasList.canvas['player'].width + 'x' + app.canvasList.canvas['player'].height +
				'\nKEY ' + app.debugKey,
				'basic', 6, 4
			);

//			app.fontList.draw(
//				'1234567890\nQWERTYUIOP\nASDFGHJKL\nZXCVBNM\nqwertyuiop\nasdfghjkl\nzxcvbnm\n `-=[]\\;\',./~!@\n#$%^&*()_+{}\n|:"<>?',
//				'basic', 50, 50
//			);
//			app.fontList.draw(
//				'0123456789\nABCDEFGHIJ\nKLMNOPQRS\nTUVWXYZ\nabcdefghij\nklmnopqrs\ntuvwxyz',
//				'basic', 150, 50
//			);

			//clearInterval(drawingLoop_interval);
		}, 16);	// locked on max 62.5 fps = 1000/16




	case 'done':
		this.loadingScreen.fadeOut();
	}
};

Application.prototype.callback = function (arg) {
	switch (arg) {
	case 'init-load-resources-ok':
		this.init('setup-environment');
		break;
	case 'init-load-resources-error':
		this.loadingScreen.showError('Error – can\'t load all resources.');
		break;
	case 'init-load-entities-ok':
		this.init('setup-entities');
		break;
	case 'init-load-entities-error':
		this.loadingScreen.showError('Error – can\'t load all resources.');
		break;
	}
};
