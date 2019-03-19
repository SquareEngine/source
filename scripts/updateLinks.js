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
This two functions are called after we load our header and footer html files with ajax.
All they do is place the img element with the correct image path

when called in the index.html we have the variable isIndex set to true. Otherwise false by default.

*/
function updateHeader(isIndex=false) {

    // link names, link path and image paths
    let linkNames = ["Home", "Games", "API", "Tutorial", "About", "Contact"]
    let logoPath = "../images/logo.png";
    let logoLink = "../index.html";
    let pages = ["../index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];

    // if is the index page then lets change them
    if(isIndex){
        logoPath = "images/logo.png";
        logoLink = "index.html";
        pages = ["index.html", "pages/games.html", "pages/API.html", "pages/tutorial.html", "pages/about.html", "pages/contact.html"];
    }

    // here we create our links and image elements and set the correct paths
    $("div.logoDiv").append('<a href="' + logoLink + '" id="logoLink"></a>');
    $("a#logoLink").append('<img src="' + logoPath +  '"  alt="Logo" width="40">');
    $('ul#pages li').each( function(index)
    {      
        $(this).append('<a href="' + pages[index] + '" class="current"> '+ linkNames[index] + ' </a>')
    });
    
}

function updateFooter(isIndex=false){

    // our names and image paths 
    let linkNames = ["Github", "JQuery", "JQueryUI", "LW Tech"]
    let imagePaths = ["../images/gitHub.png", "../images/jquery.png", "../images/jUI.png", "../images/lakeWash.png"]
    // if is index page then lets change them
    if(isIndex){
        imagePaths = ["images/gitHub.png", "images/jquery.png", "images/jUI.png", "images/lakeWash.png" ]
    }

    // here we create our image elements and give the correct path
    $('section.clearFlt a').each( function(index)
    {
        $(this).append('<img src="' + imagePaths[index] + '" alt="' + linkNames[index] + '" width="30"></a>')
    });
    

};