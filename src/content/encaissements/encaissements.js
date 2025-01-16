if (JSON.parse(sessionStorage.getItem('user')) === null)
    window.location.replace('./page_login.html?v=' + new Date().getTime());

let data_dossier, data_urgence = [];

(function () {
    initPanels();

    initFilters();

    $("#example-modal-alert").show();

    prepareModal();

    getData(getCurrentFilters()).then(function(value) {
        $('#example-modal-alert').hide();
        drawDatatables(value);
    });
})();