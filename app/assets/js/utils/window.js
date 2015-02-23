/**
 * Window utils
 */
(function(app, $)
{

    'use strict';

    var module = {};
    var _currentWindow = false;

    /**
     * Disables drag&drop
     * @param document
     */
    module.disableDragDrop = function(document)
    {
        var $document = $(document);
        $document.on('dragover', function(evt)
        {
            evt.preventDefault();
            evt.stopPropagation();
        });
        $document.on('drop', function(evt)
        {
            evt.preventDefault();
            evt.stopPropagation();
        });
    };

    /**
     * Sets the current window (used with the "Close" shortcut)
     * @param window
     */
    module.setCurrentWindow = function(window)
    {
        if (_currentWindow !== false)
        {
            _currentWindow.removeListener('move', $.proxy(_updateBackgroundWindowPosition, this));
        }
        _currentWindow = window;
        if (_currentWindow !== false)
        {
            _currentWindow.on('move', $.proxy(_updateBackgroundWindowPosition, this));
            _updateBackgroundWindowPosition();
        }
    };

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
     * The main app window has to follow the current window - contextual menu positions are based on it
     * @todo make this prettier
     */
    var _updateBackgroundWindowPosition = function()
    {
        var background_window = app.node.gui.Window.get();
        background_window.x = _currentWindow.x;
        background_window.y = _currentWindow.y;
    };

    app.utils.window = module;

})(window.App, jQuery);