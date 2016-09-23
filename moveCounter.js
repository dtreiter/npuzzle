var MoveCounter = {
	controller: function() {
		var count = m.prop(0);
		$(document).on('puzzle:move', function() {
			count(count() + 1);
		});

		$(document).on('puzzle:scramble', function() {
			count(0);
		});

		return {
			count: count
		};
	},

	view: function(ctrl) {
		return m('h3', 'Moves: ' + ctrl.count());
	}
};

module.exports = MoveCounter;
