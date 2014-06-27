$(document).ready(function(){
  $.adaptiveBackground.run({
    normalizeTextColor: true
  });

  $('.sideimage').on('ab-color-found', function(ev,payload){
    $('body').css( 'background-color', payload.color );

    console.log(payload.color);   // The dominant color in the image.
    console.log(payload.palette); // The color palette found in the image.
    console.log(ev);   // The jQuery.Event object
  });

});