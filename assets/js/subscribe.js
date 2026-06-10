/**
 * Newsletter form handling — POST to /subscribe API or Beehiiv embed fallback.
 */
(function () {
  "use strict";

  var form = document.querySelector(".newsletter-form");
  if (!form) return;

  var input = form.querySelector('input[type="email"]');
  var submitBtn = form.querySelector('[type="submit"]');
  var messageEl = form.querySelector(".form-message") || createMessageEl(form);

  /* Set API endpoint via data attribute or default relative path */
  var apiUrl = form.dataset.apiUrl || "/subscribe";

  function createMessageEl(parent) {
    var el = document.createElement("p");
    el.className = "form-message";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    parent.appendChild(el);
    return el;
  }

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = "form-message form-message--" + type;
  }

  function clearMessage() {
    messageEl.textContent = "";
    messageEl.className = "form-message";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearMessage();

    var email = (input.value || "").trim();
    if (!email) {
      showMessage("Please enter your email address.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Subscribing…";

    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          showMessage(result.data.message || "You're in! Check your inbox to confirm.", "success");
          input.value = "";
        } else {
          showMessage(result.data.error || "Something went wrong. Please try again.", "error");
        }
      })
      .catch(function () {
        showMessage("Unable to connect. Try again or use the Beehiiv embed.", "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Subscribe";
      });
  });
})();
