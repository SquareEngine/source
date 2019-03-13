function updateHeader(isIndex=false) {


    let logoPath = "../images/logo.png";
    let pages = ["../index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];

    if(isIndex){
        logoPath = "images/logo.png";
        pages = ["index.html", "../games.html", "../API.html", "../tutorial.html", "../about.html", "../contact.html"];
    }

    $("img#logoLink").attr('src', logoPath);

    $('ul#pages a').each( function(index)
    {
        $(this).attr('href', pages[index]);
    });
    
    console.log("header link set2");
}

function updateFooter(isIndex=false){

    imagePaths = ["../images/face.png", "../images/insta.png", "../images/twitter.png"]
    if(isIndex){
        imagePaths = ["images/face.png", "images/insta.png", "images/twitter.png"]
    }


    $('section.clearFlt a').each( function(index)
    {
        let imageelement = ('<img src="' + imagePaths[index] + '" alt="Facebook" width="30"></a>')
        $(this).append(imageelement)
        //attr('src', imagePaths[index]);
    });
    

    console.log("footer link set2");
};