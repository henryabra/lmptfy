/* ==========================================================================
   Analytics - Google Analytics Wrapper
   ========================================================================== */

/**
 * Track an event to Google Analytics
 * @param {string} eventName - The name of the event
 * @param {Object} params - Optional parameters to send with the event
 */
function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
}
