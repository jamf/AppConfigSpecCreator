//models/bundle-version
define([
    "jquery", "underscore", "backbone", "helper/pubsub",
    "text!templates/xml/bundle-version.xml"
], function(
    $, _, Backbone, PubSub,
    BundleVersionXML
){
    return Backbone.Model.extend({

        xmlTemplate: _.template(BundleVersionXML),

        initialize: function()
        {
            this.set("fields", {bundle: "com.mycompany.app", version: "1"});
        }

        ,setFields: function(bundleId, version)
        {
            this.set("fields", {bundle: bundleId, version: version});
        }

        ,renderXML: function()
        {
            return this.xmlTemplate(this.get("fields"));
        }
    })
});