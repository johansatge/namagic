/**
 * Main model
 */
(function(app, process)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();
        var currentFiles = {};
        var currentOperations = [];
        var newFiles = [];

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
         * Adds a list of files
         * @param files
         */
        this.addFiles = function(files)
        {
            for (var index in files)
            {
                var file = app.node.path.parse(files[index]);
                var id = app.node.crypto.createHash('md5').update(files[index]).digest('hex');
                if (typeof currentFiles[id] === 'undefined')
                {
                    newFiles.push({
                        id: id,
                        dir: file.dir,
                        name: file.name,
                        ext: file.ext,
                        updated_name: ''
                    });
                }
            }
            if (newFiles.length > 0)
            {
                _processNewFile.apply(this);
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
                delete currentFiles[ids[index]];
            }
        };

        /**
         * Applies given operations on the current list of files and returns it
         * @param operations
         */
        this.applyOperations = function(operations)
        {
            currentOperations = operations;
            for (var index in currentFiles)
            {
                currentFiles[index].updated_name = _applyOperationsOnFilename.apply(this, [currentFiles[index].name, currentFiles[index].ext]);
            }
            return currentFiles;
        };

        /**
         * Processes a new file and recursively calls itself if the queue is not empty
         */
        var _processNewFile = function()
        {
            var files = newFiles.splice(0, 50);
            for (var index in files)
            {
                var file = files[index];
                currentFiles[file.id] = file;
                currentFiles[file.id].updated_name = _applyOperationsOnFilename.apply(this, [file.name, file.ext]);
                events.emit('add_file', file);
            }
            if (newFiles.length > 0)
            {
                setTimeout($.proxy(_processNewFile, this), 0);
            }
        };

        /**
         * Applies given operations on a filename
         * @param file_name
         * @param file_ext
         */
        var _applyOperationsOnFilename = function(file_name, file_ext)
        {
            // @todo check conflicts
            var file = {name: file_name, ext: file_ext};
            for (var index in currentOperations)
            {
                // @todo apply each operation
                //file = app.models.operation.applyOperation(currentOperations[index], file);
            }
            return file.name + file.ext;
        };

    };

    app.models.main = module;

})(window.App, process);