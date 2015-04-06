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
        var updatedName = '';

        /**
         * Applies given operations on the file
         * @param operations
         * @param file_index
         */
        this.processOperations = function(operations, file_index)
        {
            this.setError(false, '');
            updatedName = name;
            var file_path = directory + '/' + name;
            for (var op_index = 0; op_index < operations.length; op_index += 1)
            {
                var op = operations[op_index];
                if (op.selection === false || op.actions.length === 0)
                {
                    continue;
                }
                var name_part = updatedName.substring(0, updatedName.lastIndexOf('.'));
                var extension_part = updatedName.substring(updatedName.lastIndexOf('.'));
                if (op.applyTo === 'filename')
                {
                    updatedName = _processText.apply(this, [name_part, op.selection, op.actions, file_index, file_path]) + extension_part;
                }
                if (op.applyTo === 'extension')
                {
                    updatedName = name_part + _processText.apply(this, [extension_part, op.selection, op.actions, file_index, file_path]);
                }
                if (op.applyTo === 'both')
                {
                    updatedName = _processText.apply(this, [updatedName, op.selection, op.actions, file_index, file_path]);
                }
            }
        };

        /**
         * Searches for ranges of text in the given subject and applies actions on each one
         * For each range:
         * - Adds the text that comes before (after the end of the previous range or from 0)
         * - Applies the actions (an action adds text or replaces the existing one)
         * - Appends the remaining text
         * @param subject
         * @param selection
         * @param actions
         * @param file_index
         * @param file_path
         */
        var _processText = function(subject, selection, actions, file_index, file_path)
        {
            var ranges = app.models.selection[selection.type](subject, selection.options);
            var updated_subject = '';
            var previous_range = false;
            var range = false;
            for (var range_index = 0; range_index < ranges.length; range_index += 1)
            {
                range = ranges[range_index];
                updated_subject += subject.substring(previous_range !== false ? previous_range.end : 0, range.start);
                var updated_subject_part = subject.substring(range.start, range.end);
                for (var act_index = 0; act_index < actions.length; act_index += 1)
                {
                    var action_callable = app.models.action[actions[act_index].type];
                    var new_text = action_callable(updated_subject_part, actions[act_index].options, file_index, file_path);
                    updated_subject_part = new_text.type === 'add' ? updated_subject_part + new_text.text : new_text.text;
                }
                updated_subject += updated_subject_part;
                previous_range = range;
            }
            return range !== false ? updated_subject + subject.substring(range.end) : subject;
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

        this.getUpdatedName = function()
        {
            return updatedName;
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