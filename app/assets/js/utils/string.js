/**
 * String utils
 */
(function(app, $)
{

    'use strict';

    var module = {};

    /**
     * Applies patterns on the given subject by using the required callable
     * @param patterns
     * @param subject
     * @param callable
     */
    module.applyPatternsOnSubject = function(patterns, subject, callable)
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
    module.inverseCase = function(text)
    {
        var new_text = '';
        for (var str_index = 0; str_index < text.length; str_index += 1)
        {
            new_text += text.charAt(str_index) === text.charAt(str_index).toLowerCase() ? text.charAt(str_index).toUpperCase() : text.charAt(str_index).toLowerCase();
        }
        return new_text;
    };

    /**
     * Quotes the given subject to be used in a regex
     * @param subject
     */
    module.quoteRegex = function(subject)
    {
        var regex = new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g');
        return subject.replace(regex, '\\$&');
    };

    app.utils.string = module;

})(window.App, jQuery);