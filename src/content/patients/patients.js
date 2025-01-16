/* Commons */
enteteModal = () => {
    $('.nom_patient').val(patientEnCours.patient);
    $('.num_urgence_patient').val(patientEnCours.numUrg);
    $('.num_dossier_patient').val(patientEnCours.dossier);
    $('.nom_medecin_patient').val(patientEnCours.medecin);
    $('.num_chmabre_patient').val(patientEnCours.numCha);
};
/* Commons */

/* Admission */
initModals = (values) => {
    let html_medecin = `<option value=''></option>`;
    for (element of values[0]) {
        html_medecin += `<option value="${element.codMed}">${element.nomMed}</option>`;
    }
    $('#medecin_patient').html(html_medecin).select2({
        dropdownParent: $('#modalAjoutPatients'),
        placeholder: 'Sélectionner un médecin',
        width: 'resolve',
        allowClear: true,
    });

    let html_dossier = `<option value=''></option>`;
    for (element of values[1]) {
        html_dossier += `<option value="${element.numDoss}">${element.numDoss} || ${element.nomCli}</option>`;
    }
    $('#numdoss_patient').html(html_dossier).select2({
        dropdownParent: $('#modalAjoutPatients'),
        placeholder: 'Sélectionner un dossier',
        width: 'resolve',
        allowClear: true,
    });
};
getDossier = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Clients}/${Ressources.GetListeDossier}`).then(function (response) {
            resolve(response.data);
        });
    });
};
postAdmission = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.PatientUrgs}/${Ressources.AddPatientUrg}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};


/* Admission */

/* Patients */
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
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/Banques`, obj).then(function (response) {
            resolve(response.data);
        });
    });
};
getColumns = () => {
    return columnsSet = [
        {
            title: 'matban',
            data: 'matban',
        },
        {
            title: 'desban',
            data: 'desban',
        }
    ];
};
drawDatatables = (data) => {
    createDataTables(obj = {
        element: '#dt-patients',
        data: data,
        columns: getColumns(),
        columnFilter: true,
        order: [0, 'desc'],
        header: false,
    });
};
refreshDatatables = () => {
    $('#example-modal-alert').show();
    getData(getCurrentFilters()).then(function (value) {
        let table = $('#dt-patients').DataTable();
        table.clear().draw();
        table.rows.add(value);
        table.columns.adjust().draw();
        $('#example-modal-alert').hide();
    }).catch(function (value) {
        $('#example-modal-alert').hide();
    });
};
bindEvents = () => {
    $('#dt-patients .actionsBtn').off('click').on('click', function (e) {
        $('#example-modal-alert').show();
        let title;
        let btnAjouterService = $('#ajouter_service');
        let btnValider = $('#valider_affectation');
        let btnSupprimer = $('#supprimer_affectation');
        let role = $(this).attr('role');
        let row = $(this).parents('tr');
        let table = $('#dt-patients').DataTable();
        patientEnCours = table.row(row).data();

        btnValider.hide();
        btnSupprimer.hide();
        btnAjouterService.hide();
        $('.listAdd').css('visibility', 'hidden');
        $('.tab-pane.active').removeClass('active').removeClass('show');

        switch (role) {
            case 'soins':
                title = 'Ajouter Soins';
                drawSoinsUrgDatatables().then(function (value) {
                    $('#tab_default-6').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'honoraires':
                title = 'Ajouter Honoraires';
                drawHonorairesDatatables().then(function (value) {
                    $('#tab_default-2').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'pharmacie':
                title = 'Ajouter Pharmacie';
                drawPharmacieDatatables().then(function (value) {
                    $('#tab_default-1').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'consult':
                title = 'Consultation';
                break;
            case 'delete':
                title = 'Suppression';
                btnSupprimer.show();
                break;
        }

        enteteModal();
        $('#modalAffectationPatients .modal-title').text(title);
        $('#modalAffectationPatients').modal();
    });

    $('.btn-delete-new-service').off('click').on('click', function (e) {
        let row = $(this).parents('tr');
        let table = $(this).parents('.dataTable').DataTable();
        table.row(row).remove().draw();
    });

    $('#ajouter_service').off('click').on('click', function (e) {
        let activeTable = $('.tab-pane.active .dataTable');
        let activeTAB = $('.tab-pane.active').attr('index');
        $('#qte_reference').parent('div').hide();
        $('#montant_honoraire_reference').parent('div').hide();
        $('#prixUnit_pharmacie_reference').parents('.form-group').hide();
        $('#prixHT_reference').parents('.form-group').hide();
        let title = '';
        let html_reference;

        switch (activeTAB) {
            case '1': // Pharmacie
                title = 'Ajouter Pharmacie';
                html_reference = `<option value=''></option>`;
                for (element of data_pharmacie) {
                    html_reference += `<option value="${element.codart}">${element.codart} || ${element.desart}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_pharmacie.filter(item => item.codart === e.params.data.id)[0];
                    $('#qte_reference').attr('designation', data.desart).val(1).focus();
                    $('#prixUnit_pharmacie_reference').val(data.priuni);
                    $('#qte_pharmacie_reference').val(data.quantite);

                });

                $('#qte_reference').parent('div').show();
                $('#prixUnit_pharmacie_reference').parents('.form-group').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codart: $('#select_reference').val(),
                        desart: $('#qte_reference').attr('designation'),
                        quantite: $('#qte_reference').val(),
                        priuni: $('#qte_reference').val() * $('#prixUnit_pharmacie_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });

                break;
            case '2': // Honoraires
                title = 'Ajouter Honoraires';
                html_reference = `<option value=''></option>`;
                for (element of data_honoraires) {
                    html_reference += `<option value="${element.codMed}">${element.codMed} || ${element.nomMed}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_honoraires.filter(item => item.codMed === e.params.data.id)[0];
                    $('#montant_honoraire_reference').attr('designation', data.nomMed).val('').focus();
                });

                $('#montant_honoraire_reference').parent('div').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codMed: $('#select_reference').val(),
                        nomMed: $('#montant_honoraire_reference').attr('designation'),
                        montant: $('#montant_honoraire_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });
                break;
            case '3': // Réserve
                title = 'Ajouter Réserve';
                break;
            case '4': // Prestations
                title = 'Ajouter Prestations';
                html_reference = `<option value=''></option>`;
                for (element of data_prestations) {
                    html_reference += `<option value="${element.numSer}">${element.numSer} || ${element.desSer}</option>`;
                }

                break;
            case '5': // Extras
                title = 'Ajouter Extras';
                html_reference = `<option value=''></option>`;
                for (element of data_extras) {
                    html_reference += `<option value="${element.numSer}">${element.numSer} || ${element.desSer}</option>`;
                }
                break;
            case '6': // Soins
                title = 'Ajouter Soins';
                html_reference = `<option value=''></option>`;
                for (element of data_soins) {
                    html_reference += `<option value="${element.numSoin}">${element.numSoin} || ${element.desSoin}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_soins.filter(item => item.numSoin === e.params.data.id)[0];
                    $('#qte_reference').attr('designation', data.desSoin).val(1).focus();
                    $('#prixHT_reference').val(data.priSoin);
                    $('#tauxTVA_reference').val(data.tvaSoin);
                    $('#mnt_reference').val(data.priTva);
                    $('#mntTTC_reference').val(data.priTTC);
                });

                $('#qte_reference').parent('div').show();
                $('#prixHT_reference').parents('.form-group').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codSoins: $('#select_reference').val(),
                        desSoin: $('#qte_reference').attr('designation'),
                        qte: $('#qte_reference').val(),
                        prixSoins: $('#qte_reference').val() * $('#mntTTC_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });

                break;
        }

        enteteModal();
        $('#modalAjoutService .modal-title').text(title);
        $('#modalAjoutService').modal('show');
    });

    // $('#valider_nouvelle_admission').off('click').on('click', function (e) {
    //     $('#example-modal-alert').show();
    //     let patient = $('#nom_patient').val();
    //     let dateNaissance = dateFormatter($('#datNai_patient').val(), 2);
    //     let cin = $('#cin_patient').val();
    //     let medecin = $('#medecin_patient').val();
    //     let dossier = $('#numdoss_patient').val();

    //     if (patient && dateNaissance && cin && medecin && dossier && patient !== '' && dateNaissance !== '' && cin !== '' && medecin !== '' &&
    //         dossier !== '') {
    //         let obj = {
    //             'nomCli': patient,
    //             'datNaiss': luxon.DateTime.fromFormat(dateNaissance, 'dd/MM/yyyy').toISO(),
    //             'numCin': cin,
    //             'medUrg': medecin,
    //             'numDoss': dossier,
    //             'cloturer': false,
    //         };

    //         postAdmission(obj).then(function (value) {
    //             $('#modalAjoutPatients').modal('hide');
    //             refreshDatatables();
    //         }).catch(function (value) {
    //             $('#example-modal-alert').hide();
    //         });
    //     } else {
    //         toastr['error']('Veuillez vérifier les champs vides !');
    //         $('#example-modal-alert').hide();
    //     }
    // });

    $('#valider_affectation').off('click').on('click', function (e) {
        $('#example-modal-alert').show();
        let activeTable = $('.tab-pane.active .dataTable');
        let activeTAB = $('.tab-pane.active').attr('index');
        let table = activeTable.DataTable();
        let data = table.rows().data().toArray();
        let newData = data.filter(item => item.typeAjout === 'new');

        switch (activeTAB) {
            case '1': // Pharmacie
                AddPharmacie({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_QuittanceMvtSto: newData,
                }).then(function (value) {
                    drawPharmacieDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;

            case '2': // Honoraires
                addHonoraires({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_QuittanceHon: newData,
                }).then(function (value) {
                    drawHonorairesDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;

            case '6': // Soins
                addSoinsUrg({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_soin: newData,
                }).then(function (value) {
                    drawSoinsUrgDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
        }
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

    $('[name=cloture_checkbox]').off('click').on('click', function (e) {
        $('[name=cloture_checkbox]').removeAttr('checked');
        $(this).attr('checked', '');

        if ($(this).val() === 'true')
            $('#_date_debut1, #_date_fin1').removeAttr('disabled', 'disabled');
        else if ($(this).val() === 'false')
            $('#_date_debut1, #_date_fin1').attr('disabled', 'disabled');
    });

    $('#btn_search').off('click').on('click', function (e) {
        refreshDatatables();
    });

    $('#add_admission').off('click').on('click', function (e) {
        let modal = $('#modalAjoutPatients');
        modal.modal('show');
    });

    $('#refresh_admission').off('click').on('click', function (e) {
        refreshDatatables();
    });
};
/* Patients */

/* Soins Urgence */
getSoins = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Soins}/${Ressources.GetListeSoins}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeSoinsUrgByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.SoinsUrgs}/${Ressources.GetListeSoinsUrg}?numUrg=${numUrg}`).then(function (response) {
            resolve(response.data);
        });
    });
};
drawSoinsUrgDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeSoinsUrgByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-6`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codSoins',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'desSoin',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Quantité',
                        data: 'qte',
                        width: '10%',
                    },
                    {
                        title: 'Montant',
                        data: 'prixSoins',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codSoins',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                    <i class="fal fa-times"></i> 
                                    </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [4, 'desc'],
            });
            resolve(true);
        });
    });
};
addSoinsUrg = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.SoinsUrgs}/${Ressources.AddSoinsUrg}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Soins Urgence */

/* Honoraires */
getMedecin = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Medecins}/${Ressources.GetListeMedecin}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeQuittanceHonoraireByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.QuittanceHonoraires}/${Ressources.GetListeQuittanceHonoraire}?numUrg=${numUrg}`).
            then(function (response) {
                resolve(response.data);
            });
    });
};
drawHonorairesDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeQuittanceHonoraireByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-2`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codMed',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'nomMed',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Montant',
                        data: 'montant',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codMed',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                    <i class="fal fa-times"></i> 
                                    </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [3, 'desc'],
            });
            resolve(true);
        });
    });
};
addHonoraires = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.QuittanceHonoraires}/${Ressources.AddQuittanceHonoraire}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Honoraires */

/* Pharmacie */
getListeStocks = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.GetListeStocksCentrale}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeStocksByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.GetListeQuittancePharmacieCentrale}?numUrg=${numUrg}`).
            then(function (response) {
                resolve(response.data);
            });
    });
};
drawPharmacieDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeStocksByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-1`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codart',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'desart',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Quantité',
                        data: 'quantite',
                        width: '10%',
                    },
                    {
                        title: 'Montant',
                        data: 'priuni',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codart',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                        <i class="fal fa-times"></i> 
                                        </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [4, 'desc'],
            });
            resolve(true);
        });
    });
};
AddPharmacie = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.AddQuittancePharmacieCentrale}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Pharmacie */

/* Extras */
getExtras = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Services}/${Ressources.extras}`).then(function (response) {
            resolve(response.data);
        });
    });
};
/* Extras */

