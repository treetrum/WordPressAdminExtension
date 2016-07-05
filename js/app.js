/**
* Module for handling WordPressAdmin Extension
* @namespace sjdWordPressAdmin
*/
var sjdWordPressAdmin = sjdWordPressAdmin || {};
(function(context) {
    'use strict';

    /** Vars */
    var buttonIdentifier = "OpenWordPressAdmin";

    // var myButton = getMyButton();
    var currentWindow = safari.application.activeBrowserWindow;
    var currentTab = currentWindow.activeTab;

    var savedAdminUrl;

    /**
    * Get reference to a button using the buttonIdentifier variable
    * @return button
    */
    function getMyButton() {
        var itemArray = safari.extension.toolbarItems;
        for (var i = 0; i < itemArray.length; ++i) {
            var item = itemArray[i];
            if (item.identifier == buttonIdentifier) {
                /* Do something. */
                return item;
            }
        }
    }

    /**
    * Work out if site is on WordPress or not.
    * @return boolean
    */
    function websiteIsWordPress() {

        // Get contents of webpage
        // var contents = $('body').html();

        // alert(contents);

        return true;

    }

    /**
    * Get current page/tab url
    * @return string
    */
    function getCurrentUrl() {
        return currentTab.url;
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
    function getAdminUrl() {
        // TODO: Build this...
        return getBaseDomainName() + '/wp-admin';
    }

    // PAGE LOAD LOGIC
    // - The main logic of the extension
    function main() {

        // Get current tab and window
        currentWindow = safari.application.activeBrowserWindow;
        currentTab = currentWindow.activeTab;

        // Disable button until we know it will work...
        getMyButton().disabled = true;

        // Find admin URL
        if (websiteIsWordPress()) {

            savedAdminUrl = getAdminUrl();
            if (savedAdminUrl) {
                getMyButton().disabled = false;
            }

        }

    }
    main();


    /**
    * Main page redirect funcitonality.
    * Redirects the user to the found WordPress Admin URL
    * @param event
    */
    function loadAdminPage(event) {
        currentTab.url = savedAdminUrl;
    }

    // Listen for the button being clicked
    safari.application.addEventListener("command", loadAdminPage, true);

    // Listen for new tab being brought to the foreground, then run the main logic
    safari.application.addEventListener("activate", main, true);
    safari.application.addEventListener("navigate", main, true);


})(sjdWordPressAdmin);