/**
 * Main controller
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var view = new app.views.main();
        var model = new app.models.main();

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

    app.controllers.main = module;

})(window.App, jQuery);