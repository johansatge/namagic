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
         * Applies given operations on the file
         * @param operations
         * @param index
         */
        this.processOperations = function(operations, index)
        {
            this.updatedName = this.getName();
            var filepath = this.getDirectory() + '/' + this.getName();
            for (var num = 0; num < operations.length; num += 1)
            {
                _processOperationOnFile.apply(this, [operations[num], index, filepath]);
            }
        };

        /**
         * Searches pattern in the given subject and applies action on it
         * @todo refactor this
         * @param operation
         * @param fileindex
         * @param filepath
         */
        var _processOperationOnFile = function(operation, fileindex, filepath)
        {
            var name = this.updatedName.substring(0, this.updatedName.lastIndexOf('.'));
            var ext = this.updatedName.substring(this.updatedName.lastIndexOf('.'));
            var subject;
            if (operation.applyTo === 'filename')
            {
                subject = name;
            }
            if (operation.applyTo === 'extension')
            {
                subject = ext;
            }
            if (operation.applyTo === 'both')
            {
                subject = this.updatedName;
            }
            if (operation.selection === false || operation.actions.length === 0)
            {
                return subject;
            }
            var selection_callable = app.models.selection[operation.selection.type];
            var patterns = selection_callable(subject, operation.selection.options);
            var updated_subject = _applyPatternsOnSubject.apply(this, [patterns, subject, function(text)
            {
                var updated_text = text;
                for (var index = 0; index < operation.actions.length; index += 1)
                {
                    var action = operation.actions[index];
                    var new_text = app.models.action[action.type](updated_text, fileindex, patterns, action.options, filepath);
                    updated_text = new_text.type === 'remove' ? '' : (new_text.type === 'add' ? updated_text + new_text.text : new_text.text);
                }
                return updated_text;
            }]);
            if (operation.applyTo === 'filename')
            {
                this.updatedName = updated_subject + ext;
            }
            if (operation.applyTo === 'extension')
            {
                this.updatedName = name + updated_subject;
            }
            if (operation.applyTo === 'both')
            {
                this.updatedName = updated_subject;
            }

            // @todo check if filepath exists when doing a stats() in an action; set error otherwise
            this.setError(true, '@todo');

        };

        /**
         * Applies patterns on the given subject by using the required callable
         * @param patterns
         * @param subject
         * @param callable
         */
        var _applyPatternsOnSubject = function(patterns, subject, callable)
        {
            var updated_subject = '';
            var previous_pattern = false;
            var pattern = false;
            for (var index = 0; index < patterns.length; index += 1)
            {
                pattern = patterns[index];
                updated_subject += subject.substring(previous_pattern !== false ? previous_pattern.end : 0, pattern.start);
                updated_subject += callable(subject.substring(pattern.start, pattern.end));
                previous_pattern = pattern;
            }
            return pattern !== false ? updated_subject + subject.substring(previous_pattern.end) : subject;
        };

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