/*
 *
 * Communication logic goes here
 *
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.content == "test")
    	alert("Code up and running");
    else if(message.content == "blacklist_status")
    	sendResponse({content: checkStatus(message.website)})
    else if(message.content == "blacklist")
    	addBlacklist(message.website);
    else if(message.content == "whitelist")
    	removeBlacklist(message.website);
});


/*
 * Maangement section
  * Under are functions used by the communication system
  * And you will soon find timer handling
 *
 */

function checkStatus(website){
	chrome.storage.sync.get("dpalertlist", function(res){
		var blacklist = res.dpalertlist;

        if(blacklist.indexOf(website) === -1)
            return false;
        else
            return true;
    });
}

function addBlacklist(website){
    chrome.storage.sync.get("dpalertlist", function(res){
        var blacklist = res.dpalertlist;
        blacklist.push(website);

        chrome.storage.sync.set({dpalertlist: blacklist});
    });
}
function removeBlacklist(website){
    chrome.storage.sync.get("dpalertlist", function(res){
        var blacklist = res.dpalertlist;

        var i = blacklist.indexOf(website);
        blacklist = blacklist.splice(i, 1);

        chrome.storage.sync.set({dpalertlist: blacklist});
    });
}
