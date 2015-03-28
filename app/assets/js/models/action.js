/**
 * Actions model
 */
(function(app)
{

    'use strict';

    var module = {};

    /**
     * Inserts free text
     * @param subject
     * @param index
     * @param patterns
     * @param options
     */
    module.freeText = function(subject, index, patterns, options)
    {
        return _applyPatternOnSubject(patterns, subject, function(text)
        {
            return options.text;
        });
    };

    /**
     * Inserts a sequence of digits
     * @param subject
     * @param index
     * @param patterns
     * @param options
     */
    module.digitsSequence = function(subject, index, patterns, options)
    {
        var start_index = !isNaN(parseInt(options.startIndex)) ? parseInt(options.startIndex) : 0;
        var step = !isNaN(parseInt(options.step)) ? parseInt(options.step) : 1;
        return _applyPatternOnSubject(patterns, subject, function(text)
        {
            return start_index + (index * step);
        });
    };

    /**
     * Inserts date and time
     * @param subject
     * @param index
     * @param patterns
     * @param options
     */
    module.dateAndTime = function(subject, index, patterns, options)
    {
        // @todo
        // options.type (creation / modification / today)
        // options.format
        return subject;
    };

    /**
     * Updates text case
     * @param subject
     * @param index
     * @param patterns
     * @param options
     */
    module.updateCase = function(subject, index, patterns, options)
    {
        if (typeof options.type === 'undefined' || options.type === '')
        {
            return subject;
        }
        var type = options.type;
        return _applyPatternOnSubject(patterns, subject, function(text)
        {
            return type === 'uppercase' ? text.toUpperCase() : (type === 'lowercase' ? text.toLowerCase() : _inverseCase(text));
        });
    };

    /**
     * Applies patterns on the given subject by using the required callable
     * @param patterns
     * @param subject
     * @param callable
     */
    var _applyPatternOnSubject = function(patterns, subject, callable)
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
     * Inverses the case of the given text
     * @param text
     */
    var _inverseCase = function(text)
    {
        var new_text = '';
        for (var str_index = 0; str_index < text.length; str_index += 1)
        {
            new_text += text.charAt(str_index) === text.charAt(str_index).toLowerCase() ? text.charAt(str_index).toUpperCase() : text.charAt(str_index).toLowerCase();
        }
        return new_text;
    };

    app.models.action = module;

})(window.App);