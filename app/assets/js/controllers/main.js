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
            view.on('loaded', $.proxy(_onViewLoaded, this));
            view.show();
        };

        /**
         * Inits the subview when the view is ready
         */
        var _onViewLoaded = function()
        {
            view.files.on('add_files', $.proxy(_onAddFiles, this));
            view.files.on('remove_files', $.proxy(_onRemoveFiles, this));
            view.operations.on('edit_operations', $.proxy(_onEditOperations, this));
        };

        /**
         * Processes files added from the view and send them back
         * @param files
         */
        var _onAddFiles = function(files)
        {
            view.files.addFiles(model.addFiles(files));
        };

        /**
         * Processes files deleted from the view and send them back
         * @param ids
         */
        var _onRemoveFiles = function(ids)
        {
            model.removeFiles(ids);
            view.files.removeFiles(ids);
        };

        /**
         * Processes files when modifying an operation from the view
         * @param data
         */
        var _onEditOperations = function(data)
        {
            var files = model.applyOperations(data);
            view.files.updateFiles(files);
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