/* Prestations */
getPrestations = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Services}/${Ressources.prestations}`).then(function (response) {
            resolve(response.data);
        });
    });
};
/* Prestations */
/* Commons */
enteteModal = () => {
    $('.nom_patient').val(patientEnCours.patient);
    $('.num_urgence_patient').val(patientEnCours.numUrg);
    $('.num_dossier_patient').val(patientEnCours.dossier);
    $('.nom_medecin_patient').val(patientEnCours.medecin);
    $('.num_chmabre_patient').val(patientEnCours.numCha);
};
/* Commons */

/* Admission */
initModals = (values) => {
    let html_medecin = `<option value=''></option>`;
    for (element of values[0]) {
        html_medecin += `<option value="${element.codMed}">${element.nomMed}</option>`;
    }
    $('#medecin_patient').html(html_medecin).select2({
        dropdownParent: $('#modalAjoutPatients'),
        placeholder: 'Sélectionner un médecin',
        width: 'resolve',
        allowClear: true,
    });

    let html_dossier = `<option value=''></option>`;
    for (element of values[1]) {
        html_dossier += `<option value="${element.numDoss}">${element.numDoss} || ${element.nomCli}</option>`;
    }
    $('#numdoss_patient').html(html_dossier).select2({
        dropdownParent: $('#modalAjoutPatients'),
        placeholder: 'Sélectionner un dossier',
        width: 'resolve',
        allowClear: true,
    });
};
getDossier = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Clients}/${Ressources.GetListeDossier}`).then(function (response) {
            resolve(response.data);
        });
    });
};
postAdmissionPatient = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        console.log("test50",obj)
        axios.post(`${Ressources.CoreUrl}/Banques`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
deleteAdmission = (matban) => {
    return new Promise((resolve, reject) => {
        const url = `${Ressources.CoreUrl}/Banques/${matban}`;
        axios.delete(url)
            .then((response) => {
                toastr['success']("La suppression a été effectuée !");
                resolve(response.data);
            })
            .catch((error) => {
                toastr['error']("Échec de la suppression !");
                reject(error);
            });
    });
};

modifyAdmission = (matban, updatedObj) => {
    console.log("test", matban, updatedObj)
    return new Promise((resolve, reject) => {
        axios.put(`${Ressources.CoreUrl}/Banques/${matban}`, updatedObj)
            .then((response) => {
                console.log("response", response);
                toastr['success']("La modification a été effectuée !");
                resolve(response.data);
            })
            .catch((error) => {
                console.error("Error during modification:", error.response);
                toastr['error'](error.response?.data?.message || "Échec de la modification !");
                reject(error);
            });
    });
};

/* Admission */

/* Patients */
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
        status: getStatus(),
    };
};
getData = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/Banques`, obj).then(function (response) {
            resolve(response.data);
        });
    });
};
getColumns = () => {
    return columnsSet = [
        {
            title: 'matban',
            data: 'matban',
        },
        {
            title: 'desban',
            data: 'desban',
        }
    ];
};
drawDatatables = (data) => {
    createDataTables(obj = {
        element: '#dt-patients',
        data: data,
        columns: getColumns(),
        columnFilter: true,
        order: [0, 'desc'],
        header: false,
    });
};
refreshDatatables = () => {
    $('#example-modal-alert').show();
    getData(getCurrentFilters()).then(function (value) {
        let table = $('#dt-patients').DataTable();
        table.clear().draw();
        table.rows.add(value);
        table.columns.adjust().draw();
        $('#example-modal-alert').hide();
    }).catch(function (value) {
        $('#example-modal-alert').hide();
    });
};
bindEvents = () => {
    $('#dt-patients .actionsBtn').off('click').on('click', function (e) {
        $('#example-modal-alert').show();
        let title;
        let btnAjouterService = $('#ajouter_service');
        let btnValider = $('#valider_affectation');
        let btnSupprimer = $('#supprimer_affectation');
        let role = $(this).attr('role');
        let row = $(this).parents('tr');
        let table = $('#dt-patients').DataTable();
        patientEnCours = table.row(row).data();

        btnValider.hide();
        btnSupprimer.hide();
        btnAjouterService.hide();
        $('.listAdd').css('visibility', 'hidden');
        $('.tab-pane.active').removeClass('active').removeClass('show');

        switch (role) {
            case 'soins':
                title = 'Ajouter Soins';
                drawSoinsUrgDatatables().then(function (value) {
                    $('#tab_default-6').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'honoraires':
                title = 'Ajouter Honoraires';
                drawHonorairesDatatables().then(function (value) {
                    $('#tab_default-2').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'pharmacie':
                title = 'Ajouter Pharmacie';
                drawPharmacieDatatables().then(function (value) {
                    $('#tab_default-1').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'consult':
                title = 'Consultation';
                break;
            case 'delete':
                title = 'Suppression';
                btnSupprimer.show();
                break;
        }

        enteteModal();
        $('#modalAffectationPatients .modal-title').text(title);
        $('#modalAffectationPatients').modal();
    });

    $('.btn-delete-new-service').off('click').on('click', function (e) {
        let row = $(this).parents('tr');
        let table = $(this).parents('.dataTable').DataTable();
        table.row(row).remove().draw();
    });

    $('#ajouter_service').off('click').on('click', function (e) {
        let activeTable = $('.tab-pane.active .dataTable');
        let activeTAB = $('.tab-pane.active').attr('index');
        $('#qte_reference').parent('div').hide();
        $('#montant_honoraire_reference').parent('div').hide();
        $('#prixUnit_pharmacie_reference').parents('.form-group').hide();
        $('#prixHT_reference').parents('.form-group').hide();
        let title = '';
        let html_reference;

        switch (activeTAB) {
            case '1': // Pharmacie
                title = 'Ajouter Pharmacie';
                html_reference = `<option value=''></option>`;
                for (element of data_pharmacie) {
                    html_reference += `<option value="${element.codart}">${element.codart} || ${element.desart}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_pharmacie.filter(item => item.codart === e.params.data.id)[0];
                    $('#qte_reference').attr('designation', data.desart).val(1).focus();
                    $('#prixUnit_pharmacie_reference').val(data.priuni);
                    $('#qte_pharmacie_reference').val(data.quantite);

                });

                $('#qte_reference').parent('div').show();
                $('#prixUnit_pharmacie_reference').parents('.form-group').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codart: $('#select_reference').val(),
                        desart: $('#qte_reference').attr('designation'),
                        quantite: $('#qte_reference').val(),
                        priuni: $('#qte_reference').val() * $('#prixUnit_pharmacie_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });

                break;
            case '2': // Honoraires
                title = 'Ajouter Honoraires';
                html_reference = `<option value=''></option>`;
                for (element of data_honoraires) {
                    html_reference += `<option value="${element.codMed}">${element.codMed} || ${element.nomMed}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_honoraires.filter(item => item.codMed === e.params.data.id)[0];
                    $('#montant_honoraire_reference').attr('designation', data.nomMed).val('').focus();
                });

                $('#montant_honoraire_reference').parent('div').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codMed: $('#select_reference').val(),
                        nomMed: $('#montant_honoraire_reference').attr('designation'),
                        montant: $('#montant_honoraire_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });
                break;
            case '3': // Réserve
                title = 'Ajouter Réserve';
                break;
            case '4': // Prestations
                title = 'Ajouter Prestations';
                html_reference = `<option value=''></option>`;
                for (element of data_prestations) {
                    html_reference += `<option value="${element.numSer}">${element.numSer} || ${element.desSer}</option>`;
                }

                break;
            case '5': // Extras
                title = 'Ajouter Extras';
                html_reference = `<option value=''></option>`;
                for (element of data_extras) {
                    html_reference += `<option value="${element.numSer}">${element.numSer} || ${element.desSer}</option>`;
                }
                break;
            case '6': // Soins
                title = 'Ajouter Soins';
                html_reference = `<option value=''></option>`;
                for (element of data_soins) {
                    html_reference += `<option value="${element.numSoin}">${element.numSoin} || ${element.desSoin}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_soins.filter(item => item.numSoin === e.params.data.id)[0];
                    $('#qte_reference').attr('designation', data.desSoin).val(1).focus();
                    $('#prixHT_reference').val(data.priSoin);
                    $('#tauxTVA_reference').val(data.tvaSoin);
                    $('#mnt_reference').val(data.priTva);
                    $('#mntTTC_reference').val(data.priTTC);
                });

                $('#qte_reference').parent('div').show();
                $('#prixHT_reference').parents('.form-group').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codSoins: $('#select_reference').val(),
                        desSoin: $('#qte_reference').attr('designation'),
                        qte: $('#qte_reference').val(),
                        prixSoins: $('#qte_reference').val() * $('#mntTTC_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });

                break;
        }

        enteteModal();
        $('#modalAjoutService .modal-title').text(title);
        $('#modalAjoutService').modal('show');
    });

    // $('#valider_nouvelle_admission').off('click').on('click', function (e) {
    //     $('#example-modal-alert').show();
    //     let matricule = $('#matricule').val();
    //     let designation = $('#designation').val();
    //     let etat = $('#etat').val();



    //     if (matricule && designation && etat && matricule !== '' && designation !== '' && etat !== 'etat') {
    //         let obj = {
    //             "matban": matricule,
    //             "desban": designation,
    //             "status": etat
    //         };

    //         postAdmission(obj).then(function (value) {
    //             $('#modalAjoutPatients').modal('hide');
    //             refreshDatatables();
    //         }).catch(function (value) {
    //             $('#example-modal-alert').hide();
    //         });
    //     } else {
    //         toastr['error']('Veuillez vérifier les champs vides !');
    //         $('#example-modal-alert').hide();
    //     }
    // });

    $('#valider_affectation').off('click').on('click', function (e) {
        $('#example-modal-alert').show();
        let activeTable = $('.tab-pane.active .dataTable');
        let activeTAB = $('.tab-pane.active').attr('index');
        let table = activeTable.DataTable();
        let data = table.rows().data().toArray();
        let newData = data.filter(item => item.typeAjout === 'new');

        switch (activeTAB) {
            case '1': // Pharmacie
                AddPharmacie({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_QuittanceMvtSto: newData,
                }).then(function (value) {
                    drawPharmacieDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;

            case '2': // Honoraires
                addHonoraires({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_QuittanceHon: newData,
                }).then(function (value) {
                    drawHonorairesDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;

            case '6': // Soins
                addSoinsUrg({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_soin: newData,
                }).then(function (value) {
                    drawSoinsUrgDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
        }
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

    $('[name=cloture_checkbox]').off('click').on('click', function (e) {
        $('[name=cloture_checkbox]').removeAttr('checked');
        $(this).attr('checked', '');

        if ($(this).val() === 'true')
            $('#_date_debut1, #_date_fin1').removeAttr('disabled', 'disabled');
        else if ($(this).val() === 'false')
            $('#_date_debut1, #_date_fin1').attr('disabled', 'disabled');
    });

    $('#btn_search').off('click').on('click', function (e) {
        refreshDatatables();
    });

    $('#add_admission').off('click').on('click', function (e) {
        let modal = $('#modalAjoutPatients');
        modal.modal('show');

    });

    $('#refresh_admission').off('click').on('click', function (e) {
        refreshDatatables();
    });
};
/* Patients */

/* Soins Urgence */
getSoins = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Soins}/${Ressources.GetListeSoins}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeSoinsUrgByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.SoinsUrgs}/${Ressources.GetListeSoinsUrg}?numUrg=${numUrg}`).then(function (response) {
            resolve(response.data);
        });
    });
};
drawSoinsUrgDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeSoinsUrgByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-6`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codSoins',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'desSoin',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Quantité',
                        data: 'qte',
                        width: '10%',
                    },
                    {
                        title: 'Montant',
                        data: 'prixSoins',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codSoins',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                    <i class="fal fa-times"></i> 
                                    </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [4, 'desc'],
            });
            resolve(true);
        });
    });
};
addSoinsUrg = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.SoinsUrgs}/${Ressources.AddSoinsUrg}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Soins Urgence */

