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


        /** Colors for Docs **/
        colorForRGB = function(red, green, blue) {
          return "rgb("+((red * 255) | 0)+","+((green * 255) | 0)+","+((blue * 255) | 0)+")";
        },

        colorForType = function(type) {
          switch(type) {
          case 'Feature': return colorForRGB(0.761,0.263,0.431); break;
          case 'Context': return colorForRGB(0.878,0.357,0.094); break;
          case 'Artifact': return colorForRGB(0.018,0.355,0.680); break;
          case 'Section': return colorForRGB(0.502,0.353,0.498); break;
          case 'Image': return colorForRGB(0.031,0.408,0.408); break;
          case 'Group': return colorForRGB(0.859,0.667,0.125); break;
          case 'Other': return colorForRGB(0.525,0.682,0.882); break;
          default: return '#e75444';
          }
        },

        /**
         * Helper to create a marker.
         *
         * Used either as part of the update method, or when creating a selection
         * on a place that doesn't have a marker yet.
         */
        createMarker = function(doc, geom, radius) {
          var marker;
          var style;
          var color = colorForType(doc.Type);

          if (geom.type === 'Point') {
            style = {
              color : color,
              opacity : 1,
              fillColor : color,
              fillOpacity : 0.5,
              weight: 0.75,
              radius: radius
            };
            marker = L.circleMarker([geom.coordinates[1], geom.coordinates[0]], style);
            marker.setRadius(radius);
            marker.addTo(pointFeatures);
          } else if (geom.type == 'LineString' && doc.Type == 'Image') {
            style = {
              color : color,
              opacity : 1,
              fillColor : color,
              fillOpacity : 0.5,
              weight: 0.75
            };
            marker = L.circle([geom.coordinates[0][1], geom.coordinates[0][0]], 0.05, style);
            marker.addTo(pointFeatures);
          } else {
            style = {
              color : color,
              opacity : 1,
              fillColor : color,
              fillOpacity : 0.12,
              weight: 0.75
            };
            marker = L.geoJson(geom, style);
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
              var geoJSON = parse(doc.CoverageGEO);
              // GeometryCollections create pin markers so ignore them for now
              if (geoJSON.type != 'GeometryCollection') {
                createMarker(doc, geoJSON, 4);
              }
            }
          });
        };

    eventBroker.addHandler(Events.SOLR_SEARCH_RESPONSE, function(response) {
      update(response.response.docs);
    });
  };

  return ObjectLayer;

});
