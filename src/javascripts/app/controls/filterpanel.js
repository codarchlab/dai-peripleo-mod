define(['controls/facetchart', 'controls/filtereditor', 'controls/timehistogram', 'events/events', 'velocity'], function(FacetChart, FilterEditor, TimeHistogram, Events) {

  var SLIDE_DURATION = 180;

  var FilterPanel = function(containerNode, eventBroker) {
        /** Slide-able body section **/
    var body = jQuery(
          '<div class="body">' +
            '<div class="section timehistogram"></div>' +
            '<div data-facet="Category" class="section facet"></div>' +
            '<div data-facet="Type" class="section facet"></div>' +
            '<div data-facet="FormatStatus" class="section facet"></div>' +
            '<div data-facet="Temporal" class="section facet"></div>' +
            '<div data-facet="Material" class="section facet"></div>' +
          '</div>'),

        /** Footer (remains visible when panel slides in) **/
        footer = jQuery(
          '<div class="footer">' +
            '<span class="list-results">' +
              '<span class="icon">&#xf03a;</span>' +
              '<span class="total"></span>' +
            '</span>' +
            '<span class="toggle-filters">Filters</span>' +
          '</div>'),

        footerTotals = footer.find('.total'),
        buttonToggleFilters = footer.find('.toggle-filters'),

        histogram, // Initialized later

        /** Automatically creates facet charts & populates a lookup array based on DOM elements **/
        facetCharts = (function() {
          return jQuery.map(body.find('.facet'), function(el) {
            var containerEl = jQuery(el),
                facetField = containerEl.data('facet');

            return new FacetChart(containerEl, facetField, eventBroker);
          });
        })(),

        filterEditor = new FilterEditor(eventBroker),

        /** Slides the panel in or out **/
        togglePanel = function() {
          var visible = body.is(':visible'),
              action = (visible) ? 'slideUp' : 'slideDown';

          if (visible)
            eventBroker.fireEvent(Events.HIDE_FILTERS);
          else
            eventBroker.fireEvent(Events.SHOW_FILTERS);

          body.velocity(action, {
            duration: SLIDE_DURATION,
            complete: function() {
              if (visible)
                buttonToggleFilters.removeClass('open');
              else
                buttonToggleFilters.addClass('open');
            }
          });
        },

        onSearchResponse = function(response) {
          jQuery.each(facetCharts, function(idx, chart) {
            chart.update(response);
          });

          footerTotals.html(response.response.numFound + ' Results');
          histogram.update(response);
        };

    body.hide();
    buttonToggleFilters.click(togglePanel);

    containerNode.append(body);
    containerNode.append(footer);

    histogram = new TimeHistogram(body.find('.timehistogram'), 'TemporalUTC', eventBroker);

    eventBroker.addHandler(Events.SOLR_SEARCH_RESPONSE, onSearchResponse);
  };

  return FilterPanel;

});
