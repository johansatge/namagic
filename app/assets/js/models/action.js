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
        for (var index = 0; index < patterns.length; index += 1)
        {
            var pattern = patterns[index];
            var pattern_subject = subject.substring(pattern.start, pattern.length);
            subject = subject.substring(0, pattern.start);
            if (options.type === 'uppercase')
            {
                subject += pattern_subject.toUpperCase();
            }
            if (options.type === 'lowercase')
            {
                subject += pattern_subject.toLowerCase();
            }
            if (options.type === 'invert')
            {
                for (var str_index = 0; str_index < pattern_subject.length; str_index += 1)
                {
                    subject += pattern_subject.charAt(str_index) === pattern_subject.charAt(str_index).toLowerCase() ? pattern_subject.charAt(str_index).toUpperCase() : pattern_subject.charAt(str_index).toLowerCase();
                }
            }
            subject += subject.substring(pattern.start + pattern.length);
        }
        return subject;
    };

    app.models.action = module;

})(window.App);