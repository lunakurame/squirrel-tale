// prototype: Application //////////////////////////////////////////////////////

var Application = function () {
	console.log('%c////////////////////////////////////////////////////////////////////////////////', 'background: #3465a4;');
	console.log('Application instance created');

	this.config = new Config(this);
	this.loadingScreen = new LoadingScreen(this);
	this.resourceLoader = new ResourceLoader(this);
	this.canvasList = new CanvasList(this);
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
		this.resourceLoader.load('image', 'map', this.map.fullName);
		this.resourceLoader.load('image', 'player', this.player.fullName);
		//this.resourceLoader.load('debug', 'debug', 'debug');
		this.resourceLoader.waitForAllFiles('init-load-resources-ok', 'init-load-resources-error');
		break;

	case 'setup-environment':
		// canvas
		console.log('Application: setting up the canvasList');
		this.canvasList.add('map', $('#map')[0]);
		this.canvasList.addContext('map', $('#map')[0].getContext('2d'));
		this.canvasList.add('entity_under', $('#entity_under')[0]);
		this.canvasList.addContext('entity_under', $('#entity_under')[0].getContext('2d'));
		this.canvasList.add('player', $('#player')[0]);
		this.canvasList.addContext('player', $('#player')[0].getContext('2d'));
		this.canvasList.add('entity_over', $('#entity_over')[0]);
		this.canvasList.addContext('entity_over', $('#entity_over')[0].getContext('2d'));
		this.canvasList.add('hud', $('#hud')[0]);
		this.canvasList.addContext('hud', $('#hud')[0].getContext('2d'));
		this.canvasList.resizeAll();

		// map
		console.log('Application: setting up the map');
		this.map.data = this.resourceLoader.resource['json/map/' + this.map.name];
		this.map.image = this.resourceLoader.resource['image/map/' + this.map.fullName];
		this.map.canvas = this.canvasList.canvas['map'];
		this.map.context = this.canvasList.context['map'];

		// player
		console.log('Application: setting up the player');
		this.player.data = this.resourceLoader.resource['json/player/' + this.player.name];
		this.player.image = this.resourceLoader.resource['image/player/' + this.player.fullName];
		this.player.canvas = this.canvasList.canvas['player'];
		this.player.context = this.canvasList.context['player'];
		this.player.speed = this.player.data.file.defaultSpeed;

		// hud
		console.log('Application: setting up the hud');
		this.hud.cavas = this.canvasList.canvas['hud'];
		this.hud.context = this.canvasList.context['hud'];

	case 'load-entities':
		// load entities
		for (var i in this.map.data.file.entities) {
			this.map.entities[i] = new Entity(this, this.map.data.file.entities[i].name, this.map.data.file.entities[i].variant);
			this.map.entities[i].posX = this.map.data.file.entities[i].posX;
			this.map.entities[i].posY = this.map.data.file.entities[i].posY;
			this.map.entities[i].posZ = this.map.data.file.entities[i].posZ;
			this.resourceLoader.loadOnce('json', 'entity', this.map.entities[i].name);
			this.resourceLoader.loadOnce('image', 'entity', this.map.entities[i].fullName);
		}
		this.resourceLoader.waitForAllFiles('init-load-entities-ok', 'init-load-entities-error');
		break;

	case 'setup-entities':
		for (var i in this.map.entities) {
			this.map.entities[i].data = this.resourceLoader.resource['json/entity/' + this.map.entities[i].name];
			this.map.entities[i].image = this.resourceLoader.resource['image/entity/' + this.map.entities[i].fullName];
			this.map.entities[i].canvas = this.canvasList.canvas['entity_' + this.map.entities[i].posZ];
			this.map.entities[i].context = this.canvasList.context['entity_' + this.map.entities[i].posZ];
			this.map.entities[i].canvas_under = this.canvasList.canvas['entity_under'];
			this.map.entities[i].context_under = this.canvasList.context['entity_under'];
			this.map.entities[i].enableCollisions = (this.map.data.file.entities[i].enableCollisions !== false);
		}

	case 'setup-window':
		//controls
		$(document).keydown(function (e) {
			app.controls.toggleKeyDown(e, true);
		});

		$(document).keyup(function (e) {
			app.controls.toggleKeyDown(e, false);
		});
		
		$(window).resize(function () { // TODO
//			canvas.context['hud'].clearRect(0, 0, canvas.canvas['hud'].width, canvas.canvas['hud'].height);
			app.canvasList.resizeAll();
			app.map.draw();
			app.player.react(0, true)
			//app.hud.draw();
		});

	case 'draw':
		this.map.draw();
		//this.hud.draw(); // TODO

		var drawingLoop_interval = setInterval(function () { // TODO
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

			// player react
			app.player.react(speed);

/////
/*
			with (app) {
			// check if player is moving
			player.moving = (
				// if a key is down and the opposite key is not down and the player has not reached the end of the map
				(controls.keysDown.up && !controls.keysDown.down && player.posY > 0) ||
				(controls.keysDown.down && !controls.keysDown.up && player.posY < canvasList.canvas['player'].height - player.data.file.height) ||
				(controls.keysDown.right && !controls.keysDown.left && player.posX < canvasList.canvas['player'].width - player.data.file.width) ||
				(controls.keysDown.left && !controls.keysDown.right && player.posX > 0)
			);

			// move player
			if (player.moving) {
				// remember surrend map position to know if the map requires to be redrawed
				tmp_map_left = map.left;
				tmp_map_top = map.top;

				// if key up
				if (controls.keysDown.up && !controls.keysDown.down) {
					// set player direction (direction codes can bee seen in the Player prototype object)
					player.direction = 0;
					// if the player is halfway the screen and the map can move, then move the map instead of the player
					if (
						(player.posY <= (canvasList.canvas['player'].height - player.data.file.height) / 2) &&
						(map.top > 0))
					{
						// the next 3 lines are to smooth the transition between moving player and moving map (and vice versa)
						tmp_pos_diff = ((canvasList.canvas['player'].height - player.data.file.height) / 2) - player.posY;
						player.posY += tmp_pos_diff;
						map.top -= tmp_pos_diff;
						// move the map
						map.top -= speed;
					// if the player is somewhere else or the map no longer can move, then move the player
					} else {
						// recalibrate the map's position
						if (map.top < 0)
							map.top = 0;
						// move the player
						player.posY -= speed;
					}
				// if key down
				// (I won't comment the rest of this code, it is almost the same as the code above, so if you need help, just look at the comments above)
				} else if (controls.keysDown.down && !controls.keysDown.up) {
					player.direction = 1;
					if (
						(player.posY >= (canvasList.canvas['player'].height - player.data.file.height) / 2) &&
						(map.top < map.image.file.height - canvasList.canvas['player'].height)
					) {
						tmp_pos_diff = player.posY - ((canvasList.canvas['player'].height - player.data.file.height) / 2);
						player.posY -= tmp_pos_diff;
						map.top += tmp_pos_diff;
						map.top += speed;
					} else {
						if (map.top > map.image.file.height - canvasList.canvas['player'].height)
							map.top = map.image.file.height - canvasList.canvas['player'].height;
						player.posY += speed;
					}
				}

				// if key right
				// there is an additional condition in this 'if',
				// it fixed the bug when you press left/right and up/down (diagonal movement), but the player already is moving diagonal
				// normaly diagonal movement uses the left/right animation, but in that case the animation should be up/down instead,
				// because right/left movement is not allowed through the canvas borders
				if (controls.keysDown.right && !controls.keysDown.left && player.posX < canvasList.canvas['player'].width - player.data.file.width) {
					player.direction = 2;
					if (
						(player.posX >= (canvasList.canvas['player'].width - player.data.file.width) / 2) &&
						(map.left < map.image.file.width - canvasList.canvas['player'].width)
					) {
						tmp_pos_diff = player.posX - ((canvasList.canvas['player'].width - player.data.file.width) / 2);
						player.posX -= tmp_pos_diff;
						map.left += tmp_pos_diff;
						map.left += speed;
					} else {
						if (map.left > map.image.file.width - canvasList.canvas['player'].width)
							map.left = map.image.file.width - canvasList.canvas['player'].width;
						player.posX += speed;
					}
				// if key left
				// additional condition - see the explanation above
				} else if (controls.keysDown.left && !controls.keysDown.right && player.posX > 0) {
					player.direction = 3;
					if (
						(player.posX <= (canvasList.canvas['player'].width - player.data.file.width) / 2) &&
						(map.left > 0)
					) {
						tmp_pos_diff = ((canvasList.canvas['player'].width - player.data.file.width) / 2) - player.posX;
						player.posX += tmp_pos_diff;
						map.left -= tmp_pos_diff;
						map.left -= speed;
					} else {
						if (map.left < 0)
							map.left = 0;
						player.posX -= speed;
					}
				}

				// recalibrate player's position if he somehow manages to get out of the map
				if (player.posX < 0)
					player.posX = 0;
				else if (player.posX > canvasList.canvas['player'].width - player.data.file.width)
					player.posX = canvasList.canvas['player'].width - player.data.file.width;
				if (player.posY < 0)
					player.posY = 0;
				else if (player.posY > canvasList.canvas['player'].height - player.data.file.height)
					player.posY = canvasList.canvas['player'].height - player.data.file.height;

				// if the map's position just changed, it means the map must be redrawed
				if (map.left != tmp_map_left || map.top != tmp_map_top)
					map.draw();
			}
			}
*/
/////

			// draw player
			app.player.draw();
			
			// draw entities
			for (var i in app.map.entities) {
				app.map.entities[i].draw();
			}

			// reset HUD styles
			app.hud.resetTextStyle();

			// draw debug HUD
			app.canvasList.context['hud'].clearRect(0, 0, 320, 40);
			app.canvasList.context['hud'].fillStyle = 'rgba(0, 127, 127, .98)';
			app.canvasList.context['hud'].fillRect(0, 0, 240, 20);
			app.canvasList.context['hud'].fillStyle = '#fff';
			app.canvasList.context['hud'].fillText(fps.toFixed(2) + ' fps, screen: ' + app.canvasList.canvas['player'].width + 'x' + app.canvasList.canvas['player'].height + '', 6, 2);

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
