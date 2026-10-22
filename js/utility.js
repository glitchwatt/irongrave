/* 1. RAZZE - Configurazione delle razze e loro requisiti minimi */

const RACE_MINIMUMS = {
  Umano: { forza: 1, tenacia: 4, intelligenza: 2, fortuna: 2 },
  Contaminato: { forza: 4, tenacia: 2, intelligenza: 1, fortuna: 2 },
  Cyborg: { forza: 2, tenacia: 1, intelligenza: 4, fortuna: 2 },
};

/* 2. ARMI - Definizione di tutte le armi disponibili */

const ARMI = {
  disarmato: {
    nome: "DISARMATO",
    tipo: "mischia",
    requisiti: 0,
    danno: (forza) => Math.round(5 + forza * 0.1),
    critico: 10,
    prezzo: 0,
    sprite: null,
    purchased: true,
  },
  falcetto: {
    nome: "FALCETTO",
    tipo: "mischia",
    requisiti: 0,
    danno: (forza) => Math.round(7 + forza * 0.2),
    critico: 35,
    prezzo: 0,
    sprite: "img/Armi/falcetto.png",
    purchased: false,
  },
  spada: {
    nome: "SPADA",
    tipo: "mischia",
    requisiti: 2,
    danno: (forza) => Math.round(10 + forza * 0.4),
    critico: 15,
    prezzo: 10,
    sprite: "img/Armi/spada.png",
    purchased: false,
  },
  ascia: {
    nome: "ASCIA",
    tipo: "mischia",
    requisiti: 4,
    danno: (forza) => Math.round(15 + forza * 0.7),
    critico: 40,
    prezzo: 20,
    sprite: "img/Armi/ascia.png",
    purchased: false,
  },
  martello: {
    nome: "MARTELLO",
    tipo: "mischia",
    requisiti: 6,
    danno: (forza) => Math.round(20 + forza),
    critico: 25,
    prezzo: 35,
    sprite: "img/Armi/martello.png",
    purchased: false,
  },
  pistolina: {
    nome: "PISTOLINA",
    tipo: "a distanza",
    requisiti: 0,
    danno: (intelligenza) => Math.round(9 + intelligenza * 0.2),
    critico: 10,
    prezzo: 0,
    sprite: "img/Armi/pistolina.png",
    purchased: false,
  },
  fucileassalto: {
    nome: "FUCILE D'ASSALTO",
    tipo: "a distanza",
    requisiti: 3,
    danno: (intelligenza) => Math.round(13 + intelligenza * 0.4),
    critico: 13,
    prezzo: 15,
    sprite: "img/Armi/fucile-assalto.png",
    purchased: false,
  },
  fucilepompa: {
    nome: "FUCILE A POMPA",
    tipo: "a distanza",
    requisiti: 6,
    danno: (intelligenza) => Math.round(19 + intelligenza * 0.7),
    critico: 15,
    prezzo: 30,
    sprite: "img/Armi/fucile-a-pompa.png",
    purchased: false,
  },
  lanciagranate: {
    nome: "LANCIAGRANATE",
    tipo: "a distanza",
    requisiti: 9,
    danno: (intelligenza) => Math.round(25 + intelligenza),
    critico: 20,
    prezzo: 50,
    sprite: "img/Armi/lanciagranate.png",
    purchased: false,
  },
};

/* 3. NEMICI - Definizione di tutti i nemici dell'arena */
const NEMICI = {
  detenuto: {
    nome: "DETENUTO",
    sprite: "img/Personaggi/n1detenuto.png",
    salute: 50,
    forza: 3,
    intelligenza: 2,
    tenacia: 3,
    fortuna: 2,
    primaria: ARMI.disarmato,
    secondaria: ARMI.falcetto,
    dollari: 15,
  },
  predone: {
    nome: "PREDONE",
    sprite: "img/Personaggi/n2predone.png",
    salute: 60,
    forza: 4,
    intelligenza: 4,
    tenacia: 2,
    fortuna: 2,
    primaria: ARMI.spada,
    secondaria: ARMI.pistolina,
    dollari: 20,
  },
  guardiaContaminata: {
    nome: "GUARDIA CONTAMINATA",
    sprite: "img/Personaggi/n3guardiacontaminata.png",
    salute: 70,
    forza: 6,
    intelligenza: 2,
    tenacia: 5,
    fortuna: 2,
    primaria: ARMI.ascia,
    secondaria: ARMI.disarmato,
    dollari: 25,
  },
  cacciatoreDiTaglie: {
    nome: "CACCIATORE DI TAGLIE",
    sprite: "img/Personaggi/n4cacciatoreditaglie.png",
    salute: 80,
    forza: 6,
    intelligenza: 6,
    tenacia: 6,
    fortuna: 6,
    primaria: ARMI.fucilepompa,
    secondaria: ARMI.falcetto,
    dollari: 30,
  },
  campione: {
    nome: "CAMPIONE",
    sprite: "img/Personaggi/n5campione.png",
    salute: 90,
    forza: 8,
    intelligenza: 4,
    tenacia: 8,
    fortuna: 5,
    primaria: ARMI.martello,
    secondaria: ARMI.disarmato,
    dollari: 35,
  },
  signoreDiIrongrave: {
    nome: "IL SIGNORE DI IRONGRAVE",
    sprite: "img/Personaggi/n6ilsignorediirongrave.png",
    salute: 150,
    forza: 10,
    intelligenza: 10,
    tenacia: 10,
    fortuna: 10,
    primaria: ARMI.lanciagranate,
    secondaria: ARMI.martello,
    dollari: 0,
  },
};

/* 4. FUNZIONI DI SALVATAGGIO - Persistenza dati su server */

async function saveData() {
  try {
    const response = await fetch("php/save.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(player),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Errore salvataggio:", data.errore);
    }
  } catch (e) {
    console.error("Errore salvataggio:", e);
  }
}

async function loadData() {
  try {
    const response = await fetch("php/load.php");
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Errore caricamento:", e);
    return null;
  }
}

/* 5. FUNZIONI UTILITY - Helper e funzioni ausiliarie */

function getArmaKeyByName(nome) {
  for (let key in ARMI) {
    if (ARMI[key].nome === nome) {
      return key;
    }
  }
  return "disarmato"; // Default se non trovata
}

function createDevCharacter() {
  return {
    nome: "God",
    razza: "Umano",
    sprite: "img/Personaggi/eroeumano.png",
    livello: 5,
    dollari: 99999,
    salute: 100,
    forza: 10,
    intelligenza: 10,
    tenacia: 10,
    fortuna: 10,
    armap: ARMI.disarmato,
    armas: ARMI.disarmato,
    medikit: 0,
    dialogog: true,
    dialogov: true,
    purchasedArmi: [],
  };
}
