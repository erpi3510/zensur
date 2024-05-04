const elementKeys = [
    "mode_message", 
    "statistic_message", 
    "handling_options", 
    "openExtraPageButton", 
    "closeButton", 
    "reported", 
    "ignored"
];

elementKeys.forEach(key => {
    document.getElementById(key).innerHTML = chrome.i18n.getMessage(key);
});
