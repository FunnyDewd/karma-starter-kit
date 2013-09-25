// Your main javascript goes here
$(function(){
  $('.popover-link').mwf_popover();

  $('#survey-link').mwf_popover().on("popoverclosed", function(event, value) {
    if(value) {
      $("#choice").html(" You picked: <b>" + value + "</b>");
    } else {
      $("#choice").html("");
    }
  });
});
