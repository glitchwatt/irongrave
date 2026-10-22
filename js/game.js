/* 1. DICHIARAZIONI GLOBALI - Variabili e costanti */

let gameState = "playing"; // "playing" o "paused"
let player; // Variabile globale per il personaggio

// Stati di battaglia
const BATTLE_STATES = {
  PLAYER_TURN: "playerTurn",
  ENEMY_TURN: "enemyTurn",
  PLAYER_WON: "playerWon",
  PLAYER_LOST: "playerLost",
};
let battleState; // Variabile globale per lo stato della battaglia

// Nemico e salute attuale
let nemico;
let myhp;
let enemyhp;

// Dialoghi dei nemici
const dialoghi = {
  "DETENUTO":
    "Ti prego… possiamo uscirne entrambi, no? Non deve finire per forza così.",
  "PREDONE":
    "Oh, altra carne da macello. Non illuderti di morire da uomo… qui sei solo intrattenimento.",
  "GUARDIA CONTAMINATA": 
   "RRRAHHH! Detenuto individuato. SPEZZARE SCHIENA!",
  "CACCIATORE DI TAGLIE":
    "Finiamola in fretta. La tua testa vale una fortuna… e non ho intenzione di lasciarmela sfuggire.",
  "CAMPIONE":
    "Negli ultimi cinque anni nessuno è riuscito a sconfiggermi. E tu pensi di essere all'altezza? Sei solo l'ennesimo microbo venuto a reclamare un titolo che non potrà mai avere.",
  "IL SIGNORE DI IRONGRAVE":
    "Hai fatto impazzire la folla. Hai ucciso il mio campione… e adesso questi cani osano perfino acclamarti. È giunto il momento di ricordare a tutta Irongrave chi comanda davvero.",
};

// Variabili levelup
let levelupPunti = 5;
let levelupMin = {};

/* 2. INIZIALIZZAZIONE - Setup iniziale del gioco */

