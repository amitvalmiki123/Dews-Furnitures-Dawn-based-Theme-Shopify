/* ==========================================================================
   Dew's Furniture — PDP interactions
   - Gallery thumbnail switching + main-image swipe (touch) + click-to-zoom
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
    var current = 0;
    thumbs.forEach(function (thumb, i) {
      if (thumb.classList.contains('is-active')) current = i;
    });
    img.draggable = false;

    function selectIndex(i) {
      if (i < 0 || i >= thumbs.length) return;
      current = i;
      var thumb = thumbs[i];
      var full = thumb.getAttribute('data-full');
      if (full) img.src = full;
      thumbs.forEach(function (t, j) {
        var on = j === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      // Keep the selected thumbnail visible inside the scrollable rail, and
      // on mobile pull the next ones in when the last visible one is tapped.
      revealThumb(root.querySelector('.gallery__thumbs'), thumb);
      main.classList.remove('is-zoomed');
      img.style.transformOrigin = 'center';
      img.style.transform = '';
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        selectIndex(i);
      });
    });

    /* ---------------- zoom + swipe ----------------
       Desktop (mouse) is unchanged: click toggles the zoom and moving the
       pointer around the frame moves the zoomed region with it.

       Mobile (touch) has two gestures on the SAME big image, decided by
       what the finger does in the first ~180ms:

         1. Quick HORIZONTAL flick  → next / previous photo
            (this is the missing piece — thumbs already slid, the parent
            image did not).
         2. Rest the finger, then slide → zoom opens on that spot and
            follows the finger; lift closes it. A quick TAP still toggles
            zoom, same as before.
         3. VERTICAL move → the page scrolls. We never call preventDefault
            on a vertical gesture, and .gallery__main is not touch-action:none.
    */

    var HOLD_MS   = 180;  // how long a finger must rest before the zoom opens
    var MOVE_TOL  = 10;   // px before we decide "this is a slide, not a tap"
    var SWIPE_MIN = 48;   // px of horizontal travel that changes the photo

    var holdTimer     = null;
    var sliding       = false;  // this gesture opened the zoom, so it closes it
    var skipNextClick = false;  // swallow the click a browser fires after a slide
    var axisLock      = null;   // 'x' | 'y' | null — decided once per gesture
    var lastDx        = 0;      // horizontal travel of the current gesture
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

    function clearSwipe() {
      main.classList.remove('is-swiping');
      img.style.transform = '';
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

    /* ---- touch ---- */
    function cancelHold() {
      if (holdTimer) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
    }

    main.addEventListener('touchstart', function (e) {
      skipNextClick = false;
      axisLock = null;
      lastDx = 0;
      clearSwipe();
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
      /* Don't arm the zoom hold if there is only one photo — swipe would
         do nothing anyway, and a still finger should still zoom. */
      holdTimer = window.setTimeout(function () {
        holdTimer = null;
        if (axisLock === 'x') return;    // already committed to a photo swipe
        sliding = true;
        openZoom(t.clientX, t.clientY);
      }, HOLD_MS);
    }, { passive: true });

    main.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      var absX = Math.abs(dx);
      var absY = Math.abs(dy);

      /* Zooming — the finger pans the picture, so the page must not scroll
         underneath it. Photo-swipe is disabled while zoomed. */
      if (sliding) {
        if (e.cancelable) e.preventDefault();
        setOrigin(t.clientX, t.clientY);
        return;
      }

      if (!axisLock) {
        if (absX <= MOVE_TOL && absY <= MOVE_TOL) return;
        axisLock = absX > absY ? 'x' : 'y';
        cancelHold();
      }

      if (axisLock === 'y') return;      // page scroll — do not preventDefault

      /* Horizontal photo swipe. */
      if (thumbs.length < 2) return;
      lastDx = dx;
      main.classList.add('is-swiping');
      img.style.transform = 'translateX(' + dx + 'px)';
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    function endTouch() {
      cancelHold();
      if (sliding) {
        sliding = false;
        closeZoom();
        skipNextClick = true;
        return;
      }
      if (axisLock === 'x' && thumbs.length > 1) {
        var dx = lastDx;
        clearSwipe();
        if (dx <= -SWIPE_MIN) selectIndex(current + 1);
        else if (dx >= SWIPE_MIN) selectIndex(current - 1);
        skipNextClick = true;
        return;
      }
      clearSwipe();
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
