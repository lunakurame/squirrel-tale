// prototype: Player ///////////////////////////////////////////////////////////

var Player = function (application, name, variant) {
	console.log('Player instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Player: constructor: application is required');

	// technical
	this.app     = application;
	this.name    = name;
	this.variant = variant;
	this.data;    // JSON resource
	this.image;   // Image resource
	this.canvas;
	this.context;

	// from JSON (may be overrided!)
	this.label        = '';
	this.width        = 0;
	this.height       = 0;
	this.collision    = {};
	this.defaultSpeed = 0;
	this.framesCount  = 1;	// TODO [animations] remove

	// from map's JSON (may be overrided!)
	this.posX      = 0;
	this.posY      = 0;
	this.direction = this.app.config.player.direction.down;

	// generated in game
	this.fullName = name + (typeof variant === 'undefined' ? '' : '-' + variant);
	this.moving   = false;
	this.speed    = 0;
	this.frame    = 0;	// TODO [animations] remove
	this.movingAnimationInterval;	// TODO [animations] remove
};

Player.prototype.load = function (data, image) {
	// get resources
	this.data  = data;
	this.image = image;

	// load info from JSON
	this.label        = this.data.file.label;
	this.width        = this.data.file.width;
	this.height       = this.data.file.height;
	this.collision    = $.extend(true, {}, this.data.file.collision);
	this.defaultSpeed = this.data.file.defaultSpeed;
	this.framesCount  = this.data.file.framesCount;	// TODO [animations] remove

	// set speed TODO move somewhere? or not
	this.speed     = this.defaultSpeed;

	// load info from map's JSON
	this.posX      = this.app.map.data.file.entrances['start'].posX - (this.width / 2);
	this.posY      = this.app.map.data.file.entrances['start'].posY - this.height;
	this.direction = this.app.config.player.direction[this.app.map.data.file.entrances['start'].direction];

	// get canvas
	this.canvas  = this.app.canvasList.canvas['player'];
	this.context = this.app.canvasList.context['player'];

	this.react(0, true);
};

Player.prototype.clear = function () {
	this.context.clearRect(
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		parseInt(this.posX + this.width),
		parseInt(this.posY + this.height)
	);
};

Player.prototype.draw = function () {
	this.context.drawImage(
		this.image.file,
		// crop image:
		this.frame * this.width,	// TODO [animations] remove?
		this.direction * this.height,
		this.width,
		this.height,
		// draw at position:
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		this.width,
		this.height
	);

	// drawing collision boxes
	if (this.app.config.debug.collisions.draw) {
		this.context.fillStyle = this.app.config.debug.collisions.color;
		this.context.fillRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) + this.collision.posX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop) + this.collision.posY,
			this.collision.width,
			this.collision.height
		);
	}
};

