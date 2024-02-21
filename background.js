
function checkTabURL(tabId, url) {
  console.log("Tab ID:", tabId, "URL:", url);

  if (url) {
      chrome.tabs.query({
          active: true,
          currentWindow: true
      }, function (tabs) {
          var activeTab = tabs[0];
          var activeTabUrl = activeTab.url;

          fetch('http://localhost:3003/urls')
              .then(response => response.json())
              .then(data => {
                  // Durch die empfangenen Daten iterieren und nach übereinstimmenden URLs suchen
                  let foundMatch = false; // Variable zum Verfolgen, ob eine Übereinstimmung gefunden wurde
                  for (const item of data) {
                      if (!foundMatch && activeTabUrl.includes(item.url)) { // Überprüfen, ob eine Übereinstimmung gefunden wurde und noch keine Übereinstimmung gefunden wurde
                          const iconUrl = 'images/icon_16.png';

                          chrome.notifications.create({
                              type: 'basic',
                              iconUrl: iconUrl,
                              title: 'Achtung, diese Seite ist möglicherweise unter Zensur bedroht',
                              message: 'Es gab eine Warnmeldung',
                          }, function (notificationId) {
                              chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
                                  if (clickedNotificationId === notificationId) {
                                      chrome.tabs.create({ url: activeTabUrl });
                                  }
                              });
                          });

                          chrome.action.setIcon({
                              path: {
                                  "16": "images/icon_48.png",
                                  "32": "images/icon_32.png",
                                  "48": "images/icon_48.png",
                                  "128": "images/icon_128.png"
                              }
                          });

                          foundMatch = true; // Setzen Sie den Zustand auf "true", um anzuzeigen, dass eine Übereinstimmung gefunden wurde
                          break; // Schleife verlassen, da eine Übereinstimmung gefunden wurde
                      }else {
                        chrome.action.setIcon({
                            path: {
                                "16": "images/icon-16.png",
                                "32": "images/icon-32.png",
                                "48": "images/icon-48.png",
                                "128": "images/icon-128.png"
                            }
                        });
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

