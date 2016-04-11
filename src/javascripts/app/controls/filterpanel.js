define(['controls/facetchart', 'events/events', 'velocity'], function(FacetChart, Events) {

  var SLIDE_DURATION = 180;

  var FilterPanel = function(containerNode, eventBroker) {
        /** Slide-able body section **/
    var body = jQuery(
          '<div class="body">' +
            '<div data-facet="Category" class="section facet"></div>' +
            '<div data-facet="Type" class="section facet"></div>' +
            '<div data-facet="FormatStatus" class="section facet"></div>' +
            '<div data-facet="Creator" class="section facet"></div>' +
            '<div data-facet="Temporal" class="section facet"></div>' +
            '<div data-facet="Material" class="section facet"></div>' +
          '</div>'),

        /** Footer (remains visible when panel slides in) **/
        footer = jQuery(
          '<div class="footer">' +
            '<span class="list-all"><span class="icon"></span> <span class="label"></span></span>' +
            '<span class="total">&nbsp;</span>' +
            '<span class="toggle-filters">Filters</span>' +
          '</div>'),

        buttonToggleFilters = footer.find('.toggle-filters'),

        /** Automatically creates facet charts & populates a lookup array based on DOM elements **/
        facetCharts = (function() {
          return jQuery.map(body.find('.facet'), function(el) {
            var containerEl = jQuery(el),
                facetField = containerEl.data('facet');

            return new FacetChart(containerEl, facetField, eventBroker);
          });
        })(),

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
        };

    body.hide();
    buttonToggleFilters.click(togglePanel);

    containerNode.append(body);
    containerNode.append(footer);
  };

  return FilterPanel;

});
