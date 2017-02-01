// prototype: Player ///////////////////////////////////////////////////////////

var Player = function (application, name, variant) {
	console.log('Player instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Player: constructor: application is required');

	// technical
	this.app     = application;
	this.name    = name;
	this.variant = variant;
	this.entrances; // entrances from Map JSON file
	this.data;      // JSON resource
	this.image;     // Image resource
	this.canvas;
	this.context;
	this.queue = [];

	// from JSON (may be overrided!)
	this.label        = '';
	this.defaults     = {};
	this.views        = {};
	this.nuts         = [];
	this.defaultSpeed = 0;
	this.framesCount  = 1;	// TODO [animations] remove

	// from map's JSON (may be overrided!)
	// this.label = [see 'from JSON']
	this.posX      = 0;
	this.posY      = 0;
	this.view      = 'master';
	this.frame     = 0;
	this.direction = this.app.config.player.direction.down;

	// generated on runtime
	this.fullName   = name + (typeof variant === 'undefined' ? '' : '-' + variant);
	this.realView   = 'master';
	this.cropX      = 0;	// -\ 
	this.cropY      = 0;	//  |
	this.cropWidth  = 0;	//  |
	this.cropHeight = 0;	//  |
	this.width      = 0;	//   > these things are loaded from views, see this.setView()
	this.height     = 0;	//  |
	this.centerX    = 0;	//  |
	this.centerY    = 0;	//  |
	this.collisions = [];	// -/
	this.moving     = false;
	this.speed      = 0;
	this.movingAnimationInterval;	// TODO [animations] remove
	this.tryingToMoveVert = 'none'; // modified by Controls event
	this.tryingToMoveHorz = 'none'; // modified by Controls event
	this.stats = {
		hp: 10,
		xp: 0
	};
};

Player.prototype.load = function (entrances, data, image) {
	// get resources
	this.entrances = entrances;
	this.data      = data;
	this.image     = image;

	// load info from map's JSON
	this.posX      = this.entrances['start'].posX;
	this.posY      = this.entrances['start'].posY;
	this.view      = this.entrances['start'].view;
	this.frame     = this.entrances['start'].frame;
	this.direction = this.app.config.player.direction[this.entrances['start'].direction];

	// load JSON overrides
	this.label = (typeof this.entrances.label === 'undefined' ? this.data.file.label : this.entrances.label);

	// load info from JSON
	//this.label = [see JSON overrides]
	this.defaultSpeed = this.data.file.defaultSpeed;
	this.framesCount  = this.data.file.framesCount;	// TODO [animations] remove
	this.defaults     = tools.cloneJson(this.data.file.defaults);

	this.views = {};
	for (let i in this.data.file.views) {
		this.views[i] = [];
		this.data.file.views[i].forEach(frame =>
			this.views[i].push(Object.assign(
				{},
				tools.cloneJson(this.defaults),
				tools.cloneJson(this.data.file.views[i][0]),
				tools.cloneJson(frame)
			))
		);
	}

	if (typeof this.data.file.nuts !== 'undefined')
		this.nuts = tools.cloneJson(this.data.file.nuts);

	// set view and frame
	this.setView();

	// set speed TODO move somewhere? or not
	this.speed = this.defaultSpeed;

	// get canvas
	this.canvas  = this.app.canvasList.canvases['player'];
	this.context = this.app.canvasList.contexts['player'];

	this.react(0, true);
};

Player.prototype.execQueue = function () {
	while (this.queue.length > 0) {
		this.queue[0]();
		this.queue.splice(0, 1);
	}
};

