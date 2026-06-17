// ============================================================
// perfumes.js - Módulo Perfumes
// ============================================================
(function() {
    'use strict';
    console.log('🧴 Módulo Perfumes cargado');

    const CATEGORY = 'Perfumes';
    let isActive = false;

    function onCategoryLoaded() {
        console.log('🧴 Cargando contenido de Perfumes...');
        isActive = true;
        document.title = 'Perfumes - K\'A Boutique';
        document.querySelector('.hero-section').style.background = 'linear-gradient(135deg, rgba(138,43,226,0.1) 0%, rgba(75,0,130,0.05) 100%)';
    }

    function onCategoryUnloaded() {
        console.log('🧴 Descargando contenido de Perfumes...');
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

    document.addEventListener('categoryLoaded_Perfumes', function(e) {
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