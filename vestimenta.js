// ============================================================
// vestimenta.js - Módulo Vestimenta
// ============================================================
(function() {
    'use strict';
    console.log('👕 Módulo Vestimenta cargado');

    const CATEGORY = 'Vestimenta';
    let isActive = false;

    function onCategoryLoaded() {
        console.log('👕 Cargando contenido de Vestimenta...');
        isActive = true;
        document.title = 'Vestimenta - K\'A Boutique';
        document.querySelector('.hero-section').style.background = 'linear-gradient(135deg, rgba(0,176,155,0.1) 0%, rgba(150,201,61,0.05) 100%)';
    }

    function onCategoryUnloaded() {
        console.log('👕 Descargando contenido de Vestimenta...');
        isActive = false;
        document.querySelector('.hero-section').style.background = '';
    }

    document.addEventListener('categoryChanged', function(e) {
        if (e.detail.category === CATEGORY) {
            onCategoryLoaded();
        } else if (isActive) {
            onCategoryUnloaded();
        }
    });

    document.addEventListener('categoryLoaded_Vestimenta', function(e) {
        // Lógica adicional
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (currentCategory === CATEGORY) onCategoryLoaded();
        });
    } else {
        if (currentCategory === CATEGORY) onCategoryLoaded();
    }
})();