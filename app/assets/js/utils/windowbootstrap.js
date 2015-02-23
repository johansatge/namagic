/**
 * Window bootstrap
 */
(function(app, $)
{

    'use strict';

    var module = function(template, params)
    {

        var window;
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
         * Inits and shows the requested window, by using the given parameters
         */
        this.initAndShow = function()
        {
            window = app.node.gui.Window.open(template, params);
            window.on('close', $.proxy(_onWindowClose, this));
            window.on('document-end', $.proxy(_onDocumentEnd, this));
            return window;
        };

        /**
         * Triggered when the window (DOM) is inited
         */
        var _onDocumentEnd = function()
        {
            window.window.onload = $.proxy(_onWindowLoaded, this);
        };

        /**
         * Closes the window
         */
        var _onWindowClose = function()
        {
            events.emit('close');
        };

        /**
         * Inits the window when the DOM is ready
         */
        var _onWindowLoaded = function()
        {
            _disableDragDrop(window.window.document);
            window.menu = app.utils.menubar.get();
            window.on('focus', function()
            {
                app.utils.windowmanager.setCurrentWindow(window);
            });
            window.on('blur', function()
            {
                app.utils.windowmanager.setCurrentWindow(false);
            });
            if (app.devMode)
            {
                window.showDevTools();
            }
            window.show();
            window.focus();
            var $body = $(window.window.document.body);
            $body.html(app.utils.template.render($body.html(), [app.utils.locale.getAll()]));
            events.emit('loaded', $body);
        };

        /**
         * Disables drag&drop
         * @param document
         */
        var _disableDragDrop = function(document)
        {
            var $document = $(document);
            $document.on('dragover drop', function(evt)
            {
                evt.preventDefault();
                evt.stopPropagation();
            });
        };

    };

    app.utils.windowbootstrap = module;

})(window.App, jQuery);