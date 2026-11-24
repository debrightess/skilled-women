/* Configure only the Paystack PUBLIC key below. Never put a secret key in this repository. */
(function () {
  'use strict';
  const PAYSTACK_PUBLIC_KEY = ''; // Add the approved foundation's pk_live_... public key here.
  const enabled = /^pk_live_[a-zA-Z0-9]+$/.test(PAYSTACK_PUBLIC_KEY);
  const causes = {
    vocational: 'Vocational Skills Training', business: 'Entrepreneurship Support',
    education: 'Education & Literacy', digital: 'ICT & Digital Skills',
    health: 'Health & Wellbeing', advocacy: 'Gender Rights & Advocacy', general: 'General Fund'
  };
  let sdk;
  function loadCheckout() {
    if (!sdk) sdk = new Promise(function (resolve, reject) {
      if (window.PaystackPop) { resolve(window.PaystackPop); return; }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.onload = function () { window.PaystackPop ? resolve(window.PaystackPop) : reject(new Error('Checkout unavailable')); };
      script.onerror = function () { script.remove(); reject(new Error('Checkout unavailable')); };
      document.head.appendChild(script);
    }).catch(function (error) { sdk = undefined; throw error; });
    return sdk;
  }
  document.querySelectorAll('.donation-form').forEach(function (form) {
    const submit = form.querySelector('[type="submit"]');
    const feedback = form.querySelector('.donation-feedback');
    const custom = form.elements.custom_amount;
    const radios = form.querySelectorAll('[name="amount"]');
    const params = new URLSearchParams(window.location.search);
    function show(message, error) {
      feedback.textContent = message;
      feedback.classList.toggle('error', !!error);
      feedback.hidden = false;
    }
    function restore() {
      submit.disabled = !enabled;
      submit.textContent = enabled ? 'Donate securely with Paystack' : 'Card donations unavailable';
    }
    if (Object.prototype.hasOwnProperty.call(causes, params.get('cause'))) form.elements.cause.value = params.get('cause');
    const initialAmount = Number(params.get('amount'));
    if (Number.isFinite(initialAmount) && initialAmount >= 100 && initialAmount <= 100000000) {
      let preset = false;
      radios.forEach(function (radio) { radio.checked = Number(radio.value) === initialAmount; if (radio.checked) preset = true; });
      if (!preset) custom.value = initialAmount.toFixed(2);
    }
    radios.forEach(function (radio) { radio.addEventListener('change', function () { custom.value = ''; }); });
    custom.addEventListener('input', function () {
      if (custom.value !== '') radios.forEach(function (radio) { radio.checked = false; });
    });
    if (enabled) {
      document.getElementById('payment-availability').textContent = 'Card payments are handled securely by Paystack. We do not collect or store your card details.';
      form.querySelector('.small').textContent = 'Checkout opens securely with Paystack. You can also donate by bank transfer.';
    }
    restore();
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!enabled) { show('Card donations are currently unavailable. Please use the bank transfer details or contact our team.', true); return; }
      if (!form.reportValidity()) return;
      const selected = form.querySelector('[name="amount"]:checked');
      const amount = custom.value !== '' ? Number(custom.value) : Number(selected && selected.value);
      const kobo = Math.round(amount * 100);
      if (!Number.isFinite(amount) || amount < 100 || !Number.isSafeInteger(kobo)) { show('Please choose or enter an amount of at least ₦100.', true); return; }
      const data = new FormData(form);
      const name = data.get('name').trim();
      if (!name) { show('Please enter your full name.', true); return; }
      submit.disabled = true;
      submit.textContent = 'Opening secure checkout…';
      show('Preparing your secure checkout. Please wait.');
      try {
        const Paystack = await loadCheckout();
        const checkout = new Paystack();
        checkout.newTransaction({
          key: PAYSTACK_PUBLIC_KEY, email: data.get('email').trim(), amount: kobo, currency: 'NGN',
          firstName: name.split(/\s+/)[0], lastName: name.split(/\s+/).slice(1).join(' '),
          metadata: { donor_name: name, donor_phone: data.get('phone').trim(), donation_cause: causes[data.get('cause')] || causes.general, donor_message: data.get('message').trim() },
          onSuccess: function (transaction) {
            restore();
            if (transaction && transaction.reference) window.location.href = 'thank-you.html?reference=' + encodeURIComponent(transaction.reference);
            else show('Please check your payment provider for confirmation and contact us for an acknowledgement.');
          },
          onCancel: function () { restore(); show('Checkout was closed. You can try again whenever you are ready.'); },
          onError: function () { restore(); show('Payment could not be completed. Please try again or use bank transfer.', true); }
        });
      } catch (_) { restore(); show('Checkout could not load. Please check your connection or use bank transfer.', true); }
    });
  });
})();