async function initgame() {
  //recupero il personaggio dal salvataggio e inizializzo il gioco
  player = await loadData();

  if (!player) {
    window.location.href = "index.html";
    return;
  }

  // Ricostruisci le armi dal ARMI object usando i nomi salvati
  // Ricostruisci arma primaria
  const armapKey =
    typeof player.armap === "string"
      ? getArmaKeyByName(player.armap)
      : getArmaKeyByName(player.armap.nome);
  player.armap = ARMI[armapKey] || ARMI.disarmato;

  // Ricostruisci arma secondaria
  const armasKey =
    typeof player.armas === "string"
      ? getArmaKeyByName(player.armas)
      : getArmaKeyByName(player.armas.nome);
  player.armas = ARMI[armasKey] || ARMI.disarmato;

  // Sincronizza i purchased flag da player.purchasedArmi ad ARMI
  (player.purchasedArmi || []).forEach((armaKey) => {
    ARMI[armaKey].purchased = true;
  });

  console.log(player);

  const bed = document.getElementById("letto");
  bed.addEventListener("click", menuSalvataggio);
  const celldoor = document.getElementById("sbarre");
  const shopdoor = document.getElementById("negozio-porta");
  shopdoor.addEventListener("click", caricaArena);

  // Setup menu di pausa
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
      e.preventDefault();
      if (gameState === "playing") {
        pauseGame();
      }
    }
  });

  //Dialogo introduttivo per nuovo personaggio
  if (!player.dialogog) {
    mostraDialogo(
      "GUARDIA",
      "Finalmente ti sei svegliato. Ti starai chiedendo dove ti trovi: sei rinchiuso nella prigione di Irongrave. Qui le regole sono semplici: combatti nell'arena e forse un giorno ti guadagnerai la libertà. Prima di buttarti in mezzo alle belve, il nostro fornitore può sistemarti, finchè paghi ovviamente. Ora datti una mossa.",
      "continua",
      async () => {
        player.dialogog = true;
        await saveData();
      },
      null,
      "img/Personaggi/guardia.png",
    );
  }

  //Dialogo con guardia default
  celldoor.addEventListener("click", () => {
    mostraDialogo(
      "GUARDIA",
      "Vuoi passare dal negozio o andare direttamente all'arena?",
      "scelta",
      caricaArena,
      caricaNegozio,
      "img/Personaggi/guardia.png",
    );
    document.getElementById("dialogo-scelta1").textContent = "Arena";
    document.getElementById("dialogo-scelta2").textContent = "Negozio";
  });

  //Primo dialogo con venditore
  document.getElementById("venditore").addEventListener("click", () => {
    if (!player.dialogov) {
      mostraDialogo(
        "VENDITORE",
        "Ah, una faccia nuova! Se vuoi sopravvivere qui dentro, ti conviene passare da me. Ho tutto quello che ti serve, e se non ce l'ho, posso procurartelo. Ovviamente tutto ha un prezzo, ma non puoi neanche entrare là dentro disarmato, quindi considera questo, oltre a 3 medikit, un regalo di benvenuto. Scegli e poi dirigiti all'arena tramite la porta a sinistra: ",
        "scelta",
        async () => {
          player.dialogov = true;
          player.armas = ARMI.falcetto;
          ARMI.falcetto.purchased = true;
          player.purchasedArmi.push("falcetto");
          player.medikit = 3;
          await saveData();
        },
        async () => {
          player.dialogov = true;
          player.armas = ARMI.pistolina;
          ARMI.pistolina.purchased = true;
          player.purchasedArmi.push("pistolina");
          player.medikit = 3;
          await saveData();
        },
        "img/Personaggi/venditore.png",
      );
      document.getElementById("dialogo-scelta1").textContent = "Falcetto";
      document.getElementById("dialogo-scelta2").textContent = "Pistolina";
    } else {
      mostraDialogo(
        "VENDITORE",
        "Non mi aspettavo sopravvivessi così tanto novellino, facciamo affari",
        "continua",
        apriNegozio,
        null,
        "img/Personaggi/venditore.png",
      );
    }
  });

  const closeShopBtn = document.getElementById("chiudi-negozio");

  // Inizializza i listener dei pulsanti di acquisto una sola volta
  initPulsantiAcquista();
  closeShopBtn.onclick = chiudiNegozio;

  const resumeBtn = document.getElementById("resume-btn");
  resumeBtn.onclick = resumeGame;

  const statsBtn = document.getElementById("stats-btn");
  statsBtn.onclick = openStats;

  const quitBtn = document.getElementById("quit-btn");
  quitBtn.onclick = quitGame;

  const closeBtn = document.getElementById("stats-close-btn");
  closeBtn.onclick = () => {
    const statsMenu = document.getElementById("stats-menu");
    const pauseMenu = document.getElementById("pause-menu");
    statsMenu.classList.add("hidden");
    pauseMenu.classList.remove("hidden");
  };

  // Inizializza bottoni battaglia
  const primbtn = document.getElementById("btn-primaria");
  primbtn.onclick = () => {
    const { danno, critico } = calcolaDanno(player, player.armap, nemico);
    logbattaglia(player, player.armap, nemico, danno, critico);
    attacco(danno, "nemico");
    standby(() => {
      checkbattlestates();
    });
  };

  const secbtn = document.getElementById("btn-secondaria");
  secbtn.onclick = () => {
    const { danno, critico } = calcolaDanno(player, player.armas, nemico);
    logbattaglia(player, player.armas, nemico, danno, critico);
    attacco(danno, "nemico");
    standby(() => {
      checkbattlestates();
    });
  };

  const curaBtn = document.getElementById("btn-curati");
  curaBtn.onclick = () => {
    player.medikit -= 1;
    logcura(player);
    myhp = Math.min(myhp + Math.round(player.salute * 0.4), player.salute);
    animaSprite(document.getElementById("img-giocatore"), "curato");
    aggiornaHud();
    document.getElementById("nome-medikit").textContent =
      "Medikit " + player.medikit + "/10";
    battleState = BATTLE_STATES.ENEMY_TURN;
    standby(() => {
      checkbattlestates();
    });
  };
}

/* 3. PAUSA E MENU - Gestione pause, statistiche, salvataggio */

function pauseGame() {
  gameState = "paused";
  const pauseMenu = document.getElementById("pause-menu");
  pauseMenu.classList.remove("hidden");
}

