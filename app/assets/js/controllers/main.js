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
            view.on('close', $.proxy(_onViewClose, this));
            view.on('add_files', $.proxy(_onAddFiles, this));
            view.on('edit_operations', $.proxy(_onEditOperations, this));
            view.show();
        };

        /**
         * Handles new files from the view
         * @param raw_files
         */
        var _onAddFiles = function(raw_files)
        {
            var files = model.parseFiles(raw_files);
            view.addFiles(files);
        };

        /**
         * Editing operations
         * @param data
         */
        var _onEditOperations = function(data)
        {
            var files = model.applyOperations(data);
            view.updateFiles(files);
        };

        /**
         * Closes the view
         */
        var _onViewClose = function()
        {
            view.close();
        };

    };

    app.controllers.main = module;

})(window.App, jQuery);