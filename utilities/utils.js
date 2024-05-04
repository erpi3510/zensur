
//document.getElementById("selectsite").innerHTML = valueTab;

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['notificationCount'], function(result) {
        // Zeigt die Anzahl der Benachrichtigungen an
        document.getElementById('notificationCount').textContent = result.notificationCount || 0;
    });
});
// traduction

const elementKeys = [
    "message_trend",
    "message_card_trend",
    "total",
    "option1",
    "option2",
    "option3",
    "nav_7",
    "nav_30",
    "nav_365",
    "message_statistic"
];

elementKeys.forEach(key => {
    document.getElementById(key).innerHTML = chrome.i18n.getMessage(key);
});