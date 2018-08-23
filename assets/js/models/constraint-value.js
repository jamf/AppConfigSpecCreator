//models/constraint-value
define([
	"jquery", "underscore", "backbone", "helper/variable-types", "helper/pubsub", "views/constraint-values"
], function(
	$, _, Backbone, VariableTypes, PubSub, ConstraintValuesView
){
	return Backbone.Model.extend({

		initialize: function()
		{
			//This is used to tell whether we are adding a new option or editing an existing one
			this.fresh = true;
		}

	});
});

