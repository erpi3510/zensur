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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "urlsData") {
        // Verarbeite die empfangenen Daten
        handleUrls(message.data);
        console.log('data123');
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

    if(data && data.confirmed_count > 0){
        status = document.getElementById("status_url").innerHTML = '&nbsp;nicht sicher';
        document.getElementById("handling_text").innerHTML = 'Verlassen Sie Bitte diese Seite. Die  Seite könnte zensierte Inhalte anbieten';
        statusDiv.style.backgroundColor = "#FF7E07";
    }else if (data && data.confirmed_count == 0 && data.anomaly_count == 0){
        status = document.getElementById("status_url").innerHTML = '&nbsp;sicher';
        statusDiv.style.backgroundColor = "#4CAF50";
        statusDiv.style.borderColor = "white";
        document.getElementById("handling_text").innerHTML = 'Die Seite ist Safe';
    }else if(data && data.confirmed_count >=0 && data.anomaly_count >=0){
        document.getElementById("status_url").innerHTML = '&nbsp;warnung';
        statusDiv.style.backgroundColor = "#FFA500";
        document.getElementById("handling_text").innerHTML = 'Passen Sie hier auf';
    }else{
        document.getElementById("status_url").innerHTML = '&nbsp;unbekannt';
        statusDiv.style.backgroundColor = "#757575";
        document.getElementById("handling_text").innerHTML = 'Es liegen usn derzeit keine dtaen über diese Seite';
        statusDiv.style.borderColor = "white";
        iconDiv.style.color = "#FFA500";
    }

}

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
closeButton.addEventListener('click', function() {
  closePage();
});

// Funktion zum Schließen der Seite
function closePage() {
  window.close(); // Schließt das Fenster
}