var Puzzle = require('./Puzzle');
var Controls = require('./Controls');

// Create puzzle instance.
let puzzle = new Puzzle({
	$container: $('#puzzle'),
	size: 3,
});

// Render controls.
m.mount(
	document.getElementById('controls'),
	m.component(Controls, {puzzle: puzzle})
);
