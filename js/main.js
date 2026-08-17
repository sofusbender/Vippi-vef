(function () {
  "use strict";

  const cfg = VIPPI_CONFIG;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* -----------------------------------------------------------------
     Farsímavalmynd
  ----------------------------------------------------------------- */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  navToggle.addEventListener("click", function () {
    const open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* -----------------------------------------------------------------
     Litaveljari
  ----------------------------------------------------------------- */
  const swatchContainer = document.getElementById("color-swatches");
  const previewImg = document.getElementById("color-preview-img");
  const previewName = document.getElementById("color-preview-name");
  const colorSelect = document.getElementById("f-color");

  function selectColor(colorId) {
    const color = cfg.colors.find(function (c) { return c.id === colorId; });
    if (!color) return;

    previewImg.src = color.image;
    previewImg.alt = "Vippi stóll í litnum " + color.name;
    previewName.textContent = color.name;
    colorSelect.value = color.id;

    swatchContainer.querySelectorAll(".color-swatch").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.colorId === colorId);
      btn.setAttribute("aria-selected", btn.dataset.colorId === colorId ? "true" : "false");
    });
  }

  cfg.colors.forEach(function (color, index) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-swatch";
    btn.dataset.colorId = color.id;
    btn.setAttribute("role", "option");
    btn.innerHTML = '<span class="dot" style="background:' + color.hex + '"></span><span>' + color.name + "</span>";
    btn.addEventListener("click", function () { selectColor(color.id); });
    swatchContainer.appendChild(btn);

    const option = document.createElement("option");
    option.value = color.id;
    option.textContent = color.name;
    colorSelect.appendChild(option);

    if (index === 0) selectColor(color.id);
  });

  /* -----------------------------------------------------------------
     Verðtafla
  ----------------------------------------------------------------- */
  const pricingTable = document.getElementById("pricing-table");

  function formatPrice(amount) {
    return amount.toLocaleString("is-IS") + " " + cfg.currency;
  }

  cfg.priceTiers.forEach(function (tier) {
    const card = document.createElement("div");
    card.className = "price-tier";
    card.innerHTML =
      '<div class="qty">' + tier.label + '</div>' +
      '<div class="amount">' + formatPrice(tier.pricePerUnit) + '</div>' +
      '<div class="per">á stól</div>';
    pricingTable.appendChild(card);
  });

  function priceForQty(qty) {
    const tier = cfg.priceTiers.find(function (t) {
      return qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty);
    }) || cfg.priceTiers[cfg.priceTiers.length - 1];
    return tier.pricePerUnit;
  }

  /* -----------------------------------------------------------------
     Pöntunarform: verðreiknivél + sending
  ----------------------------------------------------------------- */
  const qtyInput = document.getElementById("f-qty");
  const priceHidden = document.getElementById("f-price-hidden");
  const orderTotal = document.getElementById("order-total");

  function updateTotal() {
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    const unitPrice = priceForQty(qty);
    const total = unitPrice * qty;
    orderTotal.textContent = formatPrice(total) + " (" + qty + " stk × " + formatPrice(unitPrice) + ")";
    priceHidden.value = formatPrice(total);
  }

  qtyInput.addEventListener("input", updateTotal);
  updateTotal();

  const form = document.getElementById("order-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("order-submit");

  function buildMailtoFallback(data) {
    const lines = [
      "Nafn: " + data.Nafn,
      "Netfang: " + data.Netfang,
      "Sími: " + data.Sími,
      "Afhendingarstaður: " + data.Afhendingarstaður,
      "Litur: " + (cfg.colors.find(function (c) { return c.id === data.Litur; }) || {}).name,
      "Fjöldi: " + data.Fjöldi,
      "Áætlað verð: " + data.Áætlað_verð,
      "Athugasemd: " + (data.Athugasemd || "-"),
    ];
    const body = encodeURIComponent(lines.join("\n"));
    const subject = encodeURIComponent("Ný Vippi pöntun frá " + data.Nafn);
    return "mailto:" + cfg.orderEmail + "?subject=" + subject + "&body=" + body;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const mailtoLink = buildMailtoFallback(data);

    const endpointConfigured = cfg.formspreeEndpoint && cfg.formspreeEndpoint.indexOf("XXXXXXX") === -1;

    if (!endpointConfigured) {
      statusEl.className = "form-status error";
      statusEl.innerHTML =
        'Pöntunarsendingin á vefnum er ekki fullstillt ennþá. ' +
        '<a href="' + mailtoLink + '">Smelltu hér til að senda pöntunina með tölvupósti í staðinn</a>.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sendi...";
    statusEl.className = "form-status";
    statusEl.textContent = "";

    fetch(cfg.formspreeEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    })
      .then(function (response) {
        if (response.ok) {
          statusEl.className = "form-status success";
          statusEl.textContent = "Takk fyrir! Pöntunin var send og við höfum samband fljótlega.";
          form.reset();
          updateTotal();
          selectColor(cfg.colors[0].id);
        } else {
          throw new Error("Sending mistókst");
        }
      })
      .catch(function () {
        statusEl.className = "form-status error";
        statusEl.innerHTML =
          'Því miður mistókst að senda pöntunina sjálfkrafa. ' +
          '<a href="' + mailtoLink + '">Smelltu hér til að senda hana með tölvupósti í staðinn</a>.';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Senda pöntun";
      });
  });
})();
