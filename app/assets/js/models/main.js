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
        var pendingIndex;
        var pendingFilesDoneCount;

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
         * Applies operations on files
         * @param destination_dir
         */
        this.applyOperations = function(destination_dir)
        {
            events.emit('progress', 0);
            destinationDir = destination_dir;
            pendingIndex = 0;
            pendingFilesDoneCount = 0;
            pendingFilesBaseCount = currentFiles.length;
            _asyncApplyOperations.apply(this);
        };

        /**
         * Processes a slice of files when applying operations and recursively calls itself while the queue is not empty
         * Processed files are removed from currentFiles and the UI, remaining ones show a message
         */
        var _asyncApplyOperations = function()
        {
            var file = currentFiles[pendingIndex];
            file.applyUpdatedName(destinationDir, $.proxy(_onFileApplied, this));
        };

        /**
         * Triggered when a file has been modified by using the current operations
         * @param file
         * @param success
         */
        var _onFileApplied = function(file, success)
        {
            pendingFilesDoneCount += 1;
            if (success)
            {
                events.emit('remove_files', [file.getID()]);
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
                events.emit('idle');
            }
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
                var fileinfo = app.node.path.parse(files[index]);
                var id = app.node.crypto.createHash('md5').update(files[index]).digest('hex');
                if (typeof currentFilesIndexes[id] === 'undefined')
                {
                    currentFilesIndexes[id] = currentFiles.length;
                    var new_file = new app.models.file(id, fileinfo.dir, fileinfo.name + fileinfo.ext);
                    new_file.processOperations(currentOperations, currentFiles.length);
                    new_files.push(new_file);
                    currentFiles.push(new_file);
                }
            }
            events.emit('add_files', new_files);
            events.emit('progress', newFiles.length > 0 ? ((newFilesCount - newFiles.length) * 100) / newFilesCount : 100);
            if (newFiles.length > 0)
            {
                setTimeout($.proxy(_asyncProcessNewFiles, this), 0);
            }
            else
            {
                if (typeof new_file !== 'undefined')
                {
                    defaultDestinationDir = new_file.getDirectory();
                }
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
        this.processOperations = function(operations)
        {
            currentOperations = operations;
            var processed_filenames = [];
            for (var index = 0; index < currentFiles.length; index += 1)
            {
                var file = currentFiles[index];
                file.processOperations(currentOperations, index);
                var name = file.getUpdatedName();
                if (processed_filenames.indexOf(name) === -1)
                {
                    processed_filenames.push(name);
                }
                else
                {
                    if (!file.hasError())
                    {
                        file.setError(true, app.utils.locale.get('main.errors.duplicate_filename'));
                    }
                }
            }
            events.emit('update_files', currentFiles);
        };
    };

    app.models.main = module;

})(window.App);