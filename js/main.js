////////////////////////////////////////////////////////////////////////////////
////////////////  K U R O   H T M L 5   G A M E   E N G I N E  /////////////////
////////////////////////////////////////////////////////////////////////////////
//
// TODO list:
// * insert 'var' before all variables
// * insert a nice comment here
// * animated entities
// * special frames in entities' image for interaction with user
// * fix too wide / long map bug (Map.prototype.draw) when moving
//
////////////////////////////////////////////////////////////////////////////////

//var app; // must be global to be available in event functions

$(document).ready(function () {
	// init application
	var app = new Application();
	app.init('start');
});
