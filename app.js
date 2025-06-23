function clearStorage() {
  let session = sessionStorage.getItem("register");

  if (session == null) {
    localStorage.removeItem("remove");
  }
  sessionStorage.setItem("register", 1);
}
window.addEventListener("load", clearStorage);

const storedState = localStorage.getItem("state");

let state = JSON.parse(storedState) || {
  cookieCount: 0,
  cps: 1,
  lifetimeCount: 0,
  PowerCount: 0,
};

const cookie = document.getElementById("cookie");

const counter = document.getElementById("counter");

const formatter = Intl.NumberFormat("en");

setInterval(() => {
  state.cookieCount += state.cps;
  state.lifetimeCount += state.cps;
  let n = formatter.format(state.cookieCount);
  counter.innerText = n;
}, 1000);

cookie.addEventListener("click", (event) => {
  const stringState = JSON.stringify(state);

  localStorage.setItem("state", stringState);
});

cookie.addEventListener("click", (event) => {
  state.cookieCount++;
  state.lifetimeCount++;
  let n = formatter.format(state.cookieCount);
  counter.innerText = n;
});

async function getUpgrades() {
  try {
    const response = await fetch(
      `https://cookie-upgrade-api.vercel.app/api/upgrades`
    );

    if (!response.ok) {
      throw new error("HTTP error");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);

    window.location.href = "error.html";
  }
}

const upgradeDisplay = document.getElementById("upgradesContainer");

async function createUpgrades() {
  const upgrades = await getUpgrades();

  upgrades.forEach((upgrade) => {
    const upgradeBtn = document.createElement("form");
    const cost = formatter.format(upgrade.cost);
    const increase = formatter.format(upgrade.increase);
    upgradeBtn.className = "upgrade upgrade${upgrade.name}";

    upgradeBtn.innerHTML = `
        <button type="submit" class="upgradeBtn"><h2>${upgrade.name}</h2>
        <input name="cost" type="hidden" value="${upgrade.cost}">
        <input name="name" type="hidden" value="${upgrade.name}">
        <input name="increase" type="hidden" value="${upgrade.increase}">
        <h3>Cost: ${cost}</h3><h3>CPS: +${increase}</h3></button>`;
    upgradeBtn.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(upgradeBtn);
      const upgradeObject = Object.fromEntries(formData);

      purchase(upgradeObject);
    });
    upgradeDisplay.appendChild(upgradeBtn);
  });
}

createUpgrades();

const errorModal = document.getElementById("errorModal");

const errorClose = document.getElementById("errorClose");
document.addEventListener("click", () => {
  errorModal.close();
});

async function purchase(upgrade) {
  const cost = parseInt(upgrade.cost);
  const increase = parseInt(upgrade.increase);

  if (state.cookieCount < cost) {
    errorModal.showModal();
  } else {
    state.cookieCount = state.cookieCount - cost;
    state.cps = state.cps + increase;
    state.PowerCount = state.PowerCount + 1;
    await track(upgrade.name);

    await createUpgradeDisplay();
    await updateCps();
  }
}

async function track(name) {
  let found = false;

  for (const key in state) {
    if (key == name) {
      state[key]++;
      found = true;
      break;
    }
  }

  if (!found) {
    state[name] = 1;
  }
}

const cpsDisplay = document.getElementById("cps");
async function updateCps() {
  const cps = formatter.format(state.cps);

  cpsDisplay.innerText = `${cps}`;
}

updateCps();

let images = [
  {
    "Auto-Clicker": "assets/cursor.png",
  },
  {
    "Enhanced Oven": "assets/oven.png",
  },
  {
    "Cookie Farm": "assets/FarmIconTransparent.png",
  },
  {
    "Robot Baker": "assets/Robot.png",
  },
  {
    "Cookie Factory": "assets/factory.png",
  },
  {
    "Magic Flour": "assets/flour.png",
  },
  {
    "Time Machine": "assets/time-machine.png",
  },
  {
    "Quantum Oven": "assets/quantum.png",
  },
  {
    "Alien Technology": "assets/alien.png",
  },
  {
    "Interdimensional Baker": "assets/BestBaker.png",
  },
];

const display = document.getElementById("NomNom");

async function createUpgradeDisplay() {
  display.innerHTML = ``;

  for (const key in state) {
    if (
      key == "cookieCount" ||
      key == "cps" ||
      key == "lifetimeCount" ||
      key == "PowerCount"
    ) {
      continue;
    } else {
      const acElement = document.createElement("li");
      acElement.innerHTML = `
            <input class="toggle" type="checkbox" name="${key}" id="${key}">
            <label for="${key}">${key}</label>
            <div id="${key}-image-container" class="asset-image-container">
                
            </div>`;
      display.appendChild(acElement);

      const keyIC = document.getElementById(`${key}-image-container`);

      for (let i = 0; i < state[key]; i++) {
        const image = document.createElement("img");
        image.className = "asset";

        for (const icon of images) {
          const imgKey = Object.keys(icon);
          if (imgKey == key) {
            image.src = icon[imgKey];
            break;
          }
        }
        keyIC.appendChild(image);
      }
    }
  }
}

createUpgradeDisplay();

const statBtn = document.getElementById("statBtn");
const closeModal = document.getElementById("modalClose");
const modal = document.getElementById("modal");
const statDisplay = document.getElementById("statsContainer");
statBtn.addEventListener("click", () => {
  modal.showModal();
  createStats();
});

closeModal.addEventListener("click", () => {
  modal.close();
});

async function createStats() {
  const cookies = formatter.format(state.cookieCount);
  const allTime = formatter.format(state.lifetimeCount);
  const Power = formatter.format(state.PowerCount);
  statDisplay.innerHTML = ``;
  const stats = document.createElement("div");
  stats.innerHTML = `
    <li>Cookies in bank: ${cookies}</li>
    <li>Cookies baked(all time): ${allTime}</li>
    <li>Powers owned: ${Power}</li>`;
  statDisplay.appendChild(stats);
}

createStats();
