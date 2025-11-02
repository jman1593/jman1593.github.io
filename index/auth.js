(function () {
    const allowedHosts = ["kiaca.org", "leatherheat.org", "miflipteaching.org"];
    if (!allowedHosts.includes(location.hostname)) return;

    const hasCookie = /(?:^|;\s*)secret_1583=1(?:;|$)/.test(document.cookie);
    if (!hasCookie) {
    location.replace("./");
    }
})();