/**
 * String utils
 */
(function(app, $)
{

    'use strict';

    var module = {};

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