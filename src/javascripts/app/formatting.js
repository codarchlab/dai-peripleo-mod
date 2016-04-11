define(function() {

  var METER_TEMPLATE =
      '<li><div class="meter"><div class="bar"></div><div class="label"></div></div></li>';

  return {

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
