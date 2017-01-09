// prototype: Entity ///////////////////////////////////////////////////////////

var Entity = function (application, name, variant) {
	console.log('Entity instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Entity: constructor: application is required');

	// technical
	this.app     = application;
	this.name    = name;
	this.variant = variant;
	this.mapData; // entity's object from Map JSON file
	this.data;    // JSON resource
	this.image;   // Image resource
	this.canvas;
	this.context;
	this.canvas_under;
	this.context_under;
	this.queue = [];

	// from JSON (may be overrided!)
	this.label      = '';
	this.views      = {};
	this.animations = [];

	// from map's JSON (may be overrided!)
	// this.label = [see 'from JSON']
	this.posX             = 0;
	this.posY             = 0;
	this.posZ             = 'under';
	this.view             = 'master';
	this.frame            = 0;
	this.rotate           = 0;
	this.enableAutoPosZ   = true;
	this.enableCollisions = true;
	this.flipImageX       = false;
	this.flipImageY       = false;
	this.flipCollisionsX  = false;
	this.flipCollisionsY  = false;

	// generated on runtime
	this.fullName   = name + (typeof variant === 'undefined' ? '' : '-' + variant);
	this.cropX      = 0;	// -\ 
	this.cropY      = 0;	//  |
	this.cropWidth  = 0;	//  |
	this.cropHeight = 0;	//  |
	this.width      = 0;	//   > these things are loaded from views, see this.setFrame()
	this.height     = 0;	//  |
	this.centerX    = 0;	//  |
	this.centerY    = 0;	//  |
	this.collisions = [];	// -/
};

Entity.prototype.load = function (mapData, data, image) {
	// get resources
	this.mapData = mapData;
	this.data    = data;
	this.image   = image;

	// load info from map's JSON
	this.posX   = this.mapData.posX;
	this.posY   = this.mapData.posY;
	this.posZ   = this.mapData.posZ;
	this.view   = this.mapData.view;
	this.frame  = this.mapData.frame;
	this.rotate = (typeof this.mapData.rotate === 'undefined' ? 0 : this.mapData.rotate);

	this.enableAutoPosZ   = this.mapData.enableAutoPosZ   !== false;
	this.enableCollisions = this.mapData.enableCollisions !== false;
	this.flipImageX       = this.mapData.flipImageX       === true;
	this.flipImageY       = this.mapData.flipImageY       === true;
	this.flipCollisionsX  = this.mapData.flipCollisionsX  === true;
	this.flipCollisionsY  = this.mapData.flipCollisionsY  === true;
	//                                                        ^ !default

	// load JSON overrides
	this.label = (typeof this.mapData.label === 'undefined' ? this.data.file.label : this.mapData.label);

	// load info from JSON
	//this.label = [see JSON overrides]

	for (var i in this.data.file.views) {
		this.views[i] = [];
		this.views[i] = $.map(this.data.file.views[i], function (obj) {
			return $.extend(true, {}, obj);
		});
	}
	// XXX ^ this may not clone views[view][frame].collisions, but it seem
	// to work for now...? fix it in case something's wrong

	if (typeof this.data.file.animations !== 'undefined')
		this.animations = $.map(this.data.file.animations, function (obj) {
			return $.extend(true, {}, obj);
		});

	// set frame
	this.setFrame();

	// get canvas
	this.canvas        = this.app.canvasList.canvas['entity_' + this.posZ];
	this.context       = this.app.canvasList.context['entity_' + this.posZ];
	this.canvas_under  = this.app.canvasList.canvas['entity_under'];
	this.context_under = this.app.canvasList.context['entity_under'];
};

Entity.prototype.execQueue = function () {
	while (this.queue.length > 0) {
		this.queue[0]();
		this.queue.splice(0, 1);
	}
};

Entity.prototype.setFrame = function (view, frame) {
	// set view and frame
	if (typeof view !== 'undefined')
		this.view = view;
	if (typeof frame !== 'undefined')
		this.frame = frame;

	if (typeof this.view === 'undefined')
		this.view = 'master';
	if (typeof this.frame === 'undefined')
		this.frame = 0;

	// get pointer to frame
	var framePointer = this.views[this.view][this.frame];

	// set data
	this.cropX      = framePointer.cropX;
	this.cropY      = framePointer.cropY;
	this.cropWidth  = framePointer.cropWidth;
	this.cropHeight = framePointer.cropHeight;
	this.width      = framePointer.width;
	this.height     = framePointer.height;
	this.centerX    = framePointer.centerX;
	this.centerY    = framePointer.centerY;
	if (typeof framePointer.collisions !== 'undefined' && this.enableCollisions)
		this.collisions = $.map(framePointer.collisions, function (obj) {
			return $.extend(true, {}, obj);
		});

	// flip collisions if necessary
	if (this.flipCollisionsX)
		for (var j in this.collisions)
			this.collisions[j].posX = this.centerX - this.collisions[j].width + this.centerX - this.collisions[j].posX;
	if (this.flipCollisionsY)
		for (var j in this.collisions)
			this.collisions[j].posY = this.centerY - this.collisions[j].height + this.centerY - this.collisions[j].posY;
};

