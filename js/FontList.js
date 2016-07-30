// prototype: FontList /////////////////////////////////////////////////////////

var FontList = function (application) {
	console.log('FontList instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('FontList: constructor: application is required');

	// technical
	this.app = application;
	this.canvas;
	this.context;

	// data
	this.fonts = { // READ ONLY!
		/* object-array of {
		 * 	parent: object
		 * 	image: pointer to image resource
		 * 	json: pointer to json resource
		 * }
		 */
	};
};

FontList.prototype.load = function () {
	// get canvas
	this.canvas  = this.app.canvasList.canvas['hud'];
	this.context = this.app.canvasList.context['hud'];

	// find loaded fonts
	for (var i in this.app.resourceLoader.resource) {
		var res = this.app.resourceLoader.resource[i];
		if (res.type != 'font')
			continue;

		// add font (copy pointer)
		if (typeof this.fonts[res.name] === 'undefined') {
			this.fonts[res.name] = {};
			this.fonts[res.name].parent = this;
		}

		if (res.format == 'json')
			this.fonts[res.name].json = res.file;
		else if (res.format == 'image')
			this.fonts[res.name].image = res.file;
	}
};

FontList.prototype.draw = function (text, fontName, posX, posY, marginX = 1, marginY = 4) {
	var font = this.fonts[fontName];
	var pX = posX;
	var pY = posY;

	for (var i in text) {
		var c = text[i];

		if (c == '\n') {
			pX = posX;
			pY += font.json.height + marginY;
			continue;
		}

		// replace nonexisting characters with space (assuming space exists :v)
		if (typeof font.json.chars[c] === 'undefined')
			c = ' '; // potential bug FIXME

		// draw sprite
		this.app.canvasList.render(
			this.context,
			font.image,
			font.json.chars[c].posX,
			font.json.chars[c].posY,
			font.json.chars[c].width,
			font.json.chars[c].height,
			0,
			0,
			// draw at position:
			pX,
			pY,
			font.json.chars[c].width,
			font.json.chars[c].height,
			false,
			false,
			0
		);

		pX += font.json.chars[c].width + marginX;
	}
};
