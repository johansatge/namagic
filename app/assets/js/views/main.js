/**
 * Main view
 */
(function(window, $)
{

    'use strict';

    var module = function()
    {

        this.files = null;
        this.operations = null;

        var window = null;
        var events = {};//new app.node.events.EventEmitter();
        var $ui = {};

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            //events.on(event, callback);
        };

        /**
         * Show main window & inits events
         */
        this.show = function()
        {
            /*var bootstrap = new app.utils.windowbootstrap('templates/main.html', {
                toolbar: false,
                frame: true,
                width: 900,
                height: 600,
                min_width: 750,
                min_height: 450,
                position: 'mouse',
                resizable: true,
                show: false,
                title: ''
            });
            bootstrap.on('loaded', $.proxy(_onWindowLoaded, this));
            bootstrap.on('close', $.proxy(_onWindowClose, this));
            window = bootstrap.initAndShow();*/
        };

        /**
         * Closes the view
         */
        this.close = function()
        {
            window.close(true);
        };

        /**
         * Inits the view
         */
        this.init = function()
        {
            var $window = $(window);
            var $body = $(window.document.body);
            //_initDOM.apply(this, [$window, $body]);
            //_initSubviews.apply(this);
            //_initEvents.apply(this);
            //events.emit('loaded');
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
            this.files = new app.views.files();
            this.files.init($ui.window, $ui.filesPanel);
            this.operations = new app.views.operations();
            this.operations.init($ui.operationsPanel);
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.window.on('resize', $.proxy(_onWindowResize, this)).trigger('resize');
        };

        /**
         * Tells the controller that the view has been closed
         */
        var _onWindowClose = function()
        {
            events.emit('close');
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

    };

    window.Main = module;

})(window, jQuery);