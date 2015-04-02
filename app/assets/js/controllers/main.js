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
            model.on('idle', $.proxy(_onModelIdle), this);
            model.on('progress', $.proxy(_onModelProgress), this);
            model.on('add_files', $.proxy(_onAddFilesFromModel), this);
            view.files.on('add_files', $.proxy(_onAddFilesFromView, this));
            view.files.on('remove_files', $.proxy(_onRemoveFilesFromView, this));
            view.files.on('set_destination', $.proxy(_onSetDestinationFromView), this);
            view.operations.on('edit_operations', $.proxy(_onEditOperationsFromView, this));
            view.operations.on('apply_operations', $.proxy(_onApplyOperationFromView, this));
        };

        /**
         * Starts applying operations on current files
         */
        var _onApplyOperationFromView = function()
        {
            view.files.getDestinationDir('/Users/johan/Desktop/_dev'); // @todo get dir from model
        };

        /**
         * Start applying operations when the user has selected a destination dir
         * @param destination_path
         */
        var _onSetDestinationFromView = function(destination_path)
        {
            view.files.lockInterface(true);
            view.operations.lockInterface(true);
            model.applyOperations(destination_path);
        };

        /**
         * Processes files added from the view and send them back
         * @param files
         */
        var _onAddFilesFromView = function(files)
        {
            view.files.lockInterface(true);
            view.operations.lockInterface(true);
            model.addFiles(files);
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
         * Processes files when modifying an operation from the view
         * @param operations
         */
        var _onEditOperationsFromView = function(operations)
        {
            view.files.updateFiles(model.processOperations(operations));
        };

        /**
         * Adds files to the view while the model is working
         * @param files
         */
        var _onAddFilesFromModel = function(files)
        {
            view.files.addFiles(files);
        };

        /**
         * Updates the file view while the model is working
         * @param percentage
         */
        var _onModelProgress = function(percentage)
        {
            view.files.setProgress(percentage);
        };

        /**
         * Enables UI when a delayed operation has been finished
         * @private
         */
        var _onModelIdle = function()
        {
            view.files.lockInterface(false);
            view.operations.lockInterface(false);
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