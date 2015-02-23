/**
 * Editor view
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
         * Show main window & inits events
         */
        this.show = function()
        {
            var bootstrap = new app.utils.windowbootstrap('templates/editor.html', {
                toolbar: false,
                frame: true,
                width: 400,
                height: 362,
                position: 'mouse',
                resizable: false,
                show: false,
                title: ''
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
         * Loads the template when the view is ready
         * @param $body
         */
        var _onWindowLoaded = function($body)
        {
            //app.log($body);
        };

        /**
         * Tell the controller that the view has been closed
         * @param evt
         */
        var _onWindowClose = function()
        {
            events.emit('close');
        };

    };

    app.views.main = module;

})(window.App, jQuery);