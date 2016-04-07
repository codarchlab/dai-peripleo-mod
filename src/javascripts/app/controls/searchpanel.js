define(['controls/filterpanel', 'events/events'], function(FilterPanel, Events) {

  var SLIDE_DURATION = 180;

  var SearchPanel = function(container, eventBroker) {

    var element = jQuery(
          '<div id="searchpanel-container">' +
          '  <div class="searchbox">' +
          '    <form>' +
          '      <input class="search-input" type="text" name="query" autocomplete="off">' +
          '      <span class="search-input-icon icon">&#xf002;</span>' +
          '    </form>' +
          '  </div>' +
          '  <div class="filterpanel"></div>' +
          '</div>'),

        /** DOM element shorthands **/
        searchForm = element.find('form'),
        searchInput = searchForm.find('input'),
        searchIcon = searchForm.find('.search-input.icon'),

        filterPanelContainer = element.find('.filterpanel'),

        /** Sub-elements - to be initialized after element was added to DOM **/
        filterPanel,

        /** Stores current total result count **/
        currentTotals = 0,

        /** Updates the icon according to the contents of the search input field **/
        updateIcon = function() {
          var chars = searchInput.val().trim();

          if (chars.length === 0 && !isStateSubsearch) {
            searchIcon.html('&#xf002;');
            searchIcon.removeClass('clear');
          } else {
            searchIcon.html('&#xf00d;');
            searchIcon.addClass('clear');
          }
        },

        /** Handler for the 'X' clear button **/
        onResetSearch = function() {
          autoSuggest.clear();
          searchForm.submit();
          updateIcon();
        };

    searchForm.submit(function(e) {
      var chars = searchInput.val().trim();

      if (chars.length === 0)
        eventBroker.fireEvent(Events.SEARCH_CHANGED, { query : false });
      else
        eventBroker.fireEvent(Events.SEARCH_CHANGED, { query : chars });

      searchInput.blur();
      return false; // preventDefault + stopPropagation
    });

    // Append panel to the DOM
    container.append(element);
    filterPanel = new FilterPanel(filterPanelContainer, eventBroker);

  };

  return SearchPanel;

});