Player.prototype.setView = function (view, frame) {
	// set view and frame
	if (typeof view !== 'undefined')
		this.view = view;
	if (typeof frame !== 'undefined')
		this.frame = frame;

	// defaults
	if (typeof this.view === 'undefined')
		this.view = 'master';
	if (typeof this.frame === 'undefined')
		this.frame = 0;

	// include direction
	this.realView = this.view;
	switch (this.direction) {
	case this.app.config.player.direction.down:
		this.realView += '-down';
		break;
	case this.app.config.player.direction.up:
		this.realView += '-up';
		break;
	case this.app.config.player.direction.right:
		this.realView += '-right';
		break;
	case this.app.config.player.direction.left:
		this.realView += '-left';
		break;
	}

	// get pointer to frame
	var framePointer = this.views[this.realView][this.frame];

	// set data
	this.cropX      = framePointer.cropX;
	this.cropY      = framePointer.cropY;
	this.cropWidth  = framePointer.cropWidth;
	this.cropHeight = framePointer.cropHeight;
	this.width      = framePointer.width;
	this.height     = framePointer.height;
	this.centerX    = framePointer.centerX;
	this.centerY    = framePointer.centerY;
	if (typeof framePointer.collisions !== 'undefined')
		this.collisions = $.map(framePointer.collisions, function (obj) {
			return $.extend(true, {}, obj);
		});
};

Player.prototype.setFrame = function (frame) {
	this.setView(undefined, frame);
};

Player.prototype.clear = function () {
	// clear sprite
	this.app.canvasList.render(
		this.context,
		'clear',
		0,
		0,
		this.width,
		this.height,
		this.centerX,
		this.centerY,
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		this.width,
		this.height,
		this.flipImageX,
		this.flipImageY,
		this.rotate
	);

	// debug mode - clear ghost sprite
	if (this.app.config.debug.enabled && this.app.config.debug.objects.draw && (this.flipImageX || this.flipImageY || this.rotate != 0))
		this.context.clearRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - this.centerX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop) - this.centerY,
			this.width,
			this.height
		);
};

Player.prototype.draw = function () {
	// draw sprite
	this.app.canvasList.render(
		this.context,
		this.image.file,
		this.cropX,
		this.cropY,
		this.cropWidth,
		this.cropHeight,
		this.centerX,
		this.centerY,
		// draw at position:
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		this.width,
		this.height
	);

	// debug mode - draw collision boxes
	if (this.app.config.debug.enabled && this.app.config.debug.collisions.draw) {
		this.context.fillStyle = this.app.config.debug.collisions.color;
		for (var i in this.collisions) {
			this.context.fillRect(
				parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - this.centerX + this.collisions[i].posX,
				parseInt(this.posY - this.app.map.top + this.app.map.marginTop) - this.centerY + this.collisions[i].posY,
				this.collisions[i].width,
				this.collisions[i].height
			);
		}
	}

	// debug mode - draw object boxes
	if (this.app.config.debug.enabled && this.app.config.debug.objects.draw) {
		// ghost sprite
		this.context.fillStyle = this.app.config.debug.objects.ghostColor;
		this.context.fillRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - this.centerX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop) - this.centerY,
			this.width,
			this.height
		);
		// normal sprite
		this.context.fillStyle = this.app.config.debug.objects.color;
		this.app.canvasList.render(
			this.context,
			'fill',
			0,
			0,
			this.width,
			this.height,
			this.centerX,
			this.centerY,
			// draw at position:
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
			this.width,
			this.height
		);
	}

	// debug mode - draw center
	if (this.app.config.debug.enabled && this.app.config.debug.centers.draw) {
		this.context.fillStyle = this.app.config.debug.centers.color;
		this.context.fillRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
			1,
			1
		);
	}
};

