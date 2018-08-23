AppConfig Spec Creator
======================
This tool is an AppConfig xml spec creation tool built around simplifying the creation of xml spec files.

Using the tool
--------------
This tool is pretty simple to use. Just deploy it under any web server or navigate to the `index.html` file from any browser
(it works without a web server). Add fields by clicking the `addField` button and edit the fields per your needs. Groups are 
the same but with the `groups` button. Fields and groups can be reordered by dragging them up and down the form. When all configuration is done, download your spec file by clicking the `download` button.
If you wish to load a previously or externally created spec, use the `import` button. NOTE: importing erases the currently created
spec in your form. 

Some functionality has yet to be completed. Localization support is not available for all portions of the schema.

Navigating the code base
------------------------
This tool uses Backbone.js as its core functionality library. The code is set up in a few different sections. 
There are models, views, collections, templates, and helpers. 

Models: These are just what they sound like. Standard in any MVC framework, the models are the actual object 
    housing the data. These are how snippets, constraints, groups, and a few other things are represented.
    
Views: Also standard in any MVC framework, these are the actual presentation of a model's data visually on screen.
    There are views for standard form rendering as well as modal rendering. Since a model is edited in a modal,
    we have to have a different view for that modal. Views are broken up into regular views and modal views to help
    code organization.
    
Collections: These are a Backbone tool that helps a lot with maintaining groups of models. Backbone makes it easy
    to manage an array of snippets, options, and groups by putting them in collections and allowing events to be
    permeated throughout. Essentially these are just fancy arrays given to us by Backbone.
    
Templates: These are incredibly handy. Backbone relies on Underscore.js and one of the great things Underscore
    has is templating for EJS (embedded javascript).  Similar to the views, we have templates broken down into categories.
    There are the regular templates which template out standard views to the web page, then we have modal templates that
    template out the modals for when we are editing a model. There are also xml templates that are responsible for templating
    a model out to the xml spec representation. NOTE: some of the EJS is VERY convoluted because of formatting. 
    
Helpers: These are helpful pieces that simplify getting things done in the code. The biggest thing here is the PubSub
    tool. This is a wrapper around the Backbone.Events service and allows us to send publish/subscribe messages around 
    decoupled pieces of the code base. 
    
    

NOTE: much of this code base is hard to understand if Backbone.js is not understood. There's no real way to mitigate that
    except for code comments. Learning Backbone is a bit of a prerequisite to fully understanding this code base.