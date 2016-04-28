define(['events/events', '../utils'], function(Events, Utils) {

  var OPACITY_UNSELECTED = 0.4;

  var FilterEditor = function(eventBroker) {

    var element = jQuery(
          '<div class="clicktrap">' +
            '<div class="filter-editor facetchart">' +
              '<div class="btn select-all selected"><span class="icon">&#xf046;</span> <span class="label">All</span></div>' +
              '<div class="buttons">' +
                '<span class="ok icon">&#xf058;</span>' +
                '<span class="cancel icon">&#xf057;</span>' +
              '</div>' +
              '<ul></ul>' +
            '</div>' +
          '</div>'),

        otherTemplate =
          '<li class="selected other">' +
          '  <span class="icon selection-toggle">&#xf046;</span>' +
          '  <div class="label-other">Other</div>' +
          '</li>',

        btnSelectAll = element.find('.select-all'),
        btnOk = element.find('.ok'),
        btnCancel = element.find('.cancel'),

        list = element.find('ul'),

        facetField,

        selectAll = function() {
          btnSelectAll.addClass('selected');
          btnSelectAll.find('.icon').html('&#xf046;');
          selectValue(list.find('li').not('.other'));
          selectOther();
        },

        deselectAll = function() {
          btnSelectAll.removeClass('selected');
          btnSelectAll.find('.icon').html('&#xf096;');
          deselectValue(list.find('li').not('.other'));
          deselectOther();
        },

        toggleAll = function() {
          if (btnSelectAll.hasClass('selected'))
            deselectAll();
          else
            selectAll();
        },

        selectValue = function(element) {
          element.addClass('selected');
          element.find('.meter').css('opacity', 1);
          element.find('.icon').html('&#xf046;');
        },

        deselectValue = function(element) {
          // Deselecting a value also deselects the 'All' buttons
          btnSelectAll.removeClass('selected');
          btnSelectAll.find('.icon').html('&#xf096;');

          element.removeClass('selected');
          element.find('.meter').css('opacity', OPACITY_UNSELECTED);
          element.find('.icon').html('&#xf096;');
        },

        toggleValue = function(element) {
          if (element.hasClass('selected'))
            deselectValue(element);
          else
            selectValue(element);
        },

        selectOther = function() {
          var li = element.find('.other');
          li.addClass('selected');
          li.find('.label-other').css('opacity', 1);
          li.find('.icon').html('&#xf046;');
        },

        deselectOther = function() {
          var li = element.find('.other');
          li.removeClass('selected');
          li.find('.label-other').css('opacity', OPACITY_UNSELECTED);
          li.find('.icon').html('&#xf096;');
        },

        toggleOther = function() {
          if (element.find('.other').hasClass('selected'))
            deselectOther();
          else
            selectOther();
        },

        clearList = function() {
          list.removeClass();
          list.empty();
        },

        getSelectedValues = function() {
          return jQuery.map(list.find('li.selected').not('.other'), function(li) {
            return jQuery(li).attr('data-value');
          });
        },

        getUnselectedValues = function() {
          return jQuery.map(list.find('li').not('.selected').not('.other'), function(li) {
            return jQuery(li).attr('data-value');
          });
        },

        isOtherSet = function() {
          return element.find('.other').hasClass('selected');
        },

        render = function(facet) {
          var values = facet.values,
              maxCount = (values.length > 0) ? values[0][1] : 0;

          facetField = facet.field;

          clearList();

          list.addClass('facetchart ' + facet.cssClass); // TODO add colour palette index

          jQuery.each(values, function(idx, val) {
            var tooltip = Utils.formatNumber(val[1]) + ' Results',
                percentage = 100 * val[1] / maxCount,
                li = Utils.createMeter(val[0], tooltip, percentage);

            li.addClass('selected');
            li.attr('data-value', val[0]);
            li.prepend('<span class="icon selection-toggle">&#xf046;</span>');
            li.click(function() { toggleValue(li); });
            list.append(li);
          });

          list.append(otherTemplate);
          selectAll();
          element.show();
        },

        onOk = function() {
          // 'Inclusive' or 'exclusive' filtering? I.e. does the user want to
          // see selected categories AND others not in the list (inclusive)? Or
          // restrict to ONLY the selected ones (exclusive)?
          var filterMode = (isOtherSet()) ? 'EXCLUDE' : 'SHOW_ONLY',
              values = (filterMode === 'SHOW_ONLY') ? getSelectedValues() : getUnselectedValues(),
              filter = (values.length > 0) ? { facetField: facetField, filterMode: filterMode, values: values } : false;

          // TODO merge with pre-set filter?

          // TODO fire event

          console.log(filter);

          element.hide();
        },

        onCancel = function() {
          element.hide();
        };

    element.hide();
    jQuery(document.body).append(element);

    btnOk.click(onOk);
    btnCancel.click(onCancel);
    btnSelectAll.click(toggleAll);

    list.on('click', '.other', toggleOther);

    eventBroker.addHandler(Events.EDIT_FACET_FILTER, render);
  };

  return FilterEditor;

});
