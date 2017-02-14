/*
 *
 * Communication logic goes here
 *
 */


//This function comes from StackOverflow (8498592)
function extractDomain(url) { 
    //Removing protocol
    if (url.indexOf("://") > -1)
        var domain = url.split('/')[2];
    else
        domain = url.split('/')[0];
    //Remove port
    domain = domain.split(':')[0];

    return domain;
}


/*
 * Management section
  * Under are functions used by the communication system
  * And you will soon find timer handling
 *
 */
function checkStatus(website, callback){
    var r = null;
    website = extractDomain(website);
	chrome.storage.sync.get("dpalertlist", function(res){
		var blacklist = res.dpalertlist;

        if(blacklist.indexOf(website) === -1)
            callback(false);
        else
            callback(true);
    });
}

function addBlacklist(website, callback){
    website = extractDomain(website);
    chrome.storage.sync.get("dpalertlist", function(res){
        var blacklist = res.dpalertlist;
        blacklist.push(website);

        chrome.storage.sync.set({dpalertlist: blacklist});
        callback(true);
    });
}
function removeBlacklist(website, callback){
    website = extractDomain(website);
    chrome.storage.sync.get("dpalertlist", function(res){
        var blacklist = res.dpalertlist;

        var i = blacklist.indexOf(website);
        blacklist.splice(i, 1);

        chrome.storage.sync.set({dpalertlist: blacklist});
        callback(true);
    });
}