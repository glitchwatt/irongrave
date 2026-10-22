<?php
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

// Validazione: controlla la lunghezza dello username (3-50 caratteri)
if(strlen($username) < 3 || strlen($username) > 50){
    http_response_code(400);
    echo json_encode(["errore" => "Username deve essere tra 3 e 50 caratteri"]);
    exit;
}

// Validazione: controlla che la password abbia almeno 4 caratteri
if(strlen($password) < 4){
    http_response_code(400);
    echo json_encode(["errore" => "Password deve essere di almeno 4 caratteri"]);
    exit;
}

try {
    // Controlla se lo username è già in uso nel database
    $stmt = $pdo->prepare("SELECT id FROM utenti WHERE username = ?");
    $stmt->execute([$username]);
    if($stmt->fetch()){
        http_response_code(409);
        echo json_encode(["errore" => "Username già in uso"]);
        exit;
    }

    // Genera un hash della password usando bcrypt (PASSWORD_DEFAULT)
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Inserisce il nuovo utente nel database con username e password hashata
    $stmt = $pdo->prepare("INSERT INTO utenti (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $hash]);

    // Registrazione riuscita
    echo json_encode(["successo" => true]);
} catch(PDOException $e){
    // Errore del database
    http_response_code(500);
    echo json_encode(["errore" => "Errore del server"]);
}
?>