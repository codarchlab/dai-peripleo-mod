/** The base map **/
define(['events/events', 'map/objectLayer'], function(Events, ObjectLayer) {

  var Map = function(div, eventBroker) {

        /** Map layers **/
    var Layers = {

          osm  : L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	                 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                   maxZoom:25
                 }),

          googleSat : L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
            maxZoom: 25,
            subdomains:['mt0','mt1','mt2','mt3']
          }),

          sample : L.tileLayer('http://localhost:8000/layers/sample_west_2013/{z}/{x}/{y}.png', {
	    attribution: 'ASCSA',
            maxZoom:24,
            tms: true
          })

        },

        /** Default "closeup" zoom levels per layer **/
        closeupZoom = { dare: 11, awmc: 12, osm: 22, satellite: 17 },

        /** To keep track of current layer **/
        currentLayer = { name: 'OpenStreetMap', layer: Layers.osm },

        /** Map **/
        map = new L.Map(div, {
          center: new L.LatLng(37.9763639796, 23.72278683),
          zoom: 17,
          zoomControl: false,
          layers: [ Layers.googleSat, Layers.sample ]
        }),

        objectLayer = new ObjectLayer(map, eventBroker),

        getBounds = function() {
          var b = map.getBounds(),
              w = (b.getWest() < -180) ? -180 : b.getWest(),
              e = (b.getEast() > 180) ? 180 : b.getEast(),
              s = (b.getSouth() < -90) ? -90 : b.getSouth(),
              n = (b.getNorth() > 90) ? 90 : b.getNorth();

          return { north: n, east: e, south: s, west: w, zoom: map.getZoom() };
        },

        changeLayer = function(name) {
          var layerToShow = Layers[name];
          if (layerToShow) {
            map.removeLayer(currentLayer.layer);
            currentLayer = { name: name, layer: layerToShow };
            map.addLayer(currentLayer.layer);
          }
        },

        zoomTo = function(bounds) {
          var center = bounds.getCenter();
          if (!map.getBounds().contains(center))
            map.panTo(center);

          map.fitBounds(bounds, { maxZoom: closeupZoom[currentLayer.name] });
        };

    /** Request count & histogram updates on every move **/
    map.on('move', function() {
      eventBroker.fireEvent(Events.VIEW_CHANGED, getBounds());
    });

    eventBroker.addHandler(Events.CHANGE_LAYER, changeLayer);
    eventBroker.addHandler(Events.ZOOM_IN, function() { map.zoomIn(); });
    eventBroker.addHandler(Events.ZOOM_OUT, function() { map.zoomOut(); });

  };

  return Map;

});
