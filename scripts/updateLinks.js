function updateHeader(isIndex=false) {

    let linkNames = ["Home", "Games", "API", "Tutorial", "About", "Contact"]

    let logoPath = "../images/logo.png";
    let pages = ["../index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];

    if(isIndex){
        logoPath = "images/logo.png";
        pages = ["index.html", "pages/games.html", "pages/API.html", "pages/tutorial.html", "pages/about.html", "pages/contact.html"];
    }

    
    $("a#logoLink").append('<img src="' + logoPath +  '"  alt="Logo" width="60">');

    $('ul#pages li').each( function(index)
    {
        
        //let linkElement = $('<a href="' + pages[index] + '" class="current"> '+ linkNames[index] + ' </a>')
        $(this).append('<a href="' + pages[index] + '" class="current"> '+ linkNames[index] + ' </a>')
        //this.attr('href', pages[index]);
    });
    
    console.log("header link set2");
}

function updateFooter(isIndex=false){

    let linkNames = ["Facebook", "Instagram", "Twitter"]
    let imagePaths = ["../images/face.png", "../images/insta.png", "../images/twitter.png"]
    if(isIndex){
        imagePaths = ["images/face.png", "images/insta.png", "images/twitter.png"]
    }

    $('section.clearFlt a').each( function(index)
    {
        //let imageElement = $('<img src="' + imagePaths[index] + '" alt="' + linkNames[index] + '" width="30"></a>')
        $(this).append('<img src="' + imagePaths[index] + '" alt="' + linkNames[index] + '" width="30"></a>')
        //attr('src', imagePaths[index]);
    });
    

    console.log("footer link set2");
};