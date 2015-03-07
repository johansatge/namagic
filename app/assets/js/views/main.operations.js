/**
 * Operations subview
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();
        var $ui = {};
        var operationTemplate;

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            events.on(event, callback);
        };

        /**
         * Inits the subview
         * @param $dom
         */
        this.init = function($dom)
        {
            _initUI.apply(this, [$dom]);
            _initEvents.apply(this);
        };

        /**
         * Inits UI
         * @param $dom
         */
        var _initUI = function($dom)
        {
            $ui.panel = $dom;
            $ui.add = $dom.find('.js-operation-add');
            $ui.apply = $dom.find('.js-operation-apply');
            operationTemplate = $dom.find('.js-operation-template').html();
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.add.on('click', $.proxy(_onAddOperation, this));
            $ui.apply.on('click', $.proxy(_onApplyOperations, this));
        };

        /**
         * Adds an operation
         * @param evt
         */
        var _onAddOperation = function(evt)
        {
            evt.preventDefault();
            console.log('add @todo');
        };

        /**
         * Applies operations
         * @param evt
         */
        var _onApplyOperations = function(evt)
        {
            evt.preventDefault();
            console.log('apply @todo')
        };

    };

    app.views.main.operations = module;

})(window.App, jQuery);