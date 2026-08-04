/* ==========================================================================
   ReloCompass — Contact Form Validation & Submission
   ========================================================================== */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');
  const formContainer = document.getElementById('form-container');
  const successContainer = document.getElementById('success-message');
  const successEmail = document.getElementById('success-email');

  function showError(input, message) {
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    input.style.borderColor = '#EF4444';
  }

  function clearError(input) {
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
    input.style.borderColor = '';
  }

  function validateField(input, value) {
    switch (input.id) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        break;
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        break;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        break;
    }
    return null;
  }

  // Clear error on input
  [nameInput, emailInput, subjectInput, messageInput].forEach(function (input) {
    if (input) {
      input.addEventListener('input', function () {
        clearError(input);
      });
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    let hasErrors = false;
    var fields = [
      { input: nameInput, value: nameInput.value },
      { input: emailInput, value: emailInput.value },
      { input: subjectInput, value: subjectInput.value },
      { input: messageInput, value: messageInput.value }
    ];

    fields.forEach(function (field) {
      if (field.input) {
        var error = validateField(field.input, field.value);
        if (error) {
          showError(field.input, error);
          hasErrors = true;
        } else {
          clearError(field.input);
        }
      }
    });

    if (hasErrors) return;

    // Submit to backend API
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
    }

    try {
      const res = await fetch(API_CONFIG.API_URL + '/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to send message');
      }

      // Success
      if (formContainer) formContainer.style.display = 'none';
      if (successContainer) successContainer.style.display = 'flex';
      if (successEmail && emailInput) successEmail.textContent = emailInput.value;
    } catch (err) {
      // Show error
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
      }
      var msgEl = document.getElementById('message-error');
      if (msgEl) {
        msgEl.textContent = err.message || 'Network error. Please try again.';
        msgEl.style.display = 'block';
      } else {
        alert(err.message || 'Network error. Please try again.');
      }
    }
  });

  // "Send another" button
  const sendAnotherBtn = document.getElementById('send-another');
  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', function () {
      form.reset();
      if (formContainer) formContainer.style.display = 'block';
      if (successContainer) successContainer.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Send Message';
      }
    });
  }

})();
