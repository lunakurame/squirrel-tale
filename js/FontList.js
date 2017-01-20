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
		 * 	image-*: pointer to image resource, * is variant, multiple of images are allowed
		 * 	json: pointer to json resource
		 * }
		 */
	};
	this.defaultMarginX = 1;
	this.defaultMarginY = 4;
};

FontList.prototype.load = function () {
	// get canvas
	this.canvas  = this.app.canvasList.canvases['hud'];
	this.context = this.app.canvasList.contexts['hud'];

	// find loaded fonts
	for (var i in this.app.resourceLoader.resources) {
		var res = this.app.resourceLoader.resources[i];
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
			this.fonts[res.name]['image-' + res.variant] = res.file;
	}
};

FontList.prototype.draw = function (text, fontName, fontVariant, posX, posY, marginX = this.defaultMarginX, marginY = this.defaultMarginY) {
	// keep in sync with getTextSize()

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
			font['image-' + fontVariant],
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

FontList.prototype.getTextSize = function (text, fontName, marginX = this.defaultMarginX, marginY = this.defaultMarginY) {
	// keep in sync with draw()

	var font = this.fonts[fontName];
	var pX = 0;
	var pY = 0;
	var maxWidth = 0;
	var maxHeight = 0;

	for (var i in text) {
		var c = text[i];

		if (c == '\n') {
			pX = 0;
			pY += font.json.height + marginY;
			continue;
		}

		if (typeof font.json.chars[c] === 'undefined')
			c = ' ';

		pX += font.json.chars[c].width + marginX;

		if (pX > maxWidth)
			maxWidth = pX;
		if (pY > maxHeight)
			maxHeight = pY;
	}

	var result = {};
	result.width = maxWidth - marginX;
	result.height = maxHeight + font.json.height;
	return result;
}
