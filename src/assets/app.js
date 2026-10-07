(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  // Theme toggle (persists per viewer)
  const root = document.documentElement;
  const saved = store.get("theme");
  if (saved) root.dataset.theme = saved;
  const themeBtn = $(".theme-toggle");
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const paintIcon = () => themeBtn && (themeBtn.textContent = isDark() ? "☀" : "☾");
  paintIcon();
  themeBtn?.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    paintIcon();
  });

  // Mobile menu + dropdown
  const menuBtn = $(".menu-toggle");
  const links = $(".nav-links");
  menuBtn?.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$(".has-dd > button").forEach((b) => b.addEventListener("click", () => {
    const li = b.parentElement;
    const open = li.classList.toggle("open");
    b.setAttribute("aria-expanded", open);
  }));
  document.addEventListener("click", (e) => {
    $$(".has-dd.open").forEach((li) => { if (!li.contains(e.target)) li.classList.remove("open"); });
  });

  // Back-to-top + sticky mobile CTA
  const backTop = $(".back-top");
  const sticky = $(".sticky-cta");
  if (sticky) document.body.classList.add("has-sticky");
  const onScroll = () => {
    const y = scrollY;
    backTop?.classList.toggle("show", y > 800);
    sticky?.classList.toggle("show", y > 500);
  };
  addEventListener("scroll", onScroll, { passive: true });
  backTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // TOC scroll-spy
  const tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          tocLinks.forEach((a) => a.classList.remove("active"));
          map.get(en.target.id)?.classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  // Sortable tables: <th class="sortable" data-type="num|text">, cells may carry data-sort
  $$("table[data-sortable]").forEach((table) => {
    const ths = $$("th.sortable", table);
    ths.forEach((th) => th.addEventListener("click", () => {
      const idx = [...th.parentElement.children].indexOf(th);
      const asc = th.getAttribute("aria-sort") !== "ascending";
      ths.forEach((t) => t.removeAttribute("aria-sort"));
      th.setAttribute("aria-sort", asc ? "ascending" : "descending");
      const num = th.dataset.type === "num";
      const tbody = table.tBodies[0];
      const rows = [...tbody.rows].sort((a, b) => {
        const va = a.cells[idx].dataset.sort ?? a.cells[idx].textContent.trim();
        const vb = b.cells[idx].dataset.sort ?? b.cells[idx].textContent.trim();
        const r = num ? Number(va) - Number(vb) : va.localeCompare(vb);
        return asc ? r : -r;
      });
      rows.forEach((r) => tbody.appendChild(r));
    }));
  });

  // Generic filter: [data-filter-scope] contains .search input, .filter-chip buttons and [data-item] elements
  $$("[data-filter-scope]").forEach((scope) => {
    const search = $(".search", scope);
    const chips = $$(".filter-chip", scope);
    const items = $$("[data-item]", scope);
    const empty = $(".empty", scope);
    const apply = () => {
      const q = (search?.value || "").toLowerCase().trim();
      const active = chips.filter((c) => c.getAttribute("aria-pressed") === "true").map((c) => c.dataset.tag);
      let shown = 0;
      items.forEach((it) => {
        const text = it.dataset.search || it.textContent.toLowerCase();
        const tags = (it.dataset.tags || "").split(" ");
        const ok = (!q || text.includes(q)) && active.every((t) => tags.includes(t));
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    search?.addEventListener("input", apply);
    chips.forEach((c) => c.addEventListener("click", () => {
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
      apply();
    }));
  });

  // Interactive comparison tool
  const cmp = $("#compare-app");
  if (cmp) {
    const data = JSON.parse($("#tools-data").textContent);
    const { tools, features, base } = data;
    const selects = $$("select", cmp);
    const out = $("#compare-output");
    const params = new URLSearchParams(location.search);
    const preset = (params.get("tools") || "").split(",").filter((id) => tools[id]);
    selects.forEach((s, i) => { if (preset[i]) s.value = preset[i]; });

    const cell = (v) => v === 2 ? '<span class="yes" title="Included">✓</span>' : v === 1 ? '<span class="part" title="Limited or add-on">~</span>' : '<span class="no" title="Not available">✕</span>';
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const render = () => {
      const ids = [...new Set(selects.map((s) => s.value).filter(Boolean))];
      const q = new URLSearchParams(location.search);
      q.set("tools", ids.join(","));
      history.replaceState(null, "", "?" + q.toString());
      if (ids.length < 2) { out.innerHTML = '<div class="empty card">Pick at least two tools to compare.</div>'; return; }
      const sel = ids.map((id) => ({ id, ...tools[id] }));
      const head = sel.map((t) => `<th><div style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;color:var(--text);font-size:.95rem"><span class="logo logo-sm" style="background:${t.color}">${esc(t.initials)}</span>${esc(t.name)}</div></th>`).join("");
      const row = (label, fn) => `<tr><td><b>${label}</b></td>${sel.map((t) => `<td>${fn(t)}</td>`).join("")}</tr>`;
      const best = Math.max(...sel.map((t) => t.rating));
      const rows = [
        row("Our rating", (t) => `<span class="rating"><span class="stars" style="--pct:${t.rating / 5 * 100}%">★★★★★</span>${t.rating}</span>${t.rating === best ? ' <span class="badge badge-green">Top</span>' : ""}`),
        row("Starting price", (t) => `<b>${esc(t.priceLabel)}</b>`),
        row("Free plan / trial", (t) => esc(t.trial)),
        row("Best for", (t) => `<span class="small">${esc(t.bestFor)}</span>`),
        ...features.map((f) => row(f.label, (t) => cell(t.matrix[f.key]))),
        row("Networks", (t) => `<span class="small">${t.platforms.map(esc).join(", ")}</span>`),
        row("", (t) => `<a class="btn btn-sm ${t.id === "contentstudio" ? "btn-cs" : "btn-ghost"}" href="${base}reviews/${t.id}/">Read review</a>`),
      ];
      out.innerHTML = `<div class="table-wrap"><table class="matrix"><thead><tr><th>Feature</th>${head}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
    };
    selects.forEach((s) => s.addEventListener("change", render));
    render();
  }
})();
