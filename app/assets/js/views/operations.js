/**
 * Operations subview
 */
(function(window, $)
{

    'use strict';

    var module = {};

    var events = {};//new app.node.events.EventEmitter();
    var $ui = {};
    var operationTemplate;
    var actionTemplates = {};

    /**
     * Attaches an event
     * @param event
     * @param callback
     */
    module.on = function(event, callback)
    {
        //events.on(event, callback);
    };

    /**
     * Inits the subview
     * @param $dom
     */
    module.init = function($dom)
    {
        _initUI.apply(this, [$dom]);
        _initEvents.apply(this);
    };

    /**
     * Locks the UI
     * @param is_locked
     */
    module.lockInterface = function(is_locked)
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
            actionTemplates[$template.attr('rel')] = $template.html();
        });
    };

    /**
     * Inits events
     */
    var _initEvents = function()
    {
        $ui.add.on('click', _onAddOperation);
        $ui.apply.on('click', _onProcessOperations);
        $ui.operations.sortable({
            items: '.js-operation',
            axis: 'y',
            placeholder: 'js-operation-placeholder',
            zIndex: 40,
            handle: '.js-handle',
            stop: _onEditOperations
        });
        $ui.operations.on('change', '.js-select-selection-type', _onTypeSelection);
        $ui.operations.on('click', '.js-delete-operation', _onDeleteOperation);
        $ui.operations.on('change keyup', 'input,select', _onEditOperations);
        $ui.operations.on('change', '.js-apply-to', _onEditOperations);
        $ui.operations.on('change', '.js-add-action', _onAddAction);
        $ui.operations.on('click', '.js-delete-action', _onDeleteAction);
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
        var operations_list = [];
        var operations = $ui.operations.get(0).childNodes;
        for (var op_index = 0; op_index < operations.length; op_index += 1)
        {
            var operation = operations[op_index];
            var actions = operation.querySelectorAll('.js-action');
            var actions_list = [];
            for (var index = 0; index < actions.length; index += 1)
            {
                actions_list.push(_parseOperationFieldsPanel(actions[index]));
            }
            operations_list.push({
                selection: _parseOperationFieldsPanel.apply(this, [operation.querySelector('.js-current-selection-fields')]),
                actions: actions_list,
                applyTo: operation.querySelector('.js-apply-to').value
            });
        }
        events.emit('edit_operations', operations_list);
    };

    /**
     * Reads a panel of fields and returns its options
     * @param fields
     */
    var _parseOperationFieldsPanel = function(fields)
    {
        var data = {type: fields.getAttribute('rel'), options: {}};
        var inputs = fields.querySelectorAll('input[type="text"],input[type="radio"]:checked,input[type="hidden"],input[type="checkbox"]');
        for (var index = 0; index < inputs.length; index += 1)
        {
            var input = inputs[index];
            data.options[input.getAttribute('name')] = input.getAttribute('type') === 'checkbox' ? input.checked : input.value;
        }
        return data;
    };

    /**
     * Select a selection type in an operation box
     * @param evt
     * @private
     */
    var _onTypeSelection = function(evt)
    {
        var $type = $(evt.currentTarget);
        var $operation = $type.closest('.js-operation');
        $operation.find('.js-selection-fields').hide().removeClass('js-current-selection-fields');
        $operation.find('.js-selection-fields[rel="' + $type.val() + '"]').show().addClass('js-current-selection-fields');
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
            containment: $new_operation,
            stop: _onEditOperations
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
    var _onProcessOperations = function(evt)
    {
        evt.preventDefault();
        events.emit('apply_operations');
    };

    window.Operations = module;

})(window, jQuery);