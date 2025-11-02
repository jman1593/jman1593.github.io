import { fetchGameData } from "./index/gamehandler.js";
import { targetUrl } from "./appscript.js";
function getTierAndProgressFromXP(xp) {
    const baseXPNeeded = 50,
        increasePerTier = 200,
        exponentialMultiplier = 1.2,
        levelsPerTier = 5,
        capTier = 10;
    let level = 1,
        tier = 1,
        xpNeeded = baseXPNeeded;
    while (xp >= xpNeeded) {
        xp -= xpNeeded;
        if (tier < capTier) {
            if (level % levelsPerTier === 0) {
                tier++;
                xpNeeded = Math.round(xpNeeded * exponentialMultiplier);
            }
        } else {
            if (level % levelsPerTier === 0) {
                xpNeeded += increasePerTier;
            }
        }
        level++;
    }
    return { level, tier, currentXP: xp, xpNeededForNext: xpNeeded };
}

const numTopGames = 20;
const topGameList = document.getElementById("topGameList");

for (let i = 0; i < numTopGames; i++) {
    const ghostCard = document.createElement("div");
    ghostCard.classList.add("ghost-card"),
        (ghostCard.style.animation = `pulse 2s ${i / 15}s infinite`),
        topGameList.appendChild(ghostCard);
}
async function fetchTopGames() {
    try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error("Network error:" + response.statusText);
        const data = await response.json();
        if (data && data.content) {
            const parsedData = JSON.parse(data.content);
            displayTopGames(parsedData);
        }
    } catch (e) {
        console.error(`Error while fetching games: ${e}`);
    }
}
fetchTopGames();
function displayTopGames(topData) {
    topGameList.innerHTML = "";
    let foundCount = 0;
    let index = 0;
    const displayed = new Set();
    while (foundCount < numTopGames && index < topData.length) {
        const row = topData[index],
            gameName = row[0],
            card = findMatchingCard(gameName);
        if (card) {
            if (!displayed.has(gameName)) {
                topGameList.appendChild(card.cloneNode(true)),
                    displayed.add(gameName),
                    foundCount++;
            }
        }
        index++;
    }
}
function normalizeGameName(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
}
function findMatchingCard(gameName) {
    const normalized = normalizeGameName(gameName),
        allCards = document.querySelectorAll("#allList .card");
    for (let card of allCards)
        if (card.getAttribute("data-game-id") === normalized) return card;
    return null;
}
const siteMapping = window.siteMapping || {};
function getCurrentSiteKey() {
    const currentURL = window.location.href,
        keys = Object.keys(siteMapping).sort((a, b) => b.length - a.length);
    for (const k of keys) if (currentURL.includes(k)) return k;
    return null;
}
function getAdjustedUrls(href, imgSrc, page) {
    let adjustedHref = href,
        adjustedImgSrc = `./img/${imgSrc}`,
        currentSiteKey = getCurrentSiteKey();
    if (currentSiteKey) {
        const currentSitePages = siteMapping[currentSiteKey],
            pageMap = {},
            currentPageNumber = getPageNumberFromURL(currentSiteKey);
        pageMap[currentPageNumber] = currentSiteKey;
        if (currentSitePages) {
            currentSitePages.forEach(u => {
                const pNum = getPageNumberFromURL(u);
                pageMap[pNum] = u;
            });
        }
        if (page !== undefined && page !== currentPageNumber) {
            let newBase = pageMap[page];
            newBase || (newBase = window.location.origin + `/strongdog${page}`),
                (adjustedHref = `${newBase}/${href.replace(/^\.\//, "")}`),
                (adjustedImgSrc = `${newBase}/img/${imgSrc.replace(/^\.\//, "")}`);
        }
    } else if (page !== undefined && page > 1) {
        const origin = window.location.origin,
            newBase = `${origin}/strongdog${page}`;
        (adjustedHref = `${newBase}/${href.replace(/^\.\//, "")}`),
            (adjustedImgSrc = `${newBase}/img/${imgSrc.replace(/^\.\//, "")}`);
    }
    return { adjustedHref, adjustedImgSrc };
}
function getCardHTML(game) {
    const { href, imgSrc, name, page, id } = game,
        { adjustedHref, adjustedImgSrc } = getAdjustedUrls(href, imgSrc, page),
        gameLink = `./play/?id=${id}`,
        normalized = normalizeGameName(name);
    return `
<a href="${gameLink}" class="card" data-game-id="${normalized}" data-page="${page}">
<img src="${adjustedImgSrc}" alt="${name}" loading="lazy">
<figcaption>${name}</figcaption>
</a>
`;
}
const allListElement = document.getElementById("allList");
allListElement.innerHTML = games.map(g => getCardHTML(g)).join("");

