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
            var params = {title: '', toolbar: false, frame: true, resizable: false, show: false, width: 200, height: 210};
            window = app.node.gui.Window.open('templates/about.html', params);
            var self = this;
            window.on('close', $.proxy(_onWindowClose, this));
            window.on('focus', $.proxy(_onWindowFocus, this));
            window.on('blur', $.proxy(_onWindowBlur, this));
            window.on('document-end', function()
            {
                window.window.onload = $.proxy(_onWindowLoaded, self);
            });
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
         * Sends the "focus" event to the controller
         */
        var _onWindowFocus = function()
        {
            app.utils.window.setCurrentWindow(window);
        };

        /**
         * Sends the "blur" event to the controller
         */
        var _onWindowBlur = function()
        {
            app.utils.window.setCurrentWindow(false);
        };

        /**
         * Triggered when the window content has been loaded (DOM and assets)
         */
        var _onWindowLoaded = function()
        {
            window.menu = app.menubar;
            window.show();
            if (app.devMode)
            {
                window.showDevTools();
            }
            window.focus();
            var $body = $(window.window.document.body);
            $body.html(app.utils.template.render($body.html(), [app.locale.about]));
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