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
        return app.utils.string.applyPatternsOnSubject(patterns, subject, function(text)
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
        return app.utils.string.applyPatternsOnSubject(patterns, subject, function(text)
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
        return app.utils.string.applyPatternsOnSubject(patterns, subject, function(text)
        {
            return type === 'uppercase' ? text.toUpperCase() : (type === 'lowercase' ? text.toLowerCase() : app.utils.string.inverseCase(text));
        });
    };

    app.models.action = module;

})(window.App);