Entity.prototype.clear = function () {
	// get context
	var context = this.isUnder() ? this.context_under : this.context;

	// clear sprite
	this.app.canvasList.render(
		context,
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
		context.clearRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - this.centerX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop) - this.centerY,
			this.width,
			this.height
		);
	// debug mode - clear flipped collisions
	if (this.app.config.debug.enabled && this.app.config.debug.collisions.draw && this.flipCollisionsY)
		context.clearRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - this.centerX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
			this.width,
			this.height
		);
};

Entity.prototype.clearDifference = function (oldView, oldFrame, newView, newFrame) {
	var oldFramePointer = this.views[oldView][oldFrame];
	var newFramePointer = this.views[newView][newFrame];

	// get context
	var context = this.isUnder() ? this.context_under : this.context;

	// top slice
	this.app.canvasList.render(
		context,
		'clear',
		0,
		0,
		oldFramePointer.width,
		oldFramePointer.centerY - newFramePointer.centerY,
		oldFramePointer.centerX,
		oldFramePointer.centerY,
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		oldFramePointer.width,
		oldFramePointer.height,
		this.flipImageX,
		this.flipImageY,
		this.rotate
	);
	// bottom slice
	this.app.canvasList.render(
		context,
		'clear',
		0,
		oldFramePointer.centerY + newFramePointer.height - newFramePointer.centerY,
		oldFramePointer.width,
		oldFramePointer.height - (oldFramePointer.centerY + newFramePointer.height - newFramePointer.centerY),
		oldFramePointer.centerX,
		oldFramePointer.centerY,
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		oldFramePointer.width,
		oldFramePointer.height,
		this.flipImageX,
		this.flipImageY,
		this.rotate
	);
	// left slice
	this.app.canvasList.render(
		context,
		'clear',
		0,
		oldFramePointer.centerY - newFramePointer.centerY,
		oldFramePointer.centerX - newFramePointer.centerX,
		newFramePointer.height,
		oldFramePointer.centerX,
		oldFramePointer.centerY,
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		oldFramePointer.width,
		oldFramePointer.height,
		this.flipImageX,
		this.flipImageY,
		this.rotate
	);
	// right slice
	this.app.canvasList.render(
		context,
		'clear',
		oldFramePointer.centerX + (newFramePointer.width - newFramePointer.centerX),
		oldFramePointer.centerY - newFramePointer.centerY,
		(oldFramePointer.width - oldFramePointer.centerX) - (newFramePointer.width - newFramePointer.centerX),
		newFramePointer.height,
		oldFramePointer.centerX,
		oldFramePointer.centerY,
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		oldFramePointer.width,
		oldFramePointer.height,
		this.flipImageX,
		this.flipImageY,
		this.rotate
	);

	// debug mode - clear ghost sprite
	if (this.app.config.debug.enabled && this.app.config.debug.objects.draw && (this.flipImageX || this.flipImageY || this.rotate != 0))
		context.clearRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - oldFramePointer.centerX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop) - oldFramePointer.centerY,
			oldFramePointer.width,
			oldFramePointer.height
		);
	// debug mode - clear flipped collisions
	if (this.app.config.debug.enabled && this.app.config.debug.collisions.draw && this.flipCollisionsY)
		context.clearRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - oldFramePointer.centerX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
			oldFramePointer.width,
			oldFramePointer.height
		);
};

Entity.prototype.draw = function () {
	// don't draw off-screen entities
	if (
		this.posX - this.centerX > this.app.canvasList.canvas['map'].width + this.app.map.left ||
		this.posX + this.centerX < this.app.map.left - this.width ||
		this.posY - this.centerY > this.app.canvasList.canvas['map'].height + this.app.map.top ||
		this.posY + this.centerY < this.app.map.top - this.height
	)
		return;

	// get context
	var context = this.isUnder() ? this.context_under : this.context;

	// draw sprite
	this.app.canvasList.render(
		context,
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
		this.height,
		this.flipImageX,
		this.flipImageY,
		this.rotate
	);

	// debug mode - draw collision boxes
	if (this.app.config.debug.enabled && this.app.config.debug.collisions.draw) {
		context.fillStyle = this.app.config.debug.collisions.color;
		for (var i in this.collisions) {
			context.fillRect(
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
		context.fillStyle = this.app.config.debug.objects.ghostColor;
		context.fillRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) - this.centerX,
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop) - this.centerY,
			this.width,
			this.height
		);
		// normal sprite
		context.fillStyle = this.app.config.debug.objects.color;
		this.app.canvasList.render(
			context,
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
			this.height,
			this.flipImageX,
			this.flipImageY,
			this.rotate
		);
	}

	// debug mode - draw center
	if (this.app.config.debug.enabled && this.app.config.debug.centers.draw) {
		context.fillStyle = this.app.config.debug.centers.color;
		context.fillRect(
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
			1,
			1
		);
	}
};

Entity.prototype.isUnder = function () {
	return (
		this.posZ == 'under' ||
		this.context == this.context_under ||
		(
			this.enableAutoPosZ &&
			this.app.player.posY > this.posY
		)
	);
};