const searchInput = document.getElementById("searchInput");
searchInput.placeholder = `Search ${games.length} games...`;

const searchResults = document.getElementById("searchResults");

function updateSearchResults() {
    const text = searchInput.value.toLowerCase(),
        filtered = games.filter(g => g.name.toLowerCase().includes(text)).slice(0, 7);
    searchResults.innerHTML = "";
    if (!filtered.length) {
        searchResults.style.display = "none";
        return;
    }
    filtered.forEach(game => {
        const { id, imgSrc, name, page } = game,
            { adjustedImgSrc } = getAdjustedUrls(game.href, imgSrc, page),
            linkEl = document.createElement("a");
        (linkEl.href = `./play/?id=${id}`),
            (linkEl.innerHTML = `<img src="${adjustedImgSrc}" alt="${name}"><span>${name}</span>`),
            searchResults.appendChild(linkEl);
    }),
        (searchResults.style.display = "block");
}
if (searchInput && searchResults) {
    searchInput.addEventListener("focus", updateSearchResults),
        searchInput.addEventListener("input", updateSearchResults),
        document.addEventListener("click", ev => {
            if (!searchInput.contains(ev.target) && !searchResults.contains(ev.target))
                searchResults.style.display = "none";
        });
}
const menuIcon = document.getElementById("menuIcon"),
    slideMenu = document.getElementById("slideMenu"),
    categories = slideMenu.querySelector(".categories");
menuIcon.addEventListener("click", ev => {
    ev.stopPropagation(),
        (slideMenu.style.transform =
            slideMenu.style.transform === "translateX(0%)"
                ? "translateX(-100%)"
                : "translateX(0%)");
}),
    window.addEventListener("click", ev => {
        if (ev.target !== menuIcon && !slideMenu.contains(ev.target))
            slideMenu.style.transform = "translateX(-100%)";
    });
