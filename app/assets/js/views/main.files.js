/**
 * Files subview
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();
        var $ui = {};

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            events.on(event, callback);
        };

        this.init = function($dom)
        {
            $ui.panel = $dom;
            $ui.panel.on('dragenter', $.proxy(_onDragOver));
            $ui.panel.on('dragleave', $.proxy(_onDragLeave));
            $ui.panel.on('drop', $.proxy(_onDrop));
        };

        /**
         * Dragging stuff on the files panel
         */
        var _onDragOver = function()
        {
            $ui.panel.addClass('js-drag');
        };

        /**
         * Stops dragging stuff
         */
        var _onDragLeave = function()
        {
            $ui.panel.removeClass('js-drag');
        };

        /**
         * Dropping stuff on the files panel
         * @param evt
         */
        var _onDrop = function(evt)
        {
            _onDragLeave();
            var files = evt.originalEvent.dataTransfer.files;
            for (var index in files)
            {
                console.log(files[index].path);
            }
        };

    };

    app.views.main.files = module;

})(window.App, jQuery);