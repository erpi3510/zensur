var location = 'https://pluginsafety.site/';

//chrome.storage.local.clear();
function checkTabURL(tabId, url) {
    console.log("Tab ID:", tabId, "URL:", url);

    if (url) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            var activeTabUrl = activeTab.url;
            tabId = activeTab.id;
            //console.log(JSON.stringify(activeTab.id));
            async function fetchBlockedUrls() {
                try {
                    const response = await fetch(location + '/data/domain/' + extractNameAndDomain(activeTabUrl));

                    // Überprüfe, ob die Antwort erfolgreich war (Status 200)
                    if (response.ok) {
                        const data = await response.json();
                        handleBlockedUrls(data, extractNameAndDomain(activeTabUrl), tabId, activeTabUrl);
                        //console.log('founded', response.statusText);
                    } else {
                        handleBlockedUrlsNull(tabId);
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
                    const response = await fetch(location + '/data/urlBlocked/' + extractNameAndDomain(activeTabUrl));

                    // Überprüfe, ob die Antwort erfolgreich war (Status 200)
                    if (response.ok) {
                        const data = await response.json();

                        chrome.storage.local.get([extractNameAndDomain(activeTabUrl)], function (result) {
                            if (result[extractNameAndDomain(activeTabUrl)]) {
                                console.log('URL:', extractNameAndDomain(activeTabUrl), 'Date:', result[extractNameAndDomain(activeTabUrl)]);
                                storageManage(urls);
                            } else {
                                
                                showNotificationBlocked(data, tabId, activeTabUrl);
                                
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


// chrome.tabs.onCreated.addListener(async function (tab) {
//     checkTabURL(tab.id, tab.url);
// });

// Benachrichtigung bei Tab-Aktualisierung
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab) {
        checkTabURL(tab.id, tab.url);
    }
});

// chrome.tabs.onActivated.addListener(function (tabId, changeInfo, tab) {

//     if (tab) {
//         checkTabURL(tab.id, tab.url);
//     }
// });


// Funktion zum Setzen der Blockierungsregeln
async function setBlockRules(blockUrls) {
    blockUrls.forEach(async (urlObject, index) => {
        let id = index + 1;
        let domain = urlObject.url;

        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                "id": id,
                "priority": 1,
                "action": {
                    "type": "block"
                },
                "condition": {
                    "urlFilter": domain,
                    "resourceTypes": ["main_frame"]
                }
            }],
            removeRuleIds: [id]
        });
    });
    var httpCount = blockUrls.length + 1;
    const ooniBlock = await getUrltoBlocked();

    ooniBlock.forEach(async (urlObject, index) => {

        let id = httpCount + 1;
        let domain = urlObject.domain;
        console.log(id + ' id tab');

        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                "id": id,
                "priority": 1,
                "action": {
                    "type": "block"
                },
                "condition": {
                    "urlFilter": domain,
                    "resourceTypes": ["main_frame"]
                }
            }],
            removeRuleIds: [id]
        });
    });


    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [{
            "id": httpCount,
            "priority": 1,
            "action": {
                "type": "block"
            },
            "condition": {
                "urlFilter": "|http://*",
                "resourceTypes": ["main_frame"]
            }
        }],
        removeRuleIds: [httpCount]
    });

}