auth.onAuthStateChanged(async user => {
    if (user) {
        const userId = user.uid,
            userDetailsContainer = document.createElement("div");
        userDetailsContainer.className = "user-details-container";
        const profileTop = document.createElement("div");
        profileTop.className = "profile-top-container";
        const picContainer = document.createElement("div");
        picContainer.className = "profile-picture-container";
        const picEl = document.createElement("img");
        (picEl.className = "profile-picture"),
            (picEl.src = user.photoURL || "img/default-avatar.png"),
            picContainer.appendChild(picEl);
        const usernameDiv = document.createElement("div");
        usernameDiv.className = "username-container";
        const usernameText = document.createElement("p");
        (usernameText.className = "username-text"),
            (usernameText.textContent = "Loading..."),
            usernameDiv.appendChild(usernameText),
            profileTop.appendChild(picContainer),
            profileTop.appendChild(usernameDiv),
            userDetailsContainer.appendChild(profileTop);
        try {
            const docRef = db.collection("usernames").doc(userId),
                docSnap = await docRef.get();
            docSnap.exists
                ? (usernameText.textContent =
                        docSnap.data().username || user.displayName || "Username")
                : (usernameText.textContent = user.displayName || "Username");
        } catch (err) {
            usernameText.textContent = user.displayName || "Username";
        }
        let totalXP = 0;
        try {
            const xpSnap = await rtdb.ref("/users/" + userId + "/xp").once("value");
            if (xpSnap.exists()) totalXP = xpSnap.val();
        } catch (err) {}
        const { level, currentXP, xpNeededForNext } = getTierAndProgressFromXP(totalXP),
            xpContainer = document.createElement("div");
        xpContainer.className = "xp-container";
        const xpLevelText = document.createElement("div");
        (xpLevelText.className = "xp-level-text"),
            (xpLevelText.textContent = `Level ${level}`);
        const xpBar = document.createElement("div");
        xpBar.className = "xp-bar";
        const xpBarFill = document.createElement("div");
        (xpBarFill.className = "xp-bar-fill"),
            (xpBarFill.style.width = `${(currentXP / xpNeededForNext) * 100}%`);
        const xpBarText = document.createElement("div");
        (xpBarText.className = "xp-bar-text"),
            (xpBarText.textContent = `${currentXP}/${xpNeededForNext}`),
            xpBar.appendChild(xpBarFill),
            xpBar.appendChild(xpBarText),
            xpContainer.appendChild(xpLevelText),
            xpContainer.appendChild(xpBar),
            userDetailsContainer.appendChild(xpContainer),
            picContainer.addEventListener("click", () => {
                window.location.href = "settings.html";
            }),
            slideMenu.insertBefore(userDetailsContainer, categories);
        const logoutLink = document.createElement("a");
        (logoutLink.href = "#"),
            (logoutLink.className = "option-link"),
            (logoutLink.textContent = "Log Out"),
            (logoutLink.style.backgroundColor = "#dc3545"),
            (logoutLink.style.color = "white"),
            logoutLink.addEventListener("click", e => {
                e.preventDefault(), auth.signOut().then(() => window.location.reload());
            });
        const favoritesLink = categories.querySelector('a[href="favs.html"]');
        categories.insertBefore(logoutLink, favoritesLink),
            db
                .collection("access")
                .doc(userId)
                .get()
                .then(accDoc => {
                    if (accDoc.exists && accDoc.data().tester === true) {
                        const testGamesLink = document.createElement("a");
                        (testGamesLink.href = "test.html"),
                            (testGamesLink.className = "option-link"),
                            (testGamesLink.textContent = "Test Games"),
                            (testGamesLink.style.backgroundColor = "#28a745"),
                            (testGamesLink.style.color = "white"),
                            (testGamesLink.style.marginTop = "10px"),
                            categories.insertBefore(testGamesLink, favoritesLink);
                    }
                });
    } else {
        const userDetailsContainer = document.createElement("div");
        (userDetailsContainer.className = "user-details-container"),
            (userDetailsContainer.style.display = "flex"),
            (userDetailsContainer.style.flexDirection = "column"),
            (userDetailsContainer.style.alignItems = "center"),
            (userDetailsContainer.style.paddingBlock = "20px");
        const notLoggedInContainer = document.createElement("div");
        notLoggedInContainer.className = "username-container";
        const notLoggedInText = document.createElement("p");
        (notLoggedInText.className = "username-text"),
            (notLoggedInText.textContent = "Not logged in"),
            notLoggedInContainer.appendChild(notLoggedInText);
        const loginButton = document.createElement("button");
        (loginButton.textContent = "Log In"),
            (loginButton.style.backgroundColor = "#007bff"),
            (loginButton.style.color = "#fff"),
            (loginButton.style.border = "none"),
            (loginButton.style.padding = "10px 20px"),
            (loginButton.style.fontSize = "16px"),
            (loginButton.style.borderRadius = "5px"),
            (loginButton.style.cursor = "pointer"),
            (loginButton.style.marginTop = "5px"),
            loginButton.addEventListener("click", () => {
                window.location.href = "login.html";
            }),
            userDetailsContainer.appendChild(notLoggedInContainer),
            userDetailsContainer.appendChild(loginButton),
            slideMenu.insertBefore(userDetailsContainer, categories);
    }
    const randomGameLink = categories.querySelector("#randomGame");
    randomGameLink?.addEventListener("click", ev => {
        ev.preventDefault();
        if (games.length > 0) {
            const idx = Math.floor(Math.random() * games.length);
            window.location.href = `./play/?id=${games[idx].id}`;
        }
    });
    const blockLanschoolLink = categories.querySelector("#blockLanschool");
    blockLanschoolLink?.addEventListener("click", ev => {
        ev.preventDefault();
        const url = window.location.href,
            newTab = window.open();
        if (!newTab) return;
        newTab.document.write(`
<html>
    <body style="margin:0;height:100vh;">
    <iframe src="${url}" style="border:none;width:100%;height:100%"></iframe>
    </body>
</html>
`),
            newTab.document.close();
    });
});
const editAllButton = document.getElementById("editAllButton"),
    customSlideMenu = document.getElementById("customSlideMenu");
