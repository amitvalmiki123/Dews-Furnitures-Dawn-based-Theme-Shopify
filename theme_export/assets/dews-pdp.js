/* ==========================================================================
   Dew's Furniture — PDP interactions
   - Gallery thumbnail switching + click-to-zoom (pointer-following origin)
   - Sticky add-to-cart (shows once the buy row scrolls past)
   - Variant change sync: featured image + sticky price + wishlist data
   (FAQ accordion lives in script.js — shared with the homepage FAQ)
   ========================================================================== */
(function () {
  'use strict';

  function qs(sel, scope) {
    return (scope || document).querySelector(sel);
  }
  function qsa(sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ---------------- Gallery ---------------- */

  /* On mobile .gallery__thumbs becomes a horizontal rail roughly four thumbs
     wide, so most products have thumbs waiting off-screen. The old
     scrollIntoView({block:'nearest'}) only moved the rail when the tapped
     thumb was already hidden, which meant tapping the last thumb on screen did
     nothing and the rest could only be reached by dragging with a finger.

     This keeps two jobs in one place:
     - if the tapped thumb is cut off, scroll just enough to bring it in;
     - if it is fully visible but sits at the right edge of the rail, that is
       the last one on screen, so advance by one thumb and let the next ones
       slide in.
     The vertical desktop rail is unaffected and keeps the old behaviour. */

  /* element.scrollTo with options is fine everywhere now, but keep a plain
     assignment as a fallback rather than dropping the scroll entirely. */
  function scrollRailTo(rail, left) {
    if (rail.scrollTo) {
      try {
        rail.scrollTo({ left: left, behavior: 'smooth' });
        return;
      } catch (err) { /* fall through */ }
    }
    rail.scrollLeft = left;
  }

  function revealThumb(rail, thumb) {
    if (!rail || !thumb) return;

    var isHorizontalRail = rail.scrollWidth > rail.clientWidth + 1;
    if (!isHorizontalRail) {
      if (thumb.scrollIntoView) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    var maxScroll = rail.scrollWidth - rail.clientWidth;
    if (maxScroll <= 1) return;                 // everything already fits

    /* One thumb plus the gap after it. */
    var step = thumb.offsetWidth;
    var next = thumb.nextElementSibling;
    if (next && next.offsetLeft > thumb.offsetLeft) {
      step = next.offsetLeft - thumb.offsetLeft;
    }

    var railRect = rail.getBoundingClientRect();
    var thumbRect = thumb.getBoundingClientRect();
    var cutOffLeft = railRect.left - thumbRect.left;
    var cutOffRight = thumbRect.right - railRect.right;
    var margin = step * 0.15;

    if (cutOffRight > 0) {
      scrollRailTo(rail, rail.scrollLeft + cutOffRight + margin);
      return;
    }

    if (cutOffLeft > 0) {
      scrollRailTo(rail, rail.scrollLeft - cutOffLeft - margin);
      return;
    }

    /* Fully visible. Only advance when it is effectively the last one on
       screen, otherwise tapping a middle thumb would jog the rail. */
    if (railRect.right - thumbRect.right > step * 0.6) return;
    if (rail.scrollLeft >= maxScroll - 1) return;   // already at the far end

    scrollRailTo(rail, Math.min(rail.scrollLeft + step, maxScroll));
  }

  function initGallery() {
    var root = document.getElementById('gallery');
    if (!root) return;
    var main = document.getElementById('galleryMain');
    var img = document.getElementById('galleryImg');
    if (!main || !img) return;
    var thumbs = qsa('.gallery__thumb', root);

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var full = thumb.getAttribute('data-full');
        if (!full) return;
        img.src = full;
        thumbs.forEach(function (t) {
          var on = t === thumb;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
        });
        // Keep the selected thumbnail visible inside the scrollable rail, and
        // on mobile pull the next ones in when the last visible one is tapped.
        revealThumb(root.querySelector('.gallery__thumbs'), thumb);
        main.classList.remove('is-zoomed');
        img.style.transformOrigin = 'center';
      });
    });

    /* ---------------- zoom ----------------
       Desktop (mouse) is unchanged: click toggles the zoom and moving the
       pointer around the frame moves the zoomed region with it.

       Mobile (touch) used to be click-only, so the zoom always opened on the
       exact spot that was tapped and seeing another part of the product meant
       tapping to close and tapping again somewhere else. A finger now behaves
       like the mouse: rest it on the picture for a moment and the zoom opens
       on that spot, keep it down and slide and the zoom follows the finger,
       lift it and the zoom closes. A quick tap still toggles the zoom on and
       off, so nothing that worked before is lost. */

    var HOLD_MS  = 180;   // how long a finger must rest before the zoom opens
    var MOVE_TOL = 10;    // px of movement that counts as a slide, not a tap

    var holdTimer     = null;
    var sliding       = false;   // this gesture opened the zoom, so it closes it
    var skipNextClick = false;   // swallow the click a browser fires after a slide
    var startX = 0, startY = 0;

    function setOrigin(clientX, clientY) {
      var r = main.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var x = ((clientX - r.left) / r.width) * 100;
      var y = ((clientY - r.top) / r.height) * 100;
      /* Keep the zoom window inside the picture instead of showing blank
         space past the edges. */
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      img.style.transformOrigin = x + '% ' + y + '%';
    }

    function openZoom(clientX, clientY) {
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        setOrigin(clientX, clientY);
      }
      main.classList.add('is-zoomed');
    }

    function closeZoom() {
      main.classList.remove('is-zoomed');
      img.style.transformOrigin = 'center';
    }

    /* ---- mouse ---- */
    main.addEventListener('click', function () {
      if (skipNextClick) {
        skipNextClick = false;
        return;
      }
      if (main.classList.contains('is-zoomed')) {
        closeZoom();
      } else {
        openZoom();
      }
    });
    main.addEventListener('mousemove', function (e) {
      if (!main.classList.contains('is-zoomed')) return;
      setOrigin(e.clientX, e.clientY);
    });
    main.addEventListener('mouseleave', function () {
      closeZoom();
    });

    /* ---- touch: hold to zoom, slide to pan, lift to close ---- */
    function cancelHold() {
      if (holdTimer) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
    }

    main.addEventListener('touchstart', function (e) {
      skipNextClick = false;
      if (e.touches.length !== 1) {      // pinch or two fingers: never zoom
        cancelHold();
        if (sliding) {
          sliding = false;
          closeZoom();
        }
        return;
      }
      var t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      cancelHold();
      holdTimer = window.setTimeout(function () {
        holdTimer = null;
        sliding = true;
        openZoom(t.clientX, t.clientY);
      }, HOLD_MS);
    }, { passive: true });

    main.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      var moved = Math.abs(t.clientX - startX) > MOVE_TOL ||
                  Math.abs(t.clientY - startY) > MOVE_TOL;

      if (!sliding) {
        /* A plain swipe: let the page scroll and drop the pending hold. */
        if (moved) cancelHold();
        return;
      }
      /* Zooming — the finger pans the picture, so the page must not scroll
         underneath it. */
      if (e.cancelable) e.preventDefault();
      setOrigin(t.clientX, t.clientY);
    }, { passive: false });

    function endTouch() {
      cancelHold();
      if (!sliding) return;
      sliding = false;
      closeZoom();
      skipNextClick = true;
    }
    main.addEventListener('touchend', endTouch);
    main.addEventListener('touchcancel', endTouch);
    main.addEventListener('contextmenu', function (e) {
      /* no "save image" sheet while a long press is being used to zoom */
      if (sliding) e.preventDefault();
    });
  }

  /* ---------------- Sticky ATC ---------------- */
  function initStickyAtc() {
    var bar = document.getElementById('stickyAtc');
    var row = document.getElementById('buyRow');
    if (!bar || !row) return;

    var onScroll = function () {
      var past = row.getBoundingClientRect().bottom < 0;
      bar.classList.toggle('is-visible', past);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    // the sticky "Add to cart" button triggers the main product form
    var stickyBtn = qs('[data-sticky-submit]', bar);
    var mainForm = qs('product-info form[data-type="add-to-cart-form"]');
    if (stickyBtn && mainForm) {
      stickyBtn.addEventListener('click', function () {
        var submit = mainForm.querySelector('button[type="submit"]');
        if (submit && !submit.disabled) mainForm.requestSubmit ? mainForm.requestSubmit() : submit.click();
      });
    }
  }

  /* ---------------- Recently viewed (record this product) ---------------- */
  function recordRecentlyViewed() {
    try {
      var el = qs('script[data-recent-product]');
      if (!el) return;
      var data = JSON.parse(el.textContent);
      if (!data || !data.handle) return;

      var key = 'dews-recent';
      var list = [];
      try { list = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { list = []; }

      list = (list || []).filter(function (item) {
        return item && item.handle !== data.handle;
      });
      list.unshift(data);
      if (list.length > 8) list = list.slice(0, 8);

      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) { /* private mode / storage disabled — ignore */ }
  }

  /* ---------------- Variant change sync ---------------- */
  function initVariantSync() {
    try {
      if (typeof subscribe !== 'function' || typeof PUB_SUB_EVENTS === 'undefined' || !PUB_SUB_EVENTS.variantChange) return;
    } catch (e) {
      return;
    }

    subscribe(PUB_SUB_EVENTS.variantChange, function (event) {
      var variant = event && event.data && event.data.variant;
      if (!variant) return;

      // swap main gallery image to the variant's featured media (if present)
      if (variant.featured_media && variant.featured_media.src) {
        var img = document.getElementById('galleryImg');
        if (img) img.src = variant.featured_media.src;
      }

      // refresh the sticky price from the already-updated main price block
      var priceEl = qs('[data-sticky-price]');
      if (priceEl) {
        var src = qs('.pdp__price .price');
        if (src) priceEl.textContent = src.textContent.trim();
      }

      // keep the Wishlist Hero button's data in sync with the selected variant
      var wlBtn = qs('.buy__wishlist [data-wlh-id]');
      if (wlBtn && variant.id) {
        wlBtn.setAttribute('data-wlh-variantid', variant.id);
        wlBtn.setAttribute('data-wlh-link', window.location.origin + window.location.pathname + '?variant=' + variant.id);
        if (variant.price) wlBtn.setAttribute('data-wlh-price', (variant.price / 100).toString());
        var vImg = variant.featured_media && variant.featured_media.src
          ? variant.featured_media.src
          : (variant.featured_image && variant.featured_image.src ? variant.featured_image.src : null);
        if (vImg) wlBtn.setAttribute('data-wlh-image', vImg);
      }
    });
  }

  ready(function () {
    initGallery();
    initStickyAtc();
    initVariantSync();
    recordRecentlyViewed();
  });
})();
