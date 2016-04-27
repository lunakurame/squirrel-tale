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

	// if black screen is visible and is loading, then rotate the loading icon (loop)
	if ($('#black-screen').css('display') != 'none' && $('#black-screen .loading-icon').attr('alt').indexOf('fail') < 0) {
		$('#black-screen .loading-icon').rotate({
			duration: 1000,
			angle: 0,
			animateTo: 180,
			callback: that.rotateIcon
		});
	}
};

LoadingScreen.prototype.fadeIn = function () {
	// turn on black screen
	$('#black-screen').fadeIn();
};

LoadingScreen.prototype.fadeOut = function () {
	// turn off black screen
	$('#black-screen').fadeOut();
};

LoadingScreen.prototype.showError = function (message) {
	$('#black-screen > div').fadeOut(300, function() {
		$('#black-screen .loading-icon').attr({
			'src': 'data/image/loading-failed.png',
			'alt': 'Loading failed icon'
		});
		$('#black-screen > div').append('<p>' + message + '</p>').css({
			'padding-top': '40px'
		}).fadeIn(300);
	});
};
