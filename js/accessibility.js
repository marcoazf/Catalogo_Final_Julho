// Add aria-label to icon buttons for accessibility
// This script runs after the page loads to improve accessibility

(function() {
    console.log('[ACCESSIBILITY] Adding aria-labels to icon buttons...');
    
    function addAriaLabels() {
        // Find all btn-icon elements with title
        var buttons = document.querySelectorAll('.btn-icon[title]');
        
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var title = btn.getAttribute('title');
            
            // Skip if already has aria-label
            if (btn.getAttribute('aria-label')) {
                continue;
            }
            
            // Add aria-label
            btn.setAttribute('aria-label', title);
            console.log('[ACCESSIBILITY] Added aria-label:', title, 'to:', btn);
        }
        
        console.log('[ACCESSIBILITY] Processed', buttons.length, 'icon buttons');
    }
    
    // Run immediately and also after a short delay to catch dynamic content
    addAriaLabels();
    setTimeout(addAriaLabels, 1000);
})();