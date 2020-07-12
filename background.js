
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //TODO: complete may not be correct. We want to run it before the page is loaded
    //alert(changeInfo.status)
    console.log("Status:" + changeInfo.status);
    console.log("tabId" + tabId);
    console.log("tab ur" + tab.url);
    console.log("==============");
    if (tab.url !== undefined){
        sendCurrentUrl(tabId, tab)
    }
});
 /*
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        alert("HELLO");
        return {cancel: details.url.indexOf("://https://www.morningbrew.com/") != -1};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]);

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'User-Agent') {
                details.requestHeaders.splice(i, 1);
                break;
            }
        }
        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);
*/

function sendCurrentUrl(tabId, tab) {
    let tablink = tab.url;
    let urlParams = getAllUrlParams(tablink);
    if (urlParams.length < 1) {
        return null;
    }
    if (url_contains_utm_source(tablink, urlParams) === false) {
        return null;
    }

    let not_params_url = tablink.split('?')[0];

    const no__UTM_urlParams = Object.keys(urlParams).reduce((object, key) => {
        if (key.substring(0, 4) !== "utm_") {
            object[key] = urlParams[key];
        }
        return object
    }, {});
    let new_url = new URL(not_params_url);

    for (let key in no__UTM_urlParams) {
        let value = no__UTM_urlParams[key];
        new_url.searchParams.append(key, value);
    }

    let updateProperties = {};
    updateProperties.url = new_url.toString();
    chrome.tabs.update(tabId, updateProperties, function() {});
}

function getAllUrlParams(url) {
    let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    let obj = {};

    if (queryString) {
        queryString = queryString.split('#')[0];

        let arr = queryString.split('&');
        for (let i = 0; i < arr.length; i++) {
            let a = arr[i].split('=');

            let paramName = a[0];
            let paramValue = typeof(a[1]) === 'undefined' ? true : a[1];

            paramName = paramName.toLowerCase();
            if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

            if (paramName.match(/\[(\d+)?\]$/)) {

                let key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];

                if (paramName.match(/\[\d+\]$/)) {
                    let index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    obj[key].push(paramValue);
                }
            } else {
                if (!obj[paramName]) {
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    obj[paramName].push(paramValue);
                }
            }
        }
    }

    return obj;
}


function url_contains_utm_source(url, urlParams) {
    const keys = Object.keys(urlParams);
    for (let index in keys) {
        const key = keys[index];
        if ((key.substring(0, 4) === "utm_") || key.substring(0, 4) === "UTM_") {
            return true;
        }
    }
    return false;
}