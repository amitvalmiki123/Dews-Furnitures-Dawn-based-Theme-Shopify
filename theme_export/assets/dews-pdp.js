/* ==========================================================================
   Dew's Furniture — PDP interactions
   - Gallery thumbnail switching + click-to-zoom (pointer-following origin)
   - FAQ accordion (one open at a time)
   - Sticky add-to-cart (shows once the buy row scrolls past)
   - Variant change sync: featured image + sticky price (via Dawn pubsub)
   All safe no-ops when the relevant markup isn't on the page.
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

  /* ---------------- FAQ accordion ---------------- */
  function initFaq() {
    var items = qsa('.faq__item');
    if (!items.length) return;

    function setOpen(item, state) {
      var panel = qs('.faq__a', item);
      var btn = qs('.faq__q', item);
      item.classList.toggle('is-open', state);
      if (btn) btn.setAttribute('aria-expanded', String(state));
      if (panel) panel.style.maxHeight = state ? panel.scrollHeight + 'px' : '0px';
    }

    items.forEach(function (item) {
      var btn = qs('.faq__q', item);
      if (!btn) return;
      if (item.classList.contains('is-open')) setOpen(item, true);
      btn.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        items.forEach(function (other) { setOpen(other, false); });
        setOpen(item, willOpen);
      });
    });

    var resync = function () {
      items.forEach(function (item) {
        if (item.classList.contains('is-open')) setOpen(item, true);
      });
    };
    window.addEventListener('resize', resync);
    window.addEventListener('load', resync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resync);
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

      // refresh the sticky price from the already-updated price block
      var priceEl = qs('[data-sticky-price]');
      if (priceEl) {
        var src = qs('.pdp__price .price-item--sale') || qs('.pdp__price .price-item--regular') || qs('.pdp__price .price');
        if (src) priceEl.textContent = src.textContent.trim();
      }
    });
  }

  ready(function () {
    initGallery();
    initFaq();
    initStickyAtc();
    initVariantSync();
  });
})();
