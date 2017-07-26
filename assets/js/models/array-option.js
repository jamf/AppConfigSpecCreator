//models/array-option
define([
    "jquery", "underscore", "backbone", "helper/variable-types", "helper/pubsub",
    "views/array-option", "helper/variables"

], function(
   $, _, Backbone, VariableTypes, PubSub,
   ArrayOptionView, EMMVariables
){
    return Backbone.Model.extend({

        initialize: function(dataType)
        {
            //This is used to tell whether we are adding a new option or editing an existing one
            this.fresh = true;

            //The default type will be a literal
            this.type = "Literal";

            //This data type will be used to guage whether or not emm variables are available (String only)
            this.dataType = dataType;

            //grab the emm variables
            this.emmVariables = EMMVariables.emmVariables;

            //grab the variable types
            this.variableTypes = VariableTypes;
        }

        ,setDataType: function(dataType)
        {
            //check if we should clear out the `value` field
            if(!dataType.includes("String") && this.type != "Literal")
            {
                this.type = "Literal";
                this.set({"value": ""});
                PubSub.trigger("snippetModal:Update");

            }

            this.dataType = dataType;
        }
    });
});

