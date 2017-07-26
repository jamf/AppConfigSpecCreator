//models/constraint
define([
    "jquery", "underscore", "backbone", "helper/pubsub",
    "views/constraint",
    "text!templates/xml/dict-constraints.xml"
], function(
    $, _, Backbone, PubSub,
    ConstraintView,
    ConstraintsXMLTemplate
){
   return Backbone.Model.extend({

       xmlTemplate: _.template(ConstraintsXMLTemplate),

       initialize: function(dataType)
       {
           this.setDataType(dataType)
           this.setNullable(null);
           this.setMin("");
           this.setMax("");
           this.setPattern("");
           this.setValues({values: []});
           this.setNullableSelected(false);
           this.setMinSelected(false);
           this.setMaxSelected(false);
           this.setPatternSelected(false);
       }

       ,render: function()
       {
           return new ConstraintView({model: this});
       }

       /**
        * this function sets the data type and checks which constraints are available for that given type
        */
       ,setDataType: function(dataType)
       {
           //nullable always available
           this.setNullableAvailable(true);

           //min, max, and pattern not available for boolean
           if(dataType == "Boolean")
           {
               this.setMinAvailable(false);
               this.setMaxAvailable(false);
               this.setPatternAvailable(false);
           }
           else
           {
               //only string and string array has the pattern constraint
               if(dataType.includes("String"))
               {
                   this.setPatternAvailable(true);
               }
               else
               {
                   this.setPatternAvailable(false);
               }

               //since not boolean, all others have min and max
               this.setMinAvailable(true);
               this.setMaxAvailable(true);
           }
       }


       ,getEnabled: function()
       {
           if(this.getNullableSelected()) return true;
           if(this.getMinSelected() && this.getMinAvailable()) return true;
           if(this.getMaxSelected() && this.getMaxAvailable()) return true;
           if(this.getPatternSelected() && this.getPatternAvailable()) return true;

           return false;
       }

       ,setNullableAvailable: function(available)
       {
           this.set("nullableAvailable", available);
       }

       ,getNullableAvailable: function()
       {
           return this.get("nullableAvailable");
       }

       ,setNullableSelected: function(selected)
       {
           this.set("nullableSelected", selected);
       }

       ,getNullableSelected: function()
       {
           return this.get("nullableSelected");
       }

       ,setNullable: function(nullable)
       {
           this.set("nullable", nullable);
       }

       ,getNullable: function()
       {
           return this.get("nullable");
       }

       ,setMinAvailable: function(available)
       {
           this.set("minAvailable", available);
       }

       ,getMinAvailable: function()
       {
           return this.get("minAvailable");
       }

       ,setMinSelected: function(selected)
       {
           this.set("minSelected", selected);
       }

       ,getMinSelected: function()
       {
           return this.get("minSelected")
       }

       ,setMin: function(min)
       {
           this.set("min", min);
       }

       ,getMin: function()
       {
           return this.get("min");
       }

       ,setMaxAvailable: function(available)
       {
           this.set("maxAvailable", available);
       }

       ,getMaxAvailable: function()
       {
           return this.get("maxAvailable");
       }

       ,setMaxSelected: function(selected)
       {
           this.set("maxSelected", selected);
       }

       ,getMaxSelected: function()
       {
           return this.get("maxSelected");
       }

       ,setMax: function(max)
       {
           this.set("max", max);
       }

       ,getMax: function()
       {
           return this.get("max");
       }

       ,setPatternAvailable: function(available)
       {
           this.set("patternAvailable", available);
       }

       ,getPatternAvailable: function()
       {
           return this.get("patternAvailable");
       }

       ,setPatternSelected: function(selected)
       {
           this.set("patternSelected", selected);
       }

       ,getPatternSelected: function()
       {
           return this.get("patternSelected");
       }

       ,setPattern: function(pattern)
       {
           this.set("pattern", pattern);
       }

       ,getPattern: function()
       {
           return this.get("pattern");
       }

       ,setValues: function(values)
       {
           this.set("values", values);
       }

       ,getValues: function()
       {
           return this.get("values");
       }

       ,addValue: function(value)
       {
           this.get("values").values.push(value)
       }

       ,removeValue: function(value)
       {
           var index = this.get("value").values.indexOf(value);
           this.removeIndex(index);
       }

       ,removeIndex: function(index)
       {
           this.get("values").values.splice(index, 1);
       }

       ,renderDictXML: function()
       {
           var xml = "";
           xml += this.xmlTemplate({model: this});
           return xml;
       }




   });
});