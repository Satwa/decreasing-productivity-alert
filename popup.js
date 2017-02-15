var state  = document.getElementById("status");
var button = document.getElementById("addrm");
var bgPage = chrome.extension.getBackgroundPage();

chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
	var wUrl = tabs[0].url;
	wUrl     = bgPage.extractDomain(wUrl);

	bgPage.checkStatus(wUrl, function(res){
		state.innerHTML  = res ? "Blacklisted" : "Whitelisted";
		button.innerHTML = res ? "Whitelist this website" : "Blacklist this website";
	});

	document.getElementById("addrm").addEventListener("click", function(){
		if(state.textContent === "Blacklisted"){
			bgPage.removeBlacklist(wUrl, function(){
				chrome.notifications.create(
					'dpalert-notification',{   
						type: 'basic', 
						iconUrl: 'img/icon.png', 
						title: "Status changed", 
						message: "You need to refresh tab to apply changes" 
				});
				window.close();
			});
		}else if(state.textContent === "Whitelisted"){
			bgPage.addBlacklist(wUrl, function(){
				chrome.notifications.create(
					'dpalert-notification',{   
						type: 'basic', 
						iconUrl: 'img/icon.png', 
						title: "Status changed", 
						message: "You need to refresh tab to apply changes" 
				});
				window.close();
			});
		}
	});

});