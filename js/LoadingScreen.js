// prototype: LoadingScreen ////////////////////////////////////////////////////
//
// This prototype is so wrong *by design*.
// It is supposed to be simple and work even when nothing works.
//

var LoadingScreen = function (application) {
	console.log('LoadingScreen instance created');

//	if (typeof application !== 'object' || application == null)
//		throw Error('LoadingScreen: constructor: application is required');

	// technical
	this.app = application;
};

LoadingScreen.prototype.rotateIcon = function () {
	var that = this;

	var blackScreen = document.querySelector('#black-screen');
	var loadingIcon = document.querySelector('#black-screen .loading-icon');

	// if black screen is visible and is loading, then rotate the loading icon (loop)
	if (blackScreen.style.display !== 'none' && loadingIcon.getAttribute('alt').indexOf('fail') < 0) {
		loadingIcon.classList.add('rotating');
	}
};

LoadingScreen.prototype.fadeIn = function (callback) {
	// turn on black screen
	document.querySelector('#black-screen').classList.remove('hidden');
	setTimeout(callback, 300);
};

LoadingScreen.prototype.fadeOut = function (callback) {
	// turn off black screen
	document.querySelector('#black-screen').classList.add('hidden');
	document.querySelector('#black-screen > div').classList.add('hidden');
	setTimeout(callback, 300);
};

LoadingScreen.prototype.showError = function (message = 'Error – can\'t load all resources.') {
	var div = document.querySelector('#black-screen > div');
	var loadingIcon = document.querySelector('#black-screen .loading-icon');
	var controls = document.querySelector('#black-screen .controls');

	div.classList.add('hidden');
	setTimeout(() => {
		loadingIcon.classList.remove('rotating');
		loadingIcon.classList.add('failed');
		loadingIcon.setAttribute('src', 'data/image/loading-failed.png');
		loadingIcon.setAttribute('alt', 'Loading failed icon');
		controls.style.display = 'none';
		var p = document.createElement('p');
		p.innerHTML = message;
		div.append(p);
		div.style.paddingTop = '40px';
		div.classList.remove('hidden');
	}, 300);
};

LoadingScreen.prototype.startFakingLoading = function () {
	var blackScreen = document.querySelector('#black-screen');
	var div = document.querySelector('#black-screen > div');
	var loadingIcon = document.querySelector('#black-screen .loading-icon');

	blackScreen.classList.remove('hidden');
	div.classList.remove('hidden');
	loadingIcon.classList.add('loading');
};

LoadingScreen.prototype.stopFakingLoading = function () {
	var blackScreen = document.querySelector('#black-screen');
	var div = document.querySelector('#black-screen > div');
	var loadingIcon = document.querySelector('#black-screen .loading-icon');
	var controls = document.querySelector('#black-screen .controls');

	div.classList.add('hidden');
	controls.classList.add('hidden');
	loadingIcon.classList.remove('loading');
	blackScreen.classList.add('hidden');
};
