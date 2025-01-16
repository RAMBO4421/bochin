let appel_en_cours = null;
let VOIP_dropdown = $('#VOIP_dropdown');

VOIP_dropdown.on('click', function(e) {
    if (appel_en_cours === null)
        openVOIP('html', 'out', '');
    else
        openVOIP('html', 'in', appel_en_cours);
});

VOIP_dropdown.parent('div').on('hide.bs.dropdown', function(e) {
    if (e.clickEvent) {
        e.preventDefault();
    }
});

$('.voip_numpad').on('click', function(e) {
    let value = this.value;
    $('#voip_number').val(function(index, val) {
        return val + value;
    });
});

$('.voip_numpad_backspace').on('click', function(e) {
    $('#voip_number').val(function(index, value) {
        return value.substr(0, value.length - 1);
    });
});
