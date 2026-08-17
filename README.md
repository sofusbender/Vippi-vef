# Vippi vefsíða

Kyrrstöð (static) HTML/CSS/JS söluvefsíða fyrir Vippi-stólinn, rekin af Bender ehf,
opinberum umboðsaðila Vippi (vippi.no) á Íslandi. Engin byggingartól eða framework —
síðan keyrir hvar sem er sem venjuleg HTML-síða.

## Skoða síðuna staðbundið

Opnaðu `index.html` beint í vafra, eða keyrðu einfaldan staðbundinn vefþjón, t.d.:

```bash
python -m http.server 8000
```

og farðu svo á `http://localhost:8000`.

## Það sem þarf að klára fyrir birtingu

### 1. Verð og magnafsláttur
Allar tölur í `js/config.js` (`priceTiers`) eru **staðgenglar (placeholder)**.
Skiptu þeim út fyrir raunveruleg verð þegar þau liggja fyrir.

### 2. Formspree — pöntunarsending
Pöntunarformið sendir gögn á Formspree svo pantanir berist á tölvupóst án þess
að vefurinn þurfi eigin bakenda:

1. Farðu á [formspree.io](https://formspree.io) og stofnaðu frían aðgang.
2. Búðu til nýtt form og tengdu það við `bender@bender.is`.
3. Formspree gefur þér endapunkt á forminu `https://formspree.io/f/XXXXXXX`.
4. Settu hann inn sem `formspreeEndpoint` í `js/config.js`.

Þar til þetta er stillt birtist sjálfkrafa hlekkur sem sendir pöntunina með
tölvupósti (`mailto:`) í staðinn, svo engin pöntun tapast.

### 3. Litir
Litir og tilheyrandi myndir eru skilgreindir í `js/config.js` (`colors`).
Auðvelt er að bæta við, fjarlægja eða breyta litum þar — bendir hver litur á
mynd í `Myndir/` möppunni.

## Skráaruppbygging

```
index.html        Öll síðan (einn síða með köflum)
css/styles.css     Allur stíll
js/config.js       Vörugögn: litir, verð, Formspree-endapunktur
js/main.js         Gagnvirkni: litaveljari, verðreiknivél, form-sending
Myndir/            Vörumyndir
Logo/              Vippi merki
```

## Hýsing

Síðan er venjuleg kyrrstöð HTML-síða og má hýsa hvar sem er sem styður slíkt
(GitHub Pages, Netlify, eigin vefþjónn o.fl.) — engin sérstök stilling þarf.
