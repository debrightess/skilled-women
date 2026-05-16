(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Fixed Navbar
    $(window).scroll(function () {
        if ($(window).width() < 992) {
            if ($(this).scrollTop() > 45) {
                $('.fixed-top').addClass('bg-dark shadow');
            } else {
                $('.fixed-top').removeClass('bg-dark shadow');
            }
        } else {
            if ($(this).scrollTop() > 45) {
                $('.fixed-top').addClass('bg-dark shadow').css('top', -45);
            } else {
                $('.fixed-top').removeClass('bg-dark shadow').css('top', 0);
            }
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Causes progress
    $('.causes-progress').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: false,
        smartSpeed: 1000,
        center: true,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            }
        }
    });

    
})(jQuery);



// Paystack donation validation and checkout
(function () {
    "use strict";

    // Replace this with the live public key from the Foundation's Paystack dashboard before going live.
    const PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY";

    function cleanAmount(value) {
        if (!value) return 0;
        return Number(String(value).replace(/[^0-9.]/g, ""));
    }

    function getSelectedAmount(form) {
        const customInput = form.querySelector('input[name="custom_amount"]');
        const customAmount = cleanAmount(customInput && customInput.value);
        if (customAmount > 0) return customAmount;

        const selected = form.querySelector('input[name="amount"]:checked');
        return cleanAmount(selected && selected.value);
    }

    function getField(form, name) {
        const field = form.querySelector(`[name="${name}"]`);
        return field ? field.value.trim() : "";
    }

    function showFeedback(form, message, type) {
        let feedback = form.querySelector('.donation-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'donation-feedback';
            form.appendChild(feedback);
        }
        feedback.className = `donation-feedback ${type || 'error'}`;
        feedback.textContent = message;
    }

    function validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function clearCustomAmountWhenPresetChanges(form) {
        const customInput = form.querySelector('input[name="custom_amount"]');
        const presets = form.querySelectorAll('input[name="amount"]');
        presets.forEach(function (preset) {
            preset.addEventListener('change', function () {
                if (customInput) customInput.value = '';
            });
        });
        if (customInput) {
            customInput.addEventListener('input', function () {
                if (cleanAmount(customInput.value) > 0) {
                    presets.forEach(function (preset) { preset.checked = false; });
                }
            });
        }
    }

    function handleDonationSubmit(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const name = getField(form, 'name');
        const email = getField(form, 'email');
        const phone = getField(form, 'phone');
        const cause = getField(form, 'cause') || 'General Fund';
        const message = getField(form, 'message');
        const source = form.dataset.source || 'Website Donation';
        const amount = getSelectedAmount(form);

        if (!name) {
            showFeedback(form, 'Please enter your full name.', 'error');
            return;
        }

        if (!email || !validEmail(email)) {
            showFeedback(form, 'Please enter a valid email address.', 'error');
            return;
        }

        if (!amount || amount < 100) {
            showFeedback(form, 'Please select or enter a donation amount of at least ₦100.', 'error');
            return;
        }

        if (PAYSTACK_PUBLIC_KEY.includes('REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY')) {
            showFeedback(form, 'Paystack public key is not set yet. Replace the placeholder key in js/main.js before testing payment.', 'error');
            return;
        }

        if (typeof PaystackPop === 'undefined') {
            showFeedback(form, 'Payment system could not load. Please check your internet connection and try again.', 'error');
            return;
        }

        showFeedback(form, 'Opening secure payment checkout...', 'success');

        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: PAYSTACK_PUBLIC_KEY,
            email: email,
            amount: Math.round(amount * 100),
            currency: 'NGN',
            metadata: {
                custom_fields: [
                    { display_name: 'Donor Name', variable_name: 'donor_name', value: name },
                    { display_name: 'Phone Number', variable_name: 'phone_number', value: phone || 'Not provided' },
                    { display_name: 'Donation Cause', variable_name: 'donation_cause', value: cause },
                    { display_name: 'Donation Source', variable_name: 'donation_source', value: source },
                    { display_name: 'Donor Message', variable_name: 'donor_message', value: message || 'No message' }
                ]
            },
            onSuccess: function (transaction) {
                const reference = transaction && transaction.reference ? transaction.reference : '';
                window.location.href = 'thank-you.html?reference=' + encodeURIComponent(reference);
            },
            onCancel: function () {
                showFeedback(form, 'Payment was cancelled. You can try again whenever you are ready.', 'error');
            },
            onError: function () {
                showFeedback(form, 'Payment could not be completed. Please try again or use bank transfer.', 'error');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const forms = document.querySelectorAll('.donation-form');
        forms.forEach(function (form) {
            clearCustomAmountWhenPresetChanges(form);
            form.addEventListener('submit', handleDonationSubmit);
        });
    });
})();
