/**
 * Main view
 */
(function(window, $)
{

    'use strict';

    var module = {};

    var operations = null;
    var $ui = {};

    /**
     * Inits the view
     */
    module.init = function()
    {
        _initDOM($(window), $(window.document.body));
        _initSubviews();
        _initEvents();
    };

    /**
     * Inits DOM
     * @param $window
     * @param $body
     */
    var _initDOM = function($window, $body)
    {
        $ui.window = $window;
        $ui.body = $body;
        $ui.filesPanel = $ui.body.find('.js-files-panel');
        $ui.operationsPanel = $ui.body.find('.js-operations-panel');
        $ui.optionsPanel = $ui.body.find('.js-toolbar-panel');
    };

    /**
     * Inits subviews
     */
    var _initSubviews = function()
    {
        Files.init($ui.window, $ui.filesPanel);
        Operations.init($ui.operationsPanel);
    };

    /**
     * Inits events
     */
    var _initEvents = function()
    {
        $ui.window.on('resize', _onWindowResize).trigger('resize');
    };

    /**
     * Window resize
     */
    var _onWindowResize = function()
    {
        var win_width = $ui.window.width();
        var win_height = $ui.window.height();
        var options_height = $ui.optionsPanel.height();
        $ui.filesPanel.css({
            width: (win_width - $ui.operationsPanel.width() - 1) + 'px',
            height: (win_height - options_height) + 'px'
        });
        $ui.operationsPanel.css({height: (win_height - options_height) + 'px'});
    };

    window.Main = module;

})(window, jQuery);