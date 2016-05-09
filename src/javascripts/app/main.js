require([
  'jquery',
  'leaflet',
  'controls/resultlist',
  'controls/searchpanel',
  'controls/toolbar',
  'events/eventBroker',
  'events/events',
  'map/map',
  'solr'], function(jQuery, Leaflet, ResultList, SearchPanel, Toolbar, EventBroker, Events, Map, SOLR) {

  jQuery(document).ready(function() {
    var mapDiv = document.getElementById('map'),
        controlsDiv = jQuery('#controls'),
        toolbarDiv = jQuery('#toolbar'),

        eventBroker = new EventBroker(),

        toolbar = new Toolbar(toolbarDiv, eventBroker),
        map = new Map(mapDiv, eventBroker),
        searchPanel = new SearchPanel(controlsDiv, eventBroker),
        resultList = new ResultList(controlsDiv, eventBroker),

        solr = new SOLR(eventBroker);

    // Fire an initial search request
    eventBroker.fireEvent(Events.SEARCH_CHANGED, { query: false });
  });

});
