/**
 * File model
 */
(function(app)
{

    'use strict';

    var module = function(_id, _dir, _name)
    {

        var name = _name;
        var directory = _dir;
        var hasError = false;

        this.id = _id;
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
        };

        /**
         * Returns the directory of the file
         */
        this.getDirectory = function()
        {
            return directory;
        };

        /**
         * Returns the name of the file
         */
        this.getName = function()
        {
            return name;
        };

    };

    app.models.file = module;

})(window.App);