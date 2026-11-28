/* Course dropdowns. The native select retains its value, options and form behavior. */
(() => {
  const controls = new WeakMap();
  const selector = "select:not([multiple]):not([data-native-select])";
  let current, nextId = 0;
  const find = (select) => controls.get(select);
  const usable = (o) => !o.disabled && !o.hidden && !o.parentElement.disabled && !o.parentElement.hidden;

  function sync(select) {
    const control = find(select);
    if (!control) return;
    control.value.textContent = select.selectedOptions[0]?.label || "Выберите вариант";
    control.button.disabled = select.matches(":disabled");
    control.button.setAttribute("aria-required", String(select.required));
    control.wrap.hidden = select.hidden;
    if (current === control) close();
  }

  function close() {
    if (!current) return;
    const { menu, button } = current;
    current = null;
    if (menu.hidePopover && menu.matches(":popover-open")) menu.hidePopover();
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.removeAttribute("aria-activedescendant");
  }

  function position({ button, menu }) {
    const a = button.getBoundingClientRect(), gutter = 8, gap = 6;
    const below = innerHeight - a.bottom - gutter - gap, above = a.top - gutter - gap;
    const up = below < 200 && above > below;
    const width = Math.min(innerWidth - 2 * gutter, Math.max(a.width, 220));
    Object.assign(menu.style, {
      width: width + "px",
      left: Math.max(gutter, Math.min(a.left, innerWidth - gutter - width)) + "px",
      maxHeight: Math.max(0, Math.min(320, up ? above : below)) + "px",
      top: up ? "auto" : a.bottom + gap + "px",
      bottom: up ? innerHeight - a.top + gap + "px" : "auto"
    });
  }

  function highlight(c, index) {
    const option = c.items[index];
    if (!option) return;
    c.items[c.active]?.classList.remove("is-active");
    c.active = index;
    option.classList.add("is-active");
    c.button.setAttribute("aria-activedescendant", option.id);
    const offset = option.offsetTop;
    if (offset < c.menu.scrollTop) c.menu.scrollTop = offset;
    else if (offset + option.offsetHeight > c.menu.scrollTop + c.menu.clientHeight) c.menu.scrollTop = offset + option.offsetHeight - c.menu.clientHeight;
  }

  function open(c, upward = false) {
    if (c.button.disabled) return;
    close();
    const { menu, select, button } = c;
    let lastGroup;
    menu.replaceChildren();
    c.items = Array.from(select.options, (o, i) => {
      if (o.hidden || (o.parentElement.tagName === "OPTGROUP" && o.parentElement.hidden)) return null;
      const group = o.parentElement.tagName === "OPTGROUP" ? o.parentElement : null;
      if (group && group !== lastGroup) {
        const heading = document.createElement("span");
        heading.className = "site-select-group";
        heading.setAttribute("role", "presentation");
        heading.textContent = group.label;
        menu.append(heading);
      }
      lastGroup = group;
      const el = document.createElement("span");
      el.id = menu.id + "-" + i;
      el.dataset.option = i;
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", String(o.selected));
      if (!usable(o)) el.setAttribute("aria-disabled", "true");
      el.textContent = o.label || "—";
      menu.append(el);
      return el;
    });
    c.options = Array.from(select.options, (o, i) => usable(o) ? i : null).filter((i) => i !== null);
    c.active = -1;
    c.typed = "";
    c.typedAt = 0;
    current = c;
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    position(c);
    if (menu.showPopover) menu.showPopover();
    highlight(c, c.options.includes(select.selectedIndex) ? select.selectedIndex : upward ? c.options.at(-1) : c.options[0]);
  }

  function choose(c, i) {
    if (!c.options.includes(i)) return;
    close();
    if (c.select.selectedIndex === i) return;
    c.select.selectedIndex = i;
    sync(c.select);
    c.select.dispatchEvent(new Event("input", { bubbles: true }));
    c.select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function keyboard(event, c) {
    const { key } = event;
    if (key === "Tab") { close(); return; }
    if (key === "Escape" && current === c) { event.preventDefault(); event.stopPropagation(); close(); return; }
    const arrow = key === "ArrowDown" || key === "ArrowUp";
    if (arrow || key === "Home" || key === "End") {
      event.preventDefault();
      event.stopPropagation();
      const wasOpen = current === c;
      if (!wasOpen) open(c, key === "ArrowUp");
      const at = c.options.indexOf(c.active);
      if (key === "Home") highlight(c, c.options[0]);
      else if (key === "End") highlight(c, c.options.at(-1));
      else if (wasOpen) highlight(c, c.options[Math.max(0, Math.min(c.options.length - 1, at + (key === "ArrowUp" ? -1 : 1)))]);
    } else if (key === "Enter" || key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (current === c) choose(c, c.active); else open(c);
    } else if (key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.stopPropagation();
      if (current !== c) open(c);
      const now = Date.now(), char = key.toLocaleLowerCase();
      c.typed = now - c.typedAt < 600 ? c.typed + char : char;
      c.typedAt = now;
      const query = Array.from(c.typed).every((k) => k === char) ? char : c.typed;
      const at = c.options.indexOf(c.active) + (query.length === 1 ? 1 : 0);
      const ordered = [...c.options.slice(at), ...c.options.slice(0, at)];
      highlight(c, ordered.find((i) => c.select.options[i].label.toLocaleLowerCase().startsWith(query)));
    }
  }

  function enhance(select) {
    if (find(select) || select.size > 1 || !select.isConnected) return;
    const labels = Array.from(select.labels || []);
    const label = labels.map((node) => {
      const copy = node.cloneNode(true);
      copy.querySelectorAll("select, .site-select").forEach((child) => child.remove());
      return copy.textContent.trim();
    }).filter(Boolean).join(" ");
    const wrap = document.createElement("span"), button = document.createElement("button"),
      value = document.createElement("span"), menu = document.createElement("span");
    wrap.className = "site-select";
    button.type = "button";
    button.className = "site-select-button";
    button.setAttribute("role", "combobox");
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    const name = select.getAttribute("aria-label") || label || select.title;
    if (select.hasAttribute("aria-labelledby")) button.setAttribute("aria-labelledby", select.getAttribute("aria-labelledby"));
    else if (name) button.setAttribute("aria-label", name);
    menu.id = "site-options-" + ++nextId;
    menu.className = "site-select-menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", name || "Варианты");
    if (menu.showPopover) menu.setAttribute("popover", "manual");
    menu.hidden = true;
    button.setAttribute("aria-controls", menu.id);
    button.append(value);
    select.before(wrap);
    wrap.append(select, button, menu);
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;
    const c = { select, wrap, button, value, menu, items: [] };
    controls.set(select, c);
    sync(select);
    button.addEventListener("click", () => { if (current === c) close(); else open(c); });
    button.addEventListener("keydown", (e) => keyboard(e, c));
    button.addEventListener("focus", () => sync(select));
    select.addEventListener("focus", () => button.focus());
    select.addEventListener("change", () => sync(select));
    select.addEventListener("invalid", (e) => {
      e.preventDefault();
      button.focus();
      open(c);
    });
    menu.addEventListener("mousedown", (e) => { if (e.target.closest("[data-option]")) e.preventDefault(); });
    menu.addEventListener("click", (e) => {
      const option = e.target.closest("[data-option]");
      if (option) choose(c, +option.dataset.option);
    });
    for (const node of labels) node.addEventListener("click", (e) => {
      if (e.target.closest("button, a, input, textarea, .site-select-menu")) return;
      e.preventDefault();
      button.focus();
    });
  }

  function scan(node) {
    if (node.matches?.(selector)) enhance(node);
    node.querySelectorAll?.(selector).forEach(enhance);
  }

  new MutationObserver((records) => {
    const update = new Set();
    for (const r of records) {
      const el = r.target.nodeType === Node.ELEMENT_NODE ? r.target : r.target.parentElement;
      if (el?.closest(".site-select-menu, .site-select-button")) continue;
      const select = el?.closest("select");
      if (select && find(select)) update.add(select);
      if (el?.matches("fieldset") && r.type === "attributes") el.querySelectorAll(selector).forEach((s) => update.add(s));
      for (const node of r.addedNodes) scan(node);
    }
    update.forEach(sync);
    if (current && !current.wrap.isConnected) close();
  }).observe(document.body, {
    childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ["disabled", "selected", "hidden", "label", "required"]
  });
  document.addEventListener("pointerdown", (e) => { if (current && !current.wrap.contains(e.target)) close(); }, true);
  document.addEventListener("focusin", (e) => { if (current && !current.wrap.contains(e.target)) close(); });
  document.addEventListener("scroll", (e) => { if (current && e.target !== current.menu) position(current); }, true);
  document.addEventListener("reset", (e) => requestAnimationFrame(() => Array.from(e.target.elements).filter(find).forEach(sync)));
  window.addEventListener("resize", () => { if (current) position(current); });
  window.SiteSelect = { sync };
  scan(document);
})();
