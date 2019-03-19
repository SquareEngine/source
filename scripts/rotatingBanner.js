/*
Dimitri Frazao 
Beni Ungur
Tamires Boniolo

Group project - CSD 122 Javascript & JQuery
Winter 2019

s-Dimitri.Frazao@lwtech.edu
s-Beni.Ungur@lwtech.edu
s-Tamires.Boniolo@lwtech.edu
*/

/*
This script is used by the games.html page to create a rotating banner with our games.

It uses the JQuery cycle plugin from:
http://jquery.malsup.com/cycle/

This plugin and right belong to Maelsup
*/

$( document ).ready(function() {

    // creates our cycle object
    $('.banner').cycle({ 
        fx:      'scrollLeft', 
        pause: true,
        timeout: 2000, 
        speed: 1500,
    });

    // mouse over event to pause the cycle
    $('.banner').mouseover(function(){
        $('.banner').cycle('pause');
    });


    // arrow click event to move banner back and forward
    $("#arrowRight").click(function(){
        $('.banner').cycle('next');
    });

    $("#arrowLeft").click(function(){
        $('.banner').cycle('prev').attr({"backwards": true});
    });

    // click events to go to given game page
    $( "#game1" ).click( function(){
        window.location.href = "snake.html";
    });
    
    $( "#game2" ).click( function(){
        window.location.href = "breakOut.html";
    });
    
    $( "#game3" ).click( function(){
        window.location.href = "flappyBird.html";
    });

});