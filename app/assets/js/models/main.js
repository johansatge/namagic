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
                        name: file.name,
                        ext: file.ext,
                        updated_name: _applyOperationsOnFilename.apply(this, [file.name, file.ext])
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
                currentFiles[index].updated_name = _applyOperationsOnFilename.apply(this, [currentFiles[index].name, currentFiles[index].ext]);
            }
            return currentFiles;
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
            return file.name + file.ext + new Date().getTime();
        };

    };

    app.models.main = module;

})(window.App);