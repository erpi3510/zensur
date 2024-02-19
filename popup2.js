
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action == "checkURL") {
      chrome.storage.local.get("blockedURLs", function(data) {
        var blockedURLs = data.blockedURLs || [];
        if (blockedURLs.includes(message.url)) {
          chrome.tabs.sendMessage(sender.tab.id, { action: "showWarning" });
        }
      });
    }
  });
  
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs,message, sender,) {
    var activeTab = tabs[0];
    var activeTabUrl = activeTab.url;
    //console.log("Aktuelle URL des Tabs:", activeTabUrl);
   
    
  });
  
  
  // Laden der blockierten URLs aus der JSON-Datei beim Start der Erweiterung
  fetch(chrome.runtime.getURL('blocked_urls.json'))
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set({ "blockedURLs": data.urls });
    })
    .catch(error => console.error('Error loading blocked URLs:', error));
  