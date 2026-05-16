/*
 * Paystack donation integration for The Strength of a Skilled Woman Foundation.
 * IMPORTANT: Replace PAYSTACK_PUBLIC_KEY with the foundation's live public key.
 * Example: const PAYSTACK_PUBLIC_KEY = "pk_live_xxxxxxxxxxxxxxxxxxxxx";
 */
(function () {
  "use strict";

  const PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY";
  const MINIMUM_DONATION_NAIRA = 100;

  function showFeedback(form, message, type) {
    let feedback = form.querySelector(".donation-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "donation-feedback mb-3";
      feedback.setAttribute("aria-live", "polite");
      form.prepend(feedback);
    }

    feedback.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
  }

  function clearFeedback(form) {
    const feedback = form.querySelector(".donation-feedback");
    if (feedback) feedback.innerHTML = "";
  }

  function getFieldValue(form, selector) {
    const field = form.querySelector(selector);
    return field ? field.value.trim() : "";
  }

  function getSelectedAmount(form) {
    const customAmount = Number(getFieldValue(form, '[name="custom_amount"]'));
    if (customAmount && customAmount > 0) return customAmount;

    const selected = form.querySelector('input[name="amount"]:checked');
    return selected ? Number(selected.value) : 0;
  }

  function buildReference() {
    return `SSWF-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  function splitName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || "Donor",
      lastName: parts.slice(1).join(" ") || ""
    };
  }

  function validateForm(form, donorName, donorEmail, amount) {
    if (!donorName) {
      showFeedback(form, "Please enter your full name before donating.", "danger");
      return false;
    }

    if (!donorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      showFeedback(form, "Please enter a valid email address so we can process your receipt.", "danger");
      return false;
    }

    if (!amount || amount < MINIMUM_DONATION_NAIRA) {
      showFeedback(form, `Please enter a donation amount of at least ₦${MINIMUM_DONATION_NAIRA.toLocaleString()}.`, "danger");
      return false;
    }

    if (PAYSTACK_PUBLIC_KEY.includes("REPLACE_WITH")) {
      showFeedback(
        form,
        "Paystack is connected, but the public key has not been added yet. Replace the placeholder key in js/paystack-donation.js with the foundation's Paystack public key.",
        "warning"
      );
      return false;
    }

    if (!(window.PaystackPop || window.Paystack)) {
      showFeedback(form, "Paystack could not load. Please check your internet connection and try again.", "danger");
      return false;
    }

    return true;
  }

  function initializeDonationForm(form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFeedback(form);

      const donorName = getFieldValue(form, '[name="donor_name"]');
      const donorEmail = getFieldValue(form, '[name="donor_email"]');
      const donorPhone = getFieldValue(form, '[name="donor_phone"]');
      const donationCause = getFieldValue(form, '[name="donation_cause"]') || "General Fund";
      const donorMessage = getFieldValue(form, '[name="donor_message"]');
      const amountNaira = getSelectedAmount(form);
      const amountKobo = Math.round(amountNaira * 100);
      const donor = splitName(donorName);

      if (!validateForm(form, donorName, donorEmail, amountNaira)) return;

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.innerHTML : "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "Opening secure payment...";
      }

      const PaystackConstructor = window.PaystackPop || window.Paystack;
      const popup = new PaystackConstructor();

      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: donorEmail,
        amount: amountKobo,
        currency: "NGN",
        firstName: donor.firstName,
        lastName: donor.lastName,
        phone: donorPhone,
        reference: buildReference(),
        metadata: {
          donor_name: donorName,
          donation_cause: donationCause,
          donor_message: donorMessage,
          source_page: form.getAttribute("data-payment-page") || window.location.pathname,
          custom_fields: [
            {
              display_name: "Donation Cause",
              variable_name: "donation_cause",
              value: donationCause
            },
            {
              display_name: "Donor Phone",
              variable_name: "donor_phone",
              value: donorPhone || "Not provided"
            }
          ]
        },
        onSuccess: function (transaction) {
          showFeedback(
            form,
            `Thank you, ${donor.firstName}. Your donation was successful. Payment reference: <strong>${transaction.reference}</strong>.`,
            "success"
          );
          form.reset();
        },
        onCancel: function () {
          showFeedback(form, "Payment was cancelled. You can try again whenever you are ready.", "warning");
        },
        onError: function (error) {
          showFeedback(form, `Payment could not be started: ${error.message || "Please try again."}`, "danger");
        }
      });

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".donation-form").forEach(initializeDonationForm);
  });
})();
