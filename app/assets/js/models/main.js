/**
 * Main model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        var currentFiles = {};

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
                    new_name: '@todo new name' // @todo apply current operations on the name
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
                currentFiles[ids[index]] = null;
            }
        };

        /**
         * Applies given operations on the current list of files
         * @param data
         */
        this.applyOperations = function(data)
        {
            app.utils.log('@todo apply new operations on current files');
            // @todo return files with updated names
        };

    };

    app.models.main = module;

})(window.App);