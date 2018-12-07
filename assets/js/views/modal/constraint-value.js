//views/array-element
define([
    "jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
    "text!templates/modal/constraint-value-modal.html", "text!templates/modal/constraint-value.html"
], function(
    $, _, Backbone, Bootstrap, PubSub,
    ArrayOptionModal, ArrayOptionValue
){
    return Backbone.View.extend({

        mainTemplate: _.template(ArrayOptionModal),
        valueTemplate: _.template(ArrayOptionValue),
        initialize: function()
        {
            var that = this;

          // TODO: (explanation in 'dismissModal' function) (same issue in views/modal/array-option.js)
	        $("#arrayElementModal").not(".in").parent().modal("destroy"); // destroy removes all events listeners, modal and internal views.
	        $("#arrayElementModal").not(".in").parent().remove(); // remove leftover modals if any
        }

        ,render: function()
        {
            this.$el.html(this.mainTemplate({model: this.model}));
            this.renderValue();
            this.$el.appendTo("#modalsDiv");

            $("#arrayElementModal").modal("show");
        }
        
        ,renderValue: function()
        {
            var that = this;
            this.$el.find("#elementValueDiv").empty();
            this.$el.find("#elementValueDiv").html(this.valueTemplate({model: that.model}));
        }

        ,events: {
            "click #elementSave": "saveHandler",
            "click #elementCancel": "cancelHandler"
        }

        /**
         * save the element
         * @param e  The mouse event
         */
        ,saveHandler: function(e)
        {
            //prevent the default action, we want so define our own
            e.preventDefault();

            var value = $("#elementValue").val();
            this.model.set({"value": value});

            //check if we are saving existing instead of adding as well
            if(this.model.fresh) {
                this.collection.add(this.model);
            }

            //set the model's fresh attribute to false
            //This enables the model to be edited later
            this.model.fresh = false;

            // this.parentView.render();
	          PubSub.trigger("constraintModal:Update");
            this.dismissModal();
        }

        /**
         * cancel without saving
         */
        ,cancelHandler: function(e)
        {
            e.preventDefault();

            this.dismissModal();
        }


        /**
         * Dismiss the modal
         */
        ,dismissModal: function()
        {
            $("#arrayElementModal").modal('hide');

	        var that = this;
	        this.$el.on("hidden.bs.modal", function(){
			        PubSub.trigger("deleteView", this);
			        // PubSub.trigger("deleteView", that);
			        // TODO: the array element modal has some odd glitches
			        // for some reason it leaves behind some old views
			        // that mess up new modals later on, here is a workaround to
			        // make sure things work as intended
			        // in place of just calling the PubSub method above:

			        that.remove(); // remove the new element view
			        $("#arrayElementModal").not(".in").parent().remove(); // remove leftover modals because duplicates sometimes get created on editing for reasons I have not yet figured out
			        PubSub.trigger("constraintModal:Update"); // make sure the parent modal is rendered with changes
            });
        }

        /**
         * Links the parent view to this view
         * @param parentView  parent backbone view
         * @returns {exports}  returns `this` for method chaining
         */
        ,linkParentView: function(parentView)
        {
            this.parentView = parentView;
            return this;
        }


        /**
         * Sets the target collection to save this views model to
         * @param array   the Backbone collection to save the model to
         * @returns {exports}  returns `this` for method chaining
         */
        ,setTargetCollection: function(collection)
        {
            this.collection = collection;
            return this;
        }

    });
});
