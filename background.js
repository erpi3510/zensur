function checkTabURL(tabId, url) {
    console.log("Tab ID:", tabId, "URL:", url);

    if (url) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            var activeTabUrl = activeTab.url;

            async function fetchBlockedUrls() {
                try {
                    const response = await fetch('http://localhost:3003/data/domain/' + extractNameAndDomain(activeTabUrl));

                    // Überprüfe, ob die Antwort erfolgreich war (Status 200)
                    if (response.ok) {
                        const data = await response.json();
                        handleBlockedUrls(data, extractNameAndDomain(activeTabUrl));

                    } else {
                        handleBlockedUrls();
                        console.log('Error fetching blocked URLs:1', response.statusText);
                        // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
                    }
                } catch (error) {
                    console.log('Error fetching blocked URLs:2', error);
                    // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
                }
            }

            async function fetchBlocked() {
                try {
                    const response = await fetch('http://localhost:3003/data/urlBlocked/' + extractNameAndDomain(activeTabUrl));

                    // Überprüfe, ob die Antwort erfolgreich war (Status 200)
                    if (response.ok) {
                        const data = await response.json();
                       
                        chrome.storage.local.get([extractNameAndDomain(activeTabUrl)], function (result) {
                            if (result[extractNameAndDomain(activeTabUrl)]) {
                                console.log('URL:', extractNameAndDomain(activeTabUrl), 'Date:', result[extractNameAndDomain(activeTabUrl)]);
                                storageManage(urls);
                            } else {
                                showNotificationBlocked(data);
                                console.log('URL not found on block list notif');
                
                            }
                        });

                    } else {
                        fetchBlockedUrls();
                        console.log('Error fetching blocked URLs:12', response.statusText);
                        // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
                    }
                } catch (error) {
                    console.log('Error fetching blocked URLs:22', error);
                    // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
                }
            }

            fetchBlocked();
        });
    }
}


chrome.tabs.onCreated.addListener(async function (tab) {
    checkTabURL(tab.id, tab.url);
});

// // Benachrichtigung bei Tab-Aktualisierung
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    checkTabURL(tab.id, tab.url);
});

chrome.tabs.onActivated.addListener(function (tabId, changeInfo, tab) {

    checkTabURL(0, 'tab.url');
});


// Funktion zum Setzen der Blockierungsregeln
async function setBlockRules(blockUrls) {
    blockUrls.forEach(async (urlObject, index) => {
        let id = index + 1;
        let domain = urlObject.url;
      
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                "id": id,
                "priority": 1,
                "action": { "type": "block" },
                "condition": { "urlFilter": domain, "resourceTypes": ["main_frame"] }
            }],
            removeRuleIds: [id]
        });
    });
  }
  
  // Funktion zum Entfernen aller Blockierungsregeln
  async function removeBlockRules() {
    chrome.declarativeNetRequest.getDynamicRules(previousRules => {
        const previousRuleIds = previousRules.map(rule => rule.id);
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: previousRuleIds
        });
      });
    
      console.log("Alle Blockierungsregeln entfernt");
  }
  
  // Höre auf Änderungen in der Chrome-Storage
  chrome.storage.onChanged.addListener(async function(changes, namespace) {
    if (changes.modus) {
      let modusValue = changes.modus.newValue || false;
      if (modusValue) {
        const response = await fetch('http://localhost:3003/urls/blocked');
        const blockUrls = await response.json();
        await setBlockRules(blockUrls);
      } else {
        await removeBlockRules();
      }

      console.log("änderung");
    }
  });
  
  // Setze initial die Blockierungsregeln basierend auf dem aktuellen Modus
  chrome.storage.local.get("modus", async function(data) {
    let modusValue = data.modus || false;
    if (modusValue) {
      const response = await fetch('http://localhost:3003/urls/blocked');
      const blockUrls = await response.json();
      await setBlockRules(blockUrls);
    }
  });
  
  

