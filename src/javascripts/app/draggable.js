define(['jquery-ui'], function() {

  /** Flag that indicates wether the device supports touch events **/
  var hasTouch = ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0),

      makeTouchXDraggable = function(element, onDrag, onStop, opt_containment) {
        element.bind('touchmove', function(e) {
          console.log(e);
        });
      };

  return {

    makeXDraggable: function(element, onDrag, onStop, opt_containment) {
      if (hasTouch)
        makeTouchXDraggable(element, onDrag, onStop, opt_containment);
      else // TODO remove jQuery dependency once we have implemented our own touch code
        element.draggable({
          axis: 'x',
          containment: opt_containment,
          drag: onDrag,
          stop: onStop
        });
    }

  };

});
