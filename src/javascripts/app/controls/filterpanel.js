define(['events/events', 'velocity'], function(Events) {

  var SLIDE_DURATION = 180;

  var FilterPanel = function(containerNode, eventBroker) {
        /** Slide-able body section **/
    var body = jQuery(
          '<div class="body">' +
            '<div class="section"></div>' +
          '</div>'),

        /** Footer (remains visible when panel slides in) **/
        footer = jQuery(
          '<div class="footer">' +
            '<span class="list-all"><span class="icon"></span> <span class="label"></span></span>' +
            '<span class="total">&nbsp;</span>' +
            '<span class="toggle-filters">Filters</span>' +
          '</div>'),

        buttonToggleFilters = footer.find('.toggle-filters'),

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
