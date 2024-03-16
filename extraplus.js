chrome.topSites.get((topSites) => {
    //document.getElementById("topurls").innerHTML = JSON.stringify(topSites[0].url);
    document.getElementById("topurls").innerHTML = JSON.stringify(topSites);
    //document.getElementById("blocked_urls").innerHTML = JSON.stringify(topSites.url);
    console.log('Top-Sites:', topSites);
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

// chrome.webRequest.onBeforeRequest.addListener(
//     function(details) {
//       // Überprüfe, ob die URL mit 'http:' beginnt, was auf unsichere Inhalte hindeutet
//       if (details.url.startsWith("http:")) {
//         console.log("Unsichere Anfrage entdeckt:", details.url);
//         // Du kannst hier weitere Aktionen durchführen, wie z.B. Benachrichtigungen senden
//       }
//     },
//     {urls: ["<all_urls>"]}, // Überwache alle URLs
//     ["blocking"] // Verwende den "blocking" Modus, falls du die Anfrage modifizieren oder blockieren möchtest
//   );
  