requirejs.config({
    "baseUrl": "javascripts/app",
    "paths": {
      "jquery": "../vendor/jquery-1.9.0.min",
      "jquery-ui": "../vendor/jquery-ui.min",
      "leaflet": "../vendor/leaflet/leaflet",
      "velocity": "../vendor/velocity.min",
      "wellknown": "../vendor/wellknown"
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

// Load the main app module to start the app
requirejs(["main"]);
