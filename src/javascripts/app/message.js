define(function() {

  var Popup = function(cssClass, title, message) {
    var element = jQuery(
          '<div class="clicktrap">' +
            '<div class="message ' + cssClass + '">' +
              '<h1>' + title + '</h1>' +
              '<p>' + message + '</p>' +
              '<button>OK</button>' +
            '</div>' +
          '</div>'),

        btn = element.find('button'),

        open = function() {
          jQuery(document.body).append(element);
        },

        close = function() {
          element.remove();
        };

    btn.click(close);
    open();
  };

  return {

    error : function(message) {
      new Popup('error', 'Error', message);
    }

  };

});
