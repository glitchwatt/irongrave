<?php
// Avvia la sessione per gestire l'autenticazione
session_start();

// Imposta il response header come JSON
header("Content-Type: application/json");

// Include il file di connessione al database
require_once "db.php";

// Decodifica i dati JSON ricevuti dal client
$data = json_decode(file_get_contents("php://input"), true);

// Estrae e pulisce username e password dal payload
$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

// Validazione: controlla che username e password non siano vuoti
if(empty($username) || empty($password)){
    http_response_code(400);
    echo json_encode(["errore" => "Username e password obbligatori"]);
    exit;
}

try {
    // Cerca l'utente nel database dal suo username
    $stmt = $pdo->prepare("SELECT id, password FROM utenti WHERE username = ?");
    $stmt->execute([$username]);
    $utente = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verifica: se l'utente non esiste O la password non corrisponde, nega l'accesso
    if(!$utente || !password_verify($password, $utente["password"])){
        http_response_code(401);
        echo json_encode(["errore" => "Credenziali non valide"]);
        exit;
    }

    // Login riuscito: salva i dati nella sessione
    $_SESSION["utente_id"] = $utente["id"];
    $_SESSION["username"] = $username;

    // Ritorna successo con username al client
    echo json_encode(["successo" => true, "username" => $username]);
} catch(PDOException $e){
    // Errore del database
    http_response_code(500);
    echo json_encode(["errore" => "Errore del server"]);
}
?>