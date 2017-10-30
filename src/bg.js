import Hub from './hub';
import { log, logH } from './util';

let hub = undefined;
let readyToCollect = false;
let alreadyGenerated = false;
let waitingTimeout = null;

setInterval( () => {
    if (!!hub) {
        logH(`Airlines processed: ${hub.getAirlineProcessed()}`);
    }
}, 2 * 60 * 1000);

function setWaitingTimeout() { 
    return setTimeout( () => {
        logH(`Airlines processed: ${hub.getAirlineProcessed()}`);
        if (!!hub) {
            saveJSON( hub.getStorage(), 'data.json' )
        }
    }, 3 * 60 * 1000);
}
    

// Get message from the page
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    try {
        if ( request.type === 'ready-to-collect' && readyToCollect ) {
            log('Collect request accepted')
            chrome.tabs.sendMessage(parseInt(request.tabId), 
                {
                    type : 'collect',
                    airline: hub.getAirline(),
                    tabId : request.tabId
                }
            );
            waitingTimeout = setWaitingTimeout()
            readyToCollect = false;
        } 
        if ( request.type === 'bad-gateway' ) {
            log('Bad gateway')
            chrome.tabs.sendMessage(parseInt(request.tabId), 
                {
                    type   : 'redirect',
                    url    : hub.getAirlineUrl(),
                    tabId  : request.tabId
                }
            );
        } 
        if ( request.type === 'data-collected' ) {
            log('Data collected')
            clearTimeout( waitingTimeout );
            hub.pushNewListInStorage( request.data )
            if ( !hub.isAirlinesListEmpty() ) {
                readyToCollect = true;
                chrome.tabs.sendMessage(parseInt(request.tabId), 
                    {
                        type   : 'redirect',
                        url    : hub.getAirlineUrl(),
                        tabId  : request.tabId
                    }
                );
                hub.popAirline()
            } else if (!alreadyGenerated) {
                alreadyGenerated = true;
                saveJSON( hub.getStorage(), 'data.json' )
            }
        } 
    } catch(err) {
        logH(err)
    }
});

// Get message from the extension popup
chrome.extension.onMessage.addListener( function(request,sender,sendResponse) {
    if ( request.type === 'start' ) {
        hub = new Hub()
        readyToCollect = true;
        alreadyGenerated = false;
        chrome.tabs.sendMessage(request.tabId, 
            {
                type : 'redirect',
                url  : hub.getAirlineUrl(),
                tabId: request.tabId
            }
        );
    }
})

//Save json file
function saveJSON(data, filename){
    log(alreadyGenerated)
    if(!data) {
        console.error('No data')
        return;
    }

    if(!filename) filename = 'console.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}

window.dum = function () {
    console.log(fun)
}

