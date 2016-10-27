define(['wellknown', 'events/events'], function(parse, Events) {

  var BASE_STYLE = {
        color: '#a64a40',
        opacity: 1,
        fillColor: '#e75444',
        fillOpacity: 1,
        weight:1.5,
        radius: 4
      },

      Styles = {

        POINT_RED: (function() { return jQuery.extend({}, BASE_STYLE); })(),

        POLY_RED: (function() {
          var style = jQuery.extend({}, BASE_STYLE);
          style.color = '#db473a';
          style.fillColor = '#db473a';
          style.fillOpacity = 0.12;
          style.weight = 0.75;
          return style;
        })()

      };

  var ObjectLayer = function(map, eventBroker) {

    var self = this,

        /** Feature group for polygon overlays **/
        shapeFeatures = L.featureGroup().addTo(map),

        /** Feature group for point overlays **/
        pointFeatures = L.featureGroup().addTo(map),

        /** Returns the current layer bounds, merging point and shape layer bounds **/
        getLayerBounds = function() {
          var pointBounds = pointFeatures.getBounds(),
              pointBoundsValid = pointBounds.isValid(),
              shapeBounds = shapeFeatures.getBounds(),
              shapeBoundValid = shapeBounds.isValid(),
              mergedBounds;

          if (pointBoundsValid && shapeBoundValid) {
            mergedBounds = pointBounds;
            mergedBounds.extend(shapeBounds);
            return mergedBounds;
          } else if (pointBoundsValid) {
            return pointBounds;
          } else if (shapeBoundValid) {
            return shapeBounds;
          } else {
            // Doesn't matter, as long as we return invalid bounds
            return pointBounds;
          }
        },

        /** Helper method that resets map location and zoom to fit all current objects **/
        fitToObjects = function() {
          var bounds;

          if (!jQuery.isEmptyObject(markerIndex)) {
            bounds = getLayerBounds();

            if (bounds.isValid()) {
              map.fitBounds(bounds, {
                animate: true,
                paddingTopLeft: [380, 20],
                paddingBottomRight: [20, 20],
                maxZoom: 9
              });
            }
          }
        },

        /** Clears all objects from the map, except the selection **/
        clearMap = function() {
          pointFeatures.clearLayers();
          shapeFeatures.clearLayers();
        },

        /**
         * Helper to create a marker.
         *
         * Used either as part of the update method, or when creating a selection
         * on a place that doesn't have a marker yet.
         */
        createMarker = function(geom, radius) {
          var marker;

          if (geom.type === 'Point') {
            marker = L.circleMarker([geom.coordinates[1], geom.coordinates[0]], Styles.POINT_RED);
            marker.setRadius(radius);
            marker.addTo(pointFeatures);
          } else {
            marker = L.geoJson(geom, Styles.POLY_RED);
            marker.addTo(shapeFeatures);
          }

          return marker;
        },

        /** Updates the object layer with a new search response or view update **/
        update = function(docs) {
          // Just a dummy for now
          clearMap();

          jQuery.each(docs, function(idx, doc) {
            if (doc.CoverageGEO) {
              jQuery.each(doc.CoverageGEO, function(idx, wkt) {
                createMarker(parse(wkt), 4);
              });
            }
          });
        };

    eventBroker.addHandler(Events.SOLR_SEARCH_RESPONSE, function(response) {
      update(response.response.docs);
    });
  };

  return ObjectLayer;

});
