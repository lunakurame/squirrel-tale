// prototype: Player ///////////////////////////////////////////////////////////

var Player = function (application, name, variant) {
	console.log('Player instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Player: constructor: application is required');

	this.app = application;
	this.name = name;
	this.variant = variant;
	this.fullName = name + (typeof variant === 'undefined' ? '' : '-' + variant);
	this.data;	// JSON resource
	this.image;	// Image resource
	this.canvas;
	this.context;

	this.speed = 0;
	this.moving = false;
	this.direction = this.app.config.player.direction.down;
	this.frame = 0;
	this.posX = 80;	// TODO load from the map file
	this.posY = 100;

	this.movingAnimationInterval;
};

Player.prototype.clear = function () {
	this.context.clearRect(
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		parseInt(this.posX + this.data.file.width),
		parseInt(this.posY + this.data.file.height)
	);
};

Player.prototype.draw = function () {
	this.context.drawImage(
		this.image.file,
		// crop image:
		this.frame * this.data.file.width,
		this.direction * this.data.file.height,
		this.data.file.width,
		this.data.file.height,
		// draw at position:
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		this.data.file.width,
		this.data.file.height
	);

	// drawing collision boxes
	if (this.app.config.debug.collisions.draw) {
		this.context.fillStyle = this.app.config.debug.collisions.color;
		this.context.fillRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) + this.data.file.collisions[0].posX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop) + this.data.file.collisions[0].posY,
			this.data.file.collisions[0].width,
			this.data.file.collisions[0].height
		);
	}
};

