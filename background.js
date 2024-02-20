
// Funktion, um die URL des Tabs zu überprüfen
function checkTabURL(tabId, url) {
  console.log("Tab ID:", tabId, "URL:", url);
  // Hier den Code einfügen, um die URL zu überprüfen und entsprechend zu handeln
  if (url) {
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
              //chrome.action.setPopup({popup: 'popup.html'});
              //chrome.action.setIcon({path: {16: iconUrl, 48: iconUrl, 128: iconUrl}});

              console.log("Aktuelle URL des Tabs:6", activeTabUrl);
              

chrome.action.setIcon({
  path: {
    "16": "images/icon_48.png",
    "48": "images/icon_48.png",
    "128": "images/icon_128.png"
  }
});

chrome.notifications.create({
  type: 'basic',
  iconUrl: iconUrl, // Hier den Pfad zu Ihrem Symbol angeben
  title: 'Achtung diese Seite ist möglicherweise unter zensur bedroht',
  message: 'ES gab folgende warn meldung',
},function(notificationId){
    chrome.notifications.onClicked.addListener(function(clickedNotificationId) {
    if (clickedNotificationId === notificationId) {
      // Hier die Aktion ausführen, wenn auf die Benachrichtigung geklickt wird
      chrome.tabs.create({ url: 'https://www.tagesschau.de/'});

    }
  });
});

break;

            }else{
              chrome.action.setIcon({
                path: {
                  "16": "images/icon-16.png",
                  "32": "images/icon-32.png",
                  "48": "images/icon-48.png",
                  "128": "images/icon-128.png"
                }
              });
console.log(blockedUrls[0]);
            }
            
          }
          
        })
        .catch(error => console.error('Error fetching blocked URLs:', error));


    });
  }
}

// Benachrichtigung bei Tab-Erstellung
chrome.tabs.onCreated.addListener(function (tab) {

  checkTabURL(tab.id, tab.url);
});

// Benachrichtigung bei Tab-Aktualisierung
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  checkTabURL(tab.id, tab.url);
});

chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
  // Hier können Sie den Code ausführen, der ausgeführt werden soll,
  // wenn eine Registerkarte aktiviert wird.
  checkTabURL(0, 'tab.url');
});

