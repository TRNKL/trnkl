/*!
 * TRNKL Flowfinder: zoekvenster voor trnkl.nl (los component, geen afhankelijkheden).
 *
 * Plaatsen:
 *   <div data-trnkl-flowfinder data-api="https://api.trnkl.nl"></div>
 *   <script src="/assets/trnkl-flowfinder.js" defer></script>
 *
 * Opties (data-attributen op de div):
 *   data-api             basis-URL van de zoek-API (verplicht)
 *   data-weergave        "compact" (standaard: paneel naast de hero, één antwoord met
 *                        de flowchart voorop) of "volledig" (alle antwoordkaarten)
 *   data-kennisbank      optioneel: beperk tot een kennisbank-id (bijv. op een flowchartpagina)
 *   data-voorbeelden     voorbeeldvragen, gescheiden door |
 *   data-kopieren="aan"  kopieerbeveiliging uit (standaard aan, zoals in de modals)
 *
 * Alle tekst uit de API wordt als tekst gezet (textContent), nooit als HTML.
 * Kleuren en lettertype komen uit de CSS-variabelen van trnkl.nl, met dezelfde
 * waarden als terugval.
 */
(function () {
  "use strict";
  var FOUT = "De Flowfinder is tijdelijk niet bereikbaar. Probeer het later opnieuw of mail info@trnkl.nl.";
  var PRIVACY = "Deel geen persoons- of klantgegevens.";
  var DISCLAIMER = "Toelichting op basis van TRNKL-kennisbanken. Geen juridisch advies.";
  var VOORBEELDEN = "Hoe bepaal ik de UBO?|Mag mijn bank zomaar mijn rekening opzeggen?|Wat is het verschil tussen een ongebruikelijke en een verdachte transactie?|Hoe herken ik zorgfraude?";

  var CSS = [
    ".tvb{--o:var(--orange,#FF5A1F);--ot:var(--orange-text,#C2410C);--ol:var(--orange-light,#FFF1EA);--ob:var(--orange-border,#FFE3D1);--b1:var(--bg-primary,#fff);--b2:var(--bg-secondary,#faf9f4);--t1:var(--text-primary,#1a1a18);--t2:var(--text-secondary,#5f5e5a);--t3:var(--text-tertiary,#888780);--r1:var(--border-light,rgba(0,0,0,.08));--r2:var(--border-mid,rgba(0,0,0,.14));--mono:var(--font-mono,'SF Mono',Menlo,Consolas,monospace);font-family:var(--font,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif);color:var(--t1);line-height:1.55;text-align:left}",
    ".tvb *{box-sizing:border-box}",
    ".tvb-paneel{background:var(--b1);border:1px solid var(--r2);border-radius:16px;padding:22px 22px 18px;box-shadow:0 10px 30px rgba(0,0,0,.06)}",
    ".tvb-eyebrow{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--ot);text-transform:uppercase;letter-spacing:.09em;margin:0}",
    ".tvb-kop{font-size:19px;font-weight:700;letter-spacing:-.01em;line-height:1.25;margin:6px 0 4px}",
    ".tvb-sub{font-size:13px;color:var(--t2);margin:0 0 14px}",
    ".tvb-form{display:flex;gap:8px}",
    ".tvb-invoer{flex:1;min-width:0;font:inherit;font-size:14.5px;color:var(--t1);background:var(--b2);border:1px solid var(--r2);border-radius:10px;padding:11px 12px}",
    ".tvb-invoer:focus{outline:2px solid var(--o);outline-offset:1px;border-color:transparent;background:var(--b1)}",
    ".tvb-knop{font:inherit;font-size:14px;font-weight:600;color:#fff;background:var(--o);border:0;border-radius:10px;padding:0 16px;cursor:pointer}",
    ".tvb-knop:hover{filter:brightness(.95)}.tvb-knop:disabled{opacity:.6;cursor:default}",
    ".tvb-knop:focus-visible,.tvb-chip:focus-visible,.tvb a:focus-visible{outline:2px solid var(--ot);outline-offset:2px}",
    ".tvb-privacy{font-size:12px;color:var(--t3);margin:7px 2px 0}",
    ".tvb-uit{margin-top:14px}",
    ".tvb-status{font-size:13px;color:var(--t2);margin:6px 0}",
    ".tvb-label{font-family:var(--mono);font-size:10.5px;font-weight:700;color:var(--ot);text-transform:uppercase;letter-spacing:.08em;margin:14px 0 4px}",
    ".tvb-echo{display:flex;justify-content:space-between;align-items:baseline;gap:12px;font-size:13px;color:var(--t2);margin:0;padding-bottom:12px;border-bottom:1px solid var(--r1)}",
    ".tvb-echo span{min-width:0}",
    ".tvb-nieuw{font:inherit;font-size:12.5px;font-weight:600;color:var(--ot);background:none;border:0;padding:0;cursor:pointer;white-space:nowrap}",
    ".tvb-nieuw:hover{text-decoration:underline}.tvb-nieuw:focus-visible{outline:2px solid var(--ot);outline-offset:2px}",
    ".tvb-nieuw-onder{display:block;margin:14px 0 0}",
    ".tvb-fc{display:block;font-size:16px;font-weight:700;line-height:1.3;color:var(--t1);text-decoration:none}",
    ".tvb-fc:hover{color:var(--ot)}",
    ".tvb-tekst{font-size:14px;color:var(--t1);margin:0}",
    ".tvb-klem{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:7;overflow:hidden}",
    ".tvb-meer{font:inherit;font-size:12.5px;font-weight:600;color:var(--ot);background:none;border:0;padding:4px 0 0;cursor:pointer}",
    ".tvb-af{margin:0;padding:0;list-style:none}",
    ".tvb-af li{font-size:13px;color:var(--t2);background:var(--ol);border:1px solid var(--ob);border-radius:9px;padding:8px 11px;margin:0 0 6px;cursor:pointer}",
    ".tvb-af li span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}",
    ".tvb-af li.tvb-open-li span{display:block}",
    ".tvb-af b{color:var(--t1);font-weight:600}",
    ".tvb-bron{font-size:12.5px;color:var(--t2);margin:12px 0 0;user-select:text;-webkit-user-select:text}",
    ".tvb-bron b{font-weight:600;color:var(--t1)}",
    ".tvb-meta{font-size:12px;color:var(--t3);margin:3px 0 0}",
    ".tvb-letop{font-size:12.5px;color:#C2410C;background:#FFF4EE;border-left:3px solid #FF5A1F;padding:6px 10px;margin:10px 0 0;border-radius:0 6px 6px 0}",
    ".tvb-open{display:inline-block;margin-top:12px;font-size:13.5px;font-weight:600;color:var(--ot);text-decoration:none;border:1px solid var(--ob);background:var(--ol);border-radius:999px;padding:7px 14px}",
    ".tvb-open:hover{border-color:var(--o)}",
    ".tvb-ook{margin:0;padding:0;list-style:none}",
    ".tvb-ook li{margin:3px 0;font-size:13px}",
    ".tvb a{color:var(--ot)}",
    ".tvb-chips{margin-top:4px}",
    ".tvb-chip{font:inherit;font-size:12.5px;text-align:left;color:var(--ot);background:var(--ol);border:1px solid var(--ob);border-radius:999px;padding:5px 11px;margin:0 6px 6px 0;cursor:pointer;line-height:1.35}",
    ".tvb-chip:hover{border-color:var(--o)}",
    ".tvb-melding{font-size:13.5px;color:var(--t2);background:var(--b2);border-left:3px solid var(--o);border-radius:8px;padding:11px 13px}",
    ".tvb-melding ul{margin:6px 0 0 16px;padding:0}",
    ".tvb-voet{font-size:11.5px;color:var(--t3);margin:14px 0 0;padding-top:10px;border-top:1px solid var(--r1)}",
    ".tvb-kaart{background:var(--b1);border:1px solid var(--r1);border-radius:14px;padding:18px 20px;margin:0 0 12px}",
    ".tvb-beveiligd .tvb-uit{user-select:none;-webkit-user-select:none}",
    ".tvb-beveiligd .tvb-uit .tvb-bron{user-select:text;-webkit-user-select:text}",
    "@media (max-width:560px){.tvb-paneel{padding:18px 16px 14px}.tvb-form{flex-direction:column}.tvb-knop{padding:11px}}"
  ].join("\n");

  function el(tag, cls, tekst) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (tekst != null) e.textContent = tekst;
    return e;
  }
  function nlDatum(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? m[3] + "-" + m[2] + "-" + m[1] : (iso || "");
  }
  function veiligeUrl(u) {
    return /^https:\/\/(www\.)?trnkl\.nl\//.test(u || "") ? u : null;
  }
  function link(tekst, url, cls) {
    var u = veiligeUrl(url);
    if (!u) return el("span", cls, tekst);
    var a = el("a", cls, tekst);
    a.href = u;
    return a;
  }

  function Flowfinder(host) {
    this.api = (host.getAttribute("data-api") || "").replace(/\/$/, "");
    this.kennisbank = host.getAttribute("data-kennisbank") || null;
    this.compact = (host.getAttribute("data-weergave") || "compact") !== "volledig";
    this.voorbeelden = (host.getAttribute("data-voorbeelden") || VOORBEELDEN).split("|");
    var root = el("div", "tvb" + (this.compact ? " tvb-paneel" : "") +
      (host.getAttribute("data-kopieren") === "aan" ? "" : " tvb-beveiligd"));
    root.appendChild(el("p", "tvb-eyebrow", "Flowfinder"));
    if (this.compact) {
      root.appendChild(el("h2", "tvb-kop", "Stel je vraag aan de kennisbanken"));
      root.appendChild(el("p", "tvb-sub", "Het antwoord komt letterlijk uit de gecontroleerde flowcharts, met bron en peildatum."));
    }
    var form = el("form", "tvb-form");
    form.setAttribute("role", "search");
    var id = "tvb-" + Math.random().toString(36).slice(2, 8);
    var lab = el("label", null, "Je vraag");
    lab.setAttribute("for", id);
    lab.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)";
    this.invoer = el("input", "tvb-invoer");
    this.invoer.id = id;
    this.invoer.type = "search";
    this.invoer.maxLength = 300;
    this.invoer.placeholder = "Bijvoorbeeld: hoe bepaal ik de UBO?";
    this.invoer.setAttribute("autocomplete", "off");
    this.knop = el("button", "tvb-knop", "Zoek");
    this.knop.type = "submit";
    form.appendChild(lab); form.appendChild(this.invoer); form.appendChild(this.knop);
    root.appendChild(form);
    root.appendChild(el("p", "tvb-privacy", PRIVACY));
    this.uit = el("div", "tvb-uit");
    this.uit.setAttribute("aria-live", "polite");
    root.appendChild(this.uit);
    host.appendChild(root);
    var self = this;
    form.addEventListener("submit", function (e) { e.preventDefault(); self.zoek(self.invoer.value); });
    if (root.classList.contains("tvb-beveiligd")) {
      ["copy", "cut", "dragstart", "contextmenu"].forEach(function (ev) {
        root.addEventListener(ev, function (e) {
          var t = e.target;
          if (t && t.closest && t.closest(".tvb-uit") && !t.closest(".tvb-bron")) e.preventDefault();
        });
      });
    }
    this.leeg();
  }

  Flowfinder.prototype.chips = function (vragen, label) {
    var self = this;
    var w = el("div", "tvb-chips");
    if (label) w.appendChild(el("p", "tvb-label", label));
    vragen.forEach(function (q) {
      var b = el("button", "tvb-chip", q);
      b.type = "button";
      b.addEventListener("click", function () { self.zoek(q); });
      w.appendChild(b);
    });
    return w;
  };

  Flowfinder.prototype.leeg = function () {
    this.uit.innerHTML = "";
    this.uit.appendChild(this.chips(this.voorbeelden, "Probeer bijvoorbeeld"));
  };

  Flowfinder.prototype.zoek = function (vraag) {
    vraag = (vraag || "").trim();
    if (!vraag) return;
    this.invoer.value = vraag;
    this.knop.disabled = true;
    this.uit.innerHTML = "";
    this.uit.appendChild(el("p", "tvb-status", "Zoeken in de kennisbanken…"));
    var self = this;
    fetch(this.api + "/zoek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vraag: vraag, filters: { kennisbank: this.kennisbank } })
    }).then(function (r) {
      return r.json().catch(function () { return { status: "fout" }; });
    }).then(function (d) { self.toon(d, vraag); })
      .catch(function () { self.toon({ status: "fout" }, vraag); })
      .then(function () { self.knop.disabled = false; });
  };

  // ---------------------------------------------------------------- compact
  // Eén antwoord, de flowchart voorop: staat in flowchart X, kort antwoord,
  // waar het van afhangt, bron en peildatum, link. Binnen de beste kennisbank gaat
  // een FAQ voor, want die is geschreven als kort antwoord op een vraag.
  Flowfinder.prototype.compactAntwoord = function (d, vraag) {
    var u = this.uit, items = d.items || [];
    var bank = items[0].kennisbank;
    var eigen = items.filter(function (k) { return k.kennisbank === bank; });
    var hoofd = eigen.filter(function (k) { return k.type === "faq"; })[0] || items[0];
    u.appendChild(el("p", "tvb-label", "Staat in flowchart"));
    u.appendChild(link((hoofd.kennisbank_titel || hoofd.kennisbank) + " →", hoofd.flowchart_url, "tvb-fc"));
    u.appendChild(el("p", "tvb-label", "Kort antwoord"));
    if (hoofd.type !== "faq" && hoofd.titel) u.appendChild(el("p", "tvb-tekst", hoofd.titel)).style.fontWeight = "600";
    var t = el("p", "tvb-tekst tvb-klem", hoofd.tekst || "");
    u.appendChild(t);
    if ((hoofd.tekst || "").length > 420) {
      var m = el("button", "tvb-meer", "Lees verder");
      m.type = "button";
      m.addEventListener("click", function () {
        var dicht = t.classList.toggle("tvb-klem");
        m.textContent = dicht ? "Lees verder" : "Minder tonen";
      });
      u.appendChild(m);
    }
    var uitz = (hoofd.uitzonderingen || []).concat(hoofd === items[0] ? [] : (items[0].uitzonderingen || [])).slice(0, 2);
    if (uitz.length) {
      u.appendChild(el("p", "tvb-label", "Hangt af van"));
      var ul = el("ul", "tvb-af");
      uitz.forEach(function (x) {
        var li = el("li");
        li.title = "Klik om alles te lezen";
        li.addEventListener("click", function () { li.classList.toggle("tvb-open-li"); });
        var sp = el("span");
        sp.appendChild(el("b", null, (x.situatie || "") + " "));
        sp.appendChild(document.createTextNode(x.gevolg || ""));
        li.appendChild(sp);
        ul.appendChild(li);
      });
      u.appendChild(ul);
    }
    // Een FAQ draagt zelf geen grondslag; die staat bij de regels in de flowchart.
    // Geen grondslag van een ander item lenen: dan klopt de toeschrijving niet.
    var br = el("p", "tvb-bron");
    br.appendChild(el("b", null, "Bron: "));
    br.appendChild(document.createTextNode(hoofd.bron || "de grondslagen staan per regel in de flowchart"));
    u.appendChild(br);
    var meta = [];
    if (hoofd.peildatum) meta.push("aan de bron getoetst tot " + nlDatum(hoofd.peildatum));
    if (hoofd.versie) meta.push("versie " + hoofd.versie);
    if (meta.length) u.appendChild(el("p", "tvb-meta", meta.join(" · ").replace(/^./, function (c) { return c.toUpperCase(); })));
    if (hoofd.let_op) u.appendChild(el("p", "tvb-letop", hoofd.let_op));
    u.appendChild(link("Open de flowchart →", hoofd.flowchart_url, "tvb-open"));
    // "Ook relevant": alleen een andere kennisbank die de vraag echt raakt,
    // dus minstens de helft van de vraag dekt of dicht bij de topscore zit.
    // Zonder die eis kwam bij "Hoe herken ik zorgfraude?" de meldplichtbank
    // mee op een enkel woord (26-09-2026).
    var gezien = {}, ook = [], top = items[0].score || 0;
    gezien[bank] = 1;
    items.forEach(function (k) {
      if (gezien[k.kennisbank]) return;
      if ((k.dekking || 0) < 0.5 && (k.score || 0) < 0.6 * top) return;
      gezien[k.kennisbank] = 1; ook.push(k);
    });
    if (ook.length) {
      u.appendChild(el("p", "tvb-label", "Ook relevant"));
      var ol = el("ul", "tvb-ook");
      ook.slice(0, 3).forEach(function (k) {
        var li = el("li");
        li.appendChild(link(k.kennisbank_titel || k.kennisbank, k.flowchart_url));
        ol.appendChild(li);
      });
      u.appendChild(ol);
    }
    if (d.vervolgvragen && d.vervolgvragen.length) u.appendChild(this.chips(d.vervolgvragen, "Verder vragen"));
  };

  // ---------------------------------------------------------------- volledig
  function kaart(k) {
    var c = el("article", "tvb-kaart");
    c.appendChild(el("p", "tvb-eyebrow", k.soort || ""));
    c.appendChild(el("p", "tvb-fc", k.titel || k.kennisbank_titel || ""));
    c.appendChild(el("p", "tvb-tekst", k.tekst || ""));
    if (k.bron) c.appendChild(el("p", "tvb-bron", "Bron: " + k.bron));
    var meta = el("p", "tvb-meta");
    meta.appendChild(link(k.kennisbank_titel || k.kennisbank, k.flowchart_url));
    if (k.peildatum) meta.appendChild(document.createTextNode(" · getoetst tot " + nlDatum(k.peildatum)));
    c.appendChild(meta);
    if (k.let_op) c.appendChild(el("p", "tvb-letop", k.let_op));
    return c;
  }

  // "Je vroeg: ..." met een knop om terug te gaan naar de beginstand
  // (leeg invoerveld, voorbeeldvragen). Zonder die knop bleef het oude
  // antwoord staan tot de volgende vraag (opmerking Toine, 26-09-2026).
  Flowfinder.prototype.nieuwKnop = function (klasse) {
    var self = this;
    var b = el("button", "tvb-nieuw" + (klasse ? " " + klasse : ""), "Nieuwe vraag ↺");
    b.type = "button";
    b.addEventListener("click", function () {
      self.invoer.value = "";
      self.leeg();
      self.invoer.focus();
    });
    return b;
  };

  Flowfinder.prototype.toon = function (d, vraag) {
    var u = this.uit;
    u.innerHTML = "";
    var echo = el("p", "tvb-echo");
    echo.appendChild(el("span", null, "Je vroeg: ‘" + vraag + "’"));
    echo.appendChild(this.nieuwKnop());
    u.appendChild(echo);
    if (d.status === "treffer" && d.items && d.items.length) {
      if (this.compact) this.compactAntwoord(d, vraag);
      else d.items.forEach(function (k) { u.appendChild(kaart(k)); });
    } else {
      var m = el("div", "tvb-melding", d.melding || FOUT);
      if (d.status === "geen_treffer" && d.suggesties && d.suggesties.length) {
        m.appendChild(el("p", "tvb-label", "Misschien helpt een van deze flowcharts"));
        var ul = el("ul");
        d.suggesties.forEach(function (s) {
          var li = el("li");
          li.appendChild(link(s.titel, s.flowchart_url));
          ul.appendChild(li);
        });
        m.appendChild(ul);
      }
      u.appendChild(m);
      if (d.status === "geen_treffer") u.appendChild(this.chips(this.voorbeelden, "Probeer bijvoorbeeld"));
    }
    var voet = [];
    if (d.status === "treffer" || d.status === "geen_treffer") voet.push(d.disclaimer || DISCLAIMER);
    if (typeof d.resterend === "number" && d.status !== "limiet")
      voet.push(d.resterend === 1 ? "Nog 1 vraag vandaag." : "Nog " + d.resterend + " vragen vandaag.");
    if (voet.length) u.appendChild(el("p", "tvb-voet", voet.join(" ")));
    if (d.status === "treffer") u.appendChild(this.nieuwKnop("tvb-nieuw-onder"));
  };

  function start() {
    if (!document.getElementById("tvb-stijl")) {
      var s = document.createElement("style");
      s.id = "tvb-stijl";
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    var hosts = document.querySelectorAll("[data-trnkl-flowfinder]");
    for (var i = 0; i < hosts.length; i++) {
      if (!hosts[i].__tvb) hosts[i].__tvb = new Flowfinder(hosts[i]);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  window.TRNKLFlowfinder = { start: start };
})();
