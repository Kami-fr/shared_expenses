/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fe = globalThis, ze = fe.ShadowRoot && (fe.ShadyCSS === void 0 || fe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ke = Symbol(), je = /* @__PURE__ */ new WeakMap();
let Xe = class {
  constructor(e, s, r) {
    if (this._$cssResult$ = !0, r !== ke) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ze && e === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (e = je.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && je.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const lt = (t) => new Xe(typeof t == "string" ? t : t + "", void 0, ke), S = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((r, i, a) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[a + 1], t[0]);
  return new Xe(s, t, ke);
}, ct = (t, e) => {
  if (ze) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const r = document.createElement("style"), i = fe.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, t.appendChild(r);
  }
}, Ue = ze ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const r of e.cssRules) s += r.cssText;
  return lt(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: dt, defineProperty: pt, getOwnPropertyDescriptor: ht, getOwnPropertyNames: ut, getOwnPropertySymbols: mt, getPrototypeOf: gt } = Object, we = globalThis, Ne = we.trustedTypes, bt = Ne ? Ne.emptyScript : "", vt = we.reactiveElementPolyfillSupport, ce = (t, e) => t, ye = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? bt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let s = t;
  switch (e) {
    case Boolean:
      s = t !== null;
      break;
    case Number:
      s = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(t);
      } catch {
        s = null;
      }
  }
  return s;
} }, Oe = (t, e) => !dt(t, e), Re = { attribute: !0, type: String, converter: ye, reflect: !1, useDefault: !1, hasChanged: Oe };
Symbol.metadata ??= Symbol("metadata"), we.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let se = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Re) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, s);
      i !== void 0 && pt(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, r) {
    const { get: i, set: a } = ht(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const u = i?.call(this);
      a?.call(this, o), this.requestUpdate(e, u, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Re;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ce("elementProperties"))) return;
    const e = gt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ce("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ce("properties"))) {
      const s = this.properties, r = [...ut(s), ...mt(s)];
      for (const i of r) this.createProperty(i, s[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [r, i] of s) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, r] of this.elementProperties) {
      const i = this._$Eu(s, r);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const i of r) s.unshift(Ue(i));
    } else e !== void 0 && s.push(Ue(e));
    return s;
  }
  static _$Eu(e, s) {
    const r = s.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const r of s.keys()) this.hasOwnProperty(r) && (e.set(r, this[r]), delete this[r]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ct(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, r) {
    this._$AK(e, r);
  }
  _$ET(e, s) {
    const r = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, r);
    if (i !== void 0 && r.reflect === !0) {
      const a = (r.converter?.toAttribute !== void 0 ? r.converter : ye).toAttribute(s, r.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const a = r.getPropertyOptions(i), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : ye;
      this._$Em = i;
      const u = o.fromAttribute(s, a.type);
      this[i] = u ?? this._$Ej?.get(i) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, s, r, i = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (a = this[e]), r ??= o.getPropertyOptions(e), !((r.hasChanged ?? Oe)(a, s) || r.useDefault && r.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, r)))) return;
      this.C(e, s, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: r, reflect: i, wrapped: a }, o) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), a !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, a] of this._$Ep) this[i] = a;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, a] of r) {
        const { wrapped: o } = a, u = this[i];
        o !== !0 || this._$AL.has(i) || u === void 0 || this.C(i, void 0, a, u);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(s);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
se.elementStyles = [], se.shadowRootOptions = { mode: "open" }, se[ce("elementProperties")] = /* @__PURE__ */ new Map(), se[ce("finalized")] = /* @__PURE__ */ new Map(), vt?.({ ReactiveElement: se }), (we.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ie = globalThis, Be = (t) => t, $e = Ie.trustedTypes, He = $e ? $e.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Ye = "$lit$", L = `lit$${Math.random().toFixed(9).slice(2)}$`, et = "?" + L, ft = `<${et}>`, J = document, de = () => J.createComment(""), pe = (t) => t === null || typeof t != "object" && typeof t != "function", Me = Array.isArray, yt = (t) => Me(t) || typeof t?.[Symbol.iterator] == "function", Se = `[ 	
\f\r]`, le = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, qe = /-->/g, Le = />/g, K = RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ge = /'/g, Fe = /"/g, tt = /^(?:script|style|textarea|title)$/i, $t = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = $t(1), re = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Ve = /* @__PURE__ */ new WeakMap(), Q = J.createTreeWalker(J, 129);
function st(t, e) {
  if (!Me(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return He !== void 0 ? He.createHTML(e) : e;
}
const _t = (t, e) => {
  const s = t.length - 1, r = [];
  let i, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = le;
  for (let u = 0; u < s; u++) {
    const p = t[u];
    let m, g, h = -1, w = 0;
    for (; w < p.length && (o.lastIndex = w, g = o.exec(p), g !== null); ) w = o.lastIndex, o === le ? g[1] === "!--" ? o = qe : g[1] !== void 0 ? o = Le : g[2] !== void 0 ? (tt.test(g[2]) && (i = RegExp("</" + g[2], "g")), o = K) : g[3] !== void 0 && (o = K) : o === K ? g[0] === ">" ? (o = i ?? le, h = -1) : g[1] === void 0 ? h = -2 : (h = o.lastIndex - g[2].length, m = g[1], o = g[3] === void 0 ? K : g[3] === '"' ? Fe : Ge) : o === Fe || o === Ge ? o = K : o === qe || o === Le ? o = le : (o = K, i = void 0);
    const _ = o === K && t[u + 1].startsWith("/>") ? " " : "";
    a += o === le ? p + ft : h >= 0 ? (r.push(m), p.slice(0, h) + Ye + p.slice(h) + L + _) : p + L + (h === -2 ? u : _);
  }
  return [st(t, a + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class he {
  constructor({ strings: e, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let a = 0, o = 0;
    const u = e.length - 1, p = this.parts, [m, g] = _t(e, s);
    if (this.el = he.createElement(m, r), Q.currentNode = this.el.content, s === 2 || s === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = Q.nextNode()) !== null && p.length < u; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(Ye)) {
          const w = g[o++], _ = i.getAttribute(h).split(L), O = /([.?@])?(.*)/.exec(w);
          p.push({ type: 1, index: a, name: O[2], strings: _, ctor: O[1] === "." ? wt : O[1] === "?" ? Ct : O[1] === "@" ? At : Ce }), i.removeAttribute(h);
        } else h.startsWith(L) && (p.push({ type: 6, index: a }), i.removeAttribute(h));
        if (tt.test(i.tagName)) {
          const h = i.textContent.split(L), w = h.length - 1;
          if (w > 0) {
            i.textContent = $e ? $e.emptyScript : "";
            for (let _ = 0; _ < w; _++) i.append(h[_], de()), Q.nextNode(), p.push({ type: 2, index: ++a });
            i.append(h[w], de());
          }
        }
      } else if (i.nodeType === 8) if (i.data === et) p.push({ type: 2, index: a });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(L, h + 1)) !== -1; ) p.push({ type: 7, index: a }), h += L.length - 1;
      }
      a++;
    }
  }
  static createElement(e, s) {
    const r = J.createElement("template");
    return r.innerHTML = e, r;
  }
}
function ie(t, e, s = t, r) {
  if (e === re) return e;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const a = pe(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(t), i._$AT(t, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (e = ie(t, i._$AS(t, e.values), i, r)), e;
}
class xt {
  constructor(e, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: s }, parts: r } = this._$AD, i = (e?.creationScope ?? J).importNode(s, !0);
    Q.currentNode = i;
    let a = Q.nextNode(), o = 0, u = 0, p = r[0];
    for (; p !== void 0; ) {
      if (o === p.index) {
        let m;
        p.type === 2 ? m = new me(a, a.nextSibling, this, e) : p.type === 1 ? m = new p.ctor(a, p.name, p.strings, this, e) : p.type === 6 && (m = new St(a, this, e)), this._$AV.push(m), p = r[++u];
      }
      o !== p?.index && (a = Q.nextNode(), o++);
    }
    return Q.currentNode = J, i;
  }
  p(e) {
    let s = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, s), s += r.strings.length - 2) : r._$AI(e[s])), s++;
  }
}
class me {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, r, i) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && e?.nodeType === 11 && (e = s.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, s = this) {
    e = ie(this, e, s), pe(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== re && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : yt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && pe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(J.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = he.createElement(st(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const a = new xt(i, this), o = a.u(this.options);
      a.p(s), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let s = Ve.get(e.strings);
    return s === void 0 && Ve.set(e.strings, s = new he(e)), s;
  }
  k(e) {
    Me(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const a of e) i === s.length ? s.push(r = new me(this.O(de()), this.O(de()), this, this.options)) : r = s[i], r._$AI(a), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const r = Be(e).nextSibling;
      Be(e).remove(), e = r;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class Ce {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, r, i, a) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = a, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = d;
  }
  _$AI(e, s = this, r, i) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) e = ie(this, e, s, 0), o = !pe(e) || e !== this._$AH && e !== re, o && (this._$AH = e);
    else {
      const u = e;
      let p, m;
      for (e = a[0], p = 0; p < a.length - 1; p++) m = ie(this, u[r + p], s, p), m === re && (m = this._$AH[p]), o ||= !pe(m) || m !== this._$AH[p], m === d ? e = d : e !== d && (e += (m ?? "") + a[p + 1]), this._$AH[p] = m;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class wt extends Ce {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class Ct extends Ce {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class At extends Ce {
  constructor(e, s, r, i, a) {
    super(e, s, r, i, a), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = ie(this, e, s, 0) ?? d) === re) return;
    const r = this._$AH, i = e === d && r !== d || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, a = e !== d && (r === d || i);
    i && this.element.removeEventListener(this.name, this, r), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class St {
  constructor(e, s, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ie(this, e);
  }
}
const Et = Ie.litHtmlPolyfillSupport;
Et?.(he, me), (Ie.litHtmlVersions ??= []).push("3.3.3");
const Pt = (t, e, s) => {
  const r = s?.renderBefore ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const a = s?.renderBefore ?? null;
    r._$litPart$ = i = new me(e.insertBefore(de(), a), a, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const De = globalThis;
let v = class extends se {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Pt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return re;
  }
};
v._$litElement$ = !0, v.finalized = !0, De.litElementHydrateSupport?.({ LitElement: v });
const zt = De.litElementPolyfillSupport;
zt?.({ LitElement: v });
(De.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kt = { attribute: !0, type: String, converter: ye, reflect: !1, hasChanged: Oe }, Ot = (t = kt, e, s) => {
  const { kind: r, metadata: i } = s;
  let a = globalThis.litPropertyMetadata.get(i);
  if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(s.name, t), r === "accessor") {
    const { name: o } = s;
    return { set(u) {
      const p = e.get.call(this);
      e.set.call(this, u), this.requestUpdate(o, p, t, !0, u);
    }, init(u) {
      return u !== void 0 && this.C(o, void 0, t, u), u;
    } };
  }
  if (r === "setter") {
    const { name: o } = s;
    return function(u) {
      const p = this[o];
      e.call(this, u), this.requestUpdate(o, p, t, !0, u);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function l(t) {
  return (e, s) => typeof s == "object" ? Ot(t, e, s) : ((r, i, a) => {
    const o = i.hasOwnProperty(a);
    return i.constructor.createProperty(a, r), o ? Object.getOwnPropertyDescriptor(i, a) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function c(t) {
  return l({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const It = (t, e, s) => (s.configurable = !0, s.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, s), s);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Mt(t, e) {
  return (s, r, i) => {
    const a = (o) => o.renderRoot?.querySelector(t) ?? null;
    return It(s, r, { get() {
      return a(this);
    } });
  };
}
var Dt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, Ae = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Tt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Dt(e, s, i), i;
};
let ae = class extends v {
  constructor() {
    super(...arguments), this.variant = "filled", this.disabled = !1;
  }
  render() {
    return n`
      <button class=${this.variant} ?disabled=${this.disabled} @click=${this.handleClick}>
        ${this.icon ? n`<span aria-hidden="true">${this.icon}</span>` : d}
        <slot></slot>
      </button>
    `;
  }
  handleClick(t) {
    this.disabled && t.stopPropagation();
  }
};
ae.styles = S`
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
Ae([
  l({ type: String })
], ae.prototype, "variant", 2);
Ae([
  l({ type: Boolean })
], ae.prototype, "disabled", 2);
Ae([
  l({ type: String })
], ae.prototype, "icon", 2);
ae = Ae([
  x("se-button")
], ae);
var jt = Object.defineProperty, Ut = Object.getOwnPropertyDescriptor, Te = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ut(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && jt(e, s, i), i;
};
let ue = class extends v {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.close = () => {
      this.open = !1, this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: !0, composed: !0 }));
    }, this.handleKeydown = (t) => {
      this.open && t.key === "Escape" && this.close();
    }, this.handleScrimClick = () => {
      this.close();
    };
  }
  render() {
    return n`
      <div class="scrim" @click=${this.handleScrimClick}>
        <div class="surface" role="dialog" aria-modal="true" @click=${this.stop}>
          <header>
            <h2>${this.heading}</h2>
            <button class="close" @click=${this.close} aria-label="Fermer">×</button>
          </header>
          <div class="content"><slot></slot></div>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
      </div>
    `;
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("keydown", this.handleKeydown);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", this.handleKeydown);
  }
  stop(t) {
    t.stopPropagation();
  }
};
ue.styles = S`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .surface {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      width: 100%;
      max-height: 92vh;
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

    .content {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
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
Te([
  l({ type: String })
], ue.prototype, "heading", 2);
Te([
  l({ type: Boolean, reflect: !0 })
], ue.prototype, "open", 2);
ue = Te([
  x("se-dialog")
], ue);
var Nt = Object.defineProperty, Rt = Object.getOwnPropertyDescriptor, R = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Rt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Nt(e, s, i), i;
};
let M = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.type = "text", this.placeholder = "", this.required = !1, this.disabled = !1, this.decimal = !1;
  }
  render() {
    return n`
      ${this.label ? n`<label>${this.label}${this.required ? " *" : ""}</label>` : d}
      <div class="wrapper">
        <input
          .type=${this.type}
          .value=${this.value}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          inputmode=${this.decimal ? "decimal" : d}
          @input=${this.handleInput}
        />
        ${this.suffix ? n`<span class="suffix">${this.suffix}</span>` : d}
      </div>
      ${this.helper ? n`<div class="helper">${this.helper}</div>` : d}
    `;
  }
  handleInput(t) {
    const e = t.target.value;
    this.value = e, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
M.styles = S`
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
R([
  l({ type: String })
], M.prototype, "label", 2);
R([
  l({ type: String })
], M.prototype, "value", 2);
R([
  l({ type: String })
], M.prototype, "type", 2);
R([
  l({ type: String })
], M.prototype, "placeholder", 2);
R([
  l({ type: String })
], M.prototype, "suffix", 2);
R([
  l({ type: String })
], M.prototype, "helper", 2);
R([
  l({ type: Boolean })
], M.prototype, "required", 2);
R([
  l({ type: Boolean })
], M.prototype, "disabled", 2);
R([
  l({ type: Boolean })
], M.prototype, "decimal", 2);
M = R([
  x("se-field")
], M);
const _e = {
  app_title: "Shared Expenses",
  groups: "Groups",
  no_groups: "No group yet. Create one to get started.",
  new_group: "New group",
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
  back: "Back",
  tab_overview: "Overview",
  tab_balances: "Balances",
  tab_expenses: "Expenses",
  tab_settlements: "Settlements",
  tab_members: "Members",
  tab_categories: "Categories",
  current_balance: "Current balance",
  must_receive: "is owed",
  must_pay: "owes",
  detailed_balances: "See detailed balances",
  recent_expenses: "Recent expenses",
  see_all: "See all",
  action_add_expense: "Add expense",
  action_members: "Members",
  action_settle: "Settle",
  action_stats: "Statistics",
  no_settlements: "No settlement yet.",
  categories: "Categories",
  no_categories: "No category yet. A category carries a default split rule.",
  new_category: "New category",
  edit_category: "Edit category",
  category_name: "Name",
  icon: "Icon",
  icon_hint: "Search by name or by what it looks like, for example cart.",
  icon_search: "Search an icon…",
  icon_list_failed: "The icon list could not be loaded. Type an mdi: name by hand.",
  default_split: "Default split",
  split_rule_custom: "Use a custom rule",
  split_rule_equal_hint: "Expenses of this category are split equally.",
  envelope_label: "Amount shared equally",
  envelope_hint: "Leave empty to share the whole expense.",
  envelope_all: "The whole expense",
  shared_between: "Shared between",
  remainder_label: "What is left",
  remainder_hint: "Tick who takes it. An amount is exact, an empty field takes an equal share. Nobody ticked: whoever paid takes it all.",
  rule_preview_intro: "On an expense of",
  rule_preview_paid_by: "paid by",
  rule_invalid: "This rule cannot be resolved.",
  rule_equal: "Split equally",
  rule_shares: "Shares",
  balance_settled: "Everything is settled.",
  owes: "owes",
  to: "to",
  reimbursements: "Reimbursements",
  settle_up: "Settle up",
  expenses: "Expenses",
  no_expenses: "No expense yet.",
  new_expense: "New expense",
  edit_expense: "Edit expense",
  confirm_delete: "Confirm?",
  expense_title: "Title",
  amount: "Amount",
  paid_by: "Paid by",
  date: "Date",
  category: "Category",
  no_category: "No category",
  split: "Split",
  description_placeholder: "Optional",
  split_total: "Split total",
  apply_rule: "Apply the rule of",
  group_rule: "the group",
  shares_mismatch: "The shares must add up to the amount.",
  participants: "Participants",
  members: "Members",
  no_members: "No member yet.",
  new_member: "Manage members",
  member_name: "Name",
  remove_member: "Remove from group",
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
  payments: "Payments",
  new_payment: "Record a payment",
  from_member: "From",
  to_member: "To",
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
  payment_not_found: "This payment no longer exists.",
  invalid_payment: "This payment is invalid.",
  not_loaded: "The integration is not loaded.",
  unknown_error: "Something went wrong."
}, Bt = {
  app_title: "Dépenses partagées",
  groups: "Groupes",
  no_groups: "Aucun groupe pour l'instant. Créez-en un pour commencer.",
  new_group: "Nouveau groupe",
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
  back: "Retour",
  tab_overview: "Aperçu",
  tab_balances: "Soldes",
  tab_expenses: "Dépenses",
  tab_settlements: "Règlements",
  tab_members: "Membres",
  tab_categories: "Catégories",
  current_balance: "Solde actuel",
  must_receive: "doit recevoir",
  must_pay: "doit payer",
  detailed_balances: "Voir les soldes détaillés",
  recent_expenses: "Dernières dépenses",
  see_all: "Voir tout",
  action_add_expense: "Ajouter dépense",
  action_members: "Membres",
  action_settle: "Règlement",
  action_stats: "Statistiques",
  no_settlements: "Aucun règlement pour l'instant.",
  categories: "Catégories",
  no_categories: "Aucune catégorie. Une catégorie porte une règle de répartition par défaut.",
  new_category: "Nouvelle catégorie",
  edit_category: "Modifier la catégorie",
  category_name: "Nom",
  icon: "Icône",
  icon_hint: "Cherchez par nom ou par ce que ça représente, par exemple cart.",
  icon_search: "Rechercher une icône…",
  icon_list_failed: "La liste d'icônes n'a pas pu être chargée. Saisissez un nom mdi: à la main.",
  default_split: "Répartition par défaut",
  split_rule_custom: "Utiliser une règle personnalisée",
  split_rule_equal_hint: "Les dépenses de cette catégorie sont partagées à parts égales.",
  envelope_label: "Montant partagé équitablement",
  envelope_hint: "Laisser vide pour partager toute la dépense.",
  envelope_all: "Toute la dépense",
  shared_between: "Partagé entre",
  remainder_label: "Le reste",
  remainder_hint: "Cochez qui le prend. Un montant est exact, un champ vide prend une part égale. Personne de coché : celui qui a payé prend tout.",
  rule_preview_intro: "Sur une dépense de",
  rule_preview_paid_by: "payée par",
  rule_invalid: "Cette règle ne peut pas être résolue.",
  rule_equal: "Parts égales",
  rule_shares: "Partage",
  balance_settled: "Tout est réglé.",
  owes: "doit",
  to: "à",
  reimbursements: "Remboursements",
  settle_up: "Rembourser",
  expenses: "Dépenses",
  no_expenses: "Aucune dépense pour l'instant.",
  new_expense: "Nouvelle dépense",
  edit_expense: "Modifier la dépense",
  confirm_delete: "Confirmer ?",
  expense_title: "Intitulé",
  amount: "Montant",
  paid_by: "Payé par",
  date: "Date",
  category: "Catégorie",
  no_category: "Sans catégorie",
  split: "Répartition",
  description_placeholder: "Facultatif",
  split_total: "Total réparti",
  apply_rule: "Appliquer la règle de",
  group_rule: "du groupe",
  shares_mismatch: "Le total des parts doit égaler le montant.",
  participants: "Participants",
  members: "Membres",
  no_members: "Aucun membre pour l'instant.",
  new_member: "Gérer les membres",
  member_name: "Nom",
  remove_member: "Retirer du groupe",
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
  payments: "Paiements",
  new_payment: "Enregistrer un paiement",
  from_member: "De",
  to_member: "Vers",
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
  payment_not_found: "Ce paiement n'existe plus.",
  invalid_payment: "Ce paiement est invalide.",
  not_loaded: "L'intégration n'est pas chargée.",
  unknown_error: "Une erreur est survenue."
}, Ht = { en: _e, fr: Bt };
function qt(t) {
  const e = Ht[t.split("-")[0]] ?? _e;
  return (s) => e[s] ?? _e[s] ?? s;
}
function I(t, e) {
  const s = t?.code;
  return s && s in _e ? e(s) : t?.message || e("error_generic");
}
const B = S`
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

  button {
    font-family: inherit;
  }
`;
var Lt = Object.defineProperty, Gt = Object.getOwnPropertyDescriptor, W = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Gt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Lt(e, s, i), i;
};
let N = class extends v {
  constructor() {
    super(...arguments), this.name = "", this.description = "", this.currency = "EUR", this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      try {
        const t = await this.api.createGroup({
          name: this.name.trim(),
          currency: this.currency.trim() || "EUR",
          description: this.description.trim() || null
        });
        this.dispatchEvent(
          new CustomEvent("group-created", {
            detail: { group: t },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (t) {
        this.error = I(t, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  render() {
    const t = this.localize;
    return n`
      <se-dialog open heading=${t("new_group")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : d}
          <se-field
            .label=${t("group_name")}
            .value=${this.name}
            required
            placeholder="Appartement"
            @value-changed=${(e) => this.name = e.detail.value}
          ></se-field>
          <se-field
            .label=${t("description")}
            .value=${this.description}
            @value-changed=${(e) => this.description = e.detail.value}
          ></se-field>
          <se-field
            .label=${t("currency")}
            .value=${this.currency}
            @value-changed=${(e) => this.currency = e.detail.value.toUpperCase()}
          ></se-field>
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${t("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || this.name.trim() === ""}
          @click=${this.submit}
        >
          ${t("create")}
        </se-button>
      </se-dialog>
    `;
  }
};
N.styles = B;
W([
  l({ attribute: !1 })
], N.prototype, "api", 2);
W([
  l({ attribute: !1 })
], N.prototype, "localize", 2);
W([
  c()
], N.prototype, "name", 2);
W([
  c()
], N.prototype, "description", 2);
W([
  c()
], N.prototype, "currency", 2);
W([
  c()
], N.prototype, "busy", 2);
W([
  c()
], N.prototype, "error", 2);
N = W([
  x("se-group-dialog")
], N);
var Ft = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, te = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Vt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Ft(e, s, i), i;
};
let H = class extends v {
  constructor() {
    super(...arguments), this.groups = [], this.loading = !0, this.dialogOpen = !1, this.handleCreated = (t) => {
      this.dialogOpen = !1, this.select(t.detail.group);
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const t = this.localize;
    return this.loading ? n`<div class="empty">${t("loading")}</div>` : n`
      <div class="stack">
        <h1>${t("groups")}</h1>

        ${this.error ? n`<div class="error">${this.error}</div>` : d}

        ${this.groups.length === 0 ? n`<div class="card"><div class="empty">${t("no_groups")}</div></div>` : n`<div class="card">${this.groups.map((e) => this.renderGroup(e))}</div>`}

        <div class="fab">
          <se-button @click=${() => this.dialogOpen = !0}>
            ${t("new_group")}
          </se-button>
        </div>
      </div>

      ${this.dialogOpen ? n`
            <se-group-dialog
              .api=${this.api}
              .localize=${this.localize}
              @dialog-cancelled=${() => this.dialogOpen = !1}
              @group-created=${this.handleCreated}
            ></se-group-dialog>
          ` : d}
    `;
  }
  renderGroup(t) {
    return n`
      <button class="group" @click=${() => this.select(t)}>
        <div class="badge" style=${t.color ? `background:${t.color}` : ""}>
          ${t.name.charAt(0).toUpperCase()}
        </div>
        <div class="info">
          <div class="name">${t.name}</div>
          ${t.description ? n`<div class="muted">${t.description}</div>` : d}
        </div>
        ${t.archived ? n`<span class="archived-tag">${this.localize("archived")}</span>` : d}
        <span class="chevron">›</span>
      </button>
    `;
  }
  async load() {
    this.loading = !0, this.error = void 0;
    try {
      this.groups = await this.api.listGroups();
    } catch (t) {
      this.error = I(t, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  select(t) {
    this.dispatchEvent(
      new CustomEvent("group-selected", {
        detail: { groupId: t.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
H.styles = [
  B,
  S`
      :host {
        display: block;
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

      .fab {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    `
];
te([
  l({ attribute: !1 })
], H.prototype, "api", 2);
te([
  l({ attribute: !1 })
], H.prototype, "localize", 2);
te([
  c()
], H.prototype, "groups", 2);
te([
  c()
], H.prototype, "loading", 2);
te([
  c()
], H.prototype, "error", 2);
te([
  c()
], H.prototype, "dialogOpen", 2);
H = te([
  x("se-dashboard-page")
], H);
function G(t, e, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function Z(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const s = Number(e);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function We(t, e) {
  return new Intl.DateTimeFormat(e, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
}
function rt() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function it(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function Wt(t) {
  const e = new Date(t), s = `${e.getMonth() + 1}`.padStart(2, "0"), r = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${s}-${r}`;
}
function Pe(t) {
  return (t / 100).toFixed(2);
}
function X(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
function U(t) {
  const e = [
    "#3f7cac",
    "#c05746",
    "#4a7c59",
    "#8b5fbf",
    "#c98b3e",
    "#3d7e7e",
    "#b0567a",
    "#5c6b8a"
  ];
  let s = 0;
  for (let r = 0; r < t.length; r += 1)
    s = s * 31 + t.charCodeAt(r) >>> 0;
  return e[s % e.length];
}
var Kt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, oe = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Qt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Kt(e, s, i), i;
};
let F = class extends v {
  constructor() {
    super(...arguments), this.balances = [], this.members = [], this.currency = "EUR", this.language = "en";
  }
  render() {
    const t = this.localize;
    return n`
      <div class="card">
        <div class="head">
          <h3>${t("current_balance")}</h3>
        </div>
        ${this.renderBody()}
      </div>
    `;
  }
  renderBody() {
    const t = this.balances.filter((e) => e.amount !== 0);
    return t.length === 0 ? n`<div class="settled muted">${this.localize("balance_settled")}</div>` : t.length === 2 ? this.renderDuel(t) : n`<div>${t.map((e) => this.renderRow(e))}</div>`;
  }
  renderDuel(t) {
    const e = [...t].sort((s, r) => r.amount - s.amount);
    return n`
      <div class="duel">
        ${this.renderSide(e[0], !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(e[1], !0)}
      </div>
    `;
  }
  renderSide(t, e) {
    const s = this.memberById(t.member_id), r = t.amount > 0, i = r ? "positive" : "negative", a = n`
      <div class="avatar" style=${`background:${s?.color ?? U(t.member_id)}`}>
        ${X(s?.name ?? "?")}
      </div>
    `, o = n`
      <div class="body">
        <div class="name">${s?.name ?? "?"}</div>
        <div class=${`verdict ${i}`}>
          ${r ? this.localize("must_receive") : this.localize("must_pay")}
        </div>
        <div class=${`figure ${i}`}>
          ${G(Math.abs(t.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return n`
      <div class=${`side ${e ? "right" : ""}`}>
        ${e ? d : a}${o}${e ? a : d}
      </div>
    `;
  }
  renderRow(t) {
    const e = this.memberById(t.member_id), s = t.amount > 0, r = s ? "positive" : "negative";
    return n`
      <div class="row">
        <div class="avatar" style=${`background:${e?.color ?? U(t.member_id)}`}>
          ${X(e?.name ?? "?")}
        </div>
        <span class="name">${e?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${r}`}>
            ${s ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${r}`}>
            ${G(Math.abs(t.amount), this.currency, this.language)}
          </div>
        </div>
      </div>
    `;
  }
  memberById(t) {
    return this.members.find((e) => e.id === t);
  }
};
F.styles = [
  B,
  S`
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
oe([
  l({ attribute: !1 })
], F.prototype, "localize", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "balances", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "members", 2);
oe([
  l({ type: String })
], F.prototype, "currency", 2);
oe([
  l({ type: String })
], F.prototype, "language", 2);
F = oe([
  x("se-balance-card")
], F);
var Zt = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, ge = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Jt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Zt(e, s, i), i;
};
let Y = class extends v {
  constructor() {
    super(...arguments), this.fallback = "?", this.color = "#5c6b8a", this.size = 40;
  }
  render() {
    const t = `
      background: ${this.color};
      width: ${this.size}px;
      height: ${this.size}px;
      font-size: ${Math.round(this.size * 0.35)}px;
      --mdc-icon-size: ${Math.round(this.size * 0.55)}px;
    `;
    return n`
      <div class="pill" style=${t}>${this.renderContent()}</div>
    `;
  }
  renderContent() {
    return this.icon && this.hasHaIcon() ? n`<ha-icon .icon=${this.icon}></ha-icon>` : n`<span>${this.fallback}</span>`;
  }
  /** `ha-icon` belongs to the Home Assistant frontend, not to this bundle. */
  hasHaIcon() {
    return customElements.get("ha-icon") !== void 0;
  }
};
Y.styles = S`
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
  `;
ge([
  l({ type: String })
], Y.prototype, "icon", 2);
ge([
  l({ type: String })
], Y.prototype, "fallback", 2);
ge([
  l({ type: String })
], Y.prototype, "color", 2);
ge([
  l({ type: Number })
], Y.prototype, "size", 2);
Y = ge([
  x("se-icon")
], Y);
var Xt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, at = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Yt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Xt(e, s, i), i;
};
let xe = class extends v {
  constructor() {
    super(...arguments), this.actions = [];
  }
  render() {
    return n`
      <div class="row">
        ${this.actions.map(
      (t) => n`
            <button @click=${() => this.emit(t.key)} aria-label=${t.label}>
              <div class="bubble" style=${`background:${t.color}`}>
                ${t.symbol}
              </div>
              <span class="label">${t.label}</span>
            </button>
          `
    )}
      </div>
    `;
  }
  emit(t) {
    this.dispatchEvent(
      new CustomEvent("action", { detail: { key: t }, bubbles: !0, composed: !0 })
    );
  }
};
xe.styles = S`
    :host {
      display: block;
    }

    .row {
      display: flex;
      justify-content: space-around;
      gap: 4px;
      padding: 16px 8px;
    }

    button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      font-family: inherit;
      color: var(--primary-text-color);
    }

    .bubble {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
      line-height: 1;
      transition: transform 0.12s ease;
    }

    button:hover .bubble {
      transform: scale(1.06);
    }

    .label {
      font-size: 12px;
      line-height: 1.25;
      text-align: center;
    }
  `;
at([
  l({ attribute: !1 })
], xe.prototype, "actions", 2);
xe = at([
  x("se-quick-actions")
], xe);
var es = Object.defineProperty, ts = Object.getOwnPropertyDescriptor, q = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ts(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && es(e, s, i), i;
};
const Ke = "/static/mdi/iconList.json", Ee = 48;
let ve = null;
function ss() {
  return ve === null && (ve = fetch(Ke).then((t) => {
    if (!t.ok)
      throw new Error(`${t.status} on ${Ke}`);
    return t.json();
  }).catch((t) => {
    throw ve = null, t;
  })), ve;
}
let j = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.color = "#5c6b8a", this.icons = [], this.suggestions = [], this.open = !1, this.failed = !1, this.handleFocus = async () => {
      await this.ensureLoaded(), this.search(this.stripPrefix(this.value)), this.open = !0;
    }, this.handleInput = async (t) => {
      const e = t.target.value;
      this.emit(e), await this.ensureLoaded(), this.search(this.stripPrefix(e)), this.open = !0;
    }, this.handleBlur = () => {
      this.open = !1;
    }, this.clear = () => {
      this.emit(""), this.suggestions = [];
    };
  }
  render() {
    return n`
      ${this.label ? n`<label>${this.label}</label>` : d}

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
        ${this.value ? n`<button class="clear" @click=${this.clear} aria-label="×">×</button>` : d}
      </div>

      ${this.renderHint()} ${this.open ? this.renderGrid() : d}
    `;
  }
  renderHint() {
    return this.failed ? n`<div class="hint">${this.localize("icon_list_failed")}</div>` : n`<div class="hint">${this.localize("icon_hint")}</div>`;
  }
  renderGrid() {
    return this.suggestions.length === 0 ? d : n`
      <div class="grid">
        ${this.suggestions.map(
      (t) => n`
            <button
              class="choice"
              title=${t.name}
              @mousedown=${(e) => this.choose(e, t.name)}
            >
              <se-icon
                .icon=${`mdi:${t.name}`}
                .color=${this.color}
                .size=${34}
                fallback="•"
              ></se-icon>
              <span class="name">${t.name}</span>
            </button>
          `
    )}
      </div>
    `;
  }
  choose(t, e) {
    t.preventDefault(), this.emit(`mdi:${e}`), this.open = !1;
  }
  async ensureLoaded() {
    if (!(this.icons.length > 0 || this.failed))
      try {
        this.icons = await ss();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(t) {
    const e = t.trim().toLowerCase();
    if (e === "") {
      this.suggestions = this.icons.slice(0, Ee);
      return;
    }
    const s = [], r = [], i = [];
    for (const a of this.icons)
      if (a.name.startsWith(e) ? s.push(a) : a.name.includes(e) ? r.push(a) : a.keywords?.some((o) => o.includes(e)) && i.push(a), s.length >= Ee)
        break;
    this.suggestions = [...s, ...r, ...i].slice(0, Ee);
  }
  stripPrefix(t) {
    return t.startsWith("mdi:") ? t.slice(4) : t;
  }
  emit(t) {
    this.value = t, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
j.styles = [
  B,
  S`
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
q([
  l({ attribute: !1 })
], j.prototype, "localize", 2);
q([
  l({ type: String })
], j.prototype, "label", 2);
q([
  l({ type: String })
], j.prototype, "value", 2);
q([
  l({ type: String })
], j.prototype, "color", 2);
q([
  c()
], j.prototype, "icons", 2);
q([
  c()
], j.prototype, "suggestions", 2);
q([
  c()
], j.prototype, "open", 2);
q([
  c()
], j.prototype, "failed", 2);
j = q([
  x("se-icon-picker")
], j);
function Qe(t) {
  const { amount: e, payerId: s, memberIds: r } = t;
  if (!Number.isInteger(e) || e <= 0)
    return null;
  const i = [...new Set(r)];
  if (i.length === 0 || !i.includes(s))
    return null;
  const a = t.rule ?? {}, o = rs(a, e);
  if (o === null)
    return null;
  const u = a.participants == null ? i : [...new Set(a.participants)];
  if (u.some((_) => !i.includes(_)))
    return null;
  const p = u.length === 0 ? 0 : o, m = ot(p, u), g = e - p;
  if (g > 0) {
    const _ = is(a.remainder, g, s, i);
    if (_ === null)
      return null;
    for (const [O, nt] of Object.entries(_))
      m[O] = (m[O] ?? 0) + nt;
  }
  const h = {};
  for (const [_, O] of Object.entries(m))
    O !== 0 && (h[_] = O);
  return Object.values(h).reduce((_, O) => _ + O, 0) === e ? h : null;
}
function rs(t, e) {
  return t.envelope == null ? e : t.envelope < 0 ? null : Math.min(t.envelope, e);
}
function is(t, e, s, r) {
  const i = t ?? {}, a = i.fixed ?? {};
  for (const [h, w] of Object.entries(a))
    if (!r.includes(h) || w < 0)
      return null;
  const o = i.members == null ? [s] : [...new Set(i.members)];
  if (o.length === 0 || o.some((h) => !r.includes(h)))
    return null;
  const u = {};
  for (const h of o)
    h in a && (u[h] = a[h]);
  const p = Object.values(u).reduce((h, w) => h + w, 0);
  if (p > e)
    return null;
  const m = o.filter((h) => !(h in u));
  if (m.length === 0)
    return p === e ? u : null;
  const g = { ...u };
  for (const [h, w] of Object.entries(
    ot(e - p, m)
  ))
    g[h] = (g[h] ?? 0) + w;
  return g;
}
function ot(t, e) {
  if (t <= 0 || e.length === 0)
    return {};
  const s = Math.floor(t / e.length), r = t % e.length, i = {};
  return e.forEach((a, o) => {
    i[a] = s + (o < r ? 1 : 0);
  }), i;
}
var as = Object.defineProperty, os = Object.getOwnPropertyDescriptor, z = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? os(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && as(e, s, i), i;
};
const ns = 8542;
let C = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.required = !1, this.enabled = !1, this.envelopeInput = "", this.participants = /* @__PURE__ */ new Set(), this.takers = /* @__PURE__ */ new Set(), this.amounts = {};
  }
  connectedCallback() {
    super.connectedCallback(), this.enabled = this.required || this.rule !== null, this.envelopeInput = this.rule?.envelope != null ? Pe(this.rule.envelope) : "", this.participants = new Set(
      this.rule?.participants ?? this.members.map((e) => e.id)
    );
    const t = this.rule?.remainder?.members;
    this.takers = new Set(
      t ?? (this.payerId ? [this.payerId] : [])
    ), this.amounts = Object.fromEntries(
      Object.entries(this.rule?.remainder?.fixed ?? {}).map(([e, s]) => [
        e,
        Pe(s)
      ])
    );
  }
  willUpdate(t) {
    if (!t.has("payerId"))
      return;
    const e = t.get("payerId");
    e != null && this.takers.size === 1 && this.takers.has(e) && this.payerId && (this.takers = /* @__PURE__ */ new Set([this.payerId]), this.amounts = {});
  }
  updated(t) {
    t.has("payerId") && this.emit();
  }
  render() {
    const t = this.localize;
    return this.required ? this.renderPanel() : n`
      <label class="toggle">
        <input type="checkbox" .checked=${this.enabled} @change=${this.toggle} />
        <span class="label">${t("split_rule_custom")}</span>
      </label>

      ${this.enabled ? this.renderPanel() : n`<div class="muted">${t("split_rule_equal_hint")}</div>`}
    `;
  }
  /** What the preview runs on: the real expense, or a sample. */
  get previewAmount() {
    return this.amount != null && this.amount > 0 ? this.amount : ns;
  }
  renderPanel() {
    const t = this.localize, e = Z(this.envelopeInput), s = this.envelopeInput.trim() !== "" && e !== null && e < this.previewAmount;
    return n`
      <div class="panel">
        <div>
          <se-field
            .label=${t("envelope_label")}
            .value=${this.envelopeInput}
            .suffix=${this.currency}
            .helper=${t("envelope_hint")}
            decimal
            placeholder=${t("envelope_all")}
            @value-changed=${(r) => this.setEnvelope(r.detail.value)}
          ></se-field>

          <div class="muted" style="margin-top:8px">
            ${t("shared_between")}
          </div>
          ${this.members.map((r) => this.renderParticipant(r))}
        </div>

        ${s ? this.renderRemainder() : d} ${this.renderPreview()}
      </div>
    `;
  }
  renderParticipant(t) {
    return n`
      <div class="member-row">
        <input
          type="checkbox"
          .checked=${this.participants.has(t.id)}
          @change=${() => this.toggleParticipant(t.id)}
        />
        ${this.renderAvatar(t)}
        <span class="name">${t.name}</span>
      </div>
    `;
  }
  renderRemainder() {
    const t = this.localize;
    return n`
      <div>
        <label class="muted">${t("remainder_label")}</label>
        <div class="muted">${t("remainder_hint")}</div>

        ${this.members.map(
      (e) => n`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.takers.has(e.id)}
                @change=${() => this.toggleTaker(e.id)}
              />
              ${this.renderAvatar(e)}
              <span class="name">${e.name}</span>
              <se-field
                .value=${this.amounts[e.id] ?? ""}
                .suffix=${this.currency}
                .disabled=${!this.takers.has(e.id)}
                decimal
                placeholder="—"
                @value-changed=${(s) => this.setAmount(e.id, s.detail.value)}
              ></se-field>
            </div>
          `
    )}
      </div>
    `;
  }
  /**
   * Show the rule on a sample expense.
   *
   * Resolved by the same code the backend mirrors, so these are the real
   * figures rather than a hand-written approximation that could drift.
   */
  renderPreview() {
    const t = this.members.find((i) => i.id === this.payerId) ?? this.members[0];
    if (!t)
      return d;
    const e = this.previewAmount, s = Qe({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((i) => i.id),
      rule: this.build()
    });
    if (s === null)
      return n`<div class="preview negative">${this.localize("rule_invalid")}</div>`;
    const r = (i) => G(i, this.currency, this.language);
    return n`
      <div class="preview">
        <div class="muted">
          ${this.localize("rule_preview_intro")} ${r(e)}
          ${this.localize("rule_preview_paid_by")} ${t.name} :
        </div>
        ${this.members.map(
      (i) => n`
            <div class="line">
              <span>${i.name}</span>
              <strong>${r(s[i.id] ?? 0)}</strong>
            </div>
          `
    )}
      </div>
    `;
  }
  /** The shares this rule resolves to, for the caller to store. */
  resolved() {
    const t = this.members.find((e) => e.id === this.payerId) ?? this.members[0];
    return !t || this.amount == null ? null : Qe({
      amount: this.amount,
      payerId: t.id,
      memberIds: this.members.map((e) => e.id),
      rule: this.build()
    });
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? U(t.id)}`}>
        ${X(t.name)}
      </div>
    `;
  }
  toggle(t) {
    this.enabled = t.target.checked, this.emit();
  }
  setEnvelope(t) {
    this.envelopeInput = t, this.emit();
  }
  toggleParticipant(t) {
    this.participants = Ze(this.participants, t), this.emit();
  }
  toggleTaker(t) {
    if (this.takers = Ze(this.takers, t), !this.takers.has(t)) {
      const { [t]: e, ...s } = this.amounts;
      this.amounts = s;
    }
    this.emit();
  }
  setAmount(t, e) {
    this.amounts = { ...this.amounts, [t]: e }, this.emit();
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
  /** Build the rule, or null when it would be an equal split anyway. */
  build() {
    if (!this.enabled)
      return null;
    const t = this.envelopeInput.trim(), e = t === "" ? null : Z(t), s = {};
    for (const [r, i] of Object.entries(this.amounts)) {
      if (!this.takers.has(r) || i.trim() === "")
        continue;
      const a = Z(i);
      a !== null && (s[r] = a);
    }
    return {
      envelope: e,
      participants: this.participants.size === this.members.length ? null : [...this.participants],
      remainder: {
        // Nobody ticked: whoever paid takes the rest, the useful default.
        members: this.takers.size === 0 ? null : [...this.takers],
        fixed: s
      }
    };
  }
};
C.styles = [
  B,
  S`
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
        padding: 12px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .member-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0;
      }

      .member-row .name {
        flex: 1;
        font-size: 14px;
      }

      .member-row se-field {
        width: 110px;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }

      .preview {
        font-size: 13px;
        line-height: 1.6;
        padding: 10px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f1f1f1);
      }

      .preview .line {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }

      .preview strong {
        font-variant-numeric: tabular-nums;
      }
    `
];
z([
  l({ attribute: !1 })
], C.prototype, "localize", 2);
z([
  l({ attribute: !1 })
], C.prototype, "members", 2);
z([
  l({ attribute: !1 })
], C.prototype, "rule", 2);
z([
  l({ type: String })
], C.prototype, "currency", 2);
z([
  l({ type: String })
], C.prototype, "language", 2);
z([
  l({ type: Number })
], C.prototype, "amount", 2);
z([
  l({ type: String })
], C.prototype, "payerId", 2);
z([
  l({ type: Boolean })
], C.prototype, "required", 2);
z([
  c()
], C.prototype, "enabled", 2);
z([
  c()
], C.prototype, "envelopeInput", 2);
z([
  c()
], C.prototype, "participants", 2);
z([
  c()
], C.prototype, "takers", 2);
z([
  c()
], C.prototype, "amounts", 2);
C = z([
  x("se-split-rule-editor")
], C);
function Ze(t, e) {
  const s = new Set(t);
  return s.has(e) ? s.delete(e) : s.add(e), s;
}
var ls = Object.defineProperty, cs = Object.getOwnPropertyDescriptor, D = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? cs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && ls(e, s, i), i;
};
let E = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.name = "", this.icon = "", this.rule = null, this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      const t = {
        name: this.name.trim(),
        icon: this.icon.trim() || null,
        split_rule: this.rule
      };
      try {
        const e = this.category ? await this.api.updateCategory(this.category.id, t) : await this.api.createCategory({ group_id: this.group.id, ...t });
        this.dispatchEvent(
          new CustomEvent("category-saved", {
            detail: { category: e },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (e) {
        this.error = I(e, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.category && (this.name = this.category.name, this.icon = this.category.icon ?? "", this.rule = this.category.split_rule);
  }
  render() {
    const t = this.localize, e = this.category ? t("edit_category") : t("new_category");
    return n`
      <se-dialog open heading=${e} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : d}

          <se-field
            .label=${t("category_name")}
            .value=${this.name}
            required
            placeholder="Courses"
            @value-changed=${(s) => this.name = s.detail.value}
          ></se-field>

          <se-icon-picker
            .localize=${this.localize}
            .label=${t("icon")}
            .value=${this.icon}
            .color=${this.category?.color ?? "#5c6b8a"}
            @value-changed=${(s) => this.icon = s.detail.value}
          ></se-icon-picker>

          <div>
            <label class="muted">${t("default_split")}</label>
            <se-split-rule-editor
              .localize=${this.localize}
              .members=${this.members}
              .rule=${this.rule}
              .currency=${this.group.currency}
              .language=${this.language}
              @rule-changed=${(s) => this.rule = s.detail.rule}
            ></se-split-rule-editor>
          </div>
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${t("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || this.name.trim() === ""}
          @click=${this.submit}
        >
          ${this.category ? t("save") : t("create")}
        </se-button>
      </se-dialog>
    `;
  }
};
E.styles = B;
D([
  l({ attribute: !1 })
], E.prototype, "api", 2);
D([
  l({ attribute: !1 })
], E.prototype, "localize", 2);
D([
  l({ attribute: !1 })
], E.prototype, "group", 2);
D([
  l({ attribute: !1 })
], E.prototype, "members", 2);
D([
  l({ attribute: !1 })
], E.prototype, "category", 2);
D([
  l({ type: String })
], E.prototype, "language", 2);
D([
  c()
], E.prototype, "name", 2);
D([
  c()
], E.prototype, "icon", 2);
D([
  c()
], E.prototype, "rule", 2);
D([
  c()
], E.prototype, "busy", 2);
D([
  c()
], E.prototype, "error", 2);
E = D([
  x("se-category-dialog")
], E);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ds = (t) => (...e) => ({ _$litDirective$: t, values: e });
let ps = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, s, r) {
    this._$Ct = e, this._$AM = s, this._$Ci = r;
  }
  _$AS(e, s) {
    return this.update(e, s);
  }
  update(e, s) {
    return this.render(...s);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hs = {}, us = (t, e = hs) => t._$AH = e;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ms = ds(class extends ps {
  constructor() {
    super(...arguments), this.key = d;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, s]) {
    return e !== this.key && (us(t), this.key = e), s;
  }
});
var gs = Object.defineProperty, bs = Object.getOwnPropertyDescriptor, ne = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? bs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && gs(e, s, i), i;
};
let V = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.options = [], this.disabled = !1;
  }
  render() {
    return n`
      ${this.label ? n`<label>${this.label}</label>` : d}
      <select .value=${this.value} ?disabled=${this.disabled} @change=${this.handleChange}>
        ${this.placeholder ? n`<option value="" ?selected=${!this.value}>${this.placeholder}</option>` : d}
        ${this.options.map(
      (t) => n`
            <option value=${t.value} ?selected=${t.value === this.value}>
              ${t.label}
            </option>
          `
    )}
      </select>
    `;
  }
  handleChange(t) {
    const e = t.target.value;
    this.value = e, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
V.styles = S`
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
ne([
  l({ type: String })
], V.prototype, "label", 2);
ne([
  l({ type: String })
], V.prototype, "value", 2);
ne([
  l({ attribute: !1 })
], V.prototype, "options", 2);
ne([
  l({ type: String })
], V.prototype, "placeholder", 2);
ne([
  l({ type: Boolean })
], V.prototype, "disabled", 2);
V = ne([
  x("se-select")
], V);
var vs = Object.defineProperty, fs = Object.getOwnPropertyDescriptor, $ = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? fs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && vs(e, s, i), i;
};
let f = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = rt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.pickCategory = (t) => {
      this.categoryId = t.detail.value, this.rule = null;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const t = Z(this.amountInput), e = this.editor?.resolved();
      if (t === null || !e)
        return;
      this.busy = !0, this.error = void 0;
      const s = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: it(this.date),
        category_id: this.categoryId || null,
        description: this.description.trim() || null,
        shares: Object.entries(e).map(([r, i]) => ({
          member_id: r,
          amount: i
        }))
      };
      try {
        const r = this.expense ? await this.api.updateExpense(this.expense.id, {
          title: s.title,
          amount: s.amount,
          paid_by_member_id: s.paid_by_member_id,
          expense_date: s.expense_date,
          category_id: s.category_id,
          description: s.description,
          shares: s.shares
        }) : await this.api.createExpense(s);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: r },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (r) {
        this.error = I(r, this.localize);
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
        } catch (t) {
          this.error = I(t, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), !this.expense) {
      this.members.length > 0 && (this.paidBy = this.members[0].id);
      return;
    }
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = Pe(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = Wt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares();
  }
  /**
   * Reproduce the stored shares as a rule.
   *
   * Only for expenses saved before the rule was kept: spelling every amount out
   * is the one reading that cannot be wrong.
   */
  ruleFromStoredShares() {
    const t = (this.expense?.shares ?? []).filter((e) => e.amount !== 0);
    return t.length === 0 ? null : {
      envelope: 0,
      remainder: {
        members: t.map((e) => e.member_id),
        fixed: Object.fromEntries(
          t.map((e) => [e.member_id, e.amount])
        )
      }
    };
  }
  /** The rule of the category, then of the group, as the backend would pick. */
  defaultRule() {
    return this.categories.find((e) => e.id === this.categoryId)?.split_rule ?? this.group.split_rule ?? null;
  }
  render() {
    const t = this.localize, e = Z(this.amountInput), s = this.expense ? t("edit_expense") : t("new_expense");
    return n`
      <se-dialog open heading=${s} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : d}

          <se-field
            .label=${t("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(r) => this.expenseTitle = r.detail.value}
          ></se-field>

          <se-field
            .label=${t("description")}
            .value=${this.description}
            placeholder=${t("description_placeholder")}
            @value-changed=${(r) => this.description = r.detail.value}
          ></se-field>

          <se-field
            .label=${t("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            required
            decimal
            placeholder="85,42"
            @value-changed=${(r) => this.amountInput = r.detail.value}
          ></se-field>

          <se-select
            .label=${t("paid_by")}
            .value=${this.paidBy}
            .options=${this.members.map((r) => ({ value: r.id, label: r.name }))}
            @value-changed=${(r) => this.paidBy = r.detail.value}
          ></se-select>

          <se-field
            .label=${t("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(r) => this.date = r.detail.value}
          ></se-field>

          <se-select
            .label=${t("category")}
            .value=${this.categoryId}
            .placeholder=${t("no_category")}
            .options=${this.categories.map((r) => ({ value: r.id, label: r.name }))}
            @value-changed=${this.pickCategory}
          ></se-select>

          <div>
            <label class="muted">${t("split")}</label>
            ${this.renderEditor(e)}
          </div>
        </div>

        ${this.expense ? n`
              <se-button
                slot="actions"
                variant="danger"
                ?disabled=${this.busy}
                @click=${this.deleteExpense}
              >
                ${this.confirmingDelete ? t("confirm_delete") : t("delete")}
              </se-button>
              <span slot="actions" class="spacer"></span>
            ` : d}
        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${t("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || !this.isValid(e)}
          @click=${this.submit}
        >
          ${this.expense ? t("save") : t("create")}
        </se-button>
      </se-dialog>
    `;
  }
  /**
   * The same editor the category rule uses, on the real amount.
   *
   * Keyed on the category so picking one rebuilds it from that category's rule:
   * the default fills the screen in, and stays yours to overwrite.
   */
  renderEditor(t) {
    return ms(
      this.categoryId,
      n`
        <se-split-rule-editor
          required
          .localize=${this.localize}
          .members=${this.members}
          .rule=${this.rule ?? this.defaultRule()}
          .currency=${this.group.currency}
          .language=${this.language}
          .amount=${t}
          .payerId=${this.paidBy}
          @rule-changed=${(e) => this.rule = e.detail.rule}
        ></se-split-rule-editor>
      `
    );
  }
  isValid(t) {
    return this.expenseTitle.trim() === "" || t === null || t <= 0 || !this.paidBy || this.members.length === 0 ? !1 : this.editor?.resolved() != null;
  }
};
f.styles = [
  B,
  S`
      .total {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding-top: 8px;
      }
    `
];
$([
  l({ attribute: !1 })
], f.prototype, "api", 2);
$([
  l({ attribute: !1 })
], f.prototype, "localize", 2);
$([
  l({ attribute: !1 })
], f.prototype, "group", 2);
$([
  l({ attribute: !1 })
], f.prototype, "members", 2);
$([
  l({ attribute: !1 })
], f.prototype, "categories", 2);
$([
  l({ attribute: !1 })
], f.prototype, "expense", 2);
$([
  l({ type: String })
], f.prototype, "language", 2);
$([
  c()
], f.prototype, "expenseTitle", 2);
$([
  c()
], f.prototype, "description", 2);
$([
  c()
], f.prototype, "amountInput", 2);
$([
  c()
], f.prototype, "paidBy", 2);
$([
  c()
], f.prototype, "date", 2);
$([
  c()
], f.prototype, "categoryId", 2);
$([
  c()
], f.prototype, "rule", 2);
$([
  c()
], f.prototype, "busy", 2);
$([
  c()
], f.prototype, "error", 2);
$([
  c()
], f.prototype, "confirmingDelete", 2);
$([
  Mt("se-split-rule-editor")
], f.prototype, "editor", 2);
f = $([
  x("se-expense-dialog")
], f);
var ys = Object.defineProperty, $s = Object.getOwnPropertyDescriptor, T = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? $s(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && ys(e, s, i), i;
};
let P = class extends v {
  constructor() {
    super(...arguments), this.haUsers = [], this.members = [], this.memberships = [], this.newName = "", this.loading = !0, this.dirty = !1, this.addGuest = async () => {
      this.busy = "new", this.error = void 0;
      try {
        await this.api.createMember({
          name: this.newName.trim(),
          group_id: this.groupId
        }), this.newName = "", this.dirty = !0, await this.load();
      } catch (t) {
        this.error = I(t, this.localize);
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
    const t = this.localize;
    return n`
      <se-dialog open heading=${t("members")} @dialog-closed=${this.close}>
        ${this.loading ? n`<div class="empty">${t("loading")}</div>` : n`
              <div>
                ${this.error ? n`<div class="error">${this.error}</div>` : d}
                ${this.renderAccounts()} ${this.renderGuests()}
              </div>
            `}

        <se-button slot="actions" @click=${this.close}>
          ${t("close")}
        </se-button>
      </se-dialog>
    `;
  }
  renderAccounts() {
    const t = this.localize;
    return n`
      <div class="section">
        <h3>${t("ha_accounts")}</h3>
        <div class="muted">${t("ha_accounts_hint")}</div>

        ${this.haUsers.length === 0 ? n`<div class="empty">${t("no_ha_accounts")}</div>` : this.haUsers.map((e) => this.renderAccount(e))}
      </div>
    `;
  }
  renderAccount(t) {
    const e = this.memberForUser(t.id), s = this.isOwner(e);
    return n`
      <div class="row">
        <input
          type="checkbox"
          .checked=${e !== void 0}
          ?disabled=${s || this.busy !== void 0}
          title=${s ? this.localize("owner_locked") : ""}
          @change=${() => this.toggleAccount(t, e)}
        />
        <div class="avatar" style=${`background:${e?.color ?? U(t.id)}`}>
          ${X(t.name)}
        </div>
        <span class="name">${t.name}</span>
        ${s ? n`<span class="tag">${this.localize("group_owner")}</span>` : d}
      </div>
    `;
  }
  renderGuests() {
    const t = this.localize, e = this.members.filter((s) => s.user_id === null);
    return n`
      <div class="section">
        <h3>${t("guests")}</h3>
        <div class="muted">${t("guests_hint")}</div>

        ${e.map(
      (s) => n`
            <div class="row">
              <div
                class="avatar"
                style=${`background:${s.color ?? U(s.id)}`}
              >
                ${X(s.name)}
              </div>
              <span class="name">${s.name}</span>
              <button
                class="remove"
                ?disabled=${this.busy !== void 0}
                aria-label=${t("remove_member")}
                @click=${() => this.removeGuest(s)}
              >
                ×
              </button>
            </div>
          `
    )}

        <div class="add">
          <se-field
            .label=${t("member_name")}
            .value=${this.newName}
            placeholder="Clara"
            @value-changed=${(s) => this.newName = s.detail.value}
          ></se-field>
          <se-button
            variant="text"
            ?disabled=${this.busy !== void 0 || this.newName.trim() === ""}
            @click=${this.addGuest}
          >
            ${t("add")}
          </se-button>
        </div>
      </div>
    `;
  }
  memberForUser(t) {
    return this.members.find((e) => e.user_id === t);
  }
  /** The owner stays: the backend refuses to let them out of their group. */
  isOwner(t) {
    return t ? this.memberships.some(
      (e) => e.member_id === t.id && e.left_at === null && e.role === "owner"
    ) : !1;
  }
  async load() {
    this.error = void 0;
    try {
      const [t, e, s] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMemberships(this.groupId)
      ]);
      this.haUsers = t, this.members = e, this.memberships = s;
    } catch (t) {
      this.error = I(t, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  async toggleAccount(t, e) {
    this.busy = t.id, this.error = void 0;
    try {
      e ? await this.api.removeMemberFromGroup(this.groupId, e.id) : await this.api.createMember({
        name: t.name,
        group_id: this.groupId,
        user_id: t.id
      }), this.dirty = !0, await this.load();
    } catch (s) {
      this.error = I(s, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  async removeGuest(t) {
    this.busy = t.id, this.error = void 0;
    try {
      await this.api.removeMemberFromGroup(this.groupId, t.id), this.dirty = !0, await this.load();
    } catch (e) {
      this.error = I(e, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
};
P.styles = [
  B,
  S`
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
T([
  l({ attribute: !1 })
], P.prototype, "api", 2);
T([
  l({ attribute: !1 })
], P.prototype, "localize", 2);
T([
  l({ type: String })
], P.prototype, "groupId", 2);
T([
  c()
], P.prototype, "haUsers", 2);
T([
  c()
], P.prototype, "members", 2);
T([
  c()
], P.prototype, "memberships", 2);
T([
  c()
], P.prototype, "newName", 2);
T([
  c()
], P.prototype, "loading", 2);
T([
  c()
], P.prototype, "busy", 2);
T([
  c()
], P.prototype, "error", 2);
T([
  c()
], P.prototype, "dirty", 2);
P = T([
  x("se-member-dialog")
], P);
var _s = Object.defineProperty, xs = Object.getOwnPropertyDescriptor, k = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? xs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && _s(e, s, i), i;
};
let A = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = rt(), this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = Z(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: it(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-created", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = I(e, this.localize);
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = (this.settlement.amount / 100).toFixed(2);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const t = this.localize, e = Z(this.amountInput), s = this.members.map((r) => ({ value: r.id, label: r.name }));
    return n`
      <se-dialog open heading=${t("new_payment")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : d}

          <se-select
            .label=${t("from_member")}
            .value=${this.fromMember}
            .options=${s}
            @value-changed=${(r) => this.fromMember = r.detail.value}
          ></se-select>

          <se-select
            .label=${t("to_member")}
            .value=${this.toMember}
            .options=${s}
            @value-changed=${(r) => this.toMember = r.detail.value}
          ></se-select>

          <se-field
            .label=${t("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            decimal
            required
            @value-changed=${(r) => this.amountInput = r.detail.value}
          ></se-field>

          <se-field
            .label=${t("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(r) => this.date = r.detail.value}
          ></se-field>

          ${e !== null && e > 0 ? n`<div class="muted">
                ${G(e, this.group.currency, this.language)}
              </div>` : d}
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${t("cancel")}
        </se-button>
        <se-button slot="actions" ?disabled=${this.busy || !this.isValid(e)} @click=${this.submit}>
          ${t("save")}
        </se-button>
      </se-dialog>
    `;
  }
  isValid(t) {
    return t !== null && t > 0 && this.fromMember !== "" && this.toMember !== "" && this.fromMember !== this.toMember;
  }
};
A.styles = B;
k([
  l({ attribute: !1 })
], A.prototype, "api", 2);
k([
  l({ attribute: !1 })
], A.prototype, "localize", 2);
k([
  l({ attribute: !1 })
], A.prototype, "group", 2);
k([
  l({ attribute: !1 })
], A.prototype, "members", 2);
k([
  l({ attribute: !1 })
], A.prototype, "settlement", 2);
k([
  l({ type: String })
], A.prototype, "language", 2);
k([
  c()
], A.prototype, "fromMember", 2);
k([
  c()
], A.prototype, "toMember", 2);
k([
  c()
], A.prototype, "amountInput", 2);
k([
  c()
], A.prototype, "date", 2);
k([
  c()
], A.prototype, "busy", 2);
k([
  c()
], A.prototype, "error", 2);
A = k([
  x("se-payment-dialog")
], A);
var ws = Object.defineProperty, Cs = Object.getOwnPropertyDescriptor, y = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Cs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && ws(e, s, i), i;
};
const Je = 4;
let b = class extends v {
  constructor() {
    super(...arguments), this.language = "en", this.members = [], this.pastMembers = [], this.categories = [], this.expenses = [], this.payments = [], this.tab = "overview", this.loading = !0, this.busy = !1, this.handleQuickAction = (t) => {
      const e = t.detail.key;
      e === "expense" ? this.openExpense() : e === "payment" ? this.openPayment() : e === "member" ? this.tab = "members" : this.tab = "categories";
    }, this.closeDialog = () => {
      this.dialog = void 0, this.prefill = void 0, this.editedCategory = void 0, this.editedExpense = void 0;
    }, this.handleChanged = () => {
      this.closeDialog(), this.load();
    }, this.toggleArchive = async () => {
      if (this.group) {
        this.busy = !0, this.error = void 0;
        try {
          this.group = await this.api.archiveGroup(this.group.id, !this.group.archived);
        } catch (t) {
          this.error = I(t, this.localize);
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
    const t = this.localize;
    return this.loading || !this.group ? n`
        <div class="empty">${this.error ?? t("loading")}</div>
      ` : n`
      <div class="stack">
        <div class="header">
          <button class="back" @click=${this.goBack} aria-label=${t("back")}>‹</button>
          <h1>${this.group.name}</h1>
          ${this.group.archived ? n`<span class="archived-tag">${t("archived")}</span>` : d}
          <span class="spacer"></span>
          <se-button variant="text" ?disabled=${this.busy} @click=${this.toggleArchive}>
            ${this.group.archived ? t("restore") : t("archive")}
          </se-button>
        </div>

        ${this.group.archived ? n`<div class="banner">${t("archived_hint")}</div>` : d}

        ${this.error ? n`<div class="error">${this.error}</div>` : d}

        <div class="tabs" role="tablist">
          ${this.renderTab("overview", t("tab_overview"))}
          ${this.renderTab("expenses", t("tab_expenses"))}
          ${this.renderTab("settlements", t("tab_settlements"))}
          ${this.renderTab("members", t("tab_members"))}
          ${this.renderTab("categories", t("tab_categories"))}
        </div>

        ${this.renderTabContent()}
      </div>

      ${this.renderDialog()}
    `;
  }
  renderTab(t, e) {
    return n`
      <button role="tab" aria-selected=${this.tab === t} @click=${() => this.tab = t}>
        ${e}
      </button>
    `;
  }
  renderTabContent() {
    return this.tab === "overview" ? this.renderOverview() : this.tab === "expenses" ? this.renderExpenses() : this.tab === "settlements" ? this.renderSettlements() : this.tab === "categories" ? this.renderCategories() : this.renderMembers();
  }
  renderOverview() {
    const t = this.localize;
    return n`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.result?.balances ?? []}
        .members=${this.pastMembers}
        .currency=${this.group.currency}
        .language=${this.language}
      ></se-balance-card>

      <div class="card">
        <se-quick-actions
          .actions=${[
      {
        key: "expense",
        label: t("action_add_expense"),
        symbol: "+",
        color: "#2b7fd4"
      },
      {
        key: "member",
        label: t("action_members"),
        symbol: "👥",
        color: "#3f8a4a"
      },
      {
        key: "payment",
        label: t("action_settle"),
        symbol: "⇄",
        color: "#c9871f"
      },
      {
        key: "category",
        label: t("tab_categories"),
        symbol: "🏷",
        color: "#8b5fbf"
      }
    ]}
          @action=${this.handleQuickAction}
        ></se-quick-actions>
      </div>

      <div class="card">
        <div class="section-head">
          <h3>${t("recent_expenses")}</h3>
          ${this.expenses.length > Je ? n`<button class="link" @click=${() => this.tab = "expenses"}>
                ${t("see_all")}
              </button>` : d}
        </div>
        ${this.expenses.length === 0 ? n`<div class="empty">${t("no_expenses")}</div>` : this.expenses.slice(0, Je).map((e) => this.renderExpense(e))}
      </div>
    `;
  }
  renderSettlements() {
    const t = this.localize;
    return n`
      <div class="card">
        <h3 class="section-title">${t("reimbursements")}</h3>
        ${(this.result?.settlements ?? []).length === 0 ? n`<div class="empty">${t("balance_settled")}</div>` : this.result.settlements.map((e) => this.renderSettlement(e))}
      </div>

      <div class="card">
        <h3 class="section-title">${t("payments")}</h3>
        ${this.payments.length === 0 ? n`<div class="empty">${t("no_settlements")}</div>` : this.payments.map((e) => this.renderPayment(e))}
      </div>

      <div class="actions">
        <se-button @click=${() => this.openPayment()}>
          ${t("new_payment")}
        </se-button>
      </div>
    `;
  }
  renderPayment(t) {
    const e = this.memberById(t.from_member_id), s = this.memberById(t.to_member_id);
    return n`
      <div class="item">
        <se-icon
          icon="mdi:swap-horizontal"
          fallback="⇄"
          color="#c9871f"
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">${e?.name ?? "?"} → ${s?.name ?? "?"}</div>
          <div class="muted">${We(t.payment_date, this.language)}</div>
        </div>
        <span class="amount">
          ${G(t.amount, this.group.currency, this.language)}
        </span>
      </div>
    `;
  }
  renderCategories() {
    const t = this.localize;
    return n`
      <div class="card">
        ${this.categories.length === 0 ? n`<div class="empty">${t("no_categories")}</div>` : this.categories.map((e) => this.renderCategory(e))}
      </div>

      <div class="actions">
        <se-button @click=${() => this.openCategory()}>
          ${t("new_category")}
        </se-button>
      </div>
    `;
  }
  renderCategory(t) {
    return n`
      <button class="item item-button" @click=${() => this.openCategory(t)}>
        <div class="avatar" style=${`background:${t.color ?? U(t.id)}`}>
          ${t.name.charAt(0).toUpperCase()}
        </div>
        <div class="info">
          <div class="title">${t.name}</div>
          <div class="muted">${this.describeRule(t)}</div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }
  /** Summarize a split rule in one line, for the category list. */
  describeRule(t) {
    const e = t.split_rule?.envelope;
    if (e == null)
      return this.localize("rule_equal");
    const s = G(e, this.group.currency, this.language);
    return `${this.localize("rule_shares")} ${s}`;
  }
  renderSettlement(t) {
    const e = this.localize, s = this.memberById(t.from_member_id), r = this.memberById(t.to_member_id);
    return n`
      <div class="settlement">
        <span>
          <strong>${s?.name ?? "?"}</strong> ${e("owes")}
          <strong class="amount">
            ${G(t.amount, this.group.currency, this.language)}
          </strong>
          ${e("to")} <strong>${r?.name ?? "?"}</strong>
        </span>
        <span class="spacer"></span>
        <se-button variant="text" @click=${() => this.openPayment(t)}>
          ${e("settle_up")}
        </se-button>
      </div>
    `;
  }
  renderExpenses() {
    const t = this.localize;
    return n`
      <div class="card">
        ${this.expenses.length === 0 ? n`<div class="empty">${t("no_expenses")}</div>` : this.expenses.map((e) => this.renderExpense(e))}
      </div>

      <div class="actions">
        <se-button @click=${() => this.openExpense()}>
          ${t("new_expense")}
        </se-button>
      </div>
    `;
  }
  renderExpense(t) {
    const e = this.memberById(t.paid_by_member_id), s = this.categories.find((i) => i.id === t.category_id), r = e?.color ?? U(t.paid_by_member_id);
    return n`
      <button class="item item-button" @click=${() => this.openExpense(t)}>
        <se-icon
          .icon=${s?.icon}
          .fallback=${(s?.name ?? t.title).charAt(0).toUpperCase()}
          .color=${s?.color ?? U(s?.id ?? t.id)}
        ></se-icon>
        <div class="info">
          <div class="title">${t.title}</div>
          <div class="muted">
            ${We(t.expense_date, this.language)}
            ${s ? n` · ${s.name}` : d}
          </div>
          <div class="payer" style=${`color:${r}`}>
            ${this.localize("paid_by")} ${e?.name ?? "?"}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${G(t.amount, t.currency, this.language)}
          </span>
          ${this.renderParticipants(t)}
        </div>
      </button>
    `;
  }
  /** The members actually sharing the expense, stacked like on a receipt. */
  renderParticipants(t) {
    const e = (t.shares ?? []).filter((s) => s.amount !== 0);
    return e.length === 0 ? d : n`
      <div class="stack-avatars">
        ${e.map((s) => {
      const r = this.memberById(s.member_id);
      return n`
            <div
              class="avatar small"
              title=${r?.name ?? "?"}
              style=${`background:${r?.color ?? U(s.member_id)}`}
            >
              ${X(r?.name ?? "?")}
            </div>
          `;
    })}
      </div>
    `;
  }
  renderMembers() {
    const t = this.localize;
    return n`
      <div class="card">
        ${this.members.length === 0 ? n`<div class="empty">${t("no_members")}</div>` : this.members.map(
      (e) => n`
                <div class="item">
                  ${this.renderAvatar(e.name, e.id)}
                  <div class="info">
                    <div class="title">${e.name}</div>
                    ${e.user_id === null ? n`<div class="muted">${t("no_account")}</div>` : d}
                  </div>
                </div>
              `
    )}
      </div>

      <div class="actions">
        <se-button variant="text" @click=${() => this.dialog = "member"}>
          ${t("new_member")}
        </se-button>
      </div>
    `;
  }
  renderAvatar(t, e) {
    const s = this.memberById(e);
    return n`
      <div class="avatar" style=${`background:${s?.color ?? U(e)}`}>
        ${X(t)}
      </div>
    `;
  }
  renderDialog() {
    return !this.dialog || !this.group ? d : this.dialog === "expense" ? n`
        <se-expense-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .categories=${this.categories}
          .expense=${this.editedExpense}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @expense-saved=${this.handleChanged}
          @expense-deleted=${this.handleChanged}
        ></se-expense-dialog>
      ` : this.dialog === "payment" ? n`
        <se-payment-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .settlement=${this.prefill}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @payment-created=${this.handleChanged}
        ></se-payment-dialog>
      ` : this.dialog === "category" ? n`
        <se-category-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .category=${this.editedCategory}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @category-saved=${this.handleChanged}
        ></se-category-dialog>
      ` : n`
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
  memberById(t) {
    return this.pastMembers.find((e) => e.id === t);
  }
  async load() {
    this.error = void 0;
    try {
      const [t, e, s, r, i, a, o] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.listPayments(this.groupId),
        this.api.getBalances(this.groupId)
      ]);
      this.group = t, this.members = e, this.pastMembers = s, this.categories = r, this.expenses = i, this.payments = a, this.result = o;
    } catch (t) {
      this.error = I(t, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  openPayment(t) {
    this.prefill = t, this.dialog = "payment";
  }
  openCategory(t) {
    this.editedCategory = t, this.dialog = "category";
  }
  openExpense(t) {
    this.editedExpense = t, this.dialog = "expense";
  }
};
b.styles = [
  B,
  S`
      :host {
        display: block;
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .back {
        background: none;
        border: none;
        color: var(--primary-text-color);
        font-size: 22px;
        cursor: pointer;
        padding: 4px 8px;
      }

      .tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .tabs button {
        flex: 1;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 12px 4px;
        font-size: 14px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }

      .tabs button[aria-selected="true"] {
        color: var(--primary-color, #03a9f4);
        border-bottom-color: var(--primary-color, #03a9f4);
        font-weight: 500;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
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

      .item-button {
        border: none;
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

      .settlement {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        font-size: 14px;
      }

      .settlement + .settlement {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: 8px;
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

      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px 4px;
      }

      .link {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        cursor: pointer;
        font-family: inherit;
      }

      .payer {
        font-size: 13px;
        margin-top: 2px;
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
y([
  l({ attribute: !1 })
], b.prototype, "api", 2);
y([
  l({ attribute: !1 })
], b.prototype, "localize", 2);
y([
  l({ type: String })
], b.prototype, "groupId", 2);
y([
  l({ type: String })
], b.prototype, "language", 2);
y([
  c()
], b.prototype, "group", 2);
y([
  c()
], b.prototype, "members", 2);
y([
  c()
], b.prototype, "pastMembers", 2);
y([
  c()
], b.prototype, "categories", 2);
y([
  c()
], b.prototype, "expenses", 2);
y([
  c()
], b.prototype, "payments", 2);
y([
  c()
], b.prototype, "result", 2);
y([
  c()
], b.prototype, "tab", 2);
y([
  c()
], b.prototype, "loading", 2);
y([
  c()
], b.prototype, "error", 2);
y([
  c()
], b.prototype, "dialog", 2);
y([
  c()
], b.prototype, "prefill", 2);
y([
  c()
], b.prototype, "editedCategory", 2);
y([
  c()
], b.prototype, "editedExpense", 2);
y([
  c()
], b.prototype, "busy", 2);
b = y([
  x("se-group-page")
], b);
class As {
  constructor(e) {
    this.hass = e;
  }
  // Groups
  listGroups(e = !0) {
    return this.call("list_groups", { include_archived: e });
  }
  getGroup(e) {
    return this.call("get_group", { group_id: e });
  }
  createGroup(e) {
    return this.call("create_group", e);
  }
  updateGroup(e, s) {
    return this.call("update_group", { group_id: e, ...s });
  }
  archiveGroup(e, s) {
    return this.call("archive_group", { group_id: e, archived: s });
  }
  deleteGroup(e) {
    return this.call("delete_group", { group_id: e });
  }
  getBalances(e) {
    return this.call("get_balances", { group_id: e });
  }
  // Members
  /** The Home Assistant accounts a group can be built from. */
  listHaUsers() {
    return this.call("list_ha_users");
  }
  // `groupId` is required: the backend refuses to list every member of the
  // house, as that would leak the people of groups you have nothing to do with.
  listMembers(e, s = !1) {
    return this.call("list_members", {
      group_id: e,
      include_left: s
    });
  }
  listMemberships(e) {
    return this.call("list_memberships", { group_id: e });
  }
  createMember(e) {
    return this.call("create_member", e);
  }
  updateMember(e, s) {
    return this.call("update_member", { member_id: e, ...s });
  }
  removeMemberFromGroup(e, s) {
    return this.call("remove_member_from_group", {
      group_id: e,
      member_id: s
    });
  }
  // Categories
  listCategories(e) {
    return this.call("list_categories", { group_id: e });
  }
  createCategory(e) {
    return this.call("create_category", e);
  }
  updateCategory(e, s) {
    return this.call("update_category", { category_id: e, ...s });
  }
  deleteCategory(e) {
    return this.call("delete_category", { category_id: e });
  }
  // Expenses
  listExpenses(e, s = !0) {
    return this.call("list_expenses", { group_id: e, with_shares: s });
  }
  getExpense(e) {
    return this.call("get_expense", { expense_id: e });
  }
  createExpense(e) {
    return this.call("create_expense", e);
  }
  updateExpense(e, s) {
    return this.call("update_expense", { expense_id: e, ...s });
  }
  deleteExpense(e) {
    return this.call("delete_expense", { expense_id: e });
  }
  listExpenseShares(e) {
    return this.call("list_expense_shares", { group_id: e });
  }
  // Payments
  listPayments(e) {
    return this.call("list_payments", { group_id: e });
  }
  createPayment(e) {
    return this.call("create_payment", e);
  }
  deletePayment(e) {
    return this.call("delete_payment", { payment_id: e });
  }
  call(e, s = {}) {
    return this.hass.callWS({
      type: `shared_expenses/${e}`,
      ...s
    });
  }
}
var Ss = Object.defineProperty, Es = Object.getOwnPropertyDescriptor, be = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Es(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Ss(e, s, i), i;
};
let ee = class extends v {
  constructor() {
    super(...arguments), this.narrow = !1, this.syncFromRoute = () => {
      const t = this.route?.path ?? window.location.pathname, e = /\/group\/([^/?#]+)/.exec(t);
      this.groupId = e ? e[1] : void 0;
    }, this.handleGroupSelected = (t) => {
      this.groupId = t.detail.groupId, this.pushPath(`/group/${this.groupId}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.pushPath("");
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new As(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = qt(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
    return this.groupId ? n`
        <se-group-page
          .api=${this.api}
          .localize=${t}
          .groupId=${this.groupId}
          .language=${e}
          @navigate-back=${this.goToDashboard}
        ></se-group-page>
      ` : n`
      <se-dashboard-page
        .api=${this.api}
        .localize=${t}
        @group-selected=${this.handleGroupSelected}
      ></se-dashboard-page>
    `;
  }
  pushPath(t) {
    const e = this.route?.prefix ?? window.location.pathname.split("/")[1];
    history.pushState(null, "", `${e.startsWith("/") ? e : `/${e}`}${t}`);
  }
};
ee.styles = S`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
be([
  l({ attribute: !1 })
], ee.prototype, "hass", 2);
be([
  l({ type: Boolean })
], ee.prototype, "narrow", 2);
be([
  l({ attribute: !1 })
], ee.prototype, "route", 2);
be([
  c()
], ee.prototype, "groupId", 2);
ee = be([
  x("shared-expenses-panel")
], ee);
export {
  ee as SharedExpensesPanel
};
