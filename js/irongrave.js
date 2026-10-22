// 1. DICHIARAZIONI GLOBALI

// Classe Character
class Character {
  constructor(
    nome,
    razza,
    sprite,
    livello,
    dollari,
    salute,
    forza,
    intelligenza,
    tenacia,
    fortuna,
    armap,
    armas,
    medikit,
    dialogog,
    dialogov,
    purchasedArmi,
  ) {
    this.nome = nome;
    this.razza = razza;
    this.sprite = this.getSprite(razza);
    this.livello = livello;
    this.dollari = dollari;
    this.salute = salute;
    this.forza = forza;
    this.intelligenza = intelligenza;
    this.tenacia = tenacia;
    this.fortuna = fortuna;
    this.armap = armap;
    this.armas = armas;
    this.medikit = medikit;
    this.dialogog = dialogog;
    this.dialogov = dialogov;
    this.purchasedArmi = [];
  }

  // Metodo per ottenere lo sprite basato sulla razza
  getSprite(razza) {
    const sprites = {
      Umano: "img/Personaggi/eroeumano.png",
      Contaminato: "img/Personaggi/eroecontaminato.png",
      Cyborg: "img/Personaggi/eroecyborg.png",
    };
    return sprites[razza];
  }
}

// Istanza globale del giocatore
const player = new Character(
  "",
  "",
  "",
  0,
  0,
  50,
  null,
  null,
  null,
  null,
  ARMI.disarmato,
  ARMI.disarmato,
  0,
  false,
  false,
  [],
);

// Costanti e variabili di stato
const PUNTI_INIZIALI = 5;
let puntiStat = PUNTI_INIZIALI;
let statMin = { forza: 2, tenacia: 2, intelligenza: 2, fortuna: 2 };
let modalitaLogin = true;
let utenteLoggato = false;
let devMode = false;

// Modalità sviluppatore (Premere "7" durante la creazione del personaggio)
document.addEventListener("keydown", (e) => {
  if (e.key === "7") {
    devMode = true;
    console.log("DEV MODE ATTIVATA");
  }
});

/* 2. INIZIALIZZAZIONE - ENTRY POINT E SETUP */

// Funzione che mostra gli errori
function showError(message) {
  const dialog = document.getElementById("error-dialog");
  const text = document.getElementById("dialog-text");
  text.textContent = message;
  dialog.classList.remove("hidden");
  setTimeout(() => {
    dialog.classList.add("hidden");
  }, 3000);
}

// Funzione principale di inizializzazione
async function init() {
  const newGameBtn = document.getElementById("new-game-btn");
  const loadGameBtn = document.getElementById("load-game-btn");
  const backMenuBtn = document.getElementById("back-menu-btn");
  const nextStepBtn = document.getElementById("next-step-btn");
  const backStepBtn = document.getElementById("back-step-btn");
  const confirmCharBtn = document.getElementById("confirm-char-btn");
  const helpBtn = document.getElementById("help-btn");
  const manuale = document.getElementById("manuale");
  const mainMenu = document.getElementById("main-menu");
  const loginBtn = document.getElementById("login-btn");
  const profiloUtente = document.getElementById("profilo-utente");

  loadGameBtn.disabled = true;
  confirmCharBtn.disabled = true;

  // Event listeners per i bottoni di incremento/decremento statistiche
  document.querySelectorAll(".plus-btn").forEach((btn) => {
    btn.onclick = statplus;
  });
  document.querySelectorAll(".minus-btn").forEach((btn) => {
    btn.onclick = statminus;
  });

  // Event listeners per race cards (selezione razza)
  document.querySelectorAll(".race-card").forEach((card) => {
    card.onclick = () => selectrace(card);
  });

  // Setup pulsanti principali
  initLogin();
  newGameBtn.onclick = creationstep1;
  loadGameBtn.onclick = continuegame;
  backMenuBtn.onclick = backtomainmenu;
  nextStepBtn.onclick = creationstep2;
  backStepBtn.onclick = creationstep1;
  confirmCharBtn.onclick = confirmandstart;

  // Setup manuale utente
  helpBtn.addEventListener("click", () => {
    if (helpBtn.textContent === "?") {
      manuale.classList.remove("hidden");
      mainMenu.classList.add("hidden");
      profiloUtente.classList.add("hidden");
      loginBtn.classList.add("hidden");
      helpBtn.textContent = "x";
    } else {
      manuale.classList.add("hidden");
      mainMenu.classList.remove("hidden");
      if (utenteLoggato) {
        profiloUtente.classList.remove("hidden");
      } else {
        loginBtn.classList.remove("hidden");
      }
      helpBtn.textContent = "?";
    }
  });

  // Setup storico
  initStorico();

  // Verifica se c'è una sessione attiva
  await checkSessione();
}

