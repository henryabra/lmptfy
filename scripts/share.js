/* ==========================================================================
   Share Module - Modal and Social Sharing Functionality
   ========================================================================== */

const ShareModule = (function() {
    // DOM Elements
    let modal;
    let modalBackdrop;
    let modalClose;
    let shareUrlInput;
    let copyBtn;
    let copyBtnText;
    let shareXBtn;
    let shareLinkedInBtn;
    let shareSlackBtn;
    let toast;
    let toastMessage;

    /**
     * Initialize the share module
     */
    function init() {
        // Cache DOM elements
        modal = document.getElementById('share-modal');
        modalBackdrop = document.getElementById('modal-backdrop');
        modalClose = document.getElementById('modal-close');
        shareUrlInput = document.getElementById('share-url');
        copyBtn = document.getElementById('copy-btn');
        copyBtnText = document.getElementById('copy-btn-text');
        shareXBtn = document.getElementById('share-x');
        shareLinkedInBtn = document.getElementById('share-linkedin');
        shareSlackBtn = document.getElementById('share-slack');
        toast = document.getElementById('toast');
        toastMessage = document.getElementById('toast-message');

        // Set up event listeners
        setupEventListeners();
    }

    /**
     * Set up all event listeners for share functionality
     */
    function setupEventListeners() {
        // Close modal events
        modalBackdrop.addEventListener('click', hideModal);
        modalClose.addEventListener('click', hideModal);

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                hideModal();
            }
        });

        // Copy button
        copyBtn.addEventListener('click', copyToClipboard);

        // Social share buttons
        shareXBtn.addEventListener('click', shareToX);
        shareLinkedInBtn.addEventListener('click', shareToLinkedIn);
        shareSlackBtn.addEventListener('click', shareToSlack);

        // Select URL on focus
        shareUrlInput.addEventListener('focus', () => {
            shareUrlInput.select();
        });
    }

    /**
     * Show the share modal with the generated URL
     * @param {string} url - The URL to share
     */
    function showModal(url) {
        shareUrlInput.value = url;
        modal.classList.remove('hidden');
        shareUrlInput.focus();
        shareUrlInput.select();
        trackEvent('share_modal_opened');
    }

    /**
     * Hide the share modal
     */
    function hideModal() {
        modal.classList.add('hidden');
        resetCopyButton();
        trackEvent('share_modal_closed');
    }

    /**
     * Copy the URL to clipboard
     */
    async function copyToClipboard() {
        const url = shareUrlInput.value;

        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for older browsers
                shareUrlInput.select();
                document.execCommand('copy');
            }

            // Update button state
            copyBtnText.textContent = 'Copied!';
            copyBtn.classList.add('btn-success');

            // Show toast
            showToast('Link copied to clipboard!');

            // Track event
            trackEvent('link_copied', { method: 'button' });

            // Reset button after delay
            setTimeout(resetCopyButton, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast('Failed to copy link');
        }
    }

    /**
     * Reset the copy button to its original state
     */
    function resetCopyButton() {
        copyBtnText.textContent = 'Copy';
        copyBtn.classList.remove('btn-success');
    }

    /**
     * Share to X (Twitter)
     */
    function shareToX() {
        const url = shareUrlInput.value;
        const text = "Someone asked me a question they could have easily searched themselves. Here's how to use Perplexity:";
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

        window.open(shareUrl, '_blank', 'width=550,height=420');
        trackEvent('shared_to_x');
    }

    /**
     * Share to LinkedIn
     */
    function shareToLinkedIn() {
        const url = shareUrlInput.value;
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

        window.open(shareUrl, '_blank', 'width=550,height=420');
        trackEvent('shared_to_linkedin');
    }

    /**
     * Share to Slack (copy formatted message)
     */
    async function shareToSlack() {
        const url = shareUrlInput.value;
        const message = `Here's how to use Perplexity: ${url}`;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(message);
            } else {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = message;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            showToast('Message copied for Slack!');
            trackEvent('shared_to_slack');
        } catch (err) {
            console.error('Failed to copy for Slack:', err);
            showToast('Failed to copy message');
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     */
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');

        // Trigger reflow for animation
        toast.offsetHeight;
        toast.classList.add('visible');

        // Hide after delay
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 250);
        }, 2500);
    }

    /**
     * Check if modal is currently visible
     * @returns {boolean}
     */
    function isModalVisible() {
        return !modal.classList.contains('hidden');
    }

    // Public API
    return {
        init,
        showModal,
        hideModal,
        showToast,
        isModalVisible
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ShareModule.init();
});
