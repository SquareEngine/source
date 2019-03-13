function updateHeader(isIndex=false) {

    if(isIndex){
        $("img#logoLink").attr('src', "images/logo.png")

        let pages = ["index.html", "../games.html", "../API.html", "../tutorial.html", "../about.html", "../contact.html"];

        $('nav#pages a').each( function(index)
        {
            $(this).attr('href', pages[index]);
        });
        console.log("index header update");

    }
    else{
        $("img#logoLink").attr('src', "../images/logo.png")

        let pages = ["../index.html", "games.html", "API.html", "tutorial.html", "about.html", "contact.html"];

        $('nav#pages a').each( function(index)
        {
            $(this).attr('href', pages[index]);
        });
    }
    
    console.log("header link set");
}

function updateFooter(isIndex=false){

    imagePaths = ["images/face.png", "images/insta.png", "images/twitter.png"]

    if(isIndex){
        $('section.clearFlt img').each( function(index)
        {
            $(this).attr('src', imagePaths[index]);
        });
    }
    else{
        $('section.clearFlt img').each( function(index)
        {
            $(this).attr('src', "../" + imagePaths[index]);
        });
    }
    

    console.log("footer link set");
};