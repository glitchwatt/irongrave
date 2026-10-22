<?php
// Credenziali del database
$host = "localhost";        // Host del server MySQL
$dbname = "irongrave";      // Nome del database
$user = "root";             // Utente MySQL
$password = "";             // Password (vuota nel locale)

try {
    // Crea una connessione PDO al database MySQL con charset UTF-8
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    
    // Imposta la modalità di errore su eccezione (solleva eccezione se c'è un errore)
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Se la connessione fallisce, ritorna errore 500
    http_response_code(500);
    echo json_encode(["errore" => "Connessione al database fallita"]);
    exit;
}
?>