function resumeGame() {
  gameState = "playing";
  const pauseMenu = document.getElementById("pause-menu");
  pauseMenu.classList.add("hidden");
}

function openStats() {
  const statsMenu = document.getElementById("stats-menu");
  statsMenu.classList.remove("hidden");
  const pauseMenu = document.getElementById("pause-menu");
  pauseMenu.classList.add("hidden");

  // Popola i dati delle statistiche
  document.getElementById("stat-nome").textContent = player.nome;
  document.getElementById("stat-razza").textContent = player.razza;
  document.getElementById("stat-livello").textContent = player.livello;
  document.getElementById("stat-salute").textContent = player.salute;
  document.getElementById("stat-forza").textContent = player.forza;
  document.getElementById("stat-intelligenza").textContent =
    player.intelligenza;
  document.getElementById("stat-tenacia").textContent = player.tenacia;
  document.getElementById("stat-fortuna").textContent = player.fortuna;

  // Armi primaria e secondaria
  document.getElementById("stat-arma-primaria").textContent = player.armap.nome;
  document.getElementById("stat-arma-secondaria").textContent =
    player.armas.nome;
  document.getElementById("stat-cure").textContent = player.medikit + "/10";
}

function quitGame() {
  window.location.href = "index.html"; // Torna al menu principale
}

function menuSalvataggio() {
  const saveMenu = document.getElementById("save-menu");
  saveMenu.classList.remove("hidden");

  const saveYesBtn = document.getElementById("save-yes-btn");
  saveYesBtn.onclick = async () => {
    await saveData();
    closeMenu();
  };

  const saveNoBtn = document.getElementById("save-no-btn");
  saveNoBtn.onclick = closeMenu;
}

function closeMenu() {
  const saveMenu = document.getElementById("save-menu");
  saveMenu.classList.add("hidden");
}

/* 4. AMBIENTI - Caricamento ambienti di gioco */

function caricaNegozio() {
  const cell = document.getElementById("cella");
  cell.classList.add("hidden");
  const arena = document.getElementById("arena");
  arena.classList.add("hidden");
  const negozio = document.getElementById("negozio");
  negozio.classList.remove("hidden");
}

function getNemico() {
  const stage = {
    0: NEMICI.detenuto,
    1: NEMICI.predone,
    2: NEMICI.guardiaContaminata,
    3: NEMICI.cacciatoreDiTaglie,
    4: NEMICI.campione,
    5: NEMICI.signoreDiIrongrave,
  };
  return stage[player.livello];
}

function caricaArena() {
  const cell = document.getElementById("cella");
  cell.classList.add("hidden");
  const negozio = document.getElementById("negozio");
  negozio.classList.add("hidden");
  const arena = document.getElementById("arena");
  arena.classList.remove("hidden");

  //resetta il log
  const log = document.getElementById("log-testo");
  log.textContent = "Cosa vuoi fare?";

  // Imposta lo sprite del giocatore
  document.getElementById("img-giocatore").src = player.sprite;

  // Carica il nemico in base al livello
  nemico = getNemico();
  document.getElementById("img-nemico").src = nemico.sprite;

  //imposta salute
  myhp = player.salute;
  enemyhp = nemico.salute;

  // Dialogo di presentazione
  mostraDialogo(
    nemico.nome,
    dialoghi[nemico.nome],
    "continua",
    () => {
      battleState = BATTLE_STATES.PLAYER_TURN;
      checkbattlestates();
      aggiornaHud();
    },
    null,
    nemico.sprite,
  );

  // Inizializza i bottoni di combattimento
  initBottoniCombattimento();
}

function caricaCella() {
  const negozio = document.getElementById("negozio");
  negozio.classList.add("hidden");
  const arena = document.getElementById("arena");
  arena.classList.add("hidden");
  const cell = document.getElementById("cella");
  cell.classList.remove("hidden");
}

/* 5. DIALOGHI - Sistema di dialogo con sprite e scelte */

