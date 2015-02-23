/**
 * Form controller
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var view = new app.views.editor();
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
         * Inits the controller
         */
        this.init = function()
        {
            view.on('close', $.proxy(onViewClose, this));
            view.show();
        };

        /**
         * Closes the view
         */
        var onViewClose = function()
        {
            view.close();
        };

    };

    app.controllers.editor = module;

})(window.App, jQuery);