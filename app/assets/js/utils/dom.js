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
     * @param class_name
     * @param add_class
     */
    module.toggleClass = function(element, class_name, add_class)
    {
        var has_class = element.className.search(new RegExp('[ ^]' + class_name + '[ "]', 'g')) !== -1;
        add_class = add_class !== undefined ? add_class : !has_class;
        if (add_class && !has_class)
        {
            element.className += ' ' + class_name;
        }
        if (!add_class)
        {
            element.className = element.className.replace(new RegExp(class_name, 'g'), '');
        }
    };

    app.utils.dom = module;

})(window.App);