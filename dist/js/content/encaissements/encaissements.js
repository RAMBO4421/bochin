getCurrentFilters = () => {
    let dateNow = luxon.DateTime.now().setLocale('fr').startOf('day').toISO();
    let search1 = $('#search-1').val();
    let search2 = $('#search-2').val();
    let search3 = $('#search-3').val();
    let etatCloture = $('[name=cloture_checkbox][checked]').val();
    let date_debut = $('#_date_debut1').val();
    let date_fin = $('#_date_fin1').val();

    if (!date_debut)
        date_debut = dateNow;
    else
        date_debut = luxon.DateTime.fromFormat(date_debut, 'dd/MM/yyyy').toISO();

    if (!date_fin)
        date_fin = dateNow;
    else
        date_fin = luxon.DateTime.fromFormat(date_fin, 'dd/MM/yyyy').toISO();

    if (!search1)
        search1 = '';

    if (!search2)
        search2 = '';

    if (!search3)
        search3 = '';

    if (!etatCloture)
        etatCloture = 'false';

    return {
        dossier: search3,
        numeroFiche: search2,
        cloturer: JSON.parse(etatCloture),
        du: date_debut,
        au: date_fin,
        nomCli: search1,
    };
};
getData = (obj) => {
    return new Promise(function(resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.RegUrgs}/${Ressources.GetListeReglements}`, obj).then(function(response) {
            resolve(response.data);
        }).catch(function(value) {
            reject(false);
        });
    });
};
getColumns = () => {
    return columnsSet = [
        {
            title: 'N° Encaissement',
            data: 'numReg',
        },
        {
            title: 'N° Urgence',
            data: 'numUrg',
        },
        {
            title: 'N° Dossier',
            data: 'numDoss',
        },
        {
            title: 'Patient',
            data: 'patient',
        },
        {
            title: 'Mode',
            data: 'modeReg',
            render: function(data, type, full, meta) {
                if (data === 'E')
                    return 'Espèce';
                else if (data === 'C')
                    return 'Chèque';
            },
        },
        {
            title: 'Montant',
            data: 'montant',
            render: $.fn.dataTable.render.number(',', '.', 3, ''),
        },
        {
            title: 'Date d\'Encaissement',
            data: 'dateReg',
            type: 'date',
            render: function(data, type, full, meta) {
                if (data != null) {
                    return dateFormatter(full.dateReg.split('T')[0] + 'T' + full.heureReg.split('T')[1]);
                } else {
                    return ' ';
                }
            },
        },
        {
            title: 'Utilisateur',
            data: 'user',
        },
        {
            title: 'Actions',
            data: 'numUrg',
            render: function(data, type, full, meta) {
                let codeHTML = ``;

                if (full.etaCli === '0') {
                    codeHTML += `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 actionsBtn" role="delete" title="Supprimer">
                                    <i class="fal fa-times"></i>
                                    </a>`;
                }

                return codeHTML;
            },
        },
    ];
};
drawDatatables = (data) => {
    createDataTables(obj = {
        element: '#dt-encaissements',
        data: data,
        columns: getColumns(),
        columnFilter: true,
        order: [0, 'desc'],
        header: false,
    });
};
refreshDatatables = () => {
    $('#example-modal-alert').show();
    getData(getCurrentFilters()).then(function(value) {
        let table = $('#dt-encaissements').DataTable();
        table.clear().draw();
        table.rows.add(value);
        table.columns.adjust().draw();
        $('#example-modal-alert').hide();
    }).catch(function(value) {
        $('#example-modal-alert').hide();
    });
};
initModals = () => {
    let modalAjoutEncaissement = $('#modalAjoutEncaissement');
    let html_urgence = `<option value=''></option>`;
    for (element of data_urgence) {
        html_urgence += `<option value="${element.numUrg}">${element.numUrg} || ${element.nomCLi}</option>`;
    }
    $('#select_urgence').html(html_urgence).select2({
        dropdownParent: modalAjoutEncaissement,
        placeholder: 'Sélectionner une fiche',
        width: 'resolve',
        allowClear: true,
    }).off('select2:select').on('select2:select', function(e) {
        $('#example-modal-alert').show();

        let numUrg = e.params.data.id;
        let data = data_urgence.filter(item => item.numUrg === numUrg)[0];
        modalAjoutEncaissement.find('.num_dossier_patient').val(data.numDOss);
        modalAjoutEncaissement.find('.nom_medecin_patient').val(data.nomMed);
        modalAjoutEncaissement.find('.num_chmabre_patient').val(data.numCha);

        drawListeService(numUrg);
    });

    let html_dossier = `<option value=''></option>`;
    for (element of data_dossier) {
        html_dossier += `<option value="${element.numDoss}">${element.numDoss} || ${element.nomCli}</option>`;
    }
    $('#select_dossier_cloture').html(html_dossier).select2({
        dropdownParent: $('#modalClotureSession'),
        placeholder: 'Sélectionner un dossier',
        width: 'resolve',
        allowClear: true,
    });
};
bindEvents = () => {
    $('#add_encaissement').off('click').on('click', function(e) {
        $('#modalAjoutEncaissement').modal('show');
    });

    $('#valider_ajout_encaissement').off('click').on('click', function(e) {
        $('#example-modal-alert').show();

        let modeReg = $('[name=mode_reglement_checkbox]:checked').val();
        let obj = {
            numDoss: $('#modalAjoutEncaissement').find('.num_dossier_patient').val(),
            numUrg: $('#select_urgence').val(),
            modeReg: modeReg,
            login: user.userName,
        };

        if (modeReg === 'C') {
            obj.reFerence = $('#numero_cheque').val();
            obj.dateEch = $('#date_cheque').val();
        }

        addEncaissement(obj).then(function(value) {
            $('#modalAjoutEncaissement').modal('hide');
        });
    });

    $('#cloture_session').off('click').on('click', function(e) {
        $('#modalClotureSession').modal('show');
    });

    $('#valider_cloture_session').off('click').on('click', function(e) {
        $('#example-modal-alert').show();

        let dossier = $('#select_dossier_cloture').val();
        if (dossier)
            clotureSession({
                numDoss: dossier,
                login: user.userName,
            }).then(function(value) {
                $('#modalClotureSession').modal('hide');
                $('#example-modal-alert').hide();

                refreshDatatables();
                prepareModal();
            }).catch(function(value) {
                $('#example-modal-alert').hide();
            });
        else {
            $('#example-modal-alert').hide();
            toastr['error']('Veuillez vérifier les champs vides !');
        }
    });

    $('[name=mode_reglement_checkbox]').off('click').on('click', function(e) {
        if ($(this).val() === 'E')
            $('#numero_cheque').parents('.form-group').hide();
        else if ($(this).val() === 'C')
            $('#numero_cheque').parents('.form-group').show();
    });

    $('.dataTables_empty').empty();
};
initFilters = () => {
    let dateNow = luxon.DateTime.now().setLocale('fr').toLocaleString();
    $('#_date_debut1').val(dateNow);
    $('#_date_fin1').val(dateNow);

    $('#_date_debut1, #_date_fin1').datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true,
        orientation: 'bottom left',
        language: 'fr',
        templates: {
            leftArrow: '<i class="fal fa-angle-left" style="font-size: 1.25rem"></i>',
            rightArrow:
                '<i class="fal fa-angle-right" style="font-size: 1.25rem"></i>',
        },
    });

    $('[name=cloture_checkbox]').off('click').on('click', function(e) {
        $('[name=cloture_checkbox]').removeAttr('checked');
        $(this).attr('checked', '');

        if ($(this).val() === 'true')
            $('#_date_debut1, #_date_fin1').removeAttr('disabled', 'disabled');
        else if ($(this).val() === 'false')
            $('#_date_debut1, #_date_fin1').attr('disabled', 'disabled');
    });

    $('#btn_search').off('click').on('click', function(e) {
        refreshDatatables();
    });

    $('#add_admission').off('click').on('click', function(e) {
        let modal = $('#modalAjoutPatients');
        modal.modal('show');
    });

    $('#refresh_admission').off('click').on('click', function(e) {
        refreshDatatables();
    });
};
getDossier = () => {
    return promise = new Promise(function(resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Clients}/${Ressources.GetListeDossier}`).then(function(response) {
            resolve(response.data);
        });
    });
};
drawListeService = (numUrg) => {
    getListeEncaissment(numUrg).then((values) => {
        let data_encaissement = values;
        createDataTables({
            element: `#dt-list-service`,
            data: data_encaissement,
            columns: [
                {
                    title: 'Nature',
                    data: 'nature',
                    width: '20%',
                },
                {
                    title: 'Désignation',
                    data: 'designation',
                    class: 'textToLeft',
                    width: '70%',
                },
                {
                    title: 'Montant',
                    data: 'montant',
                    width: '10%',
                    render: $.fn.dataTable.render.number(',', '.', 3, ''),
                },
            ],
            columnFilter: false,
            header: false,
            order: [0, 'desc'],
            footerCallback: function() {
                let totalHTML = '';
                if (data_encaissement.length > 0) {
                    let total = data_encaissement.reduce((a, b) => ({montant: a.montant + b.montant}));
                    totalHTML = $.fn.dataTable.render.number(',', '.', 3, '').display(total.montant);
                }

                $('#dt-list-service tfoot th').eq(1).html(totalHTML);
            },
        });
        $('#example-modal-alert').hide();
    });
};
getListePatientUrgNonCloturer = () => {
    return promise = new Promise(function(resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.PatientUrgs}/${Ressources.GetListePatientUrgNonCloturer}`).then(function(response) {
            resolve(response.data);
        });
    });
};
getListeEncaissment = (numUrg) => {
    return promise = new Promise(function(resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.ClFactures}/${Ressources.GetListeEncaissment}?numUrg=${numUrg}`).then(function(response) {
            resolve(response.data);
        });
    });
};
addEncaissement = (obj) => {
    axios.post(`${Ressources.CoreUrl}/${Ressources.RegUrgs}/${Ressources.AddEncaissementPatient}`, obj).then(function(response) {
        toastr['success']('L\'action est effectuée !');
        resolve(response.data);
    });
};
clotureSession = (obj) => {
    axios.post(`${Ressources.CoreUrl}/${Ressources.RegUrgs}/${Ressources.CloturerSession}`, obj).then(function(response) {
        toastr['success']('L\'action est effectuée !');
        resolve(response.data);
    });
};
prepareModal = () => {
    let promise_dossier = getDossier();
    let promise_urgence = getListePatientUrgNonCloturer();
    Promise.all([promise_dossier, promise_urgence]).then((values) => {
        data_dossier = values[0];
        data_urgence = values[1];

        initModals();
    });
};
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