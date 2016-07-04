/**
* Module for handling WordPressAdmin Extension
* @namespace sjdWordPressAdmin
*/
var sjdWordPressAdmin = sjdWordPressAdmin || {};
(function(context) {
    'use strict';

    function loadAdminPage(event) {
        if (event.command == "OpenWordPressAdmin") {
            // This is where we know that MY button has been clicked...

            // Get current window
            var currentWindow = safari.application.activeBrowserWindow;

            // Get current tab in window
            var currentTab = currentWindow.activeTab;

            // Set the url of the current tab
            currentTab.url = currentTab.url + 'wp-admin';
        }
    }

    safari.application.addEventListener("command", loadAdminPage, false);

})(sjdWordPressAdmin);