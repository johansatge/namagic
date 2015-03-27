/**
 * Main model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        var currentFiles = {};
        var currentOperations = [];

        /**
         * Adds a list of files
         * @param files
         */
        this.addFiles = function(files)
        {
            var new_files = [];
            for (var index in files)
            {
                var file = app.node.path.parse(files[index]);
                var id = app.node.crypto.createHash('md5').update(files[index]).digest('hex');
                if (typeof currentFiles[id] === 'undefined')
                {
                    var new_file = {
                        id: id,
                        dir: file.dir,
                        name: file.name + file.ext,
                        updated_name: _applyOperationsOnFilename.apply(this, [file.name + file.ext])
                    };
                    new_files.push(new_file);
                    currentFiles[id] = new_file;
                }
            }
            return new_files;
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
                currentFiles[index].updated_name = _applyOperationsOnFilename.apply(this, [currentFiles[index].name]);
            }
            return currentFiles;
        };

        /**
         * Applies given operations on a filename
         * @param filename
         */
        var _applyOperationsOnFilename = function(filename)
        {
            // @todo check conflicts
            for (var index in currentOperations)
            {
                var operation = currentOperations[index];
                if (operation.search !== false && operation.action !== false)
                {
                    var name = filename.substring(0, filename.lastIndexOf('.'));
                    var ext = filename.substring(filename.lastIndexOf('.'));
                    if (operation.applyTo === 'filename')
                    {
                        return _applyOperation.apply(this, [name, operation.search, operation.action]) + ext;
                    }
                    if (operation.applyTo === 'extension')
                    {
                        return name + _applyOperation.apply(this, [ext, operation.search, operation.action]);
                    }
                    if (operation.applyTo === 'both')
                    {
                        return _applyOperation.apply(this, [filename, operation.search, operation.action]);
                    }
                    return filename;
                }
            }
            return filename;
        };

        /**
         * Searches pattern in the given subject and applies action on it
         * @param subject
         * @param search
         * @param action
         */
        var _applyOperation = function(subject, search, action)
        {
            var search_patterns = app.models.search[search.type](subject, search.options);
            return app.models.action[action.type](subject, search_patterns, action.options);
        }

    };

    app.models.main = module;

})(window.App);