require([
  'jquery',
  'leaflet',
  'controls/resultlist',
  'controls/searchpanel',
  'controls/toolbar',
  'events/eventBroker',
  'map/map',
  'solr'], function(jQuery, Leaflet, ResultList, SearchPanel, Toolbar, EventBroker, Map, SOLR) {

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
  });

});
