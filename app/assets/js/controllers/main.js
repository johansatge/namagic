/**
 * Main controller
 */
(function(require, m)
{

    'use strict';

    var Window = require('Window');
    var FileDialog = require('FileDialog');

    var module = function()
    {

        //var view = new app.views.main();
        var Model = require('../models/main.js');
        var model = new Model();

        var window = null;
        var webview = null;

        /**
         * Inits the controller
         */
        this.init = function()
        {

            model.on('progress', _onModelProgress.bind(this));
            model.on('idle', _onModelIdle.bind(this));
            model.on('add_files', _onAddFilesFromModel.bind(this));
            model.on('remove_files', _onRemoveFilesFromModel.bind(this));
            model.on('update_files', _onUpdateFilesFromModel.bind(this));

            window = new Window();
            window.visible = false;
            window.width = 900;
            window.height = 600;
            window.resizable = true;
            window.title = '';

            webview = new WebView();
            window.appendChild(webview);
            webview.left = webview.top = webview.right = webview.bottom = 0;
            webview.location = "app://assets/html/main.html";
            webview.on('load', function()
            {
                window.visible = true;
            });
            webview.on('message', function(evt)
            {
                evt = JSON.parse(evt);
                if (evt.type === 'add_files')
                {
                    var dialog = new FileDialog('open');
                    dialog.allowMultiple = true;
                    dialog.allowDirectories = true;
                    dialog.open(window);
                    dialog.addEventListener('select', function()
                    {
                        model.addFiles(dialog.selection);
                    });
                }
                if (evt.type === 'remove_files')
                {
                    model.removeFiles(evt.data);
                }
                if (evt.type === 'console')
                {
                    console.log(evt.data);
                }
            });

            /*
             view.on('close', $.proxy(_onViewClose, this));
             view.on('loaded', $.proxy(_onViewLoaded, this));
             view.show();*/
        };

        /**
         * Adds files to the view while the model is working
         * @param files
         */
        var _onAddFilesFromModel = function(files)
        {
            webview.postMessage(JSON.stringify({type: 'add_files', data: files}));
            webview.postMessage(JSON.stringify({type: 'lock_ui', data: true}));
        };

        /**
         * Removes files from the model
         * @param ids
         */
        var _onRemoveFilesFromModel = function(ids)
        {
            webview.postMessage(JSON.stringify({type: 'remove_files', data: ids}));
        };

        /**
         * Updates the file view while the model is working
         * @param percentage
         */
        var _onModelProgress = function(percentage)
        {
            webview.postMessage(JSON.stringify({type: 'set_progress', data: percentage}));
        };

        /**
         * Enables UI when a delayed operation has been finished
         * @private
         */
        var _onModelIdle = function()
        {
            webview.postMessage(JSON.stringify({type: 'lock_ui', data: false}));
        };

        /**
         * Inits the subview when the view is ready
         */
        var _onViewLoaded = function()
        {
            view.files.on('set_destination', $.proxy(_onSetDestinationFromView), this);
            view.files.on('cancel', $.proxy(_onCancelCurrentWorkFromView), this);
            view.files.on('overwrite', $.proxy(_onOverwriteFileFromView), this);
            view.operations.on('edit_operations', $.proxy(_onEditOperationsFromView, this));
            view.operations.on('apply_operations', $.proxy(_onApplyOperationsFromView, this));
        };

        /**
         * Cancels the current work
         */
        var _onCancelCurrentWorkFromView = function()
        {
            model.cancelCurrentWork();
        };

        /**
         * Triggers an overwrite action from the view
         * @param type
         * @param target
         */
        var _onOverwriteFileFromView = function(type, ids)
        {
            if (type === 'dismiss')
            {
                model.dismissOverwriteFiles(ids);
            }
            if (type === 'overwrite')
            {
                view.files.lockInterface(true);
                view.operations.lockInterface(true);
                model.applyOperationsOnFiles(ids, false, true);
            }
        };

        /**
         * Starts applying operations on current files
         */
        var _onApplyOperationsFromView = function()
        {
            if (model.hasFiles())
            {
                var destination_dir = model.getDefaultDestinationDir();
                view.files.getDestinationDir(destination_dir);
            }
        };

        /**
         * Start applying operations when the user has selected a destination dir
         * @param destination_dir
         */
        var _onSetDestinationFromView = function(destination_dir)
        {
            view.files.lockInterface(true);
            view.operations.lockInterface(true);
            model.applyOperationsOnFiles(true, destination_dir, false);
        };

        /**
         * Set status on files from the model
         * @param files
         */
        var _onUpdateFilesFromModel = function(files)
        {
            view.files.updateFiles(files, false);
        };

        /**
         * Processes files when modifying an operation from the view
         * @param operations
         */
        var _onEditOperationsFromView = function(operations)
        {
            model.storeAndProcessOperations(operations);
        };

        /**
         * Closes the view
         */
        var _onViewClose = function()
        {
            model.cancelCurrentWork();
            view.close();
        };

    };

    m.exports = module;

})(require, module);