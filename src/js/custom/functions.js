changingLanguageAdditionalActions = (applang) => {
    loadDatatablesLanguage(applang).then(function (value) {
        dataTablesLang = value;
        user.language = applang;
        sessionStorage.setItem('user', JSON.stringify(user));
        drawDatatables();
    });
};

loadDatatablesLanguage = (applang) => {
    return new Promise(function (resolve, reject) {
        axios.get(`./media/data/${applang}-dataTables.json`).then(function (response) {
            resolve(response.data);
        });
    });
};

createDataTables = (obj) => {
    return  $(obj.element).DataTable({
        dom: obj.header === false
            ? '<\'row mb-3\'>' +
            '<\'row\'<\'col-sm-12\'tr>>' +
            '<\'row\'<\'col-sm-12 col-md-5\'i><\'col-sm-12 col-md-7\'p>>'
            : '<\'row mb-3\'<\'col-md-10 customFilters d-flex align-items-center justify-content-center\'><\'col-md-2 d-flex align-items-center justify-content-end\'B>>' +
            '<\'row\'<\'col-sm-12\'tr>>' +
            '<\'row\'<\'col-sm-12 col-md-5\'i><\'col-sm-12 col-md-7\'p>>',
        data: obj.data,
        columns: obj.columns,
        autoWidth: obj.autoWidth !== undefined ? obj.autoWidth : false,
        select: obj.select !== undefined ? obj.select : 'single',
        destroy: obj.destroy !== undefined ? obj.destroy : true,
        altEditor: obj.altEditor !== undefined ? obj.altEditor : false,
        responsive: obj.responsive !== undefined ? obj.responsive : true,
        language: dataTablesLang,
        buttons: obj.buttons,
        fixedHeader: obj.fixedHeader !== undefined ? obj.fixedHeader : false,
        orderCellsTop: obj.orderCellsTop !== undefined ? obj.orderCellsTop : true,
        deferRender: obj.deferRender !== undefined ? obj.deferRender : false,
        scrollY: obj.scrollY !== undefined ? obj.scrollY : '',
        scrollCollapse: obj.scrollCollapse !== undefined ? obj.scrollCollapse : false,
        scroller: obj.scroller !== undefined ? obj.scroller : false,
        paging: obj.paging !== undefined ? obj.paging : true,
        pageLength: obj.pageLength !== undefined ? obj.pageLength : 10,
        order: obj.order !== undefined ? obj.order : [0, 'asc'],
        drawCallback: function () {
            let api = this.api();
            api.columns.adjust();

            bindEvents();
        },
        initComplete: function() {
            if (obj.footerCallback) {
                $(`${obj.element} tfoot`).remove();
                $(`${obj.element}`)
                .append(`<tfoot>
                            <tr>
                                <th colspan="2" style="text-align:right">Total:</th>
                                <th></th>
                            </tr>
                        </tfoot>`);

                obj.footerCallback();
            }

            if (obj.columnFilter) {
                // Setup - add a text input to each footer cell
                $(`${obj.element} thead tr`).
                    addClass('bg-highlight').
                    clone(true).
                    find('th').
                    removeClass('sorting_asc sorting_desc sorting').
                    addClass('bg-highlight').
                    off('click').end().appendTo(`${obj.element} thead`);

                $(`${obj.element} thead tr:eq(1) th:not(:last)`).each(function(i) {
                    $(this).html(`<div column_index=${removeSpecialCharacters(obj.element)}-${i}></div>`);
                });

                this.api().columns().every(function() {
                    let column = this;

                    let select = $('<select class="select2"><option value=""></option></select>').
                        appendTo($('div[column_index=' + removeSpecialCharacters(obj.element) + '-' + column.index() + ']'));

                    let filterAttribut = column.settings()[0].aoColumns[column.index()].filterAttribut;
                    let typeColum = column.settings()[0].aoColumns[column.index()].type;
                    if (filterAttribut) {
                        let arr = [
                            ...new Set(column.data().reduce((a, b) => [...a, ...b], []).map(function(el) {
                                return el.utilisateur.nom;
                            }))];

                        for (const arrElement of arr) {
                            select.append('<option value="' + arrElement + '">' + arrElement + '</option>');
                        }

                        select.on('change', function() {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val(),
                            );

                            column.search(val ? '.*' + val + '.*' : '', true, false).draw();
                        });
                    } else {
                        let data = column.data();
                        if (typeColum === "date") {
                            data = column.data().map(function(el) {
                                return dateFormatter(el);
                            });
                        }

                        data.unique().sort().each(function(d, j) {
                            select.append('<option value="' + d + '">' + d + '</option>');
                        });

                        select.on('change', function() {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val(),
                            );

                            column.search(val ? '^' + val + '$' : '', true, false).draw();
                        });
                    }

                    let modal = $(`${obj.element}`).parents("div.modal");
                    if(modal.length > 0) {
                        select.select2({
                            placeholder: 'filtrer',
                            width: 'resolve',
                            allowClear: true,
                            dropdownAutoWidth: true,
                            dropdownParent: modal,
                        });
                    } else {
                        select.select2({
                            placeholder: 'filtrer',
                            width: 'resolve',
                            allowClear: true,
                            dropdownAutoWidth: true,
                        });
                    }
                });

                $(`${obj.element} thead tr:eq(1) th:last`).empty();
            }

            $(`${obj.element}`).find(".dataTables_empty").empty();

            $(`${obj.element}`).on('click', 'td.voip_call', function (e) {
                e.preventDefault();

                let table = $(`${obj.element}`).DataTable();
                let data = table.cell( this ).data();
                openVOIP('js','out', data)
            });
        },
    });
};

