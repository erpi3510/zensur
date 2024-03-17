const tabs = await chrome.tabs.query({
    'active': true,
    'lastFocusedWindow': true
}, function (tabs) {
    var url = tabs[0].url;
    document.getElementById("host").innerHTML = extractNameAndDomain(url);
    $(document).ready(function () {
        var currentURL = extractNameAndDomain(url);
        $('#host').attr('title', currentURL);

    });
    modusOnLoad();
    var reported = document.getElementById('reported');

    reported.addEventListener('click', function () {
        report(url);
        closePage();
        reportMessage(extractNameAndDomain(url));
    });
    var urls = extractNameAndDomain(url);
    var warningIgnored = document.getElementById('ignored');

    warningIgnored.addEventListener('click', function () {

        chrome.storage.local.get([urls], function (result) {
            if (result[urls]) {
                console.log('URL:', urls, 'Date:', result[urls]);
                //document.getElementById("blocked_urls").innerHTML = 'URL: '+ urls+ ' Date: '+ result[urls];
            } else {
                addToBlockedUrls(urls);
                //document.getElementById("blocked_urls").innerHTML = 'URL added to blocked_urls.json: ' + urls;
                console.log('URL not found');
            }
        });


        closePage();
        ignoreMessage(extractNameAndDomain(url));
    });

    fetchBlockedUrls(url);
    async function fetchBlockedUrls(url) {
        try {
            const response = await fetch('http://localhost:3003/data/domain/' + extractNameAndDomain(url));

            // Überprüfe, ob die Antwort erfolgreich war (Status 200)
            if (response.ok) {
                const data = await response.json();
                handleUrls(data);

            } else {
                handleUrls();
                console.log('Error fetching blocked URLs:3', response.statusText);
                // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
            }
        } catch (error) {
            console.log('Error fetching blocked URLs:4', error);
            // Führe alternative Aktionen aus, z.B. Standardverhalten anwenden
        }
    }

});


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


function handleUrls(data) {
    if (data) {
        document.getElementById("ano_counted").innerHTML = data.anomaly_count;
        document.getElementById("con_count").innerHTML = data.confirmed_count;
        document.getElementById("fai_count").innerHTML = data.failure_count;
        document.getElementById("meas_count").innerHTML = data.measurement_count;
        document.getElementById("start_day_meas").innerHTML = convertDate(data.measurement_start_day);
    } else {
        document.getElementById("ano_counted").innerHTML = 'Null';
        document.getElementById("con_count").innerHTML = 'Null';
        document.getElementById("fai_count").innerHTML = 'Null';
        document.getElementById("meas_count").innerHTML = 'Null';
        document.getElementById("start_day_meas").innerHTML = 'Null';
    }
    var status;
    var statusDiv = document.getElementById("status_url");
    var iconDiv = document.getElementById("icon_infos");

    if (data && data.confirmed_count > 0) {
        status = document.getElementById("status_url").innerHTML = '&nbsp;nicht sicher';
        document.getElementById("handling_text").innerHTML = 'Verlassen Sie Bitte diese Seite. Die  Seite könnte zensierte Inhalte anbieten';
        statusDiv.style.backgroundColor = "#FF7E07";
    } else if (data && data.confirmed_count == 0 && data.anomaly_count == 0) {
        status = document.getElementById("status_url").innerHTML = '&nbsp;sicher';
        statusDiv.style.backgroundColor = "#4CAF50";
        statusDiv.style.borderColor = "white";
        document.getElementById("handling_text").innerHTML = 'Die Seite ist Safe';
    } else if (data && data.confirmed_count >= 0 && data.anomaly_count >= 0) {
        document.getElementById("status_url").innerHTML = '&nbsp;warnung';
        statusDiv.style.backgroundColor = "#FFA500";
        document.getElementById("handling_text").innerHTML = 'Passen Sie hier auf';
    } else {
        document.getElementById("status_url").innerHTML = '&nbsp;unbekannt';
        statusDiv.style.backgroundColor = "#757575";
        document.getElementById("handling_text").innerHTML = 'Es liegen usn derzeit keine dtaen über diese Seite';
        statusDiv.style.borderColor = "white";
        iconDiv.style.color = "#FFA500";
    }

}

