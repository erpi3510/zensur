
//document.getElementById("selectsite").innerHTML = valueTab;

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['notificationCount'], function(result) {
        // Zeigt die Anzahl der Benachrichtigungen an  okays
        document.getElementById('notificationCount').textContent = result.notificationCount || 0;
    });
});
