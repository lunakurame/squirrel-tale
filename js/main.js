// prototype: loadingScreen ////////////////////////////////////////////////////

var LoadingScreen = function () {
	console.log('LoadingScreen instance created');
};

LoadingScreen.prototype.rotateIcon = function () {
	if ($('#black-screen').css('display') != 'none' && $('#black-screen .loading-icon').attr('alt').indexOf('fail') < 0) {
		$('#black-screen .loading-icon').rotate({
			duration: 1000,
			angle: 0,
			animateTo: 180,
			callback: LoadingScreen.prototype.rotateIcon
		});
	}
};

LoadingScreen.prototype.fadeIn = function () {
	$('#black-screen').fadeIn();
};

LoadingScreen.prototype.fadeOut = function () {
	$('#black-screen').fadeOut();
};

// prototype: ImagesLoader /////////////////////////////////////////////////////

var ImagesLoader = function () {
	console.log('ImagesLoader instance created');

	this.image = {};
	this.imageStatus = {}; // 1 - loading, 2 - completed, 3 - error
};

ImagesLoader.prototype.load = function (name, src) {
	console.log('ImagesLoader: loading image "' + name + '", src: "' + src + '"');
	this.image[name] = new Image();
	this.imageStatus[name] = 1;
	load_obj = this;
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

		load_obj.imageStatus[name] = 2;
	};
	this.image[name].onerror = function () {
		load_obj.imageStatus[name] = 3;
	};
	this.image[name].src = src;
};

// prototype: Controls /////////////////////////////////////////////////////////

var Controls = function () {
	console.log('Controls instance created');

	this.keys = {
		up: 87,
		down: 83,
		right: 68,
		left: 65,
		
		up_alt: 38,
		down_alt: 40,
		right_alt: 39,
		left_alt: 37
	};

	this.keysDown = {
		up: false,
		down: false,
		right: false,
		left: false
	};
};

// prototype: Canvas ///////////////////////////////////////////////////////////

var Canvas = function () {
	console.log('Canvas instance created');

	this.canvas = {};
	this.context = {};
};

Canvas.prototype.add = function (name, object) {
	console.log('Canvas: adding canvas "' + name + '", object: "' + object + '"');
	this.canvas[name] = object;
};

Canvas.prototype.addContext = function (name, object) {
	console.log('Canvas: adding context "' + name + '", object: "' + object + '"');
	this.context[name] = object;
};

Canvas.prototype.resizeAll = function () {
	for (var property in this.canvas) {
		if (this.canvas.hasOwnProperty(property)) {
			// if the screen is 4:3 or wider
			if (window.innerHeight / window.innerWidth <= 0.75) {
				this.canvas[property].width = (240 * window.innerWidth) / window.innerHeight;
				this.canvas[property].height = 240;
			// if it's not (some squares or portrait resolutions...?)
			} else if (window.innerHeight / window.innerWidth <= 0.75) {
				this.canvas[property].width = 320;
				this.canvas[property].height = (320 * window.innerHeight) / window.innerWidth;
			}
		}
	}
};

// prototype: Map //////////////////////////////////////////////////////////////

var Map = function (canvas_context) {
	console.log('Map instance created');

	this.context = canvas_context;
};

Map.prototype.draw = function (image) {
	this.context.drawImage(image, 0, 0, image.width, image.height);
};

// prototype: Player ///////////////////////////////////////////////////////////

