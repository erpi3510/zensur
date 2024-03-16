// popup.js
document.addEventListener('DOMContentLoaded', function () {
  const openExtraPageButton = document.getElementById('openExtraPageButton');

  openExtraPageButton.addEventListener('click', function () {
      // Öffnen Sie die zusätzliche Seite in einem neuen Tab
      chrome.tabs.create({ url: 'extra.html' });
  });
});