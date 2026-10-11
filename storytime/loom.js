  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("loom-theme"); } catch (e) {}
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  })();

  function mountThemeToggle(el) {
    if (!el) return;
    function label() {
      var t = document.documentElement.getAttribute("data-theme");
      if (!t) {
        t = matchMedia("(prefers-color-scheme: dark)").matches ? "indigo" : "linen";
      }
      el.textContent = t === "indigo" ? "linen" : "indigo";
    }
    el.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      if (!cur) {
        cur = matchMedia("(prefers-color-scheme: dark)").matches ? "indigo" : "linen";
      }
      var next = cur === "indigo" ? "linen" : "indigo";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("loom-theme", next); } catch (e) {}
      label();
    });
    label();
  }

  /* ---------- the draft glyph ----------
     Deterministic bit pattern from a seed string, so a story's
     draft is stable forever and unique to its slug.            */

  function draftBits(seed, count) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h = h >>> 0 || 1;
    var bits = [];
    for (var j = 0; j < count; j++) {
      h ^= h << 13; h >>>= 0;
      h ^= h >> 17;
      h ^= h << 5;  h >>>= 0;
      bits.push(h & 1);
    }
    return bits;
  }

  function draftEl(seed, count, extraClass) {
    var span = document.createElement("span");
    span.className = "draft" + (extraClass ? " " + extraClass : "");
    span.setAttribute("aria-hidden", "true");
    draftBits(seed, count).forEach(function (b) {
      var cell = document.createElement("i");
      if (b) cell.className = "set";
      span.appendChild(cell);
    });
    return span;
  }

  /* ---------- text ---------- */

  /* Collapses \r\n and stray \r — fixes \n\r\n showing up as
     a phantom blank line in generated credit blocks. */
  function normalizeText(s) {
    return String(s == null ? "" : s)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* Small markdown subset: headings, hr, blockquote, bold, italic.
     Enough for generated prose, no dependency. */
  function renderProse(src) {
    var lines = normalizeText(String(src || "").replace(/\r\n?/g, "\n")).split("\n");
    var out = [], para = [], list = null, quote = [];

    function flushPara()  { if (para.length)  { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } }
    function flushQuote() { if (quote.length) { out.push("<blockquote>" + quote.map(inline).join("<br>") + "</blockquote>"); quote = []; } }
    function flushList()  {
      if (!list) return;
      out.push("<ul>" + list.map(function (li) { return "<li>" + inline(li) + "</li>"; }).join("") + "</ul>");
      list = null;
    }
    function flush() { flushPara(); flushList(); flushQuote(); }

    lines.forEach(function (raw) {
      var t = raw.trim(), m;
      if (!t) { flush(); return; }                                   // blank or space-only line
      if (/^(---|\*\*\*|___)$/.test(t)) { flush(); out.push("<hr>"); return; }
      if ((m = t.match(/^#{1,4}\s+(.*)$/))) { flush(); out.push("<h2>" + inline(m[1]) + "</h2>"); return; }
      if ((m = t.match(/^[-*+]\s+(.*)$/))) { flushPara(); flushQuote(); (list = list || []).push(m[1]); return; }
      if ((m = t.match(/^>\s?(.*)$/)))     { flushPara(); flushList(); quote.push(m[1]); return; }
      if (list && /^\s{2,}/.test(raw))     { list[list.length - 1] += " " + t; return; }  // indented continuation
      flushList(); flushQuote(); para.push(t);
    });
    flush();
    return out.join("\n");

    function inline(s) {
      return escapeHtml(s)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
        .replace(/(^|[^\w])_([^_]+)_(?=[^\w]|$)/g, "$1<em>$2</em>");
    }
  }

  function wordCount(s) {
    var t = normalizeText(s);
    return t ? t.split(/\s+/).length : 0;
  }

  function readMinutes(words) {
    return Math.max(1, Math.round(words / 230));
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  /* ---------- data ---------- */

  function loadJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(r.status + " " + r.statusText + " — " + path);
      return r.json();
    });
  }      