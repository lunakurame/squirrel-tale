// prototype: Map //////////////////////////////////////////////////////////////

var Map = function (application, name, variant) {
	console.log('Map instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Map: constructor: application is required');

	// technical
	this.app     = application;
	this.name    = name;
	this.variant = variant;
	this.data;    // JSON resource
	this.image;   // Image resource
	this.canvas;
	this.context;

	// from JSON (may be overrided!)
	this.label     = '';
	this.entrances = {};
	this.entities  = [];	// NOT loaded form JSON, Entity objects replace them

	// from image (may be overrided!)
	this.width      = 0;
	this.height     = 0;

	// generated on runtime
	this.fullName   = name + (typeof variant === 'undefined' ? '' : '-' + variant);
	this.left       = 0;
	this.top        = 0;
	this.marginLeft = 0;
	this.marginTop  = 0;
};

Map.prototype.load = function (data, image) {
	// get resources
	this.data  = data;
	this.image = image;

	// load info from JSON
	this.label = this.data.file.label;
	for (var i in this.data.file.entrances)
		this.entrances[i] = $.extend(true, {}, this.data.file.entrances[i]);
// don't copy entities
//	if (typeof this.data.file.entities !== 'undefined')
//		this.entities = $.map(this.data.file.entities, function (obj) {
//			return $.extend(true, {}, obj);
//		});

	// load info from image
	this.width = this.image.file.width;
	this.height = this.image.file.height;

	// get canvas
	this.canvas  = this.app.canvasList.canvas['map'];
	this.context = this.app.canvasList.context['map'];
};

Map.prototype.loadEntities = function () {
	for (var i in this.data.file.entities) {
		this.entities[i] = new Entity(this.app, this.data.file.entities[i].name, this.data.file.entities[i].variant);
		this.app.resourceLoader.loadOnce('json', 'entity', this.entities[i].name);
		this.app.resourceLoader.loadOnce('image', 'entity', this.entities[i].fullName);
	}
	this.app.resourceLoader.waitForAllFiles('init-load-entities-ok', 'init-load-entities-error');
};

Map.prototype.setupEntities = function () {
	for (var i in this.entities) {
		this.entities[i].load(
			this.data.file.entities[i],
			this.app.resourceLoader.resource['json/entity/' + this.entities[i].name],
			this.app.resourceLoader.resource['image/entity/' + this.entities[i].fullName]
		);
	}
};

Map.prototype.draw = function () {
	if (this.canvas.width > this.width) {
		var width = this.width;
		this.marginLeft = (this.canvas.width - width) / 2;
	} else {
		var width = this.canvas.width;
		this.marginLeft = 0;
	}
	
	if (this.canvas.height > this.height) {
		var height = this.height;
		this.marginTop = (this.canvas.height - height) / 2;
	} else {
		var height = this.canvas.height;
		this.marginTop = 0;
	}

	this.context.drawImage(
		this.image.file,
		// crop image:
		parseInt(this.left),
		parseInt(this.top),
		width,
		height,
		// draw at position:
		parseInt(this.marginLeft),
		parseInt(this.marginTop),
		width,
		height
	);
};
