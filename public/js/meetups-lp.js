$(document).ready(function(){
  $.adaptiveBackground.run({
    normalizeTextColor: true
  });

  $('.sideimage').on('ab-color-found', function(ev,payload){
    $('body').css( 'background-color', payload.color );
  });

});