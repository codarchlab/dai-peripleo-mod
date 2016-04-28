define(['events/events', 'message'], function(Events, Message) {

      // Number of search results to fetch
  var SEARCH_RESULT_ROWS = 1000,

      // TODO we'll want to make these configurable through UI later
      FACET_FIELDS = [
        'Category',
        'Type',
        'FormatStatus',
        'Creator',
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

            searchParams.facetFilters.push(diff.facetFilter);

            console.log(searchParams.facetFilters);
          }
        },

        buildRequestURL = function() {
          // TODO make configurable
          var url =
            'http://localhost:8983/solr/peripleo/query?rows=' + SEARCH_RESULT_ROWS +'&facet=true';

          if (searchParams.query)
            url += '&q=' + searchParams.query;
          else
            url += '&q=*';

          url += jQuery.map(FACET_FIELDS, function(field) {
            return '&facet.field=' + field;
          }).join('');

          // TODO fix date facet request params
          url +=
            '&facet.range=TemporalUTC&facet.range.start=NOW/YEAR-2000YEARS' +
            '&facet.range.end=NOW&facet.range.gap=%2B60YEARS';



          return url;
        },

        /** Just a dummy for testing purposes **/
        makeRequest = function() {
          jQuery.getJSON(buildRequestURL(), function(response) {
            eventBroker.fireEvent(Events.SOLR_SEARCH_RESPONSE, response);
          }).fail(function(response) {
            console.log(response);
            Message.error('No connection to SOLR backend.');
          });
        };

    eventBroker.addHandler(Events.SEARCH_CHANGED, function(diff) {
      // Merge the change with the current search params state
      mergeParams(diff);
      makeRequest();
    });

  };

  return SOLR;

});
