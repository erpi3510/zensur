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

    var reported = document.getElementById('reported');

    reported.addEventListener('click', function () {
        report(extractNameAndDomain(url));
        closePage();
        reportMessage(extractNameAndDomain(url));
    });

    fetchBlockedUrls(url);
    async function fetchBlockedUrls(url) {
        try {
            const response = await fetch('http://localhost:3003/data/url/' + extractNameAndDomain(url));

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
        }
    );

}

function reportMessage(url){
    const iconUrl = 'images/icon_16.png';
    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Seite '+url,
        message: url+' Seite gemeldet',
        silent: false,
    }, function (notificationId) {
        chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
            if (clickedNotificationId === notificationId) {
                chrome.tabs.create({ url: 'https://tapas.io/'});
                
            }
        });
    });
}