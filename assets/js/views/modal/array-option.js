//views/array-element
define([
    "jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
    "text!templates/modal/array-option.html", "text!templates/modal/array-option-value.html"
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

            this.$el.on("shown.bs.modal", function () {
                $("#elementValue").focus();
            });
            // TODO: (explanation in 'dismissModal' function)
	          $("#arrayElementModal").not(".in").parent().modal("destroy"); // destroy removes all events listeners, modal and internal views.
	          $("#arrayElementModal").not(".in").parent().remove(); // remove leftover modals if any

            // setup temp data for modal locale shenanigans
            if (this.model.collectionType == "arrayElement") {
              this.localeTemp = {selection: "en-US", label: this.model.localizedLabel};
            }
        }

        ,render: function()
        {
            this.$el.html(this.mainTemplate({model: this.model}));
            this.renderValue();
            this.$el.appendTo("#modalsDiv");

            //If this is not a new element (i.e. we are editing an existing element)
            if(!this.model.fresh){
                this.setType(this.model.type);
            }

            $("#arrayElementModal").modal("show");
        }

        ,renderValue: function()
        {
            var that = this;
            this.$el.find("#elementValueDiv").empty();
            this.$el.find("#elementValueDiv").html(this.valueTemplate({type: that.getType(), model: that.model}));
        }

        ,events: {
            "click #elementSave": "saveHandler",
            "click #elementCancel": "cancelHandler",
            "change #elementType" : "typeChange",
            "change #optionFieldLocale": "localeSelectionChanged",
            "keydown": "keyAction"
	      }

        , keyAction: function(e) {
            var code = e.keyCode || e.which;
            if (code == 27) {
              this.cancelHandler(e);
            } else if (code == 13) {
              this.saveHandler(e);
            }
        }

        , localeSelectionChanged: function() {
          var prevLocale = this.localeTemp.selection;
          var newLocale = $("#optionFieldLocale").val();
          this.localeTemp.selection = newLocale;

          this.localeTemp.label.setLocalizedValue(prevLocale, $("#labelValue").val());
          $("#labelValue").val(this.localeTemp.label.getLocalizedValue(newLocale));
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

            if (this.model.collectionType == "arrayElement") {
              // cache current locale values
              var currentLocale = $("#optionFieldLocale").val();
              this.localeTemp.label.setLocalizedValue(currentLocale, $("#labelValue").val());

              // flush temp locale changes
              this.model.saveLocaleData(this.localeTemp.label);
            }

            //check if we are saving existing instead of adding as well
            if(this.model.fresh) {
                this.collection.add(this.model);
            }

            if (this.model.collectionType == "defaultValue") {
              //Save the element type to the model
              this.model.type = this.getType();
            }

            //set the model's fresh attribute to false
            //This enables the model to be edited later
            this.model.fresh = false;

            this.parentView.renderSubsets();
            this.dismissModal();
        }

        /**
         * cancel without saving
         */
        ,cancelHandler: function(e)
        {
            e.preventDefault();

            this.parentView.renderSubsets();

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
                // PubSub.trigger("deleteView", that);
                // TODO: the array options modal has some odd glitches
                // for some reason it leaves behind some old views
                // that mess up new modals later on, here is a workaround to
                // make sure things work as intended
                // in place of just calling the PubSub method above:

                that.remove(); // remove the new element view
                $("#arrayElementModal").not(".in").parent().remove(); // remove leftover modals because duplicates sometimes get created on editing for reasons I have not yet figured out
                PubSub.trigger("snippetModal:Update"); // make sure the snippet modal is rendered with changes
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

        /**
         * This handles when the element type is changed
         * @param e  The mouse event
         */
        ,typeChange: function(e)
        {
            this.renderValue();
        }

        /**
         * Helper function that gets the element type
         */
        ,getType: function()
        {
            return $("#elementType").find(":selected").val();
        }

        /**
         * Set the element type
         * @param type  the type to set it to. Must be either "Literal", "User Variable", or "Device Variable"
         */
        ,setType: function(type)
        {
            $("#elementType").val(type);
            this.typeChange();
        }

    });
});