editAllButton.addEventListener("click", ev => {
    ev.stopPropagation(),
        (slideMenu.style.transform = "translateX(-100%)"),
        (customSlideMenu.style.transform =
            customSlideMenu.style.transform === "translateX(0%)"
                ? "translateX(-100%)"
                : "translateX(0%)");
}),
    window.addEventListener("click", ev => {
        if (
            ev.target !== editAllButton &&
            !customSlideMenu.contains(ev.target) &&
            ev.target.id !== "editAllButton"
        )
            customSlideMenu.style.transform = "translateX(-100%)";
    });
function setCookie(name, val, days) {
    const d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1e3 * days),
        (document.cookie = `${name}=${val};expires=${d.toUTCString()};path=/`);
}
function getCookie(name) {
    const all = `; ${document.cookie}`,
        parts = all.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";")[0];
    return "";
}
const top20Toggle = document.getElementById("top20Toggle"),
    topGameHeader = document.getElementById("topGameHeader");
let top20Disabled = getCookie("top20Disabled") === "true";
(top20Toggle.checked = !top20Disabled),
    top20Disabled &&
        ((topGameList.style.display = "none"), (topGameHeader.style.display = "none")),
    top20Toggle.addEventListener("change", () => {
        if (top20Toggle.checked)
            (topGameList.style.display = "flex"),
                (topGameHeader.style.display = "block"),
                setCookie("top20Disabled", "false", 365);
        else
            (topGameList.style.display = "none"),
                (topGameHeader.style.display = "none"),
                setCookie("top20Disabled", "true", 365);
    });
const favoritesToggle = document.getElementById("favoritesToggle"),
    favoritesHeader = document.getElementById("favoritesHeader"),
    favoritesGameList = document.getElementById("favoritesGameList");
let favCookie = getCookie("favoritesDisabled");
favCookie === "" && (favCookie = "true");
const favoritesDisabled = favCookie === "true";
(favoritesToggle.checked = !favoritesDisabled),
    favoritesDisabled
        ? ((favoritesHeader.style.display = "none"),
            (favoritesGameList.style.display = "none"))
        : ((favoritesHeader.style.display = "block"),
            (favoritesGameList.style.display = "flex"));
favoritesToggle.addEventListener("change", () => {
    if (favoritesToggle.checked)
        (favoritesHeader.style.display = "block"),
            (favoritesGameList.style.display = "flex"),
            setCookie("favoritesDisabled", "false", 365),
            loadFavorites();
    else
        (favoritesHeader.style.display = "none"),
            (favoritesGameList.style.display = "none"),
            setCookie("favoritesDisabled", "true", 365);
});
function loadFavorites() {
    const placeholders = 10;
    favoritesGameList.innerHTML = "";
    for (let i = 0; i < placeholders; i++) {
        const ghost = document.createElement("div");
        ghost.classList.add("ghost-card"),
            (ghost.style.animation = `pulse 2s ${i / 15}s infinite`),
            favoritesGameList.appendChild(ghost);
    }
    auth.onAuthStateChanged(user => {
        if (user) fetchFavorites(user.uid);
        else {
            showFavoritesPopup(),
                (favoritesGameList.innerHTML =
                    '<p class="no-favorites">No favorites yet!</p>');
        }
    });
}
async function fetchFavorites(userId) {
    try {
        const favDoc = await db.collection("favs").doc(userId).get();
        if (favDoc.exists) {
            const favData = favDoc.data();
            displayFavorites(favData);
        } else
            favoritesGameList.innerHTML =
                '<p class="no-favorites">No favorites yet!</p>';
    } catch (err) {
        favoritesGameList.innerHTML =
            '<p class="no-favorites">Error loading favorites.</p>';
    }
}
function displayFavorites(favs) {
    favoritesGameList.innerHTML = "";
    let hasFavorites = false;
    Object.keys(favs).forEach(gameId => {
        if (favs[gameId]) {
            const g = games.find(gm => parseInt(gm.id, 10) === parseInt(gameId, 10));
            if (g) {
                (hasFavorites = true), (favoritesGameList.innerHTML += getCardHTML(g));
            }
        }
    });
    if (!hasFavorites)
        favoritesGameList.innerHTML = '<p class="no-favorites">No favorites yet!</p>';
}
function showFavoritesPopup() {
    document.getElementById("favoritesPopupContainer").classList.add("active"),
        (document.getElementById("favoverlay").style.display = "block");
}
function hideFavoritesPopup() {
    document.getElementById("favoritesPopupContainer").classList.remove("active"),
        (document.getElementById("favoverlay").style.display = "none");
}
document
    .getElementById("favoritesOkButton")
    .addEventListener("click", hideFavoritesPopup),
    favoritesToggle.checked && loadFavorites();
