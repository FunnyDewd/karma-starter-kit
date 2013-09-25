/*
 *  mwf_popover
 *  A jquery plugin to display a floating panel of content near 
 *  an associated link
 *
 *  Usage:
 *
 *
 *  Based on jQuery Boilerplate by Zeno Rocha (MIT License)
 */

/* jshint undef: true, unused: false */
/* global console, jQuery, window, document, event */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {
  'use strict';

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "mwf_popover",
        // for future use...
        defaults = {};

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.el = element;
        this.$el = $(element);

        // merge the defaults and options into a single settings object
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
          var self = this;
          var handleTapEvent = function(event) {
            //  if another popover is open somewhere in the dom. CLose it using its
            // .close() method.
            var $openedLink = $(".popover-link.open");
            var okToOpen = true;      // Flag to indicate that we are ok to open up the popover
            if($openedLink.length > 0){
              $openedLink.mwf_popover("close"); // TODO: change this function call. It smells bad.
              okToOpen = false;
            }

            // otherwise, use the .open() method to open the popover. Assuming it's ok to open.
            if(okToOpen) {
              self.open();
            } 

            event.preventDefault();
            event.stopImmediatePropagation();
          }; // end of handleTapEvent()

          // function: checkForHandler(elem, event)
          //  - Checks whether the elem has a handler for the namespaced event
          // returns: bool - true if the event handler exists, false otherwise
          // params: elem - element to query (either dom element or jquery object)
          //         event - string with the type of element with namespace (click.foo)
          var checkForHandler = function(elem, event) {
            if ((typeof elem === "undefined") || (typeof event === "undefined")) {
              // really?? Y U No Pass Arguments?
              return false;
            }

            // ensure we have a DOM element, not a jQuery obj.
            var theElem = $(elem).get(0);
            var eventType = event.split('.')[0];
            var namespace = event.split('.')[1];

            if($.hasData(theElem)){
              var jQEvents = $._data(theElem, "events")[eventType];
              if (!jQEvents) { // There are no events of type eventType
                return false;
              } else {
                if (namespace) {
                  for (var i = 0; i < jQEvents.length; i++) {
                    if (jQEvents[i].namespace === namespace) {
                      return true;
                    }
                  }

                  // couldn't find it, return false
                  return false;
                }
              }
            } else {
              // there's nothing attached to self element
              return false;
            }
          }; // end of checkForHandler

          var initSelectPopover = function () {
            var $popoverDiv = $contentDiv.closest(".popover");
            
            if($popoverDiv.find("ul li a").length === 0) {
              throw new PopoverError("Select type popovers require a list of 0 or more links");
            } else {
              $popoverDiv.addClass("select")
                .hammer().on("tap.popover", "a", function(){
                  var selectedValue = $(this).data("value");
                  $popoverDiv.data("selectedValue", selectedValue);
                  self.close(selectedValue);
                });
            }
          };  // end of initSelectPopover();

          // before anything, let's make sure we have the .popover-link class
          self.$el.addClass("popover-link").removeAttr("href");

          // 1. grab the attributes from the link and check the DOM.
          // We're expecting a data-content-id attribute that points to the .popover-content
          var contentId = self.$el.data("contentId");
          if (contentId === undefined) {
            throw new PopoverError("target missing data-content-id attribute.");
          }

          var $contentDiv = $(document).find(".popover-content[data-content-id='" + contentId + "']");
          if ($contentDiv.length === 0) {
            throw new PopoverError("popover content is missing for self target");
          }
          // 2. Wrap the content in DIV.popover if the popover doesn't already exist
          if($contentDiv.closest(".popover").length === 0){
            $contentDiv.wrap("<div class='popover'><div class='popover-container'></div></div>");
          }
          // 3. Wrap the link text in a span so we can target it in the UI, then set the click and tap event handlers
          self.$el.html("<span>" + self.$el.html() + "</span>");
          self.$el.hammer().on("tap.mwf_popover", handleTapEvent);

          // 4. Make sure there's a tap handler on the body that closes popovers
          if (!checkForHandler(document.body, 'tap.mwf_popover')){
            $("body").hammer().on("tap.mwf_popover", function(event) {
              // check to see if the target of the tap is the popover itself, if yes, then ignore the event
              var $openPopover = $(event.target).closest(".popover.open");
              if($openPopover.length === 1) {
                return;
              }
              // Look to see if any of the popovers on the page are active.
              var $activeLink;
              $activeLink = $(this).find("a.popover-link.open");

              $activeLink.mwf_popover("close");
            });
          }

          // 5. if the popover link has the .select class, add it to the popover too
          if(self.$el.hasClass("select")) {
            initSelectPopover();
          }

          // *************** Scrolling interaction ************
          // When the user scrolls within the popover, we should see an arrow indicating
          // there is more content above/below the current view.
          var checkScrollPos = function(el){
            // get the scroll top position and the content height
            var $container = $(el);
            var containerHeight = $container.height();
            var scrollTop = $container.scrollTop();
            var contentHeight = $container.find(".popover-content").height();
            var maxScrollTop;

            // now let's do the comparisons.
            if(contentHeight > containerHeight){
              // there is scrolling going on
              maxScrollTop = contentHeight - containerHeight;
              if(scrollTop === 0){
                $container.removeClass("more-above");
              } else {
                $container.addClass("more-above");
              }

              if(scrollTop > 1) {
                $container.addClass("more-above");
              }

              if(scrollTop < maxScrollTop) {
                $container.addClass("more-below");
              } else {
                $container.removeClass("more-below");
              }
            } // end if(contentHeight > containerHeight)
          };


          // initialize the scroll event handler on the content area
          var $popoverContainer = $contentDiv.closest(".popover-container");
          checkScrollPos($popoverContainer);
          $popoverContainer.on("scroll.popover", function(event) {
            checkScrollPos(this);
          });

          // post init stuff

        },
        open: function () {
          var contentId = this.$el.data("contentId");
          var $contentContainer = $('.popover-content[data-content-id="' + contentId + '"]').closest(".popover");
          var popoverLocation = {top:0, left:0};
          var windowScrollTop = $(window).scrollTop(); // position of the scroll

          // - look at the position of the link text (the span) in relation to the screen
          var linkPos = this.getViewportOffset(this.$el.find("span"));

          // - if the link is towards the bottom, add the arrow-top class, otherwise use arror-bottom
          if (linkPos.top > (linkPos.viewportHeight - 380)){
            // Yes, the link is near the bottom, so we'll put the popover on top
            popoverLocation.top = linkPos.top - linkPos.height  - $contentContainer.height() - 20 + windowScrollTop;
            popoverLocation.top = (popoverLocation.top < 0) ? 0 : popoverLocation.top; // if the top of the popover is offscreen, nudge it down.
            $contentContainer.addClass("above-link");
          } else {
            // Otherwise, the link is on top.
            popoverLocation.top = linkPos.top + linkPos.height + 10 + windowScrollTop;
            $contentContainer.addClass("below-link");
          }
          popoverLocation.left = linkPos.left + (linkPos.width / 2) - 175;
          popoverLocation.left = (popoverLocation.left < 0) ? 0 : popoverLocation.left; // if the left corner of the popover is off the screen, move it to 0

          $contentContainer.css({
            "top": popoverLocation.top + "px",
            "left": popoverLocation.left + "px"
          });
          // - set the .open class on the link

          this.$el.addClass("open");

          // locate the associated popover container and display it.
          $contentContainer.show().addClass("open");

          // Set the flag in the body object that a popover is active
          $("body").data("popoverActive", true);

          // trigger the popoveropened event so listeners can do something
          this.$el.trigger("popoveropened");
          return this; //allow for chaining in jQuery
        },

        close: function (value) {
          var contentId = this.$el.data("contentId");
          var $contentContainer = $('.popover-content[data-content-id="' + contentId + '"]').closest(".popover");

          // remove the arrow-top or arrow-bottom class from the element

          // hide the element
          $contentContainer.hide().removeClass("above-link below-link open");

          // remove the class from the link
          this.$el.removeClass("open");

          // trigger the popoverclosed event for anyone listening
          this.$el.trigger("popoverclosed", value);
          return this; //allow for chaining in jQuery
        },

        getViewportOffset: function(el) {
          var elOffset = $(el).offset();
          var elWidth = $(el).width();
          var elHeight = $(el).height();
          var vWidth = $(window).innerWidth();
          var vHeight = $(window).innerHeight();

          return {
            left: elOffset.left - $(window).scrollLeft(),
            top: elOffset.top - $(window).scrollTop(),
            width: elWidth,
            height: elHeight,
            viewportWidth: vWidth,
            viewportHeight: vHeight
          };
        }
    };

    var PopoverError = function(message) {
      this.name = "PopoverError";
      this.message = message || "Popover Exception thrown";
    };

    PopoverError.prototype = new Error();
    PopoverError.prototype.constructor = PopoverError;
    PopoverError.prototype.toString = function() {
      return this.name + " occurred: " + this.message;
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            } else {

              // we're already instantiated, handle the command being passed in
              switch(options){
                case "open":
                  $.data(this, "plugin_" + pluginName).open();
                  break;
                case "close":
                  $.data(this, "plugin_" + pluginName).close();
                  break;
              }
            }
        });
    };

})( jQuery, window, document );
