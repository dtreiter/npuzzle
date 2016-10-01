var App = require('./App');

// Use `location.hash` (i.e. #) routing convention.
m.route.mode = 'hash';

// Render controls.
m.route(document.getElementById('controls'), '/', {
	'/': App
});
