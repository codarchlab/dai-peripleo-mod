/** One 'facet dimension chart' block **/
define(['events/events', 'formatting'], function(Events, Formatting) {

  var FacetChart = function(parentEl, facetField, eventBroker) {

    var chartEl = jQuery(
          '<div class="facetchart">' +
            '<h3>' + facetField + '</h3>' +
            '<span class="filter-buttons">' +
              '<button class="set-filter"><span class="icon">&#xf0b0;</span> <span class="label">Set Filter</span></button>' +
              '<button class="refine-filter"><span class="icon">&#xf0b0;</span> <span class="label">Refine</span></button>' +
              '<button class="clear-filter"><span class="icon">&#xf00d;</span> <span class="label">Clear</span></button>' +
            '</span>' +
            '<ul class="' + facetField + '"></ul>' +
          '</div>'),

        btnSetFilter = chartEl.find('.set-filter'),
        btnRefine = chartEl.find('.refine-filter'),
        btnClear = chartEl.find('.clear-filter'),
        facetBarsEl = chartEl.find('ul'),

        chunkArray = function(arr, stepSize) {
          var chunks = [],
              i = 0,
              n = arr.length;

          while (i < n)
            chunks.push(arr.slice(i, i += stepSize));

          return chunks;
        },

        onSearchResponse = function(response) {
          var myFacet = chunkArray(response.facet_counts.facet_fields[facetField], 2);
              maxCount = (myFacet.length > 0)? myFacet[0][1] : 0;

          facetBarsEl.empty();

          jQuery.each(myFacet.slice(0, 5), function(idx, val) {
            var label = val[0],
                count = val[1],
                percentage = 100 * count / maxCount;

            facetBarsEl.append(Formatting.createMeter(label, count, percentage));
          });
        };

    btnRefine.hide();
    btnClear.hide();

    parentEl.append(chartEl);
    chartEl.addClass('palette-col-' + parentEl.index());

    eventBroker.addHandler(Events.SOLR_SEARCH_RESPONSE, onSearchResponse);
  };

  return FacetChart;

});
