//helper/utility
define([
    "jquery", "underscore", "backbone", "helper/pubsub"
], function(
    $, _, Backbone, PubSub
){
    //This extends the backbone model only to make is a constructable object,
    //None of the model functionality is used
    return Backbone.Model.extend({

        initialize: function()
        {
            String.prototype.capitalizeFirstLetter = function(){
                return this.charAt(0).toUpperCase() + this.slice(1);
            }
            PubSub.on("deleteView", this.deleteView, this);

        }

        ,deleteView: function(view)
        {
            view.remove();

        }
    });
})
