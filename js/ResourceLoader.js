// prototype: ResourceLoader ///////////////////////////////////////////////////

var ResourceLoader = function (application) {
	console.log('ResourceLoader instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('ResourceLoader: constructor: application is required');

	// technical
	this.app = application;
	this.loaderStatus = {
		loading  : 1,
		completed: 2,
		error    : 3
	};

	// data
	this.resources = {
		/* object-array of {
		 * 	id: string
		 * 	parent: object
		 * 	format: json / image
		 * 	type: entity / map / player
		 * 	name:
		 * 	variant:
		 * 	src: DATA_DIR/type/name[-variant].EXTENSION
		 * 	status: loader status
		 * 	file: Image() or {}
		 * }
		 */
	};
};

ResourceLoader.prototype.loadOnce = function (format, type, name, variant) {
	let id = format + '/' + type + '/' + name + (typeof variant === 'undefined' ? '' : '-' + variant);
	if (typeof this.resources[id] === 'undefined')
		this.load(format, type, name, variant);
};

ResourceLoader.prototype.load = function (format, type, name, variant) {
	let file = type + '/' + name + (typeof variant === 'undefined' ? '' : '-' + variant);
	let id = format + '/' + file;
	this.resources[id] = {
		id     : id,
		parent : this,
		format : format,
		type   : type,
		name   : name,
		variant: variant,
		src    : this.app.config.resourcePath + '/' + file
	};
	let resource = this.resources[id];
	console.log('ResourceLoader: loading resource ' + id);

	switch (format) {
	case 'image':
		// add an extension to file
		resource.src += '.png';

		// create new Image
		resource.file = new Image();
		resource.status = this.loaderStatus.loading;

		resource.file.onload = () => {
			if ('naturalHeight' in this) {
				if (this.naturalHeight + this.naturalWidth === 0) {
					this.onerror();
					return;
				}
			} else if (this.width + this.height == 0) {
				this.onerror();
				return;
			}

			resource.status = this.loaderStatus.completed;
		};

		resource.file.onerror = () => {
			resource.status = this.loaderStatus.error;
		};

		// load the image
		resource.file.src = resource.src;

		break;
	case 'json':
	default:
		// add an extension to file
		resource.src += '.json';

		resource.status = this.loaderStatus.loading;

		// load the file
		$.getJSON(resource.src, json => {
			resource.file = json;
			resource.status = this.loaderStatus.completed;
		}).fail(() => {
			resource.status = this.loaderStatus.error;
		});

		break;
	}
};

ResourceLoader.prototype.waitForAllFiles = function (callback_ok, callback_error) {
	// check if all files finished loading
	let waitingInterval = setInterval(() => {
		let status = this.loaderStatus.completed;
		for (let id in this.resources) {
			if (this.resources[id].status === this.loaderStatus.error) {
				status = this.loaderStatus.error;
				break;
			} else if (this.resources[id].status === this.loaderStatus.loading) {
				status = this.loaderStatus.loading;
			}
		}

		// check if there was any error
		if (status === this.loaderStatus.error) {
			clearInterval(waitingInterval);
			callback_error();
		} else if (status === this.loaderStatus.completed) {
			clearInterval(waitingInterval);
			callback_ok();
		}
	}, 100);
};
