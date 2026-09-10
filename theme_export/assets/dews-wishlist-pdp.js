/* ==========================================================================
   Dew's PDP — Wishlist Hero placement
   Moves Wishlist Hero's automatic product-page button
   (.wishlisthero-product-page-button-container) into the design's buy row,
   sitting after the "Add to cart" submit (inside the [data-wishlist-slot]).
   ========================================================================== */
(function () {
  'use strict';

  var SLOT_SEL = '.pdp__info .buy [data-wishlist-slot]';
  var BTN_SEL = '.wishlisthero-product-page-button-container';
  var DONE_CLASS = 'dews-wishlist-inline';

  function place() {
    var slot = document.querySelector(SLOT_SEL);
    if (!slot) return;
    var btn = document.querySelector(BTN_SEL + ':not(.' + DONE_CLASS + ')');
    if (!btn) return;

    slot.appendChild(btn);
    btn.classList.add(DONE_CLASS);

    btn.querySelectorAll('button:not([type])').forEach(function (b) {
      b.setAttribute('type', 'button');
    });
  }

  place();

  if ('MutationObserver' in window) {
    var obs = new MutationObserver(place);
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } else {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      place();
      if (tries >= 20) clearInterval(timer);
    }, 500);
  }

  document.addEventListener('shopify:section:load', place);
})();
