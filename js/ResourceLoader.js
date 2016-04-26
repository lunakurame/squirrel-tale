// TODO merge all of these

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
