//views/constraint
define([
    "jquery", "underscore", "backbone", "helper/pubsub",
    "views/modal/constraint",
    "text!templates/constraint.html"

], function(
    $, _, Backbone, PubSub,
    ConstraintModalView,
    ConstraintTemplate
){
    return Backbone.View.extend({

        template: _.template(ConstraintTemplate),

        initialize: function()
        {

        }

        ,render: function()
        {
            this.$el.empty();

            this.$el.html(this.template({model: this.model}));

            return this;
        }

        ,events: {
            "click #fieldConstraintsEdit": "edit"
        }

        ,edit: function()
        {
            console.log("edit")
            new ConstraintModalView({model: this.model});
        }
    });
});