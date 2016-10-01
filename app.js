var Puzzle = require('./Puzzle');
var Controls = require('./Controls');

var App = {
	controller: function() {
		// TODO Make puzzle a mithril component.
		// Create puzzle instance.
		let puzzle = new Puzzle({
			$container: $('#puzzle'),
			size: 3,
		});

		return {
			puzzle: puzzle
		};
	},

	view: function(ctrl) {
		return m.component(Controls, {puzzle: ctrl.puzzle})
	}
};

module.exports = App;
