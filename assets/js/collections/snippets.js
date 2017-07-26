//collections/snippet
define([
    "jquery", "underscore", "backbone", "helper/pubsub",
    "models/snippet"
], function(
    $, _, Backbone, PubSub,
    SnippetModel
){
    return Backbone.Collection.extend({

        model: SnippetModel,

        initialize: function()
        {
            this.on("removeFromCollection", this.removeFromCollection, this);
        }

        /**
         * removes the snippet from this collection
         */
        ,removeFromCollection: function(snippet)
        {
            this.remove(snippet)
        }

        /**
         * inserts a snippet into the collection at the given index
         * @param snippet  the snippet to be inserted
         * @param index  the index at which to insert
         */
        ,insertAt: function(snippet, index)
        {
            if(index < 0)
            {
                this.add(snippet);
            }
            else
            {
                this.add(snippet, {at: index});
            }
        }

    });
});