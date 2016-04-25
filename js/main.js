// prototype: loadingScreen ////////////////////////////////////////////////////

var LoadingScreen = function () {
	console.log('LoadingScreen instance created');
};

LoadingScreen.prototype.rotateIcon = function () {
	parent_obj = this;

	// if black screen is visible and is loading, then rotate the loading icon (loop)
	if ($('#black-screen').css('display') != 'none' && $('#black-screen .loading-icon').attr('alt').indexOf('fail') < 0) {
		$('#black-screen .loading-icon').rotate({
			duration: 1000,
			angle: 0,
			animateTo: 180,
			callback: parent_obj.rotateIcon
		});
	}
};

LoadingScreen.prototype.fadeIn = function () {
	// turn on black screen
	$('#black-screen').fadeIn();
};

LoadingScreen.prototype.fadeOut = function () {
	// turn off black screen
	$('#black-screen').fadeOut();
};

LoadingScreen.prototype.showError = function (message) {
	$('#black-screen > div').fadeOut(300, function() {
		$('#black-screen .loading-icon').attr({
			'src': 'img/loading-failed.png',
			'alt': 'Loading failed icon'
		});
		$('#black-screen > div').append('<p>' + message + '</p>').css({
			'padding-top': '40px'
		}).fadeIn(300);
	});
};

// prototype: ImagesLoader /////////////////////////////////////////////////////

var ImagesLoader = function () {
	console.log('ImagesLoader instance created');

	this.image = {};
	this.imageStatus = {}; // 0 - ???, 1 - loading, 2 - completed, 3 - error
};

ImagesLoader.prototype.load = function (name, src) {
	console.log('ImagesLoader: loading image "' + name + '", src: "' + src + '"');

	// create new Image
	this.image[name] = new Image();
	// set status to 'loading'
	this.imageStatus[name] = 1;

	// when it is loaded, check if the image is OK
	// if it is, then set the status to 'completed', otherwise 'error'
	parent_obj = this;
	this.image[name].onload = function () {
		if ('naturalHeight' in this) {
			if (this.naturalHeight + this.naturalWidth === 0) {
				this.onerror();
				return;
			}
		} else if (this.width + this.height == 0) {
			this.onerror();
			return;
		}

		parent_obj.imageStatus[name] = 2;
	};

	// set the status to 'error'
	this.image[name].onerror = function () {
		parent_obj.imageStatus[name] = 3;
	};

	// load the image
	this.image[name].src = src;
};

ImagesLoader.prototype.waitForAllFiles = function (callback_ok, callback_error) {
	// check if all files finished loading
	parent_obj = this;
	var status = 1;
	var interval = setInterval(function () {
		status = 2;
		// loop through all imageStatuses
		for (var property in parent_obj.imageStatus) {
			if (parent_obj.imageStatus.hasOwnProperty(property)) {
				// halt on error
				if (parent_obj.imageStatus[property] == 3) {
					status = 3;
					break;
				} else if (parent_obj.imageStatus[property] == 1) {
					status = 1;
				}
			}
		}

		// check if there was any error
		if (status == 3) {
			clearInterval(interval);
			main(callback_error);
		} else if (status == 2) {
			clearInterval(interval);
			main(callback_ok);
		}
	}, 1000);
};

// prototype: DataLoader ///////////////////////////////////////////////////////

var DataLoader = function () {
	console.log('DataLoader instance created');

	this.data = {};
	this.dataStatus = {}; // 0 - ???, 1 - loading, 2 - completed, 3 - error
};

DataLoader.prototype.load = function (name, src) {
	console.log('DataLoader: loading data "' + name + '", src: "' + src + '"');

	// set status to 'loading'
	this.dataStatus[name] = 1;
	
	// load the file
	parent_obj = this;
	$.getJSON(src, function (json) {
		parent_obj.data[name] = json;
		parent_obj.dataStatus[name] = 2;
	}).fail(function () {
		parent_obj.dataStatus[name] = 3;
	});
};

DataLoader.prototype.waitForAllFiles = function (callback_ok, callback_error) {
	// check if all files finished loading
	parent_obj = this;
	var status = 1;
	var interval = setInterval(function () {
		status = 2;
		// loop through all dataStatuses
		for (var property in parent_obj.dataStatus) {
			if (parent_obj.dataStatus.hasOwnProperty(property)) {
				// halt on error
				if (parent_obj.dataStatus[property] == 3) {
					status = 3;
					break;
				} else if (parent_obj.dataStatus[property] == 1) {
					status = 1;
				}
			}
		}

		// check if there was any error
		if (status == 3) {
			clearInterval(interval);
			main(callback_error);
		} else if (status == 2) {
			clearInterval(interval);
			main(callback_ok);
		}
	}, 1000);
};

// prototype: ObjectsLoader ////////////////////////////////////////////////////
//////////////////////// ISN'T DATALOADER FOR LOADING JSON...?
var ObjectsLoader = function () { // TODO
	console.log('ObjectsLoader instance created');

	this.object = {};
	this.objectStatus = {}; // 0 - ???, 1 - loading, 2 - completed, 3 - error

};

