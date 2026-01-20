/* ==========================================================================
   Main Application Logic - Let Me Perplexity That For You
   ========================================================================== */

const App = (function() {
    // Perplexity URL
    const PERPLEXITY_URL = 'https://www.perplexity.ai/search?q=';

    // URL encoding prefix
    const ENCODING_PREFIX = 'b64.';

    // State
    const state = {
        query: '',
        isPlaybackMode: false,
        countdownInterval: null,
        countdownValue: 5
    };

    // DOM Elements
    let homepage;
    let playback;
    let queryForm;
    let queryInput;
    let goNowBtn;
    let cancelBtn;
    let countdownEl;
    let countdownText;
    let progressBar;

    /**
     * Initialize the application
     */
    function init() {
        // Cache DOM elements
        homepage = document.getElementById('homepage');
        playback = document.getElementById('playback');
        queryForm = document.getElementById('query-form');
        queryInput = document.getElementById('query-input');
        goNowBtn = document.getElementById('go-now-btn');
        cancelBtn = document.getElementById('cancel-btn');
        countdownEl = document.getElementById('countdown');
        countdownText = document.getElementById('countdown-text');
        progressBar = document.getElementById('countdown-progress-bar');

        // Set up event listeners
        setupEventListeners();

        // Check for query parameter
        checkForPlayback();
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Form submission
        queryForm.addEventListener('submit', handleFormSubmit);

        // Go to Perplexity button
        goNowBtn.addEventListener('click', goToPerplexity);

        // Cancel button
        cancelBtn.addEventListener('click', cancelCountdown);

        // Handle browser back/forward
        window.addEventListener('popstate', handlePopState);
    }

    /**
     * Check URL for query parameter and start playback if present
     */
    function checkForPlayback() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedQuery = urlParams.get('q');

        if (encodedQuery) {
            // Decode the query
            state.query = decodeQuery(encodedQuery);

            if (state.query) {
                startPlayback();
            } else {
                // Invalid query, show homepage
                showHomepage();
            }
        } else {
            showHomepage();
        }
    }

    /**
     * Handle form submission
     * @param {Event} e - The submit event
     */
    function handleFormSubmit(e) {
        e.preventDefault();

        const query = queryInput.value.trim();

        if (!query) {
            queryInput.focus();
            return;
        }

        state.query = query;

        // Generate shareable URL
        const shareUrl = generateShareUrl(query);

        // Show share modal
        ShareModule.showModal(shareUrl);

        trackEvent('link_generated', { query_length: query.length });
    }

    /**
     * Generate a shareable URL with encoded query
     * @param {string} query - The query to encode
     * @returns {string} The shareable URL
     */
    function generateShareUrl(query) {
        const encoded = encodeQuery(query);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?q=${encoded}`;
    }

    /**
     * Encode a query string for URL
     * @param {string} query - The query to encode
     * @returns {string} The encoded query
     */
    function encodeQuery(query) {
        try {
            // Use base64 encoding with prefix
            const encoded = btoa(encodeURIComponent(query));
            return ENCODING_PREFIX + encoded;
        } catch (err) {
            // Fallback to simple URI encoding
            console.error('Base64 encoding failed:', err);
            return encodeURIComponent(query);
        }
    }

    /**
     * Decode a query string from URL
     * @param {string} encoded - The encoded query
     * @returns {string} The decoded query
     */
    function decodeQuery(encoded) {
        try {
            if (encoded.startsWith(ENCODING_PREFIX)) {
                // Base64 encoded
                const base64 = encoded.slice(ENCODING_PREFIX.length);
                return decodeURIComponent(atob(base64));
            } else {
                // Plain URI encoded (legacy support)
                return decodeURIComponent(encoded);
            }
        } catch (err) {
            console.error('Decoding failed:', err);
            return null;
        }
    }

    /**
     * Show the homepage view
     */
    function showHomepage() {
        state.isPlaybackMode = false;
        homepage.classList.remove('hidden');
        playback.classList.add('hidden');

        // Focus input
        queryInput.focus();

        trackEvent('homepage_viewed');
    }

    /**
     * Start playback mode
     */
    function startPlayback() {
        state.isPlaybackMode = true;
        homepage.classList.add('hidden');
        playback.classList.remove('hidden');

        // Start animation
        AnimationModule.start(state.query).then(() => {
            // Animation complete, start countdown
            startCountdown();
        });

        trackEvent('playback_started', { query_length: state.query.length });
    }

    /**
     * Start the countdown timer
     */
    function startCountdown() {
        state.countdownValue = 5;
        updateCountdownDisplay();

        // Reset and animate progress bar
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '100%';
            // Force reflow
            progressBar.offsetHeight;
            progressBar.style.transition = 'width 5s linear';
            progressBar.style.width = '0%';
        }

        state.countdownInterval = setInterval(() => {
            state.countdownValue--;
            updateCountdownDisplay();

            if (state.countdownValue <= 0) {
                clearInterval(state.countdownInterval);
                goToPerplexity();
            }
        }, 1000);
    }

    /**
     * Update the countdown display
     */
    function updateCountdownDisplay() {
        if (countdownEl) {
            countdownEl.textContent = state.countdownValue;
        }
    }

    /**
     * Cancel the countdown
     */
    function cancelCountdown() {
        // Clear the interval
        if (state.countdownInterval) {
            clearInterval(state.countdownInterval);
            state.countdownInterval = null;
        }

        // Stop progress bar animation
        if (progressBar) {
            const currentWidth = progressBar.offsetWidth;
            progressBar.style.transition = 'none';
            progressBar.style.width = `${currentWidth}px`;
        }

        // Update UI to show cancelled state
        if (countdownText) {
            countdownText.textContent = 'Redirect cancelled';
            countdownText.classList.add('cancelled');
        }

        // Hide cancel button
        cancelBtn.classList.add('hidden');

        trackEvent('countdown_cancelled');
    }

    /**
     * Navigate to Perplexity with the query
     */
    function goToPerplexity() {
        // Clear countdown if running
        if (state.countdownInterval) {
            clearInterval(state.countdownInterval);
        }

        // Build Perplexity URL
        const perplexityUrl = PERPLEXITY_URL + encodeURIComponent(state.query);

        trackEvent('redirected_to_perplexity', { query_length: state.query.length });

        // Navigate
        window.location.href = perplexityUrl;
    }

    /**
     * Handle browser back/forward navigation
     * @param {PopStateEvent} e - The popstate event
     */
    function handlePopState(e) {
        // Reset animation state
        AnimationModule.reset();

        // Clear countdown
        if (state.countdownInterval) {
            clearInterval(state.countdownInterval);
        }

        // Re-check URL
        checkForPlayback();
    }

    // Public API
    return {
        init
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
