/**
 * Operations model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        /**
         * Applies an operation on the given file
         * @param operation
         * @param file_name
         * @param file_ext
         */
        this.applyOperation = function(operation, file_name, file_ext)
        {
            // @todo apply operation
            app.utils.log(operation);
            return file_name + new Date().getTime() + file_ext;
        };


    };

    app.models.operation = module;

})(window.App);