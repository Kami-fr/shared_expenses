/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $e = globalThis, Ie = $e.ShadowRoot && ($e.ShadyCSS === void 0 || $e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Me = Symbol(), Be = /* @__PURE__ */ new WeakMap();
let st = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Me) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (Ie && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = Be.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Be.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ht = (t) => new st(typeof t == "string" ? t : t + "", void 0, Me), A = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, o) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[o + 1], t[0]);
  return new st(s, t, Me);
}, ut = (t, e) => {
  if (Ie) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = $e.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, Ge = Ie ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return ht(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: mt, defineProperty: gt, getOwnPropertyDescriptor: bt, getOwnPropertyNames: vt, getOwnPropertySymbols: ft, getPrototypeOf: yt } = Object, Ae = globalThis, He = Ae.trustedTypes, $t = He ? He.emptyScript : "", _t = Ae.reactiveElementPolyfillSupport, pe = (t, e) => t, _e = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? $t : null;
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
} }, De = (t, e) => !mt(t, e), qe = { attribute: !0, type: String, converter: _e, reflect: !1, useDefault: !1, hasChanged: De };
Symbol.metadata ??= Symbol("metadata"), Ae.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ie = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = qe) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && gt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: o } = bt(this.prototype, e) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: r, set(a) {
      const u = r?.call(this);
      o?.call(this, a), this.requestUpdate(e, u, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? qe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(pe("elementProperties"))) return;
    const e = yt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(pe("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(pe("properties"))) {
      const s = this.properties, i = [...vt(s), ...ft(s)];
      for (const r of i) this.createProperty(r, s[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, r] of s) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const r = this._$Eu(s, i);
      r !== void 0 && this._$Eh.set(r, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) s.unshift(Ge(r));
    } else e !== void 0 && s.push(Ge(e));
    return s;
  }
  static _$Eu(e, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const i of s.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ut(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, i) {
    this._$AK(e, i);
  }
  _$ET(e, s) {
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : _e).toAttribute(s, i.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : _e;
      this._$Em = r;
      const u = a.fromAttribute(s, o.type);
      this[r] = u ?? this._$Ej?.get(r) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (o = this[e]), i ??= a.getPropertyOptions(e), !((i.hasChanged ?? De)(o, s) || i.useDefault && i.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: r, wrapped: o }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? s ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, o] of i) {
        const { wrapped: a } = o, u = this[r];
        a !== !0 || this._$AL.has(r) || u === void 0 || this.C(r, void 0, o, u);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
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
ie.elementStyles = [], ie.shadowRootOptions = { mode: "open" }, ie[pe("elementProperties")] = /* @__PURE__ */ new Map(), ie[pe("finalized")] = /* @__PURE__ */ new Map(), _t?.({ ReactiveElement: ie }), (Ae.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Te = globalThis, Le = (t) => t, xe = Te.trustedTypes, Fe = xe ? xe.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, it = "$lit$", q = `lit$${Math.random().toFixed(9).slice(2)}$`, rt = "?" + q, xt = `<${rt}>`, J = document, he = () => J.createComment(""), ue = (t) => t === null || typeof t != "object" && typeof t != "function", je = Array.isArray, wt = (t) => je(t) || typeof t?.[Symbol.iterator] == "function", ze = `[ 	
\f\r]`, de = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ve = /-->/g, We = />/g, Y = RegExp(`>|${ze}(?:([^\\s"'>=/]+)(${ze}*=${ze}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ke = /'/g, Ye = /"/g, ot = /^(?:script|style|textarea|title)$/i, Ct = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = Ct(1), re = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Qe = /* @__PURE__ */ new WeakMap(), Q = J.createTreeWalker(J, 129);
function at(t, e) {
  if (!je(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Fe !== void 0 ? Fe.createHTML(e) : e;
}
const At = (t, e) => {
  const s = t.length - 1, i = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = de;
  for (let u = 0; u < s; u++) {
    const p = t[u];
    let m, b, h = -1, w = 0;
    for (; w < p.length && (a.lastIndex = w, b = a.exec(p), b !== null); ) w = a.lastIndex, a === de ? b[1] === "!--" ? a = Ve : b[1] !== void 0 ? a = We : b[2] !== void 0 ? (ot.test(b[2]) && (r = RegExp("</" + b[2], "g")), a = Y) : b[3] !== void 0 && (a = Y) : a === Y ? b[0] === ">" ? (a = r ?? de, h = -1) : b[1] === void 0 ? h = -2 : (h = a.lastIndex - b[2].length, m = b[1], a = b[3] === void 0 ? Y : b[3] === '"' ? Ye : Ke) : a === Ye || a === Ke ? a = Y : a === Ve || a === We ? a = de : (a = Y, r = void 0);
    const x = a === Y && t[u + 1].startsWith("/>") ? " " : "";
    o += a === de ? p + xt : h >= 0 ? (i.push(m), p.slice(0, h) + it + p.slice(h) + q + x) : p + q + (h === -2 ? u : x);
  }
  return [at(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class me {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let o = 0, a = 0;
    const u = e.length - 1, p = this.parts, [m, b] = At(e, s);
    if (this.el = me.createElement(m, i), Q.currentNode = this.el.content, s === 2 || s === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = Q.nextNode()) !== null && p.length < u; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(it)) {
          const w = b[a++], x = r.getAttribute(h).split(q), D = /([.?@])?(.*)/.exec(w);
          p.push({ type: 1, index: o, name: D[2], strings: x, ctor: D[1] === "." ? kt : D[1] === "?" ? zt : D[1] === "@" ? Et : Se }), r.removeAttribute(h);
        } else h.startsWith(q) && (p.push({ type: 6, index: o }), r.removeAttribute(h));
        if (ot.test(r.tagName)) {
          const h = r.textContent.split(q), w = h.length - 1;
          if (w > 0) {
            r.textContent = xe ? xe.emptyScript : "";
            for (let x = 0; x < w; x++) r.append(h[x], he()), Q.nextNode(), p.push({ type: 2, index: ++o });
            r.append(h[w], he());
          }
        }
      } else if (r.nodeType === 8) if (r.data === rt) p.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(q, h + 1)) !== -1; ) p.push({ type: 7, index: o }), h += q.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const i = J.createElement("template");
    return i.innerHTML = e, i;
  }
}
function oe(t, e, s = t, i) {
  if (e === re) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const o = ue(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = oe(t, r._$AS(t, e.values), r, i)), e;
}
class St {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? J).importNode(s, !0);
    Q.currentNode = r;
    let o = Q.nextNode(), a = 0, u = 0, p = i[0];
    for (; p !== void 0; ) {
      if (a === p.index) {
        let m;
        p.type === 2 ? m = new be(o, o.nextSibling, this, e) : p.type === 1 ? m = new p.ctor(o, p.name, p.strings, this, e) : p.type === 6 && (m = new Pt(o, this, e)), this._$AV.push(m), p = i[++u];
      }
      a !== p?.index && (o = Q.nextNode(), a++);
    }
    return Q.currentNode = J, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class be {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, r) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = oe(this, e, s), ue(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== re && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : wt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && ue(this._$AH) ? this._$AA.nextSibling.data = e : this.T(J.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = me.createElement(at(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const o = new St(r, this), a = o.u(this.options);
      o.p(s), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let s = Qe.get(e.strings);
    return s === void 0 && Qe.set(e.strings, s = new me(e)), s;
  }
  k(e) {
    je(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const o of e) r === s.length ? s.push(i = new be(this.O(he()), this.O(he()), this, this.options)) : i = s[r], i._$AI(o), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = Le(e).nextSibling;
      Le(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class Se {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, r, o) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = s, this._$AM = r, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(e, s = this, i, r) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = oe(this, e, s, 0), a = !ue(e) || e !== this._$AH && e !== re, a && (this._$AH = e);
    else {
      const u = e;
      let p, m;
      for (e = o[0], p = 0; p < o.length - 1; p++) m = oe(this, u[i + p], s, p), m === re && (m = this._$AH[p]), a ||= !ue(m) || m !== this._$AH[p], m === d ? e = d : e !== d && (e += (m ?? "") + o[p + 1]), this._$AH[p] = m;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class kt extends Se {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class zt extends Se {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Et extends Se {
  constructor(e, s, i, r, o) {
    super(e, s, i, r, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = oe(this, e, s, 0) ?? d) === re) return;
    const i = this._$AH, r = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== d && (i === d || r);
    r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Pt {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    oe(this, e);
  }
}
const Ot = Te.litHtmlPolyfillSupport;
Ot?.(me, be), (Te.litHtmlVersions ??= []).push("3.3.3");
const It = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const o = s?.renderBefore ?? null;
    i._$litPart$ = r = new be(e.insertBefore(he(), o), o, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ue = globalThis;
let f = class extends ie {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = It(s, this.renderRoot, this.renderOptions);
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
f._$litElement$ = !0, f.finalized = !0, Ue.litElementHydrateSupport?.({ LitElement: f });
const Mt = Ue.litElementPolyfillSupport;
Mt?.({ LitElement: f });
(Ue.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _ = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Dt = { attribute: !0, type: String, converter: _e, reflect: !1, hasChanged: De }, Tt = (t = Dt, e, s) => {
  const { kind: i, metadata: r } = s;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(s.name, t), i === "accessor") {
    const { name: a } = s;
    return { set(u) {
      const p = e.get.call(this);
      e.set.call(this, u), this.requestUpdate(a, p, t, !0, u);
    }, init(u) {
      return u !== void 0 && this.C(a, void 0, t, u), u;
    } };
  }
  if (i === "setter") {
    const { name: a } = s;
    return function(u) {
      const p = this[a];
      e.call(this, u), this.requestUpdate(a, p, t, !0, u);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function l(t) {
  return (e, s) => typeof s == "object" ? Tt(t, e, s) : ((i, r, o) => {
    const a = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, i), a ? Object.getOwnPropertyDescriptor(r, o) : void 0;
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
const jt = (t, e, s) => (s.configurable = !0, s.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, s), s);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ut(t, e) {
  return (s, i, r) => {
    const o = (a) => a.renderRoot?.querySelector(t) ?? null;
    return jt(s, i, { get() {
      return o(this);
    } });
  };
}
var Rt = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, ke = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Nt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Rt(e, s, r), r;
};
let ae = class extends f {
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
ae.styles = A`
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
ke([
  l({ type: String })
], ae.prototype, "variant", 2);
ke([
  l({ type: Boolean })
], ae.prototype, "disabled", 2);
ke([
  l({ type: String })
], ae.prototype, "icon", 2);
ae = ke([
  _("se-button")
], ae);
var Bt = Object.defineProperty, Gt = Object.getOwnPropertyDescriptor, Re = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Gt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Bt(e, s, r), r;
};
let ge = class extends f {
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
ge.styles = A`
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
Re([
  l({ type: String })
], ge.prototype, "heading", 2);
Re([
  l({ type: Boolean, reflect: !0 })
], ge.prototype, "open", 2);
ge = Re([
  _("se-dialog")
], ge);
var Ht = Object.defineProperty, qt = Object.getOwnPropertyDescriptor, B = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? qt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Ht(e, s, r), r;
};
let T = class extends f {
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
T.styles = A`
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
B([
  l({ type: String })
], T.prototype, "label", 2);
B([
  l({ type: String })
], T.prototype, "value", 2);
B([
  l({ type: String })
], T.prototype, "type", 2);
B([
  l({ type: String })
], T.prototype, "placeholder", 2);
B([
  l({ type: String })
], T.prototype, "suffix", 2);
B([
  l({ type: String })
], T.prototype, "helper", 2);
B([
  l({ type: Boolean })
], T.prototype, "required", 2);
B([
  l({ type: Boolean })
], T.prototype, "disabled", 2);
B([
  l({ type: Boolean })
], T.prototype, "decimal", 2);
T = B([
  _("se-field")
], T);
const we = {
  app_title: "Shared Expenses",
  groups: "Groups",
  no_groups: "No group yet. Create one to get started.",
  new_group: "New group",
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
  recent_activity: "Recent activity",
  no_activity: "Nothing has happened yet.",
  a_settlement: "Settlement",
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
  color: "Colour",
  pick_color: "Change the colour",
  color_auto: "Automatic",
  color_auto_short: "AUTO",
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
}, Lt = {
  app_title: "Dépenses partagées",
  groups: "Groupes",
  no_groups: "Aucun groupe pour l'instant. Créez-en un pour commencer.",
  new_group: "Nouveau groupe",
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
  recent_activity: "Dernière activité",
  no_activity: "Rien ne s'est encore passé.",
  a_settlement: "Remboursement",
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
  color: "Couleur",
  pick_color: "Changer la couleur",
  color_auto: "Automatique",
  color_auto_short: "AUTO",
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
}, Ft = { en: we, fr: Lt };
function Vt(t) {
  const e = Ft[t.split("-")[0]] ?? we;
  return (s) => e[s] ?? we[s] ?? s;
}
function E(t, e) {
  const s = t?.code;
  return s && s in we ? e(s) : t?.message || e("error_generic");
}
const U = A`
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
var Wt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, K = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Kt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Wt(e, s, r), r;
};
let N = class extends f {
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
        this.error = E(t, this.localize);
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
N.styles = U;
K([
  l({ attribute: !1 })
], N.prototype, "api", 2);
K([
  l({ attribute: !1 })
], N.prototype, "localize", 2);
K([
  c()
], N.prototype, "name", 2);
K([
  c()
], N.prototype, "description", 2);
K([
  c()
], N.prototype, "currency", 2);
K([
  c()
], N.prototype, "busy", 2);
K([
  c()
], N.prototype, "error", 2);
N = K([
  _("se-group-dialog")
], N);
var Yt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, se = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Yt(e, s, r), r;
};
let G = class extends f {
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
      this.error = E(t, this.localize);
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
G.styles = [
  U,
  A`
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
se([
  l({ attribute: !1 })
], G.prototype, "api", 2);
se([
  l({ attribute: !1 })
], G.prototype, "localize", 2);
se([
  c()
], G.prototype, "groups", 2);
se([
  c()
], G.prototype, "loading", 2);
se([
  c()
], G.prototype, "error", 2);
se([
  c()
], G.prototype, "dialogOpen", 2);
G = se([
  _("se-dashboard-page")
], G);
function L(t, e, s) {
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
function Ze(t, e) {
  const s = new Intl.DateTimeFormat(e, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function nt() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function lt(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function Zt(t) {
  const e = new Date(t), s = `${e.getMonth() + 1}`.padStart(2, "0"), i = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${s}-${i}`;
}
function Pe(t) {
  return (t / 100).toFixed(2);
}
function X(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
const Oe = [
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
function R(t) {
  let e = 0;
  for (let s = 0; s < t.length; s += 1)
    e = e * 31 + t.charCodeAt(s) >>> 0;
  return Oe[e % Oe.length];
}
var Jt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, ne = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Xt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Jt(e, s, r), r;
};
let F = class extends f {
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
    const e = [...t].sort((s, i) => i.amount - s.amount);
    return n`
      <div class="duel">
        ${this.renderSide(e[0], !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(e[1], !0)}
      </div>
    `;
  }
  renderSide(t, e) {
    const s = this.memberById(t.member_id), i = t.amount > 0, r = i ? "positive" : "negative", o = n`
      <div class="avatar" style=${`background:${s?.color ?? R(t.member_id)}`}>
        ${X(s?.name ?? "?")}
      </div>
    `, a = n`
      <div class="body">
        <div class="name">${s?.name ?? "?"}</div>
        <div class=${`verdict ${r}`}>
          ${i ? this.localize("must_receive") : this.localize("must_pay")}
        </div>
        <div class=${`figure ${r}`}>
          ${L(Math.abs(t.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return n`
      <div class=${`side ${e ? "right" : ""}`}>
        ${e ? d : o}${a}${e ? o : d}
      </div>
    `;
  }
  renderRow(t) {
    const e = this.memberById(t.member_id), s = t.amount > 0, i = s ? "positive" : "negative";
    return n`
      <div class="row">
        <div class="avatar" style=${`background:${e?.color ?? R(t.member_id)}`}>
          ${X(e?.name ?? "?")}
        </div>
        <span class="name">${e?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${i}`}>
            ${s ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${i}`}>
            ${L(Math.abs(t.amount), this.currency, this.language)}
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
  U,
  A`
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
ne([
  l({ attribute: !1 })
], F.prototype, "localize", 2);
ne([
  l({ attribute: !1 })
], F.prototype, "balances", 2);
ne([
  l({ attribute: !1 })
], F.prototype, "members", 2);
ne([
  l({ type: String })
], F.prototype, "currency", 2);
ne([
  l({ type: String })
], F.prototype, "language", 2);
F = ne([
  _("se-balance-card")
], F);
var es = Object.defineProperty, ts = Object.getOwnPropertyDescriptor, le = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ts(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && es(e, s, r), r;
};
let V = class extends f {
  constructor() {
    super(...arguments), this.fallback = "?", this.color = "#5c6b8a", this.size = 40, this.plain = !1;
  }
  render() {
    if (this.plain)
      return n`
        <div
          class="bare"
          style=${`--mdc-icon-size: ${this.size}px; font-size: ${this.size}px;`}
        >
          ${this.renderContent()}
        </div>
      `;
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
V.styles = A`
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
le([
  l({ type: String })
], V.prototype, "icon", 2);
le([
  l({ type: String })
], V.prototype, "fallback", 2);
le([
  l({ type: String })
], V.prototype, "color", 2);
le([
  l({ type: Number })
], V.prototype, "size", 2);
le([
  l({ type: Boolean })
], V.prototype, "plain", 2);
V = le([
  _("se-icon")
], V);
var ss = Object.defineProperty, is = Object.getOwnPropertyDescriptor, ct = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? is(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ss(e, s, r), r;
};
let Ce = class extends f {
  constructor() {
    super(...arguments), this.actions = [];
  }
  render() {
    return n`
      <div class="row">
        ${this.actions.map(
      (t) => n`
            <button @click=${() => this.emit(t.key)} aria-label=${t.label}>
              <se-icon
                class="bubble"
                .icon=${t.icon}
                .fallback=${t.fallback}
                .color=${t.color}
                .size=${52}
              ></se-icon>
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
Ce.styles = A`
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
ct([
  l({ attribute: !1 })
], Ce.prototype, "actions", 2);
Ce = ct([
  _("se-quick-actions")
], Ce);
var rs = Object.defineProperty, os = Object.getOwnPropertyDescriptor, ve = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? os(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && rs(e, s, r), r;
};
let ee = class extends f {
  constructor() {
    super(...arguments), this.label = "", this.value = null, this.fallback = "#5c6b8a";
  }
  render() {
    const t = this.localize;
    return n`
      ${this.label ? n`<label>${this.label}</label>` : d}

      <div class="swatches">
        <button
          class="auto"
          title=${t("color_auto")}
          aria-pressed=${this.value === null}
          style=${`background:${this.fallback}`}
          @click=${() => this.pick(null)}
        >
          ${t("color_auto_short")}
        </button>

        ${Oe.map(
      (e) => n`
            <button
              aria-pressed=${this.value === e}
              title=${e}
              style=${`background:${e}`}
              @click=${() => this.pick(e)}
            >
              ${this.value === e ? "✓" : ""}
            </button>
          `
    )}
      </div>
    `;
  }
  pick(t) {
    this.value = t, this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
ee.styles = [
  U,
  A`
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
ve([
  l({ attribute: !1 })
], ee.prototype, "localize", 2);
ve([
  l({ type: String })
], ee.prototype, "label", 2);
ve([
  l({ type: String })
], ee.prototype, "value", 2);
ve([
  l({ type: String })
], ee.prototype, "fallback", 2);
ee = ve([
  _("se-color-picker")
], ee);
var as = Object.defineProperty, ns = Object.getOwnPropertyDescriptor, H = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ns(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && as(e, s, r), r;
};
const Je = "/static/mdi/iconList.json", Ee = 48;
let ye = null;
function ls() {
  return ye === null && (ye = fetch(Je).then((t) => {
    if (!t.ok)
      throw new Error(`${t.status} on ${Je}`);
    return t.json();
  }).catch((t) => {
    throw ye = null, t;
  })), ye;
}
let j = class extends f {
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
        this.icons = await ls();
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
    const s = [], i = [], r = [];
    for (const o of this.icons)
      if (o.name.startsWith(e) ? s.push(o) : o.name.includes(e) ? i.push(o) : o.keywords?.some((a) => a.includes(e)) && r.push(o), s.length >= Ee)
        break;
    this.suggestions = [...s, ...i, ...r].slice(0, Ee);
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
  U,
  A`
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
H([
  l({ attribute: !1 })
], j.prototype, "localize", 2);
H([
  l({ type: String })
], j.prototype, "label", 2);
H([
  l({ type: String })
], j.prototype, "value", 2);
H([
  l({ type: String })
], j.prototype, "color", 2);
H([
  c()
], j.prototype, "icons", 2);
H([
  c()
], j.prototype, "suggestions", 2);
H([
  c()
], j.prototype, "open", 2);
H([
  c()
], j.prototype, "failed", 2);
j = H([
  _("se-icon-picker")
], j);
function Xe(t) {
  const { amount: e, payerId: s, memberIds: i } = t;
  if (!Number.isInteger(e) || e <= 0)
    return null;
  const r = [...new Set(i)];
  if (r.length === 0 || !r.includes(s))
    return null;
  const o = t.rule ?? {}, a = cs(o, e);
  if (a === null)
    return null;
  const u = o.participants == null ? r : [...new Set(o.participants)];
  if (u.some((x) => !r.includes(x)))
    return null;
  const p = u.length === 0 ? 0 : a, m = dt(p, u), b = e - p;
  if (b > 0) {
    const x = ds(o.remainder, b, s, r);
    if (x === null)
      return null;
    for (const [D, pt] of Object.entries(x))
      m[D] = (m[D] ?? 0) + pt;
  }
  const h = {};
  for (const [x, D] of Object.entries(m))
    D !== 0 && (h[x] = D);
  return Object.values(h).reduce((x, D) => x + D, 0) === e ? h : null;
}
function cs(t, e) {
  return t.envelope == null ? e : t.envelope < 0 ? null : Math.min(t.envelope, e);
}
function ds(t, e, s, i) {
  const r = t ?? {}, o = r.fixed ?? {};
  for (const [h, w] of Object.entries(o))
    if (!i.includes(h) || w < 0)
      return null;
  const a = r.members == null ? [s] : [...new Set(r.members)];
  if (a.length === 0 || a.some((h) => !i.includes(h)))
    return null;
  const u = {};
  for (const h of a)
    h in o && (u[h] = o[h]);
  const p = Object.values(u).reduce((h, w) => h + w, 0);
  if (p > e)
    return null;
  const m = a.filter((h) => !(h in u));
  if (m.length === 0)
    return p === e ? u : null;
  const b = { ...u };
  for (const [h, w] of Object.entries(
    dt(e - p, m)
  ))
    b[h] = (b[h] ?? 0) + w;
  return b;
}
function dt(t, e) {
  if (t <= 0 || e.length === 0)
    return {};
  const s = Math.floor(t / e.length), i = t % e.length, r = {};
  return e.forEach((o, a) => {
    r[o] = s + (a < i ? 1 : 0);
  }), r;
}
var ps = Object.defineProperty, hs = Object.getOwnPropertyDescriptor, P = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? hs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ps(e, s, r), r;
};
const us = 8542;
let C = class extends f {
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
    return this.amount != null && this.amount > 0 ? this.amount : us;
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
            @value-changed=${(i) => this.setEnvelope(i.detail.value)}
          ></se-field>

          <div class="muted" style="margin-top:8px">
            ${t("shared_between")}
          </div>
          ${this.members.map((i) => this.renderParticipant(i))}
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
    const t = this.members.find((r) => r.id === this.payerId) ?? this.members[0];
    if (!t)
      return d;
    const e = this.previewAmount, s = Xe({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((r) => r.id),
      rule: this.build()
    });
    if (s === null)
      return n`<div class="preview negative">${this.localize("rule_invalid")}</div>`;
    const i = (r) => L(r, this.currency, this.language);
    return n`
      <div class="preview">
        <div class="muted">
          ${this.localize("rule_preview_intro")} ${i(e)}
          ${this.localize("rule_preview_paid_by")} ${t.name} :
        </div>
        ${this.members.map(
      (r) => n`
            <div class="line">
              <span>${r.name}</span>
              <strong>${i(s[r.id] ?? 0)}</strong>
            </div>
          `
    )}
      </div>
    `;
  }
  /** The rule as filled in, for the caller to store alongside the shares. */
  currentRule() {
    return this.build();
  }
  /** The shares this rule resolves to, for the caller to store. */
  resolved() {
    const t = this.members.find((e) => e.id === this.payerId) ?? this.members[0];
    return !t || this.amount == null ? null : Xe({
      amount: this.amount,
      payerId: t.id,
      memberIds: this.members.map((e) => e.id),
      rule: this.build()
    });
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? R(t.id)}`}>
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
    this.participants = et(this.participants, t), this.emit();
  }
  toggleTaker(t) {
    if (this.takers = et(this.takers, t), !this.takers.has(t)) {
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
    for (const [i, r] of Object.entries(this.amounts)) {
      if (!this.takers.has(i) || r.trim() === "")
        continue;
      const o = Z(r);
      o !== null && (s[i] = o);
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
  U,
  A`
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
P([
  l({ attribute: !1 })
], C.prototype, "localize", 2);
P([
  l({ attribute: !1 })
], C.prototype, "members", 2);
P([
  l({ attribute: !1 })
], C.prototype, "rule", 2);
P([
  l({ type: String })
], C.prototype, "currency", 2);
P([
  l({ type: String })
], C.prototype, "language", 2);
P([
  l({ type: Number })
], C.prototype, "amount", 2);
P([
  l({ type: String })
], C.prototype, "payerId", 2);
P([
  l({ type: Boolean })
], C.prototype, "required", 2);
P([
  c()
], C.prototype, "enabled", 2);
P([
  c()
], C.prototype, "envelopeInput", 2);
P([
  c()
], C.prototype, "participants", 2);
P([
  c()
], C.prototype, "takers", 2);
P([
  c()
], C.prototype, "amounts", 2);
C = P([
  _("se-split-rule-editor")
], C);
function et(t, e) {
  const s = new Set(t);
  return s.has(e) ? s.delete(e) : s.add(e), s;
}
var ms = Object.defineProperty, gs = Object.getOwnPropertyDescriptor, O = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? gs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ms(e, s, r), r;
};
let S = class extends f {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.name = "", this.icon = "", this.color = null, this.rule = null, this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      const t = {
        name: this.name.trim(),
        icon: this.icon.trim() || null,
        color: this.color,
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
        this.error = E(e, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.category && (this.name = this.category.name, this.icon = this.category.icon ?? "", this.color = this.category.color, this.rule = this.category.split_rule);
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
            .color=${this.effectiveColor()}
            @value-changed=${(s) => this.icon = s.detail.value}
          ></se-icon-picker>

          <se-color-picker
            .localize=${this.localize}
            .label=${t("color")}
            .value=${this.color}
            .fallback=${this.autoColor()}
            @value-changed=${(s) => this.color = s.detail.value}
          ></se-color-picker>

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
    return R(this.category?.id ?? this.name);
  }
};
S.styles = U;
O([
  l({ attribute: !1 })
], S.prototype, "api", 2);
O([
  l({ attribute: !1 })
], S.prototype, "localize", 2);
O([
  l({ attribute: !1 })
], S.prototype, "group", 2);
O([
  l({ attribute: !1 })
], S.prototype, "members", 2);
O([
  l({ attribute: !1 })
], S.prototype, "category", 2);
O([
  l({ type: String })
], S.prototype, "language", 2);
O([
  c()
], S.prototype, "name", 2);
O([
  c()
], S.prototype, "icon", 2);
O([
  c()
], S.prototype, "color", 2);
O([
  c()
], S.prototype, "rule", 2);
O([
  c()
], S.prototype, "busy", 2);
O([
  c()
], S.prototype, "error", 2);
S = O([
  _("se-category-dialog")
], S);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bs = (t) => (...e) => ({ _$litDirective$: t, values: e });
let vs = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, s, i) {
    this._$Ct = e, this._$AM = s, this._$Ci = i;
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
const fs = {}, ys = (t, e = fs) => t._$AH = e;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $s = bs(class extends vs {
  constructor() {
    super(...arguments), this.key = d;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, s]) {
    return e !== this.key && (ys(t), this.key = e), s;
  }
});
var _s = Object.defineProperty, xs = Object.getOwnPropertyDescriptor, ce = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? xs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && _s(e, s, r), r;
};
let W = class extends f {
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
W.styles = A`
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
ce([
  l({ type: String })
], W.prototype, "label", 2);
ce([
  l({ type: String })
], W.prototype, "value", 2);
ce([
  l({ attribute: !1 })
], W.prototype, "options", 2);
ce([
  l({ type: String })
], W.prototype, "placeholder", 2);
ce([
  l({ type: Boolean })
], W.prototype, "disabled", 2);
W = ce([
  _("se-select")
], W);
var ws = Object.defineProperty, Cs = Object.getOwnPropertyDescriptor, $ = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Cs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ws(e, s, r), r;
};
let y = class extends f {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = nt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.pickCategory = (t) => {
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
        expense_date: lt(this.date),
        category_id: this.categoryId || null,
        description: this.description.trim() || null,
        shares: Object.entries(e).map(([i, r]) => ({
          member_id: i,
          amount: r
        })),
        // The shares are the truth, but the rule has to travel with them, or
        // reopening the expense could only ever spell the amounts back out.
        split_rule: this.editor?.currentRule() ?? null
      };
      try {
        const i = this.expense ? await this.api.updateExpense(this.expense.id, {
          title: s.title,
          amount: s.amount,
          paid_by_member_id: s.paid_by_member_id,
          expense_date: s.expense_date,
          category_id: s.category_id,
          description: s.description,
          shares: s.shares,
          split_rule: s.split_rule
        }) : await this.api.createExpense(s);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: i },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (i) {
        this.error = E(i, this.localize);
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
          this.error = E(t, this.localize), this.confirmingDelete = !1;
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
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = Pe(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = Zt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares();
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
            @value-changed=${(i) => this.expenseTitle = i.detail.value}
          ></se-field>

          <se-field
            .label=${t("description")}
            .value=${this.description}
            placeholder=${t("description_placeholder")}
            @value-changed=${(i) => this.description = i.detail.value}
          ></se-field>

          <se-field
            .label=${t("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            required
            decimal
            placeholder="85,42"
            @value-changed=${(i) => this.amountInput = i.detail.value}
          ></se-field>

          <se-select
            .label=${t("paid_by")}
            .value=${this.paidBy}
            .options=${this.members.map((i) => ({ value: i.id, label: i.name }))}
            @value-changed=${(i) => this.paidBy = i.detail.value}
          ></se-select>

          <se-field
            .label=${t("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(i) => this.date = i.detail.value}
          ></se-field>

          <se-select
            .label=${t("category")}
            .value=${this.categoryId}
            .placeholder=${t("no_category")}
            .options=${this.categories.map((i) => ({ value: i.id, label: i.name }))}
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
    return $s(
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
y.styles = [
  U,
  A`
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
], y.prototype, "api", 2);
$([
  l({ attribute: !1 })
], y.prototype, "localize", 2);
$([
  l({ attribute: !1 })
], y.prototype, "group", 2);
$([
  l({ attribute: !1 })
], y.prototype, "members", 2);
$([
  l({ attribute: !1 })
], y.prototype, "categories", 2);
$([
  l({ attribute: !1 })
], y.prototype, "expense", 2);
$([
  l({ type: String })
], y.prototype, "language", 2);
$([
  c()
], y.prototype, "expenseTitle", 2);
$([
  c()
], y.prototype, "description", 2);
$([
  c()
], y.prototype, "amountInput", 2);
$([
  c()
], y.prototype, "paidBy", 2);
$([
  c()
], y.prototype, "date", 2);
$([
  c()
], y.prototype, "categoryId", 2);
$([
  c()
], y.prototype, "rule", 2);
$([
  c()
], y.prototype, "busy", 2);
$([
  c()
], y.prototype, "error", 2);
$([
  c()
], y.prototype, "confirmingDelete", 2);
$([
  Ut("se-split-rule-editor")
], y.prototype, "editor", 2);
y = $([
  _("se-expense-dialog")
], y);
var As = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, I = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ss(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && As(e, s, r), r;
};
let k = class extends f {
  constructor() {
    super(...arguments), this.haUsers = [], this.members = [], this.memberships = [], this.newName = "", this.loading = !0, this.dirty = !1, this.addGuest = async () => {
      this.busy = "new", this.error = void 0;
      try {
        await this.api.createMember({
          name: this.newName.trim(),
          group_id: this.groupId
        }), this.newName = "", this.dirty = !0, await this.load();
      } catch (t) {
        this.error = E(t, this.localize);
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
        ${this.renderTintable(e, t.name, t.id)}
        <span class="name">${t.name}</span>
        ${s ? n`<span class="tag">${this.localize("group_owner")}</span>` : d}
      </div>
      ${this.renderPalette(e)}
    `;
  }
  /**
   * A member's avatar, clickable to recolour them.
   *
   * The avatar is what the colour actually shows up in, so it is the obvious
   * thing to press. Members with no account yet have nothing to recolour.
   */
  renderTintable(t, e, s) {
    const i = t?.color ?? R(s);
    return t ? n`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${i}`}
        @click=${() => this.toggleTint(t.id)}
      >
        ${X(e)}
      </button>
    ` : n`
        <div class="avatar" style=${`background:${i}`}>${X(e)}</div>
      `;
  }
  renderPalette(t) {
    return !t || this.tinting !== t.id ? d : n`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${t.color}
          .fallback=${R(t.id)}
          @value-changed=${(e) => this.tint(t, e.detail.value)}
        ></se-color-picker>
      </div>
    `;
  }
  toggleTint(t) {
    this.tinting = this.tinting === t ? void 0 : t;
  }
  async tint(t, e) {
    this.busy = t.id, this.error = void 0;
    try {
      await this.api.updateMember(t.id, { color: e }), this.dirty = !0, await this.load();
    } catch (s) {
      this.error = E(s, this.localize);
    } finally {
      this.busy = void 0;
    }
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
              ${this.renderTintable(s, s.name, s.id)}
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
            ${this.renderPalette(s)}
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
      this.error = E(t, this.localize);
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
      this.error = E(s, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  async removeGuest(t) {
    this.busy = t.id, this.error = void 0;
    try {
      await this.api.removeMemberFromGroup(this.groupId, t.id), this.dirty = !0, await this.load();
    } catch (e) {
      this.error = E(e, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
};
k.styles = [
  U,
  A`
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
I([
  l({ attribute: !1 })
], k.prototype, "api", 2);
I([
  l({ attribute: !1 })
], k.prototype, "localize", 2);
I([
  l({ type: String })
], k.prototype, "groupId", 2);
I([
  c()
], k.prototype, "haUsers", 2);
I([
  c()
], k.prototype, "members", 2);
I([
  c()
], k.prototype, "memberships", 2);
I([
  c()
], k.prototype, "newName", 2);
I([
  c()
], k.prototype, "loading", 2);
I([
  c()
], k.prototype, "busy", 2);
I([
  c()
], k.prototype, "error", 2);
I([
  c()
], k.prototype, "dirty", 2);
I([
  c()
], k.prototype, "tinting", 2);
k = I([
  _("se-member-dialog")
], k);
var ks = Object.defineProperty, zs = Object.getOwnPropertyDescriptor, M = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? zs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ks(e, s, r), r;
};
let z = class extends f {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = nt(), this.busy = !1, this.cancel = () => {
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
            payment_date: lt(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-created", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = E(e, this.localize);
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
    const t = this.localize, e = Z(this.amountInput), s = this.members.map((i) => ({ value: i.id, label: i.name }));
    return n`
      <se-dialog open heading=${t("new_payment")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : d}

          <se-select
            .label=${t("from_member")}
            .value=${this.fromMember}
            .options=${s}
            @value-changed=${(i) => this.fromMember = i.detail.value}
          ></se-select>

          <se-select
            .label=${t("to_member")}
            .value=${this.toMember}
            .options=${s}
            @value-changed=${(i) => this.toMember = i.detail.value}
          ></se-select>

          <se-field
            .label=${t("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            decimal
            required
            @value-changed=${(i) => this.amountInput = i.detail.value}
          ></se-field>

          <se-field
            .label=${t("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(i) => this.date = i.detail.value}
          ></se-field>

          ${e !== null && e > 0 ? n`<div class="muted">
                ${L(e, this.group.currency, this.language)}
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
z.styles = U;
M([
  l({ attribute: !1 })
], z.prototype, "api", 2);
M([
  l({ attribute: !1 })
], z.prototype, "localize", 2);
M([
  l({ attribute: !1 })
], z.prototype, "group", 2);
M([
  l({ attribute: !1 })
], z.prototype, "members", 2);
M([
  l({ attribute: !1 })
], z.prototype, "settlement", 2);
M([
  l({ type: String })
], z.prototype, "language", 2);
M([
  c()
], z.prototype, "fromMember", 2);
M([
  c()
], z.prototype, "toMember", 2);
M([
  c()
], z.prototype, "amountInput", 2);
M([
  c()
], z.prototype, "date", 2);
M([
  c()
], z.prototype, "busy", 2);
M([
  c()
], z.prototype, "error", 2);
z = M([
  _("se-payment-dialog")
], z);
var Es = Object.defineProperty, Ps = Object.getOwnPropertyDescriptor, v = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ps(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Es(e, s, r), r;
};
const tt = 5;
let g = class extends f {
  constructor() {
    super(...arguments), this.language = "en", this.groups = [], this.members = [], this.pastMembers = [], this.categories = [], this.expenses = [], this.payments = [], this.tab = "overview", this.loading = !0, this.busy = !1, this.confirmingDelete = !1, this.deleteGroup = async () => {
      if (!this.confirmingDelete) {
        this.confirmingDelete = !0;
        return;
      }
      this.busy = !0;
      try {
        await this.api.deleteGroup(this.groupId), this.menu = void 0, this.goBack();
      } catch (t) {
        this.error = E(t, this.localize), this.confirmingDelete = !1;
      } finally {
        this.busy = !1;
      }
    }, this.handleQuickAction = (t) => {
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
          this.group = await this.api.archiveGroup(this.group.id, !this.group.archived), this.menu = void 0;
        } catch (t) {
          this.error = E(t, this.localize);
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
        ${this.renderHeader()}

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
  renderHeader() {
    const t = this.localize, e = this.group;
    return n`
      <div class="header">
        <button class="back" @click=${this.goBack} aria-label=${t("back")}>
          ‹
        </button>

        <div class="titles">
          <h1>${t("app_title")}</h1>
          <button class="switcher" @click=${() => this.openMenu("groups")}>
            <span class="current">${e.name}</span>
            <span class="caret">⌄</span>
            ${e.archived ? n`<span class="archived-tag">${t("archived")}</span>` : d}
          </button>
        </div>

        <button
          class="icon"
          aria-label=${t("members")}
          @click=${() => this.dialog = "member"}
        >
          <se-icon plain .icon=${"mdi:account-multiple"} fallback="M" .size=${22}></se-icon>
        </button>
        <button
          class="icon"
          aria-label=${t("more")}
          @click=${() => this.openMenu("more")}
        >
          <se-icon plain .icon=${"mdi:dots-vertical"} fallback="⋮" .size=${22}></se-icon>
        </button>

        ${this.menu ? this.renderMenu() : d}
      </div>

      ${e.archived ? n`<div class="banner">${t("archived_hint")}</div>` : d}
    `;
  }
  renderMenu() {
    return n`
      <div class="scrim" @click=${() => this.menu = void 0}></div>
      <div class="menu" role="menu">
        ${this.menu === "groups" ? this.renderGroupMenu() : this.renderMoreMenu()}
      </div>
    `;
  }
  renderGroupMenu() {
    return n`
      ${this.groups.map(
      (t) => n`
          <button
            role="menuitem"
            class=${t.id === this.groupId ? "current-item" : ""}
            @click=${() => this.switchTo(t)}
          >
            ${t.name}
            ${t.archived ? n`<span class="archived-tag">${this.localize("archived")}</span>` : d}
          </button>
        `
    )}
      <button role="menuitem" class="separated" @click=${this.goBack}>
        ${this.localize("all_groups")}
      </button>
    `;
  }
  renderMoreMenu() {
    const t = this.localize;
    return n`
      <button role="menuitem" ?disabled=${this.busy} @click=${this.toggleArchive}>
        ${this.group.archived ? t("restore") : t("archive")}
      </button>
      <button
        role="menuitem"
        class="danger separated"
        ?disabled=${this.busy}
        @click=${this.deleteGroup}
      >
        ${this.confirmingDelete ? t("confirm_delete") : t("delete_group")}
      </button>
    `;
  }
  openMenu(t) {
    this.menu = this.menu === t ? void 0 : t, this.confirmingDelete = !1;
  }
  switchTo(t) {
    this.menu = void 0, t.id !== this.groupId && this.dispatchEvent(
      new CustomEvent("group-selected", {
        detail: { groupId: t.id },
        bubbles: !0,
        composed: !0
      })
    );
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
        icon: "mdi:plus",
        fallback: "+",
        color: "#2b7fd4"
      },
      {
        key: "member",
        label: t("action_members"),
        icon: "mdi:account-multiple",
        fallback: "M",
        color: "#3f8a4a"
      },
      {
        key: "payment",
        label: t("action_settle"),
        icon: "mdi:swap-horizontal",
        fallback: "⇄",
        color: "#c9871f"
      },
      {
        key: "category",
        label: t("tab_categories"),
        icon: "mdi:tag-multiple",
        fallback: "C",
        color: "#8b5fbf"
      }
    ]}
          @action=${this.handleQuickAction}
        ></se-quick-actions>
      </div>

      <div class="card">
        <div class="section-head">
          <h3>${t("recent_activity")}</h3>
          ${this.activity().length > tt ? n`<button class="link" @click=${() => this.tab = "expenses"}>
                ${t("see_all")}
              </button>` : d}
        </div>
        ${this.renderActivity()}
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
        (e) => ({
          kind: "expense",
          at: e.expense_date,
          addedAt: e.created_at,
          expense: e
        })
      ),
      ...this.payments.map(
        (e) => ({
          kind: "payment",
          at: e.payment_date,
          addedAt: e.created_at,
          payment: e
        })
      )
    ].sort(
      (e, s) => s.at.localeCompare(e.at) || s.addedAt.localeCompare(e.addedAt)
    );
  }
  renderActivity() {
    const t = this.activity();
    return t.length === 0 ? n`<div class="empty">${this.localize("no_activity")}</div>` : t.slice(0, tt).map(
      (e) => e.kind === "expense" ? this.renderExpense(e.expense) : this.renderPayment(e.payment)
    );
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
          .color=${e?.color ?? R(t.from_member_id)}
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">${e?.name ?? "?"} → ${s?.name ?? "?"}</div>
          <!-- Where an expense shows its category: same grid, same reading. -->
          <div class="muted">${this.localize("a_settlement")}</div>
          <div class="muted">
            ${Ze(t.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount settled-amount">
            ${L(t.amount, this.group.currency, this.language)}
          </span>
        </div>
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
        <se-icon
          .icon=${t.icon}
          .fallback=${t.name.charAt(0).toUpperCase()}
          .color=${t.color ?? R(t.id)}
        ></se-icon>
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
    const s = L(e, this.group.currency, this.language);
    return `${this.localize("rule_shares")} ${s}`;
  }
  renderSettlement(t) {
    const e = this.localize, s = this.memberById(t.from_member_id), i = this.memberById(t.to_member_id);
    return n`
      <div class="settlement">
        <span>
          <strong>${s?.name ?? "?"}</strong> ${e("owes")}
          <strong class="amount">
            ${L(t.amount, this.group.currency, this.language)}
          </strong>
          ${e("to")} <strong>${i?.name ?? "?"}</strong>
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
    const e = this.localize, s = this.memberById(t.paid_by_member_id), i = this.categories.find((r) => r.id === t.category_id);
    return n`
      <button class="item item-button" @click=${() => this.openExpense(t)}>
        ${this.renderAvatar(
      s?.name ?? "?",
      t.paid_by_member_id,
      `${this.localize("paid_by")} ${s?.name ?? "?"}`
    )}
        <div class="info">
          <div class="title">
            ${t.title}
            ${t.description ? n`<span class="note">${t.description}</span>` : d}
          </div>
          <div class="muted">
            ${i ? i.name : e("no_category")}
          </div>
          <div class="muted">
            ${Ze(t.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${L(t.amount, t.currency, this.language)}
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
      const i = this.memberById(s.member_id);
      return n`
            <div
              class="avatar small"
              title=${i?.name ?? "?"}
              style=${`background:${i?.color ?? R(s.member_id)}`}
            >
              ${X(i?.name ?? "?")}
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
  /**
   * A member as a coloured initial.
   *
   * `hint` names what the avatar stands for: on an expense row the one on the
   * left is the payer and the ones on the right are who shares it, which the
   * circles alone do not say.
   */
  renderAvatar(t, e, s) {
    const i = this.memberById(e);
    return n`
      <div
        class="avatar"
        title=${s ?? t}
        style=${`background:${i?.color ?? R(e)}`}
      >
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
      const [
        t,
        e,
        s,
        i,
        r,
        o,
        a,
        u
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
      this.group = t, this.groups = e, this.members = s, this.pastMembers = i, this.categories = r, this.expenses = o, this.payments = a, this.result = u;
    } catch (t) {
      this.error = E(t, this.localize), t?.code === "group_not_found" && this.dispatchEvent(
        new CustomEvent("group-unavailable", { bubbles: !0, composed: !0 })
      );
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
g.styles = [
  U,
  A`
      :host {
        display: block;
        position: relative;
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
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

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
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
        color: var(--secondary-text-color);
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
        color: var(--primary-text-color);
        font-size: 18px;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .icon:hover {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 4;
      }

      .menu {
        position: absolute;
        z-index: 5;
        top: 56px;
        left: 16px;
        right: 16px;
        max-width: 320px;
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
v([
  l({ attribute: !1 })
], g.prototype, "api", 2);
v([
  l({ attribute: !1 })
], g.prototype, "localize", 2);
v([
  l({ type: String })
], g.prototype, "groupId", 2);
v([
  l({ type: String })
], g.prototype, "language", 2);
v([
  c()
], g.prototype, "group", 2);
v([
  c()
], g.prototype, "groups", 2);
v([
  c()
], g.prototype, "menu", 2);
v([
  c()
], g.prototype, "members", 2);
v([
  c()
], g.prototype, "pastMembers", 2);
v([
  c()
], g.prototype, "categories", 2);
v([
  c()
], g.prototype, "expenses", 2);
v([
  c()
], g.prototype, "payments", 2);
v([
  c()
], g.prototype, "result", 2);
v([
  c()
], g.prototype, "tab", 2);
v([
  c()
], g.prototype, "loading", 2);
v([
  c()
], g.prototype, "error", 2);
v([
  c()
], g.prototype, "dialog", 2);
v([
  c()
], g.prototype, "prefill", 2);
v([
  c()
], g.prototype, "editedCategory", 2);
v([
  c()
], g.prototype, "editedExpense", 2);
v([
  c()
], g.prototype, "busy", 2);
v([
  c()
], g.prototype, "confirmingDelete", 2);
g = v([
  _("se-group-page")
], g);
class Os {
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
var Is = Object.defineProperty, Ms = Object.getOwnPropertyDescriptor, fe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ms(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Is(e, s, r), r;
};
let te = class extends f {
  constructor() {
    super(...arguments), this.narrow = !1, this.landed = !1, this.syncFromRoute = () => {
      const t = this.route?.path ?? window.location.pathname, e = /\/group\/([^/?#]+)/.exec(t);
      if (e) {
        this.groupId = e[1];
        return;
      }
      if (this.landed) {
        this.groupId = void 0;
        return;
      }
      this.landed = !0;
      const s = Ds();
      if (s) {
        this.groupId = s, this.pushPath(`/group/${s}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (t) => {
      const e = t.detail.groupId;
      this.groupId = e, Ts(e), this.pushPath(`/group/${e}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.pushPath("");
    }, this.handleGroupUnavailable = () => {
      js(), this.goToDashboard();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new Os(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = Vt(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
    return this.groupId ? n`
        <se-group-page
          .api=${this.api}
          .localize=${t}
          .groupId=${this.groupId}
          .language=${e}
          @navigate-back=${this.goToDashboard}
          @group-selected=${this.handleGroupSelected}
          @group-unavailable=${this.handleGroupUnavailable}
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
te.styles = A`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
fe([
  l({ attribute: !1 })
], te.prototype, "hass", 2);
fe([
  l({ type: Boolean })
], te.prototype, "narrow", 2);
fe([
  l({ attribute: !1 })
], te.prototype, "route", 2);
fe([
  c()
], te.prototype, "groupId", 2);
te = fe([
  _("shared-expenses-panel")
], te);
const Ne = "shared_expenses.last_group";
function Ds() {
  try {
    return window.localStorage.getItem(Ne);
  } catch {
    return null;
  }
}
function Ts(t) {
  try {
    window.localStorage.setItem(Ne, t);
  } catch {
  }
}
function js() {
  try {
    window.localStorage.removeItem(Ne);
  } catch {
  }
}
export {
  te as SharedExpensesPanel
};
