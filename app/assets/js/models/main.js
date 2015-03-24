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
                    currentFiles[id] = new_files[id] = {
                        id: id,
                        dir: file.dir,
                        name: file.name,
                        ext: file.ext,
                        updated_name: _applyOperationsOnFilename.apply(this, [file.name, file.ext])
                    };
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
                currentFiles[index].updated_name = _applyOperationsOnFilename.apply(this, [file.name, file.ext]);
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
            // @todo apply operations
            // @todo check conflicts
            app.utils.log(file_name + ' - ' + file_ext);
            for (var index in currentOperations)
            {
                app.utils.log(currentOperations[index]);
            }
            return file_name + file_ext + new Date().getTime();
        };

    };

    app.models.main = module;

})(window.App);