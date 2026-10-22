<?php
// Avvia la sessione per poterla distruggere
session_start();

// Distrugge completamente la sessione corrente (cancella i dati di login)
session_destroy();

// Imposta il response header come JSON
header("Content-Type: application/json");

// Ritorna successo al client
echo json_encode(["successo" => true]);
?>