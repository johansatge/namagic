/**
 * Locale utils
 */
(function(app)
{

    'use strict';

    var module = {};
    var strings = {};

    /**
     * Inits locale module
     * @param language_code
     */
    module.init = function(language_code)
    {
        language_code = _parseLanguageCode(language_code);
        var json;
        try
        {
            json = eval('(' + app.node.fs.readFileSync('locale/' + language_code + '.json') + ')');
        }
        catch (error)
        {
            json = eval('(' + app.node.fs.readFileSync('locale/en.json') + ')');
        }
        json.manifest = app.node.gui.App.manifest;
        _parseObject('', json);
    };

    /**
     * Gets a locale string
     * @param id
     * @return string
     */
    module.get = function(id)
    {
        return typeof strings[id] !== 'undefined' ? strings[id] : id;
    };

    /**
     * Gets all locale strings
     */
    module.getAll = function()
    {
        return strings;
    };

    /**
     * Parses an object and makes its hierarchy flat by using dots (.)
     * @param prefix
     * @param json
     * @private
     */
    var _parseObject = function(prefix, json)
    {
        for (var index in json)
        {
            if (typeof json[index] === 'string')
            {
                strings[prefix + (prefix !== '' ? '.' : '') + index] = json[index];
            }
            else
            {
                _parseObject(prefix + (prefix !== '' ? '.' : '') + index, json[index]);
            }
        }
    };

    /**
     * Checks the given language code
     * @param raw_code
     */
    var _parseLanguageCode = function(raw_code)
    {
        if (raw_code.search('-') === -1)
        {
            return raw_code;
        }
        return raw_code.substring(0, raw_code.indexOf('-'));
    };

    app.utils.locale = module;

})(window.App);