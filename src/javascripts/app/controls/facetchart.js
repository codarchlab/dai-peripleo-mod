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
        btnRefineFilter = chartEl.find('.refine-filter'),
        btnClearFilter = chartEl.find('.clear-filter'),

        facetBarsEl = chartEl.find('ul'),

        currentFilter = false,

        facetValues = [],

        /** JavaScript has no native feature to remove duplicates form an array - here's a helper **/
        distinct = function(arr) {
          var distinct = [];
          jQuery.each(arr, function(idx, el) {
            if (distinct.indexOf(el) === -1)
              distinct.push(el);
          });
          return distinct;
        },

        mergeFilters = function(filterUpdate) {
          if (currentFilter) {
            if (currentFilter.filterMode === 'EXCLUDE' && filterUpdate.filterMode === 'EXCLUDE') {
              // Additional excludes - append the values & eliminate duplicates
              currentFilter.values = distinct(currentFilter.values.concat(filterUpdate.values));
            } else {
              // Two possibilities:
              // - filter update has mode SHOW_ONLY or
              // - filter update has mode EXCLUDE & current filter is mode SHOW_ONLY
              // In both cases, replace
              currentFilter = filterUpdate;
            }
          } else {
            // No filter set right now - replace
            currentFilter = filterUpdate;
          }
        },

        /** User clicked the 'Set Filter' button **/
        onSetFilter = function() {
          eventBroker.fireEvent(Events.EDIT_FACET_FILTER,  { field: facetField, values: facetValues, cssClass: cssClass });
          return false;
        },

        onClearFilter = function() {
          currentFilters = false;
          btnRefineFilter.hide();
          btnClearFilter.hide();
          btnSetFilter.show();

          // Somewhat hacky syntax to clear a filter on a facetField
          eventBroker.fireEvent(Events.SEARCH_CHANGED, { facetFilter: { facetField: facetField, values: false } });
        },

        /** User changed the filter settings in the filter editor **/
        onFilterSettingsChanged = function(filterUpdate) {
          if (facetField === filterUpdate.facetField) {
            // Filter setting affects this facet!
            mergeFilters(filterUpdate);

            if (currentFilter) {
              btnSetFilter.hide();
              btnRefineFilter.show();
              btnClearFilter.show();
            } else {
              btnSetFilter.show();
              btnRefineFilter.hide();
              btnClearFilter.hide();
            }

            eventBroker.fireEvent(Events.SEARCH_CHANGED, { facetFilter: currentFilter });
          }
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

            if (count > 0)
              facetBarsEl.append(Utils.createMeter(label, count, percentage));
          });
        };

    btnRefineFilter.hide();
    btnClearFilter.hide();

    parentEl.append(chartEl);
    chartEl.addClass(cssClass);

    btnSetFilter.click(onSetFilter);
    btnClearFilter.click(onClearFilter);

    eventBroker.addHandler(Events.FACET_FILTER_UPDATED, onFilterSettingsChanged);

    this.update = update;
  };

  return FacetChart;

});
