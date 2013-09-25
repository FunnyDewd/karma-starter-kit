/* jshint undef: true, unused: false */
/* global jasmine, describe, it, xit, xdescribe, beforeEach, expect, loadFixtures, loadStyleFixtures, $, Helpers, spyOnEvent, console, waits, waitsFor */
jasmine.getFixtures().fixturesPath = '/base/test/fixtures';
jasmine.getStyleFixtures().fixturesPath = '/base/source/css';


describe('Popover component: ', function() {
  'use strict';
  describe('While it initializes: ', function(){
    var $pLinks, $firstPLink, $lastPLink, $selectLink;
    beforeEach(function() {
      loadFixtures('popoverFixture.html');
      loadStyleFixtures('popover.css');
      $pLinks = $('#defaultContainer .popover-link');
      $firstPLink = $pLinks.first();
      $lastPLink = $pLinks.last();
      $selectLink = $pLinks.filter('.select');
    });

    it('should exist', function() {
      expect(typeof $.fn.mwf_popover).toBe('function');
    });

//-- Configuration Checking --
// The popover should check it's configuration in order to properly initialize.
// It should throw an error if the data-content-id in the markup is either missing or points to
// something that doesn't exist on the page.
    describe('it should display errors for bad configuration: ', function() {
      it('should throw an exception if the data-content-id on the link is missing', function() {
        // remove the attribute from the fixture
        $firstPLink.removeAttr('data-content-id');
        expect(function() {$firstPLink.mwf_popover();}).toThrow();
      });

      it('should throw an exception if it doesn\'t find the content div', function() {
        $firstPLink.attr('data-content-id', 'some-other-div');
        expect(function() {$firstPLink.mwf_popover();}).toThrow();
      });
    });   // end of check configuration

    describe('it should modify the DOM and add the appropriate event handlers: ', function () {
      beforeEach(function () {
        $firstPLink.mwf_popover();
      });

      it('should wrap the content in a the appropriate popover divs', function() {
        var $pContent = $(".popover-content");
        expect($pContent.parent()).toBe('div.popover-container');
        expect($pContent.parent().parent()).toBe('div.popover');
      });

      it('should have a click event attached to the link', function() {
        expect($firstPLink).toHandle('tap.mwf_popover');
      });

      it('should add a tap event to the body to close any open popover', function() {
        expect($("body")).toHandle('tap.mwf_popover');
      });
    });

    describe('it should properly display and hide: ', function () {
      beforeEach(function () {
        $firstPLink.mwf_popover();
      });

      it('should have popovers initially hidden', function() {
        expect($(".popover")).toBeHidden();
      });

      it('display when clicking on the link', function() {
        $firstPLink.trigger("tap");
        expect($firstPLink).toHaveClass("open");
        expect($(".popover.open")).toBeVisible();
      });

      it('should open using the "open" argument', function(){
        $firstPLink.mwf_popover("open");
        expect($firstPLink).toHaveClass("open");
        expect($(".popover.open")).toBeVisible();
      });

      it('should close using the "close" argument', function(){
        $firstPLink.trigger("tap");       // show the popover first
        $firstPLink.mwf_popover("close");
        expect($firstPLink).not.toHaveClass("open");
        expect($(".popover")).toBeHidden();
      });

      it('should hide when the user taps the link again after displaying', function() {
        $firstPLink.trigger("tap");
        $firstPLink.trigger("tap");
        expect($firstPLink).not.toHaveClass("open");
        expect($(".popover")).toBeHidden();
      });

      it('should hide when the user taps outside the popover', function() {
        $firstPLink.trigger("tap");
        $("body").trigger("tap");
        expect($firstPLink).not.toHaveClass("open");
        expect($(".popover")).toBeHidden();
      });

      it("should set the height of the popover to less than 300px if the content is short", function(){
        $(".popover").html("This is a short popover.");
        $firstPLink.trigger("tap");
        expect($(".popover.open").height()).toBeLessThan(300);
      });

      it("should be 300 pixels tall (including 25px padding) for long content", function(){
        $firstPLink.trigger("tap");
        expect($(".popover.open").height()).toBe(275);
      });

      it("should display directly below the link", function(){
        var linkOffset, popoverOffset, $popover;
        $firstPLink.mwf_popover();
        $firstPLink.trigger("tap");
        $popover = $(".popover.open");
        linkOffset = Helpers.getViewportOffset($firstPLink.get(0));
        popoverOffset = Helpers.getViewportOffset($popover.get(0));

        var offsetTopDiff = popoverOffset.top - (linkOffset.top + linkOffset.height);
        expect(offsetTopDiff).toBeLessThan(30);
        expect($popover.hasClass("below-link")).toBeTruthy();
      });

      it("should display above the link if the link is near the bottom", function() {
        var linkOffset, popoverOffset, $popover;
        $lastPLink.mwf_popover();
        $lastPLink.trigger("tap");
        $popover = $(".popover.open");
        linkOffset = Helpers.getViewportOffset($lastPLink.get(0));
        popoverOffset = Helpers.getViewportOffset($popover.get(0));

        var offsetTopDiff = linkOffset.top - (popoverOffset.top + popoverOffset.height);
        expect(offsetTopDiff).toBeLessThan(30);
      });
    });

    describe("When the user interacts with the popover",function(){
      beforeEach(function () {
        $firstPLink.mwf_popover();
      });

      it("should fire the popoveropened event when opened", function(){
        var popoverOpenSpy = spyOnEvent($firstPLink, "popoveropened");
        $firstPLink.mwf_popover("open");
        expect(popoverOpenSpy).toHaveBeenTriggered();
      });

      it("should fire the popoverclosed event when closed", function(){
        var popoverCloseSpy = spyOnEvent($firstPLink, "popoverclosed");
        $firstPLink.mwf_popover("open");
        $firstPLink.mwf_popover("close");
        expect(popoverCloseSpy).toHaveBeenTriggered();
      });

      it("should show the more-below option if there is content below the current view", function() {
        $firstPLink.trigger("tap");
        expect($('.popover.open .popover-container')).toHaveClass('more-below');
      });

      it("should the more-above arrow if there is only content above the current view", function() {
        $firstPLink.trigger("tap");

        var $openContainer = $('.popover.open .popover-container');
        var contentHeight, containerHeight, maxScroll;
        contentHeight = $openContainer.find(".popover-content").height();
        containerHeight = $openContainer.height();
        maxScroll = contentHeight - containerHeight;
        $openContainer.scrollTop(maxScroll);
        $openContainer.scroll();
        expect($openContainer).toHaveClass('more-above');
        expect($openContainer).not.toHaveClass('more-below');
      });

      it("should show both arrows if there is content above AND below the current view", function() {
        $firstPLink.trigger("tap");

        var $openContainer = $('.popover.open .popover-container');

        $openContainer.scrollTop(20); // scroll down by 20 pixels;
        $openContainer.scroll(); // fire the scroll event
        expect($openContainer).toHaveClass('more-above');
        expect($openContainer).toHaveClass('more-below');
      });
    });

    describe("If the popover is a select type", function() {
      it('should add a class of select to the .popover itself', function() {
        $selectLink.mwf_popover();
        expect($('.popover.select').length).toBe(1);
      });
      
      it("should throw an error if the content doesn't have a list of links", function(){
        $(".popover-content[data-content-id='change-account-select']").html("");
        expect(function() {$selectLink.mwf_popover();}).toThrow();
      });

      it("should hide when the user selects a link in the popover", function() {
        $selectLink.mwf_popover();
        $selectLink.trigger("tap");
        $(".popover.open").find("a").first().trigger("tap");
        expect($selectLink).not.toHaveClass("open");
      });
      
      
      it('should pass a value to anything handling the popoverclosed custom event', function() {
        $selectLink.mwf_popover();
        var popoverValue;
        $selectLink.on("popoverclosed", function(event, selectedValue) {
          popoverValue = selectedValue;
        });
        
        $selectLink.trigger("tap");
        $(".popover.open").find("a").first().trigger("tap");
        
        
        expect(popoverValue).toBe('all');
      });
    });
  });
});
