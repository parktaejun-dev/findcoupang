/**
 * Coupang Partners & Affiliate Link Detector
 * DOM-only Chrome Extension (No Network Requests)
 */

(function() {
  'use strict';

  // ============================================================================
  // Configuration
  // ============================================================================

  const CONFIG = {
    BADGE_TYPES: {
      RED: {
        className: 'coupang-badge-red',
        text: '쿠팡 링크',
        background: '#E60012',
        color: '#FFFFFF',
        title: '쿠팡 도메인 링크 감지'
      },
      YELLOW: {
        className: 'coupang-badge-yellow',
        text: '고지 문구',
        background: '#FFD700',
        color: '#000000',
        title: '대가성/제휴 고지 문구 근처 외부 링크'
      }
    },
    COUPANG_PATTERNS: [
      'coupang.com',
      'link.coupang.com',
      'coupa.ng'
    ],
    DISCLOSURE_REGEX: /쿠팡\s?파트너스|파트너스\s?활동|일정액의\s?수수료|수수료를\s?제공받|제휴\s?활동|대가성|협찬|원고료|대가를\s?제공받/i,
    DISCLOSURE_BLOCK_SELECTORS: ['p', 'li', 'div', 'section', 'article', 'span'],
    EXCLUDED_CONTAINERS: ['footer', 'nav', 'header', 'aside'],
    EXCLUDED_ROLES: ['contentinfo', 'navigation'],
    TEXT_LENGTH_MIN: 20,
    TEXT_LENGTH_MAX: 600
  };

  // ============================================================================
  // Utilities
  // ============================================================================

  class URLHelper {
    /**
     * Normalize hostname by removing common prefixes
     */
    static normalizeHostname(hostname) {
      if (!hostname) return '';
      return hostname.toLowerCase().replace(/^(www\.|m\.|amp\.)/, '');
    }

    /**
     * Check if URL is valid http/https
     */
    static isValidHttpUrl(url) {
      if (!url) return false;
      const lower = url.toLowerCase().trim();
      return lower.startsWith('http://') || lower.startsWith('https://');
    }

    /**
     * Check if link is external
     */
    static isExternalLink(linkHref, currentHostname) {
      try {
        const linkUrl = new URL(linkHref, window.location.href);
        const linkHostname = this.normalizeHostname(linkUrl.hostname);
        const currentNormalized = this.normalizeHostname(currentHostname);

        return linkHostname !== currentNormalized;
      } catch (e) {
        return false;
      }
    }

    /**
     * Check if element is inside excluded container
     */
    static isInExcludedContainer(element) {
      let current = element;
      while (current && current !== document.body) {
        const tagName = current.tagName?.toLowerCase();
        const role = current.getAttribute('role');

        if (CONFIG.EXCLUDED_CONTAINERS.includes(tagName)) {
          return true;
        }
        if (role && CONFIG.EXCLUDED_ROLES.includes(role)) {
          return true;
        }

        current = current.parentElement;
      }
      return false;
    }
  }

  // ============================================================================
  // Detector
  // ============================================================================

  class LinkDetector {
    constructor() {
      this.currentHostname = window.location.hostname;
      this.disclosureBlocksCache = new WeakSet();
    }

    /**
     * Detect if link is a Coupang partner link
     */
    isCoupangLink(href) {
      if (!href || !URLHelper.isValidHttpUrl(href)) {
        return false;
      }

      const lowerHref = href.toLowerCase();
      return CONFIG.COUPANG_PATTERNS.some(pattern => lowerHref.includes(pattern));
    }

    /**
     * Find disclosure blocks in the document
     */
    findDisclosureBlocks(root = document.body) {
      const blocks = [];

      for (const selector of CONFIG.DISCLOSURE_BLOCK_SELECTORS) {
        const elements = root.querySelectorAll(selector);

        for (const el of elements) {
          // Skip if already processed
          if (this.disclosureBlocksCache.has(el)) {
            continue;
          }

          // Skip if in excluded container
          if (URLHelper.isInExcludedContainer(el)) {
            continue;
          }

          const text = el.textContent || '';
          const textLength = text.trim().length;

          // Check text length constraints
          if (textLength < CONFIG.TEXT_LENGTH_MIN || textLength > CONFIG.TEXT_LENGTH_MAX) {
            continue;
          }

          // Check for disclosure keywords
          if (CONFIG.DISCLOSURE_REGEX.test(text)) {
            blocks.push(el);
            this.disclosureBlocksCache.add(el);
          }
        }
      }

      return blocks;
    }

    /**
     * Detect badge type for a link
     * @returns {string|null} 'RED', 'YELLOW', or null
     */
    detectBadgeType(linkElement) {
      const href = linkElement.getAttribute('href');

      // Check RED: Coupang link
      if (this.isCoupangLink(href)) {
        return 'RED';
      }

      // Check YELLOW: External link in disclosure block
      if (!URLHelper.isValidHttpUrl(href)) {
        return null;
      }

      if (!URLHelper.isExternalLink(href, this.currentHostname)) {
        return null;
      }

      // Check if link is inside a disclosure block
      let current = linkElement;
      while (current && current !== document.body) {
        if (this.disclosureBlocksCache.has(current)) {
          return 'YELLOW';
        }
        current = current.parentElement;
      }

      return null;
    }
  }

  // ============================================================================
  // Badge Renderer
  // ============================================================================

  class BadgeRenderer {
    constructor() {
      this.badgeClass = 'coupang-affiliate-badge';
      this.processedLinks = new WeakSet();
    }

    /**
     * Check if link already has a badge
     */
    isProcessed(linkElement) {
      return this.processedLinks.has(linkElement);
    }

    /**
     * Mark link as processed
     */
    markAsProcessed(linkElement) {
      this.processedLinks.add(linkElement);
    }

    /**
     * Create badge element
     */
    createBadge(badgeType) {
      const config = CONFIG.BADGE_TYPES[badgeType];
      const badge = document.createElement('span');

      badge.className = `${this.badgeClass} ${config.className}`;
      badge.textContent = config.text;
      badge.title = config.title;

      // Apply comprehensive styles to prevent CSS collisions
      badge.setAttribute('style', `
        all: unset;
        display: inline-flex !important;
        align-items: center !important;
        margin-left: 4px !important;
        padding: 2px 6px !important;
        border-radius: 4px !important;
        font-size: 11px !important;
        font-weight: 800 !important;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important;
        line-height: 1.2 !important;
        text-decoration: none !important;
        vertical-align: middle !important;
        box-sizing: border-box !important;
        white-space: nowrap !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        cursor: default !important;
        background: ${config.background} !important;
        color: ${config.color} !important;
      `.replace(/\n\s+/g, ' '));

      return badge;
    }

    /**
     * Render badge next to link
     */
    renderBadge(linkElement, badgeType) {
      // Skip if already processed
      if (this.isProcessed(linkElement)) {
        return;
      }

      // Create and insert badge
      const badge = this.createBadge(badgeType);

      try {
        // Insert after the link element
        if (linkElement.nextSibling) {
          linkElement.parentNode.insertBefore(badge, linkElement.nextSibling);
        } else {
          linkElement.parentNode.appendChild(badge);
        }

        // Mark as processed
        this.markAsProcessed(linkElement);
      } catch (e) {
        console.warn('[Coupang Detector] Failed to render badge:', e);
      }
    }

    /**
     * Remove all badges (for cleanup)
     */
    removeAllBadges() {
      const badges = document.querySelectorAll(`.${this.badgeClass}`);
      badges.forEach(badge => badge.remove());
    }
  }

  // ============================================================================
  // Observer Manager
  // ============================================================================

  class ObserverManager {
    constructor(detector, renderer) {
      this.detector = detector;
      this.renderer = renderer;
      this.observer = null;
      this.processingQueue = [];
      this.isProcessing = false;
    }

    /**
     * Process a single link element
     */
    processLink(linkElement) {
      const badgeType = this.detector.detectBadgeType(linkElement);
      if (badgeType) {
        this.renderer.renderBadge(linkElement, badgeType);
      }
    }

    /**
     * Process all links in a container
     */
    processContainer(container) {
      // First, find disclosure blocks in this container
      this.detector.findDisclosureBlocks(container);

      // Then process all links
      const links = container.querySelectorAll('a[href]');
      links.forEach(link => this.processLink(link));
    }

    /**
     * Initial scan of entire document
     */
    initialScan() {
      console.log('[Coupang Detector] Starting initial scan...');
      this.processContainer(document.body);
      console.log('[Coupang Detector] Initial scan complete');
    }

    /**
     * Handle DOM mutations (incremental scan)
     */
    handleMutations(mutations) {
      const elementsToProcess = new Set();

      for (const mutation of mutations) {
        // Process added nodes
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if node itself is a link
            if (node.tagName === 'A' && node.hasAttribute('href')) {
              elementsToProcess.add(node);
            }

            // Check if node contains links
            if (node.querySelectorAll) {
              const links = node.querySelectorAll('a[href]');
              links.forEach(link => elementsToProcess.add(link));

              // Also re-scan for disclosure blocks
              this.detector.findDisclosureBlocks(node);
            }
          }
        }
      }

      // Process all collected elements
      elementsToProcess.forEach(element => {
        if (!this.renderer.isProcessed(element)) {
          this.processLink(element);
        }
      });
    }

    /**
     * Start observing DOM changes
     */
    startObserving() {
      if (this.observer) {
        return;
      }

      this.observer = new MutationObserver((mutations) => {
        this.handleMutations(mutations);
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[Coupang Detector] MutationObserver started');
    }

    /**
     * Stop observing DOM changes
     */
    stopObserving() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
        console.log('[Coupang Detector] MutationObserver stopped');
      }
    }
  }

  // ============================================================================
  // Main Application
  // ============================================================================

  class AffiliateDetectorApp {
    constructor() {
      this.detector = new LinkDetector();
      this.renderer = new BadgeRenderer();
      this.observerManager = new ObserverManager(this.detector, this.renderer);
    }

    /**
     * Initialize the application
     */
    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.run());
      } else {
        this.run();
      }
    }

    /**
     * Run the detector
     */
    run() {
      console.log('[Coupang Detector] Initializing...');

      // Perform initial scan
      this.observerManager.initialScan();

      // Start observing for dynamic content
      this.observerManager.startObserving();

      console.log('[Coupang Detector] Ready');
    }

    /**
     * Cleanup
     */
    destroy() {
      this.observerManager.stopObserving();
      this.renderer.removeAllBadges();
      console.log('[Coupang Detector] Destroyed');
    }
  }

  // ============================================================================
  // Bootstrap
  // ============================================================================

  // Create and initialize the application
  const app = new AffiliateDetectorApp();
  app.init();

  // Expose to window for debugging (optional)
  if (typeof window !== 'undefined') {
    window.__coupangDetector = app;
  }

})();
