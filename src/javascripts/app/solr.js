define(['events/events', 'message'], function(Events, Message) {

  var SOLR = function(eventBroker) {

        /** Just a hard-wired dummy for testing purposes **/
    var facetStr = jQuery.map([
          'Category',
          'Type',
          'FormatStatus',
          'Creator',
          'Temporal',
          'Material'
        ], function(field) {
          return '&facet.field=' + field;
        }).join('');

        /** Just a dummy for testing purposes **/
        makeRequest = function(query) {
          var QUERY =
            'http://localhost:8983/solr/peripleo/query?rows=1000&q=' +
            query + '&facet=true' + facetStr +
            '&facet.range=TemporalUTC&facet.range.start=NOW/YEAR-2000YEARS' + // How do we set fixed date?
            '&facet.range.end=NOW&facet.range.gap=%2B60YEARS';

          jQuery.getJSON(QUERY, function(response) {
            eventBroker.fireEvent(Events.SOLR_SEARCH_RESPONSE, response);
          }).fail(function(response) {
            console.log(response);
            Message.error('No connection to SOLR backend.');
          });
        };

    eventBroker.addHandler(Events.SEARCH_CHANGED, function(diff) {
      // Just a dummy for testing purposes
      makeRequest(diff.query);
    });

  };

  return SOLR;

});
