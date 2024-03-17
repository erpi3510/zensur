chrome.topSites.get((topSites) => {
  
    //document.getElementById("topurls").innerHTML = JSON.stringify(topSites[0].url);
    //document.getElementById("topurls").innerHTML = JSON.stringify(topSites);
    //document.getElementById("topurls").innerHTML = selectedOptionId;
    //document.getElementById("blocked_urls").innerHTML = JSON.stringify(topSites.url);

const select = document.getElementById('dynamicSelect');

const urlsAdded = new Set(); // Ein Set, um bereits hinzugefügte URLs zu speichern

topSites.forEach((record, i) => {
    const url = extractNameAndDomain(record.url);
    if (!urlsAdded.has(url)) { // Überprüfen, ob die URL bereits hinzugefügt wurde
        const option = document.createElement('option');
        option.value = url; // 'i' plus 1, da Optionen normalerweise von 1 an nummeriert sind
        option.text = url;
        select.appendChild(option);
        urlsAdded.add(url); // Füge die URL zum Set hinzu, um Duplikate zu vermeiden
    }
});

    console.log('Top-Sites:', topSites);
  });

  document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('dynamicSelect');

    selectElement.addEventListener('change', function() {
        // Hier erhalten Sie die ID der ausgewählten Option
        const selectedOptionId = this.options[this.selectedIndex].id;

        // Oder den Wert der ausgewählten Option
        const selectedOptionValue = this.value;
        document.getElementById("topurls").innerHTML = selectedOptionValue;

        // Führen Sie hier Ihre Aktion aus, z.B. eine Ausgabe in der Konsole
        console.log('Ausgewählte Option ID:', selectedOptionId);
        console.log('Ausgewählter Option Wert:', selectedOptionValue);

        // Hier können Sie auf Basis der Auswahl weitere Aktionen ausführen
    });
});


  document.addEventListener('DOMContentLoaded', function () {
    // Daten für das Liniendiagramm
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Dataset 1',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: 'rgb(255, 99, 132)', // Linienfarbe
                backgroundColor: 'rgba(255, 99, 132, 0.2)', // Flächenfüllungsfarbe mit geringer Deckkraft
                fill: true // Linienfüllung aktivieren
            },
            {
                label: 'Dataset 2',
                data: [28, 48, 40, 19, 86, 27, 90],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true
            },
            {
                label: 'Dataset 3',
                data: [65, 81, 56, 55, 40, 62, 85],
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.2)',
                fill: true
            },
            {
                label: 'Dataset 4',
                data: [45, 25, 10, 80, 56, 71, 30],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }
        ]
    };

    // Optionen für das Liniendiagramm
    const options = {
        scales: {
            y: {
                beginAtZero: true // Y-Achse bei Null beginnen
            }
        }
    };

    // Canvas-Element auswählen und Liniendiagramm erstellen
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'line', // Typ des Diagramms ist 'line' (Liniendiagramm)
        data: data,
        options: options
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
  