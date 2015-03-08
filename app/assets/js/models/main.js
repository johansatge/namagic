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
                        // @todo return an ID - will be used later to update the view for each file
                        dir: raw_files[index].path.substring(0, raw_files[index].path.length - raw_files[index].name.length),
                        name: raw_files[index].name
                    });
                }
            }
            return files;
        };

    };

    app.models.main = module;

})(window.App);