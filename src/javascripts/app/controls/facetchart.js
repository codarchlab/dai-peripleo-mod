/** One 'facet dimension chart' block **/
define(['events/events', 'utils'], function(Events, Utils) {

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

        cssClass = 'palette-col-' + parentEl.index(),

        btnSetFilter = chartEl.find('.set-filter'),
        btnRefine = chartEl.find('.refine-filter'),
        btnClear = chartEl.find('.clear-filter'),
        facetBarsEl = chartEl.find('ul'),

        facetValues = [],

        onSetFilter = function() {
          eventBroker.fireEvent(Events.EDIT_FACET_FILTER,  { field: facetField, values: facetValues, cssClass: cssClass }); // { dimension: dimension, facets: facets, currentFilters: currentFilters });
          return false;
        },

        update = function(response) {
          var myFacetVals = Utils.chunkArray(response.facet_counts.facet_fields[facetField], 2).slice(0, 12);
              maxCount = (myFacetVals.length > 0)? myFacetVals[0][1] : 0;

          facetValues = myFacetVals;
          facetBarsEl.empty();

          jQuery.each(myFacetVals.slice(0, 5), function(idx, val) {
            var label = val[0],
                count = val[1],
                percentage = 100 * count / maxCount;

            facetBarsEl.append(Utils.createMeter(label, count, percentage));
          });
        };

    btnRefine.hide();
    btnClear.hide();

    parentEl.append(chartEl);
    chartEl.addClass(cssClass);

    btnSetFilter.click(onSetFilter);

    this.update = update;
  };

  return FacetChart;

});
