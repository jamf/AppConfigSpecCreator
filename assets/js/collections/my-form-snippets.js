define([
       "jquery" , "underscore" , "backbone"
       , "models/snippet", "models/group","models/plain-xml-model"
       , "collections/snippets", "collections/my-form-groups"
       , "views/my-form-snippet", "views/plain-xml-view"
       , "text!data/fields.json"
       , "helper/pubsub"
], function(
  $, _, Backbone
  , SnippetModel, GroupModel, PlainXMLModel
  , SnippetsCollection, GroupsCollection
  , MyFormSnippetView, PlainXMLView
  , fieldsJSON
  , PubSub
){
  return SnippetsCollection.extend({
    model: SnippetModel
    , initialize: function() {
      this.counter = {};
      this.collection = null;
      //this.groupModel = null;
      this.groupCollection = new GroupsCollection();
      PubSub.on("downloadSpec", this.downloadSpec, this);
      PubSub.on("initForm", this.initForm, this);
      PubSub.on("clearForm", this.clearForm, this);
      PubSub.on("addGroup", this.addGroup, this);
      PubSub.on("removeGroup", this.removeGroup, this);
      PubSub.on("setGroups", this.setGroups, this);
      this.on("add", this.giveUniqueId);
      this.on("add", this.setGroups);

      //Ask for the group model
      PubSub.trigger("requestGroupModel", this);
    }

    , giveUniqueId: function(snippet){
      if(!snippet.get("fresh")) {
        return;
      }
      snippet.set("fresh", false);
      var snippetType = snippet.attributes.fields.id.value;

      if(typeof this.counter[snippetType] === "undefined") {
        this.counter[snippetType] = 0;
      } else {
        this.counter[snippetType] += 1;
      }

      snippet.setField("id", snippetType + "-" + this.counter[snippetType]);

      if(typeof snippet.get("fields")["id2"] !== "undefined") {
        snippet.setField("id2", snippetType + "2-" + this.counter[snippetType]);
      }
    }
    , containsFileType: function(){
      return !(typeof this.find(function(snippet){
        return snippet.attributes.title === "File Button"
      }) === "undefined");
    }
    , renderAll: function(){
      return this.map(function(snippet){
        return new MyFormSnippetView({model: snippet}).render(true);
      })
    }
    , renderAllClean: function(){
      return this.map(function(snippet){
        return new MyFormSnippetView({model: snippet}).render(false);
      });
    }
    , downloadSpec: function() { 
      /* This function downloads the spec file as xml. Each snippet is responsible for rendering itself both
         in the dict section and the presentation section. Since the my-form-snippets.js collection is aware of the
         entire collection of snippets, it holds the responsibility of orchestrating the xml generation. */
      var xml = "";
      var that = this;

      // Render XML of snippets, including Formname which will start dict section.
      this.map(function(snippet) {
          xml += new MyFormSnippetView({model: snippet}).renderDictXML();
      });

      // Render XML of end of dict section.
      xml += new PlainXMLView({model: new PlainXMLModel({title: "endDict"})}).renderXML();

      // Render XML of start of pres section
      xml += new PlainXMLView({model: new PlainXMLModel({title: "startPres", defaultLocale: "en-US"})}).renderXML();

      // If groups exist
      if(this.groupCollection.models.length > 0)
      {
        //xml += new PlainXMLView({model: new PlainXMLModel({title: "startGroup"})}).renderXML();

        //create our sets to put our snippets into
        this.groupedSnippets = {};

        this.groupedSnippets["groups"] = [];

        //Move the snippets to their respective groups
        _.each(this.models, function(model){
          var group = model.getGroup();
          if(group != "__FORM_NAME__"){
            if(!(group in that.groupedSnippets)) {
              //if we don't have the group already, add it to the list of groups
              // and make a new array to store the snippets that the group contains
              that.groupedSnippets[group] = new Array();
              that.groupedSnippets["groups"].push(group);
            }
            that.groupedSnippets[group].push(model);
          }
        });
      }

      // Render XML of grouped snippets
      if(this.hasOwnProperty("groupedSnippets")) {
        _.each(this.groupedSnippets["groups"], function (group) {
          //Skip the form name and ungrouped snippets
          if (group != "__FORM_NAME__" && group != "") {
            // Render start XML of group
            xml += new PlainXMLView({
              model: new PlainXMLModel({
                title: "startGroup",
                name: that.groupCollection.getLabel(group)
              })
            }).renderXML();

            //console.log("name is: " + group);
            _.each(that.groupedSnippets[group], function (snippet) {
              // Render XML of snippet
              xml += new MyFormSnippetView({model: snippet}).renderPresXML();
            });

            // Render End XML of group
            xml += new PlainXMLView({model: new PlainXMLModel({title: "endGroup"})}).renderXML();
          }
        });
        // Render XML of snippets not in groups
        _.each(this.groupedSnippets[""], function(snippet){
          xml += new MyFormSnippetView({model: snippet}).renderPresXML();
        });
      }
      else
      {
        //render form with no groups
        _.map(this.models, function(snippet) {
          xml += new MyFormSnippetView({model: snippet}).renderPresXML();
        });
      }



      // Render XML of end of pres section
      xml += new PlainXMLView({model: new PlainXMLModel({title: "endPres"})}).renderXML();

      // Render XML of end of spec file
      xml += new PlainXMLView({model: new PlainXMLModel({title: "endSpec"})}).renderXML();

      console.log(xml);

      var pom = document.createElement('a');

      var filename = "specfile.xml";
      var pom = document.createElement('a');
      var bb = new Blob([xml], {type: 'text/plain'});

      pom.setAttribute('href', window.URL.createObjectURL(bb));
      pom.setAttribute('download', filename);

      pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
      pom.draggable = true; 
      pom.classList.add('dragout');

      pom.click();
    }
    , xmlToJson: function(xml) {
      // Create the return object
      var obj = {};

      if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
      } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
      }

      // do children
      if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = this.xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(this.xmlToJson(item));
            }
        }
      }
      return obj;
    }
    , findConfigSubsection: function(fields, component) {
      // Returns  the JSON subsection for a specific component
      $.each(fields, function(field) { // field is an index, e.g. 0, 1, 2, 3...

          if (fields[field].title == component) {
              theField = fields[field]; 
          }
      });
      return theField;
    }
    , initForm: function(xml) {
      // This function parses the uploaded xml file to json. We then create new SnippetModels and configure them as appropriate
      var that = this;


      //First things first. Clear the current collection
      that.models.splice(1, that.models.length - 1);

      //Clear the groups
      this.groupCollection.reset();

      xmlDoc = $.parseXML( xml.replace(/(\r\n|\n|\r|\t)/gm,"") ),
      $xml = $( xmlDoc ),
      $title = $xml.find('dict');
      specAsJSON = this.xmlToJson(xmlDoc);


      var dictSections = {};
      $.each(specAsJSON.managedAppConfiguration.dict, function(dataType) {
        if(this.constructor == Array) {
          $.each(this, function() {
            this.dataType = dataType;
            dictSections[this["@attributes"].keyName] = this;
          });
        } else {
        // Preload dict sections in a dictionary indexed by keyName
        this.dataType = dataType;
        dictSections[this["@attributes"].keyName] = this;
      }
      });

      // Import bundleId and version. This goes into FormName snippet, which is first in collection (this.models)
      fields = _.clone(this.models[0].get("fields"));
      fields.bundleId.value = specAsJSON.managedAppConfiguration.bundleId["#text"];
      fields.version.value = specAsJSON.managedAppConfiguration.version["#text"];
      this.models[0].set("fields", fields);


      //separate groups
      //var fieldGroups = [];
      if(specAsJSON.managedAppConfiguration.presentation.hasOwnProperty("fieldGroup"))
      {
        var groups = specAsJSON.managedAppConfiguration.presentation.fieldGroup;
        //If only one fieldGroup, it will be an object. Turn it into an array
        if(groups.constructor !== Array)
        {
          var old = groups;
          groups = [];
          groups.push(old);
        }
        _.each(groups, function(group){
          //TODO: add locale support here

          //Add our group
          PubSub.trigger("addGroup", group.name.language["#text"]);

          //grab the fields
          var fields = {};
          fields.field = _.clone(group.field);

          //iterate over the snippets in the group
          jQuery.map(fields, function(obj){
            //if we have more than one snippet in a group, we have to iterate over the array
            if(obj.constructor === Array) {
              _.each(obj, function (snippet) {
                //configure and add the snippet
                that.configureSnippets(snippet, true, group.name.language["#text"], dictSections);
              });
            }else // just one snippet in the group
            {
              //configure and add the snippet
              that.configureSnippets(obj, true, group.name.language["#text"], dictSections);
            }
          });
        });
      }

      // If only one field, fields will be an object, not an array as required. Turn it into an array
        var fields = specAsJSON.managedAppConfiguration.presentation.field;
        if(fields.constructor !== Array)
        {
          var old = fields
          fields = [];
          fields.push(old);
        }

        jQuery.map(fields, function(field) {

          console.log("obj: " + JSON.stringify(field));
          that.configureSnippets(field, false, null, dictSections);
        });
    }

    ,configureSnippets: function(field, grouped, group, dictSections)
    {
      var that = this;

      model = new SnippetModel(that.findConfigSubsection(JSON.parse(fieldsJSON), field["@attributes"].type));
      model.set("fresh", false); // Not 'fresh', since it's already been initially processed prior to import

      // Grab reference to fields. Then we modify and resave
      var fields = _.clone(model.get("fields"));

      fields.id.value = field["@attributes"].keyName;
      // Populate description if it exists
      if (field.description && field.description.language) { fields.description.value = field.description.language["#text"]; }
      // Populate label if it exists
      if (field.label && field.label.language) { fields.label.value = field.label.language["#text"]; }

      // Populate default value if it exists
      defaultValue = dictSections[field["@attributes"].keyName].defaultValue;
      var defaultValueType = null;
      if (defaultValue){
        if (fields.defaultValue.type == "input" || fields.defaultValue.type == "datetime") { // Single default value

          // Check if we have a multi select variable (if so, the tag will be "deviceVariable" or "userVariable" instead of "value")
          if("value" in defaultValue) {
            fields.defaultValue.value = defaultValue.value["#text"];
          }
          else
          {
            var variable;
            if("userVariable" in defaultValue)
            {
              variable = defaultValue.userVariable["@attributes"]["value"];
              defaultValueType = "userVariable";
              fields.defaultValue.value = fields.defaultValue.variables.userVariable;
            }
            else if("deviceVariable" in defaultValue)
            {
              variable = defaultValue.deviceVariable["@attributes"]["value"];
              defaultValueType = "deviceVariable";
              fields.defaultValue.value = fields.defaultValue.variables.deviceVariable;
            }
            fields.defaultValue.type = "select";
            $.each(fields.defaultValue.value, function(){
              if(this.value == variable)
                this.selected = true;
              else
                this.selected = false;
            });
            //hasDefaultValueType = true;
          }

        } else if (fields.defaultValue.type == "select") { // Multiselect Component uses this
          $.each(fields.defaultValue.value, function() {
            if (this.value == JSON.parse(defaultValue.value["#text"])) {
              this.selected = true;
            } else {
              this.selected = false;
            }
          });
        } else if (fields.defaultValue.type == "textarea-split") { // List Component uses this
          defaultValues = [];
          if (defaultValue.value.constructor == Array) {
            $.each(defaultValue.value, function() {
              defaultValues.push(this["#text"]);
            });
          } else {
            defaultValues.push(defaultValue.value["#text"]);
          }
          fields.defaultValue.value = defaultValues;
        }
      }



      // Populate options if they exist
      if (field.options && fields.options) {
        options = [];
        $.each(field.options.option, function() {
          options.push(this["@attributes"].value);
        });
        fields.options.value = options;
      }

      // Populate dataType if it exists
      dataType = dictSections[field["@attributes"].keyName].dataType;
      //dataType = dictSections[field.keyName].dataType;
      $.each(fields.dataType.value, function() {
        // Iterate through each dataType option and mark selected appropriately
        field.selected = (this.value == dataType);
      });

      // Populate the defaultValueType if it exists
      if(defaultValueType)
      {

        $.each(fields.defaultValueType.value, function() {
          field.selected = (this.value == defaultValueType);
        });
      }

      // Resave fields after modification
      model.set("fields", fields);
      that.add(model);

      //groups are automatically populated when the snippet is added,
      //we still need to set the selected group though
      if(grouped)
      {
        model.setGroup(group);
      }

    }

    ,clearForm: function(){
      $("#target fieldset").remove();
    }

    ,addGroup: function(group)
    {
      var that = this;
      this.groupCollection.addGroup(group);
      _.each(this.models, function(snippet){
        snippet.addGroup(new GroupModel(group));
        snippet.trigger("change");
      });
    }

    ,removeGroup: function(group)
    {
      this.groupCollection.removeGroup(group);
      _.each(this.models, function(snippet){
        snippet.removeGroup(group);
        snippet.trigger("change");
      });
    }

    ,setGroups: function()
    {
      var that = this;
      _.each(this.models, function(snippet){
        snippet.setGroups(that.groupCollection.getGroups());
      });

    }
  });
});
