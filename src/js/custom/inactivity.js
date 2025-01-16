if (inactivity) {
    let timeoutInMiliseconds = inactivityTimeoutMinutes * 60000;
    let timeoutId;

    resetTimer = () => {
        window.clearTimeout(timeoutId);
        startTimer();
    };

    startTimer = () => {
        // window.setTimeout returns an Id that can be used to start and stop a timer
        timeoutId = window.setTimeout(doInactive, timeoutInMiliseconds)
    };

    doInactive = () => {
        // does whatever you need it to actually do - probably signs them out or stops polling the server for info
        if (!window.location.pathname.includes('page_locked')) {
            let timerInterval;
            let exitCode = 0;
            Swal.fire(
                {
                    title: "Expiration de session !",
                    backdrop: true,
                    html: "Votre session sera déconnectée dans <strong></strong> secondes.<br/><br/>" +
                        '<button id="remainConnected" class="btn btn-primary">' +
                        "Rester connecté" +
                        "</button>",
                    timer: 15000,
                    onBeforeOpen: function onBeforeOpen() {
                        var content = Swal.getContent();
                        var $ = content.querySelector.bind(content);
                        var remainConnected = $("#remainConnected");
                        Swal.showLoading();

                        remainConnected.addEventListener("click", function () {
                            clearInterval(timerInterval);
                            exitCode = 1;
                            Swal.close();
                        });
                        timerInterval = setInterval(function () {
                            Swal.getContent().querySelector("strong").textContent = (
                                Swal.getTimerLeft() / 1000
                            ).toFixed(0);
                        }, 100);
                    },
                    onClose: function onClose() {
                        if (exitCode === 0)
                            window.location.replace("./page_locked.html");
                    }
                });
        }
    };

    setupTimers = () => {
        document.addEventListener("mousemove", resetTimer, false);
        document.addEventListener("mousedown", resetTimer, false);
        document.addEventListener("keypress", resetTimer, false);
        document.addEventListener("touchmove", resetTimer, false);

        startTimer();
    };

    setupTimers();
}
