<?php
// Avvia la sessione per accedere alle variabili di sessione
session_start();

// Imposta l'header per la risposta in formato JSON
header("Content-Type: application/json");

// Controlla se l'utente è loggato (verificando se utente_id esiste in $_SESSION)
if(isset($_SESSION["utente_id"])){
    // Se loggato, ritorna true con l'username
    echo json_encode([
        "loggato" => true,
        "username" => $_SESSION["username"]
    ]);
} else {
    // Se non loggato, ritorna false
    echo json_encode(["loggato" => false]);
}
?>