Player.prototype.react = function (speed, resizeWindow) {
// TODO [animations] lots of things to remove
	// alias for nested functions
	var that = this;
	var isKeyDown = function (key) {
		switch (key) {
		case 'up':
			return ((that.app.controls.keysDown.up || that.app.controls.keysDown.up_alt) &&
			        !(that.app.controls.keysDown.down || that.app.controls.keysDown.down_alt));
		case 'down':
			return ((that.app.controls.keysDown.down || that.app.controls.keysDown.down_alt) &&
			        !(that.app.controls.keysDown.up || that.app.controls.keysDown.up_alt));
		case 'right':
			return ((that.app.controls.keysDown.right || that.app.controls.keysDown.right_alt) &&
			        !(that.app.controls.keysDown.left || that.app.controls.keysDown.left_alt));
		case 'left':
			return ((that.app.controls.keysDown.left || that.app.controls.keysDown.left_alt) &&
			        !(that.app.controls.keysDown.right || that.app.controls.keysDown.right_alt));
		}
	};

	if (!this.moving) {
		// clear moving animation
		clearInterval(this.movingAnimationInterval);
		this.movingAnimationInterval = undefined;
		this.frame = 0;
	}

	// check if player is moving (it doesn't check collisions)
	var moving_up = (
		isKeyDown('up') &&
		this.posY > 0
	);
	var moving_down = (
		isKeyDown('down') &&
		this.posY < this.app.map.height - this.height
	);
	var moving_right = (
		isKeyDown('right') &&
		this.posX < this.app.map.width - this.width
	);
	var moving_left = (
		isKeyDown('left') &&
		this.posX > 0
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

	// react
	switch (mode) {
	case 'moving':
		// if player just started moving (wasn't moving a cycle before)
		if (typeof this.movingAnimationInterval === 'undefined') {
			// player animations
			this.movingAnimationInterval = setInterval(function () {
				++that.frame;
				if (that.frame > that.data.file.framesCount - 1)
					that.frame = 0;
			}, 250);

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
		var old_player_posX = this.posX;
		var old_player_posY = this.posY;

		// move the player
		if (isKeyDown('right') && this.posX < this.app.map.width - this.width) {
			this.posX += speed;
		} else if (isKeyDown('left') && this.posX > 0) {
			this.posX -= speed;
		}
		if (isKeyDown('up') && this.posY > 0) {
			this.posY -= speed;
		} else if (isKeyDown('down') && this.posY < this.app.map.height - this.height) {
			this.posY += speed;
		}

		// fix position in case player is not within borders
		if (this.posX < 0)
			this.posX = 0;
		else if (this.posX > this.app.map.width - this.width)
			this.posX = this.app.map.width - this.width;
		if (this.posY < 0)
			this.posY = 0;
		else if (this.posY > this.app.map.height - this.height)
			this.posY = this.app.map.height - this.height;

		// fix position in case player is violating some collisions
		for (var i in this.app.map.entities) {
			for (var j in this.app.map.entities[i].collisions) {
				var entity = this.app.map.entities[i];
				var collision = entity.collisions[j];

				// ignore off-screen collisions
				if (
					entity.posX > this.app.canvasList.canvas['map'].width + this.app.map.left ||
					entity.posX < this.app.map.left - entity.width ||
					entity.posY > this.app.canvasList.canvas['map'].height + this.app.map.top ||
					entity.posY < this.app.map.top - entity.height
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
				var collides_horizontally = (
					(
						// this part checks if player just stepped on a collision
						this.posX + this.collision.posX > entity.posX + collision.posX - this.collision.width &&
						this.posX + this.collision.posX < entity.posX + collision.posX + collision.width
					) || (
						// this part checks if player just jumped over a collision
						// it is possible to jump over when the game is lagging (low FPS = long jumps)
						// this code detects those jumps
						// (protip: you can emulate low FPS by changing the FPS cap)
						(
							old_player_posX + this.collision.posX + this.collision.width <= entity.posX + collision.posX &&
							this.posX + this.collision.posX >= entity.posX + collision.posX + collision.width
						) || (
							this.posX + this.collision.posX + this.collision.width <= entity.posX + collision.posX &&
							old_player_posX + this.collision.posX >= entity.posX + collision.posX + collision.width
						)
					)
				);
				var collides_vertically = (
					(
						this.posY + this.collision.posY > entity.posY + collision.posY - this.collision.height &&
						this.posY + this.collision.posY < entity.posY + collision.posY + collision.height
					) || (
						(
							old_player_posY + this.collision.posY + this.collision.height <= entity.posY + collision.posY &&
							this.posY + this.collision.posY >= entity.posY + collision.posY + collision.height
						) || (
							this.posY + this.collision.posY + this.collision.height <= entity.posY + collision.posY &&
							old_player_posY + this.collision.posY >= entity.posY + collision.posY + collision.height
						)
					)
				);

				// player collides an entity only if collides it both horizontally and vertically
				if (collides_horizontally && collides_vertically) {
					// check if player collided it a move ago too
					var collided_horizontally = (
						old_player_posX + this.collision.posX > entity.posX + collision.posX - this.collision.width &&
						old_player_posX + this.collision.posX < entity.posX + collision.posX + collision.width
					);
					var collided_vertically = (
						old_player_posY + this.collision.posY > entity.posY + collision.posY - this.collision.height &&
						old_player_posY + this.collision.posY < entity.posY + collision.posY + collision.height
					);

					// move player's position if necessary, also fix direction and moving animation
					if (isKeyDown('right') && collides_vertically && collided_vertically) {
						this.posX = entity.posX + collision.posX - this.collision.width - this.collision.posX;
						if (isKeyDown('up'))
							this.direction = this.app.config.player.direction.up;
						else if (isKeyDown('down'))
							this.direction = this.app.config.player.direction.down;
						else
							this.moving = false;
					} else if (isKeyDown('left') && collides_vertically && collided_vertically) {
						this.posX = entity.posX + collision.posX + collision.width - this.collision.posX;
						if (isKeyDown('up'))
							this.direction = this.app.config.player.direction.up;
						else if (isKeyDown('down'))
							this.direction = this.app.config.player.direction.down;
						else
							this.moving = false;
					} else if (isKeyDown('up') && collides_horizontally && collided_horizontally) {
						this.posY = entity.posY + collision.posY + collision.height - this.collision.posY;
						if (isKeyDown('right'))
							this.direction = this.app.config.player.direction.right;
						else if (isKeyDown('left'))
							this.direction = this.app.config.player.direction.left;
						else
							this.moving = false;
					} else if (isKeyDown('down') && collides_horizontally && collided_horizontally) {
						this.posY = entity.posY + collision.posY - this.collision.height - this.collision.posY;
						if (isKeyDown('right'))
							this.direction = this.app.config.player.direction.right;
						else if (isKeyDown('left'))
							this.direction = this.app.config.player.direction.left;
						else
							this.moving = false;
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
		this.app.map.top = this.posY - ((this.app.canvasList.canvas['player'].height - this.height) / 2);
		this.app.map.left = this.posX - ((this.app.canvasList.canvas['player'].width - this.width) / 2);

		// fix map position in case map is not within canvas' borders
		if (this.app.map.top < 0)
			this.app.map.top = 0;
		else if (this.app.map.top > this.app.map.height - this.app.canvasList.canvas['player'].height + (2 * this.app.map.marginTop))
			this.app.map.top = this.app.map.height - this.app.canvasList.canvas['player'].height + (2 * this.app.map.marginTop);
		if (this.app.map.left < 0)
			this.app.map.left = 0;
		else if (this.app.map.left > this.app.map.width - this.app.canvasList.canvas['player'].width + (2 * this.app.map.marginLeft))
			this.app.map.left = this.app.map.width - this.app.canvasList.canvas['player'].width + (2 * this.app.map.marginLeft);

		// redraw the map, if necessary
		if ((this.app.map.left != old_map_left) || (this.app.map.top != old_map_top))
			this.app.map.draw();

		break;
	case 'direction':
	default:
		// change direction without moving (e.g. next to a canvas border)
		if ( // skip canvas corners (otherwise they default to horizontal axis, which is bad)
			(isKeyDown('left') && isKeyDown('up') && this.posX <= 0 && this.posY <= 0) ||
			(isKeyDown('left') && isKeyDown('down') && this.posX <= 0 && this.posY >= this.app.map.height - this.height) ||
			(isKeyDown('right') && isKeyDown('up') && this.posX >= this.app.map.width - this.width && this.posY <= 0) ||
			(isKeyDown('right') && isKeyDown('down') && this.posX >= this.app.map.width - this.width && this.posY >= this.app.map.height - this.height)
		)
			; // yep, a single semicolon, 'no operation'
			 // (if something doesn't work, you can replace it with $.noop(); or (function(){})();)
		else if (isKeyDown('right'))
			this.direction = this.app.config.player.direction.right;
		else if (isKeyDown('left'))
			this.direction = this.app.config.player.direction.left;
		else if (isKeyDown('up'))
			this.direction = this.app.config.player.direction.up;
		else if (isKeyDown('down'))
			this.direction = this.app.config.player.direction.down;
	}
};
