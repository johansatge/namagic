/**
 * About view
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var window = null;
        var events = new app.node.events.EventEmitter();

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
         * Inits the main window and waits for its content to be loaded
         */
        this.show = function()
        {
            var bootstrap = new app.utils.windowbootstrap('templates/about.html', {
                title: '',
                toolbar: false,
                frame: true,
                resizable: false,
                show: false,
                width: 200,
                height: 210
            });
            bootstrap.on('loaded', _onWindowLoaded);
            bootstrap.on('close', _onWindowClose);
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
         * Closes the view
         */
        var _onWindowClose = function()
        {
            events.emit('close');
        };

        /**
         * Triggered when the window content has been loaded (DOM and assets)
         * @param $window
         * @param $body
         */
        var _onWindowLoaded = function($window, $body)
        {
            $body.find('a').on('click', $.proxy(_onLinkClick, this));
        };

        /**
         * Opens an external link
         * @param evt
         */
        var _onLinkClick = function(evt)
        {
            evt.preventDefault();
            app.node.gui.Shell.openExternal($(evt.currentTarget).attr('href'));
        };

    };

    app.views.about = module;

})(window.App, jQuery);