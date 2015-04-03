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

        var pendingFiles = [];
        var pendingFilesCount;

        var defaultdestinationDir;
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
         * Checks if has files
         */
        this.hasFiles = function()
        {
            return currentFiles.length > 0;
        };

        /**
         * Returns the default destination path
         */
        this.getDefaultdestinationDir = function()
        {
            return defaultdestinationDir;
        };

        /**
         * Adds a list of files
         * @param files
         */
        this.addFiles = function(files)
        {
            newFiles = files;
            events.emit('progress', 0);
            newFilesCount = newFiles.length;
            _asyncProcessNewFiles.apply(this);
        };

        /**
         * Applies operations on files
         * @param destination_dir
         */
        this.applyOperations = function(destination_dir)
        {
            destinationDir = destination_dir;
            pendingFiles = currentFiles.slice(0);
            pendingFilesCount = currentFiles.length;
            events.emit('progress', 0);
            _asyncApplyOperations.apply(this);
        };

        /**
         * Processes a slice of files when applying operations and recursively calls itself while the queue is not empty
         * Processed files are removed from currentFiles and the UI, others show a message
         */
        var _asyncApplyOperations = function()
        {
            var files = pendingFiles.splice(0, 50);
            var processed_ids = [];
            var updated_files = [];
            for (var index = 0; index < files.length; index += 1)
            {
                var file = files[index];
                if (file.hasError())
                {
                    continue;
                }
                var source_path = app.utils.string.escapeForCLI(file.getDirectory() + '/' + file.getName());
                var destination_path = app.utils.string.escapeForCLI(destinationDir + '/' + file.getUpdatedName());
                try
                {
                    app.node.execSync((file.getDirectory() !== destinationDir ? 'cp ' : 'mv ') + source_path + ' ' + destination_path);
                    processed_ids.push(file.getID());
                    currentFiles.splice(currentFilesIndexes[file.getID()], 1);
                    delete currentFilesIndexes[file.getID()];
                }
                catch (error)
                {
                    currentFiles[currentFilesIndexes[file.getID()]].setError(true, error.message);
                    updated_files.push(currentFiles[currentFilesIndexes[file.getID()]]);
                }
            }
            events.emit('remove_files', processed_ids);
            if (updated_files.length > 0)
            {
                events.emit('update_files', updated_files);
            }
            events.emit('progress', pendingFiles.length > 0 ? ((pendingFilesCount - pendingFiles.length) * 100) / pendingFilesCount : 100);
            if (pendingFiles.length > 0)
            {
                setTimeout($.proxy(_asyncApplyOperations, this), 0);
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
                    defaultdestinationDir = new_file.getDirectory();
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
            for (var index = 0; index < currentFiles.length; index += 1)
            {
                var file = currentFiles[index];
                file.processOperations(currentOperations, index);
            }

            // @todo for each file without error, store its filename;
            // the next ones check that their name does not exist, otherwise set an error in the object

            events.emit('update_files', currentFiles);
        };
    };

    app.models.main = module;

})(window.App);