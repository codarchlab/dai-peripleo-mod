define(['events/events'], function(Events) {

  var Toolbar = function(container, eventBroker) {
    var btnHelp =
          jQuery('<div class="toolbar-button toolbar-group icon help">&#xf128;</div>'),

        btnSettings =
          jQuery('<div class="toolbar-button toolbar-group icon settings">&#xf0ad;</div>'),

        btnZoom = jQuery(
          '<div class="toolbar-group zoom">' +
          '  <div class="toolbar-button icon zoom-in">&#xf067;</div>' +
          '  <div class="toolbar-button icon zoom-out">&#xf068;</div>' +
          '</div>'),

        btnZoomIn = btnZoom.find('.zoom-in'),
        btnZoomOut = btnZoom.find('.zoom-out');

    btnSettings.click(function() { eventBroker.fireEvent(Events.EDIT_MAP_SETTINGS); });
    btnZoomIn.click(function() { eventBroker.fireEvent(Events.ZOOM_IN); });
    btnZoomOut.click(function() { eventBroker.fireEvent(Events.ZOOM_OUT); });

    container.append(btnHelp);
    container.append(btnSettings);
    container.append(btnZoom);

  };

  return Toolbar;

});
