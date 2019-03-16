/*
This two functions are called after we load our header and footer html files with ajax.
All they do is place the img element with the correct image path
*/
function updateHeader(isIndex=false) {

    let linkNames = ["Home", "Games", "API", "Tutorial", "About", "Contact"]

    let logoPath = "../images/logo.png";
    let logoLink = "../index.html";
    let pages = ["../index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];

    if(isIndex){
        logoPath = "images/logo.png";
        logoLink = "index.html";
        pages = ["index.html", "pages/games.html", "pages/API.html", "pages/tutorial.html", "pages/about.html", "pages/contact.html"];
    }

    $("div.logoDiv").append('<a href="' + logoLink + '" id="logoLink"></a>');
    $("a#logoLink").append('<img src="' + logoPath +  '"  alt="Logo" width="40">');
    $('ul#pages li').each( function(index)
    {      
        $(this).append('<a href="' + pages[index] + '" class="current"> '+ linkNames[index] + ' </a>')
    });
    
}

function updateFooter(isIndex=false){

    let linkNames = ["Github", "JQuery", "JQueryUI", "LW Tech"]
    let imagePaths = ["../images/gitHub.png", "../images/jquery.jpg", "../images/jUI.png", "../images/lakeWash.gif"]
    if(isIndex){
        imagePaths = ["images/gitHub.png", "images/jquery.jpg", "images/jUI.png", "images/lakeWash.gif" ]
    }

    $('section.clearFlt a').each( function(index)
    {
        $(this).append('<img src="' + imagePaths[index] + '" alt="' + linkNames[index] + '" width="30"></a>')
    });
    

};