/**
 * Main model
 */
(function(m)
{

    'use strict';

    var EventEmitter = require('events').EventEmitter;
    var crypto = require('crypto');
    var File = require('./file.js');

    var module = function()
    {

        var events = new EventEmitter();

        var currentFiles = [];
        var currentFilesIndexes = {};
        var currentOperations = [];
        var currentFilesCount = 0;

        var newFiles = [];
        var newFilesCount;

        var pendingFilesDoneCount;
        var pendingIndex;
        var pendingIndexes;
        var pendingDeletedFiles;

        var defaultDestinationDir;
        var destinationDir;
        var allowOverwrite;

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
         * Cancels the current work
         */
        this.cancelCurrentWork = function()
        {
            pendingIndexes = [];
            pendingIndex = currentFilesCount;
            newFiles = [];
        };

        /**
         * Checks if has files
         */
        this.hasFiles = function()
        {
            return currentFilesCount > 0;
        };

        /**
         * Dismisses files (when asking to overwrite)
         * @param ids
         */
        this.dismissOverwriteFiles = function(ids)
        {
            var updated_files = [];
            for (var index = 0; index < ids.length; index += 1)
            {
                var file = currentFiles[currentFilesIndexes[ids[index]]];
                file.setError(false, '');
                updated_files.push(file);
            }
            events.emit('update_files', updated_files);
        };

        /**
         * Returns the default destination path
         */
        this.getDefaultDestinationDir = function()
        {
            return defaultDestinationDir;
        };

        /**
         * Adds a list of files
         * @param files
         */
        this.addFiles = function(files)
        {
            events.emit('progress', 0);
            newFiles = files;
            newFilesCount = newFiles.length;
            _asyncProcessNewFiles.apply(this);
        };

        /**
         * Processes a slice of new files and recursively calls itself while the queue is not empty
         */
        var _asyncProcessNewFiles = function()
        {
            var files = newFiles.splice(0, 50);
            var new_files = [];
            for (var index = 0; index < files.length; index += 1)
            {
                var path = files[index];
                var id = crypto.createHash('md5').update(path).digest('hex');
                if (typeof currentFilesIndexes[id] === 'undefined')
                {
                    currentFilesIndexes[id] = currentFiles.length;
                    var new_file = new File(id, path.substring(0, path.lastIndexOf('/')), path.substring(path.lastIndexOf('/') + 1));
                    new_file.processOperations(currentOperations, currentFiles.length);
                    new_files.push(new_file);
                    currentFiles.push(new_file);
                    currentFilesCount += 1;
                }
            }
            if (typeof new_file !== 'undefined')
            {
                defaultDestinationDir = new_file.getDirectory();
            }
            events.emit('add_files', new_files);
            events.emit('progress', newFiles.length > 0 ? ((newFilesCount - newFiles.length) * 100) / newFilesCount : 100);
            if (newFiles.length > 0)
            {
                setTimeout(_asyncProcessNewFiles.bind(this), 0);
            }
            else
            {
                events.emit('idle');
            }
        };

        /**
         * Applies operations on files (all the current ones, or list of IDs)
         * @param ids
         * @param destination_dir
         * @param allow_overwrite
         */
        this.applyOperationsOnFiles = function(ids, destination_dir, allow_overwrite)
        {
            events.emit('progress', 0);
            if (typeof destination_dir === 'string')
            {
                destinationDir = destination_dir;
            }
            pendingIndex = 0;
            if (typeof ids === 'object')
            {
                pendingIndexes = ids;
            }
            else
            {
                pendingIndexes = [];
                for (var index in currentFilesIndexes)
                {
                    pendingIndexes.push(index);
                }
            }
            pendingFilesDoneCount = 0;
            pendingDeletedFiles = [];
            allowOverwrite = allow_overwrite ? true : false;
            _asyncApplyOperations.apply(this);
        };

        /**
         * Processes a file when applying operations and recursively calls itself while the queue is not empty
         */
        var _asyncApplyOperations = function()
        {
            var file = currentFiles[currentFilesIndexes[pendingIndexes[pendingIndex]]];
            if (file.getError() === false || file.getError().overwrites)
            {
                if (!file.destinationExists(destinationDir) || allowOverwrite)
                {
                    file.applyUpdatedName(destinationDir, _onOperationAppliedOnFile.bind(this));
                    return;
                }
                file.setError(true, app.utils.locale.get('main.errors.file_exists'), true);
            }
            _onOperationAppliedOnFile.apply(this, [file, false]);
        };

        /**
         * Triggered when a file has been modified by using the current operations
         * When everything is done, triggers the needed events
         * @param file
         * @param success
         */
        var _onOperationAppliedOnFile = function(file, success)
        {
            pendingFilesDoneCount += 1;
            pendingIndex += 1;
            if (success)
            {
                var file_id = file.getID();
                pendingDeletedFiles.push(file_id);
                currentFiles[currentFilesIndexes[file_id]] = false;
                delete currentFilesIndexes[file_id];
                currentFilesCount -= 1;
            }
            else
            {
                events.emit('update_files', [file]);
            }
            events.emit('progress', pendingIndex < pendingIndexes.length ? (pendingFilesDoneCount * 100) / pendingIndexes.length : 100);
            if (pendingIndex < pendingIndexes.length)
            {
                _asyncApplyOperations.apply(this);
            }
            else
            {
                events.emit('remove_files', pendingDeletedFiles);
                events.emit('idle');
            }
        };

        /**
         * Removes a list of files
         * @param ids
         */
        this.removeFiles = function(ids)
        {
            for (var index = 0; index < ids.length; index += 1)
            {
                currentFiles[currentFilesIndexes[ids[index]]] = null;
                delete currentFilesIndexes[ids[index]];
                currentFilesCount -= 1;
            }
            events.emit('remove_files', ids);
        };

        /**
         * Applies given operations on the current list of files and returns it
         * @param operations
         */
        this.storeAndProcessOperations = function(operations)
        {
            var updated_files = [];
            currentOperations = operations;
            var num = 0;
            for (var index in currentFilesIndexes)
            {
                var file = currentFiles[currentFilesIndexes[index]];
                if (file.processOperations(currentOperations, num))
                {
                    updated_files.push(file);
                }
                num += 1;
            }
            events.emit('update_files', updated_files);
        };
    };

    m.exports = module;

})(module);