/* Honoraires */
getMedecin = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Medecins}/${Ressources.GetListeMedecin}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeQuittanceHonoraireByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.QuittanceHonoraires}/${Ressources.GetListeQuittanceHonoraire}?numUrg=${numUrg}`).
            then(function (response) {
                resolve(response.data);
            });
    });
};
drawHonorairesDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeQuittanceHonoraireByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-2`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codMed',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'nomMed',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Montant',
                        data: 'montant',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codMed',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                    <i class="fal fa-times"></i> 
                                    </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [3, 'desc'],
            });
            resolve(true);
        });
    });
};
addHonoraires = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.QuittanceHonoraires}/${Ressources.AddQuittanceHonoraire}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Honoraires */

/* Pharmacie */
getListeStocks = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.GetListeStocksCentrale}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeStocksByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.GetListeQuittancePharmacieCentrale}?numUrg=${numUrg}`).
            then(function (response) {
                resolve(response.data);
            });
    });
};
drawPharmacieDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeStocksByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-1`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codart',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'desart',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Quantité',
                        data: 'quantite',
                        width: '10%',
                    },
                    {
                        title: 'Montant',
                        data: 'priuni',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codart',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                        <i class="fal fa-times"></i> 
                                        </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [4, 'desc'],
            });
            resolve(true);
        });
    });
};
AddPharmacie = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.AddQuittancePharmacieCentrale}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Pharmacie */

