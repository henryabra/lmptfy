/* ==========================================================================
   Animation Module - Playback Animation Orchestration
   ========================================================================== */

const AnimationModule = (function() {
    // Configuration
    const CONFIG = {
        brandingDuration: 1500,      // How long to show branding stage
        typingTotalDuration: 3000,   // Total time for typing animation
        minCharDelay: 30,            // Minimum delay between characters
        maxCharDelay: 150,           // Maximum delay between characters
        thinkingDuration: 1500,      // How long to show thinking indicator
        cursorMoveTime: 800,         // Time for cursor to move to input
        skipButtonDelay: 2000        // Delay before showing skip button
    };

    // State
    let timeouts = [];
    let isSkipped = false;
    let currentQuery = '';

    // DOM Elements
    let stageBranding;
    let stageInterface;
    let stageEnding;
    let skipBtn;
    let cursor;
    let typingInput;
    let searchSubmitBtn;
    let thinkingIndicator;

    /**
     * Initialize the animation module
     */
    function init() {
        // Cache DOM elements
        stageBranding = document.getElementById('stage-branding');
        stageInterface = document.getElementById('stage-interface');
        stageEnding = document.getElementById('stage-ending');
        skipBtn = document.getElementById('skip-btn');
        cursor = document.getElementById('cursor');
        typingInput = document.getElementById('typing-input');
        searchSubmitBtn = document.getElementById('search-submit-btn');
        thinkingIndicator = document.getElementById('thinking-indicator');

        // Set up skip button
        skipBtn.addEventListener('click', skip);
    }

    /**
     * Start the full animation sequence
     * @param {string} query - The query to type
     * @returns {Promise}
     */
    async function start(query) {
        currentQuery = query;
        isSkipped = false;
        clearTimeouts();

        trackEvent('animation_started');

        // Show skip button after delay
        addTimeout(() => {
            if (!isSkipped) {
                skipBtn.classList.remove('hidden');
            }
        }, CONFIG.skipButtonDelay);

        try {
            // Stage 1: Branding
            await showBrandingStage();
            if (isSkipped) return;

            // Stage 2: Interface with typing
            await showInterfaceStage();
            if (isSkipped) return;

            // Stage 3: Ending
            await showEndingStage();

            trackEvent('animation_completed');
        } catch (err) {
            if (!isSkipped) {
                console.error('Animation error:', err);
            }
        }
    }

    /**
     * Show the branding stage
     * @returns {Promise}
     */
    function showBrandingStage() {
        return new Promise((resolve) => {
            stageBranding.classList.remove('hidden');

            addTimeout(() => {
                if (!isSkipped) {
                    stageBranding.classList.add('hidden');
                    resolve();
                }
            }, CONFIG.brandingDuration);
        });
    }

    /**
     * Show the interface stage with typing animation
     * @returns {Promise}
     */
    async function showInterfaceStage() {
        return new Promise(async (resolve) => {
            stageInterface.classList.remove('hidden');

            // Only show cursor animation on desktop
            const isMobile = window.innerWidth <= 640;

            if (!isMobile) {
                await animateCursor();
                if (isSkipped) return resolve();
            }

            // Type the query
            await typeQuery(currentQuery);
            if (isSkipped) return resolve();

            // Click animation on submit button
            await clickSubmitButton();
            if (isSkipped) return resolve();

            // Show thinking indicator
            await showThinking();
            if (isSkipped) return resolve();

            // Hide interface and proceed
            stageInterface.classList.add('hidden');
            cursor.classList.add('hidden');
            resolve();
        });
    }

    /**
     * Animate cursor moving to input field
     * @returns {Promise}
     */
    function animateCursor() {
        return new Promise((resolve) => {
            const inputRect = typingInput.getBoundingClientRect();
            const targetX = inputRect.left + 100;
            const targetY = inputRect.top + inputRect.height / 2;

            // Start cursor from corner
            cursor.style.left = '100px';
            cursor.style.top = '100px';
            cursor.classList.remove('hidden');

            // Animate to input
            addTimeout(() => {
                cursor.style.transition = `left ${CONFIG.cursorMoveTime}ms cubic-bezier(0.4, 0, 0.2, 1), top ${CONFIG.cursorMoveTime}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                cursor.style.left = `${targetX}px`;
                cursor.style.top = `${targetY}px`;

                addTimeout(() => {
                    // Focus the input
                    typingInput.focus();
                    resolve();
                }, CONFIG.cursorMoveTime);
            }, 100);
        });
    }

    /**
     * Type the query character by character
     * @param {string} query - The query to type
     * @returns {Promise}
     */
    function typeQuery(query) {
        return new Promise((resolve) => {
            const chars = query.split('');
            const charCount = chars.length;

            // Calculate delay per character to fit within total duration
            let charDelay = CONFIG.typingTotalDuration / charCount;
            charDelay = Math.max(CONFIG.minCharDelay, Math.min(CONFIG.maxCharDelay, charDelay));

            let currentIndex = 0;
            typingInput.value = '';

            function typeNextChar() {
                if (isSkipped || currentIndex >= charCount) {
                    resolve();
                    return;
                }

                typingInput.value += chars[currentIndex];
                currentIndex++;

                // Add slight randomness to typing speed
                const randomDelay = charDelay + (Math.random() - 0.5) * (charDelay * 0.4);
                addTimeout(typeNextChar, randomDelay);
            }

            typeNextChar();
        });
    }

    /**
     * Animate clicking the submit button
     * @returns {Promise}
     */
    function clickSubmitButton() {
        return new Promise((resolve) => {
            const isMobile = window.innerWidth <= 640;

            if (!isMobile) {
                // Move cursor to button
                const btnRect = searchSubmitBtn.getBoundingClientRect();
                cursor.style.left = `${btnRect.left + btnRect.width / 2}px`;
                cursor.style.top = `${btnRect.top + btnRect.height / 2}px`;
            }

            addTimeout(() => {
                // Visual click effect
                searchSubmitBtn.classList.add('clicked');

                addTimeout(() => {
                    searchSubmitBtn.classList.remove('clicked');
                    resolve();
                }, 150);
            }, isMobile ? 300 : 400);
        });
    }

    /**
     * Show the thinking indicator
     * @returns {Promise}
     */
    function showThinking() {
        return new Promise((resolve) => {
            thinkingIndicator.classList.remove('hidden');

            addTimeout(() => {
                thinkingIndicator.classList.add('hidden');
                resolve();
            }, CONFIG.thinkingDuration);
        });
    }

    /**
     * Show the ending stage
     * @returns {Promise}
     */
    function showEndingStage() {
        return new Promise((resolve) => {
            skipBtn.classList.add('hidden');
            stageEnding.classList.remove('hidden');
            resolve();
        });
    }

    /**
     * Skip to the ending stage
     */
    function skip() {
        isSkipped = true;
        clearTimeouts();

        // Hide all stages except ending
        stageBranding.classList.add('hidden');
        stageInterface.classList.add('hidden');
        cursor.classList.add('hidden');
        skipBtn.classList.add('hidden');
        thinkingIndicator.classList.add('hidden');

        // Show ending
        stageEnding.classList.remove('hidden');

        trackEvent('animation_skipped');
    }

    /**
     * Add a timeout and track it for cleanup
     * @param {Function} callback - The callback function
     * @param {number} delay - The delay in milliseconds
     */
    function addTimeout(callback, delay) {
        const id = setTimeout(callback, delay);
        timeouts.push(id);
        return id;
    }

    /**
     * Clear all tracked timeouts
     */
    function clearTimeouts() {
        timeouts.forEach(id => clearTimeout(id));
        timeouts = [];
    }

    /**
     * Reset animation state
     */
    function reset() {
        isSkipped = false;
        clearTimeouts();

        // Hide all stages
        stageBranding.classList.add('hidden');
        stageInterface.classList.add('hidden');
        stageEnding.classList.add('hidden');
        skipBtn.classList.add('hidden');
        cursor.classList.add('hidden');
        thinkingIndicator.classList.add('hidden');

        // Reset input
        typingInput.value = '';
    }

    // Public API
    return {
        init,
        start,
        skip,
        reset
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AnimationModule.init();
});
