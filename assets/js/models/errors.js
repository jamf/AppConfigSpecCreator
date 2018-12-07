//models/errors

define([
	"jquery", "underscore", "backbone", "helper/pubsub"
], function ($, _, Backbone, PubSub) {
	return Backbone.Model.extend({

		initialize: function (errors, xml) {
			this.errors = errors;

			var newXML = xml + "\n<!--\nERRORS:\n";
			_.each(this.errors, function(error) {
				newXML += "Line " + error.substring(11) + "\n"; // removes "file_0.xml:" prefix
			});
			newXML += "-->";

			this.xml = newXML;
    }

	});
});