/* Extras */
getExtras = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Services}/${Ressources.extras}`).then(function (response) {
            resolve(response.data);
        });
    });
};
/* Extras */

/* Prestations */
getPrestations = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Services}/${Ressources.prestations}`).then(function (response) {
            resolve(response.data);
        });
    });
};
/* Prestations */
/* Commons */
enteteModal = () => {
    $('.nom_patient').val(patientEnCours.patient);
    $('.num_urgence_patient').val(patientEnCours.numUrg);
    $('.num_dossier_patient').val(patientEnCours.dossier);
    $('.nom_medecin_patient').val(patientEnCours.medecin);
    $('.num_chmabre_patient').val(patientEnCours.numCha);
};
/* Commons */

/* Admission */
initModals = (values) => {
    let html_medecin = `<option value=''></option>`;
    for (element of values[0]) {
        html_medecin += `<option value="${element.codMed}">${element.nomMed}</option>`;
    }
    $('#medecin_patient').html(html_medecin).select2({
        dropdownParent: $('#modalAjoutPatients'),
        placeholder: 'Sélectionner un médecin',
        width: 'resolve',
        allowClear: true,
    });

    let html_dossier = `<option value=''></option>`;
    for (element of values[1]) {
        html_dossier += `<option value="${element.numDoss}">${element.numDoss} || ${element.nomCli}</option>`;
    }
    $('#numdoss_patient').html(html_dossier).select2({
        dropdownParent: $('#modalAjoutPatients'),
        placeholder: 'Sélectionner un dossier',
        width: 'resolve',
        allowClear: true,
    });
};
getDossier = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Clients}/${Ressources.GetListeDossier}`).then(function (response) {
            resolve(response.data);
        });
    });
};
// postAdmission = (obj) => {
//     return promise = new Promise(function (resolve, reject) {
//         console.log("objjjj", obj)
//         axios.post(`${Ressources.CoreUrl}/Banques`, obj).then(function (response) {
//             toastr['success']("L'action est effectuée !");
//             resolve(response.data);
//         }).catch(() => {
//             toastr['error']("Une erreur s'est produite lors de la suppression !");
//         });
//     });
// };
/* Admission */

/* Patients */
getStatus = () => {
    let actif = $('#actif')[0];
    let nonactif = $('#nonactif')[0];
    let status = null;
    $(document).ready(function () {
        $('#actif, #nonactif ,#tous').on('click', function () {
            refreshDatatables();
        });
    });
    if (actif && actif.checked) status = 'Actif';
    else if (nonactif && nonactif.checked) status = 'Non Actif';
    return status;
}
getMatban = () => {
    return $('#matban').val();
}
getDesban = () => {
    return $('#desban').val();
}
getCurrentFilters = () => {
    let search1 = $('#search-1').val();
    let search2 = $('#search-2').val();
    let search3 = $('#search-3').val();
    let etatCloture = $('[name=cloture_checkbox][checked]').val();
    let status = getStatus();


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
        nomCli: search1,
        status: status,
    };
};
getData = (obj) => {
    console.log("obj", obj);
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/Banques`, obj).then(function (response) {
            resolve(response.data);
        });
    });
};
getColumns = () => {
    return columnsSet = [
        {
            title: 'Matricule Banque',
            data: 'matban',
        },
        {
            title: 'Designation Banque',
            data: 'desban',
        }
        , {
            title: 'Etat',
            data: 'status',
        }
        ,
        {
            title: 'Actions',
            data: null,
            render: function (data, type, row) {
                return `
                    <button class="btn btn-sm btn-primary modifier-btn" data-matban="${row.matban}">
                        <i class="fal fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-matban="${row.matban}">
                        <i class="fal fa-trash"></i> Supprimer
                    </button>`;
            }
        }
    ];

};
let is_modify_add = "";
drawDatatables = (data) => {
    createDataTables(obj = {
        element: '#dt-patients',
        data: data,
        columns: getColumns(),
        columnFilter: true,
        order: [0, 'desc'],
        header: false,
    });
    $('.delete-btn').off('click').on('click', function () {
        const matban = $(this).data('matban');
        const row = $(this).closest('tr');
        const table = $(this).closest('.dataTable').DataTable();

        if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
            deleteAdmission(matban, table, row)
                .catch(() => {
                    toastr['error']("Une erreur s'est produite lors de la suppression !");
                });
        }
    });
    
    $('#valider_nouvelle_admission').off('click').on('click', function () {
        let matricule = $('#matricule').val();
        let designation = $('#designation').val();
        let etat = $('#etat').val();
        let updatedObj = {
            "matban": matricule,
            "desban": designation,
            "status": etat
        };
        if (is_modify_add == "modify") {
            if (designation && etat) {
                modifyAdmission(updatedObj.matban, updatedObj)
                    .then(() => {
                        $('#modalAjoutPatients').modal('hide');
                        refreshDatatables();
                    })
                    .catch(() => {
                        toastr['error']("Une erreur s'est produite lors de la modification !");
                    });
            } else {
                toastr['error']('Veuillez vérifier les champs vides !');
            }
        }
        console.log("ntastiw2",is_modify_add)
        if (is_modify_add == "add") {
            $('#example-modal-alert').show();
            let matricule = $('#matricule').val();
            let designation = $('#designation').val();
            let etat = $('#etat').val();
            console.log("messageeee")

            if (matricule && designation && etat && matricule !== '' && designation !== '' && etat !== 'etat') {
                let obj = {
                    "matban": matricule,
                    "desban": designation,
                    "status": etat
                };
                console.log("obj", obj)
                postAdmissionPatient(obj).then(function (value) {
                    $('#modalAjoutPatients').modal('hide');
                    refreshDatatables();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });
            } else {
                toastr['error']('Veuillez vérifier les champs vides !');
                $('#example-modal-alert').hide();
            }
        }
    });
    $('#dt-patients').on('click', '.modifier-btn', function () {
        is_modify_add = "modify"
        const row = $(this).closest('tr');
        const table = $('#dt-patients').DataTable();
        const data = table.row(row).data();

        $('#matricule').val(data.matban).prop('disabled', true);
        $('#designation').val(data.desban);
        $('#etat').val(data.status);

        $('#modalAjoutPatients').modal('show');
    });
    $('#dt-patients').on('click', '.delete-btn', function () {
        const matban = $(this).data('matban');
        const row = $(this).closest('tr');
        const table = $('#dt-patients').DataTable();

        if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
            deleteAdmission(matban)
                .then(() => {

                    table.row(row).remove().draw();
                })
                .catch(() => {
                    toastr['error']("Une erreur s'est produite lors de la suppression !");
                });
        }
    });


};
refreshDatatables = () => {
    $('#example-modal-alert').show();
    getData(getCurrentFilters()).then(function (value) {
        let status = getStatus()
        let matban = getMatban()
        let desban = getDesban()
        let conditions = new Map([
            ['matban', matban],
            ['desban', desban]
        ]);
        conditions.forEach((elValue, key) => {
            if (elValue === null || elValue === "") {
                conditions.delete(key);
            }
        });

        let result = [];
        let statusfiltered = value;
        if (status)
            statusfiltered = value.filter(el =>
                el.status == status
            )
        if (conditions.size === 0) {
            result = statusfiltered
        } else {
            result = statusfiltered.filter((el) => {
                let cond = true;
                conditions.forEach((elValue, key) => {

                    let validationStep = cond && (el[key].startsWith(elValue))
                    cond = validationStep
                })
                return cond
            })
        }

        let table = $('#dt-patients').DataTable();
        table.clear().draw();
        table.rows.add(result);
        table.columns.adjust().draw();
        $('#example-modal-alert').hide();
    }).catch(function (value) {
        $('#example-modal-alert').hide();
    });
};
bindEvents = () => {
    $('#dt-patients .actionsBtn').off('click').on('click', function (e) {
        $('#example-modal-alert').show();
        let title;
        let btnAjouterService = $('#ajouter_service');
        let btnValider = $('#valider_affectation');
        let btnSupprimer = $('#supprimer_affectation');
        let role = $(this).attr('role');
        let row = $(this).parents('tr');
        let table = $('#dt-patients').DataTable();
        patientEnCours = table.row(row).data();

        btnValider.hide();
        btnSupprimer.hide();
        btnAjouterService.hide();
        $('.listAdd').css('visibility', 'hidden');
        $('.tab-pane.active').removeClass('active').removeClass('show');

        switch (role) {
            case 'soins':
                title = 'Ajouter Soins';
                drawSoinsUrgDatatables().then(function (value) {
                    $('#tab_default-6').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'honoraires':
                title = 'Ajouter Honoraires';
                drawHonorairesDatatables().then(function (value) {
                    $('#tab_default-2').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'pharmacie':
                title = 'Ajouter Pharmacie';
                drawPharmacieDatatables().then(function (value) {
                    $('#tab_default-1').addClass('active').addClass('show');
                    btnAjouterService.show();
                    btnValider.show();
                    $('#example-modal-alert').hide();
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
            case 'consult':
                title = 'Consultation';
                break;
            case 'delete':
                title = 'Suppression';
                btnSupprimer.show();
                break;
        }

        enteteModal();
        $('#modalAffectationPatients .modal-title').text(title);
        $('#modalAffectationPatients').modal();
    });

    $('.btn-delete-new-service').off('click').on('click', function (e) {
        let row = $(this).parents('tr');
        let table = $(this).parents('.dataTable').DataTable();
        table.row(row).remove().draw();
    });

    $('#ajouter_service').off('click').on('click', function (e) {
        let activeTable = $('.tab-pane.active .dataTable');
        let activeTAB = $('.tab-pane.active').attr('index');
        $('#qte_reference').parent('div').hide();
        $('#montant_honoraire_reference').parent('div').hide();
        $('#prixUnit_pharmacie_reference').parents('.form-group').hide();
        $('#prixHT_reference').parents('.form-group').hide();
        let title = '';
        let html_reference;

        switch (activeTAB) {
            case '1': // Pharmacie
                title = 'Ajouter Pharmacie';
                html_reference = `<option value=''></option>`;
                for (element of data_pharmacie) {
                    html_reference += `<option value="${element.codart}">${element.codart} || ${element.desart}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_pharmacie.filter(item => item.codart === e.params.data.id)[0];
                    $('#qte_reference').attr('designation', data.desart).val(1).focus();
                    $('#prixUnit_pharmacie_reference').val(data.priuni);
                    $('#qte_pharmacie_reference').val(data.quantite);

                });

                $('#qte_reference').parent('div').show();
                $('#prixUnit_pharmacie_reference').parents('.form-group').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codart: $('#select_reference').val(),
                        desart: $('#qte_reference').attr('designation'),
                        quantite: $('#qte_reference').val(),
                        priuni: $('#qte_reference').val() * $('#prixUnit_pharmacie_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });

                break;
            case '2': // Honoraires
                title = 'Ajouter Honoraires';
                html_reference = `<option value=''></option>`;
                for (element of data_honoraires) {
                    html_reference += `<option value="${element.codMed}">${element.codMed} || ${element.nomMed}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_honoraires.filter(item => item.codMed === e.params.data.id)[0];
                    $('#montant_honoraire_reference').attr('designation', data.nomMed).val('').focus();
                });

                $('#montant_honoraire_reference').parent('div').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codMed: $('#select_reference').val(),
                        nomMed: $('#montant_honoraire_reference').attr('designation'),
                        montant: $('#montant_honoraire_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });
                break;
            case '3': // Réserve
                title = 'Ajouter Réserve';
                break;
            case '4': // Prestations
                title = 'Ajouter Prestations';
                html_reference = `<option value=''></option>`;
                for (element of data_prestations) {
                    html_reference += `<option value="${element.numSer}">${element.numSer} || ${element.desSer}</option>`;
                }

                break;
            case '5': // Extras
                title = 'Ajouter Extras';
                html_reference = `<option value=''></option>`;
                for (element of data_extras) {
                    html_reference += `<option value="${element.numSer}">${element.numSer} || ${element.desSer}</option>`;
                }
                break;
            case '6': // Soins
                title = 'Ajouter Soins';
                html_reference = `<option value=''></option>`;
                for (element of data_soins) {
                    html_reference += `<option value="${element.numSoin}">${element.numSoin} || ${element.desSoin}</option>`;
                }

                $('#select_reference').html(html_reference).select2({
                    dropdownParent: $('#modalAjoutService'),
                    placeholder: 'Sélectionnez une référence',
                    width: '100%',
                }).off('select2:select').on('select2:select', function (e) {
                    let data = data_soins.filter(item => item.numSoin === e.params.data.id)[0];
                    $('#qte_reference').attr('designation', data.desSoin).val(1).focus();
                    $('#prixHT_reference').val(data.priSoin);
                    $('#tauxTVA_reference').val(data.tvaSoin);
                    $('#mnt_reference').val(data.priTva);
                    $('#mntTTC_reference').val(data.priTTC);
                });

                $('#qte_reference').parent('div').show();
                $('#prixHT_reference').parents('.form-group').show();
                $('#valider_ajout_service').off('click').on('click', function (e) {
                    let obj = {
                        codSoins: $('#select_reference').val(),
                        desSoin: $('#qte_reference').attr('designation'),
                        qte: $('#qte_reference').val(),
                        prixSoins: $('#qte_reference').val() * $('#mntTTC_reference').val(),
                        typeAjout: 'new',
                    };

                    let table = activeTable.DataTable();
                    table.row.add(obj).draw(false);
                    $('#modalAjoutService').modal('hide');
                });

                break;
        }

        enteteModal();
        $('#modalAjoutService .modal-title').text(title);
        $('#modalAjoutService').modal('show');
    });
    // tagmira 1
    // const addnewline = () => {
    //     $('#valider_nouvelle_admission').off('click').on('click', function (e) {


    //     });
    // }



    $('#valider_affectation').off('click').on('click', function (e) {
        $('#example-modal-alert').show();
        let activeTable = $('.tab-pane.active .dataTable');
        let activeTAB = $('.tab-pane.active').attr('index');
        let table = activeTable.DataTable();
        let data = table.rows().data().toArray();
        let newData = data.filter(item => item.typeAjout === 'new');

        switch (activeTAB) {
            case '1': // Pharmacie
                AddPharmacie({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_QuittanceMvtSto: newData,
                }).then(function (value) {
                    drawPharmacieDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;

            case '2': // Honoraires
                addHonoraires({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_QuittanceHon: newData,
                }).then(function (value) {
                    drawHonorairesDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;

            case '6': // Soins
                addSoinsUrg({
                    numUrg: patientEnCours.numUrg,
                    numDoss: patientEnCours.dossier,
                    numCha: patientEnCours.numCha,
                    login: user.userName,
                    liste_soin: newData,
                }).then(function (value) {
                    drawSoinsUrgDatatables().then(function (value) {
                        $('#modalAffectationPatients').modal('hide');
                        $('#example-modal-alert').hide();
                    }).catch(function (value) {
                        $('#example-modal-alert').hide();
                    });
                }).catch(function (value) {
                    $('#example-modal-alert').hide();
                });

                break;
        }
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

    $('[name=cloture_checkbox]').off('click').on('click', function (e) {
        $('[name=cloture_checkbox]').removeAttr('checked');
        $(this).attr('checked', '');

        if ($(this).val() === 'true')
            $('#_date_debut1, #_date_fin1').removeAttr('disabled', 'disabled');
        else if ($(this).val() === 'false')
            $('#_date_debut1, #_date_fin1').attr('disabled', 'disabled');
    });

    $('#btn_search').off('click').on('click', function (e) {
        refreshDatatables();
    });

    $('#add_admission').off('click').on('click', function (e) {
        is_modify_add = "add"
        console.log("ntastiw",is_modify_add)
        let modal = $('#modalAjoutPatients');
        modal.modal('show');
        $('#matricule').prop('disabled', false);
    });

    $('#refresh_admission').off('click').on('click', function (e) {
        refreshDatatables();
    });
};
/* Patients */

/* Soins Urgence */
getSoins = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Soins}/${Ressources.GetListeSoins}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeSoinsUrgByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.SoinsUrgs}/${Ressources.GetListeSoinsUrg}?numUrg=${numUrg}`).then(function (response) {
            resolve(response.data);
        });
    });
};
drawSoinsUrgDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeSoinsUrgByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-6`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codSoins',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'desSoin',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Quantité',
                        data: 'qte',
                        width: '10%',
                    },
                    {
                        title: 'Montant',
                        data: 'prixSoins',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codSoins',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                    <i class="fal fa-times"></i> 
                                    </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [4, 'desc'],
            });
            resolve(true);
        });
    });
};
addSoinsUrg = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.SoinsUrgs}/${Ressources.AddSoinsUrg}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Soins Urgence */

/* Honoraires */
getMedecin = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Medecins}/${Ressources.GetListeMedecin}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeQuittanceHonoraireByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.QuittanceHonoraires}/${Ressources.GetListeQuittanceHonoraire}?numUrg=${numUrg}`).
            then(function (response) {
                resolve(response.data);
            });
    });
};
drawHonorairesDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeQuittanceHonoraireByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-2`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codMed',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'nomMed',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Montant',
                        data: 'montant',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codMed',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                    <i class="fal fa-times"></i> 
                                    </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [3, 'desc'],
            });
            resolve(true);
        });
    });
};
addHonoraires = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.QuittanceHonoraires}/${Ressources.AddQuittanceHonoraire}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Honoraires */

