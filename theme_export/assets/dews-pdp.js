/* ==========================================================================
   Dew's Furniture — PDP interactions
   - Gallery thumbnail switching + click-to-zoom (pointer-following origin)
   - Sticky add-to-cart (shows once the buy row scrolls past)
   - Variant change sync: featured image + sticky price + wishlist data
   - FAQ accordion (one open at a time, CSS grid animation)
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
        main.classList.remove('is-zoomed');
        img.style.transformOrigin = 'center';
      });
    });

    main.addEventListener('click', function () {
      main.classList.toggle('is-zoomed');
    });
    main.addEventListener('mousemove', function (e) {
      if (!main.classList.contains('is-zoomed')) return;
      var r = main.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      img.style.transformOrigin = x + '% ' + y + '%';
    });
    main.addEventListener('mouseleave', function () {
      main.classList.remove('is-zoomed');
      img.style.transformOrigin = 'center';
    });
  }

  /* ---------------- FAQ accordion (one open at a time) ----------------
     Opening/closing is handled in CSS via .faq__item.is-open (grid-template-rows
     0fr -> 1fr). The JS only flips the class + aria-expanded so height measurement
     (and any max-height:0 quirk) is never involved. */
  function initFaq() {
    var faqs = qsa('.faq');
    faqs.forEach(function (faq) {
      var items = qsa('.faq__item', faq);
      if (!items.length) return;

      var setOpen = function (item, state) {
        var btn = qs('.faq__q', item);
        item.classList.toggle('is-open', state);
        if (btn) btn.setAttribute('aria-expanded', String(state));
      };

      items.forEach(function (item) {
        var btn = qs('.faq__q', item);
        if (!btn) return;

        btn.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');
          items.forEach(function (other) { setOpen(other, false); });
          setOpen(item, willOpen);
        });
      });
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
    initFaq();
    initStickyAtc();
    initVariantSync();
    recordRecentlyViewed();
  });
})();
