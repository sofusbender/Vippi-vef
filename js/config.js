/*
 * Stillingar fyrir Vippi vefsíðuna.
 * Þetta er eini staðurinn sem þarf að uppfæra þegar verð, litir eða
 * pöntunartenging (Formspree) liggja fyrir.
 */

const VIPPI_CONFIG = {
  // ---------------------------------------------------------------------
  // PÖNTUN — Formspree endapunktur
  // ---------------------------------------------------------------------
  // 1. Farið á https://formspree.io og stofnið frían aðgang.
  // 2. Búið til nýtt form og tengið það við bender@bender.is.
  // 3. Formspree gefur ykkur endapunkt á forminu "https://formspree.io/f/XXXXXXX".
  // 4. Límið hann inn í staðinn fyrir gildið hér fyrir neðan.
  // Þar til þetta er stillt mun síðan sjálfkrafa bjóða upp á að senda
  // pöntunina með tölvupósti í staðinn (mailto), svo engin pöntun tapast.
  formspreeEndpoint: "https://formspree.io/f/XXXXXXX", // TODO: skipta út fyrir raunverulegan Formspree endapunkt

  orderEmail: "bender@bender.is",

  // ---------------------------------------------------------------------
  // LITIR
  // ---------------------------------------------------------------------
  // "image" vísar í mynd úr Myndir/ möppunni sem sýnir stólinn í þessum lit.
  colors: [
    { id: "blatt", name: "Blátt", hex: "#3f7fc4", image: "Myndir/vippi_0039-Edit.jpg" },
    { id: "graent", name: "Grænt", hex: "#7dc855", image: "Myndir/vippi_0472.jpg" },
    { id: "appelsinugult", name: "Appelsínugult", hex: "#e8501e", image: "Myndir/vippi_0219-Edit.jpg" },
    { id: "rautt", name: "Rautt", hex: "#d8143c", image: "Myndir/vippi_0802.jpg" },
    { id: "gult", name: "Gult", hex: "#e6d769", image: "Myndir/vippi_0365.jpg" },
    { id: "bleikt", name: "Bleikt", hex: "#e6197f", image: "Myndir/vippi_0242.jpg" },
    { id: "svart", name: "Svart", hex: "#2b2b2b", image: "Myndir/vippi_0618.jpg" },
  ],

  // ---------------------------------------------------------------------
  // VERÐ OG MAGNAFSLÁTTUR — PLACEHOLDER TÖLUR
  // ---------------------------------------------------------------------
  // ATH: Þessar tölur eru dæmi/staðgenglar (placeholder) og þarf að skipta
  // út fyrir raunveruleg verð þegar þau liggja fyrir. Verð eru í ISK og
  // "pricePerUnit" er verð á stól innan hvers magnbils.
  currency: "kr.",
  priceTiers: [
    { minQty: 1, maxQty: 1, pricePerUnit: 24900, label: "1 stk" },
    { minQty: 2, maxQty: 4, pricePerUnit: 22900, label: "2–4 stk" },
    { minQty: 5, maxQty: 9, pricePerUnit: 20900, label: "5–9 stk" },
    { minQty: 10, maxQty: null, pricePerUnit: 18900, label: "10+ stk" },
  ],
};
