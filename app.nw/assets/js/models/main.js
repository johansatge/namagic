/**
 * Main model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();

        var currentFiles = [];
        var currentFilesIndexes = {};
        var currentOperations = [];

        var newFiles = [];
        var newFilesCount;

        var pendingFilesBaseCount;
        var pendingFilesDoneCount;
        var pendingIndex;
        var pendingDeletedFiles;

        var defaultDestinationDir;
        var destinationDir;

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
            pendingIndex = currentFiles.length;
            newFiles = [];
        };

        /**
         * Checks if has files
         */
        this.hasFiles = function()
        {
            return currentFiles.length > 0;
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
                var id = app.node.crypto.createHash('md5').update(path).digest('hex');
                if (typeof currentFilesIndexes[id] === 'undefined')
                {
                    currentFilesIndexes[id] = currentFiles.length;
                    var new_file = new app.models.file(id, path.substring(0, path.lastIndexOf('/')), path.substring(path.lastIndexOf('/') + 1));
                    new_file.processOperations(currentOperations, currentFiles.length);
                    new_files.push(new_file);
                    currentFiles.push(new_file);
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
                setTimeout($.proxy(_asyncProcessNewFiles, this), 0);
            }
            else
            {
                events.emit('idle');
            }
        };

        /**
         * Applies operations on files
         * @param destination_dir
         */
        this.applyOperationsOnFiles = function(destination_dir)
        {
            events.emit('progress', 0);
            destinationDir = destination_dir;
            pendingIndex = 0;
            pendingFilesDoneCount = 0;
            pendingFilesBaseCount = currentFiles.length;
            pendingDeletedFiles = [];
            _asyncApplyOperations.apply(this);
        };

        /**
         * Processes a slice of files when applying operations and recursively calls itself while the queue is not empty
         * Processed files are removed from currentFiles and the UI, remaining ones show a message
         */
        var _asyncApplyOperations = function()
        {
            var file = currentFiles[pendingIndex];
            file.applyUpdatedName(destinationDir, $.proxy(_onOperationAppliedOnFile, this));
        };

        /**
         * Triggered when a file has been modified by using the current operations; when everything is done, triggers the needed events
         * @param file
         * @param success
         */
        var _onOperationAppliedOnFile = function(file, success)
        {
            pendingFilesDoneCount += 1;
            if (success)
            {
                pendingDeletedFiles.push(file.getID());
                currentFiles.shift();
                delete currentFilesIndexes[file.getID()];
            }
            else
            {
                pendingIndex += 1;
                events.emit('update_files', [file]);
            }
            events.emit('progress', pendingIndex < currentFiles.length ? (pendingFilesDoneCount * 100) / pendingFilesBaseCount : 100);
            if (pendingIndex < currentFiles.length)
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
                currentFiles.splice(currentFilesIndexes[ids[index]], 1);
                delete currentFilesIndexes[ids[index]];
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
            for (var index = 0; index < currentFiles.length; index += 1)
            {
                var file = currentFiles[index];
                if (file.processOperations(currentOperations, index))
                {
                    updated_files.push(file);
                }
            }
            events.emit('update_files', updated_files);
        };
    };

    app.models.main = module;

})(window.App);