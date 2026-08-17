(function () {
  "use strict";

  const cfg = VIPPI_CONFIG;
  const CART_KEY = "vippiCart";
  const VAT_KEY = "vippiShowVat";

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
     Hjálparföll: verð
  ----------------------------------------------------------------- */
  function formatPrice(amount) {
    return amount.toLocaleString("is-IS") + " " + cfg.currency;
  }

  function priceForQty(qty) {
    const tier = cfg.priceTiers.find(function (t) {
      return qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty);
    }) || cfg.priceTiers[cfg.priceTiers.length - 1];
    return tier.pricePerUnit;
  }

  function colorById(id) {
    return cfg.colors.find(function (c) { return c.id === id; });
  }

  /* -----------------------------------------------------------------
     Verð með eða án vsk
     Öll verð í js/config.js eru skráð MEÐ vsk — þessi rofi reiknar
     og birtir verð án vsk, en breytir engu um skráðu verðin sjálf.
  ----------------------------------------------------------------- */
  let showVat = localStorage.getItem(VAT_KEY) !== "without";

  function displayAmount(amountWithVat) {
    return showVat ? amountWithVat : Math.round(amountWithVat / (1 + cfg.vatRate));
  }

  function vatSuffix() {
    return showVat ? "(m. vsk)" : "(án vsk)";
  }

  const vatToggle = document.getElementById("vat-toggle");
  const vatNote = document.getElementById("vat-note");
  const cartVatNote = document.getElementById("cart-vat-note");
  const checkoutVatNote = document.getElementById("checkout-vat-note");

  vatToggle.querySelector('input[value="' + (showVat ? "with" : "without") + '"]').checked = true;

  function updateVatNotes() {
    vatNote.textContent = showVat
      ? "Verð eru sýnd með 24% vsk."
      : "Verð eru sýnd án vsk (24% vsk bætist við).";
    cartVatNote.textContent = vatSuffix();
    checkoutVatNote.textContent = vatSuffix();
  }

  vatToggle.addEventListener("change", function () {
    const selected = vatToggle.querySelector('input[name="vat-display"]:checked');
    showVat = selected.value === "with";
    localStorage.setItem(VAT_KEY, showVat ? "with" : "without");
    updateVatNotes();
    renderPricingTable();
    renderCart();
  });

  updateVatNotes();

  /* -----------------------------------------------------------------
     Litaveljari (forskoðun)
  ----------------------------------------------------------------- */
  const swatchContainer = document.getElementById("color-swatches");
  const previewImg = document.getElementById("color-preview-img");
  const previewName = document.getElementById("color-preview-name");

  let selectedColorId = cfg.colors[0].id;

  function selectColor(colorId) {
    const color = colorById(colorId);
    if (!color) return;

    selectedColorId = colorId;
    previewImg.src = color.image;
    previewImg.alt = "Vippi stóll í litnum " + color.name;
    previewName.textContent = color.name;

    swatchContainer.querySelectorAll(".color-swatch").forEach(function (btn) {
      const active = btn.dataset.colorId === colorId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
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

    if (index === 0) selectColor(color.id);
  });

  /* -----------------------------------------------------------------
     Magnstilla fyrir "Bæta í körfu"
  ----------------------------------------------------------------- */
  const colorQtyInput = document.getElementById("color-qty");

  document.getElementById("color-qty-minus").addEventListener("click", function () {
    colorQtyInput.value = Math.max(1, (parseInt(colorQtyInput.value, 10) || 1) - 1);
  });
  document.getElementById("color-qty-plus").addEventListener("click", function () {
    colorQtyInput.value = (parseInt(colorQtyInput.value, 10) || 1) + 1;
  });
  colorQtyInput.addEventListener("change", function () {
    colorQtyInput.value = Math.max(1, parseInt(colorQtyInput.value, 10) || 1);
  });

  /* -----------------------------------------------------------------
     Verðtafla (upplýsingaspjöld)
  ----------------------------------------------------------------- */
  const pricingTable = document.getElementById("pricing-table");

  function renderPricingTable() {
    pricingTable.innerHTML = "";
    cfg.priceTiers.forEach(function (tier) {
      const card = document.createElement("div");
      card.className = "price-tier";
      card.innerHTML =
        '<div class="qty">' + tier.label + '</div>' +
        '<div class="amount">' + formatPrice(displayAmount(tier.pricePerUnit)) + '</div>' +
        '<div class="per">á stól</div>';
      pricingTable.appendChild(card);
    });
  }

  renderPricingTable();

  /* -----------------------------------------------------------------
     Karfa — geymd í localStorage svo hún lifir milli heimsókna
  ----------------------------------------------------------------- */
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY));
      return Array.isArray(raw)
        ? raw.filter(function (l) { return colorById(l.colorId) && l.qty > 0; })
        : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  let cart = loadCart();

  function cartTotalQty() {
    return cart.reduce(function (sum, l) { return sum + l.qty; }, 0);
  }

  function addToCart(colorId, qty) {
    const line = cart.find(function (l) { return l.colorId === colorId; });
    if (line) {
      line.qty += qty;
    } else {
      cart.push({ colorId: colorId, qty: qty });
    }
    saveCart();
    renderCart();
  }

  function setLineQty(colorId, qty) {
    if (qty < 1) {
      cart = cart.filter(function (l) { return l.colorId !== colorId; });
    } else {
      const line = cart.find(function (l) { return l.colorId === colorId; });
      if (line) line.qty = qty;
    }
    saveCart();
    renderCart();
  }

  function removeLine(colorId) {
    cart = cart.filter(function (l) { return l.colorId !== colorId; });
    saveCart();
    renderCart();
  }

  /* -----------------------------------------------------------------
     Karfa — DOM
  ----------------------------------------------------------------- */
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartCount = document.getElementById("cart-count");
  const cartLines = document.getElementById("cart-lines");
  const cartEmpty = document.getElementById("cart-empty");
  const cartFooter = document.getElementById("cart-footer");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCheckoutBtn = document.getElementById("cart-checkout-btn");

  const checkoutEmptyNote = document.getElementById("checkout-empty-note");
  const checkoutLines = document.getElementById("checkout-lines");
  const checkoutTotalRow = document.getElementById("checkout-total-row");
  const checkoutTotalEl = document.getElementById("checkout-total");
  const checkoutFields = document.getElementById("checkout-fields");
  const orderHidden = document.getElementById("f-order-hidden");
  const priceHidden = document.getElementById("f-price-hidden");

  function renderDrawer(unitPrice) {
    cartLines.innerHTML = "";
    const hasItems = cart.length > 0;
    cartEmpty.hidden = hasItems;
    cartFooter.hidden = !hasItems;

    let total = 0;

    cart.forEach(function (line) {
      const color = colorById(line.colorId);
      const lineTotal = unitPrice * line.qty;
      total += lineTotal;

      const row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML =
        '<span class="dot" style="background:' + color.hex + '"></span>' +
        '<div class="cart-line-info">' +
          '<span class="cart-line-name">' + color.name + '</span>' +
          '<span class="cart-line-unit">' + formatPrice(displayAmount(unitPrice)) + ' / stk</span>' +
        '</div>' +
        '<span class="cart-line-total">' + formatPrice(displayAmount(lineTotal)) + '</span>' +
        '<div class="cart-line-controls">' +
          '<div class="qty-stepper small">' +
            '<button type="button" class="qty-btn" data-action="minus" aria-label="Fækka">−</button>' +
            '<input type="number" min="1" value="' + line.qty + '" aria-label="Fjöldi af ' + color.name + '">' +
            '<button type="button" class="qty-btn" data-action="plus" aria-label="Fjölga">+</button>' +
          '</div>' +
          '<button type="button" class="cart-line-remove" aria-label="Fjarlægja ' + color.name + '">&times;</button>' +
        '</div>';

      const stepperInput = row.querySelector(".qty-stepper input");
      row.querySelector('[data-action="minus"]').addEventListener("click", function () {
        setLineQty(line.colorId, line.qty - 1);
      });
      row.querySelector('[data-action="plus"]').addEventListener("click", function () {
        setLineQty(line.colorId, line.qty + 1);
      });
      stepperInput.addEventListener("change", function () {
        setLineQty(line.colorId, Math.max(1, parseInt(stepperInput.value, 10) || 1));
      });
      row.querySelector(".cart-line-remove").addEventListener("click", function () {
        removeLine(line.colorId);
      });

      cartLines.appendChild(row);
    });

    cartTotalEl.textContent = formatPrice(displayAmount(total));
  }

  function renderCheckout(unitPrice) {
    checkoutLines.innerHTML = "";
    const hasItems = cart.length > 0;
    checkoutEmptyNote.hidden = hasItems;
    checkoutTotalRow.hidden = !hasItems;
    checkoutFields.hidden = !hasItems;

    let total = 0;
    const orderLines = [];

    cart.forEach(function (line) {
      const color = colorById(line.colorId);
      const lineTotal = unitPrice * line.qty;
      total += lineTotal;
      orderLines.push(
        color.name + " × " + line.qty + " stk (" + formatPrice(displayAmount(unitPrice)) + "/stk) = " +
        formatPrice(displayAmount(lineTotal))
      );

      const row = document.createElement("div");
      row.className = "checkout-line";
      row.innerHTML =
        '<span class="dot" style="background:' + color.hex + '"></span>' +
        '<span class="checkout-line-name">' + color.name + " × " + line.qty + '</span>' +
        '<span class="checkout-line-total">' + formatPrice(displayAmount(lineTotal)) + '</span>';
      checkoutLines.appendChild(row);
    });

    checkoutTotalEl.textContent = formatPrice(displayAmount(total));
    orderHidden.value = orderLines.join(" | ") + " " + vatSuffix();
    priceHidden.value = formatPrice(displayAmount(total)) + " " + vatSuffix();
  }

  function renderCart() {
    const totalQty = cartTotalQty();
    const unitPrice = priceForQty(totalQty || 1);

    cartCount.textContent = String(totalQty);
    cartCount.hidden = totalQty === 0;

    renderDrawer(unitPrice);
    renderCheckout(unitPrice);
  }

  function openCart() {
    cartDrawer.hidden = false;
    cartOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      cartDrawer.classList.add("open");
      cartOverlay.style.opacity = "1";
    });
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.style.opacity = "0";
    document.body.style.overflow = "";
    setTimeout(function () {
      cartDrawer.hidden = true;
      cartOverlay.hidden = true;
    }, 250);
  }

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  cartCheckoutBtn.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
  });

  /* -----------------------------------------------------------------
     "Bæta í körfu" hnappur við litaveljara
  ----------------------------------------------------------------- */
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const addStatus = document.getElementById("add-to-cart-status");
  let addStatusTimer;

  addToCartBtn.addEventListener("click", function () {
    const qty = Math.max(1, parseInt(colorQtyInput.value, 10) || 1);
    addToCart(selectedColorId, qty);

    const color = colorById(selectedColorId);
    addStatus.textContent = "Bætt við: " + qty + " × " + color.name + " ✓";
    clearTimeout(addStatusTimer);
    addStatusTimer = setTimeout(function () { addStatus.textContent = ""; }, 2500);

    colorQtyInput.value = 1;
  });

  renderCart();

  /* -----------------------------------------------------------------
     Kaupandi: einstaklingur eða fyrirtæki
  ----------------------------------------------------------------- */
  const buyerTypeToggle = document.getElementById("buyer-type-toggle");
  const companyNameRow = document.getElementById("company-name-row");
  const companyInput = document.getElementById("f-company");
  const nameLabel = document.getElementById("f-name-label");

  function updateBuyerType() {
    const selected = buyerTypeToggle.querySelector('input[name="Kaupandi"]:checked');
    const isCompany = !!selected && selected.value === "Fyrirtæki";
    companyNameRow.hidden = !isCompany;
    companyInput.required = isCompany;
    nameLabel.textContent = isCompany ? "Tengiliður" : "Nafn";
  }

  buyerTypeToggle.addEventListener("change", updateBuyerType);
  updateBuyerType();

  /* -----------------------------------------------------------------
     Pöntunarform: sending
  ----------------------------------------------------------------- */
  const form = document.getElementById("order-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("order-submit");

  function buildMailtoFallback(data) {
    const lines = [
      "Kaupandi: " + data.Kaupandi,
      "Nafn: " + data.Nafn,
      "Fyrirtæki: " + (data.Fyrirtæki_nafn || "-"),
      "Kennitala: " + data.Kennitala,
      "Netfang: " + data.Netfang,
      "Sími: " + data.Sími,
      "Afhendingarstaður: " + data.Afhendingarstaður,
      "Pöntun: " + data.Pöntun,
      "Áætlað verð: " + data.Áætlað_verð,
      "Athugasemd: " + (data.Athugasemd || "-"),
    ];
    const body = encodeURIComponent(lines.join("\n"));
    const subject = encodeURIComponent("Ný Vippi pöntun frá " + data.Nafn);
    return "mailto:" + cfg.orderEmail + "?subject=" + subject + "&body=" + body;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (cart.length === 0) {
      statusEl.className = "form-status error";
      statusEl.textContent = "Karfan er tóm — veldu lit og magn áður en þú sendir pöntun.";
      return;
    }

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
          updateBuyerType();
          cart = [];
          saveCart();
          renderCart();
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
