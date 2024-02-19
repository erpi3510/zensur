chrome.runtime.sendMessage({ action: "checkURL", url: window.location.href });
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs,message, sender,) {
    var activeTab = tabs[0];
    var activeTabUrl = activeTab.url;
   
    
      console.log("Aktuelle URL des Tabs:2", activeTabUrl);
  
  });