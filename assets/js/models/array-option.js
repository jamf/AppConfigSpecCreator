//models/array-option
define([
    "jquery", "underscore", "backbone", "helper/variable-types", "helper/pubsub",
    "views/array-option", "helper/variables", "models/localized-value"

], function(
   $, _, Backbone, VariableTypes, PubSub,
   ArrayOptionView, EMMVariables, LocalizedValueModel
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

            this.localizedLabel = new LocalizedValueModel();
            this.localizedLabel.setLocalizedValue("en-US", "");
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

        // save temporary localized name data
        , saveLocaleData: function (localizedLabel) {
            this.localizedLabel = localizedLabel;
        }

        , setLocalesCollection: function (collection) {
            this.localesCollection = collection;
            return this;
        }

        , getLocalesCollection: function () {
            return this.localesCollection;
        }
    });
});

