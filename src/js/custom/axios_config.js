let user = JSON.parse(sessionStorage.getItem('user'));

axios.defaults.withCredentials = false;
axios.defaults.responseType = 'json';
axios.defaults.headers.common['Accept-Language'] = 'fr';

if (user) {
    axios.defaults.headers.common['Authorization'] = user.token;
    axios.defaults.headers.common['x-auth-token'] = user.token;
}

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.headers.put['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.headers.delete['Content-Type'] = 'application/json;charset=UTF-8';

axios.interceptors.response.use(function(response) {
    console.log('%c✔ Axios response ', 'color: #1dc9b7', {
        method: response.config.method,
        url: response.config.url,
        status: response.status,
    });

    return response;
}, function(error) {
    console.log('%c⚠ Axios error ' + error, 'color: #fd3995');

    toastr['error']("L'action n'est pas effectuée !");

    initApp.playSound('./media/sound/', 'voice_alert');

    return Promise.reject(error);
});

const styles = [
    'border: 1px solid #3E0E02',
    'color: white',
    'padding: 20px',
    'background: -webkit-linear-gradient(#61045f, #aa076b)',
    'font-size: 1.5rem',
    'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)',
    'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset',
    'line-height: 40px',
    'text-align: center',
    'font-weight: bold',
    'animation: anim 5s infinite;',
].join(';');
console.log('%c ' + 'CliniSys', styles);