// prototype: Controls /////////////////////////////////////////////////////////

var Controls = function () {
	console.log('Controls instance created');

	this.keys = {
		// primary keys
		up: 87,
		down: 83,
		right: 68,
		left: 65,
		slow: 16,

		// secondary keys
		up_alt: 38,
		down_alt: 40,
		right_alt: 39,
		left_alt: 37,
		slow_alt: 16
	};

	this.keysDown = {
		// 'true' if primary OR secondary key is down
		up: false,
		down: false,
		right: false,
		left: false,
		slow: false
	};
};

Controls.prototype.toggleKeyDown = function (e, state) {
	switch(e.which) {
	case this.keys.up:
	case this.keys.up_alt:
		this.keysDown.up = state;
		break;
	case this.keys.down:
	case this.keys.down_alt:
		this.keysDown.down = state;
		break;
	case this.keys.right:
	case this.keys.right_alt:
		this.keysDown.right = state;
		break;
	case this.keys.left:
	case this.keys.left_alt:
		this.keysDown.left = state;
		break;
	case this.keys.slow:
	case this.keys.slow_alt:
		this.keysDown.slow = state;
		break;
	}
};

// prototype: Canvas ///////////////////////////////////////////////////////////

var Canvas = function () {
	console.log('Canvas instance created');

	this.canvas = {};
	this.context = {};
};

Canvas.prototype.add = function (name, object) {
	console.log('Canvas: adding canvas "' + name + '", object: "' + object + '"');

	// add canvas
	this.canvas[name] = object;
};

Canvas.prototype.addContext = function (name, object) {
	console.log('Canvas: adding context "' + name + '", object: "' + object + '"');

	// add context
	this.context[name] = object;
};

Canvas.prototype.resizeAll = function () {
	// resize all canvases to match window size TODO
	for (var property in this.canvas) {
		if (this.canvas.hasOwnProperty(property)) {
			// if the screen is 4:3 or wider
			if (window.innerHeight / window.innerWidth <= 0.75) {
				this.canvas[property].width = (240 * window.innerWidth) / window.innerHeight;
				this.canvas[property].height = 240;
			// if it's not (some squares or portrait resolutions...?) TODO
			} else if (window.innerHeight / window.innerWidth <= 0.75) {
				this.canvas[property].width = 320;
				this.canvas[property].height = (320 * window.innerHeight) / window.innerWidth;
			}
		}
	}
};

// prototype: Map //////////////////////////////////////////////////////////////

var Map = function (canvas, canvas_context) {
	console.log('Map instance created');

	this.canvas = canvas;
	this.context = canvas_context;
	this.data; // loaded from JSON file
	this.image;
	this.left = 0;
	this.top = 0;
};

Map.prototype.draw = function () {
	// draw map TODO
	this.context.drawImage(
		this.image,
		this.left, this.top, this.canvas.width, this.canvas.height,
		0, 0, this.canvas.width, this.canvas.height
	);
};

// prototype: Player ///////////////////////////////////////////////////////////

var Player = function () {
	console.log('Player instance created');

	this.fileName;
	this.data; // loaded from JSON file
	this.speed; // loaded from JSON file (but can be modified)
	this.variant; // loaded from JSON file (but can be modified)
	this.moving = false;
	this.direction = 1; // 0 - up, 1 - down, 2 - right, 3 - left
	this.frame = 0;
	this.maxFrame;

	// TODO
	this.posHor = 80;
	this.posVer = 100;
};

Player.prototype.setMaxFrame = function (image) {
	this.maxFrame = image.width / this.data.width - 1;
};

// prototype: Hud //////////////////////////////////////////////////////////////

var Hud = function (canvas_context) {
	console.log('Hud instance created');

	this.context = canvas_context;

	this.fpsCounter = new function () {
		this.startTime = 0;
		this.frameNumber = 0;

		this.getValue = function () {
			this.frameNumber++;
			var d = new Date().getTime(),
				currentTime = (d - this.startTime) / 1000,
				//result = Math.floor(this.frameNumber / currentTime);
				result = this.frameNumber / currentTime;

			if (currentTime > 1) {
				this.startTime = new Date().getTime();
				this.frameNumber = 0;
			}
			return result;
		}
	}
};

Hud.prototype.draw = function () {
//	this.context.font = '40px monospace';
//	this.context.textAlign = 'center';
//	this.context.textBaseline = 'top';
//	this.context.fillStyle = 'white';
//	this.context.fillText('WASD to move', window.innerWidth / 2, 20);
};

Hud.prototype.resetTextStyle = function () {
	this.context.font = '14px monospace';
	this.context.textAlign = 'left';
	this.context.textBaseline = 'top';
	this.context.fillStyle = 'white';
};

// main ////////////////////////////////////////////////////////////////////////

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

$(document).ready(function () {
	main();
});

