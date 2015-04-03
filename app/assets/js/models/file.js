/**
 * File model
 */
(function(app)
{

    'use strict';

    var module = function(_id, _dir, _name)
    {

        var hasError = false;

        this.id = _id;
        this.dir = _dir;
        this.name = _name;
        this.message = '';
        this.updatedName = '';

        /**
         * Sets the error status of the file
         * @param has_error
         * @param text
         */
        this.setError = function(has_error, text)
        {
            hasError = has_error;
            this.message = text;
        };

        /**
         * Checks if the file has an error status
         */
        this.hasError = function()
        {
            return hasError;
        }

    };

    app.models.file = module;

})(window.App);