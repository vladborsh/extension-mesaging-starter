import { log, logH } from './util';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    log('Message accepted')
    if ( request.type === 'redirect' ) {
        window.location.href = `${request.url}?tab=${request.tabId}`;
    }
    if ( request.type === 'collect' ) {
        log("Manning started");
        let successCallback = (collection) => {
            for (var i = 0; i < collection.length; i++) {
                collection[i].airline = request.airline
            }
            chrome.runtime.sendMessage({
                type: 'data-collected',
                tabId: request.tabId,
                data: collection
            })
        }
        let errorCallback = () => {
            chrome.runtime.sendMessage({
                type: 'bad-gateway',
                tabId: request.tabId
            })
        }
        runPollingTimeout ( runDataPolling( successCallback, errorCallback ), successCallback )
    }
});


let stateCheck = setInterval(() => {
    if (document.readyState === 'complete') {
        clearInterval(stateCheck);
        log('Page ready. Send ready-to-collect request')
        var url = new URL(window.location.href);
        var tabId = url.searchParams.get("tab");
        chrome.runtime.sendMessage({
            type: 'ready-to-collect',
            tabId: tabId,
        })
    } else {
        log(`Page isn't ready`);
    }

}, 100);

function collectData() {
    log('Actual collect')
    let result = []
    try {
        let table = document.getElementById('tbl-datatable')
        let tbody = table.getElementsByTagName('tbody').item(0)
        let rows = tbody.getElementsByTagName('tr')
        for (var i = 0; i < rows.length; i++) {
            let cols = (rows.item(i)).getElementsByTagName('td')
            if (cols.length > 11) {
                result.push({
                    date    : (cols.item(2)).innerText,
                    from    : (cols.item(3)).innerText,
                    to      : (cols.item(4)).innerText,
                    aircraft: (cols.item(5)).innerText,
                    std     : (cols.item(7)).innerText, //(scheduled departure)
                    atd     : (cols.item(8)).innerText, //(actual departure)
                    sta     : (cols.item(9)).innerText, //(scheduled arrival)
                    status  : (cols.item(11)).innerText// (if in status provided time, then it is actual arrival)
                })
            }
        }
        log(result);
    } catch (err) {
        logH(err);
    }
    return result;
}

function clickLoadMoreFlightsButton( callback ) {
    let table = document.getElementById('tbl-datatable')
    let tfooter = table.getElementsByTagName('tfoot').item(0) 
    let row = tfooter.getElementsByTagName('tr').item(0)
    let a = document.getElementsByClassName('loadButtonContainer').item(0).getElementsByTagName('a').item(0)
    a.click();
    let interval = setInterval( () => {
        try {
            log('Eairlier flights polling')
            if (row.className === 'ng-hide') {
                log(callback);
                callback();
                clearInterval(interval);
            } else {
                let a = document.getElementsByClassName('loadButtonContainer').item(0).getElementsByTagName('a').item(0)
                a.click();
            }
        } catch (error) {
            log(error)
        }
    }, 200)
}

function isDataLoadingFinished( ) {
    let table = document.getElementById('tbl-datatable')
    let tbody = table.getElementsByTagName('tbody').item(0)
    let rows = tbody.getElementsByTagName('tr')
    if (rows.length > 0) {
        return ((rows.item(0).getElementsByTagName('td').length) > 1)
    }
    return false
}

function isDataFlightExists( ) {
    let table = document.getElementById('tbl-datatable')
    let tbody = table.getElementsByTagName('tbody').item(0)
    let rows = tbody.getElementsByTagName('tr')
    if (rows.length > 0) {
        let cols = rows.item(0).getElementsByTagName('td');
        if (cols.length == 1) {
            let inner = cols.item(0).innerText
            return !inner.includes('Sorry')
        } 
        return true
    }
    return false
}

function isBadGateway() {
    let errDetails = document.getElementById('cf-error-details')
    return errDetails != null;
}

function runDataPolling( successPollingCallback, errorPollingCallback ) {
    let interval = setInterval(() => {
        try {
            if ( isDataLoadingFinished() ) { 
                clearInterval(interval)
                const actionsAfterLoadingEarlierFLieghts = () => {
                    log('actionsAfterLoadingEarlierFLieghts')
                    let collection = collectData()
                    successPollingCallback( collection )
                }
                clickLoadMoreFlightsButton( actionsAfterLoadingEarlierFLieghts )  
            } else if ( isBadGateway() ) {
                clearInterval(interval)
                errorPollingCallback();
            } else if ( !isDataFlightExists() ) {
                clearInterval(interval)
                successPollingCallback( [] )
            }
        } catch (error) {
            logH(error);
            successPollingCallback( [] )
        }
    }, 100)
    return interval;
}

function runPollingTimeout( breakableInterval, callback ) {
    setTimeout(() => {
        log('Timeout')
        clearInterval(breakableInterval)
        if ( isDataLoadingFinished() ) {
            let collection = collectData()
            callback( collection )
        } else {
            callback([])
        }
    }, 60000 );
}

