let Puzzle = require('./Puzzle');
let Controls = require('./Controls');

let App = {
	controller: function() {
		// TODO Make puzzle a mithril component.
		// Create puzzle instance.
		let puzzle = new Puzzle({
			$container: $('#puzzle'),
			size: 3,
			initialState: m.route.param('state').split(',')
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
