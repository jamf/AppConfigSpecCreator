//views/array-option
define([
    "jquery", "underscore", "backbone", "helper/pubsub",
    "text!templates/constraint-value.html"
], function(
    $, _, Backbone, PubSub,
    ArrayOptionTemplate
){

    return Backbone.View.extend({

        template: _.template(ArrayOptionTemplate),

        initialize: function()
        {

        }

        /**
         * renders the html of this array element.
         * @return {exports}  return `this` for method chaining
         */
        ,render: function()
        {
            this.$el.empty();
            this.$el.html(this.template({model: this.model}));

            return this;
        },

        events: {
            "click .constraintValueEdit" : "edit",
            "click .constraintValueRemove": "remove"
        }

        /**
         * edit this array option
         */
        ,edit: function()
        {
            PubSub.trigger("constraintModal:EditConstraintValue", this.model, this.model.collection);
        }

        /**
         * Remove this array option
         */
        ,remove: function()
        {
            //Destroy the model
            //This also removes it from the collection
            this.model.destroy();

            //Tell the snippet modal to update and render the subsets again
            PubSub.trigger("constraintModal:Update");
        }
    });
});