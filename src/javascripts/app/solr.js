define(['events/events', 'message'], function(Events, Message) {

      // SOLR config
  var SOLR_HOST = 'localhost',
  
      SOLR_PORT = 8983,
      
      SOLR_CORE = 'peripleo',
      
      // Number of search results to fetch
      SEARCH_RESULT_ROWS = 40,

      // Number of bars in the time histogram
      NUM_TIME_HISTOGRAM_BINS = 34,

      // To throttle requests to SOLR we'll stay idle between requests for this time in millis
      IDLE_DELAY_MS = 200,

      // TODO we'll want to make these configurable through UI later
      FACET_FIELDS = [
        'Category',
        'Type',
        'RightsStatus'
      ],

      // TODO make this configurable, too
      BASE_PATH = 'http://' + SOLR_HOST + ':' + SOLR_PORT + '/solr/' + SOLR_CORE + '/query';

  var SOLR = function(eventBroker) {

        /** search param state **/
    var searchParams =  {

          query: false,

          facetFilters: [],

          from: false,

          to: false

        },

        /** Indicates whether we're waiting for a SOLR response (or are in a force idle period) **/
        busy = false,

        /** A diff accumulated from requests that arrived during the busy period **/
        pendingDiff = false,

        mergeParams = function(diff, opt_mergeWith) {
          var mergeWith = (opt_mergeWith) ? opt_mergeWith : searchParams,
              previousFilter, previousFilterIdx;

          if ('query' in diff) {
            mergeWith.query = diff.query;
          }

          if ('from' in diff || 'to' in diff) {
            mergeWith.from = diff.from;
            mergeWith.to = diff.to;
          }

          if ('facetFilter' in diff) {
            if (!('facetFilters' in mergeWith))
              mergeWith.facetFilters = [];

            previousFilter = jQuery.grep(mergeWith.facetFilters, function(filter) {
              return filter.facetField === diff.facetFilter.facetField;
            });

            previousFilterIdx = (previousFilter.length > 0) ?
              mergeWith.facetFilters.indexOf(previousFilter[0]) :
              -1;

            // Remove previous filter setting, if any
            if (previousFilterIdx > -1)
              mergeWith.facetFilters.splice(previousFilterIdx, 1);

            if (diff.facetFilter.values) // If values is falsy, we want the filter cleared
              mergeWith.facetFilters.push(diff.facetFilter);
          }
        },

        /**
         * Returns true if the diff contains only a change in the time interval. (We're
         * using this below to decide whether we need to fetch a new time histogram.)
         */
        isTimeFilterChangeOnly = function(diff) {
          var clonedDiff = jQuery.extend({}, diff);
          delete clonedDiff.from;
          delete clonedDiff.to;
          return jQuery.isEmptyObject(clonedDiff);
        },

        /** Base URL captures commmon params for 'standard' and histogram request **/
        buildBaseURL = function(rows, offset) {
          var url = BASE_PATH + '?defType=edismax&mm=100%25&rows=' + rows,
              showOnlyFilterClauses = [],
              excludeFilterClauses = [];

          if (offset)
            url += '&start=' + offset;

          if (searchParams.query)
            url += '&q=' + searchParams.query;
          else
            url += '&q.alt=*:*';

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
              url += '&fq=' + showOnlyFilterClauses.join(' OR ');

            if (excludeFilterClauses.length > 0)
              url += '&fq=NOT (' + excludeFilterClauses.join(' OR ') + ')';
          }

          return url;
        },

        /** Normal search request is base URL plus time filter, field facets and timespan stats **/
        buildSearchRequestURL = function(offset) {
          var timeFilterClauses = [],
              url = buildBaseURL(SEARCH_RESULT_ROWS, offset);

          // Time filter
          if (searchParams.from)
            timeFilterClauses.push('CoverageLatest:[' + searchParams.from + ' TO *]');

          if (searchParams.to)
            timeFilterClauses.push('CoverageEarliest:[* TO ' + searchParams.to + ']');

          if (timeFilterClauses.length > 0)
            url += '&fq={!tag=time}' + timeFilterClauses.join(' AND ');

          // Field facets
          url += '&facet=true' +
            jQuery.map(FACET_FIELDS, function(field) {
              return '&facet.field=' + field;
            }).join('');

          // Stats (with time filter excluded)
          // TODO only add the {!ex=time} exclude if the time filter is actually set!
          return url +
            '&stats=true&stats.field={!ex=time}CoverageEarliest' +
            '&stats.field={!ex=time}CoverageLatest';
        },

        /** Histogram request is base URL plus time facet params **/
        buildHistogramRequestURL = function(startYear, endYear) {
          var start = startYear + '-01-01T00:00:00Z',
              end = endYear + '-12-31T23:59:59Z',
              gap;

          // Goal is 35 bins (for no other reason than aesthetics). But don't go
          // below 1 bin = 1 year. In this case we rather want fewer bars.
          gap = Math.round((endYear - startYear) / NUM_TIME_HISTOGRAM_BINS);
          if (gap < 1)
            gap = 1;

          return buildBaseURL(0) + '&facet=true' +
                 '&facet.range=CoverageUTC' +
                 '&facet.range.start=' + start +
                 '&facet.range.end=' + end +
                 '&facet.range.gap=%2B' + gap + 'YEARS';
        },

        /** Issues a standard search request **/
        makeSearchRequest = function(offset) {
          return jQuery.getJSON(buildSearchRequestURL(offset))
            .fail(function(error) {
              console.log(error);
              Message.error('No connection to SOLR backend.');
            });
        },

        /**
         * Builds the time histogram through a sequence of two requests:
         * - the first request fetches min/max years using SOLR stats
         * - the second requests retrieves the date range facets based for the min/max interval
         */
        makeHistogramRequest = function(stats) {
          var fieldEarliest = stats.stats_fields.CoverageEarliest,
              fieldLatest = stats.stats_fields.CoverageLatest,
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
        },

        handlePending = function() {
          if (pendingDiff) {
            // Pending request? Query SOLR!
            newRequest(pendingDiff);
            pendingDiff = false;
          } else {
            // No request pending? Wait for IDLE_DELAY_MS
            setTimeout(function() {
              if (pendingDiff)
                // New pending request
                handlePending();
              else
                // Still no pending request - clear busy flag
                busy = false;
            }, IDLE_DELAY_MS);
          }
        },

        newRequest = function(diff) {
          makeSearchRequest().done(function(response) {
            if (!isTimeFilterChangeOnly(diff))
              makeHistogramRequest(response.stats);
            eventBroker.fireEvent(Events.SOLR_SEARCH_RESPONSE, response);
          }).always(handlePending);
        };

    eventBroker.addHandler(Events.SEARCH_CHANGED, function(diff) {
      mergeParams(diff);
      if (busy) {
        if (pendingDiff)
          pendingDiff = mergeParams(diff, pendingDiff);
        else
          pendingDiff = diff;
      } else {
        busy = true;
        newRequest(diff);
      }
    });

    eventBroker.addHandler(Events.LOAD_NEXT_PAGE, function(offset) {
      makeSearchRequest(offset).done(function(response) {
        eventBroker.fireEvent(Events.SOLR_NEXT_PAGE, response);
      });
    });

  };

  return SOLR;

});
