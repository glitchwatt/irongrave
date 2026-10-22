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

// Decodifica i dati di salvataggio ricevuti dal client
$data = json_decode(file_get_contents("php://input"), true);

// Ottiene l'ID dell'utente loggato
$uid = $_SESSION["utente_id"];

try {
    // Controlla se esiste già un salvataggio per questo utente
    $stmt = $pdo->prepare("SELECT id FROM salvataggi WHERE utente_id = ?");
    $stmt->execute([$uid]);
    $esistente = $stmt->fetch();

    // Converte l'array di armi acquistate in JSON per il salvataggio
    $purchased = json_encode($data["purchasedArmi"] ?? []);

    if($esistente){
        // Se il salvataggio esiste, lo aggiorna con i nuovi dati
        $stmt = $pdo->prepare("UPDATE salvataggi SET 
            nome = ?, razza = ?, livello = ?, dollari = ?,
            salute = ?, forza = ?, intelligenza = ?, tenacia = ?, fortuna = ?,
            armap = ?, armas = ?, medikit = ?, dialogog = ?, dialogov = ?,
            purchased_armi = ?
            WHERE utente_id = ?");
        $stmt->execute([
            $data["nome"], $data["razza"], $data["livello"], $data["dollari"],
            $data["salute"], $data["forza"], $data["intelligenza"], $data["tenacia"], $data["fortuna"],
            $data["armap"]["nome"], $data["armas"]["nome"], $data["medikit"],
            $data["dialogog"] ? 1 : 0, $data["dialogov"] ? 1 : 0,
            $purchased, $uid
        ]);
    } else {
        // Se il salvataggio non esiste, lo crea
        $stmt = $pdo->prepare("INSERT INTO salvataggi 
            (utente_id, nome, razza, livello, dollari, salute, forza, intelligenza, tenacia, fortuna, armap, armas, medikit, dialogog, dialogov, purchased_armi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $uid, $data["nome"], $data["razza"], $data["livello"], $data["dollari"],
            $data["salute"], $data["forza"], $data["intelligenza"], $data["tenacia"], $data["fortuna"],
            $data["armap"]["nome"], $data["armas"]["nome"], $data["medikit"],
            $data["dialogog"] ? 1 : 0, $data["dialogov"] ? 1 : 0,
            $purchased
        ]);
    }

    // Ritorna successo al client
    echo json_encode(["successo" => true]);
} catch(PDOException $e){
    // Errore del database
    http_response_code(500);
    echo json_encode(["errore" => "Errore del server"]);
}
?>