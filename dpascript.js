/* 
	HTML injection goes here
*/

// Before displaying another time the banner, we look if tabId isn't already registered or the website doesn't already have a timer set

function inject(){
	//TODO: Avant de réinjecter on regarde si le tableau keys ne contient pas déjà une clé pour cet onglet avec cette url (on envoie un message)
	var inject = document.createElement("div");
	inject.innerHTML = "<div style=\"position: fixed; top:0;left:0;right:0;background:#F00; z-index:99999999999;color:white;padding:10px 5px;\" id=\"dpalertbanner\"> For how many time would you stay on this website? <input type=\"number\" id=\"timeAmount\" min=\"1\" max=\"60\" placeholder=\"1-50min\"> <button id=\"validate\" style=\"\"> ADD TIMER </button> <button id=\"ignorebtn\" style=\"float:right\">IGNORE</button></div>";
	document.body.insertBefore(inject, document.body.firstChild);
}


/*
 * Listener
 */

function evHandler(){
	inject(); 
	document.getElementById("validate").addEventListener("click", function(){ 
		var timeAmount = document.getElementById("timeAmount").value;
		if(timeAmount > 0 && timeAmount < 61 && Number.isInteger(parseInt(timeAmount))){
			chrome.runtime.sendMessage({
				content: "addTimer",
				amount: timeAmount
			},function(r){
				document.getElementById("dpalertbanner").style.display = "none"; 
			});
		}else{
			alert("Value is not an integer or is not between 1 and 60 minutes.");
		}
	});
	document.getElementById("ignorebtn").addEventListener("click", function(){ 
		chrome.runtime.sendMessage({
			content: "addIgnore"
		},function(r){
			document.getElementById("dpalertbanner").style.display = "none"; 
		});
	});
}

// Communication with background.js => is website blacklisted?
chrome.runtime.sendMessage({
	content: "getStatus"
}, function(res){
	if(res.result === true){
		//We check if key doesn't already exist
		chrome.runtime.sendMessage({
			content: "doesKeyExist"
		}, function(r){
			if(r.result === false){
				//We inject the banner if key doesn't exist
				evHandler();
			}
		});
	}
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	if(message.content === "reinject")
		evHandler();
});