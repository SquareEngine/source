function updateHeader() {


    $("img#logoLink").attr('src', "../images/logo.png")

    let pages = ["../index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];

    $('ul#pages a').each( function(index)
    {
        $(this).attr('href', pages[index]);
    });
    
    console.log("header link set");
}

function updateFooter(){

    imagePaths = ["../images/face.png", "../images/insta.png", "../images/twitter.png"]


    $('section.clearFlt img').each( function(index)
    {
        $(this).attr('src', imagePaths[index]);
    });
    

    console.log("footer link set");
};