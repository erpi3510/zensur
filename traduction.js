const elementKeys = [
    "mode_message", 
    "statistic_message", 
    "handling_options", 
    "openExtraPageButton", 
    "closeButton", 
    "reported", 
    "ignored",
    "message_ano_counted",
    "message_meas_count",
    "message_fai_count",
    "message_con_count"
];

elementKeys.forEach(key => {
    document.getElementById(key).innerHTML = chrome.i18n.getMessage(key);
});

$(document).ready(function () {
    $('#closeButton').attr('title', chrome.i18n.getMessage("message_title_closeButton"));
  });

$(document).ready(function () {
    $('#reported').attr('title', chrome.i18n.getMessage("message_title_reported"));
});

$(document).ready(function () {
    $('#ignored').attr('title', chrome.i18n.getMessage("message_title_ignored"));
});
