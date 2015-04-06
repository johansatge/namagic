/**
 * Window manager
 */
(function(app, $)
{

    'use strict';

    var module = {};
    var _currentWindow = false;

    /**
     * Tries to close the current window
     */
    module.closeCurrentWindow = function()
    {
        if (_currentWindow !== false)
        {
            _currentWindow.close();
        }
    };

    /**
     * Sets the current window (used with the "Close" shortcut)
     * @param window
     */
    module.setCurrentWindow = function(window)
    {
        if (_currentWindow !== false)
        {
            _currentWindow.removeAllListeners('move');
        }
        _currentWindow = window;
        if (_currentWindow !== false)
        {
            _currentWindow.on('move', $.proxy(_updateBackgroundWindowPosition, this));
            _updateBackgroundWindowPosition();
        }
    };

    /**
     * The main app window has to follow the current window - contextual menu positions are based on it
     */
    var _updateBackgroundWindowPosition = function()
    {
        var background_window = app.node.gui.Window.get();
        background_window.x = _currentWindow.x;
        background_window.y = _currentWindow.y;
    };

    app.utils.windowmanager = module;

})(window.App, jQuery);