btnAddDataTables = (callback, btnLabel = 'Nouvelle Admission') => {
    // if (user.buttons.filter(item => window.location.pathname.includes(item.page) && item.actif === false && item.id === 'btn-add').length === 0)
        return {
            text: '<i class="' + myapp_config.appIconPrefix + ' fa-plus mr-1"></i> ' + btnLabel,
            name: 'add',
            className: 'btn-add btn-success btn-sm mr-1',
            action: function (e, dt, node, config) {
                if (callback)
                    callback();
            },
        };
};
btnExecuterDataTables =(callback, btnLabel = i18n.t('commons.execute'))=>{
    console.log("callback",callback)
    if (user.buttons.filter(item => window.location.pathname.includes(item.page) && item.actif === false && item.id === 'btn-execute').length === 0)
    return {
        text: '<i class="' + myapp_config.appIconPrefix + ' fa-paper-plane mr-1"></i> ' + btnLabel,
        name: 'execute',
        className: 'btn-execute btn-primary btn-sm mr-1',
        extend: 'selected',
        action: function (e, dt, node, config) {
            if (callback)
                callback();
        },
    };
}

btnRefreshDataTables = (table, idpriorite, btnLabel = 'Actualiser') => {
    // if (user.buttons.filter(item => window.location.pathname.includes(item.page) && item.actif === false && item.id === 'btn-refresh').length === 0)
        return {
            text: '<i class="' + myapp_config.appIconPrefix + ' fa-sync mr-1"></i> ' + btnLabel,
            name: 'refresh',
            className: 'btn-refresh btn-info btn-sm',
            action: function (e, dt, node, config) {
                if (table === "note")
                    drawDatatablesListNote(idpriorite)
                else
                    if (table === "tache")
                        drawDatatablesListTache(idpriorite)
                    else
                        if (table === "devis")
                            drawDatatablesListDevis(idpriorite)
                        else
                            refreshDatatables();
            },
        };
};

getClock = (element) => {
    let dt = luxon.DateTime.now();
    $(`#${element}`).html(dt.setLocale(user.language).toLocaleString(luxon.DateTime.DATETIME_FULL));
    refresh();
};

refresh = () => {
    setTimeout(function () {
        getClock('clock');
    }, 1000);
};

let formatDate = {
    1: 'dd/MM/yyyy à hh:mm',
    2: 'dd/MM/yyyy',
    3: 'yyyy-MM-dd',
};

dateFormatter = (date, codeFormat = 1) => {
    return date !== null ? luxon.DateTime.fromISO(date).toFormat(formatDate[codeFormat]) : '';
};

activateLang = (applang) => {
    $.i18n.init({
        resGetPath: 'media/data/__lng__.json',
        load: 'unspecific',
        fallbackLng: false,
        lng: applang,
    }, function (t) {
        $('[data-i18n]').i18n();
        // $('title').append(' ' + myapp_config.appName + ' v' + myapp_config.appVersion);
        $('[data-lang]').removeClass('active');
        $('#lang_' + applang).addClass('active');
    });
};

makeCurrentMenuActive = () => {
    let element = $('#js-nav-menu').find('li[href^="' + window.location.pathname.split('/')[1].replaceAll('_', '') + '"]');
    if (element.length > 0)
        element.addClass('active');
    else
        $('#js-nav-menu').
            find('a[path^="' + window.location.pathname.split('/')[1].replaceAll('_', '') + '"]').
            parents('ul').
            eq(0).
            parent('li').
            addClass('active');
};

