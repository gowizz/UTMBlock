chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return sendCurrentUrl(details);
    }, {
        urls: ["<all_urls>"]
    },
    ["blocking"]);


function sendCurrentUrl(tab) {
    let userURL = tab.url;
    let urlParams = getAllUrlParams(userURL);
    if (urlParams.length < 1) {
        return null;
    }
    if (url_contains_utm_source(userURL, urlParams) === false) {
        return null;
    }

    const new_url = getURLwithoutUTM(userURL, urlParams);

    const updateProperties = {
        "url": new_url.toString()
    };

    chrome.tabs.update(tab.tabId, updateProperties, function() {});
}

function getURLwithoutUTM(oldURL, urlParams) {
    let not_params_url = oldURL.split('?')[0];

    const no__UTM_urlParams = Object.keys(urlParams).reduce((object, key) => {
        if (key.substring(0, 4) !== "utm_") {
            object[key] = urlParams[key];
        }
        return object
    }, {});
    let new_url = new URL(not_params_url);

    for (let key in no__UTM_urlParams) {
        new_url.searchParams.append(key,no__UTM_urlParams[key]);
    }
    return new_url;
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