function mostraDialogo(nome, testo, tipo, callback1, callback2, sprite) {
  // popola il dialogo
  document.getElementById("dialogo-nome").textContent = nome;
  document.getElementById("dialogo-testo").textContent = testo;

  // imposta lo sprite se fornito
  if (sprite) {
    document.getElementById("dialogo-img").src = sprite;
  }

  // nascondi tutti i bottoni
  const continua = document.getElementById("dialogo-continua");
  const scelta1 = document.getElementById("dialogo-scelta1");
  const scelta2 = document.getElementById("dialogo-scelta2");
  continua.classList.add("hidden");
  scelta1.classList.add("hidden");
  scelta2.classList.add("hidden");

  if (tipo === "continua") {
    continua.classList.remove("hidden");
    continua.onclick = () => {
      chiudiDialogo();
      if (callback1) callback1();
    };
  } else if (tipo === "scelta") {
    scelta1.classList.remove("hidden");
    scelta2.classList.remove("hidden");
    scelta1.onclick = () => {
      chiudiDialogo();
      callback1();
    };
    scelta2.onclick = () => {
      chiudiDialogo();
      callback2();
    };
  }

  // mostra il dialogo
  document.getElementById("dialogo").classList.remove("hidden");
}

function chiudiDialogo() {
  document.getElementById("dialogo").classList.add("hidden");
}

/* 6. NEGOZIO - Sistema di acquisto armi e medikit */

function apriNegozio() {
  document.getElementById("menu-negozio").classList.remove("hidden");
  checkNegozio();
}

function chiudiNegozio() {
  document.getElementById("menu-negozio").classList.add("hidden");
}

function checkNegozio() {
  //il mio arsenale
  document.getElementById("equip-dollari").textContent = player.dollari + " $";
  document.getElementById("equip-primaria").textContent = player.armap.nome;
  document.getElementById("equip-secondaria").textContent = player.armas.nome;
  document.getElementById("equip-cure").textContent = player.medikit + "/10";

  const mischia = document.getElementById("lista-mischia");
  const distanza = document.getElementById("lista-distanza");
  const cure = document.getElementById("lista-cure");

  // Reset iniziale
  Array.from(mischia.children).forEach((e) => {
    const prezzo = e.querySelector(".shop-item-prezzo");
    const req = e.querySelector(".shop-item-req");
    const btn = e.querySelector(".shop-btn");

    prezzo.classList.remove("rosso");
    if (req) req.classList.remove("rosso");
    btn.disabled = false;
    e.classList.remove("disabilitato");
  });

  Array.from(distanza.children).forEach((e) => {
    const prezzo = e.querySelector(".shop-item-prezzo");
    const req = e.querySelector(".shop-item-req");
    const btn = e.querySelector(".shop-btn");

    prezzo.classList.remove("rosso");
    if (req) req.classList.remove("rosso");
    btn.disabled = false;
    e.classList.remove("disabilitato");
  });

  Array.from(cure.children).forEach((e) => {
    const prezzo = e.querySelector(".shop-item-prezzo");
    const btn = e.querySelector(".shop-btn");

    prezzo.textContent = "5 $";
    prezzo.classList.remove("rosso");
    btn.disabled = false;
    e.classList.remove("disabilitato");
  });

  for (let w in ARMI) {
    if (ARMI[w].prezzo === 0) continue; // Salta armi gratis
    if (ARMI[w].tipo === "mischia") {
      if (ARMI[w].purchased) {
        Array.from(mischia.children).forEach((e) => {
          if (e.querySelector(".shop-item-nome").textContent === ARMI[w].nome) {
            const prezzo = e.querySelector(".shop-item-prezzo");
            prezzo.textContent = "SOLD OUT";
            prezzo.classList.add("rosso");
            const btn = e.querySelector(".shop-btn");
            btn.disabled = true;
            e.classList.add("disabilitato");
          }
        });
      } else {
        if (player.dollari < ARMI[w].prezzo) {
          Array.from(mischia.children).forEach((e) => {
            if (
              e.querySelector(".shop-item-nome").textContent === ARMI[w].nome
            ) {
              const prezzo = e.querySelector(".shop-item-prezzo");
              prezzo.classList.add("rosso");
              const btn = e.querySelector(".shop-btn");
              btn.disabled = true;
              e.classList.add("disabilitato");
            }
          });
        }
      }
      if (player.forza < ARMI[w].requisiti) {
        Array.from(mischia.children).forEach((e) => {
          if (e.querySelector(".shop-item-nome").textContent === ARMI[w].nome) {
            const req = e.querySelector(".shop-item-req");
            req.classList.add("rosso");
            const btn = e.querySelector(".shop-btn");
            btn.disabled = true;
            e.classList.add("disabilitato");
          }
        });
      }
    }
    if (ARMI[w].tipo === "a distanza") {
      if (ARMI[w].purchased) {
        Array.from(distanza.children).forEach((e) => {
          if (e.querySelector(".shop-item-nome").textContent === ARMI[w].nome) {
            const prezzo = e.querySelector(".shop-item-prezzo");
            prezzo.textContent = "SOLD OUT";
            prezzo.classList.add("rosso");
            const btn = e.querySelector(".shop-btn");
            btn.disabled = true;
            e.classList.add("disabilitato");
          }
        });
      } else {
        if (player.dollari < ARMI[w].prezzo) {
          Array.from(distanza.children).forEach((e) => {
            if (
              e.querySelector(".shop-item-nome").textContent === ARMI[w].nome
            ) {
              const prezzo = e.querySelector(".shop-item-prezzo");
              prezzo.classList.add("rosso");
              const btn = e.querySelector(".shop-btn");
              btn.disabled = true;
              e.classList.add("disabilitato");
            }
          });
        }
      }
      if (player.intelligenza < ARMI[w].requisiti) {
        Array.from(distanza.children).forEach((e) => {
          if (e.querySelector(".shop-item-nome").textContent === ARMI[w].nome) {
            const req = e.querySelector(".shop-item-req");
            req.classList.add("rosso");
            const btn = e.querySelector(".shop-btn");
            btn.disabled = true;
            e.classList.add("disabilitato");
          }
        });
      }
    }
  }

  // Controllo medikit
  Array.from(cure.children).forEach((e) => {
    const prezzo = e.querySelector(".shop-item-prezzo");
    const btn = e.querySelector(".shop-btn");
    if (player.medikit === 10) {
      prezzo.textContent = "MAX";
      prezzo.classList.add("rosso");
      btn.disabled = true;
      e.classList.add("disabilitato");
    } else if (player.dollari < 5) {
      prezzo.classList.add("rosso");
      btn.disabled = true;
      e.classList.add("disabilitato");
    }
  });
}

