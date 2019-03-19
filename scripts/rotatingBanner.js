var bannerTimer = 2500;
var bannerStatus = 1;

$( document ).ready(function() {
    //bannerLoop();
    //console.log(bannerStatus);

    $('.banner').cycle({ 
        fx:      'scrollLeft', 
        pause: true,
        timeout: 2000, 
        speed: 1500,
    });

    $('.banner').mouseover(function(){
        $('.banner').cycle('pause');
    });


    $("#arrowRight").click(function(){
        $('.banner').cycle('next');
    });

    $("#arrowLeft").click(function(){
        $('.banner').cycle('prev').attr({"backwards": true});
    });

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



// $( "#imgban1" ).click( function(){
//     window.location.href = "snake.html";
// });

// $( "#imgban2" ).click( function(){
//     window.location.href = "breakOut.html";
// });

// $( "#imgban3" ).click( function(){
//     window.location.href = "flappyBird.html";
// });

// //Start the banner loop
// var startBannerLoop = setInterval(function() {
//     bannerLoop();
// }, bannerTimer);

// //Pause slide when mouse enters image space
// document.getElementById("main-banner").onmouseenter = function() {
//     clearInterval(startBannerLoop);
// }

// //Resume slide after mouse leave
// document.getElementById("main-banner").onmouseleave = function() {
//         startBannerLoop = setInterval(function () {
//             bannerLoop();
//         }, bannerTimer);
// }

// //Next button functionality
// document.getElementById("imgbanbtn-next").onclick = function() {
//     bannerLoop();
// }

// document.getElementById("imgbanbtn-before").onclick = function() {
//     bannerStatus -= 1;
//     if(bannerStatus < 1) bannerStatus = 3;
//     bannerLoop();
// }

// function bannerLoop() {
//         if (bannerStatus === 1) {
//             document.getElementById("imgban2").style.opacity = "0";
//             setTimeout(function () {
//                 document.getElementById("imgban1").style.right = "0px";
//                 document.getElementById("imgban1").style.zIndex = "1000";
//                 document.getElementById("imgban2").style.right = "-1200px";
//                 document.getElementById("imgban2").style.zIndex = "1500";
//                 document.getElementById("imgban3").style.right = "1200px";
//                 document.getElementById("imgban3").style.zIndex = "500";
//             }, 500);
//             setTimeout(function () {
//                 document.getElementById("imgban2").style.opacity = "1";
//                 bannerStatus = 2;
//             }, 1000);
//             //console.log(bannerStatus);
//         }
//         if (bannerStatus === 2) {
//             document.getElementById("imgban3").style.opacity = "0";
//             setTimeout(function () {
//                 document.getElementById("imgban2").style.right = "0px";
//                 document.getElementById("imgban2").style.zIndex = "1000";
//                 document.getElementById("imgban3").style.right = "-1200px";
//                 document.getElementById("imgban3").style.zIndex = "1500";
//                 document.getElementById("imgban1").style.right = "1200px";
//                 document.getElementById("imgban1").style.zIndex = "500";
//             }, 500);
//             setTimeout(function () {
//                 document.getElementById("imgban3").style.opacity = "1";
//                 bannerStatus = 3;
//             }, 1000);

//            // console.log(bannerStatus);
//         }
//         if (bannerStatus === 3) {
//             document.getElementById("imgban1").style.opacity = "0";
//             setTimeout(function () {
//                 document.getElementById("imgban3").style.right = "0px";
//                 document.getElementById("imgban3").style.zIndex = "1000";
//                 document.getElementById("imgban1").style.right = "-1200px";
//                 document.getElementById("imgban1").style.zIndex = "1500";
//                 document.getElementById("imgban2").style.right = "1200px";
//                 document.getElementById("imgban2").style.zIndex = "500";
//             }, 500);
//             setTimeout(function () {
//                 document.getElementById("imgban1").style.opacity = "1";
//                 bannerStatus = 1;
//             }, 1000);

//             //console.log(bannerStatus);
//         }
// }