InitailserSummernote = () => {
    $('.js-summernote').summernote({
        height: 200,
        tabsize: 2,
        placeholder: "Type here...",
        dialogsFade: true,
        toolbar: [
            ['style', ['style']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['fontsize', ['fontsize']],
            ['fontname', ['fontname']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ],
    });
}

drawButtonsActions = (consult=false,devis=false,note=false,tache=false) => {
    let htmlButtonInfo ="";
    let htmlButtonDevis ="";
    let htmlButtonNote ="";
    let htmlButtonTache ="";
    if(consult)
    htmlButtonInfo = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-secondary rounded-circle mr-1 consultBtn"  title="' +
        i18n.t('commons.consulter') + '" ><i class="fal fa-info"></i> </a>';
        if(devis)
        htmlButtonDevis = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-primary rounded-circle mr-1 devisBtn"  title="' +
            i18n.t('nav.devis') + '" ><i class="fal fa-file-invoice-dollar"></i> </a>';
            if(note)
            htmlButtonNote = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-success rounded-circle mr-1 noteBtn"  title="' +
                i18n.t('commons.note') + '" ><i class="fal fa-file-invoice-dollar"></i> </a>';
                if(tache)
                htmlButtonTache = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-info rounded-circle mr-1 tacheBtn"  title="' +
                    i18n.t('commons.tache') + '" ><i class="fal fa-file-invoice-dollar"></i> </a>';
    let htmlButtonEdit = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-warning rounded-circle mr-1 editBtn"  title="' +
        i18n.t('commons.editer') + '" ><i class="fal fa-edit"></i> </a>';
    let htmlButtonDelete = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 deleteBtn"  title="' +
        i18n.t('commons.supprimer') + '"><i class="fal fa-times"></i> </a>';
    return '\n\t\t\t\t\t\t\t' + htmlButtonInfo + '\n\t\t\t\t\t\t\t' + htmlButtonEdit + '\n\t\t\t\t\t\t\t' + htmlButtonDelete + '\n\t\t\t\t\t\t\t' + htmlButtonDevis + '\n\t\t\t\t\t\t\t' + htmlButtonNote + '\n\t\t\t\t\t\t\t' + htmlButtonTache;
};

AffichageUserCreate = (data) => {
    return  data.nom;
};

AffichageActif = (data) => {
    let isChecked = 'badge-danger';
    let labActif = i18n.t('Inactif');
    if (data) {
        isChecked = 'badge-success';
        labActif = i18n.t('Actif');
    }
    html = `<span class="badge ${isChecked} badge-pill">${labActif}</span>`;
    return html;
};

ValidateEmail = (mail) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
};

ValidateTel = (tel) => {
    return /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/.test(tel);
};

ValidateCode = (code) => {
    return /[A-Za-z]{3}/.test(code);
};

ValidateNumber = (code) => {
    return !/[-\.\,]/.test(code);
};

ValidateSigne = (code) => {
    return !/[-]/.test(code);
};

initPanels = () => {
    $('#js-page-content').smartPanel({
        sortable: false,
        buttonOrder: '%collapse% %fullscreen% %close%',
        customButton: false,
        closeButton: true,
        fullscreenButton: true,
        collapseButton: true,
        lockedButton: false,
        refreshButton: false,
        colorButton: false,
        resetButton: false,
    });

    $.fn.datepicker.dates.fr = {
        days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        daysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
        daysMin: ['d', 'l', 'ma', 'me', 'j', 'v', 's'],
        months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        monthsShort: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
        today: 'Aujourd\'hui',
        monthsTitle: 'Mois',
        clear: 'Effacer',
        weekStart: 1,
        format: 'dd/mm/yyyy',
    };
};

removeSpecialCharacters = (data) => {
    return data.replace(/[^a-zA-Z ]/g, "");
}

openVOIP = (origin , mode = 'out', phone_number) => {
    $('#voip_number').val('');

    if (origin === 'js')
        $("#VOIP_dropdown").dropdown('toggle');

    if (mode === 'in') {
        $('#out_call').hide();
        $('#in_call').show();
        $('#caller_name').html(appel_en_cours.name);
        $('#caller_number').html(appel_en_cours.number);
    } else if (mode === 'out') {
        $('#voip_number').val(phone_number);
        $('#in_call').hide();
        $('#out_call').show();
    }
};