function initPulsantiAcquista() {
  // Armi mischia
  document
    .getElementById("acquista-spada")
    .addEventListener("click", () => acquistaArma("spada", 10));
  document
    .getElementById("acquista-ascia")
    .addEventListener("click", () => acquistaArma("ascia", 20));
  document
    .getElementById("acquista-martello")
    .addEventListener("click", () => acquistaArma("martello", 35));

  // Armi a distanza
  document
    .getElementById("acquista-fucile")
    .addEventListener("click", () => acquistaArma("fucileassalto", 15));
  document
    .getElementById("acquista-pompa")
    .addEventListener("click", () => acquistaArma("fucilepompa", 30));
  document
    .getElementById("acquista-lanciagranate")
    .addEventListener("click", () => acquistaArma("lanciagranate", 50));

  // Medikit
  document
    .getElementById("acquista-cura")
    .addEventListener("click", acquistaMedikit);
}

async function acquistaArma(armaKey, prezzo) {
  if (player.dollari >= prezzo) {
    player.dollari -= prezzo;
    ARMI[armaKey].purchased = true;
    player.armap = ARMI[armaKey];
    player.purchasedArmi.push(armaKey);

    await saveData();
    checkNegozio();
  }
}

async function acquistaMedikit() {
  if (player.dollari >= 5 && player.medikit < 10) {
    player.dollari -= 5;
    player.medikit += 1;
    await saveData();
    checkNegozio();
  }
}

/* 7. LOGICA DI BATTAGLIA - Calcoli danni, turni, IA nemico */

function standby(callback) {
  document
    .querySelectorAll(".mossa-btn")
    .forEach((btn) => (btn.disabled = true));
  setTimeout(callback, 2000);
}

