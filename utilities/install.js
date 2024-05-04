const elementKeys = [
    "titleinstall",
    "thanks",
    "message_page_handling",
    "message_info",
     "tutorials"
];

elementKeys.forEach(key => {
    document.getElementById(key).innerHTML = chrome.i18n.getMessage(key);
});

document.addEventListener('DOMContentLoaded', function () {
    const openExtraPageButton = document.getElementById('tutorials');
  
    openExtraPageButton.addEventListener('click', function () {
        // Öffnen Sie die zusätzliche Seite in einem neuen Tab
        chrome.tabs.create({ url: 'https://www.google.de/imgres?q=extension%20chrome%20anpinnen%20bild&imgurl=https%3A%2F%2Fres.cloudinary.com%2Fbw-com%2Fimage%2Fupload%2Ff_auto%2Fv1%2Fctf%2F7rncvj1f8mw7%2F4cwP0QDHWh01v1K8nMV0ma%2F3a4b404bbf095bc7cc6c627c7f61969d%2Fchrome-pin.png%3F_a%3DBAJFJtWI0&imgrefurl=https%3A%2F%2Fbitwarden.com%2Fde-de%2Fhelp%2Fgetting-started-browserext%2F&docid=J9F-soHwatWzRM&tbnid=VxzkNXdhQJaF3M&vet=12ahUKEwjtp9WGrPSFAxXYSvEDHdR-CZYQM3oECBkQAA..i&w=555&h=296&hcb=2&ved=2ahUKEwjtp9WGrPSFAxXYSvEDHdR-CZYQM3oECBkQAA' });
    });
  });