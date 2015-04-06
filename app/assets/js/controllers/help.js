/**
 * Help controller
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var view = new app.views.help();

        /**
         * Inits the controller
         */
        this.init = function()
        {
            view.on('close', $.proxy(_onViewClose, this));
            view.show();
        };

        /**
         * Closes the view
         */
        var _onViewClose = function()
        {
            view.close();
        };

    };

    app.controllers.help = module;

})(window.App, jQuery);