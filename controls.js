var MoveCounter = require('./MoveCounter');
var TimeCounter = require('./TimeCounter');

var Controls = {
	controller: function(args) {
		return {
			puzzle: args.puzzle
		};
	},

	view: function(ctrl) {
		return m('div', [
			m('button', {
				class: 'btn btn-lg btn-wide btn-primary',
				onclick: ctrl.puzzle.scramble.bind(ctrl.puzzle)
			}, 'Scramble'),
			m.component(TimeCounter),
			m.component(MoveCounter)
		]);
	}
};

module.exports = Controls;
