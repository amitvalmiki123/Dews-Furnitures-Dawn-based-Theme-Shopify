/* ==========================================================================
   Dew's PDP — Wishlist Hero cleanup
   The theme renders its own Wishlist Hero button in the buy row
   (snippets/wishlisthero-product-page.liquid). This removes the app's
   auto-injected product-page button (.wishlisthero-product-page-button-container)
   so there is never a duplicate button on the product page.
   ========================================================================== */
(function () {
  'use strict';

  var AUTO_SEL = '.wishlisthero-product-page-button-container';

  function removeAuto() {
    document.querySelectorAll(AUTO_SEL).forEach(function (el) {
      // keep it only if it landed inside our own slot (shouldn't happen)
      if (el.closest('.buy__wishlist')) return;
      el.remove();
    });
  }

  removeAuto();

  if ('MutationObserver' in window) {
    var obs = new MutationObserver(removeAuto);
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } else {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      removeAuto();
      if (tries >= 20) clearInterval(timer);
    }, 500);
  }

  document.addEventListener('shopify:section:load', removeAuto);
})();
