define(['events/events', 'message'], function(Events, Message) {

  var SOLR = function(eventBroker) {

        /** Just a hard-wired dummy for testing purposes **/
    var facetStr = '&facet=true&' + jQuery.map([
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
          jQuery.getJSON('http://localhost:8983/solr/peripleo/query?rows=1000&q=' + query + facetStr, function(response) {
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
