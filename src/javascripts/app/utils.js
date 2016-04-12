define(function() {

  var METER_TEMPLATE =
      '<li><div class="meter"><div class="bar"></div><div class="label"></div></div></li>';

  return {

    chunkArray: function(arr, stepSize) {
      var chunks = [],
          i = 0,
          n = arr.length;

      while (i < n)
        chunks.push(arr.slice(i, i += stepSize));

      return chunks;
    },

    formatYear: function(year) {
      if (year < 0) return -year + ' BC'; else return year + ' AD';
    },

    createMeter: function(label, count, percentage) {
      var row = jQuery(METER_TEMPLATE),
          bar = row.find('.bar');

      bar.css('width', percentage + '%');
      bar.attr('title', count + ' Results');
      row.find('.label').html(label);
      return row;
    }

  };

});
