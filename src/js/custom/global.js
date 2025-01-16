const inactivity = true;
const inactivityTimeoutMinutes = 15;
let dataTablesLang;
if (user) {
    $('#username').html(user.fullName);
    $('#email').html(user.email);
    activateLang(user.language);
    getClock('clock');
    makeCurrentMenuActive();
}

$('div.modal').on('hidden.bs.modal', function() {
    $(this).find('input[type=text],input[type=email],input[type=number],input[type=date]').val('');
    $(this).find('textarea').val('');
    $(this).find('select').val('');
    $(this).find('input[type=radio]:first').trigger("click");
    $(this).find('.select2').val(null).trigger('change');
    $(this).find(".dataTable").DataTable().clear().draw();
}).on('show.bs.modal', function() {
    // $(this).find('.tab-content div.active').removeClass('show').removeClass('active');
    // $(this).find('.tab-content div.tab-pane').first().addClass('show').addClass('active');
    // $(this).find('.panel-content ul.listAdd a.nav-link').removeClass('active');
    // $(this).find('.panel-content ul.listAdd a.nav-link').first().addClass('active');
    // $(this).find('.panel-content ul.alllIST a.nav-link').removeClass('active');
    // $(this).find('.panel-content ul.alllIST a.nav-link').first().addClass('active');
});

$('#logout-btn').off('click').on('click', function() {
    sessionStorage.clear();
});

$(".menu_soins").parents("li").eq(0).off('click').on('click', function() {
    if ($("#dt-patients tr.selected").length > 0)
        $("#dt-patients tr.selected .actionsBtn[role=soins]").trigger("click");
    else
        toastr['error']("Veuillez sélectionner un patient !");
});

$(".menu_honoraires").parents("li").eq(0).off('click').on('click', function() {
    if ($("#dt-patients tr.selected").length > 0)
        $("#dt-patients tr.selected .actionsBtn[role=honoraires]").trigger("click");
    else
        toastr['error']("Veuillez sélectionner un patient !");
});

$(".menu_pharmacie").parents("li").eq(0).off('click').on('click', function() {
    if ($("#dt-patients tr.selected").length > 0)
        $("#dt-patients tr.selected .actionsBtn[role=pharmacie]").trigger("click");
    else
        toastr['error']("Veuillez sélectionner un patient !");
});