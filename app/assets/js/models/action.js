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
     * @param patterns
     * @param options
     */
    module.freeText = function(subject, patterns, options)
    {
        // @todo
        // options.text
        return subject;
    };

    /**
     * Inserts a sequence of digits
     * @param subject
     * @param patterns
     * @param options
     */
    module.digitsSequence = function(subject, patterns, options)
    {
        // @todo
        // options.startIndex
        // options.step
        return subject;
    };

    /**
     * Inserts date and time
     * @param subject
     * @param patterns
     * @param options
     */
    module.dateAndTime = function(subject, patterns, options)
    {
        // @todo
        // options.type
        // options.format
        return subject;
    };

    /**
     * Updates text case
     * @param subject
     * @param patterns
     * @param options
     */
    module.updateCase = function(subject, patterns, options)
    {
        if (typeof options.type === 'undefined' || options.type === '')
        {
            return subject;
        }
        var type = options.type;
        for (var index = 0; index < patterns.length; index += 1)
        {
            var pattern = patterns[index];
            subject = _applyPatternOnSubject(pattern, subject, function(text)
            {
                return type === 'uppercase' ? text.toUpperCase() : (type === 'lowercase' ? text.toLowerCase() : _inverseCase(text));
            });
        }
        return subject;
    };

    /**
     * Applies a pattern on the given subject by using the required callable
     * @param pattern
     * @param subject
     * @param callable
     */
    var _applyPatternOnSubject = function(pattern, subject, callable)
    {
        var updated_subject = subject.substring(0, pattern.start);
        updated_subject += callable(subject.substring(pattern.start, pattern.end));
        updated_subject += subject.substring(pattern.end);
        return updated_subject;
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