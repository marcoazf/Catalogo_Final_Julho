// Expose global objects for bind system
// This file must be loaded after all other modules but before bind.js

(function() {
    console.log('[GLOBALS] Starting exposure...');
    
    // Expose to window so data-onclick attributes can find them
    if (typeof APP_STATE !== 'undefined') {
        window.APP_STATE = APP_STATE;
        console.log('[GLOBALS] APP_STATE exposed');
    } else {
        console.log('[GLOBALS] APP_STATE not found');
    }
    
    if (typeof Storage !== 'undefined') {
        window.Storage = Storage;
        console.log('[GLOBALS] Storage exposed');
    } else {
        console.log('[GLOBALS] Storage not found');
    }
    
    if (typeof Render !== 'undefined') {
        window.Render = Render;
        console.log('[GLOBALS] Render exposed');
    } else {
        console.log('[GLOBALS] Render not found');
    }
    
    if (typeof Logic !== 'undefined') {
        window.Logic = Logic;
        console.log('[GLOBALS] Logic exposed');
    } else {
        console.log('[GLOBALS] Logic not found');
    }
    
    if (typeof UI !== 'undefined') {
        window.UI = UI;
        console.log('[GLOBALS] UI exposed');
    } else {
        console.log('[GLOBALS] UI not found');
    }
    
    console.log('[GLOBALS] Exposure complete');
    
    // Test if Logic is available
    if (typeof window.Logic !== 'undefined' && typeof window.Logic.setMainView === 'function') {
        console.log('[GLOBALS] Logic.setMainView is available');
    } else {
        console.log('[GLOBALS] Logic.setMainView NOT available');
    }
})();