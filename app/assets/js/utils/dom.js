/**
 * DOM utils
 */
(function(app)
{

    'use strict';

    var module = {};

    /**
     * Toggles a class
     * @param element
     * @param classname
     * @param condition
     */
    module.toggleClass = function(element, classname, condition)
    {
        if (condition)
        {
            element.className += element.className.search(new RegExp('[ ^]' + classname + '[ "]', 'g')) === -1 ? ' ' + classname : '';
        }
        else
        {
            element.className = element.className.replace(new RegExp(classname, 'g'), '');
        }
    };

    app.utils.dom = module;

})(window.App);