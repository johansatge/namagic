/**
 * Help view
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var window = null;
        var events = new app.node.events.EventEmitter();
        var $ui = {};

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            events.on(event, callback);
        };

        /**
         * Show main window & inits events
         */
        this.show = function()
        {
            var bootstrap = new app.utils.windowbootstrap('templates/help.html', {
                toolbar: false,
                frame: true,
                width: 550,
                height: 600,
                min_width: 350,
                min_height: 350,
                max_width: 1000,
                position: 'mouse',
                resizable: true,
                show: false,
                title: ''
            });
            bootstrap.on('loaded', $.proxy(_onWindowLoaded, this));
            bootstrap.on('close', $.proxy(_onWindowClose, this));
            window = bootstrap.initAndShow();
        };

        /**
         * Closes the view
         */
        this.close = function()
        {
            window.close(true);
        };

        /**
         * Loads the template when the view is ready
         * @param $window
         * @param $body
         */
        var _onWindowLoaded = function($window, $body)
        {
            $ui.window = $window;
            $ui.body = $body;
            $ui.body.find('img').on('dragstart', $.proxy(_onDragImage, this));
        };

        /**
         * Dragging images
         * @param evt
         */
        var _onDragImage = function(evt)
        {
            evt.preventDefault();
        };

        /**
         * Tells the controller that the view has been closed
         */
        var _onWindowClose = function()
        {
            events.emit('close');
        };

    };

    app.views.help = module;

})(window.App, jQuery);