// ============================================================
// accesorios.js - Módulo Accesorios
// ============================================================
(function() {
    'use strict';
    console.log('👜 Módulo Accesorios cargado');

    const CATEGORY = 'Accesorios';
    let isActive = false;

    function onCategoryLoaded() {
        console.log('👜 Cargando contenido de Accesorios...');
        isActive = true;
        document.title = 'Accesorios - K\'A Boutique';
        document.querySelector('.hero-section').style.background = 'linear-gradient(135deg, rgba(255,154,0,0.08) 0%, rgba(255,94,0,0.03) 100%)';
    }

    function onCategoryUnloaded() {
        console.log('👜 Descargando contenido de Accesorios...');
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

    document.addEventListener('categoryLoaded_Accesorios', function(e) {
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