/* 3. LOGIN E REGISTRAZIONE */

// Inizializza i listener per il login/registrazione
function initLogin() {
  document.getElementById("login-btn").onclick = () => {
    document.getElementById("login-username").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("login-error").textContent = "";
    document.getElementById("login-modal").classList.remove("hidden");
  };

  document.getElementById("login-overlay").onclick = () => {
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("login-error").textContent = "";
  };

  document.getElementById("tab-login").onclick = () => {
    modalitaLogin = true;
    document.getElementById("tab-login").classList.add("active");
    document.getElementById("tab-register").classList.remove("active");
    document.getElementById("login-submit-btn").textContent = "ACCEDI";
    document.getElementById("login-error").textContent = "";
  };

  document.getElementById("tab-register").onclick = () => {
    modalitaLogin = false;
    document.getElementById("tab-register").classList.add("active");
    document.getElementById("tab-login").classList.remove("active");
    document.getElementById("login-submit-btn").textContent = "REGISTRATI";
    document.getElementById("login-error").textContent = "";
  };

  document.getElementById("login-submit-btn").onclick = async () => {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");

    if (!username || !password) {
      errorEl.textContent = "INSERISCI USERNAME E PASSWORD";
      return;
    }

    if (modalitaLogin) {
      await eseguiLogin(username, password);
    } else {
      await eseguiRegistrazione(username, password);
    }
  };

  document.getElementById("logout-btn").onclick = eseguiLogout;
}

// Esegue il login
async function eseguiLogin(username, password) {
  const errorEl = document.getElementById("login-error");
  try {
    const response = await fetch("php/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      errorEl.textContent = data.errore || "Errore sconosciuto";
      return;
    }

    // Login riuscito
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("login-btn").classList.add("hidden");
    document.getElementById("profilo-utente").classList.remove("hidden");
    document.getElementById("profilo-username").textContent = username;
    utenteLoggato = true;

    // Controlla se esiste un salvataggio
    const saved = await loadData();
    document.getElementById("load-game-btn").disabled = !saved;
  } catch (e) {
    console.error("Errore login:", e);
    errorEl.textContent = "ERRORE DI CONNESSIONE: " + e.message;
  }
}

// Esegue la registrazione
async function eseguiRegistrazione(username, password) {
  const errorEl = document.getElementById("login-error");
  try {
    const response = await fetch("php/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      errorEl.textContent = data.errore || "Errore sconosciuto";
      return;
    }

    // Registrazione riuscita, esegui login automatico
    await eseguiLogin(username, password);
  } catch (e) {
    console.error("Errore registrazione:", e);
    errorEl.textContent = "ERRORE DI CONNESSIONE: " + e.message;
  }
}

// Esegue il logout
async function eseguiLogout() {
  try {
    await fetch("php/logout.php");
  } catch (e) {}
  document.getElementById("profilo-utente").classList.add("hidden");
  document.getElementById("login-btn").classList.remove("hidden");
  document.getElementById("load-game-btn").disabled = true;
  utenteLoggato = false;
}

/* 4. MENU PRINCIPALE */

// Pulsante "Nuova Partita"
function creationstep1() {
  if (!utenteLoggato) {
    showError("DEVI ESSERE LOGGATO PER INIZIARE UNA NUOVA PARTITA");
    return;
  }
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("login-btn").classList.add("hidden");
  document.getElementById("profilo-utente").classList.add("hidden");
  document.getElementById("help-btn").classList.add("hidden");
  document.getElementById("character-creation").classList.remove("hidden");
  document.getElementById("creation-step-1").classList.remove("hidden");
  document.getElementById("creation-step-2").classList.add("hidden");
}

