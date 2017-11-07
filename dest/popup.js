

chrome.tabs.getSelected(null, function(tab){
    chrome.extension.sendMessage({ type:'start', tabId: tab.id }, function (response) {});
});
