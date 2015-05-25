/**
 * Main view
 */
(function(window, $)
{

    'use strict';

    var module = {};

    var operations = null;
    var $ui = {};

    /**
     * Inits the view
     */
    module.init = function()
    {
        $ui.window = $(window);
        $ui.body = $(window.document.body);
        $ui.filesPanel = $ui.body.find('.js-files-panel');
        $ui.operationsPanel = $ui.body.find('.js-operations-panel');
        $ui.optionsPanel = $ui.body.find('.js-toolbar-panel');

        Files.init($ui.window, $ui.filesPanel);
        Operations.init($ui.operationsPanel);


        window.addEventListener('message', function(evt)
        {
            var evt = JSON.parse(evt.data);
            if (evt.type === 'add_files')
            {
                Files.updateFiles(evt.data, true);
            }
            if (evt.type === 'update_files')
            {
                Files.updateFiles(evt.data, false);
            }
            if (evt.type === 'remove_files')
            {
                Files.removeFiles(evt.data);
            }
            if (evt.type === 'set_progress')
            {
                Files.setProgress(evt.data);
            }
            if (evt.type === 'lock_ui')
            {
                Files.lockInterface(evt.data);
                Operations.lockInterface(evt.data);
            }
        });

        $ui.window.on('resize', _onWindowResize).trigger('resize');
    };

    /**
     * Window resize
     */
    var _onWindowResize = function()
    {
        var win_width = $ui.window.width();
        var win_height = $ui.window.height();
        var options_height = $ui.optionsPanel.height();
        $ui.filesPanel.css({
            width: (win_width - $ui.operationsPanel.width() - 1) + 'px',
            height: (win_height - options_height) + 'px'
        });
        $ui.operationsPanel.css({height: (win_height - options_height) + 'px'});
    };

    window.Main = module;

})(window, jQuery);