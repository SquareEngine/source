$(document).ready(function() {

    $("img#logoLink").attr('src', "../images/logo.png")

    let pages = ["../index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];

    $('nav#pages a').each( function(index)
    {
        $(this).attr('href', pages[index]);
    });

    $('section.clearFlt img').each( function(index)
    {
        let imagePath = $(this).attr('src');
        imagePath = "../" + imagePath;
        $(this).attr('src', imagePath);
    });

    console.log("Page Build Done");
});