Player.prototype.react = function (speed, resizeWindow) {
// TODO [animations] lots of things to remove
	if (!this.moving) {
		// clear moving animation
		clearInterval(this.movingAnimationInterval);
		this.movingAnimationInterval = undefined;
		this.frame = 0;
		this.setView();
	}

	// check if player is moving (it doesn't check collisions)
	var moving_up = (
		this.tryingToMoveVert === 'up' &&
		this.posY - this.centerY > 0
	);
	var moving_down = (
		this.tryingToMoveVert === 'down' &&
		this.posY - this.centerY < this.app.map.height - this.height
	);
	var moving_right = (
		this.tryingToMoveHorz === 'right' &&
		this.posX - this.centerX < this.app.map.width - this.width
	);
	var moving_left = (
		this.tryingToMoveHorz === 'left' &&
		this.posX - this.centerX > 0
	);

	this.moving = (moving_up || moving_down || moving_right || moving_left);

	// get mode (reaction type)
	var mode;
	if (this.moving)
		mode = 'moving';
	else if (resizeWindow)
		mode = 'resize';
	else
		mode = 'direction';

	// remember current direction to reload frame in case it changes
	old_direction = this.direction;

	// react
	switch (mode) {
	case 'moving':
		// if player just started moving (wasn't moving a cycle before)
		if (typeof this.movingAnimationInterval === 'undefined') {
			// player animations
			this.frame = 1;
			this.setView();
			this.movingAnimationInterval = setInterval(function () {
				++this.frame;
				if (this.frame > this.data.file.framesCount - 1)
					this.frame = 0;
				this.setView();
			}.bind(this), 250);

			// set direction
			// in case horizontal and vertical direction is pressed at the same time,
			// the horizontal one is prefered
			if (moving_right)
				this.direction = this.app.config.player.direction.right;
			else if (moving_left)
				this.direction = this.app.config.player.direction.left;
			else if (moving_up)
				this.direction = this.app.config.player.direction.up;
			else if (moving_down)
				this.direction = this.app.config.player.direction.down;
		} else {
			// check if the direction is still okay
			if ((this.direction == this.app.config.player.direction.right) && (!moving_right)) {
				if (moving_left)
					this.direction = this.app.config.player.direction.left;
				else if (moving_up)
					this.direction = this.app.config.player.direction.up;
				else if (moving_down)
					this.direction = this.app.config.player.direction.down;
			} else if ((this.direction == this.app.config.player.direction.left) && (!moving_left)) {
				if (moving_right)
					this.direction = this.app.config.player.direction.right;
				else if (moving_up)
					this.direction = this.app.config.player.direction.up;
				else if (moving_down)
					this.direction = this.app.config.player.direction.down;
			} else if ((this.direction == this.app.config.player.direction.up) && (!moving_up)) {
				if (moving_down)
					this.direction = this.app.config.player.direction.down;
				else if (moving_right)
					this.direction = this.app.config.player.direction.right;
				else if (moving_left)
					this.direction = this.app.config.player.direction.left;
			} else if ((this.direction == this.app.config.player.direction.down) && (!moving_down)) {
				if (moving_up)
					this.direction = this.app.config.player.direction.up;
				else if (moving_right)
					this.direction = this.app.config.player.direction.right;
				else if (moving_left)
					this.direction = this.app.config.player.direction.left;
			}
		}

		// remember current position (for collisions)
		var old_player_posX = this.posX - this.centerX;
		var old_player_posY = this.posY - this.centerY;

		// move the player
		if (this.tryingToMoveHorz === 'right' && this.posX - this.centerX < this.app.map.width - this.width) {
			this.posX += speed;
		} else if (this.tryingToMoveHorz === 'left' && this.posX - this.centerX > 0) {
			this.posX -= speed;
		}
		if (this.tryingToMoveVert === 'up' && this.posY - this.centerY > 0) {
			this.posY -= speed;
		} else if (this.tryingToMoveVert === 'down' && this.posY - this.centerY < this.app.map.height - this.height) {
			this.posY += speed;
		}

		// fix position in case player is not within borders
		if (this.posX - this.centerX < 0)
			this.posX = this.centerX;
		else if (this.posX - this.centerX > this.app.map.width - this.width)
			this.posX = this.app.map.width - this.width + this.centerX;
		if (this.posY - this.centerY < 0)
			this.posY = this.centerY;
		else if (this.posY - this.centerY > this.app.map.height - this.height)
			this.posY = this.app.map.height - this.height + this.centerY;

		// fix position in case player is violating some collisions
		for (var i in this.app.map.entities) {
			for (var j in this.app.map.entities[i].collisions) {
				var entity = this.app.map.entities[i];
				var collision = entity.collisions[j];

				// ignore off-screen collisions
				if (
					entity.posX - entity.centerX > this.app.canvasList.canvases['map'].width + this.app.map.left ||
					entity.posX + entity.centerX < this.app.map.left - entity.width ||
					entity.posY - entity.centerY > this.app.canvasList.canvases['map'].height + this.app.map.top ||
					entity.posY + entity.centerY < this.app.map.top - entity.height
				)
					break;

				// detect collisions
				// the following instructions (collides_horizontally, collides_vertically, collided_horizontally and collided_vertically)
				// are probably possible to simplify, but I barely understand what I just wrote
				// in practice, they seem to work, though
				// don't touch it unless you really know what you're doing
				// don't forget to test all your modifications in normal environment (high FPS)
				// and low FPS (e.g. set FPS cap to 4 FPS and check if it's still working)
				// note that the narrower the collisions, the easier to jump over them, so you should test on 1 pixel wide/high collisions

				for (var k in this.collisions) {
					var pcoll = this.collisions[k]; // player's collision

					var collides_horizontally = (
						(
							// this part checks if player just stepped on a collision
							this.posX - this.centerX + pcoll.posX > entity.posX - entity.centerX + collision.posX - pcoll.width &&
							this.posX - this.centerX + pcoll.posX < entity.posX - entity.centerX + collision.posX + collision.width
						) || (
							// this part checks if player just jumped over a collision
							// it is possible to jump over when the game is lagging (low FPS = long jumps)
							// this code detects those jumps
							// (protip: you can emulate low FPS by changing the FPS cap)
							(
								old_player_posX + pcoll.posX + pcoll.width <= entity.posX - entity.centerX + collision.posX &&
								this.posX - this.centerX + pcoll.posX >= entity.posX - entity.centerX + collision.posX + collision.width
							) || (
								this.posX - this.centerX + pcoll.posX + pcoll.width <= entity.posX - entity.centerX + collision.posX &&
								old_player_posX + pcoll.posX >= entity.posX - entity.centerX + collision.posX + collision.width
							)
						)
					);
					var collides_vertically = (
						(
							this.posY - this.centerY + pcoll.posY > entity.posY - entity.centerY + collision.posY - pcoll.height &&
							this.posY - this.centerY + pcoll.posY < entity.posY - entity.centerY + collision.posY + collision.height
						) || (
							(
								old_player_posY + pcoll.posY + pcoll.height <= entity.posY - entity.centerY + collision.posY &&
								this.posY - this.centerY + pcoll.posY >= entity.posY - entity.centerY + collision.posY + collision.height
							) || (
								this.posY - this.centerY + pcoll.posY + pcoll.height <= entity.posY - entity.centerY + collision.posY &&
								old_player_posY + pcoll.posY >= entity.posY - entity.centerY + collision.posY + collision.height
							)
						)
					);

					// player collides an entity only if collides it both horizontally and vertically
					if (collides_horizontally && collides_vertically) {
						// check if player collided it a move ago too
						var collided_horizontally = (
							old_player_posX + pcoll.posX > entity.posX - entity.centerX + collision.posX - pcoll.width &&
							old_player_posX + pcoll.posX < entity.posX - entity.centerX + collision.posX + collision.width
						);
						var collided_vertically = (
							old_player_posY + pcoll.posY > entity.posY - entity.centerY + collision.posY - pcoll.height &&
							old_player_posY + pcoll.posY < entity.posY - entity.centerY + collision.posY + collision.height
						);

						// move player's position if necessary, also fix direction and moving animation
						if (this.tryingToMoveHorz === 'right' && collides_vertically && collided_vertically) {
							this.posX = entity.posX - entity.centerX + collision.posX - pcoll.width - pcoll.posX + this.centerX;
							if (this.tryingToMoveVert === 'up')
								this.direction = this.app.config.player.direction.up;
							else if (this.tryingToMoveVert === 'down')
								this.direction = this.app.config.player.direction.down;
							else
								this.moving = false;
						} else if (this.tryingToMoveHorz === 'left' && collides_vertically && collided_vertically) {
							this.posX = entity.posX - entity.centerX + collision.posX + collision.width - pcoll.posX + this.centerX;
							if (this.tryingToMoveVert === 'up')
								this.direction = this.app.config.player.direction.up;
							else if (this.tryingToMoveVert === 'down')
								this.direction = this.app.config.player.direction.down;
							else
								this.moving = false;
						} else if (this.tryingToMoveVert === 'up' && collides_horizontally && collided_horizontally) {
							this.posY = entity.posY - entity.centerY + collision.posY + collision.height - pcoll.posY + this.centerY;
							if (this.tryingToMoveHorz === 'right')
								this.direction = this.app.config.player.direction.right;
							else if (this.tryingToMoveHorz === 'left')
								this.direction = this.app.config.player.direction.left;
							else
								this.moving = false;
						} else if (this.tryingToMoveVert === 'down' && collides_horizontally && collided_horizontally) {
							this.posY = entity.posY - entity.centerY + collision.posY - pcoll.height - pcoll.posY + this.centerY;
							if (this.tryingToMoveHorz === 'right')
								this.direction = this.app.config.player.direction.right;
							else if (this.tryingToMoveHorz === 'left')
								this.direction = this.app.config.player.direction.left;
							else
								this.moving = false;
						}

						if (!this.moving) {
							this.frame = 0;
							this.setView();
						}
					}
				}
			}
		}

		// no break here!
	case 'resize':
		// remember current map position (to know if the map requires redrawing)
		var old_map_left = this.app.map.left;
		var old_map_top = this.app.map.top;

		// center the player (actually move the map so the player is in the center, even if the map position is wrong)
		this.app.map.top = this.posY - this.centerY - ((this.app.canvasList.canvases['player'].height - this.height) / 2);
		this.app.map.left = this.posX - this.centerX - ((this.app.canvasList.canvases['player'].width - this.width) / 2);

		// fix map position in case map is not within canvas' borders
		if (this.app.map.top < 0)
			this.app.map.top = 0;
		else if (this.app.map.top > this.app.map.height - this.app.canvasList.canvases['player'].height + (2 * this.app.map.marginTop))
			this.app.map.top = this.app.map.height - this.app.canvasList.canvases['player'].height + (2 * this.app.map.marginTop);
		if (this.app.map.left < 0)
			this.app.map.left = 0;
		else if (this.app.map.left > this.app.map.width - this.app.canvasList.canvases['player'].width + (2 * this.app.map.marginLeft))
			this.app.map.left = this.app.map.width - this.app.canvasList.canvases['player'].width + (2 * this.app.map.marginLeft);

		// redraw the map, if necessary
		if ((this.app.map.left != old_map_left) || (this.app.map.top != old_map_top))
			this.app.map.draw();

		break;
	case 'direction':
	default:
		// change direction without moving (e.g. next to a canvas border)
		if ( // skip canvas corners (otherwise they default to horizontal axis, which is bad)
			(this.tryingToMoveHorz === 'left' && this.tryingToMoveVert === 'up' && this.posX - this.centerX <= 0 && this.posY - this.centerY <= 0) ||
			(this.tryingToMoveHorz === 'left' && this.tryingToMoveVert === 'down' && this.posX - this.centerX <= 0 && this.posY - this.centerY >= this.app.map.height - this.height) ||
			(this.tryingToMoveHorz === 'right' && this.tryingToMoveVert === 'up' && this.posX - this.centerX >= this.app.map.width - this.width && this.posY - this.centerY <= 0) ||
			(this.tryingToMoveHorz === 'right' && this.tryingToMoveVert === 'down' && this.posX - this.centerX >= this.app.map.width - this.width && this.posY - this.centerY >= this.app.map.height - this.height)
		)
			; // yep, a single semicolon, 'no operation'
			 // (if something doesn't work, you can replace it with $.noop(); or (function(){})();)
		else if (this.tryingToMoveHorz === 'right')
			this.direction = this.app.config.player.direction.right;
		else if (this.tryingToMoveHorz === 'left')
			this.direction = this.app.config.player.direction.left;
		else if (this.tryingToMoveVert === 'up')
			this.direction = this.app.config.player.direction.up;
		else if (this.tryingToMoveVert === 'down')
			this.direction = this.app.config.player.direction.down;
	}

	// load direction's view if it changed
	if (old_direction != this.direction)
		this.setView();
};
