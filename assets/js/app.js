define([
       "jquery" , "underscore" , "backbone"
       , "collections/snippets" , "collections/my-form-snippets"
       , "views/tab" , "views/my-form", "views/locale-view", "views/locales-view", "views/download-spec-view", "views/import-spec-view"
       , "models/locale-model", "collections/locales-collection"
       , "text!data/fields.json", "text!templates/app/localization.html", "text!templates/app/render.html",  "text!templates/app/about.html"
], function(
  $, _, Backbone
  , SnippetsCollection, MyFormSnippetsCollection
  , TabView, MyFormView, LocaleView, LocalesView, DownloadSpecView, ImportSpecView
  , Locale, LocalesCollection
  , fieldsJSON, localizationTab, renderTab
  , aboutTab
){
  return {
    initialize: function(){

      //Bootstrap tabs from json.
      new TabView({
        title: "Fields"
        , collection: new SnippetsCollection(JSON.parse(fieldsJSON))
      });
      /*new TabView({
        title: "Localization"
        , content: localizationTab
      });
      new TabView({
        title: "Rendered"
        , content: renderTab
      });*/
      new TabView({
        title: "About"
        , content: aboutTab
      });

      new ImportSpecView();
      new DownloadSpecView();

      //Make the first tab active!
      $("#components .tab-pane").first().addClass("active");
      $("#formtabs li").first().addClass("active");
      // Bootstrap "My Form" with 'Form Name' snippet.
      new MyFormView({
        title: "Original"
        , collection: new MyFormSnippetsCollection([
          { "title" : "Form Name"
            , "fields": {
              "bundleId": {
                "label"   : "Bundle Id"
                , "type"    : "input"
                , "value"   : "com.mycompany.app"
              },
              "version": {
                "label"   : "Version"
                , "type"    : "input"
                , "value"   : "1"
              }
            }
          }
        ])
      });

      var popoverHTML = '<div id=localeInput></div>';

      $('#editLanguagesButton').attr("data-content", popoverHTML);
      $('#editLanguagesButton').popover({ html : true }); 

      $('#editLanguagesButton').on('shown.bs.popover', function () {
        var locale1 = new Locale({ value: "en-US" });
        var locale2 = new Locale({ value: "fr-FR" });
        var locales = new LocalesCollection([locale1, locale2]);
        var localesView = new LocalesView({ collection: locales });
      });

      // Handle click events
      $('html').on('click', function(e) {
        if (typeof $(e.target).data('original-title') == 'undefined' &&
           !$(e.target).parents().is('.popover.in') &&
           (typeof $(e.target).attr("class") == 'undefined' || !$(e.target).attr("class").includes("languageRemovalButton"))) {
           $('#editLanguagesButton').popover('hide');
        }
      });
    }
  }
});
