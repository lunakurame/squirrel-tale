function main(arg) {
	PLAYER_NAME = 'shiro';
	PLAYER_VARIANT = 'normal';
	MAP = 'test';

	switch (arg) {
	default:
	case 'document-ready':
		// loading screen
		loadingScreen = new LoadingScreen();
		loadingScreen.rotateIcon();

		// data loader (for JSON)
		dataLoader = new DataLoader();
		dataLoader.load('player-' + PLAYER_NAME, 'data/player/' + PLAYER_NAME + '.json');
		dataLoader.load('map-' + MAP, 'data/map/' + MAP + '.json');

	case 'check-data':
		// check if all data files finished loading
		dataLoader.waitForAllFiles('check-data-ok', 'check-data-error');
		break;

	case 'check-data-error':
		loadingScreen.showError('Error – can\'t load all data files.');
		break;

	case 'check-data-ok':

	case 'canvas': // TODO try catch?
		// canvas
		canvas = new Canvas();
		canvas.add('map', $('#map')[0]);
		canvas.addContext('map', canvas.canvas['map'].getContext('2d'));
		canvas.add('player', $('#player')[0]);
		canvas.addContext('player', canvas.canvas['player'].getContext('2d'));
		canvas.add('hud', $('#hud')[0]);
		canvas.addContext('hud', canvas.canvas['hud'].getContext('2d'));
		canvas.resizeAll();

	case 'player':
		// load player
		player = new Player();
		player.fileName = PLAYER_NAME;
		player.variant = PLAYER_VARIANT;
		player.data = dataLoader.data['player-' + PLAYER_NAME];
		player.speed = player.data.defaultSpeed;
		// TODO position

	case 'map':
		map = new Map(canvas.canvas['map'], canvas.context['map']);
		map.data = dataLoader.data['map-' + MAP];

	case 'hud':
		hud = new Hud(canvas.context['hud']);

	case 'images':
		// load all images
		imagesLoader = new ImagesLoader();
		//imagesLoader.load('loading', 'img/loading.png');
		imagesLoader.load('loading-failed', 'img/loading-failed.png');

		imagesLoader.load('player', 'data/player/' + player.data.images[player.data.variants.indexOf(player.variant)]);
		imagesLoader.load('map', 'data/map/' + map.data.image);

		//imagesLoader.load('debug', 'debug');

	case 'check-images':
		// check if all images finished loading
		imagesLoader.waitForAllFiles('check-images-ok', 'check-images-error');
		break;

	case 'check-images-error':
		loadingScreen.showError('Error – can\'t load all images.');
		break;

	case 'check-images-ok':
		player.setMaxFrame(imagesLoader.image['player']);
		map.image = imagesLoader.image['map'];
		hud.draw();

	case 'controls':
		// controls
		controls = new Controls();

		$(document).keydown(function (e) {
			controls.toggleKeyDown(e, true);
		});

		$(document).keyup(function (e) {
			controls.toggleKeyDown(e, false);
		});

	case 'drawing-loop':
		// draw the map
		map.draw();

		// player animations
		var playerAnimations_interval = setInterval(function () {
			if (player.moving) {
				++player.frame;
				if (player.frame > player.maxFrame)
					player.frame = 0;
			} else {
				player.frame = 0;
			}
		}, 250);

		// the drawing loop
		var drawingLoop_interval = setInterval(function () {
			// get fps
			fps = hud.fpsCounter.getValue();
			// adjust speed to fps, so the player will always move the same speed
			speed = player.speed / fps;

			// if the slow key is down, half the speed
			if (controls.keysDown.slow)
				speed = speed / 2;

			// clear player image
			canvas.context['player'].clearRect(
				player.posHor - 1,
				player.posVer - 1,
				player.posHor + player.data.width + 1,
				player.posVer + player.data.height + 1
			);

			// check if player is moving
			player.moving = (
				// if a key is down, the opposite key should not be down
				(
					(controls.keysDown.up && !controls.keysDown.down) ||
					(controls.keysDown.down && !controls.keysDown.up) ||
					(controls.keysDown.right && !controls.keysDown.left) ||
					(controls.keysDown.left && !controls.keysDown.right)
				// if a key is down, but the player has reached the end of the map, the player should not be moving
				) && (
					(controls.keysDown.up && player.posVer > 0) ||
					(controls.keysDown.down && player.posVer < canvas.canvas['player'].height - player.data.height) ||
					(controls.keysDown.right && player.posHor < canvas.canvas['player'].width - player.data.width) ||
					(controls.keysDown.left && player.posHor > 0)
				) &&
				// some triple keys on canvas border trickery...
				!(controls.keysDown.up && controls.keysDown.down && controls.keysDown.right && player.posHor >= canvas.canvas['player'].width - player.data.width) &&
				!(controls.keysDown.up && controls.keysDown.down && controls.keysDown.left && player.posHor <= 0) &&
				!(controls.keysDown.right && controls.keysDown.left && controls.keysDown.up && player.posVer <= 0) &&
				!(controls.keysDown.right && controls.keysDown.left && controls.keysDown.down && player.posVer >= canvas.canvas['player'].height - player.data.height)
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
						(player.posVer <= (canvas.canvas['player'].height - player.data.height) / 2) &&
						(map.top > 0))
					{
						// the next 3 lines are to smooth the transition between moving player and moving map (and vice versa)
						tmp_pos_diff = ((canvas.canvas['player'].height - player.data.height) / 2) - player.posVer;
						player.posVer += tmp_pos_diff;
						map.top -= tmp_pos_diff;
						// move the map
						map.top -= speed;
					// if the player is somewhere else or the map no longer can move, then move the player
					} else {
						// recalibrate the map's position
						if (map.top < 0)
							map.top = 0;
						// move the player
						player.posVer -= speed;
					}
				// if key down
				// (I won't comment the rest of this code, it is almost the same as the code above, so if you need help, just look at the comments above)
				} else if (controls.keysDown.down && !controls.keysDown.up) {
					player.direction = 1;
					if (
						(player.posVer >= (canvas.canvas['player'].height - player.data.height) / 2) &&
						(map.top < map.image.height - canvas.canvas['player'].height)
					) {
						tmp_pos_diff = player.posVer - ((canvas.canvas['player'].height - player.data.height) / 2);
						player.posVer -= tmp_pos_diff;
						map.top += tmp_pos_diff;
						map.top += speed;
					} else {
						if (map.top > map.image.height - canvas.canvas['player'].height)
							map.top = map.image.height - canvas.canvas['player'].height;
						player.posVer += speed;
					}
				}

				// if key right
				// there is an additional condition in this 'if',
				// it fixed the bug when you press left/right and up/down (diagonal movement), but the player already is moving diagonal
				// normaly diagonal movement uses the left/right animation, but in that case the animation should be up/down instead,
				// because right/left movement is not allowed through the canvas borders
				if (controls.keysDown.right && !controls.keysDown.left && player.posHor < canvas.canvas['player'].width - player.data.width) {
					player.direction = 2;
					if (
						(player.posHor >= (canvas.canvas['player'].width - player.data.width) / 2) &&
						(map.left < map.image.width - canvas.canvas['player'].width)
					) {
						tmp_pos_diff = player.posHor - ((canvas.canvas['player'].width - player.data.width) / 2);
						player.posHor -= tmp_pos_diff;
						map.left += tmp_pos_diff;
						map.left += speed;
					} else {
						if (map.left > map.image.width - canvas.canvas['player'].width)
							map.left = map.image.width - canvas.canvas['player'].width;
						player.posHor += speed;
					}
				// if key left
				// additional condition - see the explanation above
				} else if (controls.keysDown.left && !controls.keysDown.right && player.posHor > 0) {
					player.direction = 3;
					if (
						(player.posHor <= (canvas.canvas['player'].width - player.data.width) / 2) &&
						(map.left > 0)
					) {
						tmp_pos_diff = ((canvas.canvas['player'].width - player.data.width) / 2) - player.posHor;
						player.posHor += tmp_pos_diff;
						map.left -= tmp_pos_diff;
						map.left -= speed;
					} else {
						if (map.left < 0)
							map.left = 0;
						player.posHor -= speed;
					}
				}

				// recalibrate player's position if he somehow manages to get out of the map
				if (player.posHor < 0)
					player.posHor = 0;
				else if (player.posHor > canvas.canvas['player'].width - player.data.width)
					player.posHor = canvas.canvas['player'].width - player.data.width;
				if (player.posVer < 0)
					player.posVer = 0;
				else if (player.posVer > canvas.canvas['player'].height - player.data.height)
					player.posVer = canvas.canvas['player'].height - player.data.height;

				// if the map's position just changed, it means the map must be redrawed
				if (map.left != tmp_map_left || map.top != tmp_map_top)
					map.draw();
			}

			// draw player's image
			// it includes animations and directions
			canvas.context['player'].drawImage(
				imagesLoader.image['player'],
				player.frame * player.data.width, player.direction * player.data.height, player.data.width, player.data.height,
				parseInt(player.posHor), parseInt(player.posVer), player.data.width, player.data.height
			);

			// reset HUD styles
			hud.resetTextStyle();

			// draw debug HUD
			canvas.context['hud'].clearRect(0, 0, 320, 40);
			canvas.context['hud'].fillStyle = 'rgba(0, 127, 127, .98)';
			canvas.context['hud'].fillRect(0, 0, 240, 20);
			canvas.context['hud'].fillStyle = '#fff';
			canvas.context['hud'].fillText(fps.toFixed(4) + ' fps, player "' + player.data.name + '"', 6, 2);
		}, 16); // locked on max 62.5 fps = 1000/16

	case 'resize-event': // TODO
		$(window).resize(function () {
//			canvas.context['hud'].clearRect(0, 0, canvas.canvas['hud'].width, canvas.canvas['hud'].height);
			canvas.resizeAll();
			map.draw(imagesLoader.image['map']);
			hud.draw();
		});

	case 'done':
		// turn off the loading screen
		loadingScreen.fadeOut();
	}
}

