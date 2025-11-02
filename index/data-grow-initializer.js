!(function () {
    window.growMe ||
        ((window.growMe = function (e) {
            window.growMe._.push(e);
        }),
        (window.growMe._ = []));
    var e = document.createElement("script");
    (e.type = "text/javascript"),
        (e.src = "https://faves.grow.me/main.js"),
        (e.defer = !0),
        e.setAttribute(
            "data-grow-faves-site-id",
            "U2l0ZTo3YjgwNWM2Ny1kNzYzLTQ2MjktODk3Yi00ZWQ3OWE3OThmYWM="
        );
    var t = document.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(e, t);
})();