/**
* Module for handling WordPressAdmin Extension
* @namespace sjdWordPressAdmin
*/
var sjdWordPressAdmin = sjdWordPressAdmin || {};
(function(context) {
    'use strict';

    /** Vars */
    var buttonIdentifier = "OpenWordPressAdmin";
    var baseURI = safari.extension.baseURI;

    /**
    * Get reference to a button using the buttonIdentifier variable
    * @return button
    */
    function getMyButton() {
        var itemArray = safari.extension.toolbarItems;
        for (var i = 0; i < itemArray.length; ++i) {
            var item = itemArray[i];
            if (item.identifier == buttonIdentifier) {
                return item;
            }
        }
    }

    /**
    * Work out if site is on WordPress or not.
    * Runs a callback with a boolean as the only parameter if the site is WordPress or Not.
    */
    function websiteIsWordPress(callback) {

        // Check if we have an adminURL saved already for this site...
        if (sessionStorage.getItem(getBaseDomainName())) {
            var onWordPress = true;
            callback(onWordPress);

        // Else, check it manually...
        } else {
            $.get(getCurrentUrl(), function(data) {
                var onWordPress = false;
                if (data.search("wp-content") >= 0) {
                    onWordPress = true;
                }
                if (onWordPress) {
                    callback(onWordPress);
                }
            });
        }

    }

    /**
    * Get current page/tab url
    * @return string
    */
    function getCurrentUrl() {
        return getCurrentTab().url;
    }

    /**
    * Get the protocol (http, https, etc) of the current tab url
    * @return string
    */
    function getProtocol() {
        var url = getCurrentUrl();
        return url.substr(0, url.indexOf(':'));
    }

    /**
    * Get base domain name
    * @return string
    */
    function getBaseDomainName() {
        var protocolRemoved = getCurrentUrl().replace( getProtocol() + '://', '');
        var subdirectoriesRemoved = protocolRemoved.substr(0, protocolRemoved.indexOf('/'));
        return getProtocol() + "://" + subdirectoriesRemoved;
    }

    function removeURLParams(url) {
        var n = url.indexOf('?');
        let newURL = url.substring(0, n != -1 ? n : url.length);
        return newURL;
    }

    function removeLastURLComponent(url) {

        // Remove trailing slash if there is one
        if (url[url.length-1] == '/') {
            url = url.replace(/\/+$/, '');
        }

        // Split URL at '/'
        let splitURL = url.split('/');

        // Remove the last component
        splitURL.pop();

        // Join it back together
        let joinedURL = splitURL.join('/');

        // Return it
        return joinedURL;
    }

    function removeTrailingSlash(url) {
        if (url[url.length-1] == '/') {
            url = url.replace(/\/+$/, '');
        }
        return url;
    }

    function findWPAdminURL(url, recurseCount = 0) {

        url = removeTrailingSlash(url);
        url = removeURLParams(url);
        let urlToTest = url + '/wp-admin';

        return new Promise(function(resolve, reject) {
            if (recurseCount > 10) {
                reject('Too many recursions');
            }
            axios.get(urlToTest)
                .then(function (response) {
                    resolve({found: true, url: urlToTest, base: url});
                })
                .catch(function (error) {
                    resolve({found: false, url: urlToTest, base: url});
                });
        })
            .then(function(result) {
                if (result.found) {
                    return {url: result.url, base: url};
                } else {
                    return findWPAdminURL(removeLastURLComponent(url), recurseCount+1);
                }
            });

    }

    /**
    * Gets admin URL for the current site
    * @return string Complete Admin URL
    */
    function getAdminUrl(base = false) {

        base = base || getBaseDomainName();

        return new Promise(function(resolve, reject) {
            if (base && sessionStorage.getItem(base)) {
                resolve({url: sessionStorage.getItem(base), base: base})
            } else {
                findWPAdminURL(getCurrentUrl())
                    .then(function(url) {
                        resolve(url);
                    })
                    .catch(function(err) {
                        console.error(err);
                    });
            }
        });
    }

    /**
    * Gets the current tab
    * @return Object current tab Object
    */
    function getCurrentTab() {
        var currentWindow = safari.application.activeBrowserWindow;
        var currentTab = currentWindow.activeTab;
        return currentTab;
    }

    /**
    * Saves the supplied url to local storage using the baseDomain of the current site...
    */
    function saveAdminUrl(adminUrl) {
        sessionStorage.setItem(getBaseDomainName(), adminUrl);
    }

    // PAGE LOAD LOGIC
    // - The main logic of the extension
    function main() {

        // Disable button until we know it will work...
        getMyButton().disabled = true;

        // Find admin URL
        websiteIsWordPress(function(isWordPress) {

            if (isWordPress) {
                getAdminUrl()
                    .then(({url, base}) => {
                        if (url) {
                            // Save URL
                            sessionStorage.setItem(base, url);
                            // saveAdminUrl(url);
                            $(getMyButton()).data('base', base);
                            getMyButton().disabled = false;
                        }
                    });

            } else {
                // The website is not wordpress...
            }
        });
    }

    /**
    * Main page redirect funcitonality.
    * Redirects the user to the found WordPress Admin URL
    * @param event
    */
    function loadAdminPage(event) {
        let base = $(getMyButton()).data('base');
        getAdminUrl(base).
            then(({url}) => {
                getCurrentTab().url = url;
            });
    }


    /////////////////////
    // EVENT LISTENERS //
    /////////////////////

    // Listen for the button being clicked
    safari.application.addEventListener("command", loadAdminPage, true);

    // Listen for new tab being brought to the foreground, then run the main logic
    safari.application.addEventListener("activate", main, true);
    safari.application.addEventListener("navigate", main, true);

})(sjdWordPressAdmin);