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
            model.on('add_file', $.proxy(_onAddFileFromModel, this));
            model.on('progress', $.proxy(_onModelProgress, this));
            view.show();
        };

        /**
         * Inits the subview when the view is ready
         */
        var _onViewLoaded = function()
        {
            view.files.on('add_files', $.proxy(_onAddFilesFromView, this));
            view.files.on('remove_files', $.proxy(_onRemoveFilesFromView, this));
            view.operations.on('edit_operations', $.proxy(_onEditOperationsFromView, this));
        };

        /**
         * Processes files added from the view and send them back
         * @param files
         */
        var _onAddFilesFromView = function(files)
        {
            model.addFiles(files);
        };

        /**
         * Adds a file to the view when the model has processed it
         * @param file
         */
        var _onAddFileFromModel = function(file)
        {
            view.files.addFile(file);
        };

        /**
         * Processes files deleted from the view and send them back
         * @param ids
         */
        var _onRemoveFilesFromView = function(ids)
        {
            model.removeFiles(ids);
        };

        /**
         * Handles progress events sent from the model
         * @param percentage
         */
        var _onModelProgress = function(percentage)
        {
            view.files.updateProgressbar(percentage);
        };

        /**
         * Processes files when modifying an operation from the view
         * @param operations
         */
        var _onEditOperationsFromView = function(operations)
        {
            var files = model.applyOperations(operations);
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