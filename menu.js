// =================================================================
// ARCHIVO JAVASCRIPT MODIFICADO PARA UN LOGOUT LIMPIO
// =================================================================

// --- PASO 1: Añadimos la nueva variable global ---
var isLoggingOut = false; // Bandera para controlar el logout

var lastSelection = "";

function toggleSelection(selection) {
    if (lastSelection == false && lastSelection != "" && lastSelection != selection) {
        $(lastSelection).hide();
    }
    $("." + selection).toggle();
    lastSelection = selection;
}