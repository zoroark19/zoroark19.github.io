// Load the players.json
async function loadJSON() {
  const response = await fetch("players.json");
  return await response.json();
}

// Helper: create clickable gamertag link
function createGamertagLink(gamertag) {
  const link = document.createElement("a");
  link.href = `player.html?gamertag=${encodeURIComponent(gamertag)}`;
  link.textContent = gamertag;
  link.className = "gamertag-link";
  return link;
}

/* -------------------
   INDEX PAGE
------------------- */
async function loadNewSkins() {
  const data = await loadJSON();
  const container = document.getElementById("skins-grid");
  container.innerHTML = "";

  const skins = [];
  data.users.forEach((user) => {
    user.Skins.forEach((skin) => {
      skins.push({
        gamertag: user.Gamertag,
        skinName: skin.SkinName,
        headDate: skin.HeadDate,
      });
    });
  });

  // Sort newest first by HeadDate
  skins.sort((a, b) => new Date(b.headDate) - new Date(a.headDate));

  skins.forEach((s) => {
    const div = document.createElement("div");
    div.className = "skin-card";
    const gamertagLink = createGamertagLink(s.gamertag);

    div.innerHTML = `
      <img src="img/${s.gamertag}/${s.skinName}.png" alt="${s.skinName}">
      <p>${s.headDate}</p>
    `;
    div.insertBefore(gamertagLink, div.firstChild);
    container.appendChild(div);
  });
}

/* -------------------
   TAGS PAGE
------------------- */
async function loadTagPage() {
  const params = new URLSearchParams(window.location.search);
  const tag = params.get("tag");

  const data = await loadJSON();
  const container = document.getElementById("tag-skins-grid");
  container.innerHTML = "";

  if (!tag) {
    document.getElementById("tag-title").textContent = "All Tags";
    container.innerHTML = `<p>Please open this page with ?tag=TagName in the URL</p>`;
    return;
  }

  document.getElementById("tag-title").textContent = `Tag: ${tag}`;

  const filtered = [];
  data.users.forEach((user) => {
    user.Skins.forEach((skin) => {
      if (skin.Tags && skin.Tags.includes(tag)) {
        filtered.push({
          gamertag: user.Gamertag,
          skinName: skin.SkinName,
          headDate: skin.HeadDate,
        });
      }
    });
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p>No skins found for this tag.</p>`;
    return;
  }

  // Sort by newest HeadDate
  filtered.sort((a, b) => new Date(b.headDate) - new Date(a.headDate));

  filtered.forEach((s) => {
    const div = document.createElement("div");
    div.className = "skin-card";
    const gamertagLink = createGamertagLink(s.gamertag);

    div.innerHTML = `
      <img src="img/${s.gamertag}/${s.skinName}.png" alt="${s.skinName}">
    `;
    div.insertBefore(gamertagLink, div.firstChild);
    container.appendChild(div);
  });
}

/* -------------------
   PLAYER PAGE
------------------- */
async function loadPlayerProfile() {
  const params = new URLSearchParams(window.location.search);
  const gamertag = params.get("gamertag");
  const data = await loadJSON();
  const user = data.users.find((u) => u.Gamertag === gamertag);

  if (!user) {
    document.getElementById("heads-container").innerHTML = `<p>Player not found</p>`;
    return;
  }

  document.getElementById("player-gamertag").textContent = user.Gamertag;

  const headsContainer = document.getElementById("heads-container");
  const mainSkinImg = document.getElementById("main-skin");
  const mainCapeImg = document.getElementById("main-cape");
  const mainTagsBox = document.getElementById("main-tags");

  headsContainer.innerHTML = "";

  // Sort skins by HeadDate (newest first)
  user.Skins.sort((a, b) => new Date(b.HeadDate) - new Date(a.HeadDate));

  // Default to newest skin
  const defaultSkin = user.Skins[0];
  mainSkinImg.src = `img/${user.Gamertag}/${defaultSkin.SkinName}.png`;
  mainCapeImg.src = defaultSkin.CapeName ? `img/${user.Gamertag}/${defaultSkin.CapeName}.png` : "";
  updateTags(defaultSkin.Tags);

  // Create head previews
  user.Skins.forEach((skin) => {
    if (!skin.HeadName) return;
    const headImg = document.createElement("img");
    headImg.src = `img/${user.Gamertag}/${skin.HeadName}.png`;
    headImg.className = "head-square";
    headImg.title = `${skin.HeadDate}`;

    // Hover updates main display
    headImg.addEventListener("mouseenter", () => {
      mainSkinImg.src = `img/${user.Gamertag}/${skin.SkinName}.png`;
      mainCapeImg.src = skin.CapeName ? `img/${user.Gamertag}/${skin.CapeName}.png` : "";
      updateTags(skin.Tags);
    });

    headsContainer.appendChild(headImg);
  });

  function updateTags(tags) {
    mainTagsBox.innerHTML = "";
    if (!tags || tags.length === 0) return;

    tags.forEach((tag) => {
      const link = document.createElement("a");
      link.textContent = tag;
      link.href = `tags.html?tag=${encodeURIComponent(tag)}`;
      link.className = "tag-link";
      mainTagsBox.appendChild(link);
    });
  }
}
