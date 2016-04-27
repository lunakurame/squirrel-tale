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

	// from JSON (may be overrided!)
	this.label      = '';
	this.width      = 0;
	this.height     = 0;
	this.collisions = [];

	// from map's JSON (may be overrided!)
	this.posX             = 0;
	this.posY             = 0;
	this.posZ             = 'under';
	this.enableAutoPosZ   = true;
	this.enableCollisions = true;
	this.flipImageX       = false;
	this.flipImageY       = false;
	this.flipCollisionsX  = false;
	this.flipCollisionsY  = false;

	// generated on runtime
	this.fullName = name + (typeof variant === 'undefined' ? '' : '-' + variant);
};

Entity.prototype.load = function (mapData, data, image) {
	// get resources
	this.mapData = mapData;
	this.data    = data;
	this.image   = image;

	// load info from map's JSON
	this.posX = this.mapData.posX;
	this.posY = this.mapData.posY;
	this.posZ = this.mapData.posZ;

	if (typeof this.mapData.label === 'undefined')
		;
	else
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
	this.width  = this.data.file.width;
	this.height = this.data.file.height;

	if (typeof this.data.file.collisions !== 'undefined' && this.enableCollisions)
		this.collisions = $.map(this.data.file.collisions, function (obj) {
			return $.extend(true, {}, obj);
		});

	// flip collisions if necessary
	if (this.flipCollisionsX)
		for (var j in this.collisions)
			this.collisions[j].posX = this.width - this.collisions[j].posX - this.collisions[j].width;
	if (this.flipCollisionsY)
		for (var j in this.collisions)
			this.collisions[j].posY = this.height - this.collisions[j].posY - this.collisions[j].height;

	// get canvas
	this.canvas        = this.app.canvasList.canvas['entity_' + this.posZ];
	this.context       = this.app.canvasList.context['entity_' + this.posZ];
	this.canvas_under  = this.app.canvasList.canvas['entity_under'];
	this.context_under = this.app.canvasList.context['entity_under'];
};

Entity.prototype.clear = function () {
	var context = this.isUnder() ? this.context_under : this.context;
	context.clearRect(
		parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
		parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
		parseInt(this.posX + this.width),
		parseInt(this.posY + this.height)
	);
};

Entity.prototype.draw = function () {
	// don't draw off-screen entities
	if (
		this.posX > this.app.canvasList.canvas['map'].width + this.app.map.left ||
		this.posX < this.app.map.left - this.width ||
		this.posY > this.app.canvasList.canvas['map'].height + this.app.map.top ||
		this.posY < this.app.map.top - this.height
	)
		return;

	var context = this.isUnder() ? this.context_under : this.context;

	if (this.flipImageX || this.flipImageY) {
		context.save();
		context.scale(
			this.flipImageX ? -1 : 1,
			this.flipImageY ? -1 : 1
		);
		context.drawImage(
			this.image.file,
			// draw at position:
			this.flipImageX ?
				-parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) :
				 parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
			this.flipImageY ?
				-parseInt(this.posY - this.app.map.top + this.app.map.marginTop) :
				 parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
			this.flipImageX ?
				-this.width :
				 this.width,
			this.flipImageY ?
				-this.height :
				 this.height
		);
		context.restore();
	} else {
		context.drawImage(
			this.image.file,
			// draw at position:
			parseInt(this.posX - this.app.map.left + this.app.map.marginLeft),
			parseInt(this.posY - this.app.map.top + this.app.map.marginTop),
			this.width,
			this.height
		);
	}

	// drawing collision boxes
	if (this.app.config.debug.collisions.draw) {
		context.fillStyle = this.app.config.debug.collisions.color;
		for (var i in this.collisions) {
			context.fillRect(
				parseInt(this.posX - this.app.map.left + this.app.map.marginLeft) + this.collisions[i].posX,
				parseInt(this.posY - this.app.map.top + this.app.map.marginTop) + this.collisions[i].posY,
				this.collisions[i].width,
				this.collisions[i].height
			);
		}
	}
};

Entity.prototype.isUnder = function () {
	return (
		this.posZ == 'under' ||
		this.context == this.context_under ||
		(
			this.enableAutoPosZ &&
			this.app.player.posY > this.posY + this.height - this.app.player.height
		)
	);
};
