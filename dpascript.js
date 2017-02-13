/* 
	Configuration and HTML injection goes here
*/

// Before displaying another time the banner, we look if tabId isn't already registered or the website doesn't already have a timer set
// When you select time and click OK, we send data to background to create the timer

function demo(){
	alert("Clicked on button");
}

function inject(){
	var inject = document.createElement("div");
	inject.innerHTML = '<div style="position: absolute; top:0;left:0;right:0;background:#F00; height:50px;"> <button id="testbutton"> TEST </button></div>';
	document.body.insertBefore(inject, document.body.firstChild);
}


/*
 * Listener
 */
//document.getElementById("testbutton").addEventListener("click", function(){ demo(); });
