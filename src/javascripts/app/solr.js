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

          from: false,

          to: false

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
      jQuery.extend(searchParams, diff);
      makeRequest();
    });

  };

  return SOLR;

});
