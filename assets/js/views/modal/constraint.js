//views/modal/constraint
define([
    "jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
    "text!templates/modal/constraint.html", "views/constraint-values", "views/modal/constraint-value",
	  "models/constraint-value"
], function(
    $, _, Backbone, Bootstrap, PubSub,
    ConstraintModalTemplate, ConstraintValuesView, ConstraintValueModalView,
    ConstraintValueModel
){
    return Backbone.View.extend({

        template: _.template(ConstraintModalTemplate),

        initialize: function()
        {
            var that = this;

	          this.model.set("constraintValuesView", new ConstraintValuesView({collection: this.model.getValuesCollection()}));

            this.render();
            $("#constraintModal").modal("show");

	          PubSub.on("constraintModal:EditConstraintValue", this.showConstraintValueModal, this);
	          PubSub.on("constraintModal:Update", this.renderSubsets, this);
        }

        , setConstraintValuesView(v) {
            this.model.set("constraintValuesView", v);
            this.$el.on("shown.bs.modal", function () {
                $("#fieldConstraintsMin").focus();
            });
        }

        , getConstraintValuesView() {
            return this.model.get("constraintValuesView");
        }

        , showConstraintValueModal: function (model, collection) {
            new ConstraintValueModalView({model: model}).linkParentView(this).setTargetCollection(collection).render();
        }

        ,renderSubsets: function () {
            let m = this.model;
            this.$el.find("#fieldConstraintValues").empty();
            this.$el.find("#fieldConstraintValues").append(m.get("constraintValuesView").render().$el);
	      }

        ,render: function()
        {
            this.$el.html(this.template({model: this.model}));
            this.renderSubsets();
            this.$el.appendTo("#modalsDiv");
        }

        ,events: {
            "click #constraintSave": "saveHandler",
            "click #constraintCancel": "cancelHandler",
            "keydown": "keyAction",
            "click #fieldConstraintValuesAdd": "constraintValueModalCallback"
        }

        , constraintValueModalCallback: function (e) {
            e.preventDefault();
            var collection = this.model.getValuesCollection();
            var model = new ConstraintValueModel();
            this.showConstraintValueModal(model, collection);
        }

        , keyAction: function(e) {
            var code = e.keyCode || e.which;
            if (code == 27) {
              this.cancelHandler(e);
            } else if (code == 13) {
              this.saveHandler(e);
            }
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