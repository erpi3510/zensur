chrome.topSites.get((topSites) => {

    //document.getElementById("topurls").innerHTML = JSON.stringify(topSites[0].url);
    //document.getElementById("topurls").innerHTML = JSON.stringify(topSites);
    //document.getElementById("topurls").innerHTML = selectedOptionId;
    //document.getElementById("blocked_urls").innerHTML = JSON.stringify(topSites.url);

    const select = document.getElementById('dynamicSelect30');

    const urlsAdded = new Set(); // Ein Set, um bereits hinzugefügte URLs zu speichern

    // Funktion zum Abrufen der Daten für eine bestimmte URL und Überprüfen der Antwort
     // Event-Listener für das Event 'shown.bs.tab', um zu wissen, welche Registerkarte aktiv ist
     
     document.addEventListener('shown.bs.tab', function (event) {
        const tabId= event.target.getAttribute('id'); // ID der aktivierten Registerkarte 
         chrome.storage.local.set({
            "actualTab": tabId
        });       
       
    });

    async function fetchDataAndCheckResponse(url) {
        try {
            const response = await fetch('http://localhost:3003/data/domain/getdata30days/' + url);


            if (response.ok) {
                return true; // Erfolgreiche Antwort erhalten
            } else {
                //console.error('Fehler beim Abrufen der Daten für:', url);
                return false; // Fehler beim Abrufen der Daten
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Daten für:', url, error);
            return false; // Fehler beim Abrufen der Daten
        }
    }

    // Funktion zum Hinzufügen einer URL zum Dropdown-Menü, wenn die Antwort erfolgreich ist
    async function addUrlToDropdown(url) {
        const isResponseOk = await fetchDataAndCheckResponse(url);

        if (isResponseOk && !urlsAdded.has(url)) {
            const option = document.createElement('option');
            option.value = url;
            option.text = url;
            select.appendChild(option);
            urlsAdded.add(url);
        }
    }

    // URLs aus topSites durchgehen und zum Dropdown-Menü hinzufügen, wenn die Antwort erfolgreich ist
    topSites.forEach((record, i) => {
        const url = extractNameAndDomain(record.url);
        addUrlToDropdown(url);
    });


    console.log('Top-Sites:', topSites);
});

document.addEventListener('DOMContentLoaded', function () {
    const selectElement = document.getElementById('dynamicSelect30');

    selectElement.addEventListener('change', function () {
        // Hier erhalten Sie die ID der ausgewählten Option
        const selectedOptionId = this.options[this.selectedIndex].id;

        // Oder den Wert der ausgewählten Option
        const selectedOptionValue = this.value;
        //document.getElementById("topurls").innerHTML = selectedOptionValue;
        chrome.storage.local.set({
            "actualUrl": selectedOptionValue
        });


    });
});

function getValueFromLocalStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function (data) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data[key]);
            }
        });
    });
}



async function updateDropdownMenu() {
    try {
        // Daten aus dem Local Storage abrufen
        const valueUrl = await getValueFromLocalStorage('actualUrl');
        const selectElement = document.getElementById('dynamicSelect30');

        // Wenn die URL nicht im Local Storage vorhanden ist, leeres Dropdown-Menü anzeigen
        if (!valueUrl) {
            selectElement.innerHTML = '<option selected>Keine URLs verfügbar</option>';
            return;
        }

        // URLs aus dem Local Storage abrufen und Dropdown-Menü aktualisieren
        const urls = JSON.parse(valueUrl);
        selectElement.innerHTML = '';
        urls.forEach(actualUrl => {
            const option = document.createElement('option');
            option.text = actualUrl;
            selectElement.add(option);
        });
    } catch (error) {
        //console.error('Fehler beim Aktualisieren des Dropdown-Menüs:', error);
    }
}

async function fetchDataAndCreateChart(url) {
    try {


        const domainName = url;
        const response = await fetch('http://localhost:3003/data/domain/getdata30days/' + domainName);
        const data = await response.json();

        // Überprüfe, ob die erwarteten Daten vorhanden sind
        if (!data || typeof data.anomaly_count === 'undefined') {
            console.error('Erwartete Daten nicht im Antwortobjekt gefunden.');
            return;
        }

        // Farbdefinitionen
        const colors = [{
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)'
            }, // Rot
            {
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)'
            }, // Blau
            {
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.2)'
            }, // Gelb
            {
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            } // Grün
        ];

        // Daten für das Chart vorbereiten
        const chartData = {
            labels: ['Anomaly', 'Confirmed', 'Failure', 'Measurement'],
            datasets: [{
                    label: 'Anomaly Count',
                    data: [data.anomaly_count, 0, 0, 0],
                    borderColor: colors[0].borderColor,
                    backgroundColor: colors[0].backgroundColor,
                    fill: true,
                },
                {
                    label: 'Confirmed Count',
                    data: [0, data.confirmed_count, 0, 0],
                    borderColor: colors[1].borderColor,
                    backgroundColor: colors[1].backgroundColor,
                    fill: true,
                },
                {
                    label: 'Failure Count',
                    data: [0, 0, data.failure_count, 0],
                    borderColor: colors[2].borderColor,
                    backgroundColor: colors[2].backgroundColor,
                    fill: true,
                },
                {
                    label: 'Measurement Count',
                    data: [0, 0, 0, data.measurement_count],
                    borderColor: colors[3].borderColor,
                    backgroundColor: colors[3].backgroundColor,
                    fill: true,
                }
            ]
        };

        // Optionen für das Chart
        const options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        // Chart erstellen
        const ctx = document.getElementById('myChart30').getContext('2d');
        new Chart(ctx, {
            type: 'bar', // Ändere zu 'bar', um ein Balkendiagramm zu verwenden
            data: chartData,
            options: options
        });
    } catch (error) {
        console.error('Fehler beim Abrufen und Erstellen des Diagramms:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await updateDropdownMenu();
    const selectElement = document.getElementById('dynamicSelect30');
    selectElement.addEventListener('change', async function () {
        const selectedUrl = selectElement.value;
        await fetchDataAndCreateChart(selectedUrl);
    });
});


$("ul.nav-tabs a").click(function (e) {
    e.preventDefault();
    $(this).tab('show');
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