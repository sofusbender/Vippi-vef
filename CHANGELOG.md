# Breytingaskrá — Vippi vefsíða

Skrá yfir helstu breytingar á síðunni, nýjustu efst.

## 2026-08-17 — Nýr texti um alla síðuna
- Allur meginmálstexti endurskrifaður: efst (hero), "Af hverju Vippi?", myndasafn, litir, verð, pöntunarhluti, "Uppruni og þjónusta" og fótur.
- Fótur fékk raunverulegt heimilisfang og símanúmer (Barðastaðir 1–5 · 112 Reykjavík · 557 6050), og ný tengla­röð: vippi.no, Persónuvernd, Pöntunarbeiðni.
- Verðtextinn núna í samræmi við að magnafsláttur miðist við heildarfjölda stóla óháð litum.
- Athugið: "Persónuvernd" í fótnum og undir pöntunarhnappnum vísar ekki enn á neitt — vantar staðfesta persónuverndarsíðu/-texta.

## 2026-08-17 — Vsk-rofinn fylgir með í skrolli
- `.vat-bar` og `.site-header` sett saman í eitt sticky-svæði (`.site-top`) svo "Með vsk / Án vsk" hnappurinn sé alltaf sýnilegur, ekki bara efst á síðu.

## 2026-08-17 — Karfa, kaupendaupplýsingar og vsk-rofi
- Einu pöntunarformi skipt út fyrir alvöru körfu (localStorage): körfuhnappur í haus með fjöldamerki, körfuskúffa þar sem hægt er að breyta magni eða fjarlægja línur, hægt að setja fleiri liti/magn í sömu pöntun.
- Pöntunarformið er nú checkout-yfirlit sem sækir línurnar úr körfunni; magnafsláttur reiknast út frá heildarfjölda í körfunni, óháð litum.
- Nýtt: val um Einstaklingur / Fyrirtæki + kennitölureitur (og nafn fyrirtækis ef "Fyrirtæki" er valið).
- Nýtt: rofi til að skoða verð með eða án vsk (24%) — gildir fyrir verðtöflu, körfu og checkout-yfirlit.

## 2026-08-17 — Fyrsta útgáfa
- Fyrsta útgáfa af Vippi sölusíðu fyrir Bender ehf: forsíða með kynningu á vörunni, myndasafni, litaveljara, verðtöflu og pöntunarformi.
- Pöntunarform sent með Formspree (AJAX) með mailto-varaleið ef Formspree er ekki stillt, svo engin pöntun tapist.
- Verð og litir stýrt miðlægt úr `js/config.js` svo einfalt sé að uppfæra síðar.
- Bender ehf sýnt sem opinber umboðsaðili Vippi á Íslandi, með tengli á upprunalega framleiðandann vippi.no.