/* Pharmacie */
getListeStocks = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.GetListeStocksCentrale}`).then(function (response) {
            resolve(response.data);
        });
    });
};
getListeStocksByNumUrg = (numUrg) => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.GetListeQuittancePharmacieCentrale}?numUrg=${numUrg}`).
            then(function (response) {
                resolve(response.data);
            });
    });
};
drawPharmacieDatatables = () => {
    return promise = new Promise(function (resolve, reject) {
        getListeStocksByNumUrg(patientEnCours.numUrg).then(function (value) {
            createDataTables({
                element: `#dt-list-affectation-1`,
                data: value,
                columns: [
                    {
                        title: 'Code',
                        data: 'codart',
                        width: '10%',
                    },
                    {
                        title: 'Designation',
                        data: 'desart',
                        class: 'textToLeft',
                        width: '70%',
                    },
                    {
                        title: 'Quantité',
                        data: 'quantite',
                        width: '10%',
                    },
                    {
                        title: 'Montant',
                        data: 'priuni',
                        width: '10%',
                        render: $.fn.dataTable.render.number(',', '.', 3, '')
                    },
                    {
                        title: 'Actions',
                        data: 'codart',
                        render: function (data, type, full, meta) {
                            if (full.typeAjout === 'new')
                                return `<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 btn-delete-new-service" title="Supprimer">
                                        <i class="fal fa-times"></i> 
                                        </a>`;
                            else
                                return '';
                        },
                    },
                ],
                columnFilter: false,
                header: false,
                order: [4, 'desc'],
            });
            resolve(true);
        });
    });
};
AddPharmacie = (obj) => {
    return promise = new Promise(function (resolve, reject) {
        axios.post(`${Ressources.CoreUrl}/${Ressources.Stocks}/${Ressources.AddQuittancePharmacieCentrale}`, obj).then(function (response) {
            toastr['success']("L'action est effectuée !");
            resolve(response.data);
        });
    });
};
/* Pharmacie */

