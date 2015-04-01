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
        var actionTemplates = {};

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
         * Locks the UI
         * @param is_locked
         */
        this.lockInterface = function(is_locked)
        {
            $ui.add.attr('disabled', is_locked ? 'disabled' : null);
            $ui.apply.attr('disabled', is_locked ? 'disabled' : null);
            $ui.operations.find('input,select,button').attr('disabled', is_locked ? 'disabled' : null);
            $ui.operations.sortable(is_locked ? 'disable' : 'enable');
            $ui.operations.find('.js-actions').sortable(is_locked ? 'disable' : 'enable');
            $ui.panel.toggleClass('js-disabled', is_locked);
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
            $dom.find('.js-action-template').each(function()
            {
                var $template = $(this);
                actionTemplates[$template.data('type')] = $template.html();
            });
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.add.on('click', $.proxy(_onAddOperation, this));
            $ui.apply.on('click', $.proxy(_onApplyOperations, this));
            $ui.operations.sortable({
                items: '.js-operation',
                axis: 'y',
                placeholder: 'js-operation-placeholder',
                zIndex: 40,
                handle: '.js-handle',
                stop: $.proxy(_onEditOperations, this)
            });
            $ui.operations.on('change', '.js-select-selection-type', $.proxy(_onSelectselectionType, this));
            $ui.operations.on('click', '.js-delete-operation', $.proxy(_onDeleteOperation, this));
            $ui.operations.on('change keyup', 'input,select', $.proxy(_onEditOperations, this));
            $ui.operations.on('change', '.js-apply-to', $.proxy(_onEditOperations, this));
            $ui.operations.on('change', '.js-add-action', $.proxy(_onAddAction, this));
            $ui.operations.on('click', '.js-delete-action', $.proxy(_onDeleteAction, this));
        };

        /**
         * Adds a new action in the needed operation
         * @param evt
         */
        var _onAddAction = function(evt)
        {
            var $select = $(evt.currentTarget);
            var $operation = $select.closest('.js-operation');
            var $new_action = $(actionTemplates[$select.val()]);
            $select.val('');
            $operation.find('.js-actions').append($new_action).sortable('refresh');
            $operation.find('.js-no-action').hide();
            _onEditOperations.apply(this);
        };

        /**
         * Deletes an action
         * @param evt
         */
        var _onDeleteAction = function(evt)
        {
            var $button = $(evt.currentTarget);
            var $operation = $button.closest('.js-operation');
            $button.closest('.js-action').remove();
            $operation.find('.js-no-action').toggle($operation.find('.js-action').length === 0);
            _onEditOperations.apply(this);
        };

        /**
         * Sends an event when editing operations
         */
        var _onEditOperations = function()
        {
            var operations = [];
            var $operations = $ui.operations.children();
            $operations.each(function()
            {
                var $operation = $(this);
                var $selection = $operation.find('.js-selection-fields:visible');
                var $actions = $operation.find('.js-action');
                var actions = [];
                $actions.each(function()
                {
                    actions.push(_parseOperationFieldsPanel($(this)));
                });
                var operation = {
                    selection: _parseOperationFieldsPanel.apply(this, [$selection]),
                    actions: actions,
                    applyTo: $operation.find('.js-apply-to option:selected').val()
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
            var $inputs = $fields_panel.find('input[type="text"],input[type="radio"]:checked,input[type="hidden"]');
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
         * Select a selection type in an operation box
         * @param evt
         * @private
         */
        var _onSelectselectionType = function(evt)
        {
            var $type = $(evt.currentTarget);
            var $operation = $type.closest('.js-operation');
            $operation.find('.js-selection-fields').hide();
            $operation.find('.js-selection-fields[data-type="' + $type.val() + '"]').show();
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
            $new_operation.find('.js-selection-fields').hide();
            $new_operation.find('.js-actions').sortable({
                items: '.js-action',
                placeholder: 'js-action-placeholder',
                handle: '.js-action-handle',
                axis: 'y',
                stop: $.proxy(_onEditOperations, this)
            });
            $new_operation.find('.js-select-selection-type').trigger('change');
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
            events.emit('apply_operations');
        };

    };

    app.views.operations = module;

})(window.App, jQuery);