/**
 * About controller
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var view = new app.views.about();

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

    app.controllers.about = module;

})(window.App, jQuery);