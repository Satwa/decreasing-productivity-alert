var state  = document.getElementById("status");
var button  = document.getElementById("addrm");

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


chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
	var wUrl = tabs[0].url;
	wUrl = extractDomain(wUrl);

	chrome.runtime.sendMessage({
	    content: "blacklist_status",
	    website: wUrl
	}, function(res){
		state.innerHTML  = res.content ? "Blacklisted" : "Whitelisted";
		button.innerHTML = res.content ? "Whitelist this website" : "Blacklist this website";
	});

	document.getElementById("addrm").addEventListener("click", function(){
		if(state.textContent == "Blacklisted")
			chrome.runtime.sendMessage({content: "whitelist", website: wUrl}, function(res){ /*window.close()*/});
		else if(state.textContent == "Whitelisted")
			chrome.runtime.sendMessage({content: "blacklist", website: wUrl}, function(res){ /*window.close()*/});
		//When whitelist => remove banner + timer
		//When blacklist => display timer
		//Alert the need of refreshing the page to apply?
	});

});

// Open settings tab
document.getElementById("settings").addEventListener("click", function(){
	chrome.tabs.create({"url": chrome.extension.getURL("settings.html"), "selected": true});
});