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

    /**
     * Formats the given date
     * @param date
     * @param format
     */
    module.formatDate = function(date, format)
    {
        var object = new Date(date);
        var formatted_date = format;
        var parts = {
            'YYYY': object.getFullYear(),
            'MM': object.getMonth() + 1,
            'DD': object.getDate(),
            'hh': object.getHours(),
            'mm': object.getMinutes(),
            'ss': object.getSeconds()
        };
        for (var part in parts)
        {
            formatted_date = formatted_date.replace(part, _addLeadingZero(parts[part]));
        }
        return formatted_date;
        /*
         YYYY = four-digit year
         MM   = two-digit month (01=January, etc.)
         DD   = two-digit day of month (01 through 31)
         hh   = two digits of hour (00 through 23) (am/pm NOT allowed)
         mm   = two digits of minute (00 through 59)
         ss   = two digits of second (00 through 59)
         */
    };

    /**
     * Adds a leading zero to a string if needed
     * @param text
     */
    var _addLeadingZero = function(text)
    {
        var number = parseInt(text);
        return number >= 10 ? number : '0' + number;
    };

    app.utils.string = module;

})(window.App, jQuery);