var Player = function () {
	console.log('Player instance created');

	this.width = 45;
	this.height = 50;
	this.posHor = 10;
	this.posVer = 10;
	this.speed = 100;
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
	switch (arg) {
	default:
	case 'document-ready':
		// loading screen
		loadingScreen = new LoadingScreen();
		loadingScreen.rotateIcon();

		// load all images
		imagesLoader = new ImagesLoader();
		imagesLoader.load('loading-failed', 'img/loading-failed.png');
		//imagesLoader.load('loading', 'img/loading.png');
		imagesLoader.load('map', 'img/map.png');
		imagesLoader.load('player', 'img/player.png');
		//imagesLoader.load('debug', 'debug');

	case 'check-images':
		// check if all images finished loading
		var imagesLoader_status = 1;
		var imageLoader_interval = setInterval(function () {
			imagesLoader_status = 2;
			// loop through all imageStatuses
			for (var property in imagesLoader.imageStatus) {
				if (imagesLoader.imageStatus.hasOwnProperty(property)) {
					// halt on error
					if (imagesLoader.imageStatus[property] == 3) {
						imagesLoader_status = 3;
						break;
					} else if (imagesLoader.imageStatus[property] == 1) {
						imagesLoader_status = 1;
					}
				}
			}
			// check if there was any error
			if (imagesLoader_status == 3) {
				clearInterval(imageLoader_interval);
				main('check-images-error');
			} else if (imagesLoader_status == 2) {
				clearInterval(imageLoader_interval);
				main('check-images-ok');
			}
		}, 1000);

		break;
	case 'check-images-error':
		$('#black-screen > div').fadeOut(300, function() {
			$('#black-screen .loading-icon').attr({
				'src': 'img/loading-failed.png',
				'alt': 'Loading failed icon'
			});
			$('#black-screen > div').append('<p>Error – can\'t load all images.</p>').css({
				'padding-top': '40px'
			}).fadeIn(300);
		});

		break;
	case 'check-images-ok':
	case 'controls':
		// controls
		controls = new Controls();

		$(document).keydown(function (e) {
			switch(e.which) {
			case controls.keys.up:
			case controls.keys.up_alt:
				controls.keysDown.up = true;
				break;
			case controls.keys.down:
			case controls.keys.down_alt:
				controls.keysDown.down = true;
				break;
			case controls.keys.right:
			case controls.keys.right_alt:
				controls.keysDown.right = true;
				break;
			case controls.keys.left:
			case controls.keys.left_alt:
				controls.keysDown.left = true;
				break;
			}
		});

		$(document).keyup(function (e) {
			switch(e.which) {
			case controls.keys.up:
			case controls.keys.up_alt:
				controls.keysDown.up = false;
				break;
			case controls.keys.down:
			case controls.keys.down_alt:
				controls.keysDown.down = false;
				break;
			case controls.keys.right:
			case controls.keys.right_alt:
				controls.keysDown.right = false;
				break;
			case controls.keys.left:
			case controls.keys.left_alt:
				controls.keysDown.left = false;
				break;
			}
		});

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

	case 'map':
		map = new Map(canvas.context['map']);
		map.draw(imagesLoader.image['map']);

	case 'player':
		player = new Player();
		player.width = imagesLoader.image['player'].width;
		player.height = imagesLoader.image['player'].height;
		player.posHor = (canvas.canvas['player'].width - player.width) / 2;
		player.posVer = (canvas.canvas['player'].height - player.height) / 2;

	case 'hud':
		hud = new Hud(canvas.context['hud']);
		hud.draw();

	case 'drawing-loop':
		var drawing_loop = setInterval(function () {
			fps = hud.fpsCounter.getValue();
			speed = player.speed / fps;

			canvas.context['player'].clearRect(
				player.posHor - 1,
				player.posVer - 1,
				player.posHor + player.width + 1,
				player.posVer + player.height + 1
			);

			if (controls.keysDown.up)
				player.posVer -= speed;
			if (controls.keysDown.down)
				player.posVer += speed;
			if (controls.keysDown.right)
				player.posHor += speed;
			if (controls.keysDown.left)
				player.posHor -= speed;

			if (player.posHor < 0)
				player.posHor = 0;
			else if (player.posHor > canvas.canvas['player'].width - player.width)
				player.posHor = canvas.canvas['player'].width - player.width;
			if (player.posVer < 0)
				player.posVer = 0;
			else if (player.posVer > canvas.canvas['player'].height - player.height)
				player.posVer = canvas.canvas['player'].height - player.height;

			canvas.context['player'].drawImage(imagesLoader.image['player'], parseInt(player.posHor), parseInt(player.posVer), player.width, player.height);

			hud.resetTextStyle();
			canvas.context['hud'].clearRect(0, 0, 320, 40);
			canvas.context['hud'].fillStyle = 'rgba(0, 127, 127, .98)';
			canvas.context['hud'].fillRect(0, 0, 320, 20);
			canvas.context['hud'].fillStyle = '#fff';
			canvas.context['hud'].fillText('DEBUG '+ fps.toFixed(4) + ' fps', 6, 2);
		}, 16); // locked on max 62.5 fps = 1000/16

	case 'resize-event':
		$(window).resize(function () {
//			canvas.context['hud'].clearRect(0, 0, canvas.canvas['hud'].width, canvas.canvas['hud'].height);
			canvas.resizeAll();
			map.draw(imagesLoader.image['map']);
			hud.draw();
		});


	case 'done':
		loadingScreen.fadeOut();
	}
}

$(document).ready(function () {
	main();
});

