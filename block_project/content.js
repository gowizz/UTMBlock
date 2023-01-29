
// TODO: add support for more short URL providers
const shortUrlProvidors = [
    "https://bit.ly/",
    "http://bit.ly/",
    "https://t.co/",
    "http://t.co/",
    "https://tinyurl.com/",
    "http://tinyurl.com/",
    "https://goo.gl/",
    "http://goo.gl/",
    "https://ow.ly/",
    "http://ow.ly/",
    "https://buff.ly/",
    "http://buff.ly/",
    "https://ift.tt/",
    "http://ift.tt/",
    "https://is.gd/",
    "http://is.gd/",
    "https://dlvr.it/",
    "http://dlvr.it/",
    "https://bitly.com/",
    "http://bitly.com/",
    "https://lnkd.in/",
    "http://lnkd.in/",
    "https://ln.is/",
    "http://ln.is/",
    "https://lnkd.it/",
    "http://lnkd.it/",
    "https://lnk.bio/",
    "http://lnk.bio/",
    "https://lnk.to/",
    "http://lnk.to/",
    "https://lnkfi.re/",
    "http://lnkfi.re/",
    "https://lnkly.co/",
    "http://lnkly.co/",
    "https://lnkurl.com/",
    "http://lnkurl.com/",
    "https://lnkweb.com/",
    "http://lnkweb.com/",
    "https://lnkz.me/",
]
function isShortUrl(url) {
    for (const shortUrlProvidor of shortUrlProvidors) {
        if (url.startsWith(shortUrlProvidor)) {
            return true;
        }
    }
    return false;
}

function replaceTrackers(url) {
     // Remove UTM tags, Amazon trackers, Etsy trackers, eBay trackers, and Bitly parameters from URL
     return url.replace(/\?utm_[^&]+&?/g, '?')
        .replace(/\?tag=[^&]+&?/g, '?')
        .replace(/\?ref=[^&]+&?/g, '?')
        .replace(/\?_encoding=[^&]+&?/g, '?')
        .replace(/\?btm_[^&]+&?/g, '?')
        .replace(/\?$/, '');
}

// Listen for changes to the URL
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    // Get the updated URL
    let newUrl = details.url;

    // Check if the URL is a Bitly link
    if (isShortUrl(newUrl)) {
        // Fetch the original URL
        fetch(newUrl, {
            method: 'HEAD',
            redirect: 'follow'
        }).then(response => {
            // Get the original URL from the response
            newUrl = response.url;
        }).catch(error => {
            console.error(error);
        });
    } 
        newUrl = replaceTrackers(newUrl);
      
        // If the URL has changed, update it
        if (newUrl != details.url) {
            chrome.tabs.update(details.tabId, {url: newUrl});
        }
});
