/**
 * Main model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        /**
         * Parses a list of files
         * @todo look for duplicates
         * @param raw_files
         */
        this.parseFiles = function(raw_files)
        {
            var files = [];
            for (var index in raw_files)
            {
                if (typeof raw_files[index].path !== 'undefined' && raw_files[index].path !== '')
                {
                    files.push({
                        id: '@todo id',
                        dir: raw_files[index].path.substring(0, raw_files[index].path.length - raw_files[index].name.length),
                        basename: raw_files[index].name,
                        newname: '@todo new name' // @todo apply current operations on the name
                    });
                }
            }
            return files;
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