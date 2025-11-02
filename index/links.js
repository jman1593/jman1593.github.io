const altLinksEl = document.getElementById("alternate-links-container"),
    altLinksKeyEl = document.getElementById("alternate-links-key"),
    altLinks = [
        "shrikalyanika.org",
        "troop617.org",
        "guilinhotels.org",
        "givingisgold.org",
        "childrens-needs.info",
        "familyvalue.net",
        "wishlink.net",
        "betterlives.info",
        "itsmart.info",
        "mathcord.de.com",
        "mathgames.de.com",
        "unblockedmathgames.com",
        "colute.net",
        "chesstube.eu.com",
        "hateroll.com",
        "weakcatxp.github.io",
        "gametreexp.github.io",
        "mathcordxp.github.io",
        "jman1593.github.io",
        "mathcord.com",
    ];
altLinks.forEach(link => {
    const a = document.createElement("a");
    a.classList.add("alternate-link");
    a.href = "https://" + link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const linkText = document.createElement("span");
    linkText.textContent = link.replace(/^https?:\/\//, "");
    const statusDot = document.createElement("span");
    statusDot.classList.add("spinning-dot");
    statusDot.title = "Checking site availability...";
    a.appendChild(linkText);
    a.appendChild(statusDot);
    altLinksEl.appendChild(a);
    checkSiteStatus(link, statusDot);
});
async function pingSite(domain) {
    return new Promise(resolve => {
        const url = `https://${domain}/ads.txt?${Date.now()}`;
        let didTimeout = false;
        const timeout = setTimeout(() => {
            didTimeout = true;
            resolve(domain.endsWith("github.io") ? "unknown" : false);
        }, 5000);
        fetch(url, { mode: "cors" })
            .then(response => response.text())
            .then(text => {
                if (!didTimeout) {
                    clearTimeout(timeout);
                    domain.endsWith("github.io")
                        ? resolve("unknown")
                        : resolve(text.includes("f08c47fec0942fa0") ? true : false);
                }
            })
            .catch(() => {
                if (!didTimeout) {
                    clearTimeout(timeout);
                    resolve(domain.endsWith("github.io") ? "unknown" : false);
                }
            });
    });
}
async function checkSiteStatus(domain, statusDot, maxRetries = 2) {
    let retries = 0;
    let status = await pingSite(domain);
    while (status === false && retries < maxRetries) {
        retries++;
        status = await pingSite(domain);
    }
    statusDot.classList = "status-dot";
    if (status === true) {
        statusDot.style.backgroundColor = "var(--green)";
        statusDot.title = "Unblocked on this computer";
    } else if (status === "unknown") {
        statusDot.style.backgroundColor = "yellow";
        statusDot.title = "Unknown status (GitHub Pages)";
    } else {
        statusDot.style.backgroundColor = "var(--red)";
        statusDot.title = "Blocked on this computer";
    }
}