function calcolaDanno(attaccante, arma, difensore) {
  let stat;
  if (arma.tipo === "mischia") {
    stat = attaccante.forza;
  } else {
    stat = attaccante.intelligenza;
  }
  const dannoBase = arma.danno(stat);

  const probCritico = arma.critico + attaccante.fortuna * 5;
  const isCritico = Math.random() * 100 < probCritico;
  let dannoLordo;
  if (isCritico) {
    dannoLordo = Math.round(dannoBase * 2);
  } else {
    dannoLordo = dannoBase;
  }

  const riduzione = difensore.tenacia * 5;
  const dannoFinale = dannoLordo - Math.round(dannoLordo * (riduzione / 100));

  return { danno: dannoFinale, critico: isCritico };
}

function checkbattlestates() {
  const btnPrimaria = document.getElementById("btn-primaria");
  const btnSecondaria = document.getElementById("btn-secondaria");
  const btnCurati = document.getElementById("btn-curati");

  if (battleState === BATTLE_STATES.PLAYER_TURN) {
    btnPrimaria.disabled = false;
    btnSecondaria.disabled = false;
    btnCurati.disabled = false;
    if (player.medikit === 0 || myhp === player.salute) {
      btnCurati.disabled = true;
    }
  }

  if (battleState === BATTLE_STATES.ENEMY_TURN) {
    btnPrimaria.disabled = true;
    btnSecondaria.disabled = true;
    btnCurati.disabled = true;
    ianemico();
  }

  if (battleState === BATTLE_STATES.PLAYER_LOST) {
    standby(() => mostraSconfitta());
  }

  if (battleState === BATTLE_STATES.PLAYER_WON) {
    standby(() => mostraVittoria());
  }
}

function logbattaglia(attaccante, arma, difensore, danno, critico) {
  const log = document.getElementById("log-testo");
  log.textContent =
    attaccante.nome +
    " infligge " +
    danno +
    " danni a " +
    difensore.nome +
    " con " +
    arma.nome +
    (critico ? " (COLPO CRITICO!)" : "") +
    ".";
}

function logcura(utilizzatore) {
  const log = document.getElementById("log-testo");
  log.textContent =
    utilizzatore.nome +
    " recupera " +
    Math.min(Math.round(utilizzatore.salute * 0.4), player.salute - myhp) +
    " punti salute tramite un medikit.";
}

function attacconemicoprimaria() {
  const { danno, critico } = calcolaDanno(nemico, nemico.primaria, player);
  logbattaglia(nemico, nemico.primaria, player, danno, critico);
  attacco(danno, "player");
  standby(() => {
    checkbattlestates();
  });
}

function attacconemicosecondaria() {
  const { danno, critico } = calcolaDanno(nemico, nemico.secondaria, player);
  logbattaglia(nemico, nemico.secondaria, player, danno, critico);
  attacco(danno, "player");
  standby(() => {
    checkbattlestates();
  });
}

function ianemico() {
  if (nemico.primaria === ARMI.disarmato) {
    attacconemicosecondaria();
  } else if (nemico.secondaria === ARMI.disarmato) {
    attacconemicoprimaria();
  } else {
    //sceglie random 50 e 50 tra primaria e secondaria
    if (Math.random() < 0.5) {
      attacconemicoprimaria();
    } else {
      attacconemicosecondaria();
    }
  }
}

function attacco(danno, bersaglio) {
  if (bersaglio === "nemico") {
    enemyhp -= danno;
    animaSprite(document.getElementById("img-nemico"), "colpito");
    if (enemyhp <= 0) {
      battleState = BATTLE_STATES.PLAYER_WON;
    } else {
      battleState = BATTLE_STATES.ENEMY_TURN;
    }
  } else {
    myhp -= danno;
    animaSprite(document.getElementById("img-giocatore"), "colpito");
    if (myhp <= 0) {
      battleState = BATTLE_STATES.PLAYER_LOST;
    } else {
      battleState = BATTLE_STATES.PLAYER_TURN;
    }
  }
  aggiornaHud();
}

/* 8. HUD E ANIMAZIONI - Aggiornamento visuale e sprite */

function inizializzaBattaglia() {
  initBottoniCombattimento();
}