// Continua una partita precedente
async function continuegame() {
  const saved = await loadData();
  if (!saved) {
    showError("NESSUN SALVATAGGIO TROVATO");
    return;
  }
  window.location.href = "game.html";
}

/* 5. CHARACTER CREATION SECTION */

// Step 1: Selezione razza e nome - Azione pulsante "Avanti Step"
function creationstep2() {
  const nameInput = document.getElementById("char-name");
  const selectedRace = document.querySelector(".race-card.selected");

  if (!nameInput.value || nameInput.value === "") {
    showError(
      "ATTENZIONE: INSERISCI UN NOME VALIDO (1-10 CARATTERI) PER CONTINUARE",
    );
    return;
  }

  if (!selectedRace) {
    showError("ATTENZIONE: SELEZIONA UNA RAZZA PER CONTINUARE");
    return;
  }

  player.nome = nameInput.value;
  player.razza = selectedRace.dataset.race;
  player.sprite = player.getSprite(player.razza);

  document.getElementById("creation-step-1").classList.add("hidden");
  document.getElementById("creation-step-2").classList.remove("hidden");

  // Reset completo ad ogni accesso allo step 2
  puntiStat = PUNTI_INIZIALI;
  statMin = { ...RACE_MINIMUMS[player.razza] };

  document.getElementById("available-points").textContent = puntiStat;
  document.getElementById("stat-forza").textContent = statMin.forza;
  document.getElementById("stat-tenacia").textContent = statMin.tenacia;
  document.getElementById("stat-intelligenza").textContent = statMin.intelligenza;
  document.getElementById("stat-fortuna").textContent = statMin.fortuna;

  // Il bottone conferma va resettato a disabled ad ogni nuovo ingresso
  document.getElementById("confirm-char-btn").disabled = true;
  buttoncheck();
}

// Torna al menu principale
function backtomainmenu() {
  document.getElementById("character-creation").classList.add("hidden");
  if (utenteLoggato) {
    document.getElementById("profilo-utente").classList.remove("hidden");
  } else {
    document.getElementById("login-btn").classList.remove("hidden");
  }
  document.getElementById("main-menu").classList.remove("hidden");
  document.getElementById("help-btn").classList.remove("hidden");
}

// Selezione razza
function selectrace(card) {
  document.querySelectorAll(".race-card").forEach((c) => {
    c.classList.remove("selected");
  });
  card.classList.add("selected");
}

// Step 2: Distribuzione statistiche - Pulsante "+"
function statplus(e) {
  const nomestat = e.target.dataset.stat;
  const stat = document.getElementById("stat-" + nomestat);
  let num = parseInt(stat.textContent);
  let newnum = num + 1;
  stat.textContent = newnum;
  puntiStat -= 1;
  document.getElementById("available-points").textContent = puntiStat;
  buttoncheck();
  confirmcheck();
}

// Step 2: Distribuzione statistiche - Pulsante "-"
function statminus(e) {
  const nomestat = e.target.dataset.stat;
  const stat = document.getElementById("stat-" + nomestat);
  let num = parseInt(stat.textContent);
  let newnum = num - 1;
  stat.textContent = newnum;
  puntiStat += 1;
  document.getElementById("available-points").textContent = puntiStat;
  buttoncheck();
  confirmcheck();
}

// Controlla lo stato dei pulsanti +/- based su punti e minimali
function buttoncheck() {
  // Plus buttons: disabilitati se non ci sono più punti
  document.querySelectorAll(".plus-btn").forEach((btn) => {
    btn.disabled = puntiStat === 0;
  });

  // Minus buttons: disabilitati se la stat è al suo minimo di razza
  document.querySelectorAll(".minus-btn").forEach((btn) => {
    const nomestat = btn.dataset.stat;
    const currentValue = parseInt(
      document.getElementById("stat-" + nomestat).textContent,
    );
    btn.disabled = currentValue <= statMin[nomestat];
  });
}

