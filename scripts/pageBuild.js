$(document).ready(function() {
    /*
    building the header
    */
    let logo = $('<a href="index.html" id="logo"></a>')
        .append('<img src="https://i.imgur.com/3Z7ddcD.png" alt="Logo" width="60">');

    let pathname = window.location.pathname;
    let pageArray = pathname.split("/");
    let page = pageArray[pageArray.length -1];
    let isIndex = (page === "index.html");
    let pages = ["index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];
    let pageText = ["Home", "Games", "API", "Tutorial", "About", "Contact"];

    let ul = $('<ul></ul>');
    $.each(pages, function(index)
    {
        let currentPage = pages[index];
        let preString = "";
        if(isIndex && index>0) preString = "pages/";
        else if(isIndex==false && index==0) preString = "../"

        let li = $('<li/>').appendTo( ul );
        let lia = $('<a/>').attr('href', preString + currentPage).text( pageText[index] ).appendTo(li);
        if(currentPage==page) lia.addClass('current');
    });

    let header = $("<header></header>")
        .append(logo)
        .append( $("<nav></nav>")
        .append(ul) );

    /*
    building main
    */

    let hero = $('<div id="hero"></div>');
        
    
    /*
    building footer
    */

    let sec = $('<section class="clearFlt"></section>');

    let imageLinks = ["https://www.facebook.com", "https://www.instagram.com/?hl=en", "https://twitter.com"]
    let imageImgu = ["https://i.imgur.com/DNxeV5O.png", "https://i.imgur.com/JLekVgr.png", "https://i.imgur.com/ZsurAxE.png"]
    
    $.each(imageLinks, function(index)
    {
        let img = $('<img/>').attr( {'src':imageImgu[index], "width": 30});
        let lia = $('<a/>').attr('href', imageLinks[index]).append(img);
        sec.append(lia);
    });

    sec.append( $('<p class="copy"> &copy 2019 </p>') );
    

    let footer = $("<footer></footer>").append(sec);
    //footer.text("Dimitri Frazao")
    

     /*
    add wrapper and append to body
    */


    $("body")
        .append( $('<main id="wrapper"></div>')
        .append(header)
        .append(hero)
        .append(footer) );

    console.log("Page Build Done");
});