async function getUrltoBlocked() {
    var blockedData;
    try {
        const response = await fetch(location + '/urls');

        // Überprüfe, ob die Antwort erfolgreich war (Status 200)
        if (response.ok) {
            const data = await response.json();

            // Filtere die Daten und füge sie dem blockedData-Array hinzu
            blockedData = data.filter(item => item.confirmed_count > 0);

            return blockedData;
        } else {
            console.log('Error fetching blocked URLs:', response.statusText);
            // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
        }
    } catch (error) {
        console.log('Error fetching blocked URLs:', error);
        // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
    }
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
chrome.storage.onChanged.addListener(async function (changes, namespace) {
    if (changes.modus) {
        let modusValue = changes.modus.newValue || false;
        if (modusValue) {
            const response = await fetch(location + '/urls/blocked');
            const blockUrls = await response.json();
            await setBlockRules(blockUrls);
        } else {
            await removeBlockRules();
        }

        console.log("änderung");
    }
});

// Setze initial die Blockierungsregeln basierend auf dem aktuellen Modus
chrome.storage.local.get("modus", async function (data) {
    let modusValue = data.modus || false;
    if (modusValue) {
        const response = await fetch(location + '/urls/blocked');
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


function handleBlockedUrls(data, urls, tabId, originUrls) {
    var state;
    if (data && data.confirmed_count > 0) {
        // Eine Übereinstimmung wurde gefunden
        //console.log(data.id+' '+data.confirmed_count);
        chrome.storage.local.get([urls], function (result) {
            if (result[urls]) {
                console.log('URL:', urls, 'Date:', result[urls]);
                storageManage(urls);
            } else {
                showNotification(urls);
                console.log('URL not found');

            }
        });

        state = 'nicht sichere seite';
        changeIcon('images/icon_48.png', state, tabId);
        setBadge(data.anomaly_count, tabId);

        blockURL(tabId, originUrls);
        checkIfURLBlocked(urls);

        async function checkIfURLBlocked(urlToCheck) {
            // Überprüfen, ob die URL blockiert ist
            var isBlocked = await isURLBlocked(urlToCheck);
            if (isBlocked) {
                console.log("Die URL ist blockiert schon geprüft.");
                // Funktion zum Leeren des Chrome-Storage für blockierte URLs  

            } else {
                // Beim Laden der Seite Modus aus dem Storage abrufen
                chrome.storage.local.get("modus", function (data) {
                    var modusValue = data.modus || false; // Standardwert auf false setzen, wenn kein Wert gefunden wird
                    if (modusValue) {
                        // Code, der ausgeführt werden soll, wenn der Schalter eingeschaltet wird
                        
                        console.log('Schalter eingeschaltet');
                    } else {
                        // Code, der ausgeführt werden soll, wenn der Schalter ausgeschaltet wird
                        chrome.tabs.update(tabId, {
                            url: "checkpage.html"
                        });
                       
                        console.log('Schalter ausgeschaltet');
                    }
                });
                console.log("Die URL ist nicht blockierte liste besetzt.");
            }
        }
    } else if (data && data.confirmed_count == 0 && data.anomaly_count == 0) {
        state = 'seite ist safe';
        changeIcon('images/icon-48.png', state, tabId);
        setBadge(data.anomaly_count, tabId);
    } else if (data && data.confirmed_count >= 0 && data.anomaly_count >= 0) {
        state = 'passen sie hier auf';
        changeIcon('images/warning-sign_128.png', state, tabId);
        setBadge(data.anomaly_count, tabId);
    } else {
        // Keine Übereinstimmung gefunden
        state = 'Unbekannt';
        changeIcon('images/denken-128.png', state, tabId);
        setBadge(data.anomaly_count, tabId);
    }
}

function handleBlockedUrlsNull(tabId) {
    var state;
    state = 'Unbekannt';
    changeIcon('images/denken-128.png', state, tabId);
}

function showNotificationBlocked(data, tabId, activeTabUrl) {
    const iconUrl = 'images/icon_16.png';
    countNotif();
    blockURL(tabId, activeTabUrl);
    //setBadge(data.anomaly_count, tabId);
    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Achtung, diese Seite ist möglicherweise unter Zensur bedroht ' + data.url,
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
    var state = 'nicht sichere seite';
    changeIcon('images/icon_48.png', state, tabId);

    checkIfURLBlocked(data.url);

    async function checkIfURLBlocked(urlToCheck) {
        // Überprüfen, ob die URL blockiert ist
        var isBlocked = await isURLBlocked(urlToCheck);
        if (isBlocked) {
            console.log("Die URL ist blockiert schon geprüft.");  
        } else {            
                // Beim Laden der Seite Modus aus dem Storage abrufen
                chrome.storage.local.get("modus", function (data) {
                    var modusValue = data.modus || false; // Standardwert auf false setzen, wenn kein Wert gefunden wird
                    if (modusValue) {
                        // Code, der ausgeführt werden soll, wenn der Schalter eingeschaltet wird
                        
                        console.log('Schalter eingeschaltet');
                    } else {
                        // Code, der ausgeführt werden soll, wenn der Schalter ausgeschaltet wird
                        chrome.tabs.update(tabId, {
                            url: "checkpage.html"
                        });
                       
                        console.log('Schalter ausgeschaltet');
                    }
                });
           
            console.log("Die URL ist nicht blockierte liste besetzt.");
        }
    }

}

function isURLBlocked(urlToCheck) {
    return new Promise((resolve, reject) => {
        // URLs aus dem Chrome-Storage abrufen
        chrome.storage.local.get(null, function (result) {
            var blockedURLs = Object.values(result);
            // Überprüfen, ob die gegebene URL in den blockierten URLs enthalten ist
            var isBlocked = blockedURLs.includes(urlToCheck);
            resolve(isBlocked);
        });
    });
}




// Funktion zum Blockieren einer URL und Speichern der ID der Registerkarte
function blockURL(tabId, urlToBlock) {
    // URL im Chrome-Storage speichern
    var data = {};
    data[tabId] = urlToBlock;
    chrome.storage.local.set(data);
}

function showNotification(url) {
    const iconUrl = 'images/icon_16.png';
    countNotif();
    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Achtung, diese Seite ist möglicherweise unter Zensur bedroht oder verhält sich nicht richtig',
        message: 'Es gab eine Warnmeldung',
        silent: false,
    }, function (notificationId) {
        chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
            if (clickedNotificationId === notificationId) {
                chrome.tabs.create({
                    url: 'https://explorer.ooni.org/de/search?' + getDateRange() + '&probe_cc=DE&test_name=web_connectivity&failure=true&domain=' + url + '&only=confirmed'
                });

            }
        });
    });
}