Player.prototype.react = function (speed, resizeWindow) {
	// pointer for nested functions
	var parent_obj = this;

	var isKeyDown = function (key) {
		switch (key) {
		case 'up':
			return (parent_obj.app.controls.keysDown.up && !parent_obj.app.controls.keysDown.down);
		case 'down':
			return (parent_obj.app.controls.keysDown.down && !parent_obj.app.controls.keysDown.up);
		case 'right':
			return (parent_obj.app.controls.keysDown.right && !parent_obj.app.controls.keysDown.left);
		case 'left':
			return (parent_obj.app.controls.keysDown.left && !parent_obj.app.controls.keysDown.right);
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
		this.posY < this.app.map.image.file.height - this.data.file.height
	);
	var moving_right = (
		isKeyDown('right') &&
		this.posX < this.app.map.image.file.width - this.data.file.width
	);
	var moving_left = (
		isKeyDown('left') &&
		this.posX > 0
	);

	this.moving = (moving_up || moving_down || moving_right || moving_left);

	if (this.moving || resizeWindow) {
		// if player just started moving (wasn't moving a cycle before)
		if (typeof this.movingAnimationInterval === 'undefined') {
			// player animations
			this.movingAnimationInterval = setInterval(function () {
				++parent_obj.frame;
				if (parent_obj.frame > parent_obj.data.file.framesCount - 1)
					parent_obj.frame = 0;
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
		if (isKeyDown('right') && this.posX < this.app.map.image.file.width - this.data.file.width) {
			this.posX += speed;
		} else if (isKeyDown('left') && this.posX > 0) {
			this.posX -= speed;
		}
		if (isKeyDown('up') && this.posY > 0) {
			this.posY -= speed;
		} else if (isKeyDown('down') && this.posY < this.app.map.image.file.height - this.data.file.height) {
			this.posY += speed;
		}

		// fix position in case player is not within borders
		if (this.posX < 0)
			this.posX = 0;
		else if (this.posX > this.app.map.image.file.width - this.data.file.width)
			this.posX = this.app.map.image.file.width - this.data.file.width;
		if (this.posY < 0)
			this.posY = 0;
		else if (this.posY > this.app.map.image.file.height - this.data.file.height)
			this.posY = this.app.map.image.file.height - this.data.file.height;

		// fix position in case player is violating some collisions
		for (var i in this.app.map.entities) {
			if (this.app.map.entities[i].enableCollisions === false)
				continue;
			for (var j in this.app.map.entities[i].data.file.collisions) {
				var entity = this.app.map.entities[i];
				var collision = entity.data.file.collisions[j];

				var collides_horizontally = (
					this.posX + this.data.file.collisions[0].posX > entity.posX + collision.posX - this.data.file.collisions[0].width &&
					this.posX + this.data.file.collisions[0].posX < entity.posX + collision.posX + collision.width
				);
				var collides_vertically = (
					this.posY + this.data.file.collisions[0].posY > entity.posY + collision.posY - this.data.file.collisions[0].height &&
					this.posY + this.data.file.collisions[0].posY < entity.posY + collision.posY + collision.height
				);

				// player collides an entity only if collides it both horizontally and vertically
				if (collides_horizontally && collides_vertically) {
					// check if player collided it a move ago too
					var collided_horizontally = (
						old_player_posX + this.data.file.collisions[0].posX > entity.posX + collision.posX - this.data.file.collisions[0].width &&
						old_player_posX + this.data.file.collisions[0].posX < entity.posX + collision.posX + collision.width
					);
					var collided_vertically = (
						old_player_posY + this.data.file.collisions[0].posY > entity.posY + collision.posY - this.data.file.collisions[0].height &&
						old_player_posY + this.data.file.collisions[0].posY < entity.posY + collision.posY + collision.height
					);

					// move player's position if necessary, also fix direction and moving animation
					if (isKeyDown('right') && collides_vertically && collided_vertically) {
						this.posX = entity.posX + collision.posX - this.data.file.collisions[0].width - this.data.file.collisions[0].posX;
						if (isKeyDown('up'))
							this.direction = this.app.config.player.direction.up;
						else if (isKeyDown('down'))
							this.direction = this.app.config.player.direction.down;
						else
							this.moving = false;
					} else if (isKeyDown('left') && collides_vertically && collided_vertically) {
						this.posX = entity.posX + collision.posX + collision.width - this.data.file.collisions[0].posX;
						if (isKeyDown('up'))
							this.direction = this.app.config.player.direction.up;
						else if (isKeyDown('down'))
							this.direction = this.app.config.player.direction.down;
						else
							this.moving = false;
					} else if (isKeyDown('up') && collides_horizontally && collided_horizontally) {
						this.posY = entity.posY + collision.posY + collision.height - this.data.file.collisions[0].posY;
						if (isKeyDown('right'))
							this.direction = this.app.config.player.direction.right;
						else if (isKeyDown('left'))
							this.direction = this.app.config.player.direction.left;
						else
							this.moving = false;
					} else if (isKeyDown('down') && collides_horizontally && collided_horizontally) {
						this.posY = entity.posY + collision.posY - this.data.file.collisions[0].height - this.data.file.collisions[0].posY;
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

		// remember current map position
		var old_map_left = this.app.map.left;
		var old_map_top = this.app.map.top;

		// center the player (actually move the map so the player is in the center, even if the map position is wrong)
		this.app.map.top = this.posY - ((this.app.canvasList.canvas['player'].height - this.data.file.height) / 2);
		this.app.map.left = this.posX - ((this.app.canvasList.canvas['player'].width - this.data.file.width) / 2);

// that's the old code responsible for moving the map
// it is save to remove it
//		if (
//			moving_up &&
//			(this.posY - this.app.map.top <= (this.app.canvasList.canvas['player'].height - this.data.file.height) / 2) &&
//			(this.app.map.top > 0)
//		) {
//			this.app.map.top = this.posY - ((this.app.canvasList.canvas['player'].height - this.data.file.height) / 2);
//		} else if (
//			moving_down &&
//			(this.posY - this.app.map.top >= (this.app.canvasList.canvas['player'].height - this.data.file.height) / 2) &&
//			(this.app.map.top < this.app.map.image.file.height - this.app.canvasList.canvas['player'].height)
//		) {
//			this.app.map.top = this.posY - ((this.app.canvasList.canvas['player'].height - this.data.file.height) / 2);
//		}
//		if (
//			moving_right &&
//			(this.posX - this.app.map.left >= (this.app.canvasList.canvas['player'].width - this.data.file.width) / 2) &&
//			(this.app.map.left < this.app.map.image.file.width - this.app.canvasList.canvas['player'].width)
//		) {
//			this.app.map.left = this.posX - ((this.app.canvasList.canvas['player'].width - this.data.file.width) / 2);
//		} else if (
//			moving_left &&
//			(this.posX - this.app.map.left <= (this.app.canvasList.canvas['player'].width - this.data.file.width) / 2) &&
//			(this.app.map.left > 0)
//		) {
//			this.app.map.left = this.posX - ((this.app.canvasList.canvas['player'].width - this.data.file.width) / 2);
//		}

		// fix map position in case map is not within canvas' borders
		if (this.app.map.top < 0)
			this.app.map.top = 0;
		else if (this.app.map.top > this.app.map.image.file.height - this.app.canvasList.canvas['player'].height + (2 * this.app.map.marginTop))
			this.app.map.top = this.app.map.image.file.height - this.app.canvasList.canvas['player'].height + (2 * this.app.map.marginTop);
		if (this.app.map.left < 0)
			this.app.map.left = 0;
		else if (this.app.map.left > this.app.map.image.file.width - this.app.canvasList.canvas['player'].width + (2 * this.app.map.marginLeft))
			this.app.map.left = this.app.map.image.file.width - this.app.canvasList.canvas['player'].width + (2 * this.app.map.marginLeft);

		if ((this.app.map.left != old_map_left) || (this.app.map.top != old_map_top))
			this.app.map.draw();

	} else {
		// change direction without moving (e.g. under a wall)
		if ( // skip corners (otherwise they default to horizontal axis, which is bad)
			(isKeyDown('left') && isKeyDown('up') && this.posX <= 0 && this.posY <= 0) ||
			(isKeyDown('left') && isKeyDown('down') && this.posX <= 0 && this.posY >= this.app.map.image.file.height - this.data.file.height) ||
			(isKeyDown('right') && isKeyDown('up') && this.posX >= this.app.map.image.file.width - this.data.file.width && this.posY <= 0) ||
			(isKeyDown('right') && isKeyDown('down') && this.posX >= this.app.map.image.file.width - this.data.file.width && this.posY >= this.app.map.image.file.height - this.data.file.height)
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
