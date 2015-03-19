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
         * @todo look for duplicates
         * @param files
         */
        this.addFiles = function(files)
        {
            var new_files = [];
            for (var index in files)
            {
                var id = app.node.crypto.createHash('md5').update(files[index].dir + files[index].name).digest('hex');
                currentFiles[id] = new_files[id] = {
                    id: id,
                    dir: files[index].dir,
                    current_name: files[index].name,
                    new_name: _applyOperationsOnFilename.apply(this, [files[index].name])
                };
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
                currentFiles[index].new_name = _applyOperationsOnFilename.apply(this, [currentFiles[index].current_name]);
            }
            return currentFiles;
        };

        /**
         * Applies given operations on a filename
         * @param filename
         */
        var _applyOperationsOnFilename = function(filename)
        {
            // @todo apply operations
            app.utils.log(filename);
            app.utils.log(currentOperations);
            return filename + new Date().getTime()
        };

    };

    app.models.main = module;

})(window.App);