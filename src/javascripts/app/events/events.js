define(function() {

  return {

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* SOLR-related events            */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** SOLR returned a search result **/
    SOLR_SEARCH_RESPONSE : 'searchResponse',

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Search-related UI events       */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /**
     * The user changed any of the search parameters, e.g. by typing & hitting ENTER in
     * the search box or by changing the filter settings
     */
    SEARCH_CHANGED : 'searchChanged',

    /** The users has opened the filters panel **/
    SHOW_FILTERS : 'showFilters',

    /** The user has hidden the filters panel **/
    HIDE_FILTERS : 'hideFilters',

    /** The user has clicked 'Set Filter' (or 'Refine') on a facet field **/
    EDIT_FACET_FILTER : 'editFacetFilter',

    /** The user updated the filter settings for a facet **/
    FACET_FILTER_UPDATED : 'facetFilterUpdated',

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Map-related UI events          */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** The user changed the map viewport **/
    VIEW_CHANGED : 'viewChanged',

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Toolbar-related UI events      */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** The user clicked the map settings button **/
    EDIT_MAP_SETTINGS : 'editMapSettings',

    /** The user clicked the 'zoom in' (plus) button **/
    ZOOM_IN : 'zoomIn',

    /** The user clicked the 'zoom out' (minus) button **/
    ZOOM_OUT : 'zoomOut',

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Settings-related UI events     */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** The user changed the map base layer **/
    CHANGE_LAYER : 'changeLayer'

  };

});
