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
            marker.addTo(pointFeatures);
            marker.setRadius(radius);
          } else {
            marker = L.geoJson(geom, Styles.POLY_RED);
            marker.addTo(shapeFeatures);
          }

          return marker;
        },

        /** Updates the object layer with a new search response or view update **/
        update = function(objects) {
          // Just a dummy for now
          clearMap();
          jQuery.each(objects, function(idx, obj) {
            var geom = obj.geometry[0],
                marker = createMarker(parse(geom), 4);
          });

          /*
            var id = obj.identifier,
                existingObjectTuple = objectIndex[id],

                geomHash = (obj.geo_bounds) ? createGeometryHash(obj.geometry) : false,
                existingMarkerTuple = (geomHash) ? markerIndex[geomHash] : false,

                type, marker;

            if (geomHash) { // No need to bother if there is no geometry
              collapseRectangles(obj); // Get rid of Barrington grid squares

              if (existingObjectTuple) {
                jQuery.extend(existingObjectTuple._1, obj); // Object exists - just update the data

                if (existingObjectTuple._1.geometry.type === 'Point')
                  existingObjectTuple._2.setRadius(size(obj.result_count));

                existingObjectTuple._2.bringToFront();
              } else {
                if (existingMarkerTuple) { // There's a marker at that location already - add the object
                  existingMarkerTuple._2.push(obj);
                  marker = existingMarkerTuple._1;
                  marker.setStyle(Styles.SMALL);
                  marker.bringToFront();
                } else { // Create and add a new marker
                  marker = createMarker(obj, geomHash, size(obj.result_count));
                }

                markerIndex[geomHash] = { _1: marker, _2: [obj] };
                objectIndex[id] = { _1: obj, _2: marker };
              }
            }

          */
        };

    eventBroker.addHandler(Events.SOLR_SEARCH_RESPONSE, function(response) {
      update(response.response.docs);
    });
  };

  return ObjectLayer;

});
