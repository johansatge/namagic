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
            $ui.placeholder = $dom.find('.js-placeholder');
            $ui.add = $dom.find('.js-operation-add');
            $ui.apply = $dom.find('.js-operation-apply');
            $ui.operations = $dom.find('.js-operations');
            operationTemplate = $dom.find('.js-operation-template').html();
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.add.on('click', $.proxy(_onAddOperation, this));
            $ui.apply.on('click', $.proxy(_onApplyOperations, this));
            $ui.operations.sortable({items: '.js-operation', axis: 'y', placeholder: 'js-sortable', zIndex: 40});
        };

        /**
         * Adds an operation
         * @param evt
         */
        var _onAddOperation = function(evt)
        {
            evt.preventDefault();
            var $new_operation = $(operationTemplate);
            $ui.operations.append($new_operation);
            $ui.operations.sortable('refresh');
            $new_operation.find('.js-delete').on('click', $.proxy(_onDeleteOperation, this))
            $ui.placeholder.addClass('js-hidden');
        };

        /**
         * Deletes an operation
         * @param evt
         */
        var _onDeleteOperation = function(evt)
        {
            evt.preventDefault();
            $(evt.currentTarget).closest('.js-operation').remove();
            $ui.operations.sortable('refresh');
            $ui.placeholder.toggleClass('js-hidden', $ui.operations.children().length > 0);
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