// Controlla se il personaggio è pronto per confermare (tutti i punti distribuiti)
function confirmcheck() {
  if (puntiStat === 0) {
    document.getElementById("confirm-char-btn").disabled = false;
  } else {
    document.getElementById("confirm-char-btn").disabled = true;
  }
}

// Conferma personaggio e inizia il gioco
async function confirmandstart() {
  // Modalità sviluppatore
  if (devMode) {
    const devChar = createDevCharacter();
    Object.assign(player, devChar);
    devMode = false;
    console.log("DEV CHARACTER CREATO: ", player);
  } else {
    // Assegna le statistiche finali al personaggio
    player.forza = parseInt(document.getElementById("stat-forza").textContent);
    player.tenacia = parseInt(
      document.getElementById("stat-tenacia").textContent,
    );
    player.intelligenza = parseInt(
      document.getElementById("stat-intelligenza").textContent,
    );
    player.fortuna = parseInt(
      document.getElementById("stat-fortuna").textContent,
    );
    console.log("Personaggio creato: ", player);
  }

  await saveData();

  // Transizione: nascondi creazione, mostra lore
  document.getElementById("character-creation").classList.add("hidden");
  document.getElementById("background").classList.add("hidden");
  document.getElementById("background2").classList.remove("hidden");
  document.getElementById("lore-text").classList.remove("hidden");

  // Dopo 6 secondi il lore text sparisce e si avvia il gioco
  setTimeout(() => {
    document.getElementById("lore-text").classList.add("hidden");
    window.location.href = "game.html";
  }, 6000);
}

/* 6. STORICO DELLE PARTITE */

// Inizializza i listener per lo storico
function initStorico() {
  document.getElementById("storico-btn").onclick = async () => {
    // Solo se loggato
    if (
      document.getElementById("profilo-utente").classList.contains("hidden")
    ) {
      showError("DEVI ESSERE LOGGATO PER VEDERE LO STORICO");
      return;
    }
    await apriStorico();
  };

  document.getElementById("storico-close-btn").onclick = () => {
    document.getElementById("storico-modal").classList.add("hidden");
  };

  document.getElementById("storico-overlay").onclick = () => {
    document.getElementById("storico-modal").classList.add("hidden");
  };
}

// Carica e visualizza lo storico delle partite
async function apriStorico() {
  try {
    const response = await fetch("php/storico.php");
    const data = await response.json();

    const lista = document.getElementById("storico-lista");
    lista.innerHTML = "";

    if (!response.ok || data.length === 0) {
      lista.innerHTML = '<p id="storico-vuoto">NESSUNA PARTITA COMPLETATA</p>';
    } else {
      data.forEach((partita) => {
        const data_formattata = new Date(
          partita.data_partita,
        ).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const riga = document.createElement("div");
        riga.classList.add("storico-riga");
        riga.innerHTML = `
                    <p class="storico-riga-nome">${partita.nome_personaggio} — ${partita.razza}</p>
                    <p class="storico-riga-dettagli">Livello ${partita.livello_raggiunto} | Primaria: ${partita.arma_primaria} | Secondaria: ${partita.arma_secondaria} | Dollari: ${partita.dollari_accumulati}</p>
                    <p class="storico-riga-data">${data_formattata}</p>
                `;
        lista.appendChild(riga);
      });
    }

    document.getElementById("storico-modal").classList.remove("hidden");
  } catch (e) {
    showError("ERRORE NEL CARICAMENTO DELLO STORICO");
  }
}

/* 7. UTILITY / HELPER FUNCTIONS */

// Verifica se esiste una sessione attiva e carica i dati dell'utente
async function checkSessione() {
  try {
    const response = await fetch("php/check.php");
    const data = await response.json();
    if (data.loggato) {
      utenteLoggato = true;
      document.getElementById("login-btn").classList.add("hidden");
      document.getElementById("profilo-utente").classList.remove("hidden");
      document.getElementById("profilo-username").textContent = data.username;
      const saved = await loadData();
      document.getElementById("load-game-btn").disabled = !saved;
    }
  } catch (e) {
    console.error("Errore check sessione:", e);
  }
}