function initBottoniCombattimento() {
  const spritePrimaria = document.getElementById("sprite-primaria");
  spritePrimaria.replaceChildren();
  popolaSprite(spritePrimaria, player.armap);
  document.getElementById("nome-primaria").textContent = player.armap.nome;
  let dmg1 = document.getElementById("danno-primaria");
  if (player.armap.tipo === "mischia") {
    dmg1.textContent = player.armap.danno(player.forza) + " danni";
  } else {
    dmg1.textContent = player.armap.danno(player.intelligenza) + " danni";
  }

  const spriteSecondaria = document.getElementById("sprite-secondaria");
  spriteSecondaria.replaceChildren();
  popolaSprite(spriteSecondaria, player.armas);
  document.getElementById("nome-secondaria").textContent = player.armas.nome;
  let dmg2 = document.getElementById("danno-secondaria");
  if (player.armas.tipo === "mischia") {
    dmg2.textContent = player.armas.danno(player.forza) + " danni";
  } else {
    dmg2.textContent = player.armas.danno(player.intelligenza) + " danni";
  }

  document.getElementById("nome-medikit").textContent =
    "Medikit " + player.medikit + "/10";
  document.getElementById("danno-medikit").textContent =
    "+" + Math.round(player.salute * 0.4) + " punti salute";
  document.getElementById("btn-curati").disabled = player.medikit === 0;
}

function popolaSprite(container, arma) {
  container.replaceChildren();
  if (!arma) {
    return;
  }
  const img = document.createElement("img");
  const x = document.createElement("p");
  x.textContent = "✕";
  img.src = arma.sprite || "";
  img.alt = arma.nome || "arma";
  let elemento;
  if (arma.sprite) {
    elemento = img;
  } else {
    elemento = x;
  }
  container.appendChild(elemento);
}

function aggiornaHud() {
  const percPlayer = Math.max(0, (myhp / player.salute) * 100);
  const percNemico = Math.max(0, (enemyhp / nemico.salute) * 100);

  document.getElementById("bar-player").style.width = percPlayer + "%";
  document.getElementById("bar-nemico").style.width = percNemico + "%";

  document.getElementById("hud-hp-player").textContent =
    Math.max(0, myhp) + " / " + player.salute;
  document.getElementById("hud-hp-nemico").textContent =
    Math.max(0, enemyhp) + " / " + nemico.salute;
}

function animaSprite(elemento, classe) {
  elemento.classList.add(classe);
  elemento.addEventListener(
    "animationend",
    () => {
      elemento.classList.remove(classe);
    },
    { once: true },
  );
}

/* 9. VITTORIA E LEVELUP - Schermate di vittoria e progressione */

async function mostraVittoria() {
  // Se è il boss finale (livello 5 dopo increment), vai diretto all'epilogo
  if (player.livello === 5) {
    mostraEpilogo();
    return;
  }
  const dollariPrima = player.dollari;
  const livelloPrima = player.livello;
  player.dollari += nemico.dollari;
  player.livello += 1;
  await saveData();

  document.getElementById("vittoria-dollari").textContent =
    dollariPrima + " $  →  " + player.dollari + " $";
  document.getElementById("vittoria-livello").textContent =
    "LIVELLO " + livelloPrima + " → " + player.livello;

  document.getElementById("schermata-vittoria").classList.remove("hidden");

  document.getElementById("vittoria-continua-btn").onclick = () => {
    document.getElementById("schermata-vittoria").classList.add("hidden");
    mostraLevelup();
  };
}

function mostraLevelup() {
  levelupPunti = player.livello === 5 ? 6 : 5;
  levelupMin = {
    forza: player.forza,
    tenacia: player.tenacia,
    intelligenza: player.intelligenza,
    fortuna: player.fortuna,
  };

  document.getElementById("levelup-dollari").textContent =
    player.dollari + " $";
  document.getElementById("levelup-livello").textContent =
    "LVL " + player.livello;

  document.getElementById("levelup-forza").textContent = player.forza;
  document.getElementById("levelup-tenacia").textContent = player.tenacia;
  document.getElementById("levelup-intelligenza").textContent =
    player.intelligenza;
  document.getElementById("levelup-fortuna").textContent = player.fortuna;
  document.getElementById("levelup-points").textContent = levelupPunti;
  document.getElementById("levelup-conferma-btn").disabled = true;

  document.getElementById("schermata-levelup").classList.remove("hidden");

  document.querySelectorAll(".plus-btn").forEach((btn) => {
    btn.onclick = levelupPlus;
  });
  document.querySelectorAll(".minus-btn").forEach((btn) => {
    btn.onclick = levelupMinus;
  });

  document.getElementById("levelup-conferma-btn").onclick = confermaLevelup;
  levelupButtonCheck();
}

