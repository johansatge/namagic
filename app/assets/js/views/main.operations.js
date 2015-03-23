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
            $ui.operations.on('change', '.js-select-type', $.proxy(_onSelectType, this));
            $ui.operations.on('click', '.js-delete', $.proxy(_onDeleteOperation, this));
            $ui.operations.on('change keyup', 'input,select', $.proxy(_onEditOperations, this));
            //$ui.operations.on('change', '.js-toggle', $.proxy(_onToggleField, this));
        };

        /**
         * Toggles areas depending on the clicked field
         * @param evt
         *
         var _onToggleField = function(evt)
         {
             var $fields = $(evt.currentTarget).closest('.js-fields');
             var $current_toggle = $fields.find('.js-toggle:checked');
             var $toggle_targets = $fields.find('.js-toggle-target');
             $toggle_targets.hide();
             if ($current_toggle.length > 0 && typeof $current_toggle.data('toggle') !== 'undefined')
             {
                 $toggle_targets.filter('.' + $current_toggle.data('toggle')).show();
             }
         };*/

        /**
         * Editing operations
         */
        var _onEditOperations = function()
        {
            var operations = [];
            var $operations = $ui.operations.children();
            $operations.each(function()
            {
                var $operation = $(this);
                var $search = $operation.find('.js-search .js-fields:visible');
                var $replace = $operation.find('.js-replace .js-fields:visible');
                var operation = {
                    search: _parseOperationFieldsPanel.apply(this, [$search]),
                    replace: _parseOperationFieldsPanel.apply(this, [$replace])
                };
                operations.push(operation);
            });
            events.emit('edit_operations', operations);
        };

        /**
         * Reads a panel of fields and returns its options
         * @param $fields_panel
         */
        var _parseOperationFieldsPanel = function($fields_panel)
        {
            if ($fields_panel.length === 0)
            {
                return false;
            }
            var fields_panel = {type: $fields_panel.data('type'), options: {}};
            var $inputs = $fields_panel.find('input[type="text"],input[type="radio"]:checked');
            $inputs.each(function()
            {
                var $option = $(this);
                fields_panel.options[$option.attr('name')] = $option.val();
            });
            var $checkboxes = $fields_panel.find('input[type="checkbox"]');
            $checkboxes.each(function()
            {
                var $option = $(this);
                fields_panel.options[$option.attr('name')] = $option.is(':checked');
            });
            return fields_panel;
        };

        /**
         * Select a search or replace type in an operation box
         * @param evt
         * @private
         */
        var _onSelectType = function(evt)
        {
            var $type = $(evt.currentTarget);
            var $options = $type.closest('.js-options');
            $options.find('.js-fields').hide();
            $options.find('.js-fields[data-type="' + $type.val() + '"]').show();
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
            $new_operation.find('.js-fields').hide();
            $ui.placeholder.hide();
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
            $ui.placeholder.toggle($ui.operations.children().length === 0);
            _onEditOperations();
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