const convertTime = (date) => {
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

function convertDate(dateStr) {
    var date = new Date(dateStr);

    function pad(number) {
        return (number < 10) ? '0' + number : number;
    }

    var formattedDate = pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + '.' + date.getFullYear();
    return formattedDate;
}

// Finde den Button mit der ID 'closeButton'
var closeButton = document.getElementById('closeButton');

// Füge einen Event Listener hinzu, um auf Klicks auf den Button zu reagieren
closeButton.addEventListener('click', function () {
    closePage();
});

// Funktion zum Schließen der Seite
function closePage() {
    window.close(); // Schließt das Fenster
}

function report(url) {
    const currentDate = new Date();
    // Daten, die Sie übertragen möchten
    const data = {
        url: url,
        date: convertDate(currentDate),
        time: convertTime(currentDate),
        state: "active"
    };

    // Konfiguration für die Fetch-Anfrage
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.EqoSwohanLHtAvsxa6hlaKO960J6NSPGkIha83doBDM' // Ersetzen Sie YOUR_TOKEN durch Ihren tatsächlichen Authentifizierungstoken
        },
        body: JSON.stringify(data)
    };

    // URL Ihrer POST-API
    const apiUrl = 'http://localhost:3003/report';

    // Fetch-Anfrage senden
    fetch(apiUrl, requestOptions)
        .then(res => {
            if (!res.ok) {
                // Hier könnten Sie genauer auf den Statuscode eingehen
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json(); // Stellen Sie sicher, dass der Server JSON antwortet
        })
        .then(data => {
            console.log('POST request successful:', data);
        })
        .catch(error => {
            // Dies wird sowohl Netzwerkfehler als auch Fehler von .json() abfangen
            // boch zu prüfen console.error('There was a problem with your POST request:', error.message);
        });

}

function reportMessage(url) {
    const iconUrl = 'images/icon_16.png';
    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Seite ' + url,
        message: url + ' Seite gemeldet',
        silent: false,
    }, function (notificationId) {
        chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
            if (clickedNotificationId === notificationId) {
                chrome.tabs.create({
                    url: 'https://tapas.io/'
                });

            }
        });
    });
}

function ignoreMessage(url) {
    const iconUrl = 'images/icon_16.png';
    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Seite ' + url,
        message: url + ' Seite Ignoriert',
        silent: false,
    });
}


function addToBlockedUrls(url) {
    let currentDate = new Date().toISOString(); // ISO String für Einheitlichkeit

    chrome.storage.local.set({
        [url]: currentDate
    }, function () {
        console.log('URL and date are set');
        storageManage(url);
    });
}


// $(document).ready(function() {
//     // Beim Laden der Seite Modus aus dem Storage abrufen
//     chrome.storage.local.get("modus", function(data) {
//       var modusValue = data.modus || false; // Standardwert auf false setzen, wenn kein Wert gefunden wird
//       if (modusValue) {
//         // Code, der ausgeführt werden soll, wenn der Schalter eingeschaltet wird
//         document.getElementById("flexSwitchValue").innerHTML = "Schwer";
//         console.log('Schalter eingeschaltet');
//       } else {
//         // Code, der ausgeführt werden soll, wenn der Schalter ausgeschaltet wird
//         document.getElementById("flexSwitchValue").innerHTML = "Normal";
//         console.log('Schalter ausgeschaltet');
//       }
//       $('#flexSwitchCheckDefault').prop('checked', modusValue);
//     });
  
//     // Event-Handler für den Schalter hinzufügen
//     $('#flexSwitchCheckDefault').change(function() {
//       var checked = $(this).prop('checked');
      
//       // Speichern des Booleschen Werts im Storage
//       chrome.storage.local.set({ "modus": checked });

//       if (checked) {
//         // Code, der ausgeführt werden soll, wenn der Schalter eingeschaltet wird
//         document.getElementById("flexSwitchValue").innerHTML = "Schwer";
//         console.log('Schalter eingeschaltet');
//       } else {
//         // Code, der ausgeführt werden soll, wenn der Schalter ausgeschaltet wird
//         document.getElementById("flexSwitchValue").innerHTML = "Normal"
//         console.log('Schalter ausgeschaltet');
//       }
//     });
//   });
  

      function modusOnLoad(){
        chrome.storage.local.get("modus", function(data) {

            //document.getElementById("flexSwitchValue").innerHTML = data.modus;
            //$('#flexSwitchCheckDefault').prop('checked', checked);
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
            console.log('URL:', url, 'Date:', result[url]);
        }
    });
}