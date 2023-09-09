﻿/* flexMenu */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(jQuery);
  }
}(function ($) {
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  var flexObjects = [], resizeTimeout;

  function adjustFlexMenu() {
    if ($(window).width() !== windowWidth || $(window).height() !== windowHeight) {
      $(flexObjects).each(function () {
        $(this).flexMenu({'undo': true}).flexMenu(this.options);
      });
      windowWidth = $(window).width();
      windowHeight = $(window).height();
    }
  }

  function collapseAllExcept($menuToAvoid) {
    var $activeMenus, $menusToCollapse;
    $activeMenus = $('li.flexMenu-viewMore.active');
    $menusToCollapse = $activeMenus.not($menuToAvoid);
    $menusToCollapse.removeClass('active').find('> ul').hide();
  }

  $(window).resize(function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      adjustFlexMenu();
    }, 200);
  });
  $.fn.flexMenu = function (options) {
    var checkFlexObject, s = $.extend({
      'threshold': 2,
      'cutoff': 2,
      'linkText': 'More',
      'linkTitle': 'View More',
      'linkTextAll': 'Menu',
      'linkTitleAll': 'Open/Close Menu',
      'showOnHover': true,
      'popupAbsolute': true,
      'popupClass': '',
      'undo': false
    }, options);
    this.options = s;
    checkFlexObject = $.inArray(this, flexObjects);
    if (checkFlexObject >= 0) {
      flexObjects.splice(checkFlexObject, 1);
    } else {
      flexObjects.push(this);
    }
    return this.each(function () {
      var $this = $(this), $items = $this.find('> li'), $firstItem = $items.first(), $lastItem = $items.last(),
        numItems = $this.find('li').length, firstItemTop = Math.floor($firstItem.offset().top),
        firstItemHeight = Math.floor($firstItem.outerHeight(true)), $lastChild, keepLooking, $moreItem, $moreLink,
        numToRemove, allInPopup = false, $menu, i;

      function needsMenu($itemOfInterest) {
        var result = (Math.ceil($itemOfInterest.offset().top) >= (firstItemTop + firstItemHeight)) ? true : false;
        return result;
      }

      if (needsMenu($lastItem) && numItems > s.threshold && !s.undo && $this.is(':visible')) {
        var $popup = $('<ul class="flexMenu-popup" style="display:none;' + ((s.popupAbsolute) ? ' position: absolute;' : '') + '"></ul>');
        $popup.addClass(s.popupClass);
        for (i = numItems; i > 1; i--) {
          $lastChild = $this.find('> li:last-child');
          keepLooking = (needsMenu($lastChild));
          if ((i - 1) <= s.cutoff) {
            $($this.children().get().reverse()).appendTo($popup);
            allInPopup = true;
            break;
          }
          if (!keepLooking) {
            break;
          } else {
            $lastChild.appendTo($popup);
          }
        }
        if (allInPopup) {
          $this.append('<li class="flexMenu-viewMore flexMenu-allInPopup"><a href="#" title="' + s.linkTitleAll + '">' + s.linkTextAll + '</a></li>');
        } else {
          $this.append('<li class="flexMenu-viewMore"><a href="#" title="' + s.linkTitle + '">' + s.linkText + '</a></li>');
        }
        $moreItem = $this.find('> li.flexMenu-viewMore');
        if (needsMenu($moreItem)) {
          $this.find('> li:nth-last-child(2)').appendTo($popup);
        }
        $popup.children().each(function (i, li) {
          $popup.prepend(li);
        });
        $moreItem.append($popup);
        $moreLink = $this.find('> li.flexMenu-viewMore > a');
        $moreLink.click(function (e) {
          collapseAllExcept($moreItem);
          $popup.toggle();
          $moreItem.toggleClass('active');
          e.preventDefault();
        });
        if (s.showOnHover && (typeof Modernizr !== 'undefined') && !Modernizr.touch) {
          $moreItem.hover(function () {
            $popup.show();
            $(this).addClass('active');
          }, function () {
            $popup.hide();
            $(this).removeClass('active');
          });
        }
      } else if (s.undo && $this.find('ul.flexMenu-popup')) {
        $menu = $this.find('ul.flexMenu-popup');
        numToRemove = $menu.find('li').length;
        for (i = 1; i <= numToRemove; i++) {
          $menu.find('> li:first-child').appendTo($this);
        }
        $menu.remove();
        $this.find('> li.flexMenu-viewMore').remove();
      }
    });
  };
}));
