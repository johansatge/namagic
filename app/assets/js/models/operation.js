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
         * @param filename
         */
        this.applyOperation = function(operation, filename)
        {
            if (operation.search !== false && operation.action !== false)
            {
                var name = filename.substring(0, filename.lastIndexOf('.'));
                var ext = filename.substring(filename.lastIndexOf('.'));
                if (operation.applyTo === 'filename')
                {
                    return _doActionOnSubject.apply(this, [name, operation.search, operation.action]) + ext;
                }
                if (operation.applyTo === 'extension')
                {
                    return name + _doActionOnSubject.apply(this, [ext, operation.search, operation.action]);
                }
                if (operation.applyTo === 'both')
                {
                    return _doActionOnSubject.apply(this, [filename, operation.search, operation.action]);
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
        var _doActionOnSubject = function(subject, search, action)
        {
            app.utils.log(search);
            app.utils.log(action);
            // @todo search and action
            return subject + new Date().getTime();
        };

    };

    app.models.operation = module;

})(window.App);