function extractNameAndDomain(url) {
    // URL analysieren, um die hostname Eigenschaft zu erhalten
    const urlObject = new URL(url);
    var hostname = urlObject.hostname;

    // Überprüfen, ob der Hostname mit "www." beginnt, und ihn bei Bedarf entfernen
    if (hostname.startsWith("www.")) {
        hostname = hostname.substring(4); // "www." entfernen
    }

    // Aufteilen des Hostnamens in Namen und Domain
    const parts = hostname.split('.');
    const name = parts[0]; // Verwende den ersten Teil als Name
    const domain = parts.slice(1).join('.'); // Verwende den Rest als Domain

    console.log(name + '.' + domain);
    return name + '.' + domain;
}


function handleBlockedUrls(data, urls) {
    if (data && data.confirmed_count > 0) {
        // Eine Übereinstimmung wurde gefunden
        //console.log(data.id+' '+data.confirmed_count);
        chrome.storage.local.get([urls], function (result) {
            if (result[urls]) {
                console.log('URL:', urls, 'Date:', result[urls]);
                storageManage(urls);
            } else {
                showNotification();
                console.log('URL not found');

            }
        });


        changeIcon('images/icon_48.png');
    } else {
        // Keine Übereinstimmung gefunden
        changeIcon('images/icon-48.png');
    }
}

function showNotificationBlocked(data) {
    const iconUrl = 'images/icon_16.png';

    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Achtung, diese Seite ist möglicherweise unter Zensur bedroht' + data.url,
        message: 'Es gab eine Warnmeldung',
        silent: false,
    }, function (notificationId) {
        chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
            if (clickedNotificationId === notificationId) {
                chrome.tabs.create({
                    url: data.source
                });

            }
        });
    });
    changeIcon('images/icon_48.png');
}


function showNotification() {
    const iconUrl = 'images/icon_16.png';

    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Achtung, diese Seite ist möglicherweise unter Zensur bedroht',
        message: 'Es gab eine Warnmeldung',
        silent: false,
    }, function (notificationId) {
        chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
            if (clickedNotificationId === notificationId) {
                chrome.tabs.create({
                    url: 'https://chat.openai.com'
                });

            }
        });
    });
}

function changeIcon(iconPath) {
    chrome.action.setIcon({
        path: {
            "16": iconPath,
            "32": iconPath.replace('48', '32'),
            "48": iconPath,
            "128": iconPath.replace('48', '128')
        }
    });
}


function storageManage(url) {
    chrome.storage.local.get([url], function (result) {
        let storageDate = new Date(result[url]);
        let currentDate = new Date();
        let diff = currentDate.getTime() - storageDate.getTime();
        let daysPassed = diff / (1000 * 3600 * 24); // Umrechnung von Millisekunden in Tage

        if (daysPassed > 1) { // Beispiel: Ablauf nach einem Tag
            console.log('URL has expired:', url);
            // Optional: Löschen der abgelaufenen URL
            chrome.storage.local.remove([url], function () {
                console.log('Expired URL removed:', url);
            });
        } else {
            console.log('URL:2 ', url, ' Date: ', result[url]);
        }
    });
}

function clearStorage() {
    chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        } else {
            console.log('Storage is cleared');
        }
    });
}

// Funktion, um die Anfrage zu blockieren oder zuzulassen
function blockOrAllowRequest(details) {
    // Holen der Antwort von einem Server
    const currentUrl = details.url;
    return fetch('http://localhost:3003/data/urlBlocked/' + currentUrl)
        .then(response => {
            if (!response.ok) {
                console.error('Fehler beim Abrufen der Antwort:', response.statusText);
                return { cancel: false }; // Standardmäßig Anfrage zulassen, falls ein Fehler auftritt
            }
            return { cancel: true }; // Blockiert die Anfrage, wenn die Antwort "OK" ist
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Antwort:', error);
            return { cancel: false }; // Standardmäßig Anfrage zulassen, falls ein Fehler auftritt
        });
}

//clearStorage();