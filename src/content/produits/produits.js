if (JSON.parse(sessionStorage.getItem('user')) === null)
    window.location.replace('./page_login.html?v=' + new Date().getTime());

let patientEnCours = null;
let data_prestations, data_extras, data_reserve, data_pharmacie, data_honoraires, data_soins = [];

(function() {
    initPanels();

    initFilters();

    $('#example-modal-alert').show();

    getData().then(function(value) {
        $('#example-modal-alert').hide();
        drawDatatables(value);
    });

    /* let promise_medecin = getMedecin();
      //let promise_dossier = getDossier();
      let promise_prest = getPrestations();
      let promise_extr = getExtras();
      let promise_soins = getSoins();
      let promise_pharmacie = getListeStocks();*/

    /*  Promise.all([promise_medecin, promise_dossier]).then((values) => {
          data_honoraires = values[0];
          initModals(values);
      });

      Promise.all([promise_prest, promise_extr, promise_soins, promise_pharmacie]).then((values) => {
          data_prestations = values[0];
          data_extras = values[1];
          data_reserve = values[0];
          data_pharmacie = values[3];
          data_soins = values[2];
      });*/
})();