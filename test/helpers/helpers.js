/* global jasmine, describe, it, xit, xdescribe, beforeEach, expect, loadFixtures, loadStyleFixtures, $, Helpers */
window.Helpers = {
  getViewportOffset : function(el){
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
  },
  checkForHandler: function(elem, event) {
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
  }
};
