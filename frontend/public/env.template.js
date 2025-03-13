(function(window) {
    window.env = window.env || {};
  
    // Environment variables
    window["env"]["apiUrl"] = "${API_URL}";
    window["env"]["isPushEnabled"] = ${PUSH_ENABLED};
    window["env"]["dataAppName"] = "${DATA_APP_NAME}";
})(this);