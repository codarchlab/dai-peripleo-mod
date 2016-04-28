define(['events/events', 'message'], function(Events, Message) {

      // Number of search results to fetch
  var SEARCH_RESULT_ROWS = 20,

      // TODO we'll want to make these configurable through UI later
      FACET_FIELDS = [
        'Category',
        'Type',
        'FormatStatus',
        'Temporal',
        'Material'
      ];

  var SOLR = function(eventBroker) {

        /** search param state **/
    var searchParams =  {

          query: false,

          facetFilters: [],

          from: false,

          to: false

        },

        /** TODO this could be made a lot more generic **/
        mergeParams = function(diff) {
          if ('query' in diff) {
            searchParams.query = diff.query;
          }

          if ('from' in diff || 'to' in diff) {
            searchParams.from = diff.from;
            searchParams.to = diff.to;
          }

          if ('facetFilter' in diff) {
            var previousFilter = jQuery.grep(searchParams.facetFilters, function(filter) {
                  return filter.facetField === diff.facetFilter.facetField;
                }),

                previousFilterIdx = (previousFilter.length > 0) ?
                  searchParams.facetFilters.indexOf(previousFilter[0]) :
                  -1;

            // Remove previous filter setting, if any
            if (previousFilterIdx > -1)
              searchParams.facetFilters.splice(previousFilterIdx, 1);

            if (diff.facetFilter.values) // If values is falsy, we want the filter cleared
              searchParams.facetFilters.push(diff.facetFilter);
          }
        },

        buildRequestURL = function(offset) {
          // TODO make configurable
          var url = 'http://localhost:8983/solr/peripleo/query?rows=' + SEARCH_RESULT_ROWS +'&facet=true',
              showOnlyFilterClauses = [],
              excludeFilterClauses = []; // To hold the OR-connected facet filter clauses

          if (searchParams.query)
            url += '&q=' + searchParams.query;
          else
            url += '&q=*';

          if (searchParams.facetFilters.length > 0) {
            // Collect all 'SHOW_ONLY' clauses
            jQuery.each(searchParams.facetFilters, function(i, filter) {
              if (filter.filterMode === 'SHOW_ONLY') {
                jQuery.each(filter.values, function(j, value) {
                  showOnlyFilterClauses.push(filter.facetField + ':' + encodeURIComponent('"' + value + '"'));
                });
              }
            });

            // Collect all 'EXCLUDE' clauses
            jQuery.each(searchParams.facetFilters, function(i, filter) {
              if (filter.filterMode === 'EXCLUDE') {
                jQuery.each(filter.values, function(j, value) {
                  excludeFilterClauses.push(filter.facetField + ':' + encodeURIComponent('"' + value + '"'));
                });
              }
            });

            if (showOnlyFilterClauses.length > 0)
              url += ' AND (' + showOnlyFilterClauses.join(' OR ') + ')';

            if (excludeFilterClauses.length > 0)
              url += ' AND NOT (' + excludeFilterClauses.join(' OR ') + ')';
          }

          url += jQuery.map(FACET_FIELDS, function(field) {
            return '&facet.field=' + field;
          }).join('');

          // TODO fix date facet request params
          url +=
            '&facet.range=TemporalUTC&facet.range.start=NOW/YEAR-2000YEARS' +
            '&facet.range.end=NOW&facet.range.gap=%2B60YEARS';

          if (offset)
            url += '&start=' + offset;

          return url;
        },

        /** Just a dummy for testing purposes **/
        makeRequest = function(offset) {
          return jQuery.getJSON(buildRequestURL(offset))
            .fail(function(response) {
              console.log(response);
              Message.error('No connection to SOLR backend.');
            });
        };

    eventBroker.addHandler(Events.SEARCH_CHANGED, function(diff) {
      mergeParams(diff);
      makeRequest().done(function(response) {
        eventBroker.fireEvent(Events.SOLR_SEARCH_RESPONSE, response);
      });
    });

    eventBroker.addHandler(Events.LOAD_NEXT_PAGE, function(offset) {
      makeRequest(offset).done(function(response) {
        eventBroker.fireEvent(Events.SOLR_NEXT_PAGE, response);
      });
    });

  };

  return SOLR;

});
