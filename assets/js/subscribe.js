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

  /* Same-origin /subscribe in prod; SAM local runs on :3000 when using python -m http.server */
  var apiUrl = form.dataset.apiUrl || "/subscribe";
  var host = window.location.hostname;
  if (apiUrl === "/subscribe" && (host === "localhost" || host === "127.0.0.1")) {
    apiUrl = "http://127.0.0.1:3000/subscribe";
  }

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
        return res
          .json()
          .then(function (data) {
            return { ok: res.ok, data: data };
          })
          .catch(function () {
            return {
              ok: false,
              data: {
                error:
                  "Subscribe API returned an invalid response. If you're running locally, start the API with sam local start-api.",
              },
            };
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
        var localHint =
          host === "localhost" || host === "127.0.0.1"
            ? " Start the API (sam local start-api on port 3000) or uncomment the Beehiiv embed in index.html."
            : " Try again or use the Beehiiv embed.";
        showMessage("Unable to connect." + localHint, "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Subscribe";
      });
  });
})();
