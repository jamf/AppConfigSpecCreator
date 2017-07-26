//views/modal/constraint
define([
    "jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
    "text!templates/modal/constraint.html"
], function(
    $, _, Backbone, Bootstrap, PubSub,
    ConstraintModalTemplate
){
    return Backbone.View.extend({

        template: _.template(ConstraintModalTemplate),

        initialize: function()
        {
            var that = this;

            this.render();
            $("#constraintModal").modal("show");

        }

        ,render: function()
        {
            this.$el.html(this.template({model: this.model}));

            this.$el.appendTo("#modalsDiv");
        }

        ,events: {
            "click #constraintSave": "saveHandler",
            "click #constraintCancel": "cancelHandler"
        }

        ,saveHandler: function()
        {
            this.model.setNullable(this.getNullable());
            if(this.getNullable()) this.model.setNullableSelected(true);
            else this.model.setNullableSelected(false);
            this.model.setMin(this.getMin());
            this.model.setMinSelected(this.getMinSelected());
            this.model.setMax(this.getMax());
            this.model.setMaxSelected(this.getMaxSelected());
            this.model.setPattern(this.getPattern());
            this.model.setPatternSelected(this.getPatternSelected());

            this.dismissModal();
        }

        ,cancelHandler: function()
        {

            this.dismissModal();
        }



        ,getNullable: function()
        {
            return $("#fieldConstraintsNullable").is(":checked");
        }

        ,getMinSelected: function()
        {
            return $("#constraintMinSelected").is(":checked");
        }

        ,getMin: function()
        {
            return $("#fieldConstraintsMin").val();
        }

        ,getMaxSelected: function()
        {
            return $("#constraintMaxSelected").is(":checked");
        }

        ,getMax: function()
        {
            return $("#fieldConstraintsMax").val();
        }

        ,getPatternSelected: function()
        {
            return $("#constraintPatternSelected").is(":checked");
        }

        ,getPattern: function()
        {
            return $("#fieldConstraintsPattern").val();
        }

        ,dataTypeCheck: function()
        {

        }

        /**
         * Dismiss the modal
         */
        ,dismissModal: function()
        {
            $("#constraintModal").modal('hide');


            this.$el.on("hidden.bs.modal", function(){
                PubSub.trigger("deleteView", this);
            });
        }
    });
});