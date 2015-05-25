/**
 * Main controller
 */
(function(require, m)
{

    'use strict';

    var Window = require('Window');
    var FileDialog = require('FileDialog');
    var Menubar = require('../utils/menubar.js');

    var module = function()
    {

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
            model.on('set_destination', _onSetDestinationFromModel.bind(this));

            window = new Window();
            window.visible = false;
            window.width = 900;
            window.height = 600;
            window.resizable = true;
            window.title = '';

            var menubar = new Menubar();
            menubar.setOnWindow(window);

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
                        var files = [];
                        for (var index = 0; index < dialog.selection.length; index += 1)
                        {
                            files.push(dialog.selection[index].replace(/\/$/, ''));
                        }
                        model.addFiles(files);
                    });
                }
                if (evt.type === 'remove_files')
                {
                    model.removeFiles(evt.data);
                }
                if (evt.type === 'edit_operations')
                {
                    model.storeAndProcessOperations(evt.data);
                }
                if (evt.type === 'apply_operations' && model.hasFiles())
                {
                    model.getDestinationDir(window);
                }
                if (evt.type === 'overwrite')
                {
                    if (evt.data.type === 'dismiss')
                    {
                        model.dismissOverwriteFiles(evt.data.ids);
                    }
                    if (evt.data.type === 'overwrite')
                    {
                        webview.postMessage(JSON.stringify({type: 'lock_ui', data: true}));
                        model.applyOperationsOnFiles(evt.data.ids, false, true);
                    }
                }
                if (evt.type === 'cancel')
                {
                    model.cancelCurrentWork();
                }
                if (evt.type === 'console')
                {
                    console.log(evt.data);
                }
            });
        };

        /**
         * Start applying operations when the user has selected a destination dir
         * @param destination_dir
         */
        var _onSetDestinationFromModel = function(destination_dir)
        {
            webview.postMessage(JSON.stringify({type: 'lock_ui', data: true}));
            model.applyOperationsOnFiles(true, destination_dir, false);
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
         * Set status on files from the model
         * @param files
         */
        var _onUpdateFilesFromModel = function(files)
        {
            webview.postMessage(JSON.stringify({type: 'update_files', data: files}));
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

    };

    m.exports = module;

})(require, module);