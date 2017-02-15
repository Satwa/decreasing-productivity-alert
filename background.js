/*
 *
 * Brain of the extension
 *
 */
var timeouts = {};
var keys = []; //Here we store every keys of timeouts to quickly check if key exists

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

        if(blacklist.indexOf(website) === -1){
            if(callback) callback(false);
        }else{
            if(callback) callback(true);
        }
    });
}

function addBlacklist(website, callback){
    website = extractDomain(website);
    chrome.storage.sync.get("dpalertlist", function(res){
        var blacklist = res.dpalertlist;
        blacklist.push(website);

        chrome.storage.sync.set({dpalertlist: blacklist});
        if(callback) callback(true);
    });
}
function removeBlacklist(website, callback){
    website = extractDomain(website);
    chrome.storage.sync.get("dpalertlist", function(res){
        var blacklist = res.dpalertlist;

        var i = blacklist.indexOf(website);
        blacklist.splice(i, 1);

        chrome.storage.sync.set({dpalertlist: blacklist});
        if(callback) callback(true);
    });
}

function doesKeyExist(tabId, callback){
    //for loop of keys array exploding one to one to check if exploded[0] != tabId and returning true or false
    var exploded;
    for(i = 0; i < keys.length; i++){
        exploded = keys[i].split("-");
        if(parseInt(exploded[0]) === tabId){
            if(callback) callback({exists: true, ind: i, tabId: exploded[0], wUrl: exploded[1]});
        }
    }
    if(callback) callback({exists: false});
}

function ignoreTab(tabId, wUrl, callback){
    keys.push(tabId + "-" + wUrl);
    callback(true);
}

function timeoutTab(delay, callback){
    //delay = delay * 60000 (nb de ms en 1min)
    chrome.tabs.query({active: true, currentWindow: true}, function(tab){
        var tabId = tab[0].id;
        var wUrl  = extractDomain(tab[0].url);
        //TODO: Send a true message
        timeouts[tabId + "-" + wUrl] = setTimeout(function() {alert("Timeout ended!"); clearTimeout(timeouts[tabId + "-" + wUrl]); delete timeouts[tabId + "-" + wUrl];}, delay*60000); //TODO: Remove from keys array
        keys.push(tabId + "-" + wUrl);

        if(callback) callback(true);
    });
}

// When a tab is being closed if tabId saved in timeouts[] => remove it from array
chrome.tabs.onRemoved.addListener(function(tabId){//TODO
    //Si la clé existe, on la supprime
    doesKeyExist(tabId, function(r){
        if(r.exists === true){
            keys.splice(r.ind, 1);
            clearTimeout(timeouts[r.tabId + "-" + r.wUrl]);
            delete timeouts[r.tabId + "-" + r.wUrl];
        }
    });
});

// Here we remove timeout from array if tab url changed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){ 
    //On vérifie que la clé existe
    doesKeyExist(tabId, function(r){
        if(r.exists === true){
            if(r.wUrl != extractDomain(tab.url)){
                checkStatus(r.wUrl, function(res){
                    if(res === true){
                        //Si le site est blacklist on supprime la clé pour oublier l'ignore
                        keys.splice(r.ind, 1);
                        //on envoie un message pour réinjecter
                        chrome.runtime.sendMessage({
                            content: "reinject"
                        });
                        //keys.push(tabId + "-" + extractDomain(tab.url));
                    }else{
                        //Si le site n'est pas blacklist on supprime le timeout et la clé de keys
                        keys.splice(r.ind, 1);
                        clearTimeout(timeouts[r.tabId + "-" + r.wUrl]);
                        delete timeouts[r.tabId + "-" + r.wUrl];
                    }
                })
                //Si l'url est différente on effectue les modifications dans keys pour déjouer l'injection
                //on vérifie que la nouvelle url est aussi blacklist et dans ce cas ^^^^^^ sinon on supprime le timeout 
            }
        }
    });
});

// Prerendering issue is handled here
chrome.tabs.onReplaced.addListener(function(newId, oldId){
    doesKeyExist(oldId, function(r){
        keys.splice(r.ind, 1);
        keys.push(newId + "-" + r.wUrl);
        chrome.runtime.sendMessage({
            content: "reinject"
        });
    });
});

// Communication with dpascript.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message.content === "getStatus"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tab){
            tab = tab[0];
            checkStatus(extractDomain(tab.url), function(r){
                sendResponse({result: r});
            });
        });
        return true;
    }else if(message.content === "addTimer"){
        timeoutTab(message.amount, function(){
            sendResponse({result: true});
        });
    }else if(message.content === "addIgnore"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tab){
            tab = tab[0];
            ignoreTab(tab.id, extractDomain(tab.url), function(){
                sendResponse({result: true});
            });
        });
        return true;
    }else if(message.content === "doesKeyExist"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tab){
            tab = tab[0];
            doesKeyExist(tab.id, function(r){
                sendResponse({result: r.exists});
            })
        });
        return true;
    }
});