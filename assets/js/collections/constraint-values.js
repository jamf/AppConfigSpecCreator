//collections/constraint-values
define([
	"jquery", "underscore", "backbone",
	"models/constraint-value", "views/constraint-values"
], function(
	$, _, Backbone,
	ConstraintValueModel, ConstraintValuesView
){
	return Backbone.Collection.extend({


		initialize: function()
		{
			this.on("all", this.render);

		}

		,render: function()
		{
			new ConstraintValuesView({collection: this}).render();
		}
	});
});