require([
  'jquery',
  'leaflet',
  'controls/searchpanel',
  'controls/toolbar',
  'events/eventBroker',
  'map/map',
  'solr'], function(jQuery, Leaflet, SearchPanel, Toolbar, EventBroker, Map, SOLR) {

  jQuery(document).ready(function() {
    var mapDiv = document.getElementById('map'),
        searchPanelDiv = jQuery('#searchpanel'),
        toolbarDiv = jQuery('#toolbar'),

        eventBroker = new EventBroker(),

        toolbar = new Toolbar(toolbarDiv, eventBroker),
        map = new Map(mapDiv, eventBroker),
        searchPanel = new SearchPanel(searchPanelDiv, eventBroker),

        solr = new SOLR(eventBroker);
  });

});
