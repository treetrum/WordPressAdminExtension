/**
* Module for handling WordPressAdmin Extension
* @namespace sjdWordPressAdmin
*/
var sjdWordPressAdmin = sjdWordPressAdmin || {};
(function(context) {
    'use strict';

    /** Vars */
    var buttonIdentifier = "OpenWordPressAdmin";

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
        if (localStorage.getItem(getBaseDomainName())) {
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

    /**
    * Gets admin URL for the current site
    * @return string Complete Admin URL
    */
    function getAdminUrl(callback) {
        // TODO: Build this...

        if (localStorage.getItem(getBaseDomainName())) {
            return localStorage.getItem(getBaseDomainName());
        } else {

            // Strip off parameters from url, save to currentTestUrl

            // While currentTestUrl != getBaseDomainName

                // Do a synchonous get request to currentTestUrl + /wp-admin to

                // if we get a 404
                    // Remove another level of subdirectories...
                // else
                    // Break

            // endwhile

            // return currentTestUrl + /wp-admin

            return getBaseDomainName() + '/wp-admin';
        }
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
        localStorage.setItem(getBaseDomainName(), adminUrl);
    }

    // PAGE LOAD LOGIC
    // - The main logic of the extension
    function main() {

        // Disable button until we know it will work...
        getMyButton().disabled = true;

        // Find admin URL
        websiteIsWordPress(function(isWordPress) {

            if (isWordPress) {
                var adminUrl = getAdminUrl();

                if (adminUrl) {
                    // Save URL
                    saveAdminUrl(adminUrl);
                    getMyButton().disabled = false;
                }

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
        getCurrentTab().url = getAdminUrl();
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