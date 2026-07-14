/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Fe = globalThis, lt = Fe.ShadowRoot && (Fe.ShadyCSS === void 0 || Fe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ct = Symbol(), bt = /* @__PURE__ */ new WeakMap();
let qt = class {
  constructor(t, i, s) {
    if (this._$cssResult$ = !0, s !== ct) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (lt && t === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (t = bt.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && bt.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ti = (e) => new qt(typeof e == "string" ? e : e + "", void 0, ct), _ = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((s, r, a) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[a + 1], e[0]);
  return new qt(i, e, ct);
}, ii = (e, t) => {
  if (lt) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const s = document.createElement("style"), r = Fe.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, e.appendChild(s);
  }
}, vt = lt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const s of t.cssRules) i += s.cssText;
  return ti(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: si, defineProperty: ri, getOwnPropertyDescriptor: ai, getOwnPropertyNames: oi, getOwnPropertySymbols: ni, getPrototypeOf: li } = Object, Xe = globalThis, $t = Xe.trustedTypes, ci = $t ? $t.emptyScript : "", di = Xe.reactiveElementPolyfillSupport, Ie = (e, t) => e, We = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ci : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, dt = (e, t) => !si(e, t), _t = { attribute: !0, type: String, converter: We, reflect: !1, useDefault: !1, hasChanged: dt };
Symbol.metadata ??= Symbol("metadata"), Xe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let we = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = _t) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, i);
      r !== void 0 && ri(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, s) {
    const { get: r, set: a } = ai(this.prototype, t) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const h = r?.call(this);
      a?.call(this, n), this.requestUpdate(t, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? _t;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Ie("elementProperties"))) return;
    const t = li(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ie("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ie("properties"))) {
      const i = this.properties, s = [...oi(i), ...ni(i)];
      for (const r of s) this.createProperty(r, i[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [s, r] of i) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const r = this._$Eu(i, s);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) i.unshift(vt(r));
    } else t !== void 0 && i.push(vt(t));
    return i;
  }
  static _$Eu(t, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ii(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, s) {
    this._$AK(t, s);
  }
  _$ET(t, i) {
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const a = (s.converter?.toAttribute !== void 0 ? s.converter : We).toAttribute(i, s.type);
      this._$Em = t, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), n = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : We;
      this._$Em = r;
      const h = n.fromAttribute(i, a.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, i, s, r = !1, a) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (a = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? dt)(a, i) || s.useDefault && s.reflect && a === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: s, reflect: r, wrapped: a }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? i ?? this[t]), a !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, a] of this._$Ep) this[r] = a;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, a] of s) {
        const { wrapped: n } = a, h = this[r];
        n !== !0 || this._$AL.has(r) || h === void 0 || this.C(r, void 0, a, h);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
we.elementStyles = [], we.shadowRootOptions = { mode: "open" }, we[Ie("elementProperties")] = /* @__PURE__ */ new Map(), we[Ie("finalized")] = /* @__PURE__ */ new Map(), di?.({ ReactiveElement: we }), (Xe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pt = globalThis, xt = (e) => e, Ve = pt.trustedTypes, wt = Ve ? Ve.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Bt = "$lit$", pe = `lit$${Math.random().toFixed(9).slice(2)}$`, Gt = "?" + pe, pi = `<${Gt}>`, be = document, De = () => be.createComment(""), Te = (e) => e === null || typeof e != "object" && typeof e != "function", ht = Array.isArray, hi = (e) => ht(e) || typeof e?.[Symbol.iterator] == "function", tt = `[ 	
\f\r]`, Ae = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, kt = /-->/g, St = />/g, fe = RegExp(`>|${tt}(?:([^\\s"'>=/]+)(${tt}*=${tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), zt = /'/g, Ct = /"/g, Lt = /^(?:script|style|textarea|title)$/i, Ht = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), o = Ht(1), Pt = Ht(2), ke = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Et = /* @__PURE__ */ new WeakMap(), ye = be.createTreeWalker(be, 129);
function Ft(e, t) {
  if (!ht(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return wt !== void 0 ? wt.createHTML(t) : t;
}
const ui = (e, t) => {
  const i = e.length - 1, s = [];
  let r, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = Ae;
  for (let h = 0; h < i; h++) {
    const p = e[h];
    let f, k, u = -1, J = 0;
    for (; J < p.length && (n.lastIndex = J, k = n.exec(p), k !== null); ) J = n.lastIndex, n === Ae ? k[1] === "!--" ? n = kt : k[1] !== void 0 ? n = St : k[2] !== void 0 ? (Lt.test(k[2]) && (r = RegExp("</" + k[2], "g")), n = fe) : k[3] !== void 0 && (n = fe) : n === fe ? k[0] === ">" ? (n = r ?? Ae, u = -1) : k[1] === void 0 ? u = -2 : (u = n.lastIndex - k[2].length, f = k[1], n = k[3] === void 0 ? fe : k[3] === '"' ? Ct : zt) : n === Ct || n === zt ? n = fe : n === kt || n === St ? n = Ae : (n = fe, r = void 0);
    const P = n === fe && e[h + 1].startsWith("/>") ? " " : "";
    a += n === Ae ? p + pi : u >= 0 ? (s.push(f), p.slice(0, u) + Bt + p.slice(u) + pe + P) : p + pe + (u === -2 ? h : P);
  }
  return [Ft(e, a + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class Me {
  constructor({ strings: t, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let a = 0, n = 0;
    const h = t.length - 1, p = this.parts, [f, k] = ui(t, i);
    if (this.el = Me.createElement(f, s), ye.currentNode = this.el.content, i === 2 || i === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = ye.nextNode()) !== null && p.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(Bt)) {
          const J = k[n++], P = r.getAttribute(u).split(pe), E = /([.?@])?(.*)/.exec(J);
          p.push({ type: 1, index: a, name: E[2], strings: P, ctor: E[1] === "." ? mi : E[1] === "?" ? fi : E[1] === "@" ? yi : Je }), r.removeAttribute(u);
        } else u.startsWith(pe) && (p.push({ type: 6, index: a }), r.removeAttribute(u));
        if (Lt.test(r.tagName)) {
          const u = r.textContent.split(pe), J = u.length - 1;
          if (J > 0) {
            r.textContent = Ve ? Ve.emptyScript : "";
            for (let P = 0; P < J; P++) r.append(u[P], De()), ye.nextNode(), p.push({ type: 2, index: ++a });
            r.append(u[J], De());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Gt) p.push({ type: 2, index: a });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(pe, u + 1)) !== -1; ) p.push({ type: 7, index: a }), u += pe.length - 1;
      }
      a++;
    }
  }
  static createElement(t, i) {
    const s = be.createElement("template");
    return s.innerHTML = t, s;
  }
}
function Se(e, t, i = e, s) {
  if (t === ke) return t;
  let r = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const a = Te(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== a && (r?._$AO?.(!1), a === void 0 ? r = void 0 : (r = new a(e), r._$AT(e, i, s)), s !== void 0 ? (i._$Co ??= [])[s] = r : i._$Cl = r), r !== void 0 && (t = Se(e, r._$AS(e, t.values), r, s)), t;
}
class gi {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: s } = this._$AD, r = (t?.creationScope ?? be).importNode(i, !0);
    ye.currentNode = r;
    let a = ye.nextNode(), n = 0, h = 0, p = s[0];
    for (; p !== void 0; ) {
      if (n === p.index) {
        let f;
        p.type === 2 ? f = new Ne(a, a.nextSibling, this, t) : p.type === 1 ? f = new p.ctor(a, p.name, p.strings, this, t) : p.type === 6 && (f = new bi(a, this, t)), this._$AV.push(f), p = s[++h];
      }
      n !== p?.index && (a = ye.nextNode(), n++);
    }
    return ye.currentNode = be, r;
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }
}
class Ne {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, s, r) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = Se(this, t, i), Te(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== ke && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : hi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && Te(this._$AH) ? this._$AA.nextSibling.data = t : this.T(be.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = Me.createElement(Ft(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const a = new gi(r, this), n = a.u(this.options);
      a.p(i), this.T(n), this._$AH = a;
    }
  }
  _$AC(t) {
    let i = Et.get(t.strings);
    return i === void 0 && Et.set(t.strings, i = new Me(t)), i;
  }
  k(t) {
    ht(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const a of t) r === i.length ? i.push(s = new Ne(this.O(De()), this.O(De()), this, this.options)) : s = i[r], s._$AI(a), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const s = xt(t).nextSibling;
      xt(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Je {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, r, a) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = a, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(t, i = this, s, r) {
    const a = this.strings;
    let n = !1;
    if (a === void 0) t = Se(this, t, i, 0), n = !Te(t) || t !== this._$AH && t !== ke, n && (this._$AH = t);
    else {
      const h = t;
      let p, f;
      for (t = a[0], p = 0; p < a.length - 1; p++) f = Se(this, h[s + p], i, p), f === ke && (f = this._$AH[p]), n ||= !Te(f) || f !== this._$AH[p], f === d ? t = d : t !== d && (t += (f ?? "") + a[p + 1]), this._$AH[p] = f;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class mi extends Je {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class fi extends Je {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class yi extends Je {
  constructor(t, i, s, r, a) {
    super(t, i, s, r, a), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = Se(this, t, i, 0) ?? d) === ke) return;
    const s = this._$AH, r = t === d && s !== d || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, a = t !== d && (s === d || r);
    r && this.element.removeEventListener(this.name, this, s), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class bi {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Se(this, t);
  }
}
const vi = pt.litHtmlPolyfillSupport;
vi?.(Me, Ne), (pt.litHtmlVersions ??= []).push("3.3.3");
const $i = (e, t, i) => {
  const s = i?.renderBefore ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const a = i?.renderBefore ?? null;
    s._$litPart$ = r = new Ne(t.insertBefore(De(), a), a, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = globalThis;
let g = class extends we {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = $i(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ke;
  }
};
g._$litElement$ = !0, g.finalized = !0, ut.litElementHydrateSupport?.({ LitElement: g });
const _i = ut.litElementPolyfillSupport;
_i?.({ LitElement: g });
(ut.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const y = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xi = { attribute: !0, type: String, converter: We, reflect: !1, hasChanged: dt }, wi = (e = xi, t, i) => {
  const { kind: s, metadata: r } = i;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(i.name, e), s === "accessor") {
    const { name: n } = i;
    return { set(h) {
      const p = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(n, p, e, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(n, void 0, e, h), h;
    } };
  }
  if (s === "setter") {
    const { name: n } = i;
    return function(h) {
      const p = this[n];
      t.call(this, h), this.requestUpdate(n, p, e, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function l(e) {
  return (t, i) => typeof i == "object" ? wi(e, t, i) : ((s, r, a) => {
    const n = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, s), n ? Object.getOwnPropertyDescriptor(r, a) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function c(e) {
  return l({ ...e, state: !0, attribute: !1 });
}
var ki = Object.defineProperty, Si = Object.getOwnPropertyDescriptor, Qe = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Si(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && ki(t, i, r), r;
};
let ze = class extends g {
  constructor() {
    super(...arguments), this.variant = "filled", this.disabled = !1;
  }
  render() {
    return o`
      <button class=${this.variant} ?disabled=${this.disabled} @click=${this.handleClick}>
        ${this.icon ? o`<span aria-hidden="true">${this.icon}</span>` : d}
        <slot></slot>
      </button>
    `;
  }
  handleClick(e) {
    this.disabled && e.stopPropagation();
  }
};
ze.styles = _`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 40px;
      padding: 0 16px;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s ease;
      width: 100%;
    }

    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    button:not(:disabled):hover {
      opacity: 0.85;
    }

    .filled {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .text {
      background: none;
      color: var(--primary-color, #03a9f4);
    }

    .danger {
      background: none;
      color: var(--error-color, #db4437);
    }
  `;
Qe([
  l({ type: String })
], ze.prototype, "variant", 2);
Qe([
  l({ type: Boolean })
], ze.prototype, "disabled", 2);
Qe([
  l({ type: String })
], ze.prototype, "icon", 2);
ze = Qe([
  y("se-button")
], ze);
var zi = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, Pe = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ci(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && zi(t, i, r), r;
};
let he = class extends g {
  constructor() {
    super(...arguments), this.fallback = "?", this.color = "#5c6b8a", this.size = 40, this.plain = !1;
  }
  render() {
    if (this.plain)
      return o`
        <div
          class="bare"
          style=${`--mdc-icon-size: ${this.size}px; font-size: ${this.size}px;`}
        >
          ${this.renderContent()}
        </div>
      `;
    const e = `
      background: ${this.color};
      width: ${this.size}px;
      height: ${this.size}px;
      font-size: ${Math.round(this.size * 0.35)}px;
      --mdc-icon-size: ${Math.round(this.size * 0.55)}px;
    `;
    return o`
      <div class="pill" style=${e}>${this.renderContent()}</div>
    `;
  }
  renderContent() {
    return this.icon && this.hasHaIcon() ? o`<ha-icon .icon=${this.icon}></ha-icon>` : o`<span>${this.fallback}</span>`;
  }
  /** `ha-icon` belongs to the Home Assistant frontend, not to this bundle. */
  hasHaIcon() {
    return customElements.get("ha-icon") !== void 0;
  }
};
he.styles = _`
    :host {
      display: block;
      flex: 0 0 auto;
    }

    .pill {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
    }

    ha-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bare {
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      line-height: 1;
    }
  `;
Pe([
  l({ type: String })
], he.prototype, "icon", 2);
Pe([
  l({ type: String })
], he.prototype, "fallback", 2);
Pe([
  l({ type: String })
], he.prototype, "color", 2);
Pe([
  l({ type: Number })
], he.prototype, "size", 2);
Pe([
  l({ type: Boolean })
], he.prototype, "plain", 2);
he = Pe([
  y("se-icon")
], he);
var Pi = Object.getOwnPropertyDescriptor, Ei = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Pi(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = n(r) || r);
  return r;
};
let rt = class extends g {
  constructor() {
    super(...arguments), this.toggle = () => {
      this.dispatchEvent(
        new CustomEvent("hass-toggle-menu", { bubbles: !0, composed: !0 })
      );
    };
  }
  render() {
    return o`
      <button aria-label="menu" @click=${this.toggle}>
        <se-icon plain .icon=${"mdi:menu"} fallback="☰" .size=${24}></se-icon>
      </button>
    `;
  }
};
rt.styles = _`
    button {
      background: none;
      border: none;
      color: var(--primary-text-color);
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      display: flex;
      flex: 0 0 auto;
    }

    button:hover {
      background: var(--secondary-background-color, #f1f1f1);
    }
  `;
rt = Ei([
  y("se-menu-button")
], rt);
var Ai = Object.defineProperty, Oi = Object.getOwnPropertyDescriptor, gt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Oi(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ai(t, i, r), r;
};
const Ii = 300;
let je = class extends g {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.keepInView = (e) => {
      const t = e.target;
      t?.scrollIntoView && window.setTimeout(() => {
        t.scrollIntoView({ block: "center", behavior: "smooth" });
      }, Ii);
    }, this.close = () => {
      this.open = !1, this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: !0, composed: !0 }));
    }, this.handleKeydown = (e) => {
      this.open && e.key === "Escape" && this.close();
    }, this.handleScrimClick = () => {
      this.close();
    };
  }
  render() {
    return o`
      <div class="scrim" @click=${this.handleScrimClick}>
        <div class="surface" role="dialog" aria-modal="true" @click=${this.stop}>
          <header>
            <h2>${this.heading}</h2>
            <button class="close" @click=${this.close} aria-label="Fermer">×</button>
          </header>
          <div class="content"><slot></slot></div>
          <slot name="banner"></slot>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
      </div>
    `;
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("keydown", this.handleKeydown), this.addEventListener("focusin", this.keepInView);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", this.handleKeydown), this.removeEventListener("focusin", this.keepInView);
  }
  stop(e) {
    e.stopPropagation();
  }
};
je.styles = _`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    /*
     * Swallows the gesture as well as the light.
     *
     * touch-action: none because overscroll-behavior only holds where there is
     * something to scroll: on a dialog shorter than the screen a flick went
     * straight through to the page behind, which on a modal means moving
     * something you cannot see. The content opts back in below.
     */
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      touch-action: none;
    }

    .surface {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      width: 100%;
      /*
       * A flex item will not shrink below its content on its own, so a single
       * stubborn field inside could widen the dialog past the screen. The
       * dialog is the one that decides: the content fits in it, not the other
       * way round.
       */
      min-width: 0;
      /*
       * dvh, not vh: a keyboard shrinks the visible viewport but not vh, so the
       * dialog stayed its full height and the field being typed into sat under
       * the keyboard. dvh follows what is actually on screen.
       */
      max-height: 92dvh;
      display: flex;
      flex-direction: column;
      border-radius: 16px 16px 0 0;
    }

    header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      flex: 1;
    }

    .close {
      background: none;
      border: none;
      color: var(--secondary-text-color);
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 50%;
    }

    /*
     * Scrolls on its own, and keeps it to itself.
     *
     * overscroll-behavior stops a flick that reaches the end of the dialog from
     * carrying on into the page behind it — which, on a modal, means scrolling
     * something you cannot even see.
     */
    .content {
      padding: 16px;
      overflow-y: auto;
      overscroll-behavior: contain;
      /* The one place a finger may still scroll, and only up and down. */
      touch-action: pan-y;
      flex: 1;
    }

    /*
     * Sits with the buttons, outside the scrolling content: something said
     * about what a button is about to do has to be on screen next to it. Said
     * up in the content, a long dialog would scroll it out of sight, and
     * whoever saw nothing happen would press again — which is the very thing
     * the message is there to prevent.
     *
     * No wrapper: an empty slot renders nothing, so nothing is spaced away.
     */
    ::slotted([slot="banner"]) {
      display: block;
      margin: 12px 16px 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    @media (min-width: 600px) {
      .scrim {
        align-items: center;
      }

      .surface {
        max-width: 520px;
        border-radius: 16px;
      }
    }
  `;
gt([
  l({ type: String })
], je.prototype, "heading", 2);
gt([
  l({ type: Boolean, reflect: !0 })
], je.prototype, "open", 2);
je = gt([
  y("se-dialog")
], je);
var Di = Object.defineProperty, Ti = Object.getOwnPropertyDescriptor, re = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ti(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Di(t, i, r), r;
};
let K = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.type = "text", this.placeholder = "", this.required = !1, this.disabled = !1, this.decimal = !1;
  }
  render() {
    return o`
      ${this.label ? o`<label>${this.label}${this.required ? " *" : ""}</label>` : d}
      <div class="wrapper">
        <input
          .type=${this.type}
          .value=${this.value}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          inputmode=${this.decimal ? "decimal" : d}
          @input=${this.handleInput}
        />
        ${this.suffix ? o`<span class="suffix">${this.suffix}</span>` : d}
        <!-- For a suffix that does something, where a word would sit. -->
        <slot name="suffix"></slot>
      </div>
      ${this.helper ? o`<div class="helper">${this.helper}</div>` : d}
    `;
  }
  handleInput(e) {
    const t = e.target.value;
    this.value = t, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
K.styles = _`
    :host {
      display: block;
    }

    label {
      display: block;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }

    .wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--input-fill-color, var(--secondary-background-color, #f1f1f1));
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      padding: 0 12px;
      transition: border-color 0.15s ease;
    }

    .wrapper:focus-within {
      border-color: var(--primary-color, #03a9f4);
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: none;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      padding: 10px 0;
    }

    .suffix {
      color: var(--secondary-text-color);
      font-size: 14px;
      white-space: nowrap;
    }

    .helper {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
  `;
re([
  l({ type: String })
], K.prototype, "label", 2);
re([
  l({ type: String })
], K.prototype, "value", 2);
re([
  l({ type: String })
], K.prototype, "type", 2);
re([
  l({ type: String })
], K.prototype, "placeholder", 2);
re([
  l({ type: String })
], K.prototype, "suffix", 2);
re([
  l({ type: String })
], K.prototype, "helper", 2);
re([
  l({ type: Boolean })
], K.prototype, "required", 2);
re([
  l({ type: Boolean })
], K.prototype, "disabled", 2);
re([
  l({ type: Boolean })
], K.prototype, "decimal", 2);
K = re([
  y("se-field")
], K);
var Mi = Object.defineProperty, ji = Object.getOwnPropertyDescriptor, Ee = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ji(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Mi(t, i, r), r;
};
let ue = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.options = [], this.disabled = !1;
  }
  render() {
    return o`
      ${this.label ? o`<label>${this.label}</label>` : d}
      <select .value=${this.value} ?disabled=${this.disabled} @change=${this.handleChange}>
        ${this.placeholder ? o`<option value="" ?selected=${!this.value}>${this.placeholder}</option>` : d}
        ${this.options.map(
      (e) => o`
            <option value=${e.value} ?selected=${e.value === this.value}>
              ${e.label}
            </option>
          `
    )}
      </select>
    `;
  }
  handleChange(e) {
    const t = e.target.value;
    this.value = t, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
ue.styles = _`
    :host {
      display: block;
    }

    label {
      display: block;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }

    select {
      width: 100%;
      background: var(--input-fill-color, var(--secondary-background-color, #f1f1f1));
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      padding: 10px 12px;
      outline: none;
    }

    select:focus {
      border-color: var(--primary-color, #03a9f4);
    }
  `;
Ee([
  l({ type: String })
], ue.prototype, "label", 2);
Ee([
  l({ type: String })
], ue.prototype, "value", 2);
Ee([
  l({ attribute: !1 })
], ue.prototype, "options", 2);
Ee([
  l({ type: String })
], ue.prototype, "placeholder", 2);
Ee([
  l({ type: Boolean })
], ue.prototype, "disabled", 2);
ue = Ee([
  y("se-select")
], ue);
const V = 1e6, Ri = V * 1e4, mt = [
  "AUD",
  "BGN",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RON",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "USD",
  "ZAR"
];
function Wt(e) {
  return Number.isInteger(e) && e > 0 && e <= Ri;
}
function Ui(e, t) {
  return !Number.isInteger(e) || e < 0 || !Wt(t) ? null : Math.floor((e * t + V / 2) / V);
}
function Ni(e) {
  const t = e.trim().replace(",", ".");
  if (!t)
    return null;
  const i = /^(\d*)(?:\.(\d*))?$/.exec(t);
  if (!i)
    return null;
  const [, s, r = ""] = i;
  if (!s && !r || r.length > 6)
    return null;
  const a = Number(s || "0") * V + Number(r.padEnd(6, "0") || "0");
  return Wt(a) ? a : null;
}
function At(e) {
  const t = Math.floor(e / V), i = e % V;
  return i === 0 ? String(t) : `${t}.${String(i).padStart(6, "0")}`.replace(/0+$/, "");
}
const Ke = {
  app_title: "Shared Expenses",
  groups: "Groups",
  no_groups: "No group yet. Create one to get started.",
  new_group: "New group",
  edit_group: "Edit group",
  all_groups: "All groups",
  more: "More",
  delete_group: "Delete this group",
  create_group: "Create group",
  group_name: "Group name",
  description: "Description",
  currency: "Currency",
  archived: "Archived",
  archive: "Archive",
  restore: "Restore",
  delete: "Delete",
  cancel: "Cancel",
  save: "Save",
  create: "Create",
  statistics: "Statistics",
  period_all: "All time",
  total_spent: "Total spent",
  your_share: "Your share",
  by_category: "By category",
  by_month: "By month",
  by_member: "By member",
  paid_total: "Paid",
  consumed: "Share",
  current_balance: "Current balance",
  must_receive: "is owed",
  must_pay: "owes",
  you_owe: "You owe",
  you_are_owed: "You are owed",
  owes_you: "owes you",
  you_are_settled: "You are settled up.",
  detailed_balances: "See detailed balances",
  no_activity: "Nothing has happened yet.",
  search: "Search an expense, a person…",
  no_match: "Nothing matches.",
  a_settlement: "Reimbursement",
  see_all: "See all",
  action_add_expense: "Add expense",
  fab_hint: "Add an expense — drag to reimburse instead",
  categories: "Categories",
  no_categories: "No category yet. A category carries a default split rule.",
  new_category: "New category",
  default_category: "Default category",
  default_category_hint: "A new expense opens on this one. One category per group.",
  default_category_tag: "Default",
  edit_category: "Edit category",
  category_name: "Name",
  color: "Colour",
  pick_color: "Change the colour",
  color_auto: "Automatic",
  color_auto_short: "AUTO",
  icon: "Icon",
  icon_hint: "Search by name or by what it looks like, for example cart.",
  icon_search: "Search an icon…",
  icon_list_failed: "The icon list could not be loaded. Type an mdi: name by hand.",
  default_split: "Default split",
  split_how: "How is it shared?",
  split_who_pays: "Who pays what",
  split_untouched_hint: "Type over a figure to pin it. The rest share what is left.",
  split_reset: "Reset",
  split_over_amount: "That comes to more than the expense.",
  split_default: "Default rule",
  split_default_example: "e.g. the category says 60 / 40, so this does too.",
  split_equal_example: "e.g. 90 between three: 30 each.",
  split_exact_example: "e.g. Michel 12, André 14, whoever paid takes the rest.",
  split_percent_example: "e.g. 60 / 40 — on 100 that is 60 and 40, on 30 it is 18 and 12.",
  split_partial_example: "e.g. 10 shared on an 85 shop: 5 each, and the other 75 for whoever paid.",
  split_custom_example: "e.g. 10 shared, then 8 for one and 4 for the other.",
  default_from_category: "Whatever the category says, or the group when it says nothing.",
  default_from_group: "Whatever the group says for expenses with no category.",
  split_equal: "Equal shares",
  split_exact: "Exact amounts",
  split_shared_lower: "shared",
  rule_from_group: "Default rule",
  no_category_rule: "Rule with no category",
  no_category_rule_hint: "Applies to an expense with no category, and to any category that has no rule of its own.",
  split_percent: "Percentages",
  split_percent_hint: "What share each one owes. Leave a field empty to take an equal cut of what is left.",
  split_percent_total: "Total",
  split_percent_over: "More than the whole expense.",
  split_partial: "Share part of it",
  split_custom: "Custom",
  split_custom_hint: "Everything the rules can do. Kept for the ones the three above cannot say.",
  split_shared_all: "The whole expense",
  split_shared_all_hint: "Leave empty to share all of it.",
  split_rest_between: "What is left goes to",
  split_rest_between_hint: "Tick who takes it. An amount is exact, an empty field an equal share. Nobody ticked: whoever paid takes it all.",
  split_equal_hint: "Shared equally between those ticked.",
  split_exact_hint: "What each one owes. Leave a field empty to take an equal cut of what is left.",
  split_shared_amount: "Amount to share",
  split_shared_between: "Shared between",
  split_rest_for: "The rest goes to",
  split_rest_payer: "Whoever paid",
  split_the_rest_short: "the rest",
  rule_invalid: "This rule cannot be resolved.",
  balance_settled: "Everything is settled.",
  to: "to",
  settle_up: "Settle up",
  expenses: "Expenses",
  no_expenses: "No expense yet.",
  new_expense: "New expense",
  edit_expense: "Edit expense",
  confirm_delete: "Confirm?",
  confirm_delete_expense: "Delete this expense? It cannot be brought back, and every share it carries goes with it.",
  confirm_delete_payment: "Delete this reimbursement? The debt it settled comes back.",
  expense_title: "Title",
  amount: "Amount",
  currency_label: "Currency",
  rate_heading: "Exchange rate",
  rate_label: "Rate",
  rate_of_day: "Rate of",
  rate_stale: "Not today's rate — this one is from",
  rate_manual: "Typed by hand",
  rate_unavailable: "The rate could not be fetched. Type one to carry on: it will be kept for next time.",
  rate_needed: "A rate is needed.",
  rate_retry: "Try again",
  converts_to: "comes to",
  invalid_exchange_rate: "This rate is not usable.",
  exchange_rate_unavailable: "No rate could be found for these currencies.",
  paid_by: "Paid by",
  date: "Date",
  category: "Category",
  no_category: "No category",
  split: "Split",
  edit_split: "Change",
  done: "Done",
  add_description: "Add a description",
  split_needs_amount: "Enter an amount to see the split.",
  description_placeholder: "Optional",
  split_total: "Split total",
  apply_rule: "Apply the rule of",
  group_rule: "the group",
  shares_mismatch: "The shares must add up to the amount.",
  participants: "Participants",
  members: "Members",
  member_name: "Name",
  remove_member: "Remove from group",
  restore_member: "Bring back",
  confirm_remove: "Confirm?",
  add: "Add",
  close: "Close",
  ha_accounts: "Home Assistant accounts",
  ha_accounts_hint: "Ticked accounts take part in this group and can open it.",
  no_ha_accounts: "No account found.",
  group_owner: "Owner",
  owner_locked: "The group owner cannot leave it. Archive the group instead.",
  cannot_remove_owner: "The group owner cannot leave it. Archive the group instead.",
  archived_hint: "This group is archived: nothing new can be added to it.",
  guests: "Without an account",
  guests_hint: "They carry expenses but never log in.",
  no_account: "No account",
  role_owner: "Owner",
  role_admin: "Admin",
  role_member: "Member",
  new_payment: "Record a reimbursement / debt",
  new_debt: "Write down a debt",
  kind_label: "What is this?",
  kind_reimbursement: "Reimbursement",
  kind_debt: "Debt",
  debt_who_owes: "Who owes",
  debt_to_whom: "Owes to",
  a_debt: "Debt",
  edit_debt: "Edit debt",
  confirm_delete_debt: "Delete this debt? It stops being owed.",
  edit_payment: "Edit reimbursement",
  from_member: "From",
  to_member: "To",
  history: "History",
  group_history: "Group history",
  no_history: "Nothing recorded yet.",
  history_created: "added",
  history_updated: "changed",
  history_deleted: "deleted",
  the_expense: "the expense",
  the_payment: "the reimbursement",
  someone: "Someone",
  loading: "Loading…",
  error_generic: "Something went wrong.",
  group_not_found: "This group no longer exists.",
  group_archived: "This group is archived.",
  member_not_found: "This member no longer exists.",
  member_already_in_group: "This member is already in the group.",
  category_not_found: "This category no longer exists.",
  expense_not_found: "This expense no longer exists.",
  invalid_expense: "This expense is invalid.",
  invalid_expense_shares: "The shares do not add up to the amount.",
  invalid_split_rule: "This split rule is invalid.",
  payment_not_found: "This reimbursement no longer exists.",
  invalid_payment: "This reimbursement is invalid.",
  not_loaded: "The integration is not loaded.",
  unknown_error: "Something went wrong."
}, qi = {
  app_title: "Dépenses partagées",
  groups: "Groupes",
  no_groups: "Aucun groupe pour l'instant. Créez-en un pour commencer.",
  new_group: "Nouveau groupe",
  edit_group: "Modifier le groupe",
  all_groups: "Tous les groupes",
  more: "Plus",
  delete_group: "Supprimer ce groupe",
  create_group: "Créer le groupe",
  group_name: "Nom du groupe",
  description: "Description",
  currency: "Devise",
  archived: "Archivé",
  archive: "Archiver",
  restore: "Restaurer",
  delete: "Supprimer",
  cancel: "Annuler",
  save: "Enregistrer",
  create: "Créer",
  statistics: "Statistiques",
  period_all: "Tout",
  total_spent: "Total dépensé",
  your_share: "Ta part",
  by_category: "Par catégorie",
  by_month: "Par mois",
  by_member: "Par personne",
  paid_total: "Payé",
  consumed: "Part",
  current_balance: "Solde actuel",
  must_receive: "doit recevoir",
  must_pay: "doit payer",
  you_owe: "Tu dois",
  you_are_owed: "On te doit",
  owes_you: "te doit",
  you_are_settled: "Tu es à jour.",
  detailed_balances: "Voir les soldes détaillés",
  no_activity: "Rien ne s'est encore passé.",
  search: "Chercher une dépense, une personne…",
  no_match: "Aucun résultat.",
  a_settlement: "Remboursement",
  see_all: "Voir tout",
  action_add_expense: "Ajouter dépense",
  fab_hint: "Ajouter une dépense — glisser pour rembourser",
  categories: "Catégories",
  no_categories: "Aucune catégorie. Une catégorie porte une règle de répartition par défaut.",
  new_category: "Nouvelle catégorie",
  default_category: "Catégorie par défaut",
  default_category_hint: "Une nouvelle dépense s'ouvrira sur celle-ci. Une seule par groupe.",
  default_category_tag: "Par défaut",
  edit_category: "Modifier la catégorie",
  category_name: "Nom",
  color: "Couleur",
  pick_color: "Changer la couleur",
  color_auto: "Automatique",
  color_auto_short: "AUTO",
  icon: "Icône",
  icon_hint: "Cherchez par nom ou par ce que ça représente, par exemple cart.",
  icon_search: "Rechercher une icône…",
  icon_list_failed: "La liste d'icônes n'a pas pu être chargée. Saisissez un nom mdi: à la main.",
  default_split: "Répartition par défaut",
  split_how: "Comment partager ?",
  split_who_pays: "Qui paie quoi",
  split_untouched_hint: "Tapez un montant pour le fixer. Le reste se partage.",
  split_reset: "Réinitialiser",
  split_over_amount: "Cela dépasse le montant de la dépense.",
  split_default: "Règle par défaut",
  split_default_example: "ex. la catégorie dit 60 / 40, donc celle-ci aussi.",
  split_equal_example: "ex. 90 € à trois : 30 € chacun.",
  split_exact_example: "ex. Michel 12 €, André 14 €, le reste pour qui a payé.",
  split_percent_example: "ex. 60 / 40 — sur 100 € c'est 60 et 40, sur 30 € c'est 18 et 12.",
  split_partial_example: "ex. 10 € partagés sur 85 € de courses : 5 € chacun, et les 75 € restants pour qui a payé.",
  split_custom_example: "ex. 10 € partagés, puis 8 € pour l'un et 4 € pour l'autre.",
  default_from_category: "Ce que dit la catégorie, ou le groupe si elle ne dit rien.",
  default_from_group: "Ce que dit le groupe pour les dépenses sans catégorie.",
  split_equal: "Parts égales",
  split_exact: "Montants exacts",
  split_shared_lower: "partagés",
  rule_from_group: "Règle par défaut",
  no_category_rule: "Règle sans catégorie",
  no_category_rule_hint: "S'applique à une dépense sans catégorie, et à toute catégorie qui n'a pas sa propre règle.",
  split_percent: "Pourcentages",
  split_percent_hint: "La part que chacun doit. Laisser vide pour prendre une part égale de ce qui reste.",
  split_percent_total: "Total",
  split_percent_over: "Plus que la dépense entière.",
  split_partial: "Partager une partie",
  split_custom: "Personnalisé",
  split_custom_hint: "Tout ce que les règles savent faire. Gardé pour les cas que les trois ci-dessus ne disent pas.",
  split_shared_all: "Toute la dépense",
  split_shared_all_hint: "Laisser vide pour tout partager.",
  split_rest_between: "Ce qui reste est pour",
  split_rest_between_hint: "Cochez qui le prend. Un montant est exact, un champ vide une part égale. Personne coché : celui qui a payé prend tout.",
  split_equal_hint: "Partagé à parts égales entre les personnes cochées.",
  split_exact_hint: "Ce que chacun doit. Laisser vide pour prendre une part égale de ce qui reste.",
  split_shared_amount: "Montant à partager",
  split_shared_between: "Partagé entre",
  split_rest_for: "Le reste est pour",
  split_rest_payer: "Celui qui a payé",
  split_the_rest_short: "le reste",
  rule_invalid: "Cette règle ne peut pas être résolue.",
  balance_settled: "Tout est réglé.",
  to: "à",
  settle_up: "Rembourser",
  expenses: "Dépenses",
  no_expenses: "Aucune dépense pour l'instant.",
  new_expense: "Nouvelle dépense",
  edit_expense: "Modifier la dépense",
  confirm_delete: "Confirmer ?",
  confirm_delete_expense: "Supprimer cette dépense ? Elle ne pourra pas être récupérée, et les parts qu'elle porte disparaissent avec elle.",
  confirm_delete_payment: "Supprimer ce remboursement ? La dette qu'il a soldée réapparaît.",
  expense_title: "Intitulé",
  amount: "Montant",
  currency_label: "Devise",
  rate_heading: "Taux de change",
  rate_label: "Taux",
  rate_of_day: "Taux du",
  rate_stale: "Pas le taux du jour — celui-ci date du",
  rate_manual: "Saisi à la main",
  rate_unavailable: "Le taux n'a pas pu être récupéré. Saisissez-en un pour continuer : il servira de référence.",
  rate_needed: "Un taux est nécessaire.",
  rate_retry: "Réessayer",
  converts_to: "soit",
  invalid_exchange_rate: "Ce taux est inutilisable.",
  exchange_rate_unavailable: "Aucun taux trouvé pour ces devises.",
  paid_by: "Payé par",
  date: "Date",
  category: "Catégorie",
  no_category: "Sans catégorie",
  split: "Répartition",
  edit_split: "Modifier",
  done: "Terminé",
  add_description: "Ajouter une description",
  split_needs_amount: "Saisissez un montant pour voir la répartition.",
  description_placeholder: "Facultatif",
  split_total: "Total réparti",
  apply_rule: "Appliquer la règle de",
  group_rule: "du groupe",
  shares_mismatch: "Le total des parts doit égaler le montant.",
  participants: "Participants",
  members: "Membres",
  member_name: "Nom",
  remove_member: "Retirer du groupe",
  restore_member: "Réactiver",
  confirm_remove: "Confirmer ?",
  add: "Ajouter",
  close: "Fermer",
  ha_accounts: "Comptes Home Assistant",
  ha_accounts_hint: "Les comptes cochés participent au groupe et peuvent l'ouvrir.",
  no_ha_accounts: "Aucun compte trouvé.",
  group_owner: "Propriétaire",
  owner_locked: "Le propriétaire ne peut pas quitter son groupe. Archivez-le plutôt.",
  cannot_remove_owner: "Le propriétaire ne peut pas quitter son groupe. Archivez-le plutôt.",
  archived_hint: "Ce groupe est archivé : plus rien ne peut y être ajouté.",
  guests: "Sans compte",
  guests_hint: "Ils portent des dépenses mais ne se connectent jamais.",
  no_account: "Sans compte",
  role_owner: "Propriétaire",
  role_admin: "Administrateur",
  role_member: "Membre",
  new_payment: "Enregistrer un remboursement / dette",
  new_debt: "Inscrire une dette",
  kind_label: "De quoi s'agit-il ?",
  kind_reimbursement: "Remboursement",
  kind_debt: "Dette",
  debt_who_owes: "Qui doit",
  debt_to_whom: "À qui",
  a_debt: "Dette",
  edit_debt: "Modifier la dette",
  confirm_delete_debt: "Supprimer cette dette ? Elle cesse d'être due.",
  edit_payment: "Modifier le remboursement",
  from_member: "De",
  to_member: "Vers",
  history: "Historique",
  group_history: "Historique du groupe",
  no_history: "Rien d'enregistré pour l'instant.",
  history_created: "a ajouté",
  history_updated: "a modifié",
  history_deleted: "a supprimé",
  the_expense: "la dépense",
  the_payment: "le remboursement",
  someone: "Quelqu'un",
  loading: "Chargement…",
  error_generic: "Une erreur est survenue.",
  group_not_found: "Ce groupe n'existe plus.",
  group_archived: "Ce groupe est archivé.",
  member_not_found: "Ce membre n'existe plus.",
  member_already_in_group: "Ce membre fait déjà partie du groupe.",
  category_not_found: "Cette catégorie n'existe plus.",
  expense_not_found: "Cette dépense n'existe plus.",
  invalid_expense: "Cette dépense est invalide.",
  invalid_expense_shares: "Le total des parts ne correspond pas au montant.",
  invalid_split_rule: "Cette règle de répartition est invalide.",
  payment_not_found: "Ce remboursement n'existe plus.",
  invalid_payment: "Ce remboursement est invalide.",
  not_loaded: "L'intégration n'est pas chargée.",
  unknown_error: "Une erreur est survenue."
}, Bi = { en: Ke, fr: qi };
function Gi(e) {
  const t = Bi[e.split("-")[0]] ?? Ke;
  return (i) => t[i] ?? Ke[i] ?? i;
}
function S(e, t) {
  const i = e?.code;
  return i && i in Ke ? t(i) : e?.message || t("error_generic");
}
const z = _`
  :host {
    --se-gap: 16px;
    --se-radius: 12px;
    --se-positive: var(--success-color, #0f9d58);
    --se-negative: var(--error-color, #db4437);
  }

  * {
    box-sizing: border-box;
  }

  .card {
    background: var(--card-background-color, #fff);
    border-radius: var(--se-radius);
    box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.08));
    overflow: hidden;
  }

  /*
   * A currency picker slotted into an amount field, where the code used to be
   * merely written. It has to pass for part of that field rather than a control
   * parked alongside: no frame, no fill, and the muted colour a written suffix
   * had. A number and its unit are one thing.
   */
  .currency {
    background: none;
    border: none;
    outline: none;
    color: var(--secondary-text-color);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    padding: 0;
  }

  .currency:focus-visible {
    color: var(--primary-color, #03a9f4);
  }

  /*
   * A button that asks to be read as a link: "+ add a description", "see all",
   * "try again". Always a button, never an anchor — it goes nowhere.
   */
  .link {
    background: none;
    border: none;
    color: var(--primary-color, #03a9f4);
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
  }

  /*
   * Two fields per row where they fit; one per row when the screen is narrow.
   *
   * minmax(0, …) rather than 1fr: a bare 1fr keeps an automatic minimum of the
   * content's own width, and a date input asks for more than half a phone. The
   * column would grow to grant it and take the dialog with it.
   */
  .pair {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px;
  }

  @media (max-width: 380px) {
    .pair {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--se-gap);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .spacer {
    flex: 1;
  }

  h1,
  h2,
  h3 {
    margin: 0;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  h1 {
    font-size: 22px;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 15px;
  }

  .muted {
    color: var(--secondary-text-color);
    font-size: 14px;
  }

  .positive {
    color: var(--se-positive);
  }

  .negative {
    color: var(--se-negative);
  }

  .amount {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    flex: 0 0 auto;
  }

  .empty {
    padding: 40px 24px;
    text-align: center;
    color: var(--secondary-text-color);
  }

  .error {
    background: var(--error-color, #db4437);
    color: #fff;
    padding: 12px 16px;
    border-radius: var(--se-radius);
    font-size: 14px;
  }

  /*
   * What is about to happen, spelled out before it does. Outlined rather than
   * filled like .error: nothing has gone wrong yet, and it must not be mistaken
   * for something that has.
   */
  .warning {
    border: 1px solid var(--error-color, #db4437);
    color: var(--error-color, #db4437);
    padding: 12px 16px;
    border-radius: var(--se-radius);
    font-size: 14px;
  }

  button {
    font-family: inherit;
  }
`;
var Li = Object.defineProperty, Hi = Object.getOwnPropertyDescriptor, le = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Hi(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Li(t, i, r), r;
};
let Q = class extends g {
  constructor() {
    super(...arguments), this.name = "", this.description = "", this.currency = "EUR", this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      const e = {
        name: this.name.trim(),
        description: this.description.trim() || null
      };
      try {
        const t = this.group ? await this.api.updateGroup(this.group.id, e) : await this.api.createGroup({ ...e, currency: this.currency });
        this.dispatchEvent(
          new CustomEvent(this.group ? "group-saved" : "group-created", {
            detail: { group: t },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (t) {
        this.error = S(t, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.group && (this.name = this.group.name, this.description = this.group.description ?? "", this.currency = this.group.currency);
  }
  render() {
    const e = this.localize, t = this.group ? e("edit_group") : e("new_group");
    return o`
      <se-dialog open heading=${t} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : d}
          <se-field
            .label=${e("group_name")}
            .value=${this.name}
            required
            placeholder="Appartement"
            @value-changed=${(i) => this.name = i.detail.value}
          ></se-field>
          <se-field
            .label=${e("description")}
            .value=${this.description}
            @value-changed=${(i) => this.description = i.detail.value}
          ></se-field>

          <!--
            Picked, never typed: a rate can only be had for a currency the rate
            service knows, and "EURO" went in happily and left every foreign
            expense unsaveable.

            Offered on a creation only, and shown as a plain fact afterwards.
            What a group counts in is the unit its whole history is written in
            — every share, every balance, every converted amount. Changing it
            later converts nothing, so the same figures would simply be read in
            another currency, silently.
          -->
          ${this.group ? o`<div>
                <label class="muted">${e("currency")}</label>
                <div>${this.currency}</div>
              </div>` : o`<se-select
                .label=${e("currency")}
                .value=${this.currency}
                .options=${mt.map((i) => ({ value: i, label: i }))}
                @value-changed=${(i) => this.currency = i.detail.value}
              ></se-select>`}
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${e("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || this.name.trim() === ""}
          @click=${this.submit}
        >
          ${this.group ? e("save") : e("create")}
        </se-button>
      </se-dialog>
    `;
  }
};
Q.styles = z;
le([
  l({ attribute: !1 })
], Q.prototype, "api", 2);
le([
  l({ attribute: !1 })
], Q.prototype, "localize", 2);
le([
  l({ attribute: !1 })
], Q.prototype, "group", 2);
le([
  c()
], Q.prototype, "name", 2);
le([
  c()
], Q.prototype, "description", 2);
le([
  c()
], Q.prototype, "currency", 2);
le([
  c()
], Q.prototype, "busy", 2);
le([
  c()
], Q.prototype, "error", 2);
Q = le([
  y("se-group-dialog")
], Q);
var Fi = Object.defineProperty, Wi = Object.getOwnPropertyDescriptor, xe = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Wi(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Fi(t, i, r), r;
};
let ne = class extends g {
  constructor() {
    super(...arguments), this.groups = [], this.loading = !0, this.dialogOpen = !1, this.handleCreated = (e) => {
      this.dialogOpen = !1, this.select(e.detail.group);
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const e = this.localize;
    return this.loading ? o`<div class="empty">${e("loading")}</div>` : o`
      <div class="toolbar">
        <div class="header">
          <se-menu-button></se-menu-button>
          <h1>${e("groups")}</h1>
        </div>
      </div>

      <div class="page">
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : d}

          ${this.groups.length === 0 ? o`<div class="card">
                <div class="empty">${e("no_groups")}</div>
              </div>` : o`<div class="card">
                ${this.groups.map((t) => this.renderGroup(t))}
              </div>`}

          <div class="fab">
            <se-button @click=${() => this.dialogOpen = !0}>
              ${e("new_group")}
            </se-button>
          </div>
        </div>
      </div>

      ${this.dialogOpen ? o`
            <se-group-dialog
              .api=${this.api}
              .localize=${this.localize}
              @dialog-cancelled=${() => this.dialogOpen = !1}
              @group-created=${this.handleCreated}
            ></se-group-dialog>
          ` : d}
    `;
  }
  renderGroup(e) {
    return o`
      <button class="group" @click=${() => this.select(e)}>
        <div class="badge" style=${e.color ? `background:${e.color}` : ""}>
          ${e.name.charAt(0).toUpperCase()}
        </div>
        <div class="info">
          <div class="name">${e.name}</div>
          ${e.description ? o`<div class="muted">${e.description}</div>` : d}
        </div>
        ${e.archived ? o`<span class="archived-tag">${this.localize("archived")}</span>` : d}
        <span class="chevron">›</span>
      </button>
    `;
  }
  async load() {
    this.loading = !0, this.error = void 0;
    try {
      this.groups = await this.api.listGroups();
    } catch (e) {
      this.error = S(e, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  select(e) {
    this.dispatchEvent(
      new CustomEvent("group-selected", {
        detail: { groupId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
ne.styles = [
  z,
  _`
      :host {
        display: block;
      }

      /* The same banner the group page wears, from the same theme variables. */
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 3;
      }

      .page {
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
      }

      .group {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        color: inherit;
      }

      .group + .group {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .group:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .badge {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex: 0 0 auto;
      }

      .info {
        flex: 1;
        min-width: 0;
      }

      .name {
        font-size: 16px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chevron {
        color: var(--secondary-text-color);
      }

      .archived-tag {
        font-size: 11px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
        padding: 1px 5px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 720px;
        margin: 0 auto;
        padding: 8px 16px;
        min-height: 64px;
        box-sizing: border-box;
      }

      .header h1 {
        font-size: 18px;
        color: inherit;
      }

      .fab {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    `
];
xe([
  l({ attribute: !1 })
], ne.prototype, "api", 2);
xe([
  l({ attribute: !1 })
], ne.prototype, "localize", 2);
xe([
  c()
], ne.prototype, "groups", 2);
xe([
  c()
], ne.prototype, "loading", 2);
xe([
  c()
], ne.prototype, "error", 2);
xe([
  c()
], ne.prototype, "dialogOpen", 2);
ne = xe([
  y("se-dashboard-page")
], ne);
function j(e, t, i) {
  return new Intl.NumberFormat(i, {
    style: "currency",
    currency: t
  }).format(e / 100);
}
function ve(e) {
  const t = e.trim().replace(",", ".").replace(/\s/g, "");
  if (t === "" || !/^-?\d*\.?\d*$/.test(t))
    return null;
  const i = Number(t);
  return Number.isNaN(i) ? null : Math.round(i * 100);
}
function Re(e, t) {
  const i = new Intl.DateTimeFormat(t, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(e));
  return i.charAt(0).toUpperCase() + i.slice(1);
}
function Vi(e, t) {
  const [i, s] = e.split("-").map(Number), r = new Intl.DateTimeFormat(t, {
    month: "short",
    year: "numeric"
  }).format(new Date(i, s - 1, 1));
  return r.charAt(0).toUpperCase() + r.slice(1);
}
function Vt() {
  const e = /* @__PURE__ */ new Date(), t = `${e.getMonth() + 1}`.padStart(2, "0"), i = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${t}-${i}`;
}
function Kt(e) {
  return (/* @__PURE__ */ new Date(`${e}T12:00:00`)).toISOString();
}
function Yt(e) {
  const t = new Date(e), i = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${i}-${s}`;
}
function at(e) {
  return (e / 100).toFixed(2);
}
function W(e) {
  const t = e.trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
const ot = [
  "#3f7cac",
  "#c05746",
  "#4a7c59",
  "#8b5fbf",
  "#c98b3e",
  "#3d7e7e",
  "#b0567a",
  "#5c6b8a",
  "#7a5c3d",
  "#4a5f8a",
  "#8a4a6b",
  "#5f7a3d"
];
function A(e) {
  let t = 0;
  for (let i = 0; i < e.length; i += 1)
    t = t * 31 + e.charCodeAt(i) >>> 0;
  return ot[t % ot.length];
}
var Ki = Object.defineProperty, Yi = Object.getOwnPropertyDescriptor, ge = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Yi(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ki(t, i, r), r;
};
let ie = class extends g {
  constructor() {
    super(...arguments), this.balances = [], this.settlements = [], this.members = [], this.meId = null, this.currency = "EUR", this.language = "en";
  }
  render() {
    const e = this.localize;
    return o`
      <div class="card">
        <div class="head">
          <h3>${e("current_balance")}</h3>
        </div>
        ${this.renderBody()}
      </div>
    `;
  }
  renderBody() {
    const e = this.balances.filter((s) => s.amount !== 0);
    if (e.length === 0)
      return o`<div class="settled muted">${this.localize("balance_settled")}</div>`;
    if (this.settlements.length === 0)
      return o`<div>${e.map((s) => this.renderRow(s))}</div>`;
    if (e.length === 2)
      return this.renderDuel(e);
    if (this.meId === null)
      return this.renderGroupView();
    const t = this.settlements.filter(
      (s) => s.from_member_id === this.meId || s.to_member_id === this.meId
    ), i = this.settlements.filter((s) => !t.includes(s));
    return o`
      ${t.length === 0 ? o`<div class="settled muted">${this.localize("you_are_settled")}</div>` : t.map((s) => this.renderMine(s))}
      ${i.length === 0 ? d : o`
            <div class="others">
              ${i.map((s) => this.renderTransfer(s))}
            </div>
          `}
    `;
  }
  /** No "you" to speak from: show the transfers as the group's own business. */
  renderGroupView() {
    return o`
      <div>${this.settlements.map((e) => this.renderTransfer(e))}</div>
    `;
  }
  /**
   * Ask to record the reimbursement a line stands for.
   *
   * The dialog opens filled in with it, which is the whole trick: the figure
   * you are looking at is the one you are about to pay, so nothing needs
   * retyping — and nothing can be mistyped either.
   */
  settle(e) {
    this.dispatchEvent(
      new CustomEvent("settle-up", {
        detail: { settlement: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /** Your own line, as a sentence: the one thing you came to find out. */
  renderMine(e) {
    const t = this.localize, i = e.from_member_id === this.meId, s = i ? e.to_member_id : e.from_member_id, r = this.memberById(s), a = r?.name ?? "?", n = o`
      <strong class=${`figure ${i ? "negative" : "positive"}`}>
        ${j(e.amount, this.currency, this.language)}
      </strong>
    `;
    return o`
      <button
        class="mine line-button"
        title=${t("settle_up")}
        @click=${() => this.settle(e)}
      >
        <div class="avatar" style=${`background:${r?.color ?? A(s)}`}>
          ${W(a)}
        </div>
        <div class="sentence">
          ${i ? o`${t("you_owe")} ${n} ${t("to")} ${a}` : o`${a} ${t("owes_you")} ${n}`}
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }
  /** One transfer, as a gesture to make: who pays, to whom, how much. */
  renderTransfer(e) {
    return o`
      <button
        class="transfer line-button"
        title=${this.localize("settle_up")}
        @click=${() => this.settle(e)}
      >
        ${this.renderParty(e.from_member_id)}
        <span class="arrow">→</span>
        ${this.renderParty(e.to_member_id)}
        <span class="amount">
          ${j(e.amount, this.currency, this.language)}
        </span>
      </button>
    `;
  }
  renderParty(e) {
    const t = this.memberById(e), i = t?.name ?? "?";
    return o`
      <span class="party" title=${i}>
        <span
          class="avatar"
          style=${`background:${t?.color ?? A(e)}`}
          >${W(i)}</span
        >
        <span class="name">${i}</span>
      </span>
    `;
  }
  /**
   * The two of you, facing each other.
   *
   * You go on the left, where reading starts, so the side you look at first is
   * yours whichever way the money goes. Without a "you" — a tablet in the
   * kitchen — whoever is owed leads, as the group's own way of putting it.
   */
  renderDuel(e) {
    const t = e.find((a) => a.member_id === this.meId), [i, s] = t ? [t, e.find((a) => a !== t)] : [...e].sort((a, n) => n.amount - a.amount), r = this.settlements[0];
    return o`
      <button
        class="duel line-button"
        title=${this.localize("settle_up")}
        ?disabled=${r === void 0}
        @click=${() => r && this.settle(r)}
      >
        ${this.renderSide(i, !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(s, !0)}
      </button>
    `;
  }
  renderSide(e, t) {
    const i = this.memberById(e.member_id), s = e.amount > 0, r = s ? "positive" : "negative", a = o`
      <div class="avatar" style=${`background:${i?.color ?? A(e.member_id)}`}>
        ${W(i?.name ?? "?")}
      </div>
    `, n = o`
      <div class="body">
        <div class="name">${i?.name ?? "?"}</div>
        <div class=${`verdict ${r}`}>${this.verdict(e, s)}</div>
        <div class=${`figure ${r}`}>
          ${j(Math.abs(e.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return o`
      <div class=${`side ${t ? "right" : ""}`}>
        ${t ? d : a}${n}${t ? a : d}
      </div>
    `;
  }
  /**
   * What a side of the duel is about, addressed to whoever is reading.
   *
   * Your own side speaks to you — "You owe" rather than "Antonin owes" about
   * yourself, which is how a balance sheet talks, not a person.
   */
  verdict(e, t) {
    const i = this.localize;
    return e.member_id === this.meId ? i(t ? "you_are_owed" : "you_owe") : i(t ? "must_receive" : "must_pay");
  }
  renderRow(e) {
    const t = this.memberById(e.member_id), i = e.amount > 0, s = i ? "positive" : "negative";
    return o`
      <div class="row">
        <div class="avatar" style=${`background:${t?.color ?? A(e.member_id)}`}>
          ${W(t?.name ?? "?")}
        </div>
        <span class="name">${t?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${s}`}>
            ${i ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${s}`}>
            ${j(Math.abs(e.amount), this.currency, this.language)}
          </div>
        </div>
      </div>
    `;
  }
  memberById(e) {
    return this.members.find((t) => t.id === e);
  }
};
ie.styles = [
  z,
  _`
      :host {
        display: block;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 16px 16px 8px;
      }

      .duel {
        display: flex;
        align-items: stretch;
        padding: 8px 12px 16px;
      }

      .side {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .side.right {
        justify-content: flex-end;
        text-align: right;
      }

      .side .body {
        min-width: 0;
      }

      .name {
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }

      .verdict {
        font-size: 13px;
      }

      .figure {
        font-size: 22px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
      }

      .swap {
        display: flex;
        align-items: center;
        padding: 0 12px;
        color: var(--secondary-text-color);
        font-size: 20px;
        border-left: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-right: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      /*
       * A line of the balance is also the way to clear it.
       *
       * Every one of them stands for a transfer someone has to make, so it
       * opens the reimbursement filled in with itself: the figure you are
       * looking at is the one you are about to pay.
       */
      .line-button {
        width: 100%;
        border: none;
        background: none;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        text-align: left;
        cursor: pointer;
      }

      .line-button:hover:not([disabled]) {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .line-button[disabled] {
        cursor: default;
      }

      .mine {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px 14px;
      }

      .mine .chevron {
        margin-left: auto;
        color: var(--secondary-text-color);
      }

      .sentence {
        font-size: 15px;
        line-height: 1.5;
      }

      .sentence .figure {
        font-size: 18px;
        margin: 0 2px;
      }

      /*
       * The rest of the group, set back from yours: still there to read, never
       * competing with the line you opened the card for.
       */
      .others {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        padding: 4px 0 4px;
        font-size: 13px;
      }

      .others .party .avatar {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      .others .transfer {
        padding: 8px 16px;
      }

      .others .transfer + .transfer {
        border-top: none;
      }

      .others .name,
      .others .amount {
        font-size: 13px;
      }

      .transfer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
      }

      .transfer + .transfer {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      /* Both names share what is left once the amount has its room. */
      .party {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .party .avatar {
        width: 28px;
        height: 28px;
        font-size: 11px;
      }

      .arrow {
        color: var(--secondary-text-color);
        flex: 0 0 auto;
      }

      .transfer .amount {
        font-size: 15px;
        font-weight: 600;
        white-space: nowrap;
        flex: 0 0 auto;
      }

      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
      }

      .row .name {
        flex: 1;
      }

      .row .verdict {
        text-align: right;
      }

      .settled {
        padding: 8px 16px 20px;
        text-align: center;
      }
    `
];
ge([
  l({ attribute: !1 })
], ie.prototype, "localize", 2);
ge([
  l({ attribute: !1 })
], ie.prototype, "balances", 2);
ge([
  l({ attribute: !1 })
], ie.prototype, "settlements", 2);
ge([
  l({ attribute: !1 })
], ie.prototype, "members", 2);
ge([
  l({ type: String })
], ie.prototype, "meId", 2);
ge([
  l({ type: String })
], ie.prototype, "currency", 2);
ge([
  l({ type: String })
], ie.prototype, "language", 2);
ie = ge([
  y("se-balance-card")
], ie);
var Zi = Object.defineProperty, Xi = Object.getOwnPropertyDescriptor, qe = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Xi(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Zi(t, i, r), r;
};
let $e = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = null, this.fallback = "#5c6b8a";
  }
  render() {
    const e = this.localize;
    return o`
      ${this.label ? o`<label>${this.label}</label>` : d}

      <div class="swatches">
        <button
          class="auto"
          title=${e("color_auto")}
          aria-pressed=${this.value === null}
          style=${`background:${this.fallback}`}
          @click=${() => this.pick(null)}
        >
          ${e("color_auto_short")}
        </button>

        ${ot.map(
      (t) => o`
            <button
              aria-pressed=${this.value === t}
              title=${t}
              style=${`background:${t}`}
              @click=${() => this.pick(t)}
            >
              ${this.value === t ? "✓" : ""}
            </button>
          `
    )}
      </div>
    `;
  }
  pick(e) {
    this.value = e, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
$e.styles = [
  z,
  _`
      :host {
        display: block;
      }

      label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }

      .swatches {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      button {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 15px;
        line-height: 1;
      }

      button[aria-pressed="true"] {
        border-color: var(--primary-text-color);
      }

      .auto {
        position: relative;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
    `
];
qe([
  l({ attribute: !1 })
], $e.prototype, "localize", 2);
qe([
  l({ type: String })
], $e.prototype, "label", 2);
qe([
  l({ type: String })
], $e.prototype, "value", 2);
qe([
  l({ type: String })
], $e.prototype, "fallback", 2);
$e = qe([
  y("se-color-picker")
], $e);
var Ji = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, ce = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Qi(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ji(t, i, r), r;
};
const Ot = "/static/mdi/iconList.json", it = 48;
let Le = null;
function es() {
  return Le === null && (Le = fetch(Ot).then((e) => {
    if (!e.ok)
      throw new Error(`${e.status} on ${Ot}`);
    return e.json();
  }).catch((e) => {
    throw Le = null, e;
  })), Le;
}
let ee = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.color = "#5c6b8a", this.icons = [], this.suggestions = [], this.open = !1, this.failed = !1, this.handleFocus = async () => {
      await this.ensureLoaded(), this.search(this.stripPrefix(this.value)), this.open = !0;
    }, this.handleInput = async (e) => {
      const t = e.target.value;
      this.emit(t), await this.ensureLoaded(), this.search(this.stripPrefix(t)), this.open = !0;
    }, this.handleBlur = () => {
      this.open = !1;
    }, this.clear = () => {
      this.emit(""), this.suggestions = [];
    };
  }
  render() {
    return o`
      ${this.label ? o`<label>${this.label}</label>` : d}

      <div class="field">
        <se-icon
          .icon=${this.value || null}
          .color=${this.color}
          .size=${32}
          fallback="?"
        ></se-icon>
        <input
          .value=${this.value}
          placeholder=${this.localize("icon_search")}
          @focus=${this.handleFocus}
          @input=${this.handleInput}
          @blur=${this.handleBlur}
        />
        ${this.value ? o`<button class="clear" @click=${this.clear} aria-label="×">×</button>` : d}
      </div>

      ${this.renderHint()} ${this.open ? this.renderGrid() : d}
    `;
  }
  renderHint() {
    return this.failed ? o`<div class="hint">${this.localize("icon_list_failed")}</div>` : o`<div class="hint">${this.localize("icon_hint")}</div>`;
  }
  renderGrid() {
    return this.suggestions.length === 0 ? d : o`
      <div class="grid">
        ${this.suggestions.map(
      (e) => o`
            <button
              class="choice"
              title=${e.name}
              @mousedown=${(t) => this.choose(t, e.name)}
            >
              <se-icon
                .icon=${`mdi:${e.name}`}
                .color=${this.color}
                .size=${34}
                fallback="•"
              ></se-icon>
              <span class="name">${e.name}</span>
            </button>
          `
    )}
      </div>
    `;
  }
  choose(e, t) {
    e.preventDefault(), this.emit(`mdi:${t}`), this.open = !1;
  }
  async ensureLoaded() {
    if (!(this.icons.length > 0 || this.failed))
      try {
        this.icons = await es();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(e) {
    const t = e.trim().toLowerCase();
    if (t === "") {
      this.suggestions = this.icons.slice(0, it);
      return;
    }
    const i = [], s = [], r = [];
    for (const a of this.icons)
      if (a.name.startsWith(t) ? i.push(a) : a.name.includes(t) ? s.push(a) : a.keywords?.some((n) => n.includes(t)) && r.push(a), i.length >= it)
        break;
    this.suggestions = [...i, ...s, ...r].slice(0, it);
  }
  stripPrefix(e) {
    return e.startsWith("mdi:") ? e.slice(4) : e;
  }
  emit(e) {
    this.value = e, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
ee.styles = [
  z,
  _`
      :host {
        display: block;
        position: relative;
      }

      label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }

      .field {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--input-fill-color, var(--secondary-background-color, #f1f1f1));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        padding: 6px 10px;
      }

      .field:focus-within {
        border-color: var(--primary-color, #03a9f4);
      }

      input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: none;
        color: var(--primary-text-color);
        font-size: 16px;
        font-family: inherit;
        padding: 6px 0;
      }

      .clear {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 18px;
        padding: 0 4px;
      }

      .grid {
        position: absolute;
        z-index: 5;
        left: 0;
        right: 0;
        max-height: 232px;
        overflow-y: auto;
        margin-top: 4px;
        padding: 8px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
        gap: 4px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      }

      .choice {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 2px;
        border: none;
        background: none;
        border-radius: 6px;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-family: inherit;
      }

      .choice:hover {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .choice .name {
        font-size: 9px;
        line-height: 1.1;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        white-space: nowrap;
      }

      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
    `
];
ce([
  l({ attribute: !1 })
], ee.prototype, "localize", 2);
ce([
  l({ type: String })
], ee.prototype, "label", 2);
ce([
  l({ type: String })
], ee.prototype, "value", 2);
ce([
  l({ type: String })
], ee.prototype, "color", 2);
ce([
  c()
], ee.prototype, "icons", 2);
ce([
  c()
], ee.prototype, "suggestions", 2);
ce([
  c()
], ee.prototype, "open", 2);
ce([
  c()
], ee.prototype, "failed", 2);
ee = ce([
  y("se-icon-picker")
], ee);
function Zt(e) {
  const { amount: t, payerId: i, memberIds: s } = e;
  if (!Number.isInteger(t) || t <= 0)
    return null;
  const r = [...new Set(s)];
  if (r.length === 0 || !r.includes(i))
    return null;
  const a = e.rule ?? {}, n = ts(a, t);
  if (n === null)
    return null;
  const h = a.participants == null ? r : [...new Set(a.participants)];
  if (h.some((P) => !r.includes(P)))
    return null;
  const p = h.length === 0 ? 0 : n, f = nt(p, h), k = t - p;
  if (k > 0) {
    const P = is(a.remainder, k, i, r);
    if (P === null)
      return null;
    for (const [E, Ge] of Object.entries(P))
      f[E] = (f[E] ?? 0) + Ge;
  }
  const u = {};
  for (const [P, E] of Object.entries(f))
    E !== 0 && (u[P] = E);
  return Object.values(u).reduce((P, E) => P + E, 0) === t ? u : null;
}
function ts(e, t) {
  return e.envelope == null ? t : e.envelope < 0 ? null : Math.min(e.envelope, t);
}
const st = 1e4;
function is(e, t, i, s) {
  const r = e ?? {}, a = r.fixed ?? {}, n = r.percent ?? {};
  for (const [m, M] of Object.entries(a))
    if (!s.includes(m) || M < 0)
      return null;
  for (const [m, M] of Object.entries(n))
    if (!s.includes(m) || M < 0)
      return null;
  const h = r.members == null ? [i] : [...new Set(r.members)];
  if (h.length === 0 || h.some((m) => !s.includes(m)))
    return null;
  const p = {}, f = {};
  for (const m of h)
    m in a && (p[m] = a[m]), m in n && (f[m] = n[m]);
  if (Object.keys(p).some((m) => m in f))
    return null;
  const k = Object.values(f).reduce((m, M) => m + M, 0);
  if (k > st)
    return null;
  const u = {};
  for (const [m, M] of Object.entries(f))
    u[m] = Math.floor(t * M / st);
  const P = Object.values(p).reduce((m, M) => m + M, 0) + Object.values(u).reduce((m, M) => m + M, 0);
  if (P > t)
    return null;
  const E = { ...p, ...u }, Ge = h.filter(
    (m) => !(m in p) && !(m in f)
  ), et = t - P;
  if (Ge.length > 0) {
    for (const [m, M] of Object.entries(nt(et, Ge)))
      E[m] = (E[m] ?? 0) + M;
    return E;
  }
  if (et === 0)
    return E;
  if (k === st && Object.keys(f).length > 0) {
    for (const [m, M] of Object.entries(
      nt(et, Object.keys(u))
    ))
      E[m] = (E[m] ?? 0) + M;
    return E;
  }
  return null;
}
function nt(e, t) {
  if (e <= 0 || t.length === 0)
    return {};
  const i = Math.floor(e / t.length), s = e % t.length, r = {};
  return t.forEach((a, n) => {
    r[a] = i + (n < s ? 1 : 0);
  }), r;
}
const It = 1e4;
function ft(e) {
  if (e === null)
    return "default";
  const t = Object.keys(e.remainder?.percent ?? {}), i = Object.keys(e.remainder?.fixed ?? {});
  if (t.length > 0 && i.length > 0)
    return "custom";
  if (e.envelope === 0)
    return "exact";
  if (t.length > 0)
    return "custom";
  const s = e.remainder?.members ?? [], r = Object.keys(e.remainder?.fixed ?? {});
  return e.envelope == null && s.length === 0 && r.length === 0 ? "equal" : s.length <= 1 && r.length === 0 ? "partial" : "custom";
}
function ss(e, t) {
  if (e === "default")
    return null;
  if (e === "equal")
    return {
      envelope: null,
      participants: t.participants.size === t.memberIds.length ? null : [...t.participants],
      remainder: {}
    };
  if (e === "exact")
    return {
      envelope: 0,
      remainder: t.unit === "percent" ? { members: [...t.participants], percent: Tt(t) } : { members: [...t.participants], fixed: Dt(t) }
    };
  const i = t.envelopeInput.trim() === "" ? null : ve(t.envelopeInput.trim()), s = t.participants.size === t.memberIds.length ? null : [...t.participants];
  return e === "custom" ? {
    envelope: i,
    participants: s,
    remainder: {
      // Nobody ticked: whoever paid takes it, which the model says with null.
      members: t.takers.size === 0 ? null : [...t.takers],
      fixed: Dt(t, t.takers),
      // Written back untouched. The panel offers no way to type a share here
      // — the `percent` mode is where that lives — but a rule that arrived
      // with some keeps them: dropping what an editor cannot show is how a
      // save quietly rewrites what people owe.
      percent: Tt(t, t.takers)
    }
  } : {
    envelope: i,
    participants: s,
    // Nobody named: whoever paid takes it, which the model says with null.
    remainder: { members: t.restTo ? [t.restTo] : null, fixed: {} }
  };
}
function rs(e, t, i) {
  const s = ft(e), r = e?.remainder?.members ?? (i ? [i] : []);
  return {
    participants: s === "exact" ? new Set(r) : new Set(e?.participants ?? t),
    takers: new Set(r),
    envelopeInput: e?.envelope != null ? Mt(e.envelope) : "",
    amounts: Object.fromEntries(
      Object.entries(e?.remainder?.fixed ?? {}).map(([n, h]) => [
        n,
        Mt(h)
      ])
    ),
    percents: Object.fromEntries(
      Object.entries(e?.remainder?.percent ?? {}).map(([n, h]) => [
        n,
        as(h)
      ])
    ),
    // One taker is a person to name. Several is a shape this editor has no room
    // for, so the rest falls back to whoever paid — as `partial` reads it.
    restTo: s === "partial" && e?.remainder?.members?.length === 1 ? e.remainder.members[0] : i ?? "",
    // Whichever the rule was written in. A rule with neither is an equal split
    // dressed as `exact`, and money is the one to offer first.
    unit: Object.keys(e?.remainder?.percent ?? {}).length > 0 ? "percent" : "money",
    memberIds: t
  };
}
function Dt(e, t = e.participants) {
  const i = {};
  for (const [s, r] of Object.entries(e.amounts)) {
    if (!t.has(s) || r.trim() === "")
      continue;
    const a = ve(r);
    a !== null && (i[s] = a);
  }
  return i;
}
function Tt(e, t = e.participants) {
  const i = {};
  for (const [s, r] of Object.entries(e.percents)) {
    if (!t.has(s) || r.trim() === "")
      continue;
    const a = Xt(r);
    a !== null && (i[s] = a);
  }
  return i;
}
function Xt(e) {
  const t = e.trim().replace(",", ".");
  if (t === "")
    return null;
  const i = Number(t);
  return Number.isFinite(i) ? Math.round(i * 100) : null;
}
function as(e) {
  return e % 100 === 0 ? String(e / 100) : (e / 100).toFixed(2);
}
function Mt(e) {
  return (e / 100).toFixed(2);
}
var os = Object.defineProperty, ns = Object.getOwnPropertyDescriptor, D = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ns(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && os(t, i, r), r;
};
const ls = 8542, jt = ["equal", "exact", "partial", "custom"];
let O = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.mode = "equal", this.participants = /* @__PURE__ */ new Set(), this.envelopeInput = "", this.amounts = {}, this.percents = {}, this.unit = "money", this.restTo = "", this.takers = /* @__PURE__ */ new Set();
  }
  connectedCallback() {
    super.connectedCallback(), this.mode = ft(this.rule);
    const e = rs(
      this.rule,
      this.members.map((t) => t.id),
      this.payerId
    );
    this.participants = e.participants, this.envelopeInput = e.envelopeInput, this.amounts = e.amounts, this.percents = e.percents, this.unit = e.unit, this.takers = e.takers, this.restTo = this.mode === "partial" ? e.restTo : "";
  }
  willUpdate(e) {
    if (!e.has("payerId"))
      return;
    const t = e.get("payerId");
    t != null && this.restTo === t && (this.restTo = this.payerId ?? "");
  }
  firstUpdated() {
    this.emit();
  }
  updated(e) {
    e.has("payerId") && this.emit();
  }
  render() {
    return this.renderPanel();
  }
  /** What the panel works on: the real expense, or a sample to stand for one. */
  get previewAmount() {
    return this.amount != null && this.amount > 0 ? this.amount : ls;
  }
  renderPanel() {
    const e = this.localize, t = this.shares();
    return o`
      <div class="panel">
        <se-select
          .label=${e("split_how")}
          .value=${this.mode}
          .options=${this.offered().map((i) => ({
      value: i,
      label: e(`split_${i}`)
    }))}
          @value-changed=${(i) => this.pick(i.detail.value)}
        ></se-select>

        ${this.mode === "default" ? this.renderDefault() : d}
        ${this.mode === "equal" ? this.renderEqual(t) : d}
        ${this.mode === "exact" ? this.renderExact(t) : d}
        ${this.mode === "partial" ? this.renderPartial(t) : d}
        ${this.mode === "custom" ? this.renderCustom(t) : d}
        ${t === null ? o`<div class="warn">${e("rule_invalid")}</div>` : d}
      </div>
    `;
  }
  /** What can be picked here, and what this rule already happens to be. */
  offered() {
    const e = this.inherits ? ["default", ...jt] : [...jt];
    return e.includes(this.mode) ? e : [...e, this.mode];
  }
  /** Nothing to fill in: the rule is somebody else's. */
  renderDefault() {
    return o`
      <div>
        <div class="muted">
          ${this.localize(
      this.inherits === "category" ? "default_from_category" : "default_from_group"
    )}
        </div>
        <div class="muted example">${this.localize("split_default_example")}</div>
      </div>
    `;
  }
  /** Tick who is in. What each pays shows next to them, live. */
  renderEqual(e) {
    return o`
      <div>
        <div class="muted">${this.localize("split_equal_hint")}</div>
        <div class="muted example">${this.localize("split_equal_example")}</div>
        ${this.members.map(
      (t) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(t.id)}
                @change=${() => this.toggleParticipant(t.id)}
              />
              ${this.renderAvatar(t)}
              <span class="name">${t.name}</span>
              <span class="share">${this.shareOf(e, t.id)}</span>
            </div>
          `
    )}
      </div>
    `;
  }
  /**
   * What each one owes, in money or as a share.
   *
   * One panel, one switch. "Antonin owes 5" and "Antonin owes 40%" are the same
   * sentence about the same person; only the unit differs, and that is a switch,
   * not a second thing to go and find in a list.
   *
   * They do behave apart — a share follows the amount, a figure does not — which
   * is why the rule keeps them apart. That is the rule's business, not yours.
   */
  renderExact(e) {
    const t = this.localize, i = this.unit === "percent", s = this.percentTotal();
    return o`
      <div>
        <div class="head">
          <div>
            <div class="muted">
              ${t(i ? "split_percent_hint" : "split_exact_hint")}
            </div>
            <div class="muted example">
              ${t(i ? "split_percent_example" : "split_exact_example")}
            </div>
          </div>
          <div class="units" role="group">
            <button
              aria-pressed=${!i}
              @click=${() => this.setUnit("money")}
            >
              ${this.currency}
            </button>
            <button
              aria-pressed=${i}
              @click=${() => this.setUnit("percent")}
            >
              %
            </button>
          </div>
        </div>

        ${this.members.map(
      (r) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(r.id)}
                @change=${() => this.toggleParticipant(r.id)}
              />
              ${this.renderAvatar(r)}
              <span class="name">${r.name}</span>
              ${i ? o`<span class="share">${this.shareOf(e, r.id)}</span>` : d}
              <!--
                In money, an empty field says in grey what it would come to:
                that is what a placeholder is for, and it answers the only
                question the mode raises. In percent the figure needs its own
                column, the field being the share itself.
              -->
              <se-field
                .value=${(i ? this.percents : this.amounts)[r.id] ?? ""}
                .suffix=${i ? "%" : this.currency}
                .disabled=${!this.participants.has(r.id)}
                decimal
                placeholder=${i ? "—" : this.shareOf(e, r.id) || this.localize("split_the_rest_short")}
                @value-changed=${(a) => i ? this.setPercent(r.id, a.detail.value) : this.setAmount(r.id, a.detail.value)}
              ></se-field>
            </div>
          `
    )}

        ${i ? o`
              <div class="total">
                <span class="muted">${t("split_percent_total")}</span>
                <strong class=${s > It ? "negative" : ""}>
                  ${(s / 100).toFixed(s % 100 === 0 ? 0 : 2)} %
                </strong>
              </div>
              ${s > It ? o`<div class="warn">${t("split_percent_over")}</div>` : d}
            ` : d}
      </div>
    `;
  }
  /**
   * Switch the unit, dropping what was typed in the other.
   *
   * 40 EUR is not 40%, and carrying the figures across would turn one into the
   * other without a word — a different expense, silently.
   */
  setUnit(e) {
    e !== this.unit && (this.unit = e, this.amounts = {}, this.percents = {}, this.emit());
  }
  /** What has been claimed so far, in hundredths of a percent. */
  percentTotal() {
    let e = 0;
    for (const [t, i] of Object.entries(this.percents))
      this.participants.has(t) && (e += Xt(i) ?? 0);
    return e;
  }
  setPercent(e, t) {
    this.percents = { ...this.percents, [e]: t }, this.emit();
  }
  /** An amount shared between some; whatever is left goes to one person. */
  renderPartial(e) {
    const t = this.localize, i = ve(this.envelopeInput), s = i === null ? null : Math.max(this.previewAmount - i, 0);
    return o`
      <div>
        <div class="muted example">${t("split_partial_example")}</div>
        <se-field
          .label=${t("split_shared_amount")}
          .value=${this.envelopeInput}
          .suffix=${this.currency}
          decimal
          placeholder="5,00"
          @value-changed=${(r) => this.setEnvelope(r.detail.value)}
        ></se-field>

        <div class="muted" style="margin-top:10px">
          ${t("split_shared_between")}
        </div>
        ${this.members.map(
      (r) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(r.id)}
                @change=${() => this.toggleParticipant(r.id)}
              />
              ${this.renderAvatar(r)}
              <span class="name">${r.name}</span>
              <span class="share">${this.shareOf(e, r.id)}</span>
            </div>
          `
    )}
      </div>

      <div class="rest">
        <span>
          ${t("split_rest_for")}
          ${s === null ? d : o`<span class="figure">(${this.money(s)})</span>`}
        </span>
        <!--
          "Whoever paid" only where nobody has yet. On an expense the payer is
          picked two fields up, so the phrase names a person already on screen —
          say their name. On a lasting rule it is the whole point: it applies to
          expenses whose payer is not known and will not always be the same.
        -->
        <se-select
          .value=${this.restTo || this.payerId || ""}
          .placeholder=${this.payerId ? void 0 : t("split_rest_payer")}
          .options=${this.members.map((r) => ({ value: r.id, label: r.name }))}
          @value-changed=${(r) => this.setRestTo(r.detail.value)}
        ></se-select>
      </div>
    `;
  }
  /**
   * The model in full: an amount shared, and what is left, to whoever and by
   * however much.
   *
   * Only reached by opening a rule that needs it. This is the editor as it was,
   * kept because such rules exist — a category rule written before the modes,
   * say — and rewriting one as something simpler would move real money.
   */
  renderCustom(e) {
    const t = this.localize;
    return o`
      <div>
        <div class="muted">${t("split_custom_hint")}</div>
        <div class="muted example">${t("split_custom_example")}</div>
      </div>

      <se-field
        .label=${t("split_shared_amount")}
        .value=${this.envelopeInput}
        .suffix=${this.currency}
        .helper=${t("split_shared_all_hint")}
        decimal
        placeholder=${t("split_shared_all")}
        @value-changed=${(i) => this.setEnvelope(i.detail.value)}
      ></se-field>

      <div>
        <div class="muted">${t("split_shared_between")}</div>
        ${this.members.map(
      (i) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(i.id)}
                @change=${() => this.toggleParticipant(i.id)}
              />
              ${this.renderAvatar(i)}
              <span class="name">${i.name}</span>
              <span class="share">${this.shareOf(e, i.id)}</span>
            </div>
          `
    )}
      </div>

      <div>
        <div class="muted">${t("split_rest_between")}</div>
        <div class="muted">${t("split_rest_between_hint")}</div>
        ${this.members.map(
      (i) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.takers.has(i.id)}
                @change=${() => this.toggleTaker(i.id)}
              />
              ${this.renderAvatar(i)}
              <span class="name">${i.name}</span>
              <se-field
                .value=${this.amounts[i.id] ?? ""}
                .suffix=${this.currency}
                .disabled=${!this.takers.has(i.id)}
                decimal
                placeholder="—"
                @value-changed=${(s) => this.setAmount(i.id, s.detail.value)}
              ></se-field>
            </div>
          `
    )}
      </div>
    `;
  }
  toggleTaker(e) {
    const t = new Set(this.takers);
    if (t.has(e)) {
      t.delete(e);
      const { [e]: i, ...s } = this.amounts;
      this.amounts = s;
    } else
      t.add(e);
    this.takers = t, this.emit();
  }
  /** The rule as filled in, for the caller to store alongside the shares. */
  currentRule() {
    return this.build();
  }
  /** The shares this rule resolves to, for the caller to store. */
  resolved() {
    return this.amount == null ? null : this.shares(this.amount);
  }
  /**
   * What the rule comes to, run through the resolver the backend mirrors.
   *
   * Never worked out by hand here: these figures are the ones that get stored,
   * and a second opinion on them is exactly how a panel starts lying.
   */
  shares(e = this.previewAmount) {
    const t = this.members.find((i) => i.id === this.payerId) ?? this.members[0];
    return t ? Zt({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((i) => i.id),
      rule: this.build()
    }) : null;
  }
  shareOf(e, t) {
    return e === null ? "" : e[t] ? this.money(e[t]) : "—";
  }
  money(e) {
    return j(e, this.currency, this.language);
  }
  renderAvatar(e) {
    return o`
      <div class="avatar" style=${`background:${e.color ?? A(e.id)}`}>
        ${W(e.name)}
      </div>
    `;
  }
  /**
   * Switch mode, carrying over what the next one can still use.
   *
   * An amount shared up front means something to `partial` and to `custom`, so
   * it survives between them; the figures typed mean the whole expense in
   * `exact` and only what is left in `custom`, so they never cross. Anything a
   * mode cannot hold is dropped rather than kept out of sight, where it would
   * come back unasked in a rule that no longer mentions it.
   */
  pick(e) {
    if (e === this.mode)
      return;
    const t = this.mode;
    if (this.mode = e, e !== "partial" && e !== "custom" && (this.envelopeInput = ""), e !== "exact" && e !== "custom" && (this.amounts = {}), e !== "exact" && (this.percents = {}), e === "exact" != (t === "exact") && (this.amounts = {}), e === "exact" && this.participants.size === 0 && (this.participants = new Set(this.members.map((i) => i.id))), e === "partial" && (this.restTo = this.restTo || [...this.takers][0] || this.payerId || ""), e === "custom" && this.takers.size === 0) {
      const i = this.restTo || this.payerId;
      this.takers = i ? /* @__PURE__ */ new Set([i]) : /* @__PURE__ */ new Set();
    }
    e !== "partial" && (this.restTo = ""), this.emit();
  }
  setEnvelope(e) {
    this.envelopeInput = e, this.emit();
  }
  setRestTo(e) {
    this.restTo = e, this.emit();
  }
  toggleParticipant(e) {
    const t = new Set(this.participants);
    if (t.has(e)) {
      t.delete(e);
      const { [e]: i, ...s } = this.amounts;
      this.amounts = s;
      const { [e]: r, ...a } = this.percents;
      this.percents = a;
    } else
      t.add(e);
    this.participants = t, this.emit();
  }
  setAmount(e, t) {
    this.amounts = { ...this.amounts, [e]: t }, this.emit();
  }
  emit() {
    this.dispatchEvent(
      new CustomEvent("rule-changed", {
        detail: { rule: this.build() },
        bubbles: !0,
        composed: !0
      })
    );
  }
  build() {
    return ss(this.mode, {
      participants: this.participants,
      envelopeInput: this.envelopeInput,
      amounts: this.amounts,
      percents: this.percents,
      unit: this.unit,
      restTo: this.restTo,
      takers: this.takers,
      memberIds: this.members.map((e) => e.id)
    });
  }
};
O.styles = [
  z,
  _`
      .toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .toggle .label {
        flex: 1;
      }

      .panel {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .member-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 3px 0;
      }

      .member-row .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }

      /* What this row comes to, next to the person it happens to. */
      .member-row .share {
        font-size: 13px;
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .member-row se-field {
        width: 116px;
      }

      .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .units {
        display: flex;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        overflow: hidden;
        flex: 0 0 auto;
      }

      .units button {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 13px;
        padding: 5px 12px;
        cursor: pointer;
      }

      .units button[aria-pressed="true"] {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }

      /* An example, set apart from the rule it is an example of. */
      .example {
        font-size: 12px;
        font-style: italic;
        padding: 4px 0 6px;
      }

      .total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 8px 0 0;
        font-size: 14px;
        font-variant-numeric: tabular-nums;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
        flex: 0 0 auto;
      }

      .rest {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 14px;
      }

      .rest se-select {
        min-width: 150px;
        flex: 1;
      }

      .rest .figure {
        font-variant-numeric: tabular-nums;
        font-weight: 500;
      }

      .warn {
        font-size: 13px;
        color: var(--error-color, #db4437);
      }
    `
];
D([
  l({ attribute: !1 })
], O.prototype, "localize", 2);
D([
  l({ attribute: !1 })
], O.prototype, "members", 2);
D([
  l({ attribute: !1 })
], O.prototype, "rule", 2);
D([
  l({ type: String })
], O.prototype, "currency", 2);
D([
  l({ type: String })
], O.prototype, "language", 2);
D([
  l({ type: Number })
], O.prototype, "amount", 2);
D([
  l({ type: String })
], O.prototype, "payerId", 2);
D([
  l({ type: String })
], O.prototype, "inherits", 2);
D([
  c()
], O.prototype, "mode", 2);
D([
  c()
], O.prototype, "participants", 2);
D([
  c()
], O.prototype, "envelopeInput", 2);
D([
  c()
], O.prototype, "amounts", 2);
D([
  c()
], O.prototype, "percents", 2);
D([
  c()
], O.prototype, "unit", 2);
D([
  c()
], O.prototype, "restTo", 2);
D([
  c()
], O.prototype, "takers", 2);
O = D([
  y("se-split-rule-editor")
], O);
var cs = Object.defineProperty, ds = Object.getOwnPropertyDescriptor, G = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ds(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && cs(t, i, r), r;
};
let T = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.name = "", this.icon = "", this.color = null, this.rule = null, this.isDefault = !1, this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      const e = {
        name: this.name.trim(),
        icon: this.icon.trim() || null,
        color: this.color,
        split_rule: this.rule
      };
      try {
        const t = this.category ? await this.api.updateCategory(this.category.id, e) : await this.api.createCategory({ group_id: this.group.id, ...e });
        await this.saveDefault(t.id), this.dispatchEvent(
          new CustomEvent("category-saved", {
            detail: { category: t },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (t) {
        this.error = S(t, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.isDefault = this.category !== void 0 && this.group.default_category_id === this.category.id, this.category && (this.name = this.category.name, this.icon = this.category.icon ?? "", this.color = this.category.color, this.rule = this.category.split_rule);
  }
  render() {
    const e = this.localize, t = this.category ? e("edit_category") : e("new_category");
    return o`
      <se-dialog open heading=${t} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : d}

          <se-field
            .label=${e("category_name")}
            .value=${this.name}
            required
            placeholder="Courses"
            @value-changed=${(i) => this.name = i.detail.value}
          ></se-field>

          <se-icon-picker
            .localize=${this.localize}
            .label=${e("icon")}
            .value=${this.icon}
            .color=${this.effectiveColor()}
            @value-changed=${(i) => this.icon = i.detail.value}
          ></se-icon-picker>

          <se-color-picker
            .localize=${this.localize}
            .label=${e("color")}
            .value=${this.color}
            .fallback=${this.autoColor()}
            @value-changed=${(i) => this.color = i.detail.value}
          ></se-color-picker>

          <div>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                @change=${(i) => this.isDefault = i.target.checked}
              />
              <span>${e("default_category")}</span>
            </label>
            <div class="muted hint">${e("default_category_hint")}</div>
          </div>

          <div>
            <label class="muted">${e("default_split")}</label>
            <se-split-rule-editor
              inherits="group"
              .localize=${this.localize}
              .members=${this.members}
              .rule=${this.rule}
              .currency=${this.group.currency}
              .language=${this.language}
              @rule-changed=${(i) => this.rule = i.detail.rule}
            ></se-split-rule-editor>
          </div>

        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${e("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || this.name.trim() === ""}
          @click=${this.submit}
        >
          ${this.category ? e("save") : e("create")}
        </se-button>
      </se-dialog>
    `;
  }
  /** What the category is shown in: the chosen colour, or the automatic one. */
  effectiveColor() {
    return this.color ?? this.autoColor();
  }
  /**
   * The colour the app would pick on its own.
   *
   * Keyed on the id, so a category being created has none yet: fall back to the
   * name, which at least stays put while typing.
   */
  autoColor() {
    return A(this.category?.id ?? this.name);
  }
  /**
   * Say whether this is the group's default, if that changed.
   *
   * The flag lives on the group, not the category — there is one of it, and a
   * category cannot know it is the chosen one. Saved after the category itself,
   * because a category being created has no id until then.
   */
  async saveDefault(e) {
    this.group.default_category_id === e !== this.isDefault && await this.api.updateGroup(this.group.id, {
      default_category_id: this.isDefault ? e : null
    });
  }
};
T.styles = z;
G([
  l({ attribute: !1 })
], T.prototype, "api", 2);
G([
  l({ attribute: !1 })
], T.prototype, "localize", 2);
G([
  l({ attribute: !1 })
], T.prototype, "group", 2);
G([
  l({ attribute: !1 })
], T.prototype, "members", 2);
G([
  l({ attribute: !1 })
], T.prototype, "category", 2);
G([
  l({ type: String })
], T.prototype, "language", 2);
G([
  c()
], T.prototype, "name", 2);
G([
  c()
], T.prototype, "icon", 2);
G([
  c()
], T.prototype, "color", 2);
G([
  c()
], T.prototype, "rule", 2);
G([
  c()
], T.prototype, "isDefault", 2);
G([
  c()
], T.prototype, "busy", 2);
G([
  c()
], T.prototype, "error", 2);
T = G([
  y("se-category-dialog")
], T);
var ps = Object.defineProperty, hs = Object.getOwnPropertyDescriptor, ae = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? hs(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && ps(t, i, r), r;
};
let Y = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.rule = null, this.isDefault = !1, this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      try {
        await this.api.updateGroup(this.group.id, {
          split_rule: this.rule,
          ...this.isDefault ? { default_category_id: null } : {}
        }), this.dispatchEvent(
          new CustomEvent("rule-saved", { bubbles: !0, composed: !0 })
        );
      } catch (e) {
        this.error = S(e, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.rule = this.group.split_rule, this.isDefault = this.group.default_category_id === null;
  }
  render() {
    const e = this.localize;
    return o`
      <se-dialog
        open
        heading=${e("no_category_rule")}
        @dialog-closed=${this.cancel}
      >
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : d}

          <div>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                ?disabled=${this.group.default_category_id === null}
                @change=${(t) => this.isDefault = t.target.checked}
              />
              <span>${e("default_category")}</span>
            </label>
            <div class="muted hint">${e("default_category_hint")}</div>
          </div>

          <div class="muted">${e("no_category_rule_hint")}</div>

          <se-split-rule-editor
            .localize=${this.localize}
            .members=${this.members}
            .rule=${this.group.split_rule}
            .currency=${this.group.currency}
            .language=${this.language}
            @rule-changed=${(t) => this.rule = t.detail.rule}
          ></se-split-rule-editor>
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${e("cancel")}
        </se-button>
        <se-button slot="actions" ?disabled=${this.busy} @click=${this.submit}>
          ${e("save")}
        </se-button>
      </se-dialog>
    `;
  }
};
Y.styles = [
  z,
  _`
      .switch {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-size: 14px;
      }

      .switch input {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }

      .switch input[disabled] {
        cursor: default;
      }

      .hint {
        font-size: 12px;
        padding: 4px 0 0 32px;
      }
    `
];
ae([
  l({ attribute: !1 })
], Y.prototype, "api", 2);
ae([
  l({ attribute: !1 })
], Y.prototype, "localize", 2);
ae([
  l({ attribute: !1 })
], Y.prototype, "group", 2);
ae([
  l({ attribute: !1 })
], Y.prototype, "members", 2);
ae([
  l({ type: String })
], Y.prototype, "language", 2);
ae([
  c()
], Y.prototype, "rule", 2);
ae([
  c()
], Y.prototype, "isDefault", 2);
ae([
  c()
], Y.prototype, "busy", 2);
ae([
  c()
], Y.prototype, "error", 2);
Y = ae([
  y("se-group-rule-dialog")
], Y);
function Rt(e, t, i, s) {
  if (e === null)
    return t("split_equal");
  const r = ft(e);
  if (r === "equal") {
    const a = e.participants?.length;
    return a ? `${t("split_equal")} · ${a}` : t("split_equal");
  }
  return r === "exact" ? Object.keys(e.remainder?.percent ?? {}).length > 0 ? us(e, t) : t("split_exact") : r === "partial" ? e.envelope == null ? t("split_partial") : `${j(e.envelope, i, s)} ${t("split_shared_lower")}` : t("split_custom");
}
function us(e, t) {
  const i = Object.values(e.remainder?.percent ?? {});
  return i.length === 0 ? t("split_percent") : i.map((s) => s % 100 === 0 ? String(s / 100) : (s / 100).toFixed(2)).join(" / ").concat(" %");
}
var gs = Object.defineProperty, ms = Object.getOwnPropertyDescriptor, L = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ms(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && gs(t, i, r), r;
};
let R = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.categories = [], this.creating = !1, this.editingGroupRule = !1, this.loading = !0, this.dirty = !1, this.handleGroupRuleSaved = () => {
      this.editingGroupRule = !1, this.dispatchEvent(
        new CustomEvent("categories-changed", { bubbles: !0, composed: !0 })
      );
    }, this.closeEditor = () => {
      this.creating = !1, this.editing = void 0;
    }, this.handleSaved = async () => {
      this.dirty = !0, this.closeEditor(), await this.load();
    }, this.close = () => {
      this.dispatchEvent(
        new CustomEvent(this.dirty ? "categories-changed" : "dialog-cancelled", {
          bubbles: !0,
          composed: !0
        })
      );
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const e = this.localize;
    return this.editingGroupRule ? o`
        <se-group-rule-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .language=${this.language}
          @dialog-cancelled=${() => this.editingGroupRule = !1}
          @rule-saved=${this.handleGroupRuleSaved}
        ></se-group-rule-dialog>
      ` : this.creating || this.editing ? o`
        <se-category-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .category=${this.editing}
          .language=${this.language}
          @dialog-cancelled=${this.closeEditor}
          @category-saved=${this.handleSaved}
        ></se-category-dialog>
      ` : o`
      <se-dialog open heading=${e("categories")} @dialog-closed=${this.close}>
        ${this.loading ? o`<div class="empty">${e("loading")}</div>` : o`
              <div>
                ${this.error ? o`<div class="error">${this.error}</div>` : d}
                ${this.renderNoCategory()}
                ${this.categories.map((t) => this.renderRow(t))}
                ${this.categories.length === 0 ? o`<div class="empty">${e("no_categories")}</div>` : d}
              </div>
            `}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${e("close")}
        </se-button>
        <se-button slot="actions" @click=${() => this.creating = !0}>
          ${e("new_category")}
        </se-button>
      </se-dialog>
    `;
  }
  renderRow(e) {
    return o`
      <button class="row" @click=${() => this.editing = e}>
        <se-icon
          .icon=${e.icon}
          .fallback=${e.name.charAt(0).toUpperCase()}
          .color=${e.color ?? A(e.id)}
          .size=${34}
        ></se-icon>
        <div class="info">
          <div class="name">
            ${e.name}
            ${this.group.default_category_id === e.id ? o`<span class="tag">${this.localize("default_category_tag")}</span>` : d}
          </div>
          <div class="muted">${this.describe(e)}</div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }
  /**
   * The rule an expense with no category falls back on.
   *
   * Sits with the categories because that is what it is: the rule for the ones
   * that have none, and the one every category without its own defers to. It
   * was stored from the first day and nothing could ever set it.
   */
  renderNoCategory() {
    return o`
      <button class="row" @click=${() => this.editingGroupRule = !0}>
        <se-icon
          .icon=${"mdi:tag-off-outline"}
          fallback="—"
          .color=${"var(--secondary-text-color, #727272)"}
          .size=${34}
        ></se-icon>
        <div class="info">
          <div class="name">
            ${this.localize("no_category")}
            ${this.group.default_category_id === null ? o`<span class="tag">${this.localize("default_category_tag")}</span>` : d}
          </div>
          <div class="muted">
            ${Rt(
      this.group.split_rule,
      this.localize,
      this.group.currency,
      this.language
    )}
          </div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }
  /**
   * What a category does to an expense, in one line.
   *
   * A category with no rule of its own is not an equal split: it hands the
   * expense to the group's rule, which may be anything. Saying "equal shares"
   * there was a guess, and a wrong one the moment the group rule was not that.
   */
  describe(e) {
    return e.split_rule === null ? this.localize("rule_from_group") : Rt(
      e.split_rule,
      this.localize,
      this.group.currency,
      this.language
    );
  }
  async load() {
    this.error = void 0;
    try {
      this.categories = await this.api.listCategories(this.group.id);
    } catch (e) {
      this.error = S(e, this.localize);
    } finally {
      this.loading = !1;
    }
  }
};
R.styles = [
  z,
  _`
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        text-align: left;
        font-family: inherit;
      }

      .row + .row {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .row .info {
        flex: 1;
        min-width: 0;
      }

      .row .name {
        font-size: 14px;
        font-weight: 500;
      }

      .chevron {
        color: var(--secondary-text-color);
      }
    `
];
L([
  l({ attribute: !1 })
], R.prototype, "api", 2);
L([
  l({ attribute: !1 })
], R.prototype, "localize", 2);
L([
  l({ attribute: !1 })
], R.prototype, "group", 2);
L([
  l({ attribute: !1 })
], R.prototype, "members", 2);
L([
  l({ type: String })
], R.prototype, "language", 2);
L([
  c()
], R.prototype, "categories", 2);
L([
  c()
], R.prototype, "editing", 2);
L([
  c()
], R.prototype, "creating", 2);
L([
  c()
], R.prototype, "editingGroupRule", 2);
L([
  c()
], R.prototype, "loading", 2);
L([
  c()
], R.prototype, "error", 2);
L([
  c()
], R.prototype, "dirty", 2);
R = L([
  y("se-categories-dialog")
], R);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fs = (e) => (...t) => ({ _$litDirective$: e, values: t });
let ys = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, i, s) {
    this._$Ct = t, this._$AM = i, this._$Ci = s;
  }
  _$AS(t, i) {
    return this.update(t, i);
  }
  update(t, i) {
    return this.render(...i);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bs = {}, vs = (e, t = bs) => e._$AH = t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $s = fs(class extends ys {
  constructor() {
    super(...arguments), this.key = d;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, i]) {
    return t !== this.key && (vs(e), this.key = t), i;
  }
});
var _s = Object.defineProperty, xs = Object.getOwnPropertyDescriptor, H = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? xs(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && _s(t, i, r), r;
};
let U = class extends g {
  constructor() {
    super(...arguments), this.groupCurrency = "EUR", this.currency = "EUR", this.on = "", this.amount = null, this.language = "en", this.typed = "", this.busy = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  updated(e) {
    e.has("currency") && (this.typed = "", this.fetched = void 0, this.error = void 0), (e.has("currency") || e.has("on")) && this.load(), e.has("amount") && this.emit();
  }
  render() {
    return this.currency === this.groupCurrency ? d : this.renderRate();
  }
  renderRate() {
    const e = this.localize, t = this.rate();
    return o`
      <div>
        <div class="row">
          <label class="muted">${e("rate_heading")}</label>
          ${this.busy ? d : o`<button class="link" @click=${() => this.load(!0)}>
                ${e("rate_retry")}
              </button>`}
        </div>

        ${this.busy ? o`<div class="muted">${e("loading")}</div>` : d}
        ${this.error ? o`<div class="warning">${this.error}</div>` : d}

        <div class="rate">
          <div class="says">${this.renderSays(t)}</div>
          <se-field
            .label=${e("rate_label")}
            .value=${this.typed || (t === null ? "" : At(t))}
            decimal
            placeholder="0,87681"
            @value-changed=${(i) => this.type(i.detail.value)}
          ></se-field>
        </div>
      </div>
    `;
  }
  /** What the rate is, where it comes from, and what the amount comes to. */
  renderSays(e) {
    const t = this.localize;
    if (e === null)
      return o`<span class="muted">${t("rate_needed")}</span>`;
    const i = this.amount === null ? null : Ui(this.amount, e);
    return o`
      ${this.fetched?.stale && !this.typed ? o`<div class="stale">
            ${t("rate_stale")}
            ${Re(this.fetched.as_of, this.language)}
          </div>` : d}
      <div>
        1 ${this.currency} = ${At(e)} ${this.groupCurrency}
        ${i === null ? d : o`<br />${t("converts_to")}
              <strong>
                ${j(i, this.groupCurrency, this.language)}
              </strong>`}
      </div>
    `;
  }
  /**
   * The rate in force: what was typed, else what was fetched.
   *
   * Typing always wins, and it is why the field is there at all — the service
   * being down must never be the end of it.
   */
  rate() {
    return this.typed.trim() ? Ni(this.typed) : this.currency === this.groupCurrency ? 1e6 : this.fetched?.rate ?? null;
  }
  type(e) {
    this.typed = e, this.emit();
  }
  async load(e = !1) {
    if (this.currency === this.groupCurrency || !this.on) {
      this.error = void 0, this.emit();
      return;
    }
    e && (this.typed = ""), this.busy = !0, this.error = void 0;
    try {
      this.fetched = await this.api.getExchangeRate(
        this.groupId,
        this.currency,
        this.groupCurrency,
        this.on
      );
    } catch (t) {
      this.fetched = void 0, this.error = t?.code === "exchange_rate_unavailable" ? this.localize("rate_unavailable") : S(t, this.localize);
    } finally {
      this.busy = !1, this.emit();
    }
  }
  /**
   * Say where things stand.
   *
   * A null rate means the expense cannot be saved: the dialog disables its
   * button on it rather than sending something that would be refused.
   */
  emit() {
    this.dispatchEvent(
      new CustomEvent("rate-changed", {
        detail: { currency: this.currency, rate: this.rate() },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
U.styles = [
  z,
  _`
      /* The heading, and the retry pushed out to the far end. */
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .rate {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 130px;
        gap: 12px;
        align-items: end;
        margin-top: 6px;
      }

      .says {
        font-size: 13px;
        padding-top: 6px;
      }

      .says strong {
        font-variant-numeric: tabular-nums;
      }

      .stale {
        color: var(--warning-color, #ffa600);
      }

    `
];
H([
  l({ attribute: !1 })
], U.prototype, "api", 2);
H([
  l({ attribute: !1 })
], U.prototype, "localize", 2);
H([
  l({ type: String })
], U.prototype, "groupId", 2);
H([
  l({ type: String })
], U.prototype, "groupCurrency", 2);
H([
  l({ type: String })
], U.prototype, "currency", 2);
H([
  l({ type: String })
], U.prototype, "on", 2);
H([
  l({ type: Number })
], U.prototype, "amount", 2);
H([
  l({ type: String })
], U.prototype, "language", 2);
H([
  c()
], U.prototype, "fetched", 2);
H([
  c()
], U.prototype, "typed", 2);
H([
  c()
], U.prototype, "busy", 2);
H([
  c()
], U.prototype, "error", 2);
U = H([
  y("se-currency-field")
], U);
const ws = {
  title: "expense_title",
  description: "description",
  amount: "amount",
  currency: "currency",
  paid_by_member_id: "paid_by",
  expense_date: "date",
  payment_date: "date",
  category_id: "category",
  from_member_id: "from_member",
  to_member_id: "to_member",
  shares: "split",
  kind: "kind_label"
};
function ks(e, t) {
  const i = ws[e.field];
  return i ? {
    label: t.localize(i),
    before: Ut(e.field, e.before, t),
    after: Ut(e.field, e.after, t)
  } : null;
}
function Ut(e, t, i) {
  return t == null ? null : e === "amount" && typeof t == "number" ? j(t, i.currency, i.language) : e === "expense_date" || e === "payment_date" ? Re(String(t), i.language) : e === "category_id" ? i.categories.find((s) => s.id === t)?.name ?? i.localize("no_category") : e === "paid_by_member_id" || e === "from_member_id" || e === "to_member_id" ? Jt(String(t), i) : e === "shares" && zs(t) ? Ss(t, i) : e === "kind" ? i.localize(
    t === "debt" ? "kind_debt" : "kind_reimbursement"
  ) : String(t);
}
function Ss(e, t) {
  const i = Object.entries(e).filter(([, s]) => s !== 0);
  return i.length === 0 ? "—" : i.map(
    ([s, r]) => `${Jt(s, t)} ${j(r, t.currency, t.language)}`
  ).join(" · ");
}
function Jt(e, t) {
  return t.members.find((i) => i.id === e)?.name ?? "?";
}
function zs(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e) && Object.values(e).every((t) => typeof t == "number");
}
var Cs = Object.defineProperty, Ps = Object.getOwnPropertyDescriptor, de = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ps(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Cs(t, i, r), r;
};
let te = class extends g {
  constructor() {
    super(...arguments), this.revisions = [], this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.withSubject = !1;
  }
  render() {
    return this.revisions.length === 0 ? o`<div class="empty">${this.localize("no_history")}</div>` : o`${this.revisions.map((e) => this.renderEntry(e))}`;
  }
  renderEntry(e) {
    const t = this.actorOf(e), i = t?.name ?? this.localize("someone"), s = this.openable?.has(e.entity_id) ?? !1, r = o`
      <div
        class="avatar"
        style=${`background:${t?.color ?? A(e.actor_user_id ?? e.id)}`}
      >
        ${W(i)}
      </div>
      <div class="body">
        <div class="head">
          <span class="who">${i}</span>
          <span class="when">${Re(e.at, this.language)}</span>
        </div>
        <div class="what">${this.headline(e)}</div>
        ${this.renderChanges(e)}
      </div>
      ${s ? o`<span class="chevron">›</span>` : d}
    `;
    return s ? o`<button class="entry entry-button" @click=${() => this.pick(e)}>
          ${r}
        </button>` : o`<div class="entry">${r}</div>`;
  }
  pick(e) {
    this.dispatchEvent(
      new CustomEvent("revision-picked", {
        detail: { entityType: e.entity_type, entityId: e.entity_id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /**
   * What happened, in one line.
   *
   * Reads as a sentence rather than a code: "modified the expense", and in the
   * group journal, which one.
   */
  headline(e) {
    const t = this.localize, i = e.entity_type === "expense" ? t("the_expense") : t("the_payment"), s = t(`history_${e.action}`), r = this.withSubject && e.entity_label ? ` "${e.entity_label}"` : "";
    return `${s} ${i}${r}`;
  }
  /**
   * The changes, dropping the ones this version cannot say.
   *
   * A creation lists everything it was born with, which on the group journal
   * would drown out the changes that actually mean something. Only what moved
   * gets spelled out; what a thing started as can be read on the thing itself.
   */
  renderChanges(e) {
    if (e.action === "created")
      return d;
    const t = {
      localize: this.localize,
      members: this.members,
      categories: this.categories,
      currency: this.currency,
      language: this.language
    }, i = e.changes.map((s) => ks(s, t)).filter((s) => s !== null);
    return o`
      ${i.map(
      (s) => o`
          <div class="change">
            <span class="field">${s.label}</span>
            ${s.before === null ? d : o`<span class="before">${s.before}</span>
                  <span class="arrow">→</span>`}
            ${s.after === null ? o`<span class="after">—</span>` : o`<span class="after">${s.after}</span>`}
          </div>
        `
    )}
    `;
  }
  /** The member behind the account that made the change, if we can place them. */
  actorOf(e) {
    if (e.actor_user_id)
      return this.members.find((t) => t.user_id === e.actor_user_id);
  }
};
te.styles = [
  z,
  _`
      :host {
        display: block;
      }

      .entry {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        align-items: flex-start;
      }

      .entry + .entry {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .entry-button {
        border: none;
        background: none;
        color: inherit;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
      }

      .entry-button:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .chevron {
        color: var(--secondary-text-color);
        align-self: center;
      }

      .body {
        flex: 1;
        min-width: 0;
      }

      .head {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .who {
        font-size: 14px;
        font-weight: 500;
      }

      .when {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-left: auto;
        white-space: nowrap;
      }

      .what {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .change {
        font-size: 13px;
        margin-top: 4px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: baseline;
      }

      .field {
        color: var(--secondary-text-color);
        min-width: 90px;
      }

      .before {
        text-decoration: line-through;
        color: var(--secondary-text-color);
      }

      .arrow {
        color: var(--secondary-text-color);
      }

      .after {
        font-weight: 500;
      }

      .entry .avatar {
        width: 28px;
        height: 28px;
        font-size: 11px;
      }
    `
];
de([
  l({ attribute: !1 })
], te.prototype, "localize", 2);
de([
  l({ attribute: !1 })
], te.prototype, "revisions", 2);
de([
  l({ attribute: !1 })
], te.prototype, "members", 2);
de([
  l({ attribute: !1 })
], te.prototype, "categories", 2);
de([
  l({ type: String })
], te.prototype, "currency", 2);
de([
  l({ type: String })
], te.prototype, "language", 2);
de([
  l({ type: Boolean })
], te.prototype, "withSubject", 2);
de([
  l({ attribute: !1 })
], te.prototype, "openable", 2);
te = de([
  y("se-history")
], te);
var Es = Object.defineProperty, As = Object.getOwnPropertyDescriptor, F = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? As(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Es(t, i, r), r;
};
let N = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.open = !1, this.busy = !1, this.toggle = async () => {
      if (this.open = !this.open, !(!this.open || this.revisions || this.busy)) {
        this.busy = !0, this.error = void 0;
        try {
          this.revisions = await this.api.listEntityRevisions(this.groupId, this.entityId);
        } catch (e) {
          this.error = S(e, this.localize);
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  render() {
    const e = this.localize;
    return o`
      <div>
        <div class="head">
          <label class="muted">${e("history")}</label>
          <button class="link" @click=${this.toggle}>
            ${this.open ? e("done") : e("see_all")}
          </button>
        </div>

        ${this.open ? this.renderBody() : d}
      </div>
    `;
  }
  renderBody() {
    return this.error ? o`<div class="error">${this.error}</div>` : this.busy || !this.revisions ? o`<div class="muted">${this.localize("loading")}</div>` : o`
      <se-history
        .localize=${this.localize}
        .revisions=${this.revisions}
        .members=${this.members}
        .categories=${this.categories}
        .currency=${this.currency}
        .language=${this.language}
      ></se-history>
    `;
  }
};
N.styles = [
  z,
  _`
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

    `
];
F([
  l({ attribute: !1 })
], N.prototype, "api", 2);
F([
  l({ attribute: !1 })
], N.prototype, "localize", 2);
F([
  l({ type: String })
], N.prototype, "groupId", 2);
F([
  l({ type: String })
], N.prototype, "entityId", 2);
F([
  l({ attribute: !1 })
], N.prototype, "members", 2);
F([
  l({ attribute: !1 })
], N.prototype, "categories", 2);
F([
  l({ type: String })
], N.prototype, "currency", 2);
F([
  l({ type: String })
], N.prototype, "language", 2);
F([
  c()
], N.prototype, "open", 2);
F([
  c()
], N.prototype, "revisions", 2);
F([
  c()
], N.prototype, "busy", 2);
F([
  c()
], N.prototype, "error", 2);
N = F([
  y("se-entity-history")
], N);
var Os = Object.defineProperty, Is = Object.getOwnPropertyDescriptor, w = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Is(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Os(t, i, r), r;
};
let v = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = Vt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.editingSplit = !1, this.showDescription = !1, this.currency = "", this.rate = null, this.pickCategory = (e) => {
      this.categoryId = e.detail.value, this.rule = null;
    }, this.pickCurrency = (e) => {
      this.currency = e.target.value, this.rate = this.currency === this.group.currency ? V : null;
    }, this.handleRate = (e) => {
      this.currency = e.detail.currency, this.rate = e.detail.rate;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const e = ve(this.amountInput), t = this.resolved(e);
      if (e === null || !t)
        return;
      this.busy = !0, this.error = void 0;
      const i = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: e,
        paid_by_member_id: this.paidBy,
        expense_date: Kt(this.date),
        category_id: this.categoryId || null,
        description: this.description.trim() || null,
        shares: Object.entries(t).map(([a, n]) => ({
          member_id: a,
          amount: n
        })),
        // The shares are the truth, but the rule has to travel with them, or
        // reopening the expense could only ever spell the amounts back out.
        currency: this.currency || this.group.currency,
        // The rate the panel showed and had accepted, so that what was agreed to
        // on screen is what lands in the balances.
        ...this.rate !== null && this.rate !== V ? { exchange_rate: this.rate } : {},
        split_rule: this.rule ?? this.defaultRule()
      }, { group_id: s, ...r } = i;
      try {
        const a = this.expense ? await this.api.updateExpense(this.expense.id, r) : await this.api.createExpense(i);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: a },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (a) {
        this.error = S(a, this.localize);
      } finally {
        this.busy = !1;
      }
    }, this.deleteExpense = async () => {
      if (this.expense) {
        if (!this.confirmingDelete) {
          this.confirmingDelete = !0;
          return;
        }
        this.busy = !0, this.error = void 0;
        try {
          await this.api.deleteExpense(this.expense.id), this.dispatchEvent(
            new CustomEvent("expense-deleted", { bubbles: !0, composed: !0 })
          );
        } catch (e) {
          this.error = S(e, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), !this.expense) {
      this.paidBy = this.meId ?? this.members[0]?.id ?? "";
      const e = this.group.default_category_id;
      this.categoryId = this.categories.some((t) => t.id === e) ? e : "", this.currency = this.group.currency, this.rate = V;
      return;
    }
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = at(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = Yt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares(), this.showDescription = this.description !== "", this.currency = this.expense.currency, this.rate = this.expense.exchange_rate;
  }
  /**
   * Reproduce the stored shares as a rule.
   *
   * Only for expenses saved before the rule was kept: spelling every amount out
   * is the one reading that cannot be wrong.
   */
  ruleFromStoredShares() {
    const e = (this.expense?.shares ?? []).filter((t) => t.amount !== 0);
    return e.length === 0 ? null : {
      envelope: 0,
      remainder: {
        members: e.map((t) => t.member_id),
        fixed: Object.fromEntries(
          e.map((t) => [t.member_id, t.amount])
        )
      }
    };
  }
  /**
   * What the editor opens on: the category's rule, then the group's.
   *
   * Never null. Nothing above saying anything means an equal split, and that is
   * worth spelling out here — a null would read as "default rule", the one mode
   * this dialog does not offer, because saving freezes the rule anyway.
   */
  defaultRule() {
    return this.categories.find((t) => t.id === this.categoryId)?.split_rule ?? this.group.split_rule ?? { envelope: null, participants: null, remainder: {} };
  }
  /**
   * The shares the split comes out as.
   *
   * Resolved from this dialog's own state rather than asked of the editor:
   * during a render the editor still holds the previous amount, so it would
   * answer one keystroke behind. Same resolver either way — the one the backend
   * is checked against.
   */
  resolved(e) {
    return e === null || !this.paidBy || this.members.length === 0 ? null : Zt({
      amount: e,
      payerId: this.paidBy,
      memberIds: this.members.map((t) => t.id),
      rule: this.rule ?? this.defaultRule()
    });
  }
  render() {
    const e = this.localize, t = ve(this.amountInput), i = this.expense ? e("edit_expense") : e("new_expense");
    return o`
      <se-dialog open heading=${i} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : d}

          <se-field
            .label=${e("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(s) => this.expenseTitle = s.detail.value}
          ></se-field>

          <div class="pair">
            <se-field
              .label=${e("amount")}
              .value=${this.amountInput}
              required
              decimal
              placeholder="85,42"
              @value-changed=${(s) => this.amountInput = s.detail.value}
            >
              <!--
                Where the currency was only ever written, it is now chosen. It
                belongs against the figure it qualifies: a number and its unit
                are one thing, and putting the unit somewhere else was asking
                people to go looking for it.
              -->
              <select
                slot="suffix"
                class="currency"
                .value=${this.currency}
                aria-label=${e("currency_label")}
                @change=${this.pickCurrency}
              >
                ${this.currencies().map(
      (s) => o`
                    <option value=${s} ?selected=${s === this.currency}>
                      ${s}
                    </option>
                  `
    )}
              </select>
            </se-field>

            <se-field
              .label=${e("date")}
              type="date"
              .value=${this.date}
              @value-changed=${(s) => this.date = s.detail.value}
            ></se-field>
          </div>

          <div class="pair">
            <se-select
              .label=${e("paid_by")}
              .value=${this.paidBy}
              .options=${this.members.map((s) => ({ value: s.id, label: s.name }))}
              @value-changed=${(s) => this.paidBy = s.detail.value}
            ></se-select>

            <se-select
              .label=${e("category")}
              .value=${this.categoryId}
              .placeholder=${e("no_category")}
              .options=${this.categories.map((s) => ({ value: s.id, label: s.name }))}
              @value-changed=${this.pickCategory}
            ></se-select>
          </div>

          <!-- Shows itself only when there is a rate to settle. -->
          <se-currency-field
            .api=${this.api}
            .localize=${this.localize}
            .groupId=${this.group.id}
            .groupCurrency=${this.group.currency}
            .currency=${this.currency}
            .on=${this.date}
            .amount=${t}
            .language=${this.language}
            @rate-changed=${this.handleRate}
          ></se-currency-field>

          ${this.showDescription ? o`
                <se-field
                  .label=${e("description")}
                  .value=${this.description}
                  placeholder=${e("description_placeholder")}
                  @value-changed=${(s) => this.description = s.detail.value}
                ></se-field>
              ` : o`
                <button class="link" @click=${() => this.showDescription = !0}>
                  + ${e("add_description")}
                </button>
              `}

          ${this.renderSplit(t)}

          <!-- Only once there is a past to read: a new expense has none. -->
          ${this.expense ? o`
                <se-entity-history
                  .api=${this.api}
                  .localize=${this.localize}
                  .groupId=${this.group.id}
                  .entityId=${this.expense.id}
                  .members=${this.members}
                  .categories=${this.categories}
                  .currency=${this.group.currency}
                  .language=${this.language}
                ></se-entity-history>
              ` : d}
        </div>

        ${this.confirmingDelete ? o`<div slot="banner" class="warning">
              ${e("confirm_delete_expense")}
            </div>` : d}

        ${this.expense ? o`
              <se-button
                slot="actions"
                variant="danger"
                ?disabled=${this.busy}
                @click=${this.deleteExpense}
              >
                ${this.confirmingDelete ? e("confirm_delete") : e("delete")}
              </se-button>
              <span slot="actions" class="spacer"></span>
            ` : d}
        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${e("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || !this.canSave(t)}
          @click=${this.submit}
        >
          ${this.expense ? e("save") : e("create")}
        </se-button>
      </se-dialog>
    `;
  }
  /**
   * The split: its result always, its controls on request.
   *
   * The editor is the tallest thing here and the least often touched, since the
   * category rule usually does the job. So it stays folded away — but what it
   * resolves to is always on screen, because that is the part you must see
   * before saving.
   */
  renderSplit(e) {
    const t = this.localize;
    return o`
      <div>
        <div class="split-head">
          <label class="muted">${t("split")}</label>
          <button class="link" @click=${() => this.editingSplit = !this.editingSplit}>
            ${this.editingSplit ? t("done") : t("edit_split")}
          </button>
        </div>

        ${this.editingSplit ? d : this.renderSummary(e)}

        <!-- Kept mounted while folded: it owns the rule and resolves it. -->
        <div class="editor" ?hidden=${!this.editingSplit}>
          ${this.renderEditor(e)}
        </div>
      </div>
    `;
  }
  renderSummary(e) {
    const t = this.resolved(e);
    return t === null ? o`
        <div class="summary muted">
          ${e === null ? this.localize("split_needs_amount") : this.localize("rule_invalid")}
        </div>
      ` : o`
      <div class="summary">
        ${this.members.filter((i) => t[i.id]).map(
      (i) => o`
              <span class="who">
                ${i.name}
                <strong>
                  ${j(t[i.id], this.currency, this.language)}
                </strong>
              </span>
            `
    )}
      </div>
    `;
  }
  /**
   * The same editor the category rule uses, on the real amount.
   *
   * Opened on the category's rule rather than on "default rule", and no such
   * mode is offered here. Saving copies whatever is on screen onto the expense
   * — it always did — so a rule that merely said "whatever the category says"
   * was frozen at that instant anyway: change the category next month and this
   * expense would not budge. Naming the deferral was a promise nothing kept.
   *
   * Keyed on the category, so picking one rebuilds the editor from its rule:
   * the category fills the screen in, and it stays yours to overwrite.
   */
  renderEditor(e) {
    return $s(
      this.categoryId,
      o`
        <se-split-rule-editor
          .localize=${this.localize}
          .members=${this.members}
          .rule=${this.rule ?? this.defaultRule()}
          .currency=${this.currency || this.group.currency}
          .language=${this.language}
          .amount=${e}
          .payerId=${this.paidBy}
          @rule-changed=${(t) => this.rule = t.detail.rule}
        ></se-split-rule-editor>
      `
    );
  }
  /** Every currency a rate can be had for, and the group's, which may not be. */
  currencies() {
    return [.../* @__PURE__ */ new Set([...mt, this.group.currency, this.currency])].sort();
  }
  /**
   * Whether the expense can be saved.
   *
   * A foreign currency with no rate cannot: the backend would refuse it, and a
   * button that sends something doomed is worse than one that waits.
   */
  canSave(e) {
    return this.isValid(e) && this.rate !== null;
  }
  isValid(e) {
    return this.expenseTitle.trim() === "" || e === null || e <= 0 || !this.paidBy || this.members.length === 0 ? !1 : this.resolved(e) !== null;
  }
};
v.styles = [
  z,
  _`
      .split-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .summary {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        font-size: 13px;
        padding: 6px 0 2px;
      }

      .who strong {
        font-variant-numeric: tabular-nums;
        margin-left: 4px;
      }

      .editor[hidden] {
        display: none;
      }
    `
];
w([
  l({ attribute: !1 })
], v.prototype, "api", 2);
w([
  l({ attribute: !1 })
], v.prototype, "localize", 2);
w([
  l({ attribute: !1 })
], v.prototype, "group", 2);
w([
  l({ attribute: !1 })
], v.prototype, "members", 2);
w([
  l({ attribute: !1 })
], v.prototype, "categories", 2);
w([
  l({ attribute: !1 })
], v.prototype, "expense", 2);
w([
  l({ type: String })
], v.prototype, "meId", 2);
w([
  l({ type: String })
], v.prototype, "language", 2);
w([
  c()
], v.prototype, "expenseTitle", 2);
w([
  c()
], v.prototype, "description", 2);
w([
  c()
], v.prototype, "amountInput", 2);
w([
  c()
], v.prototype, "paidBy", 2);
w([
  c()
], v.prototype, "date", 2);
w([
  c()
], v.prototype, "categoryId", 2);
w([
  c()
], v.prototype, "rule", 2);
w([
  c()
], v.prototype, "busy", 2);
w([
  c()
], v.prototype, "error", 2);
w([
  c()
], v.prototype, "confirmingDelete", 2);
w([
  c()
], v.prototype, "editingSplit", 2);
w([
  c()
], v.prototype, "showDescription", 2);
w([
  c()
], v.prototype, "currency", 2);
w([
  c()
], v.prototype, "rate", 2);
v = w([
  y("se-expense-dialog")
], v);
var Ds = Object.defineProperty, Ts = Object.getOwnPropertyDescriptor, oe = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ts(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ds(t, i, r), r;
};
let Z = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.close = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const e = this.localize;
    return o`
      <se-dialog open heading=${e("group_history")} @dialog-closed=${this.close}>
        ${this.error ? o`<div class="error">${this.error}</div>` : d}
        ${this.renderBody()}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${e("close")}
        </se-button>
      </se-dialog>
    `;
  }
  renderBody() {
    return this.error ? d : this.revisions ? o`
      <se-history
        withSubject
        .localize=${this.localize}
        .revisions=${this.revisions}
        .members=${this.members}
        .categories=${this.categories}
        .openable=${this.openable}
        .currency=${this.group.currency}
        .language=${this.language}
      ></se-history>
    ` : o`<div class="muted">${this.localize("loading")}</div>`;
  }
  async load() {
    try {
      this.revisions = await this.api.listRevisions(this.group.id);
    } catch (e) {
      this.error = S(e, this.localize);
    }
  }
};
Z.styles = z;
oe([
  l({ attribute: !1 })
], Z.prototype, "api", 2);
oe([
  l({ attribute: !1 })
], Z.prototype, "localize", 2);
oe([
  l({ attribute: !1 })
], Z.prototype, "group", 2);
oe([
  l({ attribute: !1 })
], Z.prototype, "members", 2);
oe([
  l({ attribute: !1 })
], Z.prototype, "categories", 2);
oe([
  l({ attribute: !1 })
], Z.prototype, "openable", 2);
oe([
  l({ type: String })
], Z.prototype, "language", 2);
oe([
  c()
], Z.prototype, "revisions", 2);
oe([
  c()
], Z.prototype, "error", 2);
Z = oe([
  y("se-history-dialog")
], Z);
var Ms = Object.defineProperty, js = Object.getOwnPropertyDescriptor, q = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? js(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ms(t, i, r), r;
};
let I = class extends g {
  constructor() {
    super(...arguments), this.haUsers = [], this.members = [], this.memberships = [], this.newName = "", this.loading = !0, this.dirty = !1, this.pastMembers = [], this.addGuest = async () => {
      this.busy = "new", this.error = void 0;
      try {
        await this.api.createMember({
          name: this.newName.trim(),
          group_id: this.groupId
        }), this.newName = "", this.dirty = !0, await this.load();
      } catch (e) {
        this.error = S(e, this.localize);
      } finally {
        this.busy = void 0;
      }
    }, this.close = () => {
      this.dispatchEvent(
        new CustomEvent(this.dirty ? "members-changed" : "dialog-cancelled", {
          bubbles: !0,
          composed: !0
        })
      );
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const e = this.localize;
    return o`
      <se-dialog open heading=${e("members")} @dialog-closed=${this.close}>
        ${this.loading ? o`<div class="empty">${e("loading")}</div>` : o`
              <div>
                ${this.error ? o`<div class="error">${this.error}</div>` : d}
                ${this.renderAccounts()} ${this.renderGuests()}
              </div>
            `}

        <se-button slot="actions" @click=${this.close}>
          ${e("close")}
        </se-button>
      </se-dialog>
    `;
  }
  renderAccounts() {
    const e = this.localize;
    return o`
      <div class="section">
        <h3>${e("ha_accounts")}</h3>
        <div class="muted">${e("ha_accounts_hint")}</div>

        ${this.haUsers.length === 0 ? o`<div class="empty">${e("no_ha_accounts")}</div>` : this.haUsers.map((t) => this.renderAccount(t))}
      </div>
    `;
  }
  renderAccount(e) {
    const t = this.memberForUser(e.id), i = this.isOwner(t);
    return o`
      <div class="row">
        <input
          type="checkbox"
          .checked=${t !== void 0}
          ?disabled=${i || this.busy !== void 0}
          title=${i ? this.localize("owner_locked") : ""}
          @change=${() => this.toggleAccount(e, t)}
        />
        <!--
          Seeded on the member, never on the account: an automatic colour is
          derived from the member id everywhere else — expense rows, balances,
          statistics — so seeding it here on the Home Assistant account gave the
          same person two different colours. An account not in the group has no
          member to seed on yet, and its colour is only a preview until it does.
        -->
        ${this.renderTintable(t, e.name, t?.id ?? e.id)}
        <span class="name">${e.name}</span>
        ${i ? o`<span class="tag">${this.localize("group_owner")}</span>` : d}
      </div>
      ${this.renderPalette(t)}
    `;
  }
  /**
   * A member's avatar, clickable to recolour them.
   *
   * The avatar is what the colour actually shows up in, so it is the obvious
   * thing to press. Members with no account yet have nothing to recolour.
   */
  renderTintable(e, t, i) {
    const s = e?.color ?? A(i);
    return e ? o`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${s}`}
        @click=${() => this.toggleTint(e.id)}
      >
        ${W(t)}
      </button>
    ` : o`
        <div class="avatar" style=${`background:${s}`}>${W(t)}</div>
      `;
  }
  renderPalette(e) {
    return !e || this.tinting !== e.id ? d : o`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${e.color}
          .fallback=${A(e.id)}
          @value-changed=${(t) => this.tint(e, t.detail.value)}
        ></se-color-picker>
      </div>
    `;
  }
  toggleTint(e) {
    this.tinting = this.tinting === e ? void 0 : e;
  }
  async tint(e, t) {
    this.busy = e.id, this.error = void 0;
    try {
      await this.api.updateMember(e.id, { color: t }), this.dirty = !0, await this.load();
    } catch (i) {
      this.error = S(i, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  renderGuests() {
    const e = this.localize, t = this.members.filter((s) => s.user_id === null), i = this.pastMembers.filter(
      (s) => s.user_id === null && !t.some((r) => r.id === s.id)
    );
    return o`
      <div class="section">
        <h3>${e("guests")}</h3>
        <div class="muted">${e("guests_hint")}</div>

        ${t.map(
      (s) => o`
            <div class="row">
              ${this.renderTintable(s, s.name, s.id)}
              <span class="name">${s.name}</span>
              ${this.confirming === s.id ? o`<span class="confirm">${e("confirm_remove")}</span>` : d}
              <button
                class=${`remove ${this.confirming === s.id ? "danger" : ""}`}
                ?disabled=${this.busy !== void 0}
                aria-label=${e("remove_member")}
                @click=${() => this.removeGuest(s)}
              >
                ×
              </button>
            </div>
            ${this.renderPalette(s)}
          `
    )}

        ${i.map(
      (s) => o`
            <div class="row gone">
              <div
                class="avatar"
                style=${`background:${s.color ?? A(s.id)}`}
              >
                ${W(s.name)}
              </div>
              <span class="name">${s.name}</span>
              <se-button
                variant="text"
                ?disabled=${this.busy !== void 0}
                @click=${() => this.restoreGuest(s)}
              >
                ${e("restore_member")}
              </se-button>
            </div>
          `
    )}

        <div class="add">
          <se-field
            .label=${e("member_name")}
            .value=${this.newName}
            placeholder="Clara"
            @value-changed=${(s) => this.newName = s.detail.value}
          ></se-field>
          <se-button
            variant="text"
            ?disabled=${this.busy !== void 0 || this.newName.trim() === ""}
            @click=${this.addGuest}
          >
            ${e("add")}
          </se-button>
        </div>
      </div>
    `;
  }
  memberForUser(e) {
    return this.members.find((t) => t.user_id === e);
  }
  /** The owner stays: the backend refuses to let them out of their group. */
  isOwner(e) {
    return e ? this.memberships.some(
      (t) => t.member_id === e.id && t.left_at === null && t.role === "owner"
    ) : !1;
  }
  async load() {
    this.error = void 0;
    try {
      const [e, t, i, s] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listMemberships(this.groupId)
      ]);
      this.haUsers = e, this.members = t, this.pastMembers = i, this.memberships = s;
    } catch (e) {
      this.error = S(e, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  async toggleAccount(e, t) {
    if (t && this.confirming !== t.id) {
      this.confirming = t.id, this.requestUpdate();
      return;
    }
    this.busy = e.id, this.error = void 0, this.confirming = void 0;
    try {
      t ? await this.api.removeMemberFromGroup(this.groupId, t.id) : await this.api.createMember({
        name: e.name,
        group_id: this.groupId,
        user_id: e.id
      }), this.dirty = !0, await this.load();
    } catch (i) {
      this.error = S(i, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  async removeGuest(e) {
    if (this.confirming !== e.id) {
      this.confirming = e.id;
      return;
    }
    this.busy = e.id, this.error = void 0, this.confirming = void 0;
    try {
      await this.api.removeMemberFromGroup(this.groupId, e.id), this.dirty = !0, await this.load();
    } catch (t) {
      this.error = S(t, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  /** Bring a hidden guest back: they were never deleted, only set aside. */
  async restoreGuest(e) {
    this.busy = e.id, this.error = void 0;
    try {
      await this.api.addMemberToGroup(this.groupId, e.id), this.dirty = !0, await this.load();
    } catch (t) {
      this.error = S(t, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
};
I.styles = [
  z,
  _`
      .section + .section {
        margin-top: 20px;
      }

      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }

      .row + .row {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .row .name {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tag {
        font-size: 11px;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
        padding: 1px 5px;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }

      .add {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin-top: 8px;
      }

      .add se-field {
        flex: 1;
      }

      .tintable {
        border: none;
        cursor: pointer;
        font-family: inherit;
      }

      .palette {
        padding: 4px 0 12px 48px;
      }

      .gone {
        opacity: 0.55;
      }

      .confirm {
        font-size: 12px;
        color: var(--error-color, #db4437);
      }

      .remove.danger {
        color: var(--error-color, #db4437);
        font-weight: 700;
      }

      .remove {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        font-size: 18px;
        cursor: pointer;
        padding: 0 4px;
      }
    `
];
q([
  l({ attribute: !1 })
], I.prototype, "api", 2);
q([
  l({ attribute: !1 })
], I.prototype, "localize", 2);
q([
  l({ type: String })
], I.prototype, "groupId", 2);
q([
  c()
], I.prototype, "haUsers", 2);
q([
  c()
], I.prototype, "members", 2);
q([
  c()
], I.prototype, "memberships", 2);
q([
  c()
], I.prototype, "newName", 2);
q([
  c()
], I.prototype, "loading", 2);
q([
  c()
], I.prototype, "busy", 2);
q([
  c()
], I.prototype, "error", 2);
q([
  c()
], I.prototype, "dirty", 2);
q([
  c()
], I.prototype, "tinting", 2);
q([
  c()
], I.prototype, "confirming", 2);
q([
  c()
], I.prototype, "pastMembers", 2);
I = q([
  y("se-member-dialog")
], I);
var Rs = Object.defineProperty, Us = Object.getOwnPropertyDescriptor, C = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Us(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Rs(t, i, r), r;
};
let x = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.initialKind = "reimbursement", this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.description = "", this.showDescription = !1, this.date = Vt(), this.busy = !1, this.confirmingDelete = !1, this.kind = "reimbursement", this.currency = "", this.rate = null, this.pickCurrency = (e) => {
      this.currency = e.target.value, this.rate = this.currency === this.group.currency ? V : null;
    }, this.handleRate = (e) => {
      this.currency = e.detail.currency, this.rate = e.detail.rate;
    }, this.pickKind = (e) => {
      const t = e.detail.value;
      t !== this.kind && (this.kind = t, [this.fromMember, this.toMember] = [this.toMember, this.fromMember]);
    }, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const e = ve(this.amountInput);
      if (e === null)
        return;
      this.busy = !0, this.error = void 0;
      const t = {
        group_id: this.group.id,
        from_member_id: this.fromMember,
        to_member_id: this.toMember,
        amount: e,
        payment_date: Kt(this.date),
        description: this.description.trim() || null,
        currency: this.currency || this.group.currency,
        kind: this.kind,
        ...this.rate !== null && this.rate !== V ? { exchange_rate: this.rate } : {}
      }, { group_id: i, ...s } = t;
      try {
        const r = this.payment ? await this.api.updatePayment(this.payment.id, s) : await this.api.createPayment(t);
        this.dispatchEvent(
          new CustomEvent("payment-saved", {
            detail: { payment: r },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (r) {
        this.error = S(r, this.localize);
      } finally {
        this.busy = !1;
      }
    }, this.deletePayment = async () => {
      if (this.payment) {
        if (!this.confirmingDelete) {
          this.confirmingDelete = !0;
          return;
        }
        this.busy = !0, this.error = void 0;
        try {
          await this.api.deletePayment(this.payment.id), this.dispatchEvent(
            new CustomEvent("payment-deleted", { bubbles: !0, composed: !0 })
          );
        } catch (e) {
          this.error = S(e, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), this.payment) {
      this.fromMember = this.payment.from_member_id, this.toMember = this.payment.to_member_id, this.amountInput = at(this.payment.amount), this.date = Yt(this.payment.payment_date), this.kind = this.payment.kind, this.currency = this.payment.currency, this.rate = this.payment.exchange_rate, this.description = this.payment.description ?? "", this.showDescription = this.description !== "";
      return;
    }
    if (this.kind = this.initialKind, this.currency = this.group.currency, this.rate = V, this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = at(this.settlement.amount);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const e = this.localize, t = ve(this.amountInput), i = this.members.map((a) => ({ value: a.id, label: a.name })), s = this.kind === "debt", r = this.payment ? e(s ? "edit_debt" : "edit_payment") : e(s ? "new_debt" : "new_payment");
    return o`
      <se-dialog open heading=${r} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : d}

          <se-select
            .label=${e("kind_label")}
            .value=${this.kind}
            .options=${[
      { value: "reimbursement", label: e("kind_reimbursement") },
      { value: "debt", label: e("kind_debt") }
    ]}
            @value-changed=${this.pickKind}
          ></se-select>

          <!--
            The two halves of one sentence, so they sit on one line and read as
            one. The fields swap round, the model does not: a debt names who
            owes first, because that is the sentence; whoever is owed is stored
            as the payer either way, being the one out of pocket.
          -->
          <div class="pair">
            <se-select
              .label=${e(s ? "debt_who_owes" : "from_member")}
              .value=${s ? this.toMember : this.fromMember}
              .options=${i}
              @value-changed=${(a) => s ? this.toMember = a.detail.value : this.fromMember = a.detail.value}
            ></se-select>

            <se-select
              .label=${e(s ? "debt_to_whom" : "to_member")}
              .value=${s ? this.fromMember : this.toMember}
              .options=${i}
              @value-changed=${(a) => s ? this.fromMember = a.detail.value : this.toMember = a.detail.value}
            ></se-select>
          </div>

          <div class="pair">
            <se-field
              .label=${e("amount")}
              .value=${this.amountInput}
              decimal
              required
              @value-changed=${(a) => this.amountInput = a.detail.value}
            >
              <!-- Chosen against the figure it qualifies, as on an expense. -->
              <select
                slot="suffix"
                class="currency"
                .value=${this.currency}
                aria-label=${e("currency_label")}
                @change=${this.pickCurrency}
              >
                ${this.currencies().map(
      (a) => o`
                    <option value=${a} ?selected=${a === this.currency}>
                      ${a}
                    </option>
                  `
    )}
              </select>
            </se-field>

            <se-field
              .label=${e("date")}
              type="date"
              .value=${this.date}
              @value-changed=${(a) => this.date = a.detail.value}
            ></se-field>
          </div>

          <!-- Shows itself only when there is a rate to settle. -->
          <se-currency-field
            .api=${this.api}
            .localize=${this.localize}
            .groupId=${this.group.id}
            .groupCurrency=${this.group.currency}
            .currency=${this.currency}
            .on=${this.date}
            .amount=${t}
            .language=${this.language}
            @rate-changed=${this.handleRate}
          ></se-currency-field>

          ${this.showDescription ? o`
                <se-field
                  .label=${e("description")}
                  .value=${this.description}
                  placeholder=${e("description_placeholder")}
                  @value-changed=${(a) => this.description = a.detail.value}
                ></se-field>
              ` : o`
                <button class="link" @click=${() => this.showDescription = !0}>
                  + ${e("add_description")}
                </button>
              `}

          <!-- Only once there is a past to read: a new one has none. -->
          ${this.payment ? o`
                <se-entity-history
                  .api=${this.api}
                  .localize=${this.localize}
                  .groupId=${this.group.id}
                  .entityId=${this.payment.id}
                  .members=${this.members}
                  .currency=${this.group.currency}
                  .language=${this.language}
                ></se-entity-history>
              ` : d}
        </div>

        ${this.confirmingDelete ? o`<div slot="banner" class="warning">
              ${e(
      this.kind === "debt" ? "confirm_delete_debt" : "confirm_delete_payment"
    )}
            </div>` : d}

        ${this.payment ? o`
              <se-button
                slot="actions"
                variant="danger"
                ?disabled=${this.busy}
                @click=${this.deletePayment}
              >
                ${this.confirmingDelete ? e("confirm_delete") : e("delete")}
              </se-button>
              <span slot="actions" class="spacer"></span>
            ` : d}
        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${e("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || !this.isValid(t)}
          @click=${this.submit}
        >
          ${this.payment ? e("save") : e("create")}
        </se-button>
      </se-dialog>
    `;
  }
  /**
   * Whether the payment can be saved.
   *
   * A foreign currency with no rate cannot: the backend would refuse it, and a
   * button that sends something doomed is worse than one that waits.
   */
  isValid(e) {
    return e !== null && e > 0 && this.rate !== null && this.fromMember !== "" && this.toMember !== "" && this.fromMember !== this.toMember;
  }
  /** Every currency a rate can be had for, and the group's, which may not be. */
  currencies() {
    return [.../* @__PURE__ */ new Set([...mt, this.group.currency, this.currency])].sort();
  }
};
x.styles = z;
C([
  l({ attribute: !1 })
], x.prototype, "api", 2);
C([
  l({ attribute: !1 })
], x.prototype, "localize", 2);
C([
  l({ attribute: !1 })
], x.prototype, "group", 2);
C([
  l({ attribute: !1 })
], x.prototype, "members", 2);
C([
  l({ attribute: !1 })
], x.prototype, "payment", 2);
C([
  l({ attribute: !1 })
], x.prototype, "settlement", 2);
C([
  l({ type: String })
], x.prototype, "initialKind", 2);
C([
  l({ type: String })
], x.prototype, "language", 2);
C([
  c()
], x.prototype, "fromMember", 2);
C([
  c()
], x.prototype, "toMember", 2);
C([
  c()
], x.prototype, "amountInput", 2);
C([
  c()
], x.prototype, "description", 2);
C([
  c()
], x.prototype, "showDescription", 2);
C([
  c()
], x.prototype, "date", 2);
C([
  c()
], x.prototype, "busy", 2);
C([
  c()
], x.prototype, "error", 2);
C([
  c()
], x.prototype, "confirmingDelete", 2);
C([
  c()
], x.prototype, "kind", 2);
C([
  c()
], x.prototype, "currency", 2);
C([
  c()
], x.prototype, "rate", 2);
x = C([
  y("se-payment-dialog")
], x);
var Ns = Object.defineProperty, qs = Object.getOwnPropertyDescriptor, Qt = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? qs(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ns(t, i, r), r;
};
let Ye = class extends g {
  constructor() {
    super(...arguments), this.bars = [];
  }
  render() {
    if (this.bars.length === 0)
      return d;
    const e = Math.max(...this.bars.map((t) => t.value), 0);
    return o`
      ${this.bars.map(
      (t) => o`
          <div class="bar">
            <div class="head">
              <span class="label" title=${t.label}>${t.label}</span>
              <span class="value">${t.text}</span>
            </div>
            <div class="track">
              <div
                class="fill"
                style=${`width:${Bs(t.value, e)}%${t.color ? `;background:${t.color}` : ""}`}
              ></div>
            </div>
          </div>
        `
    )}
    `;
  }
};
Ye.styles = [
  z,
  _`
      :host {
        display: block;
      }

      .bar {
        padding: 8px 16px;
      }

      .head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
        margin-bottom: 4px;
      }

      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .value {
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        white-space: nowrap;
      }

      .track {
        height: 8px;
        border-radius: 4px;
        background: var(--secondary-background-color, #f1f1f1);
        overflow: hidden;
      }

      .fill {
        height: 100%;
        border-radius: 4px;
        background: var(--primary-color, #03a9f4);
        /* A bar of nothing still shows as a sliver rather than vanishing. */
        min-width: 2px;
      }
    `
];
Qt([
  l({ attribute: !1 })
], Ye.prototype, "bars", 2);
Ye = Qt([
  y("se-bar-chart")
], Ye);
function Bs(e, t) {
  return t <= 0 ? 0 : e / t * 100;
}
var Gs = Object.defineProperty, Ls = Object.getOwnPropertyDescriptor, ei = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ls(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Gs(t, i, r), r;
};
const Oe = 160, Ue = 70, Ce = Oe / 2, Hs = Math.PI * 2;
let Ze = class extends g {
  constructor() {
    super(...arguments), this.slices = [];
  }
  render() {
    const e = this.slices.filter((i) => i.value > 0), t = e.reduce((i, s) => i + s.value, 0);
    return t <= 0 ? d : o`
      <div class="chart">
        <svg viewBox="0 0 ${Oe} ${Oe}" width=${Oe} height=${Oe} role="img">
          ${this.renderWedges(e, t)}
        </svg>
        <div class="legend">
          ${e.map(
      (i) => o`
              <div class="entry">
                <span
                  class="dot"
                  style=${`background:${i.color ?? A(i.key)}`}
                ></span>
                <span class="label" title=${i.label}>${i.label}</span>
                <span class="value">${i.text}</span>
                <span class="share">${Ws(i.value, t)}</span>
              </div>
            `
    )}
        </div>
      </div>
    `;
  }
  renderWedges(e, t) {
    if (e.length === 1) {
      const s = e[0];
      return Pt`
        <circle
          cx=${Ce}
          cy=${Ce}
          r=${Ue}
          fill=${s.color ?? A(s.key)}
        ></circle>
      `;
    }
    let i = 0;
    return e.map((s) => {
      const r = s.value / t * Hs, a = Fs(i, i + r);
      return i += r, Pt`<path d=${a} fill=${s.color ?? A(s.key)}></path>`;
    });
  }
};
Ze.styles = [
  z,
  _`
      :host {
        display: block;
        padding: 8px 16px 16px;
      }

      .chart {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        justify-content: center;
      }

      svg {
        flex: 0 0 auto;
      }

      .legend {
        flex: 1;
        min-width: 160px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .entry {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        flex: 0 0 auto;
      }

      .label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .value {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      .share {
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        min-width: 40px;
        text-align: right;
      }
    `
];
ei([
  l({ attribute: !1 })
], Ze.prototype, "slices", 2);
Ze = ei([
  y("se-pie-chart")
], Ze);
function Fs(e, t) {
  const [i, s] = Nt(e), [r, a] = Nt(t), n = t - e > Math.PI ? 1 : 0;
  return `M ${Ce} ${Ce} L ${i} ${s} A ${Ue} ${Ue} 0 ${n} 1 ${r} ${a} Z`;
}
function Nt(e) {
  const t = e - Math.PI / 2;
  return [
    Ce + Ue * Math.cos(t),
    Ce + Ue * Math.sin(t)
  ];
}
function Ws(e, t) {
  const i = e / t * 100;
  return `${i >= 10 ? Math.round(i) : i.toFixed(1)} %`;
}
var Vs = Object.defineProperty, Ks = Object.getOwnPropertyDescriptor, X = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ks(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Vs(t, i, r), r;
};
const He = "all";
let B = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.currency = "EUR", this.language = "en", this.period = He;
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const e = this.localize;
    return this.error ? o`<div class="error">${this.error}</div>` : this.result ? this.result.years.length === 0 ? o`<div class="card">
        <div class="empty">${e("no_expenses")}</div>
      </div>` : o`
      <div class="card">
        ${this.renderPeriod()} ${this.renderTotals()}
      </div>

      ${this.renderCategories()}
      ${this.renderCard("by_month", this.monthBars())}
      ${this.renderMembers()}
    ` : o`<div class="card"><div class="empty">${e("loading")}</div></div>`;
  }
  renderPeriod() {
    const e = this.localize;
    return o`
      <div class="period">
        <button
          aria-pressed=${this.period === He}
          @click=${() => this.pick(He)}
        >
          ${e("period_all")}
        </button>
        ${this.result.years.map(
      (t) => o`
            <button
              aria-pressed=${this.period === String(t)}
              @click=${() => this.pick(String(t))}
            >
              ${t}
            </button>
          `
    )}
      </div>
    `;
  }
  renderTotals() {
    const e = this.localize, t = this.result.by_member.find((i) => i.member_id === this.meId);
    return o`
      <div class="totals">
        <div class="total">
          <div class="muted">${e("total_spent")}</div>
          <div class="figure">${this.money(this.result.total)}</div>
        </div>
        ${t ? o`
              <div class="total">
                <div class="muted">${e("your_share")}</div>
                <div class="figure">${this.money(t.share)}</div>
              </div>
            ` : d}
      </div>
    `;
  }
  /**
   * Where the money went, as a whole cut up.
   *
   * A pie, because that is the question a breakdown by category asks: what
   * share of the month was food? Months get bars instead — a run of months is
   * read as time, and time is not a thing you cut into wedges.
   */
  renderCategories() {
    const e = this.categorySlices();
    return e.length === 0 ? d : o`
      <div class="card">
        <h3 class="section-title">${this.localize("by_category")}</h3>
        <se-pie-chart .slices=${e}></se-pie-chart>
      </div>
    `;
  }
  renderCard(e, t) {
    return t.length === 0 ? d : o`
      <div class="card">
        <h3 class="section-title">${this.localize(e)}</h3>
        <se-bar-chart .bars=${t}></se-bar-chart>
      </div>
    `;
  }
  /**
   * Who paid, against who consumed.
   *
   * Two figures rather than one: paying is not consuming, and the whole point
   * of the app is that the two differ. Their gap is the balance.
   */
  renderMembers() {
    const e = this.localize, t = this.result.by_member;
    return t.length === 0 ? d : o`
      <div class="card">
        <h3 class="section-title">${e("by_member")}</h3>
        ${t.map((i) => {
      const s = this.members.find((a) => a.id === i.member_id), r = s?.name ?? "?";
      return o`
            <div class="member">
              <div
                class="avatar"
                style=${`background:${s?.color ?? A(i.member_id)}`}
              >
                ${W(r)}
              </div>
              <span class="name">${r}</span>
              <div class="figures">
                <div>
                  ${e("paid_total")} <strong>${this.money(i.paid)}</strong>
                </div>
                <div class="muted">
                  ${e("consumed")} <strong>${this.money(i.share)}</strong>
                </div>
              </div>
            </div>
          `;
    })}
      </div>
    `;
  }
  categorySlices() {
    return this.result.by_category.map((e) => {
      const t = this.categories.find((i) => i.id === e.category_id);
      return {
        key: e.category_id ?? "none",
        label: t?.name ?? this.localize("no_category"),
        value: e.total,
        text: this.money(e.total),
        color: t?.color ?? void 0
      };
    });
  }
  monthBars() {
    return this.result.by_month.map((e) => ({
      key: e.month,
      label: Vi(e.month, this.language),
      value: e.total,
      text: this.money(e.total)
    }));
  }
  money(e) {
    return j(e, this.currency, this.language);
  }
  pick(e) {
    e !== this.period && (this.period = e, this.load());
  }
  async load() {
    this.error = void 0;
    try {
      this.result = await this.api.getStatistics(
        this.groupId,
        this.period === He ? null : Number(this.period)
      );
    } catch (e) {
      this.error = S(e, this.localize);
    }
  }
};
B.styles = [
  z,
  _`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--se-gap);
      }

      .totals {
        display: flex;
        gap: 12px;
        padding: 16px;
      }

      .total {
        flex: 1;
        min-width: 0;
      }

      .total .figure {
        font-size: 22px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
      }

      .period {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 16px;
      }

      .period button {
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: none;
        color: var(--secondary-text-color);
        border-radius: 16px;
        padding: 6px 14px;
        font-size: 13px;
        font-family: inherit;
        cursor: pointer;
        white-space: nowrap;
      }

      .period button[aria-pressed="true"] {
        background: var(--primary-color, #03a9f4);
        border-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }

      .member {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
      }

      .member + .member {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .member .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 15px;
      }

      .member .figures {
        text-align: right;
        font-size: 13px;
        white-space: nowrap;
      }

      .member .figures strong {
        font-variant-numeric: tabular-nums;
      }
    `
];
X([
  l({ attribute: !1 })
], B.prototype, "api", 2);
X([
  l({ attribute: !1 })
], B.prototype, "localize", 2);
X([
  l({ type: String })
], B.prototype, "groupId", 2);
X([
  l({ attribute: !1 })
], B.prototype, "members", 2);
X([
  l({ attribute: !1 })
], B.prototype, "categories", 2);
X([
  l({ type: String })
], B.prototype, "meId", 2);
X([
  l({ type: String })
], B.prototype, "currency", 2);
X([
  l({ type: String })
], B.prototype, "language", 2);
X([
  c()
], B.prototype, "result", 2);
X([
  c()
], B.prototype, "period", 2);
X([
  c()
], B.prototype, "error", 2);
B = X([
  y("se-statistics")
], B);
var Ys = Object.defineProperty, Zs = Object.getOwnPropertyDescriptor, me = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Zs(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Ys(t, i, r), r;
};
let se = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.close = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    };
  }
  render() {
    const e = this.localize;
    return o`
      <se-dialog open heading=${e("statistics")} @dialog-closed=${this.close}>
        <se-statistics
          .api=${this.api}
          .localize=${this.localize}
          .groupId=${this.group.id}
          .members=${this.members}
          .categories=${this.categories}
          .meId=${this.meId}
          .currency=${this.group.currency}
          .language=${this.language}
        ></se-statistics>

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${e("close")}
        </se-button>
      </se-dialog>
    `;
  }
};
se.styles = z;
me([
  l({ attribute: !1 })
], se.prototype, "api", 2);
me([
  l({ attribute: !1 })
], se.prototype, "localize", 2);
me([
  l({ attribute: !1 })
], se.prototype, "group", 2);
me([
  l({ attribute: !1 })
], se.prototype, "members", 2);
me([
  l({ attribute: !1 })
], se.prototype, "categories", 2);
me([
  l({ type: String })
], se.prototype, "meId", 2);
me([
  l({ type: String })
], se.prototype, "language", 2);
se = me([
  y("se-statistics-dialog")
], se);
var Xs = Object.defineProperty, Js = Object.getOwnPropertyDescriptor, $ = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Js(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && Xs(t, i, r), r;
};
let b = class extends g {
  constructor() {
    super(...arguments), this.language = "en", this.userId = null, this.groups = [], this.members = [], this.pastMembers = [], this.categories = [], this.expenses = [], this.payments = [], this.query = "", this.loading = !0, this.addingPayment = !1, this.draggedAway = !1, this.busy = !1, this.confirmingDelete = !1, this.deleteGroup = async () => {
      if (!this.confirmingDelete) {
        this.confirmingDelete = !0;
        return;
      }
      this.busy = !0;
      try {
        await this.api.deleteGroup(this.groupId), this.menu = void 0, this.goBack();
      } catch (e) {
        this.error = S(e, this.localize), this.confirmingDelete = !1;
      } finally {
        this.busy = !1;
      }
    }, this.fabDown = (e) => {
      e.target.setPointerCapture(e.pointerId), this.fabFrom = { x: e.clientX, y: e.clientY }, this.addingPayment = !1;
    }, this.fabMove = (e) => {
      if (!this.fabFrom)
        return;
      const t = e.clientX - this.fabFrom.x, i = e.clientY - this.fabFrom.y;
      this.addingPayment = i < -40 || t < -40;
    }, this.fabUp = () => {
      if (!this.fabFrom)
        return;
      const e = this.addingPayment;
      this.fabFrom = void 0, this.addingPayment = !1, e && (this.draggedAway = !0, this.openPayment());
    }, this.fabCancel = () => {
      this.fabFrom = void 0, this.addingPayment = !1;
    }, this.fabClick = () => {
      if (this.draggedAway) {
        this.draggedAway = !1;
        return;
      }
      this.openExpense();
    }, this.settleUp = (e) => {
      this.openPayment(e.detail.settlement);
    }, this.openFromHistory = (e) => {
      const { entityType: t, entityId: i } = e.detail;
      if (t === "expense") {
        const r = this.expenses.find((a) => a.id === i);
        r && this.openExpense(r);
        return;
      }
      const s = this.payments.find((r) => r.id === i);
      s && this.openPayment(void 0, s);
    }, this.closeDialog = () => {
      this.dialog = void 0, this.prefill = void 0, this.editedExpense = void 0, this.editedPayment = void 0;
    }, this.handleChanged = () => {
      this.closeDialog(), this.load();
    }, this.toggleArchive = async () => {
      if (this.group) {
        this.busy = !0, this.error = void 0;
        try {
          this.group = await this.api.archiveGroup(this.group.id, !this.group.archived), this.menu = void 0;
        } catch (e) {
          this.error = S(e, this.localize);
        } finally {
          this.busy = !1;
        }
      }
    }, this.goBack = () => {
      this.dispatchEvent(new CustomEvent("navigate-back", { bubbles: !0, composed: !0 }));
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const e = this.localize;
    return this.loading || !this.group ? o`
        <div class="empty">${this.error ?? e("loading")}</div>
      ` : o`
      ${this.renderHeader()}

      <div class="page">
        <div class="stack">
          ${this.group.archived ? o`<div class="banner">${e("archived_hint")}</div>` : d}

          ${this.error ? o`<div class="error">${this.error}</div>` : d}

          ${this.renderHome()}
        </div>
      </div>

      ${this.addingPayment ? o`<div class="fab-hint">${e("new_payment")}</div>` : d}
      <button
        class=${`fab ${this.addingPayment ? "reimbursing" : ""}`}
        aria-label=${e("action_add_expense")}
        title=${e("fab_hint")}
        @click=${this.fabClick}
        @pointerdown=${this.fabDown}
        @pointermove=${this.fabMove}
        @pointerup=${this.fabUp}
        @pointercancel=${this.fabCancel}
      >
        <se-icon
          plain
          .icon=${this.addingPayment ? "mdi:swap-horizontal" : "mdi:plus"}
          fallback=${this.addingPayment ? "⇄" : "+"}
          .size=${26}
        ></se-icon>
      </button>

      ${this.renderDialog()}
    `;
  }
  renderHeader() {
    const e = this.localize, t = this.group;
    return o`
      <div class="toolbar">
        <div class="header">
          <se-menu-button></se-menu-button>

        <div class="titles">
          <h1>${e("app_title")}</h1>
          <button class="switcher" @click=${() => this.openMenu("groups")}>
            <span class="current">${t.name}</span>
            <span class="caret">⌄</span>
            ${t.archived ? o`<span class="archived-tag">${e("archived")}</span>` : d}
          </button>
        </div>

        <button
          class="icon"
          aria-label=${e("more")}
          @click=${() => this.openMenu("more")}
        >
          <se-icon plain .icon=${"mdi:dots-vertical"} fallback="⋮" .size=${22}></se-icon>
        </button>

        </div>
      </div>
      ${this.menu ? this.renderMenu() : d}
    `;
  }
  renderMenu() {
    return o`
      <div class="scrim" @click=${() => this.menu = void 0}></div>
      <div class="menu" role="menu">
        ${this.menu === "groups" ? this.renderGroupMenu() : this.renderMoreMenu()}
      </div>
    `;
  }
  renderGroupMenu() {
    return o`
      ${this.groups.map(
      (e) => o`
          <button
            role="menuitem"
            class=${e.id === this.groupId ? "current-item" : ""}
            @click=${() => this.switchTo(e)}
          >
            ${e.name}
            ${e.archived ? o`<span class="archived-tag">${this.localize("archived")}</span>` : d}
          </button>
        `
    )}
      <button role="menuitem" class="separated" @click=${this.goBack}>
        ${this.localize("all_groups")}
      </button>
    `;
  }
  renderMoreMenu() {
    const e = this.localize;
    return o`
      <button role="menuitem" @click=${() => this.openDialog("group")}>
        ${e("edit_group")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("member")}>
        ${e("members")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("categories")}>
        ${e("categories")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("statistics")}>
        ${e("statistics")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("history")}>
        ${e("group_history")}
      </button>
      <button
        role="menuitem"
        class="separated"
        ?disabled=${this.busy}
        @click=${this.toggleArchive}
      >
        ${this.group.archived ? e("restore") : e("archive")}
      </button>
      <button
        role="menuitem"
        class="danger separated"
        ?disabled=${this.busy}
        @click=${this.deleteGroup}
      >
        ${this.confirmingDelete ? e("confirm_delete") : e("delete_group")}
      </button>
    `;
  }
  openDialog(e) {
    this.menu = void 0, this.dialog = e;
  }
  openMenu(e) {
    this.menu = this.menu === e ? void 0 : e, this.confirmingDelete = !1;
  }
  switchTo(e) {
    this.menu = void 0, e.id !== this.groupId && this.dispatchEvent(
      new CustomEvent("group-selected", {
        detail: { groupId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /**
   * The group, on one page: what is owed, then everything that happened.
   *
   * Expenses and reimbursements were on separate tabs, so a debt and the
   * payment clearing it never met, and the overview was a third view showing a
   * truncated copy of both. One list, scrolling with the page.
   */
  renderHome() {
    return o`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.result?.balances ?? []}
        .settlements=${this.result?.settlements ?? []}
        .members=${this.pastMembers}
        .meId=${this.meId()}
        .currency=${this.group.currency}
        .language=${this.language}
        @settle-up=${this.settleUp}
      ></se-balance-card>

      ${this.renderSearch()} ${this.renderActivityCard()}
    `;
  }
  /**
   * Always there.
   *
   * It used to appear only past a few entries, on the grounds that a short list
   * reads at a glance — which is true, and beside the point: a control that
   * comes and goes on its own is read as a bug, and a new group is exactly when
   * you have not yet learnt where things are.
   */
  renderSearch() {
    return o`
      <se-field
        .value=${this.query}
        .label=${""}
        placeholder=${this.localize("search")}
        @value-changed=${(e) => this.query = e.detail.value}
      ></se-field>
    `;
  }
  renderActivityCard() {
    const e = this.matching();
    return e.length === 0 ? o`
        <div class="card">
          <div class="empty">
            ${this.query.trim() ? this.localize("no_match") : this.localize("no_activity")}
          </div>
        </div>
      ` : o`
      <div class="card">
        ${e.map(
      (t) => t.kind === "expense" ? this.renderExpense(t.expense) : this.renderPayment(t.payment)
    )}
      </div>
    `;
  }
  /**
   * Everything that moved money, newest first.
   *
   * Expenses and payments are two halves of the same story: seeing them apart
   * means never knowing whether a debt was already settled.
   */
  activity() {
    return [
      ...this.expenses.map(
        (t) => ({
          kind: "expense",
          at: t.expense_date,
          addedAt: t.created_at,
          expense: t
        })
      ),
      ...this.payments.map(
        (t) => ({
          kind: "payment",
          at: t.payment_date,
          addedAt: t.created_at,
          payment: t
        })
      )
    ].sort(
      (t, i) => i.at.localeCompare(t.at) || i.addedAt.localeCompare(t.addedAt)
    );
  }
  /**
   * A payment, said the way its kind reads.
   *
   * The two are one movement of money and differ only in words, so the words
   * are the whole job here: a debt shown as "Dupont → Michel" reads as Dupont
   * having paid, which is true of a loan and nonsense for a debt somebody is
   * only writing down.
   */
  renderPayment(e) {
    const t = this.memberById(e.from_member_id), i = this.memberById(e.to_member_id), s = e.kind === "debt", r = s ? i : t, a = s ? e.to_member_id : e.from_member_id, n = r?.color ?? A(a);
    return o`
      <button
        class="item item-button"
        style=${`border-left-color:${n}`}
        @click=${() => this.openPayment(void 0, e)}
      >
        <se-icon
          icon=${s ? "mdi:hand-coin-outline" : "mdi:swap-horizontal"}
          fallback=${s ? "→" : "⇄"}
          .color=${n}
          .size=${40}
        ></se-icon>
        <div class="info">
          <!--
            The arrow points at whoever ends up with the money, and it points
            that way on both: a reimbursement has sent it, a debt owes it.
            Which is why the names swap round — on a debt the one who will pay
            is the one who owes, and that is the member on the receiving end of
            the stored payment. The icon and the colour say which is which.
          -->
          <div class="title">
            ${s ? o`${i?.name ?? "?"} → ${t?.name ?? "?"}` : o`${t?.name ?? "?"} → ${i?.name ?? "?"}`}
          </div>
          <!--
            Where an expense shows its category: same grid, same reading. What
            somebody wrote about it wins the line — "Dette" is already said by
            the icon and the colour, and a note is only ever there because it
            said something they were not.
          -->
          <div class="muted">
            ${e.description || this.localize(s ? "a_debt" : "a_settlement")}
          </div>
          <div class="muted">
            ${Re(e.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <!--
            Red on a debt, the colour money owed already wears on the balance
            card. A reimbursement stays quiet: it is money that has landed,
            and nothing about it is outstanding.
          -->
          <span class="amount ${s ? "negative" : "settled-amount"}">
            ${j(e.amount, e.currency, this.language)}
          </span>
          <!-- What it weighs in the group, exactly as on an expense. -->
          ${e.currency === this.group.currency ? d : o`<span class="converted">
                ${j(
      e.converted_amount,
      this.group.currency,
      this.language
    )}
              </span>`}
        </div>
      </button>
    `;
  }
  renderExpense(e) {
    const t = this.memberById(e.paid_by_member_id), i = this.categories.find((s) => s.id === e.category_id);
    return o`
      <button
        class="item item-button"
        style=${`border-left-color:${t?.color ?? A(e.paid_by_member_id)}`}
        @click=${() => this.openExpense(e)}
      >
        ${this.renderAvatar(
      t?.name ?? "?",
      e.paid_by_member_id,
      `${this.localize("paid_by")} ${t?.name ?? "?"}`
    )}
        <div class="info">
          <div class="title">
            ${e.title}
            ${e.description ? o`<span class="note">${e.description}</span>` : d}
          </div>
          <!--
            Nothing where there is no category. "No category" is a fact about
            the form, not about the shop: it named an absence, on every row that
            had one, and said nothing anybody needed.
          -->
          ${i ? o`<div class="muted">${i.name}</div>` : d}
          <div class="muted">
            ${Re(e.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${j(e.amount, e.currency, this.language)}
          </span>
          <!--
            What it weighs in the group, under what was handed over at the till.
            Both, because both are true and neither answers the other: 100 USD
            is what was paid, 87,68 EUR is what it costs whoever shares it.
          -->
          ${e.currency === this.group.currency ? d : o`<span class="converted">
                ${j(
      e.converted_amount,
      this.group.currency,
      this.language
    )}
              </span>`}
          ${this.renderParticipants(e)}
        </div>
      </button>
    `;
  }
  /** The members actually sharing the expense, stacked like on a receipt. */
  renderParticipants(e) {
    const t = (e.shares ?? []).filter((i) => i.amount !== 0);
    return t.length === 0 ? d : o`
      <div class="stack-avatars">
        ${t.map((i) => {
      const s = this.memberById(i.member_id);
      return o`
            <div
              class="avatar small"
              title=${s?.name ?? "?"}
              style=${`background:${s?.color ?? A(i.member_id)}`}
            >
              ${W(s?.name ?? "?")}
            </div>
          `;
    })}
      </div>
    `;
  }
  /**
   * A member as a coloured initial.
   *
   * `hint` names what the avatar stands for: on an expense row the one on the
   * left is the payer and the ones on the right are who shares it, which the
   * circles alone do not say.
   */
  renderAvatar(e, t, i) {
    const s = this.memberById(t);
    return o`
      <div
        class="avatar"
        title=${i ?? e}
        style=${`background:${s?.color ?? A(t)}`}
      >
        ${W(e)}
      </div>
    `;
  }
  renderDialog() {
    return !this.dialog || !this.group ? d : this.dialog === "expense" ? o`
        <se-expense-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.membersFor(this.editedExpense)}
          .categories=${this.categories}
          .expense=${this.editedExpense}
          .meId=${this.meId()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @expense-saved=${this.handleChanged}
          @expense-deleted=${this.handleChanged}
        ></se-expense-dialog>
      ` : this.dialog === "payment" ? o`
        <se-payment-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.membersForPayment(this.editedPayment)}
          .payment=${this.editedPayment}
          .settlement=${this.prefill}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @payment-saved=${this.handleChanged}
          @payment-deleted=${this.handleChanged}
        ></se-payment-dialog>
      ` : this.dialog === "statistics" ? o`
        <se-statistics-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.pastMembers}
          .categories=${this.categories}
          .meId=${this.meId()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
        ></se-statistics-dialog>
      ` : this.dialog === "history" ? o`
        <se-history-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.pastMembers}
          .categories=${this.categories}
          .openable=${this.openable()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @revision-picked=${this.openFromHistory}
        ></se-history-dialog>
      ` : this.dialog === "group" ? o`
        <se-group-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          @dialog-cancelled=${this.closeDialog}
          @group-saved=${this.handleChanged}
        ></se-group-dialog>
      ` : this.dialog === "categories" ? o`
        <se-categories-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @categories-changed=${this.handleChanged}
        ></se-categories-dialog>
      ` : o`
      <se-member-dialog
        .api=${this.api}
        .localize=${this.localize}
        .groupId=${this.groupId}
        @dialog-cancelled=${this.closeDialog}
        @members-changed=${this.handleChanged}
      ></se-member-dialog>
    `;
  }
  /** Looks among past members too: an old expense still needs a name on it. */
  memberById(e) {
    return this.pastMembers.find((t) => t.id === e);
  }
  /**
   * Which member of this group you are, if any.
   *
   * Nobody, when the panel is open on an account no member is tied to — a
   * shared tablet in the kitchen, an admin looking at someone else's group.
   */
  meId() {
    return this.userId ? this.members.find((e) => e.user_id === this.userId)?.id ?? null : null;
  }
  /**
   * Who the expense dialog may offer.
   *
   * The active members, plus anyone this very expense already involves. Someone
   * removed from the group must not be pickable for something new, but an
   * expense they paid still has to show them as its payer: dropping them would
   * silently reassign it on the next save.
   */
  membersFor(e) {
    return e ? this.plusGone([
      e.paid_by_member_id,
      ...(e.shares ?? []).map((t) => t.member_id)
    ]) : this.members;
  }
  /**
   * Who the payment dialog may offer.
   *
   * Anyone still owing or owed comes along, active or not. Leaving a group does
   * not clear a debt: the balances count those who left, and a settlement they
   * owe would be impossible to record if they could not be picked. Someone gone
   * and square is left out — that is over, and the list is not a graveyard.
   *
   * Editing an existing payment offers whoever it already names, whatever their
   * balance: dropping them would silently reassign the payment on the next save.
   */
  membersForPayment(e) {
    if (e)
      return this.plusGone([e.from_member_id, e.to_member_id]);
    const t = (this.result?.balances ?? []).filter((i) => i.amount !== 0).map((i) => i.member_id);
    return this.plusGone(t);
  }
  plusGone(e) {
    const t = new Set(e), i = this.pastMembers.filter(
      (s) => t.has(s.id) && !this.members.some((r) => r.id === s.id)
    );
    return [...this.members, ...i];
  }
  async load() {
    this.error = void 0;
    try {
      const [
        e,
        t,
        i,
        s,
        r,
        a,
        n,
        h
      ] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listGroups(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.listPayments(this.groupId),
        this.api.getBalances(this.groupId)
      ]);
      this.group = e, this.groups = t, this.members = i, this.pastMembers = s, this.categories = r, this.expenses = a, this.payments = n, this.result = h;
    } catch (e) {
      this.error = S(e, this.localize), e?.code === "group_not_found" && this.dispatchEvent(
        new CustomEvent("group-unavailable", { bubbles: !0, composed: !0 })
      );
    } finally {
      this.loading = !1;
    }
  }
  /**
   * The activity, filtered by what is typed.
   *
   * Matched on everything a row shows — title, description, category, the
   * people — because that is what someone types: they look for "carrefour",
   * "antonin" or "essence" without thinking about which field it is.
   *
   * The balance above never moves with it: it is the group's, not the list's,
   * and a total that shrank as you typed would be a lie.
   */
  matching() {
    const e = this.query.trim().toLowerCase(), t = this.activity();
    return e ? t.filter((i) => this.haystack(i).includes(e)) : t;
  }
  haystack(e) {
    const t = (r) => this.memberById(r)?.name ?? "";
    if (e.kind === "payment")
      return [
        this.localize("a_settlement"),
        e.payment.description ?? "",
        t(e.payment.from_member_id),
        t(e.payment.to_member_id)
      ].join(" ").toLowerCase();
    const i = e.expense, s = this.categories.find((r) => r.id === i.category_id);
    return [
      i.title,
      i.description ?? "",
      s?.name ?? "",
      t(i.paid_by_member_id)
    ].join(" ").toLowerCase();
  }
  /** What the journal can still send you to: everything not deleted. */
  openable() {
    return /* @__PURE__ */ new Set([
      ...this.expenses.map((e) => e.id),
      ...this.payments.map((e) => e.id)
    ]);
  }
  /** A suggested settlement to record, or a recorded payment to correct. */
  openPayment(e, t) {
    this.prefill = e, this.editedPayment = t, this.dialog = "payment";
  }
  openExpense(e) {
    this.editedExpense = e, this.dialog = "expense";
  }
};
b.styles = [
  z,
  _`
      :host {
        display: block;
        position: relative;
      }

      /*
       * The banner every other Home Assistant panel wears. Its colours come
       * from the theme: hard-coding a grey would look wrong the moment someone
       * picks a theme that is not the default.
       */
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 3;
      }

      .page {
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 720px;
        margin: 0 auto;
        padding: 8px 16px;
        min-height: 64px;
        box-sizing: border-box;
      }

      /*
       * A row, with whose money left drawn down its side.
       *
       * The avatar already carries the colour, but it is a 36px circle among
       * others: the list reads as a run of rows, not as a run of people. A rule
       * the height of the row groups them at a glance, without adding a word to
       * a line that has three already.
       *
       * The colour is never the only thing saying it — the avatar and its
       * tooltip stay, which matters to anyone who reads colour poorly.
       */
      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px 14px 12px;
        border-left: 4px solid transparent;
      }

      .item + .item {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .item .info {
        flex: 1;
        min-width: 0;
      }

      .item .title {
        font-size: 15px;
        font-weight: 500;
      }

      .converted {
        display: block;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      /*
       * A row you can press. Only the button's own borders go: a blanket
       * "border: none" would take the payer's colour with them, .item carrying
       * it as a border and this rule coming after.
       */
      .item-button {
        border-top: none;
        border-right: none;
        border-bottom: none;
        background: none;
        color: inherit;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
      }

      .item-button:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .chevron {
        color: var(--secondary-text-color);
      }

      .titles {
        flex: 1;
        min-width: 0;
      }

      .titles h1 {
        font-size: 18px;
      }

      .switcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 2px 0 0;
        cursor: pointer;
        color: inherit;
        opacity: 0.85;
        font-family: inherit;
        font-size: 15px;
        max-width: 100%;
      }

      .switcher .current {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .switcher .caret {
        font-size: 12px;
      }

      .icon {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .icon:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      /* Within thumb reach, where Home Assistant puts its own add buttons. */
      .fab {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2;
        width: 56px;
        height: 56px;
        border: none;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.12s ease, background 0.12s ease;
        /*
         * The drag is the button's own: without this the browser would scroll
         * the page under the finger and cancel the pointer, and the plus would
         * only ever add an expense.
         */
        touch-action: none;
      }

      /* Dragged: it says what it would do now, before the finger lifts. */
      .fab.reimbursing {
        background: var(--se-positive);
        transform: scale(1.08);
      }

      .fab-hint {
        position: fixed;
        right: 20px;
        bottom: 88px;
        z-index: 2;
        padding: 8px 14px;
        border-radius: 16px;
        background: var(--se-positive);
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        /* Never under the finger that is dragging past it. */
        pointer-events: none;
      }

      .fab:hover {
        transform: scale(1.06);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 4;
      }

      /*
       * Under the toolbar it belongs to, wherever the page has been scrolled.
       *
       * Fixed, not absolute: absolute pinned it 64px from the top of the host,
       * which is as tall as the whole page — so once you had scrolled down, the
       * menu opened somewhere above the screen and never showed. The toolbar it
       * hangs from is sticky and always there, so this hangs from the viewport
       * too.
       */
      .menu {
        position: fixed;
        z-index: 5;
        top: 64px;
        left: 16px;
        right: 16px;
        max-width: 320px;
        max-height: calc(100dvh - 96px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
      }

      .menu button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        text-align: left;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 14px;
      }

      .menu button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .menu button:hover {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .menu .current-item {
        font-weight: 600;
        color: var(--primary-color, #03a9f4);
      }

      .menu .separated {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        margin-top: 4px;
        padding-top: 12px;
      }

      .menu .danger {
        color: var(--error-color, #db4437);
      }

      .section-title {
        padding: 12px 16px 4px;
      }

      .archived-tag {
        font-size: 11px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
        padding: 1px 5px;
      }

      .banner {
        background: var(--secondary-background-color, #f1f1f1);
        color: var(--secondary-text-color);
        border-radius: var(--se-radius);
        padding: 12px 16px;
        font-size: 13px;
      }

      .settled-amount {
        color: var(--se-positive);
      }

      .note {
        font-size: 12px;
        font-weight: 400;
        color: var(--secondary-text-color);
        margin-left: 6px;
      }

      .tail {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }

      .stack-avatars {
        display: flex;
      }

      .stack-avatars .avatar.small {
        width: 26px;
        height: 26px;
        font-size: 10px;
        border: 2px solid var(--card-background-color, #fff);
      }

      .stack-avatars .avatar.small + .avatar.small {
        margin-left: -8px;
      }
    `
];
$([
  l({ attribute: !1 })
], b.prototype, "api", 2);
$([
  l({ attribute: !1 })
], b.prototype, "localize", 2);
$([
  l({ type: String })
], b.prototype, "groupId", 2);
$([
  l({ type: String })
], b.prototype, "language", 2);
$([
  l({ type: String })
], b.prototype, "userId", 2);
$([
  c()
], b.prototype, "group", 2);
$([
  c()
], b.prototype, "groups", 2);
$([
  c()
], b.prototype, "menu", 2);
$([
  c()
], b.prototype, "members", 2);
$([
  c()
], b.prototype, "pastMembers", 2);
$([
  c()
], b.prototype, "categories", 2);
$([
  c()
], b.prototype, "expenses", 2);
$([
  c()
], b.prototype, "payments", 2);
$([
  c()
], b.prototype, "result", 2);
$([
  c()
], b.prototype, "query", 2);
$([
  c()
], b.prototype, "loading", 2);
$([
  c()
], b.prototype, "error", 2);
$([
  c()
], b.prototype, "dialog", 2);
$([
  c()
], b.prototype, "prefill", 2);
$([
  c()
], b.prototype, "editedExpense", 2);
$([
  c()
], b.prototype, "editedPayment", 2);
$([
  c()
], b.prototype, "addingPayment", 2);
$([
  c()
], b.prototype, "busy", 2);
$([
  c()
], b.prototype, "confirmingDelete", 2);
b = $([
  y("se-group-page")
], b);
class Qs {
  constructor(t) {
    this.hass = t;
  }
  // Groups
  listGroups(t = !0) {
    return this.call("list_groups", { include_archived: t });
  }
  getGroup(t) {
    return this.call("get_group", { group_id: t });
  }
  createGroup(t) {
    return this.call("create_group", t);
  }
  updateGroup(t, i) {
    return this.call("update_group", { group_id: t, ...i });
  }
  archiveGroup(t, i) {
    return this.call("archive_group", { group_id: t, archived: i });
  }
  deleteGroup(t) {
    return this.call("delete_group", { group_id: t });
  }
  getBalances(t) {
    return this.call("get_balances", { group_id: t });
  }
  // Members
  /** The Home Assistant accounts a group can be built from. */
  listHaUsers() {
    return this.call("list_ha_users");
  }
  // `groupId` is required: the backend refuses to list every member of the
  // house, as that would leak the people of groups you have nothing to do with.
  listMembers(t, i = !1) {
    return this.call("list_members", {
      group_id: t,
      include_left: i
    });
  }
  listMemberships(t) {
    return this.call("list_memberships", { group_id: t });
  }
  createMember(t) {
    return this.call("create_member", t);
  }
  updateMember(t, i) {
    return this.call("update_member", { member_id: t, ...i });
  }
  /** Put an existing member back into a group they had left. */
  addMemberToGroup(t, i, s) {
    return this.call("add_member_to_group", {
      group_id: t,
      member_id: i,
      ...s ? { role: s } : {}
    });
  }
  removeMemberFromGroup(t, i) {
    return this.call("remove_member_from_group", {
      group_id: t,
      member_id: i
    });
  }
  // Categories
  listCategories(t) {
    return this.call("list_categories", { group_id: t });
  }
  createCategory(t) {
    return this.call("create_category", t);
  }
  updateCategory(t, i) {
    return this.call("update_category", { category_id: t, ...i });
  }
  deleteCategory(t) {
    return this.call("delete_category", { category_id: t });
  }
  // Expenses
  listExpenses(t, i = !0) {
    return this.call("list_expenses", { group_id: t, with_shares: i });
  }
  getExpense(t) {
    return this.call("get_expense", { expense_id: t });
  }
  createExpense(t) {
    return this.call("create_expense", t);
  }
  updateExpense(t, i) {
    return this.call("update_expense", { expense_id: t, ...i });
  }
  deleteExpense(t) {
    return this.call("delete_expense", { expense_id: t });
  }
  listExpenseShares(t) {
    return this.call("list_expense_shares", { group_id: t });
  }
  // Payments
  listPayments(t) {
    return this.call("list_payments", { group_id: t });
  }
  createPayment(t) {
    return this.call("create_payment", t);
  }
  updatePayment(t, i) {
    return this.call("update_payment", { payment_id: t, ...i });
  }
  deletePayment(t) {
    return this.call("delete_payment", { payment_id: t });
  }
  // Exchange rates
  /**
   * The rate for a pair on a day.
   *
   * Answers from the source, or from what is cached, or with the last known
   * one — `stale` and `as_of` say which. Throws `exchange_rate_unavailable`
   * only when nothing is known and nothing can be reached, and then a rate has
   * to be typed.
   *
   * `groupId` is required so the wall applies: rates are public knowledge, but
   * who asks for them is not.
   */
  getExchangeRate(t, i, s, r) {
    return this.call("get_exchange_rate", {
      group_id: t,
      base: i,
      quote: s,
      on: r
    });
  }
  /** Record a rate by hand. It becomes the last known one for the pair. */
  setExchangeRate(t, i, s, r, a) {
    return this.call("set_exchange_rate", {
      group_id: t,
      base: i,
      quote: s,
      on: r,
      rate: a
    });
  }
  // Statistics
  /** What the group spent. Leave `year` out for everything, ever. */
  getStatistics(t, i) {
    return this.call("get_statistics", {
      group_id: t,
      ...i ? { year: i } : {}
    });
  }
  // History
  /** What happened in the group, newest first. */
  listRevisions(t, i) {
    return this.call("list_revisions", {
      group_id: t,
      ...i ? { limit: i } : {}
    });
  }
  // `groupId` is required: a deleted expense can no longer say which group it
  // belonged to, and its history is exactly what is being asked for.
  listEntityRevisions(t, i) {
    return this.call("list_entity_revisions", {
      group_id: t,
      entity_id: i
    });
  }
  call(t, i = {}) {
    return this.hass.callWS({
      type: `shared_expenses/${t}`,
      ...i
    });
  }
}
var er = Object.defineProperty, tr = Object.getOwnPropertyDescriptor, Be = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? tr(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (s ? n(t, i, r) : n(r)) || r);
  return s && r && er(t, i, r), r;
};
let _e = class extends g {
  constructor() {
    super(...arguments), this.narrow = !1, this.landed = !1, this.syncFromRoute = () => {
      const e = this.route?.path ?? window.location.pathname, t = /\/group\/([^/?#]+)/.exec(e);
      if (t) {
        this.groupId = t[1];
        return;
      }
      if (this.landed) {
        this.groupId = void 0;
        return;
      }
      this.landed = !0;
      const i = ir();
      if (i) {
        this.groupId = i, this.replacePath(`/group/${i}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (e) => {
      const t = e.detail.groupId;
      this.groupId = t, sr(t), this.replacePath(`/group/${t}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.replacePath("");
    }, this.handleGroupUnavailable = () => {
      rr(), this.goToDashboard();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new Qs(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return o``;
    const e = Gi(this.hass.locale?.language ?? this.hass.language), t = this.hass.locale?.language ?? this.hass.language;
    return this.groupId ? o`
        <se-group-page
          .api=${this.api}
          .localize=${e}
          .groupId=${this.groupId}
          .language=${t}
          .userId=${this.hass.user?.id ?? null}
          @navigate-back=${this.goToDashboard}
          @group-selected=${this.handleGroupSelected}
          @group-unavailable=${this.handleGroupUnavailable}
        ></se-group-page>
      ` : o`
      <se-dashboard-page
        .api=${this.api}
        .localize=${e}
        @group-selected=${this.handleGroupSelected}
      ></se-dashboard-page>
    `;
  }
  /**
   * Say where you are without adding a step to go back through.
   *
   * replaceState, never pushState: every group opened used to leave an entry
   * behind, so back walked you through them and out via the group list. The
   * URL still describes where you are — a link, a reload, a shared address all
   * land right — it simply is not a trail.
   */
  replacePath(e) {
    const t = this.route?.prefix ?? window.location.pathname.split("/")[1], i = t.startsWith("/") ? t : `/${t}`;
    history.replaceState(null, "", `${i}${e}`);
  }
};
_e.styles = _`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
Be([
  l({ attribute: !1 })
], _e.prototype, "hass", 2);
Be([
  l({ type: Boolean })
], _e.prototype, "narrow", 2);
Be([
  l({ attribute: !1 })
], _e.prototype, "route", 2);
Be([
  c()
], _e.prototype, "groupId", 2);
_e = Be([
  y("shared-expenses-panel")
], _e);
const yt = "shared_expenses.last_group";
function ir() {
  try {
    return window.localStorage.getItem(yt);
  } catch {
    return null;
  }
}
function sr(e) {
  try {
    window.localStorage.setItem(yt, e);
  } catch {
  }
}
function rr() {
  try {
    window.localStorage.removeItem(yt);
  } catch {
  }
}
export {
  _e as SharedExpensesPanel
};
