/**
 * File model
 */
(function(app)
{

    'use strict';

    var module = function(_id, _dir, _name)
    {

        var id = _id;
        var name = _name;
        var directory = _dir;
        var hasError = false;
        var message = '';

        this.updatedName = '';

        /**
         * Returns the ID of the file
         */
        this.getID = function()
        {
            return id;
        };

        /**
         * Returns the name of the file
         */
        this.getName = function()
        {
            return name;
        };

        /**
         * Returns the directory of the file
         */
        this.getDirectory = function()
        {
            return directory;
        };

        /**
         * Checks if the file has an error status
         */
        this.hasError = function()
        {
            return hasError;
        };

        /**
         * Sets the error status of the file
         * @param has_error
         * @param text
         */
        this.setError = function(has_error, text)
        {
            hasError = has_error;
            message = text;
        };

        /**
         * Returns the message of the file
         */
        this.getMessage = function()
        {
            return message;
        };

    };

    app.models.file = module;

})(window.App);