/* Extras */
getExtras = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Services}/${Ressources.extras}`).then(function (response) {
            resolve(response.data);
        });
    });
};
/* Extras */

/* Prestations */
getPrestations = () => {
    return promise = new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/${Ressources.Services}/${Ressources.prestations}`).then(function (response) {
            resolve(response.data);
        });
    });
};
/* Prestations */
if (JSON.parse(sessionStorage.getItem('user')) === null)
    window.location.replace('./page_login.html?v=' + new Date().getTime());

let patientEnCours = null;
let data_prestations, data_extras, data_reserve, data_pharmacie, data_honoraires, data_soins = [];





(function () {
    initPanels();

    initFilters();

    $('#example-modal-alert').show();
    let data = null;
    getData(getCurrentFilters()).then(function (value) {
        $('#example-modal-alert').hide();
        data = value;
        drawDatatables(value);

    });

    document.getElementById("filtrer").addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent the default page reload

        refreshDatatables()

    });


    // let promise_medecin = getMedecin();
    // let promise_dossier = getDossier();
    // let promise_prest = getPrestations();
    // let promise_extr = getExtras();
    // let promise_soins = getSoins();
    // let promise_pharmacie = getListeStocks();

    // Promise.all([promise_medecin, promise_dossier]).then((values) => {
    //     data_honoraires = values[0];
    //     initModals(values);
    // });

    // Promise.all([promise_prest, promise_extr, promise_soins, promise_pharmacie]).then((values) => {
    //     data_prestations = values[0];
    //     data_extras = values[1];
    //     data_reserve = values[0];
    //     data_pharmacie = values[3];
    //     data_soins = values[2];
    // });
})();