function levelupPlus(e) {
  const stat = e.target.dataset.stat;
  const el = document.getElementById("levelup-" + stat);
  if (parseInt(el.textContent) >= 10) return;
  el.textContent = parseInt(el.textContent) + 1;
  levelupPunti--;
  document.getElementById("levelup-points").textContent = levelupPunti;
  levelupButtonCheck();
}

function levelupMinus(e) {
  const stat = e.target.dataset.stat;
  const el = document.getElementById("levelup-" + stat);
  if (parseInt(el.textContent) <= levelupMin[stat]) return;
  el.textContent = parseInt(el.textContent) - 1;
  levelupPunti++;
  document.getElementById("levelup-points").textContent = levelupPunti;
  levelupButtonCheck();
}

function levelupButtonCheck() {
  document.querySelectorAll(".plus-btn").forEach((btn) => {
    const stat = btn.dataset.stat;
    const val = parseInt(
      document.getElementById("levelup-" + stat).textContent,
    );
    btn.disabled = levelupPunti === 0 || val >= 10;
  });
  document.querySelectorAll(".minus-btn").forEach((btn) => {
    const stat = btn.dataset.stat;
    const val = parseInt(
      document.getElementById("levelup-" + stat).textContent,
    );
    btn.disabled = val <= levelupMin[stat];
  });
  document.getElementById("levelup-conferma-btn").disabled = levelupPunti !== 0;
}

async function confermaLevelup() {
  player.forza = parseInt(document.getElementById("levelup-forza").textContent);
  player.tenacia = parseInt(
    document.getElementById("levelup-tenacia").textContent,
  );
  player.intelligenza = parseInt(
    document.getElementById("levelup-intelligenza").textContent,
  );
  player.fortuna = parseInt(
    document.getElementById("levelup-fortuna").textContent,
  );
  player.salute += 10;
  await saveData();
  document.getElementById("schermata-levelup").classList.add("hidden");
  caricaCella();
}

/* 10. SCONFITTA E EPILOGO - Fine partita e schermata finale */

function mostraSconfitta() {
  const schermata = document.getElementById("schermata-sconfitta");
  schermata.classList.remove("hidden");
  schermata.focus();
  document.removeEventListener("keydown", ricarica);
  document.addEventListener("keydown", ricarica);
}

function ricarica() {
  document.removeEventListener("keydown", ricarica);
  location.reload();
}

async function mostraEpilogo() {
  await fetch("php/storico.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: player.nome,
      razza: player.razza,
      livello: player.livello,
      arma_primaria: player.armap.nome,
      arma_secondaria: player.armas.nome,
      dollari: player.dollari,
    }),
  });

  // Dialogo del Signore
  mostraDialogo(
    nemico.nome,
    "Pensi davvero che sia finita? Certo… adesso uscirai da questa fogna e nessuno proverà a fermarti. Ma dimmi… sarai davvero libero? Tutto il sangue che hai versato non resterà dentro queste muri. Puoi lasciare Irongrave… ma Irongrave non lascerà mai te.",
    "continua",
    () => {
      chiudiDialogo();
      // Popola il testo dell'epilogo
      const negozio = document.getElementById("negozio");
      negozio.classList.add("hidden");
      const arena = document.getElementById("arena");
      arena.classList.add("hidden");
      const cell = document.getElementById("cella");
      cell.classList.add("hidden");
      document.getElementById("background2").classList.remove("hidden");
      document.getElementById("epilogo").classList.remove("hidden");
      document.addEventListener("keydown", tornaAlMenu);
    },
    null,
    nemico.sprite,
  );
}

function tornaAlMenu() {
  document.removeEventListener("keydown", tornaAlMenu);
  window.location.href = "index.html";
}
