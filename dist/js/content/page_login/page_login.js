if (window.location.pathname.includes('page_locked')) {
    $('#fullName').html('');
    $('#userName').html(user.userName);
    $('#email').html(user.email);
} else {
    sessionStorage.setItem('user', JSON.stringify(null));
}

$('#login').on('click', function() {
    //Authentification
    let token;
    let username = $('#username').val();
    let password = $('#password').val();
    let access = {
        'passWord': password,
        'userName': username,
    };

    // getUser(access).then(function(value) {
    value = true;
    if (value) {
        let user = {
            userName: username,
            language: 'fr',
            timeZone: 'UTC+1',
            currency: 'TND',
            token: token,
        };
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location.replace('./patients.html?v=' + new Date().getTime());
    } else {
        toastr.clear();
        toastr['error']('Veuillez vérifier votre nom d\'utilisateur ou mot de passe !');
    }
});
//});

$('#login_locked').on('click', function() {
    let password = $('#password_locked').val();
    let access = {
        'passWord': password,
        'userName': user.userName,
    };

    //getUser(access).then(function(value) {
    value = true;
    if (value)
        window.location.replace('./patients.html?v=' + new Date().getTime());
    else {
        toastr.clear();
        toastr['error']('Veuillez vérifier votre nom d\'utilisateur ou mot de passe !');
    }
});
//})

function getUser(acess) {
    return new Promise(function(resolve, reject) {
        axios.post(`${backend_url}/AccessControls/authentification?login=${acess.userName}&pwd=${acess.passWord}`, acess).then(function(response) {
            resolve(response.data);
        });
    });
}