const cardSizeSlider = document.getElementById("cardSizeSlider"),
    cardSizeValue = document.getElementById("cardSizeValue");
function updateCardSizes() {
    const val = parseInt(cardSizeSlider.value, 10);
    cardSizeValue.textContent = val;
    const newSize = 120 + val,
        newGap = Math.max(10 + val / 4, 5),
        newRadius = val < 0 ? Math.max(15 + val * 0.13, 2) : 15;
    document.querySelectorAll(".card, .ghost-card").forEach(c => {
        (c.style.width = newSize + "px"),
            (c.style.height = newSize + "px"),
            (c.style.borderRadius = newRadius + "px");
    }),
        document.querySelectorAll(".games-grid").forEach(grid => {
            grid.style.gap = newGap + "px";
        }),
        setCookie("cardSize", val, 365);
}
cardSizeSlider.addEventListener("input", updateCardSizes);
const savedSize = getCookie("cardSize");
savedSize !== "" && ((cardSizeSlider.value = savedSize), updateCardSizes());
document.addEventListener("DOMContentLoaded", () => {
    const page1Link = document.getElementById("page1-link"),
        page2Link = document.getElementById("page2-link");
    if (!page1Link || !page2Link) return;
    const hostname = window.location.hostname,
        linkMap = {
            "jman1593.github.io": {
                page1: "/#",
                page2: "/strongdog2/index.html",
            },
        };
    for (const key in linkMap)
        if (hostname.includes(key)) {
            (page1Link.href = linkMap[key].page1),
                (page2Link.href = linkMap[key].page2);
            break;
        }
});
(function () {
    var defaultTitle = "ꜱᴛʀᴏɴɢᴅᴏɢ xᴘ",
        defaultFavicon = "img/favicon.ico",
        titleInput = document.getElementById("customTitleInput"),
        faviconInput = document.getElementById("customFaviconInput"),
        resetTitleBtn = document.getElementById("resetTitleBtn"),
        resetFaviconBtn = document.getElementById("resetFaviconBtn"),
        faviconEl = document.querySelector('link[rel="icon"]');
    localStorage.getItem("customTitle")
        ? ((document.title = localStorage.getItem("customTitle")),
            (titleInput.value = localStorage.getItem("customTitle")))
        : (titleInput.value = defaultTitle),
        localStorage.getItem("customFavicon")
            ? ((faviconEl.href = localStorage.getItem("customFavicon")),
                (faviconInput.value = localStorage.getItem("customFavicon")))
            : (faviconInput.value = defaultFavicon),
        titleInput.addEventListener("change", function () {
            var e = titleInput.value.trim();
            e === "" && ((e = defaultTitle), (titleInput.value = defaultTitle)),
                localStorage.setItem("customTitle", e),
                (document.title = e);
        }),
        faviconInput.addEventListener("change", function () {
            var e = faviconInput.value.trim();
            e === "" && ((e = defaultFavicon), (faviconInput.value = defaultFavicon)),
                localStorage.setItem("customFavicon", e),
                (faviconEl.href = e);
        }),
        resetTitleBtn.addEventListener("click", function () {
            localStorage.removeItem("customTitle"),
                (document.title = defaultTitle),
                (titleInput.value = defaultTitle);
        }),
        resetFaviconBtn.addEventListener("click", function () {
            localStorage.removeItem("customFavicon"),
                (faviconEl.href = defaultFavicon),
                (faviconInput.value = defaultFavicon);
        });
})();