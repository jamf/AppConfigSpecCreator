//models/default-value
define([
    "jquery", "underscore", "backbone", "helper/pubsub",
    "collections/array-options", "helper/variables",
    "text!templates/xml/dict-default-value.xml"

], function(
    $, _, Backbone, PubSub,
    ArrayOptionsCollection, EMMVariables,
    DictTemplate
){
   return Backbone.Model.extend({

       //This is the singular value that this model currently has, defaulted to null

       dictTemplate: _.template(DictTemplate),

       initialize: function(snippetModel)
       {
           var that = this;

           //grab the emm variables
           this.emmVariables = EMMVariables.emmVariables;

           //This is the type of value this model has, defaulted to Literal
           //NOTE: This is set through "this.set(..)" so change events can be used through the Backbone Model
           this.set({"type": "Literal"});

           //the snippet model this default value model belongs to
           this.snippetModel = snippetModel;

           //This is the array of values if an array data type is selected for the snippet
           this.collection = new ArrayOptionsCollection();
       }

       ,getPlaceholderLabel: function()
       {
           var fields = this.snippetModel.get("fields");

           //if the data type is an array, return a stringified list
           if(fields.dataType.includes("Array"))
           {
               var label = "";
               _.each(this.collection.models,function(model){
                  label += model.get("value");
                  label += ", ";
               });
               //drop off the last comma
               label = label.slice(0, label.length - 2);

               return label;
           }


           return this.get("value");
       }

       ,renderDictXML: function()
       {
            return this.dictTemplate({model: this});
       }

       ,changeDataType: function(dataType)
       {
           //update defaultValueType
           if(this.get("type") != "Literal" && !(dataType.includes("String") || dataType.includes("Date")))
           {
               this.set({"type": "Literal"});
               this.value = null;
           }

           this.collection.each( function(option){
              option.setDataType(dataType);
           });
       }


   });
});