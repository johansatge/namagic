/**
 * Form view
 * Displayed on app startup
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var window = null;
        var $ui = {};
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
         * Show main window & inits events
         */
        this.show = function()
        {
            var window_params =
            {
                toolbar: app.devMode,
                frame: true,
                width: 400,
                height: 362,
                position: 'mouse',
                min_width: 400,
                min_height: 362,
                max_width: 400,
                max_height: 362,
                show: false,
                title: ''
            };
            window = app.node.gui.Window.open('templates/editor.html', window_params);
            window.on('close', $.proxy(_onWindowClose, this));
            window.on('focus', $.proxy(_onWindowFocus, this));
            window.on('blur', $.proxy(_onWindowBlur, this));
            window.on('document-end', $.proxy(function()
            {
                window.window.onload = $.proxy(_onWindowLoaded, this);
            }, this));
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
            app.utils.window.disableDragDrop(window.window.document);
        };

        /**
         * Tell the controller that the view has been closed
         * @param evt
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

    };

    app.views.editor = module;

})(window.App, jQuery);