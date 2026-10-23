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
    var track = document.getElementById('galleryTrack');
    if (!main || !track) return;
    var slides = qsa('.gallery__slide', track);
    var thumbs = qsa('.gallery__thumb', root);
    var count = slides.length;
    if (!count) return;
    var current = 0;
    slides.forEach(function (s, i) {
      s.draggable = false;
      if (s.classList.contains('is-current')) current = i;
    });

    function slideAt() {
      return slides[current] || null;
    }

    /* Translate the film-strip. dx is extra pixels from the finger; at rest
       it is 0 so the current photo sits flush in the frame. Rubber-band the
       ends so the strip doesn't fly off into empty space. */
    function applyTrack(dx, animate) {
      var w = main.getBoundingClientRect().width || 1;
      var shift = dx || 0;
      if (current === 0 && shift > 0) shift *= 0.38;
      if (current >= count - 1 && shift < 0) shift *= 0.38;
      if (animate) main.classList.remove('is-swiping');
      else main.classList.add('is-swiping');
      track.style.transform = 'translate3d(' + (-current * w + shift) + 'px,0,0)';
    }

    function selectIndex(i) {
      if (i < 0) i = 0;
      if (i >= count) i = count - 1;
      current = i;
      slides.forEach(function (s, j) {
        s.classList.toggle('is-current', j === i);
      });
      thumbs.forEach(function (t, j) {
        var on = j === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      if (thumbs[i]) {
        revealThumb(root.querySelector('.gallery__thumbs'), thumbs[i]);
      }
      main.classList.remove('is-zoomed');
      var img = slideAt();
      if (img) img.style.transformOrigin = 'center';
      applyTrack(0, true);
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        selectIndex(i);
      });
    });

    applyTrack(0, false);
    main.classList.remove('is-swiping');
    window.addEventListener('resize', function () {
      applyTrack(0, false);
      main.classList.remove('is-swiping');
    });

    /* ---------------- zoom + swipe ----------------
       Desktop (mouse) is unchanged: click toggles the zoom and moving the
       pointer around the frame moves the zoomed region with it.

       Mobile (touch) has two gestures on the SAME big image, decided by
       what the finger does in the first ~180ms:

         1. Quick HORIZONTAL flick → the film-strip follows the finger,
            then eases to the next / previous photo. No src-swap, so no jolt.
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
    var lastDx        = 0;
    var startX = 0, startY = 0, startAt = 0;

    function setOrigin(clientX, clientY) {
      var img = slideAt();
      if (!img) return;
      var r = main.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var x = ((clientX - r.left) / r.width) * 100;
      var y = ((clientY - r.top) / r.height) * 100;
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
      var img = slideAt();
      if (img) img.style.transformOrigin = 'center';
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
      startAt = Date.now();
      if (e.touches.length !== 1) {
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
        if (axisLock === 'x') return;
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

      if (axisLock === 'y') return;

      if (count < 2) return;
      lastDx = dx;
      applyTrack(dx, false);
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
      if (axisLock === 'x' && count > 1) {
        var dx = lastDx;
        var dt = Math.max(1, Date.now() - startAt);
        var flick = Math.abs(dx) > 28 && (Math.abs(dx) / dt) > 0.45;
        var next = current;
        if (dx <= -SWIPE_MIN || (dx < -28 && flick)) next = current + 1;
        else if (dx >= SWIPE_MIN || (dx > 28 && flick)) next = current - 1;
        selectIndex(next);
        skipNextClick = true;
        return;
      }
      applyTrack(0, true);
    }
    main.addEventListener('touchend', endTouch);
    main.addEventListener('touchcancel', endTouch);
    main.addEventListener('contextmenu', function (e) {
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

      // slide the gallery strip to the variant's featured media
      if (variant.featured_media && variant.featured_media.id) {
        var thumb = document.querySelector(
          '#gallery .gallery__thumb[data-media-id="' + variant.featured_media.id + '"]'
        );
        if (thumb) thumb.click();
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
