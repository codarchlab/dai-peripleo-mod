define(['events/events', 'message'], function(Events, Message) {

      // Number of search results to fetch
  var SEARCH_RESULT_ROWS = 40,

      NUM_TIME_HISTOGRAM_BINS = 35,

      // TODO we'll want to make these configurable through UI later
      FACET_FIELDS = [
        'Category',
        'Type',
        'FormatStatus',
        'Temporal',
        'Material'
      ],

      // TODO make this configurable, too
      BASE_PATH = 'http://localhost:8983/solr/peripleo/query';

  var SOLR = function(eventBroker) {

        /** search param state **/
    var searchParams =  {

          query: false,

          facetFilters: [],

          from: false,

          to: false

        },

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

        /** Base URL captures commmon params for 'standard' and histogram request **/
        buildBaseURL = function(offset) {
          var url = BASE_PATH + '?facet=true',
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

          if (offset)
            url += '&start=' + offset;

          return url;
        },

        /** Normal request is base URL plus rows, facets and stats parameter **/
        buildRequestURL = function(offset) {
          return buildBaseURL(offset) +
                 '&stats=true&stats.field=TemporalEarliest&stats.field=TemporalLatest' +
                 '&rows=' + SEARCH_RESULT_ROWS +
                 jQuery.map(FACET_FIELDS, function(field) {
                   return '&facet.field=' + field;
                 }).join('');
        },

        /** Histogram request is base URL plus rows=0 and histogram params **/
        buildHistogramRequestURL = function(startYear, endYear) {
          var start = startYear + '-01-01T00:00:00Z',
              end = endYear + '-12-31T23:59:59Z',
              gap;

          // Goal is 35 bins (for no other reason than aesthetics). But don't go
          // below 1 bin = 1 year. In this case we rather want fewer bars.
          gap = Math.round((endYear - startYear) / NUM_TIME_HISTOGRAM_BINS);
          if (gap < 1)
            gap = 1;

          return buildBaseURL() +
                 '&rows=0&facet.range=TemporalUTC' +
                 '&facet.range.start=' + start +
                 '&facet.range.end=' + end +
                 '&facet.range.gap=%2B' + gap + 'YEARS';
        },

        /** Just a dummy for testing purposes **/
        makeRequest = function(offset) {
          return jQuery.getJSON(buildRequestURL(offset))
            .fail(function(error) {
              console.log(error);
              Message.error('No connection to SOLR backend.');
            });
        },

        makeTimeHistogramRequest = function(stats) {
          var fieldEarliest = stats.stats_fields.TemporalEarliest,
              fieldLatest = stats.stats_fields.TemporalLatest,
              earliest = Math.min(fieldEarliest.min, fieldLatest.min),
              latest = Math.max(fieldEarliest.max, fieldLatest.max);

          // Only fetch the histogram if there is an interval
          // Note: an undated response will result in earliest = latest = 0
          if (earliest !== latest) {
            jQuery.getJSON(buildHistogramRequestURL(earliest, latest))
              .done(function(response) {
                eventBroker.fireEvent(Events.SOLR_TIME_HISTOGRAM, response);
              })
              .fail(function(error) {
                // Not fatal - just log
                console.log(error);
              });
          }
        };

    eventBroker.addHandler(Events.SEARCH_CHANGED, function(diff) {
      mergeParams(diff);
      makeRequest().done(function(response) {
        makeTimeHistogramRequest(response.stats);
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