function changeIcon(iconPath, state, tabId) {
    chrome.action.setIcon({
        path: {
            "16": iconPath,
            "32": iconPath.replace('48', '32'),
            "48": iconPath,
            "128": iconPath.replace('48', '128')
        },
        tabId: tabId
    });

    chrome.action.setTitle({
        title: state.toString(),
        tabId: tabId
    });

    chrome.action.setTitle({
        title: state.toString(),
        tabId: tabId
    });

}

function setBadge(count, tabId) {
    if (count > 0) {
        chrome.action.setBadgeText({
            text: count.toString(),
            tabId: tabId,
        });
        //console.log(tabId + ' da');
    }

}

function changes() {
    chrome.action.setIcon({
        path: {
            "16": "images/warm-16.png",
            "32": "images/warn-32.png",
            "48": "images/warn-48.png",
            "128": "images/warn-128.png"
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
async function blockOrAllowRequest(details) {
    // Holen der Antwort von einem Server
    const currentUrl = details.url;
    return fetch(location + '/data/urlBlocked/' + currentUrl)
        .then(response => {
            if (!response.ok) {
                console.error('Fehler beim Abrufen der Antwort:', response.statusText);
                return {
                    cancel: false
                }; // Standardmäßig Anfrage zulassen, falls ein Fehler auftritt
            }
            return {
                cancel: true
            }; // Blockiert die Anfrage, wenn die Antwort "OK" ist
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Antwort:', error);
            return {
                cancel: false
            }; // Standardmäßig Anfrage zulassen, falls ein Fehler auftritt
        });
}

function countNotif() {
    // Zuerst die aktuelle Anzahl der Benachrichtigungen abrufen
    chrome.storage.local.get(['notificationCount'], function (result) {
        // Aktuelle Anzahl holen oder 0 setzen, falls noch nicht gesetzt
        let currentCount = result.notificationCount || 0;
        // Zählung um eins erhöhen
        let newCount = currentCount + 1;

        // Die neue Zählung speichern
        chrome.storage.local.set({
            notificationCount: newCount
        }, function () {
            console.log(`Notification count updated to ${newCount}`);
        });
    });
}


//clearStorage();

function getDateRange() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Ein Tag zum aktuellen Datum hinzufügen

    const yearSince = today.getFullYear();
    let monthSince = today.getMonth() + 1;
    let daySince = today.getDate();

    // Führende Nullen hinzufügen, wenn der Monat oder Tag einstellig ist
    monthSince = monthSince < 10 ? '0' + monthSince : monthSince;
    daySince = daySince < 10 ? '0' + daySince : daySince;

    const yearUntil = tomorrow.getFullYear();
    let monthUntil = tomorrow.getMonth() + 1;
    let dayUntil = tomorrow.getDate();

    // Führende Nullen hinzufügen, wenn der Monat oder Tag einstellig ist
    monthUntil = monthUntil < 10 ? '0' + monthUntil : monthUntil;
    dayUntil = dayUntil < 10 ? '0' + dayUntil : dayUntil;

    const since = `${yearSince}-${monthSince}-${daySince}`;
    const until = `${yearUntil}-${monthUntil}-${dayUntil}`;
    var time = today.getHours() + ':' + today.getMinutes();
    console.log(`since=${since}&until=${until}` + ' Time ' + time);
    return `since=${since}&until=${until}`;
}

chrome.windows.onRemoved.addListener(function(windowId) {
    // Onclose browser
    unblockURLs();

});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('Tab mit der ID ' + tabId + ' wurde geschlossen');
    
    chrome.storage.local.remove(tabId.toString(), function() {
        console.log('Daten für Tab ' + tabId + ' wurden gelöscht');
    });
});

function unblockURLs() {
    // Alle Einträge im Chrome-Speicher entfernen, die mit 'blockedURL' beginnen
    chrome.storage.local.get(null, function(items) {
      var keysToRemove = Object.keys(items).filter(function(key) {
        return key.startsWith('blockedURL');
      });
      chrome.storage.local.remove(keysToRemove, function() {
        console.log('URLs wurden aus dem Speicher entfernt');
      });
    });
  }

