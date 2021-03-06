/**
 * PowerTip DisplayController
 *
 * @fileoverview  DisplayController object used to manage tooltips for elements.
 * @link          http://stevenbenner.github.com/jquery-powertip/
 * @author        Steven Benner (http://stevenbenner.com/)
 * @version       1.1.0
 * @requires      jQuery 1.7+
 */

/**
 * Creates a new tooltip display controller.
 * @private
 * @constructor
 * @param {Object} element The element that this controller will handle.
 * @param {Object} options Options object containing settings.
 * @param {TooltipController} tipController The TooltipController for this instance.
 */
function DisplayController(element, options, tipController) {
	var hoverTimer = null;

	/**
	 * Begins the process of showing a tooltip.
	 * @private
	 * @param {Boolean=} immediate Skip intent testing (optional).
	 * @param {Boolean=} forceOpen Ignore cursor position and force tooltip to open (optional).
	 */
	function openTooltip(immediate, forceOpen) {
		cancelTimer();
		if (!element.data('hasActiveHover')) {
			if (!immediate) {
				session.tipOpenImminent = true;
				hoverTimer = setTimeout(
					function intentDelay() {
						hoverTimer = null;
						checkForIntent(element);
					},
					options.intentPollInterval
				);
			} else {
				if (forceOpen) {
					element.data('forcedOpen', true);
				}
				tipController.showTip(element);
			}
		}
	}

	/**
	 * Begins the process of closing a tooltip.
	 * @private
	 * @param {Boolean=} disableDelay Disable close delay (optional).
	 */
	function closeTooltip(disableDelay) {
		cancelTimer();
		session.tipOpenImminent = false;
		if (element.data('hasActiveHover')) {
			element.data('forcedOpen', false);
			if (!disableDelay) {
				hoverTimer = setTimeout(
					function closeDelay() {
						hoverTimer = null;
						tipController.hideTip(element);
					},
					options.closeDelay
				);
			} else {
				tipController.hideTip(element);
			}
		}
	}

	/**
	 * Checks mouse position to make sure that the user intended to hover
	 * on the specified element before showing the tooltip.
	 * @private
	 */
	function checkForIntent() {
		// calculate mouse position difference
		var xDifference = Math.abs(session.previousX - session.currentX),
			yDifference = Math.abs(session.previousY - session.currentY),
			totalDifference = xDifference + yDifference;

		// check if difference has passed the sensitivity threshold
		if (totalDifference < options.intentSensitivity) {
			tipController.showTip(element);
		} else {
			// try again
			session.previousX = session.currentX;
			session.previousY = session.currentY;
			openTooltip();
		}
	}

	/**
	 * Cancels active hover timer.
	 * @private
	 */
	function cancelTimer() {
		hoverTimer = clearTimeout(hoverTimer);
	}

	// expose the methods
	return {
		show: openTooltip,
		hide: closeTooltip,
		cancel: cancelTimer,
		resetPosition: function () {
			tipController.resetPosition(element);
		}
	};
}
