const tabs = await chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function 
(tabs) {
    var url = tabs[0].url;
    document.getElementById("host").innerHTML = url;
});