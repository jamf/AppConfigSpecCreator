//collections/form-elements
define([
    "underscore", "backbone"
], function(
    _, Backbone
){
    return Backbone.Collection.extend({

        initialize: function()
        {
            // drop is triggered when a snippet is removed from a group
            this.on("removeFromCollection", this.removeFromCollection, this);
        }


        // again, as stated above, this is to remove the snippet from the group
        ,removeFromCollection: function(element)
        {
            this.remove(element);
        }

        // index will be -1 for newly created snippets
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