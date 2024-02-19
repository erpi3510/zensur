chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action == "checkURL") {
    chrome.storage.local.get("blockedURLs", function (data) {
      var blockedURLs = data.blockedURLs || [];
      if (blockedURLs.includes(message.url)) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "showWarning"
        });
      }
    });
  }
});


// Funktion, um die URL des Tabs zu überprüfen
function checkTabURL(tabId, url) {
  console.log("Tab ID:", tabId, "URL:", url);
  // Hier den Code einfügen, um die URL zu überprüfen und entsprechend zu handeln
}

// Benachrichtigung bei Tab-Erstellung
chrome.tabs.onCreated.addListener(function (tab) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs, message, sender, ) {
    var activeTab = tabs[0];
    var activeTabUrl = activeTab.url;


    console.log("Aktuelle URL des Tabs:", activeTabUrl);

  });
  checkTabURL(tab.id, tab.url);
});

// Benachrichtigung bei Tab-Aktualisierung
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    checkTabURL(tabId, changeInfo.url);
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs, message, sender, ) {
      var activeTab = tabs[0];
      var activeTabUrl = activeTab.url;

      fetch(chrome.runtime.getURL('blocked_urls.json'))
        .then(response => response.json())
        .then(data => {
          const blockedUrls = data.urls;
          for(let i = 0; i<= blockedUrls.length;i++){
            if (activeTabUrl.includes(blockedUrls[i])) {

              const iconUrl = 'images/icon_16.png';
              chrome.action.setPopup({popup: 'popup.html'});
              chrome.action.setIcon({path: {16: iconUrl, 48: iconUrl, 128: iconUrl}});

              console.log("Aktuelle URL des Tabs:6", activeTabUrl);
            }
            console.log(blockedUrls[0]);
          }
          
        })
        .catch(error => console.error('Error fetching blocked URLs:', error));


    });
  }
});



// Laden der blockierten URLs aus der JSON-Datei beim Start der Erweiterung
fetch(chrome.runtime.getURL('blocked_urls.json'))
  .then(response => response.json())
  .then(data => {
    chrome.storage.local.set({
      "blockedURLs": data.urls
    });
  })
  .catch(error => console.error('Error loading blocked URLs:', error));