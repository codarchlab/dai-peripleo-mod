/** The result list **/
define(['events/events'], function(Events) {

  var SLIDE_DURATION = 180,

      OPEN_DELAY = 380,

      ICONS = {
        'Artifact' : '&#xf219;',
        'Context'  : '&#xf219;',
        'Feature'  : '&#xf219;',
        'Image'    : '&#xf219;',
        'Section'  : '&#xf219;'
      };

  var ResultList = function(container, eventBroker) {

    var element = jQuery(
          '<div id="search-results">' +
          '  <ul></ul>' +
          '  <div id="wait-for-next"><img src="/images/wait-circle.gif"></div>' +
          '</div>'),

        /** DOM element shorthands **/
        list = element.find('ul'),
        waitForNextIndicator = element.find('#wait-for-next'),

        /** Most recent search results **/
        currentResultItems = [],
        currentResultsTotal,

        /**
         * Helper that generates the appropriate icon span for a result.
         *
         * This will get more complex as we introduce more types in the future.
         */
        getIcon = function(result) {
          var icon = ICONS[result.Type];
          if (!icon)
            icon = '&#xf219;';
          return '<span class="icon" title="Place">' + icon + '</span>';
        },

        /** Creates the HTML for a single search result entry **/
        renderOneRow = function(item) {
          var icon = getIcon(item),
              html = '<li><h3>' + icon + item.Title + '</h3>',
              element;

          console.log(item);

          if (item.Description)
            html += '<p class="description">' + item.Description.replace(/\\n/g, '<br/>') + '</p>';

          /*
          if (result.temporal_bounds) {
            html += '<p class="temp-bounds">';
            if (result.temporal_bounds.start === result.temporal_bounds.end)
              html += Formatting.formatYear(result.temporal_bounds.start);
            else
              html += Formatting.formatYear(result.temporal_bounds.start) + ' - ' + Formatting.formatYear(result.temporal_bounds.end);
            html += '</p>';
          }

          if (result.names)
            html += '<p class="names">' + result.names.slice(0, 8).join(', ') + '</p>';



          if (result.object_type === 'Place') {
            html += '<ul class="uris">' + Formatting.formatGazetteerURI(result.identifier);

            if (result.matches)
              jQuery.each(result.matches, function(idx, uri) {
                  html += Formatting.formatGazetteerURI(uri);
                });

            html += '</ul>';
          }

          if (result.dataset_path)
            html += '<p class="source">Source:' +
                    ' <span data-id="' + result.dataset_path[0].id + '">' + result.dataset_path[0].title + '</span>' +
                    '</p>';
          */

          // Add event handlers
          element = jQuery(html + '</li>');

          /*
          element.mouseenter(function() { eventBroker.fireEvent(Events.MOUSE_OVER_RESULT, result); });
          element.mouseleave(function() { eventBroker.fireEvent(Events.MOUSE_OVER_RESULT); });
          element.click(function() {
            hide();
            eventBroker.fireEvent(Events.SELECT_RESULT, [ result ]);
          });
          */

          return element;
        },

        render = function(items, append) {
          var moreAvailable = currentResultItems.length < currentResultsTotal,
              rows = jQuery.map(items, function(item) {
                return renderOneRow(item);
              });

          if (!append)
            list.empty();

          list.append(rows);

          if (moreAvailable)
            waitForNextIndicator.show();
          else
            waitForNextIndicator.hide();
        },

        toggleVisibility = function() {
          var scrollTop = function() { element.scrollTop(0); };
          if (!element.is(':visible')) {
            render(currentResultItems);
            element.velocity('slideDown', { duration: SLIDE_DURATION, complete: scrollTop });
          } else {
            element.velocity('slideUp', { duration: SLIDE_DURATION });
          }
        },

        onSearchResponse = function(response) {
          currentResultItems = response.response.docs;
          currentResultsTotal = response.response.numFound;

          if (element.is(':visible')) {
            element.scrollTop(0);
            render(currentResultItems);
          }
        },

        /** SOLR delivered the next page of search results **/
        onNextPage = function(response) {
          currentResultItems = currentResultItems.concat(response.response.docs);
          render(response.response.docs, true);
        },

        /** If scrolled to bottom, we load the next result page if needed **/
        onScroll = function() {
          var scrollPos = element.scrollTop() + element.innerHeight(),
              scrollBottom = element[0].scrollHeight,
              numResultsLoaded;

          if (scrollPos >= scrollBottom) {
            numResultsLoaded = currentResultItems.length;
            if (currentResultsTotal > numResultsLoaded)
              eventBroker.fireEvent(Events.LOAD_NEXT_PAGE, numResultsLoaded);
          }
        };

    waitForNextIndicator.hide();
    element.scroll(onScroll);
    element.hide();

    container.append(element);

    eventBroker.addHandler(Events.TOGGLE_RESULT_LIST, toggleVisibility);
    eventBroker.addHandler(Events.SOLR_SEARCH_RESPONSE, onSearchResponse);
    eventBroker.addHandler(Events.SOLR_NEXT_PAGE, onNextPage);
  };

  return ResultList;

});
