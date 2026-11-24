/* Shared, dependency-free interactions for every page. */
(function () {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (menu && nav) {
    const mobile = window.matchMedia('(max-width: 940px)');
    function syncMenu() {
      menu.hidden = !mobile.matches;
      nav.hidden = mobile.matches && menu.getAttribute('aria-expanded') !== 'true';
    }
    menu.addEventListener('click', function () {
      menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') !== 'true'));
      syncMenu();
    });
    nav.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mobile.matches) {
        menu.setAttribute('aria-expanded', 'false');
        syncMenu();
        menu.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (mobile.matches && !event.target.closest('.header-inner')) {
        menu.setAttribute('aria-expanded', 'false');
        syncMenu();
      }
    });
    mobile.addEventListener('change', syncMenu);
    syncMenu();
  }
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
  const backTop = document.querySelector('.back-top');
  if (backTop) {
    function syncTop() { backTop.hidden = window.scrollY < 650; }
    window.addEventListener('scroll', syncTop, { passive: true });
    syncTop();
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      document.querySelector('.brand').focus({ preventScroll: true });
    });
  }
  const params = new URLSearchParams(window.location.search);
  const interest = document.getElementById('contact-interest');
  if (interest && Array.from(interest.options).some(function (x) { return x.value === params.get('interest'); })) {
    interest.value = params.get('interest');
  }
  const contact = document.getElementById('contact-form');
  if (contact) {
    contact.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!contact.reportValidity()) return;
      const data = new FormData(contact);
      const body = 'Name: ' + data.get('name').trim() + '\nEmail: ' + data.get('email').trim() + '\n\n' + data.get('message').trim();
      const emailLink = 'mailto:info@skilledwomanfoundation.org?subject=' + encodeURIComponent(data.get('interest') + ' — website enquiry') + '&body=' + encodeURIComponent(body);
      const feedback = document.getElementById('contact-feedback');
      feedback.textContent = 'Your message is ready in your email app. Please press Send there to deliver it. If no app opens, email info@skilledwomanfoundation.org directly.';
      feedback.hidden = false;
      const fallback = document.getElementById('contact-email-fallback');
      fallback.href = emailLink;
      fallback.hidden = false;
      window.location.href = emailLink;
    });
  }
  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', async function () {
      const feedback = document.getElementById('copy-feedback');
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        feedback.textContent = 'Account number copied: ' + button.dataset.copy;
      } catch (_) {
        feedback.textContent = 'Please select and copy this account number: ' + button.dataset.copy;
      }
      feedback.hidden = false;
    });
  });
  const reference = document.getElementById('payment-reference');
  if (reference && params.get('reference')) {
    reference.textContent = 'Payment reference: ' + params.get('reference').slice(0, 200);
  }
})();
