<?php
// Avvia la sessione per verificare l'utente loggato
session_start();

// Imposta il response header come JSON
header("Content-Type: application/json");

// Include il file di connessione al database
require_once "db.php";

// Verifica che l'utente sia loggato (controlla la presenza di utente_id in sessione)
if(!isset($_SESSION["utente_id"])){
    http_response_code(401);
    echo json_encode(["errore" => "Non sei loggato"]);
    exit;
}

// Ottiene l'ID dell'utente loggato
$uid = $_SESSION["utente_id"];

try {
    // Recupera il salvataggio completo dell'utente dal database
    $stmt = $pdo->prepare("SELECT * FROM salvataggi WHERE utente_id = ?");
    $stmt->execute([$uid]);
    $save = $stmt->fetch(PDO::FETCH_ASSOC);

    // Se non esiste salvataggio, ritorna errore 404
    if(!$save){
        http_response_code(404);
        echo json_encode(["errore" => "Nessun salvataggio trovato"]);
        exit;
    }

    // Ritorna i dati del personaggio al client con conversioni di tipo appropriate
    echo json_encode([
        "nome" => $save["nome"],
        "razza" => $save["razza"],
        "sprite" => getSprite($save["razza"]),              // Determina lo sprite in base alla razza
        "livello" => (int)$save["livello"],                 // Converte a intero
        "dollari" => (int)$save["dollari"],
        "salute" => (int)$save["salute"],
        "forza" => (int)$save["forza"],
        "intelligenza" => (int)$save["intelligenza"],
        "tenacia" => (int)$save["tenacia"],
        "fortuna" => (int)$save["fortuna"],
        "armap" => $save["armap"],                          // Nome dell'arma primaria
        "armas" => $save["armas"],                          // Nome dell'arma secondaria
        "medikit" => (int)$save["medikit"],
        "dialogog" => (bool)$save["dialogog"],              // Converte a booleano
        "dialogov" => (bool)$save["dialogov"],
        "purchasedArmi" => json_decode($save["purchased_armi"] ?? "[]")  // Decodifica JSON array di armi acquistate
    ]);
} catch(PDOException $e){
    // Errore del database
    http_response_code(500);
    echo json_encode(["errore" => "Errore del server"]);
}

// Funzione helper: ritorna il percorso dello sprite in base alla razza
function getSprite($razza) {
    $sprites = [
        "Umano" => "img/Personaggi/eroeumano.png",
        "Contaminato" => "img/Personaggi/eroecontaminato.png",
        "Cyborg" => "img/Personaggi/eroecyborg.png"
    ];
    // Ritorna il sprite corrispondente o quello umano come default
    return $sprites[$razza] ?? "img/Personaggi/eroeumano.png";
}
?>