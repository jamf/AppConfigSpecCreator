// this page is linked in index.html
require.config({
    baseUrl: "assets/js/lib/"
	// shim: load these dependencies first
    , shim: { 
		// Provides MVC-ish functinality
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
		// list comprehensions and other utilities
        'underscore': { 
            exports: '_'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: '$.fn.popover'
        },
        'knockout': {
            exports: 'ko'
        }
    }
    , paths: {
        app         : ".."
        , collections : "../collections"
        , data        : "../data"
        , models      : "../models"
        , helper      : "../helper"
        , templates   : "../templates"
        , views       : "../views"
    }
});

// Entry point for the rest of the app
require([ 'app/app'], function(app){
    app.initialize();
});
