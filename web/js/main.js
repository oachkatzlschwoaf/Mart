// GLOBAL VARS 
// ======================================================

// Event container
var events = {
    emitter: $(document)
};

// Util container
var util = {
    api_url: { },
};

// INITIALIZATION 
// ======================================================

// Init function
function main_init() {
    // Preinit
    $.ajaxSetup({ cache: false });

    // Load 
    loadViews();
    loadControllers();
    loadModels();

    // Init 
    initViews();
    initControllers();
    initModels();

    // Run! 
    cntrl_index.checkHash();
    cntrl_index.show(); // show index page
}

// Loading (on document ready) 
$(document).ready(function() {

    mailru.loader.require('api', function() {
        mailru.app.init(util.private);
        main_init();
    });
});

// UTIL FUNCTIONS
// ======================================================

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function htmlEncode(value){
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

function declOfNum(number, titles)  {  
    cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}  

function preloadImages(aoi) {
    $(aoi).each(function(){
        $('<img/>')[0].src = this;
    });
}

