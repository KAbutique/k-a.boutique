// ============================================================
// joyas.js - Módulo Joyas
// ============================================================
(function() {
    'use strict';
    console.log('💎 Módulo Joyas cargado');

    const CATEGORY = 'Joyas';
    let isActive = false;

    function onCategoryLoaded() {
        console.log('💎 Cargando contenido de Joyas...');
        isActive = true;
        document.title = 'Joyas - K\'A Boutique';
        // Cambiar color de fondo o añadir banner específico
        document.querySelector('.hero-section').style.background = 'linear-gradient(135deg, rgba(255,154,0,0.1) 0%, rgba(255,94,0,0.05) 100%)';
        // Puedes agregar aquí lógica adicional específica para Joyas
    }

    function onCategoryUnloaded() {
        console.log('💎 Descargando contenido de Joyas...');
        isActive = false;
        // Restaurar fondo por defecto
        document.querySelector('.hero-section').style.background = '';
    }

    document.addEventListener('categoryChanged', function(e) {
        if (e.detail.category === CATEGORY) {
            onCategoryLoaded();
        } else if (isActive) {
            onCategoryUnloaded();
        }
    });

    document.addEventListener('categoryLoaded_Joyas', function(e) {
        // Lógica adicional si es necesario
    });

    // Inicialización
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (currentCategory === CATEGORY) onCategoryLoaded();
        });
    } else {
        if (currentCategory === CATEGORY) onCategoryLoaded();
    }
})();