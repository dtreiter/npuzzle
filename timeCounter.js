var TimeCounter = {
	controller: function() {
		var isTiming = m.prop(false);
		var start = m.prop(null);
		var label = m.prop('0:0.0');

		$(document).on('puzzle:move', function() {
			if (!isTiming()) {
				isTiming(true);
				start(new Date());
			}
		});

		$(document).on('puzzle:scramble', function() {
			isTiming(false);
			start(null);
			label('0:0.0');
		});

		$(document).on('puzzle:solved', function() {
			isTiming(false);
		});

		// Formats a number to be 2 digits.
		var _formatTwoDigits = function(num) {
			num = Math.floor(num);
			if (num < 10) {
				return '0' + num;
			}

			return String(num);
		};

		var updateTime = function() {
			if (!isTiming()) {
				return;
			}

			// Subtraction using JavaScript's Date object just gives us a time in
			// milliseconds, so we have to do some manual math here.
			let elapsed = new Date() - start();
			let milliSeconds = _formatTwoDigits((elapsed % 1000) / 10);
			let seconds = _formatTwoDigits((elapsed / 1000) % 60);
			let minutes = Math.floor(elapsed / 1000 / 60);
			let newLabel = `${minutes}:${seconds}.${milliSeconds}`;

			label(newLabel);
			m.redraw(); // TODO Avoid manual redrawing.
		};

		// If we used 100 ms exactly the 2nd millisecond digit on the clock
		// would never change. Instead we use an interval slightly under 100 ms.
		setInterval(updateTime, 93);

		return {
			isTiming: isTiming,
			start: start,
			label: label
		};
	},

	view: function(ctrl) {
		return m('h3', 'Time: ' + ctrl.label());
	}
};

module.exports = TimeCounter;
