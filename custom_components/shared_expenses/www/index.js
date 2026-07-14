/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ge = globalThis, Ce = ge.ShadowRoot && (ge.ShadyCSS === void 0 || ge.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ae = Symbol(), ke = /* @__PURE__ */ new WeakMap();
let Ge = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (Ce && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = ke.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ke.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Xe = (t) => new Ge(typeof t == "string" ? t : t + "", void 0, Ae), C = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, a) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[a + 1], t[0]);
  return new Ge(s, t, Ae);
}, et = (t, e) => {
  if (Ce) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = ge.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, De = Ce ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Xe(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: tt, defineProperty: st, getOwnPropertyDescriptor: it, getOwnPropertyNames: rt, getOwnPropertySymbols: at, getPrototypeOf: ot } = Object, $e = globalThis, Me = $e.trustedTypes, nt = Me ? Me.emptyScript : "", lt = $e.reactiveElementPolyfillSupport, oe = (t, e) => t, be = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? nt : null;
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
} }, Ee = (t, e) => !tt(t, e), Ie = { attribute: !0, type: String, converter: be, reflect: !1, useDefault: !1, hasChanged: Ee };
Symbol.metadata ??= Symbol("metadata"), $e.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Y = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Ie) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && st(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: a } = it(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: r, set(o) {
      const h = r?.call(this);
      a?.call(this, o), this.requestUpdate(e, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ie;
  }
  static _$Ei() {
    if (this.hasOwnProperty(oe("elementProperties"))) return;
    const e = ot(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(oe("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(oe("properties"))) {
      const s = this.properties, i = [...rt(s), ...at(s)];
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
      for (const r of i) s.unshift(De(r));
    } else e !== void 0 && s.push(De(e));
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
    return et(e, this.constructor.elementStyles), e;
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
      const a = (i.converter?.toAttribute !== void 0 ? i.converter : be).toAttribute(s, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = i.getPropertyOptions(r), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : be;
      this._$Em = r;
      const h = o.fromAttribute(s, a.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (a = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? Ee)(a, s) || i.useDefault && i.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: r, wrapped: a }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), a !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [r, a] of this._$Ep) this[r] = a;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, a] of i) {
        const { wrapped: o } = a, h = this[r];
        o !== !0 || this._$AL.has(r) || h === void 0 || this.C(r, void 0, a, h);
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
Y.elementStyles = [], Y.shadowRootOptions = { mode: "open" }, Y[oe("elementProperties")] = /* @__PURE__ */ new Map(), Y[oe("finalized")] = /* @__PURE__ */ new Map(), lt?.({ ReactiveElement: Y }), ($e.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Se = globalThis, Te = (t) => t, ve = Se.trustedTypes, je = ve ? ve.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Ve = "$lit$", B = `lit$${Math.random().toFixed(9).slice(2)}$`, We = "?" + B, ct = `<${We}>`, W = document, ne = () => W.createComment(""), le = (t) => t === null || typeof t != "object" && typeof t != "function", Pe = Array.isArray, pt = (t) => Pe(t) || typeof t?.[Symbol.iterator] == "function", we = `[ 	
\f\r]`, ae = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ue = /-->/g, Ne = />/g, G = RegExp(`>|${we}(?:([^\\s"'>=/]+)(${we}*=${we}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Re = /'/g, Be = /"/g, Ke = /^(?:script|style|textarea|title)$/i, dt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = dt(1), X = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), qe = /* @__PURE__ */ new WeakMap(), V = W.createTreeWalker(W, 129);
function Qe(t, e) {
  if (!Pe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return je !== void 0 ? je.createHTML(e) : e;
}
const ht = (t, e) => {
  const s = t.length - 1, i = [];
  let r, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ae;
  for (let h = 0; h < s; h++) {
    const d = t[h];
    let g, $, u = -1, I = 0;
    for (; I < d.length && (o.lastIndex = I, $ = o.exec(d), $ !== null); ) I = o.lastIndex, o === ae ? $[1] === "!--" ? o = Ue : $[1] !== void 0 ? o = Ne : $[2] !== void 0 ? (Ke.test($[2]) && (r = RegExp("</" + $[2], "g")), o = G) : $[3] !== void 0 && (o = G) : o === G ? $[0] === ">" ? (o = r ?? ae, u = -1) : $[1] === void 0 ? u = -2 : (u = o.lastIndex - $[2].length, g = $[1], o = $[3] === void 0 ? G : $[3] === '"' ? Be : Re) : o === Be || o === Re ? o = G : o === Ue || o === Ne ? o = ae : (o = G, r = void 0);
    const R = o === G && t[h + 1].startsWith("/>") ? " " : "";
    a += o === ae ? d + ct : u >= 0 ? (i.push(g), d.slice(0, u) + Ve + d.slice(u) + B + R) : d + B + (u === -2 ? h : R);
  }
  return [Qe(t, a + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class ce {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let a = 0, o = 0;
    const h = e.length - 1, d = this.parts, [g, $] = ht(e, s);
    if (this.el = ce.createElement(g, i), V.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = V.nextNode()) !== null && d.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(Ve)) {
          const I = $[o++], R = r.getAttribute(u).split(B), me = /([.?@])?(.*)/.exec(I);
          d.push({ type: 1, index: a, name: me[2], strings: R, ctor: me[1] === "." ? mt : me[1] === "?" ? gt : me[1] === "@" ? bt : _e }), r.removeAttribute(u);
        } else u.startsWith(B) && (d.push({ type: 6, index: a }), r.removeAttribute(u));
        if (Ke.test(r.tagName)) {
          const u = r.textContent.split(B), I = u.length - 1;
          if (I > 0) {
            r.textContent = ve ? ve.emptyScript : "";
            for (let R = 0; R < I; R++) r.append(u[R], ne()), V.nextNode(), d.push({ type: 2, index: ++a });
            r.append(u[I], ne());
          }
        }
      } else if (r.nodeType === 8) if (r.data === We) d.push({ type: 2, index: a });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(B, u + 1)) !== -1; ) d.push({ type: 7, index: a }), u += B.length - 1;
      }
      a++;
    }
  }
  static createElement(e, s) {
    const i = W.createElement("template");
    return i.innerHTML = e, i;
  }
}
function ee(t, e, s = t, i) {
  if (e === X) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const a = le(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== a && (r?._$AO?.(!1), a === void 0 ? r = void 0 : (r = new a(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = ee(t, r._$AS(t, e.values), r, i)), e;
}
class ut {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? W).importNode(s, !0);
    V.currentNode = r;
    let a = V.nextNode(), o = 0, h = 0, d = i[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let g;
        d.type === 2 ? g = new de(a, a.nextSibling, this, e) : d.type === 1 ? g = new d.ctor(a, d.name, d.strings, this, e) : d.type === 6 && (g = new vt(a, this, e)), this._$AV.push(g), d = i[++h];
      }
      o !== d?.index && (a = V.nextNode(), o++);
    }
    return V.currentNode = W, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class de {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, r) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = ee(this, e, s), le(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== X && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : pt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && le(this._$AH) ? this._$AA.nextSibling.data = e : this.T(W.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = ce.createElement(Qe(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const a = new ut(r, this), o = a.u(this.options);
      a.p(s), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let s = qe.get(e.strings);
    return s === void 0 && qe.set(e.strings, s = new ce(e)), s;
  }
  k(e) {
    Pe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const a of e) r === s.length ? s.push(i = new de(this.O(ne()), this.O(ne()), this, this.options)) : i = s[r], i._$AI(a), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = Te(e).nextSibling;
      Te(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class _e {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, r, a) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = s, this._$AM = r, this.options = a, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(e, s = this, i, r) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) e = ee(this, e, s, 0), o = !le(e) || e !== this._$AH && e !== X, o && (this._$AH = e);
    else {
      const h = e;
      let d, g;
      for (e = a[0], d = 0; d < a.length - 1; d++) g = ee(this, h[i + d], s, d), g === X && (g = this._$AH[d]), o ||= !le(g) || g !== this._$AH[d], g === p ? e = p : e !== p && (e += (g ?? "") + a[d + 1]), this._$AH[d] = g;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class mt extends _e {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class gt extends _e {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class bt extends _e {
  constructor(e, s, i, r, a) {
    super(e, s, i, r, a), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = ee(this, e, s, 0) ?? p) === X) return;
    const i = this._$AH, r = e === p && i !== p || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, a = e !== p && (i === p || r);
    r && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class vt {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ee(this, e);
  }
}
const ft = Se.litHtmlPolyfillSupport;
ft?.(ce, de), (Se.litHtmlVersions ??= []).push("3.3.3");
const yt = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const a = s?.renderBefore ?? null;
    i._$litPart$ = r = new de(e.insertBefore(ne(), a), a, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ze = globalThis;
class b extends Y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = yt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return X;
  }
}
b._$litElement$ = !0, b.finalized = !0, ze.litElementHydrateSupport?.({ LitElement: b });
const $t = ze.litElementPolyfillSupport;
$t?.({ LitElement: b });
(ze.litElementVersions ??= []).push("4.2.2");
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
const _t = { attribute: !0, type: String, converter: be, reflect: !1, hasChanged: Ee }, xt = (t = _t, e, s) => {
  const { kind: i, metadata: r } = s;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(s.name, t), i === "accessor") {
    const { name: o } = s;
    return { set(h) {
      const d = e.get.call(this);
      e.set.call(this, h), this.requestUpdate(o, d, t, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(o, void 0, t, h), h;
    } };
  }
  if (i === "setter") {
    const { name: o } = s;
    return function(h) {
      const d = this[o];
      e.call(this, h), this.requestUpdate(o, d, t, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function l(t) {
  return (e, s) => typeof s == "object" ? xt(t, e, s) : ((i, r, a) => {
    const o = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, i), o ? Object.getOwnPropertyDescriptor(r, a) : void 0;
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
var wt = Object.defineProperty, Ct = Object.getOwnPropertyDescriptor, xe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ct(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && wt(e, s, r), r;
};
let te = class extends b {
  constructor() {
    super(...arguments), this.variant = "filled", this.disabled = !1;
  }
  render() {
    return n`
      <button class=${this.variant} ?disabled=${this.disabled} @click=${this.handleClick}>
        ${this.icon ? n`<span aria-hidden="true">${this.icon}</span>` : p}
        <slot></slot>
      </button>
    `;
  }
  handleClick(t) {
    this.disabled && t.stopPropagation();
  }
};
te.styles = C`
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
xe([
  l({ type: String })
], te.prototype, "variant", 2);
xe([
  l({ type: Boolean })
], te.prototype, "disabled", 2);
xe([
  l({ type: String })
], te.prototype, "icon", 2);
te = xe([
  _("se-button")
], te);
var At = Object.defineProperty, Et = Object.getOwnPropertyDescriptor, Oe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Et(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && At(e, s, r), r;
};
let pe = class extends b {
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
pe.styles = C`
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
Oe([
  l({ type: String })
], pe.prototype, "heading", 2);
Oe([
  l({ type: Boolean, reflect: !0 })
], pe.prototype, "open", 2);
pe = Oe([
  _("se-dialog")
], pe);
var St = Object.defineProperty, Pt = Object.getOwnPropertyDescriptor, D = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Pt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && St(e, s, r), r;
};
let E = class extends b {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.type = "text", this.placeholder = "", this.required = !1, this.disabled = !1, this.decimal = !1;
  }
  render() {
    return n`
      ${this.label ? n`<label>${this.label}${this.required ? " *" : ""}</label>` : p}
      <div class="wrapper">
        <input
          .type=${this.type}
          .value=${this.value}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          inputmode=${this.decimal ? "decimal" : p}
          @input=${this.handleInput}
        />
        ${this.suffix ? n`<span class="suffix">${this.suffix}</span>` : p}
      </div>
      ${this.helper ? n`<div class="helper">${this.helper}</div>` : p}
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
E.styles = C`
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
D([
  l({ type: String })
], E.prototype, "label", 2);
D([
  l({ type: String })
], E.prototype, "value", 2);
D([
  l({ type: String })
], E.prototype, "type", 2);
D([
  l({ type: String })
], E.prototype, "placeholder", 2);
D([
  l({ type: String })
], E.prototype, "suffix", 2);
D([
  l({ type: String })
], E.prototype, "helper", 2);
D([
  l({ type: Boolean })
], E.prototype, "required", 2);
D([
  l({ type: Boolean })
], E.prototype, "disabled", 2);
D([
  l({ type: Boolean })
], E.prototype, "decimal", 2);
E = D([
  _("se-field")
], E);
const fe = {
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
  icon_hint: "A Material Design Icons name, for example mdi:cart.",
  default_split: "Default split",
  split_rule_custom: "Use a custom rule",
  split_rule_equal_hint: "Expenses of this category are split equally.",
  cap_label: "Share at most",
  cap_hint: "Above this, the rest goes to whoever paid. Leave empty for no cap.",
  no_cap: "No cap",
  fixed_amounts: "Fixed amounts",
  fixed_amounts_hint: "Taken before anything is shared. Leave empty to skip.",
  rule_preview_intro: "On an expense of",
  rule_preview_shared: "is shared",
  rule_preview_rest: "and the remaining",
  rule_preview_to_payer: "goes to whoever paid.",
  rule_equal: "Split equally",
  rule_capped: "Shares up to",
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
  split_equally: "Equally",
  split_custom: "Custom amounts",
  split_rule: "Use the default rule",
  split_rule_hint: "Applies the rule of the category, or of the group.",
  shares_mismatch: "The shares must add up to the amount.",
  participants: "Participants",
  members: "Members",
  no_members: "No member yet.",
  new_member: "Add member",
  member_name: "Name",
  remove_member: "Remove from group",
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
}, zt = {
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
  icon_hint: "Un nom Material Design Icons, par exemple mdi:cart.",
  default_split: "Répartition par défaut",
  split_rule_custom: "Utiliser une règle personnalisée",
  split_rule_equal_hint: "Les dépenses de cette catégorie sont partagées à parts égales.",
  cap_label: "Partager au maximum",
  cap_hint: "Au-delà, le reste va à celui qui a payé. Laisser vide pour ne pas plafonner.",
  no_cap: "Pas de plafond",
  fixed_amounts: "Montants fixes",
  fixed_amounts_hint: "Prélevés avant tout partage. Laisser vide pour ignorer.",
  rule_preview_intro: "Sur une dépense de",
  rule_preview_shared: "sont partagés",
  rule_preview_rest: "et le reste,",
  rule_preview_to_payer: "va à celui qui a payé.",
  rule_equal: "Parts égales",
  rule_capped: "Partage jusqu'à",
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
  split_equally: "Parts égales",
  split_custom: "Montants personnalisés",
  split_rule: "Utiliser la règle par défaut",
  split_rule_hint: "Applique la règle de la catégorie, sinon celle du groupe.",
  shares_mismatch: "Le total des parts doit égaler le montant.",
  participants: "Participants",
  members: "Membres",
  no_members: "Aucun membre pour l'instant.",
  new_member: "Ajouter un membre",
  member_name: "Nom",
  remove_member: "Retirer du groupe",
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
}, Ot = { en: fe, fr: zt };
function kt(t) {
  const e = Ot[t.split("-")[0]] ?? fe;
  return (s) => e[s] ?? fe[s] ?? s;
}
function q(t, e) {
  const s = t?.code;
  return s && s in fe ? e(s) : t?.message || e("error_generic");
}
const N = C`
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
var Dt = Object.defineProperty, Mt = Object.getOwnPropertyDescriptor, F = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Mt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Dt(e, s, r), r;
};
let k = class extends b {
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
        this.error = q(t, this.localize);
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
          ${this.error ? n`<div class="error">${this.error}</div>` : p}
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
k.styles = N;
F([
  l({ attribute: !1 })
], k.prototype, "api", 2);
F([
  l({ attribute: !1 })
], k.prototype, "localize", 2);
F([
  c()
], k.prototype, "name", 2);
F([
  c()
], k.prototype, "description", 2);
F([
  c()
], k.prototype, "currency", 2);
F([
  c()
], k.prototype, "busy", 2);
F([
  c()
], k.prototype, "error", 2);
k = F([
  _("se-group-dialog")
], k);
var It = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, Z = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Tt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && It(e, s, r), r;
};
let j = class extends b {
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

        ${this.error ? n`<div class="error">${this.error}</div>` : p}

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
          ` : p}
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
          ${t.description ? n`<div class="muted">${t.description}</div>` : p}
        </div>
        ${t.archived ? n`<span class="archived-tag">${this.localize("archived")}</span>` : p}
        <span class="chevron">›</span>
      </button>
    `;
  }
  async load() {
    this.loading = !0, this.error = void 0;
    try {
      this.groups = await this.api.listGroups();
    } catch (t) {
      this.error = q(t, this.localize);
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
j.styles = [
  N,
  C`
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
Z([
  l({ attribute: !1 })
], j.prototype, "api", 2);
Z([
  l({ attribute: !1 })
], j.prototype, "localize", 2);
Z([
  c()
], j.prototype, "groups", 2);
Z([
  c()
], j.prototype, "loading", 2);
Z([
  c()
], j.prototype, "error", 2);
Z([
  c()
], j.prototype, "dialogOpen", 2);
j = Z([
  _("se-dashboard-page")
], j);
function z(t, e, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function O(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const s = Number(e);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function He(t, e) {
  return new Intl.DateTimeFormat(e, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
}
function Ze() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function Je(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function jt(t) {
  const e = new Date(t), s = `${e.getMonth() + 1}`.padStart(2, "0"), i = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${s}-${i}`;
}
function Le(t) {
  return (t / 100).toFixed(2);
}
function se(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
function T(t) {
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
  for (let i = 0; i < t.length; i += 1)
    s = s * 31 + t.charCodeAt(i) >>> 0;
  return e[s % e.length];
}
var Ut = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, ie = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Nt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ut(e, s, r), r;
};
let H = class extends b {
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
    return t.length === 0 ? n`<div class="settled muted">${this.localize("balance_settled")}</div>` : this.balances.length === 2 ? this.renderDuel() : n`<div>${t.map((e) => this.renderRow(e))}</div>`;
  }
  renderDuel() {
    const t = [...this.balances].sort((e, s) => s.amount - e.amount);
    return n`
      <div class="duel">
        ${this.renderSide(t[0], !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(t[1], !0)}
      </div>
    `;
  }
  renderSide(t, e) {
    const s = this.memberById(t.member_id), i = t.amount > 0, r = i ? "positive" : "negative", a = n`
      <div class="avatar" style=${`background:${s?.color ?? T(t.member_id)}`}>
        ${se(s?.name ?? "?")}
      </div>
    `, o = n`
      <div class="body">
        <div class="name">${s?.name ?? "?"}</div>
        <div class=${`verdict ${r}`}>
          ${i ? this.localize("must_receive") : this.localize("must_pay")}
        </div>
        <div class=${`figure ${r}`}>
          ${z(Math.abs(t.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return n`
      <div class=${`side ${e ? "right" : ""}`}>
        ${e ? p : a}${o}${e ? a : p}
      </div>
    `;
  }
  renderRow(t) {
    const e = this.memberById(t.member_id), s = t.amount > 0, i = s ? "positive" : "negative";
    return n`
      <div class="row">
        <div class="avatar" style=${`background:${e?.color ?? T(t.member_id)}`}>
          ${se(e?.name ?? "?")}
        </div>
        <span class="name">${e?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${i}`}>
            ${s ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${i}`}>
            ${z(Math.abs(t.amount), this.currency, this.language)}
          </div>
        </div>
      </div>
    `;
  }
  memberById(t) {
    return this.members.find((e) => e.id === t);
  }
};
H.styles = [
  N,
  C`
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
ie([
  l({ attribute: !1 })
], H.prototype, "localize", 2);
ie([
  l({ attribute: !1 })
], H.prototype, "balances", 2);
ie([
  l({ attribute: !1 })
], H.prototype, "members", 2);
ie([
  l({ type: String })
], H.prototype, "currency", 2);
ie([
  l({ type: String })
], H.prototype, "language", 2);
H = ie([
  _("se-balance-card")
], H);
var Rt = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, he = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Rt(e, s, r), r;
};
let K = class extends b {
  constructor() {
    super(...arguments), this.fallback = "?", this.color = "#5c6b8a", this.size = 40;
  }
  render() {
    const t = `
      background: ${this.color};
      width: ${this.size}px;
      height: ${this.size}px;
      font-size: ${Math.round(this.size * 0.35)}px;
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
K.styles = C`
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
      --mdc-icon-size: 55%;
      display: flex;
    }
  `;
he([
  l({ type: String })
], K.prototype, "icon", 2);
he([
  l({ type: String })
], K.prototype, "fallback", 2);
he([
  l({ type: String })
], K.prototype, "color", 2);
he([
  l({ type: Number })
], K.prototype, "size", 2);
K = he([
  _("se-icon")
], K);
var qt = Object.defineProperty, Ht = Object.getOwnPropertyDescriptor, Ye = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ht(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && qt(e, s, r), r;
};
let ye = class extends b {
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
ye.styles = C`
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
Ye([
  l({ attribute: !1 })
], ye.prototype, "actions", 2);
ye = Ye([
  _("se-quick-actions")
], ye);
var Lt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, M = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ft(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Lt(e, s, r), r;
};
let S = class extends b {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.enabled = !1, this.participants = /* @__PURE__ */ new Set(), this.capInput = "", this.fixedInputs = {};
  }
  connectedCallback() {
    super.connectedCallback(), this.enabled = this.rule !== null, this.participants = new Set(
      this.rule?.participants ?? this.members.map((t) => t.id)
    ), this.capInput = this.rule?.cap != null ? (this.rule.cap / 100).toFixed(2) : "", this.fixedInputs = Object.fromEntries(
      Object.entries(this.rule?.fixed ?? {}).map(([t, e]) => [
        t,
        (e / 100).toFixed(2)
      ])
    );
  }
  render() {
    const t = this.localize;
    return n`
      <label class="toggle">
        <input type="checkbox" .checked=${this.enabled} @change=${this.toggle} />
        <span class="label">${t("split_rule_custom")}</span>
      </label>

      ${this.enabled ? this.renderPanel() : n`<div class="muted">${t("split_rule_equal_hint")}</div>`}
    `;
  }
  renderPanel() {
    const t = this.localize;
    return n`
      <div class="panel">
        <div>
          <label class="muted">${t("participants")}</label>
          ${this.members.map(
      (e) => n`
              <div class="member-row">
                <input
                  type="checkbox"
                  .checked=${this.participants.has(e.id)}
                  @change=${() => this.toggleParticipant(e.id)}
                />
                ${this.renderAvatar(e)}
                <span class="name">${e.name}</span>
              </div>
            `
    )}
        </div>

        <se-field
          .label=${t("cap_label")}
          .value=${this.capInput}
          .suffix=${this.currency}
          .helper=${t("cap_hint")}
          decimal
          placeholder=${t("no_cap")}
          @value-changed=${(e) => this.setCap(e.detail.value)}
        ></se-field>

        <div>
          <label class="muted">${t("fixed_amounts")}</label>
          <div class="muted">${t("fixed_amounts_hint")}</div>
          ${this.members.map(
      (e) => n`
              <div class="member-row">
                ${this.renderAvatar(e)}
                <span class="name">${e.name}</span>
                <se-field
                  .value=${this.fixedInputs[e.id] ?? ""}
                  .suffix=${this.currency}
                  decimal
                  placeholder="—"
                  @value-changed=${(s) => this.setFixed(e.id, s.detail.value)}
                ></se-field>
              </div>
            `
    )}
        </div>

        ${this.renderPreview()}
      </div>
    `;
  }
  renderPreview() {
    const t = O(this.capInput);
    if (t === null || t <= 0 || this.participants.size === 0)
      return p;
    const e = 8542, s = Object.values(this.fixedInputs).reduce(
      (d, g) => d + (O(g) ?? 0),
      0
    ), i = e - s;
    if (i <= 0)
      return p;
    const r = Math.min(i, t), a = Math.floor(r / this.participants.size), o = i - r, h = (d) => z(d, this.currency, this.language);
    return n`
      <div class="preview">
        ${this.localize("rule_preview_intro")} <strong>${h(e)}</strong>:
        <strong>${h(r)}</strong> ${this.localize("rule_preview_shared")}
        (${this.participants.size} × ~<strong>${h(a)}</strong>),
        ${this.localize("rule_preview_rest")} <strong>${h(o)}</strong>
        ${this.localize("rule_preview_to_payer")}
      </div>
    `;
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? T(t.id)}`}>
        ${se(t.name)}
      </div>
    `;
  }
  toggle(t) {
    this.enabled = t.target.checked, this.emit();
  }
  toggleParticipant(t) {
    const e = new Set(this.participants);
    e.has(t) ? e.delete(t) : e.add(t), this.participants = e, this.emit();
  }
  setCap(t) {
    this.capInput = t, this.emit();
  }
  setFixed(t, e) {
    this.fixedInputs = { ...this.fixedInputs, [t]: e }, this.emit();
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
    const t = {};
    for (const [i, r] of Object.entries(this.fixedInputs)) {
      const a = O(r);
      a !== null && a > 0 && (t[i] = a);
    }
    const e = O(this.capInput);
    return {
      participants: this.participants.size === this.members.length ? null : [...this.participants],
      fixed: t,
      cap: e !== null && e > 0 ? e : null,
      remainder: "payer"
    };
  }
};
S.styles = [
  N,
  C`
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
        line-height: 1.5;
        padding: 10px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f1f1f1);
      }

      .preview strong {
        font-variant-numeric: tabular-nums;
      }
    `
];
M([
  l({ attribute: !1 })
], S.prototype, "localize", 2);
M([
  l({ attribute: !1 })
], S.prototype, "members", 2);
M([
  l({ attribute: !1 })
], S.prototype, "rule", 2);
M([
  l({ type: String })
], S.prototype, "currency", 2);
M([
  l({ type: String })
], S.prototype, "language", 2);
M([
  c()
], S.prototype, "enabled", 2);
M([
  c()
], S.prototype, "participants", 2);
M([
  c()
], S.prototype, "capInput", 2);
M([
  c()
], S.prototype, "fixedInputs", 2);
S = M([
  _("se-split-rule-editor")
], S);
var Gt = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, P = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Vt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Gt(e, s, r), r;
};
let w = class extends b {
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
        this.error = q(e, this.localize);
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
          ${this.error ? n`<div class="error">${this.error}</div>` : p}

          <se-field
            .label=${t("category_name")}
            .value=${this.name}
            required
            placeholder="Courses"
            @value-changed=${(s) => this.name = s.detail.value}
          ></se-field>

          <se-field
            .label=${t("icon")}
            .value=${this.icon}
            .helper=${t("icon_hint")}
            placeholder="mdi:cart"
            @value-changed=${(s) => this.icon = s.detail.value}
          ></se-field>

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
w.styles = N;
P([
  l({ attribute: !1 })
], w.prototype, "api", 2);
P([
  l({ attribute: !1 })
], w.prototype, "localize", 2);
P([
  l({ attribute: !1 })
], w.prototype, "group", 2);
P([
  l({ attribute: !1 })
], w.prototype, "members", 2);
P([
  l({ attribute: !1 })
], w.prototype, "category", 2);
P([
  l({ type: String })
], w.prototype, "language", 2);
P([
  c()
], w.prototype, "name", 2);
P([
  c()
], w.prototype, "icon", 2);
P([
  c()
], w.prototype, "rule", 2);
P([
  c()
], w.prototype, "busy", 2);
P([
  c()
], w.prototype, "error", 2);
w = P([
  _("se-category-dialog")
], w);
var Wt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, re = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Kt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Wt(e, s, r), r;
};
let L = class extends b {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.options = [], this.disabled = !1;
  }
  render() {
    return n`
      ${this.label ? n`<label>${this.label}</label>` : p}
      <select .value=${this.value} ?disabled=${this.disabled} @change=${this.handleChange}>
        ${this.placeholder ? n`<option value="" ?selected=${!this.value}>${this.placeholder}</option>` : p}
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
L.styles = C`
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
re([
  l({ type: String })
], L.prototype, "label", 2);
re([
  l({ type: String })
], L.prototype, "value", 2);
re([
  l({ attribute: !1 })
], L.prototype, "options", 2);
re([
  l({ type: String })
], L.prototype, "placeholder", 2);
re([
  l({ type: Boolean })
], L.prototype, "disabled", 2);
L = re([
  _("se-select")
], L);
var Qt = Object.defineProperty, Zt = Object.getOwnPropertyDescriptor, f = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Zt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Qt(e, s, r), r;
};
let m = class extends b {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.expenseTitle = "", this.amountInput = "", this.paidBy = "", this.date = Ze(), this.categoryId = "", this.mode = "rule", this.participants = /* @__PURE__ */ new Set(), this.customAmounts = {}, this.busy = !1, this.confirmingDelete = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = O(this.amountInput);
      if (t === null)
        return;
      this.busy = !0, this.error = void 0;
      const e = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: Je(this.date),
        category_id: this.categoryId || null
      };
      this.mode === "equal" ? e.split_rule = {
        participants: [...this.participants],
        fixed: {},
        cap: null,
        remainder: "payer"
      } : this.mode === "custom" && (e.shares = this.members.map((s) => ({
        member_id: s.id,
        amount: O(this.customAmounts[s.id] ?? "") ?? 0
      })).filter((s) => s.amount !== 0));
      try {
        const s = this.expense ? await this.api.updateExpense(this.expense.id, {
          title: e.title,
          amount: e.amount,
          paid_by_member_id: e.paid_by_member_id,
          expense_date: e.expense_date,
          category_id: e.category_id,
          shares: e.shares,
          split_rule: e.split_rule
        }) : await this.api.createExpense(e);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: s },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (s) {
        this.error = q(s, this.localize);
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
          this.error = q(t, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), this.participants = new Set(this.members.map((t) => t.id)), !this.expense) {
      this.members.length > 0 && (this.paidBy = this.members[0].id);
      return;
    }
    this.expenseTitle = this.expense.title, this.amountInput = Le(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = jt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.mode = "custom", this.customAmounts = Object.fromEntries(
      (this.expense.shares ?? []).map((t) => [
        t.member_id,
        Le(t.amount)
      ])
    );
  }
  render() {
    const t = this.localize, e = O(this.amountInput), s = this.expense ? t("edit_expense") : t("new_expense");
    return n`
      <se-dialog open heading=${s} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : p}

          <se-field
            .label=${t("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(i) => this.expenseTitle = i.detail.value}
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
            @value-changed=${(i) => this.categoryId = i.detail.value}
          ></se-select>

          <div>
            <label class="muted">${t("split")}</label>
            <div class="modes" role="group">
              ${this.renderModeButton("rule", t("split_rule"))}
              ${this.renderModeButton("equal", t("split_equally"))}
              ${this.renderModeButton("custom", t("split_custom"))}
            </div>
          </div>

          ${this.renderSplit(e)}
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
            ` : p}
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
  renderModeButton(t, e) {
    return n`
      <button
        type="button"
        aria-pressed=${this.mode === t}
        @click=${() => this.mode = t}
      >
        ${e}
      </button>
    `;
  }
  renderSplit(t) {
    const e = this.localize;
    if (this.mode === "rule")
      return n`<div class="muted">${e("split_rule_hint")}</div>`;
    if (this.mode === "equal")
      return n`
        <div>
          <label class="muted">${e("participants")}</label>
          ${this.members.map(
        (i) => n`
              <div class="member-row">
                <input
                  type="checkbox"
                  .checked=${this.participants.has(i.id)}
                  @change=${() => this.toggleParticipant(i.id)}
                />
                ${this.renderAvatar(i)}
                <span class="name">${i.name}</span>
                <span class="amount muted">${this.equalShare(t, i.id)}</span>
              </div>
            `
      )}
        </div>
      `;
    const s = this.customTotal();
    return n`
      <div>
        ${this.members.map(
      (i) => n`
            <div class="member-row">
              ${this.renderAvatar(i)}
              <span class="name">${i.name}</span>
              <se-field
                .value=${this.customAmounts[i.id] ?? ""}
                .suffix=${this.group.currency}
                decimal
                placeholder="0"
                @value-changed=${(r) => this.setCustom(i.id, r.detail.value)}
              ></se-field>
            </div>
          `
    )}
        <div class="total">
          <span class="muted">Total</span>
          <span class=${`amount ${t !== null && s !== t ? "negative" : ""}`}>
            ${z(s, this.group.currency, this.language)}
            ${t !== null ? ` / ${z(t, this.group.currency, this.language)}` : ""}
          </span>
        </div>
      </div>
    `;
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? T(t.id)}`}>
        ${se(t.name)}
      </div>
    `;
  }
  equalShare(t, e) {
    if (t === null || !this.participants.has(e))
      return "";
    const s = this.members.map((h) => h.id).filter((h) => this.participants.has(h)), i = s.indexOf(e);
    if (i < 0 || s.length === 0)
      return "";
    const r = Math.floor(t / s.length), a = t % s.length, o = r + (i < a ? 1 : 0);
    return z(o, this.group.currency, this.language);
  }
  customTotal() {
    return Object.values(this.customAmounts).reduce(
      (t, e) => t + (O(e) ?? 0),
      0
    );
  }
  toggleParticipant(t) {
    const e = new Set(this.participants);
    e.has(t) ? e.delete(t) : e.add(t), this.participants = e;
  }
  setCustom(t, e) {
    this.customAmounts = { ...this.customAmounts, [t]: e };
  }
  isValid(t) {
    return this.expenseTitle.trim() === "" || t === null || t <= 0 || !this.paidBy ? !1 : this.mode === "equal" ? this.participants.size > 0 : this.mode === "custom" ? this.customTotal() === t : !0;
  }
};
m.styles = [
  N,
  C`
      .modes {
        display: flex;
        gap: 4px;
        background: var(--secondary-background-color, #f1f1f1);
        border-radius: 10px;
        padding: 4px;
      }

      .modes button {
        flex: 1;
        border: none;
        background: none;
        border-radius: 8px;
        padding: 8px 4px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }

      .modes button[aria-pressed="true"] {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .member-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 0;
      }

      .member-row .name {
        flex: 1;
        font-size: 14px;
      }

      .member-row se-field {
        width: 120px;
      }

      .total {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }
    `
];
f([
  l({ attribute: !1 })
], m.prototype, "api", 2);
f([
  l({ attribute: !1 })
], m.prototype, "localize", 2);
f([
  l({ attribute: !1 })
], m.prototype, "group", 2);
f([
  l({ attribute: !1 })
], m.prototype, "members", 2);
f([
  l({ attribute: !1 })
], m.prototype, "categories", 2);
f([
  l({ attribute: !1 })
], m.prototype, "expense", 2);
f([
  l({ type: String })
], m.prototype, "language", 2);
f([
  c()
], m.prototype, "expenseTitle", 2);
f([
  c()
], m.prototype, "amountInput", 2);
f([
  c()
], m.prototype, "paidBy", 2);
f([
  c()
], m.prototype, "date", 2);
f([
  c()
], m.prototype, "categoryId", 2);
f([
  c()
], m.prototype, "mode", 2);
f([
  c()
], m.prototype, "participants", 2);
f([
  c()
], m.prototype, "customAmounts", 2);
f([
  c()
], m.prototype, "busy", 2);
f([
  c()
], m.prototype, "error", 2);
f([
  c()
], m.prototype, "confirmingDelete", 2);
m = f([
  _("se-expense-dialog")
], m);
var Jt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, J = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Yt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Jt(e, s, r), r;
};
let U = class extends b {
  constructor() {
    super(...arguments), this.name = "", this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      try {
        const t = await this.api.createMember({
          name: this.name.trim(),
          group_id: this.groupId
        });
        this.dispatchEvent(
          new CustomEvent("member-created", {
            detail: { member: t },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (t) {
        this.error = q(t, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  render() {
    const t = this.localize;
    return n`
      <se-dialog open heading=${t("new_member")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : p}
          <se-field
            .label=${t("member_name")}
            .value=${this.name}
            required
            @value-changed=${(e) => this.name = e.detail.value}
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
U.styles = N;
J([
  l({ attribute: !1 })
], U.prototype, "api", 2);
J([
  l({ attribute: !1 })
], U.prototype, "localize", 2);
J([
  l({ type: String })
], U.prototype, "groupId", 2);
J([
  c()
], U.prototype, "name", 2);
J([
  c()
], U.prototype, "busy", 2);
J([
  c()
], U.prototype, "error", 2);
U = J([
  _("se-member-dialog")
], U);
var Xt = Object.defineProperty, es = Object.getOwnPropertyDescriptor, A = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? es(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Xt(e, s, r), r;
};
let x = class extends b {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = Ze(), this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = O(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Je(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-created", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = q(e, this.localize);
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
    const t = this.localize, e = O(this.amountInput), s = this.members.map((i) => ({ value: i.id, label: i.name }));
    return n`
      <se-dialog open heading=${t("new_payment")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : p}

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
                ${z(e, this.group.currency, this.language)}
              </div>` : p}
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
x.styles = N;
A([
  l({ attribute: !1 })
], x.prototype, "api", 2);
A([
  l({ attribute: !1 })
], x.prototype, "localize", 2);
A([
  l({ attribute: !1 })
], x.prototype, "group", 2);
A([
  l({ attribute: !1 })
], x.prototype, "members", 2);
A([
  l({ attribute: !1 })
], x.prototype, "settlement", 2);
A([
  l({ type: String })
], x.prototype, "language", 2);
A([
  c()
], x.prototype, "fromMember", 2);
A([
  c()
], x.prototype, "toMember", 2);
A([
  c()
], x.prototype, "amountInput", 2);
A([
  c()
], x.prototype, "date", 2);
A([
  c()
], x.prototype, "busy", 2);
A([
  c()
], x.prototype, "error", 2);
x = A([
  _("se-payment-dialog")
], x);
var ts = Object.defineProperty, ss = Object.getOwnPropertyDescriptor, y = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ss(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ts(e, s, r), r;
};
const Fe = 4;
let v = class extends b {
  constructor() {
    super(...arguments), this.language = "en", this.members = [], this.categories = [], this.expenses = [], this.payments = [], this.tab = "overview", this.loading = !0, this.handleQuickAction = (t) => {
      const e = t.detail.key;
      e === "expense" ? this.openExpense() : e === "payment" ? this.openPayment() : e === "member" ? this.tab = "members" : this.tab = "categories";
    }, this.closeDialog = () => {
      this.dialog = void 0, this.prefill = void 0, this.editedCategory = void 0, this.editedExpense = void 0;
    }, this.handleChanged = () => {
      this.closeDialog(), this.load();
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
        </div>

        ${this.error ? n`<div class="error">${this.error}</div>` : p}

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
        .members=${this.members}
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
          ${this.expenses.length > Fe ? n`<button class="link" @click=${() => this.tab = "expenses"}>
                ${t("see_all")}
              </button>` : p}
        </div>
        ${this.expenses.length === 0 ? n`<div class="empty">${t("no_expenses")}</div>` : this.expenses.slice(0, Fe).map((e) => this.renderExpense(e))}
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
          <div class="muted">${He(t.payment_date, this.language)}</div>
        </div>
        <span class="amount">
          ${z(t.amount, this.group.currency, this.language)}
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
        <div class="avatar" style=${`background:${t.color ?? T(t.id)}`}>
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
    const e = t.split_rule;
    if (!e || e.cap === null)
      return this.localize("rule_equal");
    const s = z(e.cap, this.group.currency, this.language);
    return `${this.localize("rule_capped")} ${s}`;
  }
  renderSettlement(t) {
    const e = this.localize, s = this.memberById(t.from_member_id), i = this.memberById(t.to_member_id);
    return n`
      <div class="settlement">
        <span>
          <strong>${s?.name ?? "?"}</strong> ${e("owes")}
          <strong class="amount">
            ${z(t.amount, this.group.currency, this.language)}
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
    const e = this.memberById(t.paid_by_member_id), s = this.categories.find((r) => r.id === t.category_id), i = e?.color ?? T(t.paid_by_member_id);
    return n`
      <button class="item item-button" @click=${() => this.openExpense(t)}>
        <se-icon
          .icon=${s?.icon}
          .fallback=${(s?.name ?? t.title).charAt(0).toUpperCase()}
          .color=${s?.color ?? T(s?.id ?? t.id)}
        ></se-icon>
        <div class="info">
          <div class="title">${t.title}</div>
          <div class="muted">
            ${He(t.expense_date, this.language)}
            ${s ? n` · ${s.name}` : p}
          </div>
          <div class="payer" style=${`color:${i}`}>
            ${this.localize("paid_by")} ${e?.name ?? "?"}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${z(t.amount, t.currency, this.language)}
          </span>
          ${this.renderParticipants(t)}
        </div>
      </button>
    `;
  }
  /** The members actually sharing the expense, stacked like on a receipt. */
  renderParticipants(t) {
    const e = (t.shares ?? []).filter((s) => s.amount !== 0);
    return e.length === 0 ? p : n`
      <div class="stack-avatars">
        ${e.map((s) => {
      const i = this.memberById(s.member_id);
      return n`
            <div
              class="avatar small"
              title=${i?.name ?? "?"}
              style=${`background:${i?.color ?? T(s.member_id)}`}
            >
              ${se(i?.name ?? "?")}
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
                  <div class="info"><div class="title">${e.name}</div></div>
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
      <div class="avatar" style=${`background:${s?.color ?? T(e)}`}>
        ${se(t)}
      </div>
    `;
  }
  renderDialog() {
    return !this.dialog || !this.group ? p : this.dialog === "expense" ? n`
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
        @member-created=${this.handleChanged}
      ></se-member-dialog>
    `;
  }
  memberById(t) {
    return this.members.find((e) => e.id === t);
  }
  async load() {
    this.error = void 0;
    try {
      const [t, e, s, i, r, a] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.listPayments(this.groupId),
        this.api.getBalances(this.groupId)
      ]);
      this.group = t, this.members = e, this.categories = s, this.expenses = i, this.payments = r, this.result = a;
    } catch (t) {
      this.error = q(t, this.localize);
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
v.styles = [
  N,
  C`
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
], v.prototype, "api", 2);
y([
  l({ attribute: !1 })
], v.prototype, "localize", 2);
y([
  l({ type: String })
], v.prototype, "groupId", 2);
y([
  l({ type: String })
], v.prototype, "language", 2);
y([
  c()
], v.prototype, "group", 2);
y([
  c()
], v.prototype, "members", 2);
y([
  c()
], v.prototype, "categories", 2);
y([
  c()
], v.prototype, "expenses", 2);
y([
  c()
], v.prototype, "payments", 2);
y([
  c()
], v.prototype, "result", 2);
y([
  c()
], v.prototype, "tab", 2);
y([
  c()
], v.prototype, "loading", 2);
y([
  c()
], v.prototype, "error", 2);
y([
  c()
], v.prototype, "dialog", 2);
y([
  c()
], v.prototype, "prefill", 2);
y([
  c()
], v.prototype, "editedCategory", 2);
y([
  c()
], v.prototype, "editedExpense", 2);
v = y([
  _("se-group-page")
], v);
class is {
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
  listMembers(e, s = !1) {
    return this.call("list_members", {
      ...e ? { group_id: e } : {},
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
var rs = Object.defineProperty, as = Object.getOwnPropertyDescriptor, ue = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? as(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && rs(e, s, r), r;
};
let Q = class extends b {
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
    this.hass && !this.api && (this.api = new is(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = kt(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
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
Q.styles = C`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
ue([
  l({ attribute: !1 })
], Q.prototype, "hass", 2);
ue([
  l({ type: Boolean })
], Q.prototype, "narrow", 2);
ue([
  l({ attribute: !1 })
], Q.prototype, "route", 2);
ue([
  c()
], Q.prototype, "groupId", 2);
Q = ue([
  _("shared-expenses-panel")
], Q);
export {
  Q as SharedExpensesPanel
};
