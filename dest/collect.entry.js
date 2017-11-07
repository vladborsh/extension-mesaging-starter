/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return log; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return logH; });
var log = data => {
    console.log(data);
};

var logH = data => {
    console.log(`%c${data}`, 'color: #478fc6; font-weight: bold; font-size:105%;');
};



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(0);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])('Message accepted');
    if (request.type === 'redirect') {
        window.location.href = `${request.url}?tab=${request.tabId}`;
    }
    if (request.type === 'collect') {
        startManning(request);
    }
});

let stateCheck = setInterval(() => {
    if (document.readyState === 'complete') {
        Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])('Page ready. Send ready-to-collect request');
        clearInterval(stateCheck);
        var url = new URL(window.location.href);
        var tabId = url.searchParams.get("tab");
        chrome.runtime.sendMessage({ type: 'ready-to-collect', tabId: tabId }, response => {
            if (response && response.type === 'collect') {
                startManning(response);
            }
        });
    } else {
        Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])(`Page isn't ready`);
    }
}, 100);

function startManning(colectResponse) {
    Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])("Manning started");
    let successCallback = collection => {
        for (var i = 0; i < collection.length; i++) {
            collection[i].airline = colectResponse.airline;
        }
        chrome.runtime.sendMessage({ type: 'data-collected', tabId: colectResponse.tabId, data: collection }, response => {
            if (response.type === 'redirect') {
                window.location.href = `${response.url}?tab=${colectResponse.tabId}`;
            }
        });
    };
    let errorCallback = () => {
        chrome.runtime.sendMessage({ type: 'bad-gateway', tabId: colectResponse.tabId }, response => {
            if (response.type === 'redirect') {
                window.location.href = `${response.url}?tab=${colectResponse.tabId}`;
            }
        });
    };
    runPollingTimeout(runDataPolling(successCallback, errorCallback), successCallback);
}

function collectData() {
    Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])('Actual collect');
    let result = [];
    try {
        let table = document.getElementById('tbl-datatable');
        let tbody = table.getElementsByTagName('tbody').item(0);
        let rows = tbody.getElementsByTagName('tr');
        for (var i = 0; i < rows.length; i++) {
            let cols = rows.item(i).getElementsByTagName('td');
            if (cols.length > 11) {
                result.push({
                    date: cols.item(2).innerText,
                    from: cols.item(3).innerText,
                    to: cols.item(4).innerText,
                    aircraft: cols.item(5).innerText,
                    std: cols.item(7).innerText, //(scheduled departure)
                    atd: cols.item(8).innerText, //(actual departure)
                    sta: cols.item(9).innerText, //(scheduled arrival)
                    status: cols.item(11).innerText // (if in status provided time, then it is actual arrival)
                });
            }
        }
        Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])(result);
    } catch (err) {
        Object(__WEBPACK_IMPORTED_MODULE_0__util__["b" /* logH */])(err);
    }
    return result;
}

function clickLoadMoreFlightsButton(callback) {
    let table = document.getElementById('tbl-datatable');
    let tfooter = table.getElementsByTagName('tfoot').item(0);
    let row = tfooter.getElementsByTagName('tr').item(0);
    let a = document.getElementsByClassName('loadButtonContainer').item(0).getElementsByTagName('a').item(0);
    a.click();
    let interval = setInterval(() => {
        try {
            Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])('Eairlier flights polling');
            if (row.className === 'ng-hide') {
                Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])(callback);
                callback();
                clearInterval(interval);
            } else {
                let a = document.getElementsByClassName('loadButtonContainer').item(0).getElementsByTagName('a').item(0);
                a.click();
            }
        } catch (error) {
            Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])(error);
        }
    }, 200);
}

function isDataLoadingFinished() {
    let table = document.getElementById('tbl-datatable');
    let tbody = table.getElementsByTagName('tbody').item(0);
    let rows = tbody.getElementsByTagName('tr');
    if (rows.length > 0) {
        return rows.item(0).getElementsByTagName('td').length > 1;
    }
    return false;
}

function isDataFlightExists() {
    let table = document.getElementById('tbl-datatable');
    let tbody = table.getElementsByTagName('tbody').item(0);
    let rows = tbody.getElementsByTagName('tr');
    if (rows.length > 0) {
        let cols = rows.item(0).getElementsByTagName('td');
        if (cols.length == 1) {
            let inner = cols.item(0).innerText;
            return !inner.includes('Sorry');
        }
        return true;
    }
    return false;
}

function isBadGateway() {
    let errDetails = document.getElementById('cf-error-details');
    return errDetails != null;
}

function runDataPolling(successPollingCallback, errorPollingCallback) {
    let interval = setInterval(() => {
        try {
            if (isDataLoadingFinished()) {
                clearInterval(interval);
                const actionsAfterLoadingEarlierFLieghts = () => {
                    Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])('actionsAfterLoadingEarlierFLieghts');
                    let collection = collectData();
                    successPollingCallback(collection);
                };
                clickLoadMoreFlightsButton(actionsAfterLoadingEarlierFLieghts);
            } else if (isBadGateway()) {
                clearInterval(interval);
                errorPollingCallback();
            } else if (!isDataFlightExists()) {
                clearInterval(interval);
                successPollingCallback([]);
            }
        } catch (error) {
            Object(__WEBPACK_IMPORTED_MODULE_0__util__["b" /* logH */])(error);
            successPollingCallback([]);
        }
    }, 100);
    return interval;
}

function runPollingTimeout(breakableInterval, callback) {
    setTimeout(() => {
        Object(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* log */])('Timeout');
        clearInterval(breakableInterval);
        if (isDataLoadingFinished()) {
            let collection = collectData();
            callback(collection);
        } else {
            callback([]);
        }
    }, 60000);
}

/***/ })
/******/ ]);
//# sourceMappingURL=collect.entry.js.map