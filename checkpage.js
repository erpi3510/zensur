var closeButton = document.getElementById('closeButton');

// Füge einen Event Listener hinzu, um auf Klicks auf den Button zu reagieren
closeButton.addEventListener('click', function () {
  closePage();
});

function closePage() {
  //window.close(); // Schließt das Fenster
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ID der aktiven Registerkarte abrufen
    var tabId = tabs[0].id;

    // Schließe die aktive Registerkarte
    chrome.tabs.remove(tabId);
  });
}

var next = document.getElementById('next');

// Füge einen Event Listener hinzu, um auf Klicks auf den Button zu reagieren
//window.close(); // Schließt das Fenster
chrome.tabs.query({
  active: true,
  currentWindow: true
}, async function (tabs) {
  // ID der aktiven Registerkarte abrufen
  var tabId = tabs[0].id;
  var urls = await getBlockedURL(tabId);
  var uri = extractNameAndDomain(urls);
  
  document.getElementById("topurls").innerHTML = uri;
  document.getElementById("titletext").innerHTML = 'check '+uri;

  next.addEventListener('click', function () {
    blockURLs([uri]);
    chrome.tabs.update(tabId, {
      url: urls
    });
  });

});

function getBlockedURL(tabId) {
  return new Promise((resolve, reject) => {
    // URL aus dem Chrome-Storage abrufen
    chrome.storage.local.get([tabId.toString()], function (result) {
      var blockedURL = result[tabId];
      
      resolve(blockedURL);
    });
  });
}

function blockURLs(urlsToBlock) {
  // Überprüfen, ob urlsToBlock ein Array ist
  if (!Array.isArray(urlsToBlock)) {
    console.error("Error: urlsToBlock ist kein Array.");
    return;
  }

  // URLs im Chrome-Storage speichern
  var data = {};
  urlsToBlock.forEach((url, index) => {
    data['blockedURL' + index] = url;
  });
  chrome.storage.local.set(data);
}

function extractNameAndDomain(url) {
  // URL analysieren, um die hostname Eigenschaft zu erhalten
  const urlObject = new URL(url);
  let hostname = urlObject.hostname;

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