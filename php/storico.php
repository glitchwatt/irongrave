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

// Determina il metodo HTTP della richiesta (POST = salva, GET = recupera)
$method = $_SERVER["REQUEST_METHOD"];

// ============================================================
// POST: Salva una partita terminata nello storico
// ============================================================
if($method === "POST"){
    // Decodifica i dati della partita terminata ricevuti dal client
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        // Inserisce i dati della partita completata nel database
        $stmt = $pdo->prepare("INSERT INTO storico 
            (utente_id, nome_personaggio, razza, livello_raggiunto, arma_primaria, arma_secondaria, dollari_accumulati)
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $uid,
            $data["nome"],
            $data["razza"],
            $data["livello"],
            $data["arma_primaria"],
            $data["arma_secondaria"],
            $data["dollari"]
        ]);

        // Ritorna successo al client
        echo json_encode(["successo" => true]);
    } catch(PDOException $e){
        // Errore durante l'inserimento
        http_response_code(500);
        echo json_encode(["errore" => "Errore POST: " . $e->getMessage()]);
    }
}

// ============================================================
// GET: Recupera lo storico completo delle partite dell'utente
// ============================================================
if($method === "GET"){
    try {
        // Recupera tutti i dati di tutte le partite completate, ordinate per data (decrescente)
        $stmt = $pdo->prepare("SELECT nome_personaggio, razza, livello_raggiunto, arma_primaria, arma_secondaria, dollari_accumulati, data_partita 
            FROM storico 
            WHERE utente_id = ? 
            ORDER BY data_partita DESC");
        $stmt->execute([$uid]);
        $storico = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Ritorna l'array di partite al client
        echo json_encode($storico);
    } catch(PDOException $e){
        // Errore durante il recupero
        http_response_code(500);
        echo json_encode(["errore" => "Errore GET: " . $e->getMessage()]);
    }
}
?>