/**
 * Operations model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        this.applyOperation = function(operation, file_name, file_ext)
        {
            // @todo apply operation
            return file_name + file_ext + new Date().getTime();
        };


    };

    app.models.operation = module;

})(window.App);