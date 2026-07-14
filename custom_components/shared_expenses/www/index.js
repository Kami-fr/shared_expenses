/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const we = globalThis, Ue = we.ShadowRoot && (we.ShadyCSS === void 0 || we.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ne = Symbol(), Fe = /* @__PURE__ */ new WeakMap();
let at = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== Ne) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (Ue && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = Fe.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Fe.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const gt = (t) => new at(typeof t == "string" ? t : t + "", void 0, Ne), C = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, r, o) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[o + 1], t[0]);
  return new at(i, t, Ne);
}, bt = (t, e) => {
  if (Ue) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), r = we.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, t.appendChild(s);
  }
}, We = Ue ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return gt(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ft, defineProperty: vt, getOwnPropertyDescriptor: yt, getOwnPropertyNames: $t, getOwnPropertySymbols: _t, getPrototypeOf: xt } = Object, Ae = globalThis, Ve = Ae.trustedTypes, wt = Ve ? Ve.emptyScript : "", St = Ae.reactiveElementPolyfillSupport, ue = (t, e) => t, Se = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? wt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, Re = (t, e) => !ft(t, e), Ye = { attribute: !0, type: String, converter: Se, reflect: !1, useDefault: !1, hasChanged: Re };
Symbol.metadata ??= Symbol("metadata"), Ae.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ae = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = Ye) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, i);
      r !== void 0 && vt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: r, set: o } = yt(this.prototype, e) ?? { get() {
      return this[i];
    }, set(a) {
      this[i] = a;
    } };
    return { get: r, set(a) {
      const u = r?.call(this);
      o?.call(this, a), this.requestUpdate(e, u, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ye;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ue("elementProperties"))) return;
    const e = xt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ue("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ue("properties"))) {
      const i = this.properties, s = [...$t(i), ..._t(i)];
      for (const r of s) this.createProperty(r, i[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [s, r] of i) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const r = this._$Eu(i, s);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) i.unshift(We(r));
    } else e !== void 0 && i.push(We(e));
    return i;
  }
  static _$Eu(e, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
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
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return bt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, i, s) {
    this._$AK(e, s);
  }
  _$ET(e, i) {
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : Se).toAttribute(i, s.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, i) {
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = s.getPropertyOptions(r), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : Se;
      this._$Em = r;
      const u = a.fromAttribute(i, o.type);
      this[r] = u ?? this._$Ej?.get(r) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, r = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (o = this[e]), s ??= a.getPropertyOptions(e), !((s.hasChanged ?? Re)(o, i) || s.useDefault && s.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, s)))) return;
      this.C(e, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: s, reflect: r, wrapped: o }, a) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? i ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (i = void 0), this._$AL.set(e, i)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
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
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, o] of s) {
        const { wrapped: a } = o, u = this[r];
        a !== !0 || this._$AL.has(r) || u === void 0 || this.C(r, void 0, o, u);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
ae.elementStyles = [], ae.shadowRootOptions = { mode: "open" }, ae[ue("elementProperties")] = /* @__PURE__ */ new Map(), ae[ue("finalized")] = /* @__PURE__ */ new Map(), St?.({ ReactiveElement: ae }), (Ae.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Be = globalThis, Ke = (t) => t, ze = Be.trustedTypes, Xe = ze ? ze.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, nt = "$lit$", Y = `lit$${Math.random().toFixed(9).slice(2)}$`, lt = "?" + Y, zt = `<${lt}>`, ie = document, me = () => ie.createComment(""), ge = (t) => t === null || typeof t != "object" && typeof t != "function", Ge = Array.isArray, Ct = (t) => Ge(t) || typeof t?.[Symbol.iterator] == "function", Pe = `[ 	
\f\r]`, he = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ze = /-->/g, Je = />/g, Q = RegExp(`>|${Pe}(?:([^\\s"'>=/]+)(${Pe}*=${Pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Qe = /'/g, et = /"/g, dt = /^(?:script|style|textarea|title)$/i, At = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), n = At(1), ne = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), tt = /* @__PURE__ */ new WeakMap(), ee = ie.createTreeWalker(ie, 129);
function ct(t, e) {
  if (!Ge(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Xe !== void 0 ? Xe.createHTML(e) : e;
}
const kt = (t, e) => {
  const i = t.length - 1, s = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = he;
  for (let u = 0; u < i; u++) {
    const p = t[u];
    let g, f, h = -1, A = 0;
    for (; A < p.length && (a.lastIndex = A, f = a.exec(p), f !== null); ) A = a.lastIndex, a === he ? f[1] === "!--" ? a = Ze : f[1] !== void 0 ? a = Je : f[2] !== void 0 ? (dt.test(f[2]) && (r = RegExp("</" + f[2], "g")), a = Q) : f[3] !== void 0 && (a = Q) : a === Q ? f[0] === ">" ? (a = r ?? he, h = -1) : f[1] === void 0 ? h = -2 : (h = a.lastIndex - f[2].length, g = f[1], a = f[3] === void 0 ? Q : f[3] === '"' ? et : Qe) : a === et || a === Qe ? a = Q : a === Ze || a === Je ? a = he : (a = Q, r = void 0);
    const x = a === Q && t[u + 1].startsWith("/>") ? " " : "";
    o += a === he ? p + zt : h >= 0 ? (s.push(g), p.slice(0, h) + nt + p.slice(h) + Y + x) : p + Y + (h === -2 ? u : x);
  }
  return [ct(t, o + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class be {
  constructor({ strings: e, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let o = 0, a = 0;
    const u = e.length - 1, p = this.parts, [g, f] = kt(e, i);
    if (this.el = be.createElement(g, s), ee.currentNode = this.el.content, i === 2 || i === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = ee.nextNode()) !== null && p.length < u; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(nt)) {
          const A = f[a++], x = r.getAttribute(h).split(Y), j = /([.?@])?(.*)/.exec(A);
          p.push({ type: 1, index: o, name: j[2], strings: x, ctor: j[1] === "." ? Pt : j[1] === "?" ? It : j[1] === "@" ? Ot : ke }), r.removeAttribute(h);
        } else h.startsWith(Y) && (p.push({ type: 6, index: o }), r.removeAttribute(h));
        if (dt.test(r.tagName)) {
          const h = r.textContent.split(Y), A = h.length - 1;
          if (A > 0) {
            r.textContent = ze ? ze.emptyScript : "";
            for (let x = 0; x < A; x++) r.append(h[x], me()), ee.nextNode(), p.push({ type: 2, index: ++o });
            r.append(h[A], me());
          }
        }
      } else if (r.nodeType === 8) if (r.data === lt) p.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(Y, h + 1)) !== -1; ) p.push({ type: 7, index: o }), h += Y.length - 1;
      }
      o++;
    }
  }
  static createElement(e, i) {
    const s = ie.createElement("template");
    return s.innerHTML = e, s;
  }
}
function le(t, e, i = t, s) {
  if (e === ne) return e;
  let r = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const o = ge(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(t), r._$AT(t, i, s)), s !== void 0 ? (i._$Co ??= [])[s] = r : i._$Cl = r), r !== void 0 && (e = le(t, r._$AS(t, e.values), r, s)), e;
}
class Et {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: s } = this._$AD, r = (e?.creationScope ?? ie).importNode(i, !0);
    ee.currentNode = r;
    let o = ee.nextNode(), a = 0, u = 0, p = s[0];
    for (; p !== void 0; ) {
      if (a === p.index) {
        let g;
        p.type === 2 ? g = new ye(o, o.nextSibling, this, e) : p.type === 1 ? g = new p.ctor(o, p.name, p.strings, this, e) : p.type === 6 && (g = new Dt(o, this, e)), this._$AV.push(g), p = s[++u];
      }
      a !== p?.index && (o = ee.nextNode(), a++);
    }
    return ee.currentNode = ie, r;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class ye {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, i, s, r) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && e?.nodeType === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = le(this, e, i), ge(e) ? e === c || e == null || e === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : e !== this._$AH && e !== ne && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ct(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== c && ge(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ie.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: i, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = be.createElement(ct(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const o = new Et(r, this), a = o.u(this.options);
      o.p(i), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let i = tt.get(e.strings);
    return i === void 0 && tt.set(e.strings, i = new be(e)), i;
  }
  k(e) {
    Ge(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const o of e) r === i.length ? i.push(s = new ye(this.O(me()), this.O(me()), this, this.options)) : s = i[r], s._$AI(o), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); e !== this._$AB; ) {
      const s = Ke(e).nextSibling;
      Ke(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ke {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, r, o) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = c;
  }
  _$AI(e, i = this, s, r) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = le(this, e, i, 0), a = !ge(e) || e !== this._$AH && e !== ne, a && (this._$AH = e);
    else {
      const u = e;
      let p, g;
      for (e = o[0], p = 0; p < o.length - 1; p++) g = le(this, u[s + p], i, p), g === ne && (g = this._$AH[p]), a ||= !ge(g) || g !== this._$AH[p], g === c ? e = c : e !== c && (e += (g ?? "") + o[p + 1]), this._$AH[p] = g;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Pt extends ke {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === c ? void 0 : e;
  }
}
class It extends ke {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== c);
  }
}
class Ot extends ke {
  constructor(e, i, s, r, o) {
    super(e, i, s, r, o), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = le(this, e, i, 0) ?? c) === ne) return;
    const s = this._$AH, r = e === c && s !== c || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, o = e !== c && (s === c || r);
    r && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Dt {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    le(this, e);
  }
}
const Mt = Be.litHtmlPolyfillSupport;
Mt?.(be, ye), (Be.litHtmlVersions ??= []).push("3.3.3");
const Tt = (t, e, i) => {
  const s = i?.renderBefore ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const o = i?.renderBefore ?? null;
    s._$litPart$ = r = new ye(e.insertBefore(me(), o), o, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const He = globalThis;
let v = class extends ae {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Tt(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ne;
  }
};
v._$litElement$ = !0, v.finalized = !0, He.litElementHydrateSupport?.({ LitElement: v });
const jt = He.litElementPolyfillSupport;
jt?.({ LitElement: v });
(He.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _ = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ut = { attribute: !0, type: String, converter: Se, reflect: !1, hasChanged: Re }, Nt = (t = Ut, e, i) => {
  const { kind: s, metadata: r } = i;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(i.name, t), s === "accessor") {
    const { name: a } = i;
    return { set(u) {
      const p = e.get.call(this);
      e.set.call(this, u), this.requestUpdate(a, p, t, !0, u);
    }, init(u) {
      return u !== void 0 && this.C(a, void 0, t, u), u;
    } };
  }
  if (s === "setter") {
    const { name: a } = i;
    return function(u) {
      const p = this[a];
      e.call(this, u), this.requestUpdate(a, p, t, !0, u);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function l(t) {
  return (e, i) => typeof i == "object" ? Nt(t, e, i) : ((s, r, o) => {
    const a = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, s), a ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(t, e, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(t) {
  return l({ ...t, state: !0, attribute: !1 });
}
var Rt = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, Ee = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Bt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Rt(e, i, r), r;
};
let de = class extends v {
  constructor() {
    super(...arguments), this.variant = "filled", this.disabled = !1;
  }
  render() {
    return n`
      <button class=${this.variant} ?disabled=${this.disabled} @click=${this.handleClick}>
        ${this.icon ? n`<span aria-hidden="true">${this.icon}</span>` : c}
        <slot></slot>
      </button>
    `;
  }
  handleClick(t) {
    this.disabled && t.stopPropagation();
  }
};
de.styles = C`
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
Ee([
  l({ type: String })
], de.prototype, "variant", 2);
Ee([
  l({ type: Boolean })
], de.prototype, "disabled", 2);
Ee([
  l({ type: String })
], de.prototype, "icon", 2);
de = Ee([
  _("se-button")
], de);
var Gt = Object.defineProperty, Ht = Object.getOwnPropertyDescriptor, ce = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ht(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Gt(e, i, r), r;
};
let K = class extends v {
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
ce([
  l({ type: String })
], K.prototype, "icon", 2);
ce([
  l({ type: String })
], K.prototype, "fallback", 2);
ce([
  l({ type: String })
], K.prototype, "color", 2);
ce([
  l({ type: Number })
], K.prototype, "size", 2);
ce([
  l({ type: Boolean })
], K.prototype, "plain", 2);
K = ce([
  _("se-icon")
], K);
var Lt = Object.getOwnPropertyDescriptor, qt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Lt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = a(r) || r);
  return r;
};
let De = class extends v {
  constructor() {
    super(...arguments), this.toggle = () => {
      this.dispatchEvent(
        new CustomEvent("hass-toggle-menu", { bubbles: !0, composed: !0 })
      );
    };
  }
  render() {
    return n`
      <button aria-label="menu" @click=${this.toggle}>
        <se-icon plain .icon=${"mdi:menu"} fallback="☰" .size=${24}></se-icon>
      </button>
    `;
  }
};
De.styles = C`
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
De = qt([
  _("se-menu-button")
], De);
var Ft = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, Le = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Wt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Ft(e, i, r), r;
};
let fe = class extends v {
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
          <slot name="banner"></slot>
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
fe.styles = C`
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
      /*
       * A flex item will not shrink below its content on its own, so a single
       * stubborn field inside could widen the dialog past the screen. The
       * dialog is the one that decides: the content fits in it, not the other
       * way round.
       */
      min-width: 0;
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
Le([
  l({ type: String })
], fe.prototype, "heading", 2);
Le([
  l({ type: Boolean, reflect: !0 })
], fe.prototype, "open", 2);
fe = Le([
  _("se-dialog")
], fe);
var Vt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, F = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Yt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Vt(e, i, r), r;
};
let U = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.type = "text", this.placeholder = "", this.required = !1, this.disabled = !1, this.decimal = !1;
  }
  render() {
    return n`
      ${this.label ? n`<label>${this.label}${this.required ? " *" : ""}</label>` : c}
      <div class="wrapper">
        <input
          .type=${this.type}
          .value=${this.value}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          inputmode=${this.decimal ? "decimal" : c}
          @input=${this.handleInput}
        />
        ${this.suffix ? n`<span class="suffix">${this.suffix}</span>` : c}
      </div>
      ${this.helper ? n`<div class="helper">${this.helper}</div>` : c}
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
U.styles = C`
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
F([
  l({ type: String })
], U.prototype, "label", 2);
F([
  l({ type: String })
], U.prototype, "value", 2);
F([
  l({ type: String })
], U.prototype, "type", 2);
F([
  l({ type: String })
], U.prototype, "placeholder", 2);
F([
  l({ type: String })
], U.prototype, "suffix", 2);
F([
  l({ type: String })
], U.prototype, "helper", 2);
F([
  l({ type: Boolean })
], U.prototype, "required", 2);
F([
  l({ type: Boolean })
], U.prototype, "disabled", 2);
F([
  l({ type: Boolean })
], U.prototype, "decimal", 2);
U = F([
  _("se-field")
], U);
const Ce = {
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
  tab_overview: "Overview",
  tab_balances: "Balances",
  tab_expenses: "Expenses",
  tab_settlements: "Settlements",
  tab_categories: "Categories",
  current_balance: "Current balance",
  must_receive: "is owed",
  must_pay: "owes",
  you_owe: "You owe",
  owes_you: "owes you",
  you_are_settled: "You are settled up.",
  detailed_balances: "See detailed balances",
  recent_activity: "Recent activity",
  no_activity: "Nothing has happened yet.",
  a_settlement: "Settlement",
  see_all: "See all",
  action_add_expense: "Add expense",
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
  confirm_delete_expense: "Delete this expense? It cannot be brought back, and every share it carries goes with it.",
  confirm_delete_payment: "Delete this payment? The debt it settled comes back.",
  expense_title: "Title",
  amount: "Amount",
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
  payments: "Payments",
  new_payment: "Record a payment",
  edit_payment: "Edit payment",
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
}, Kt = {
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
  tab_overview: "Aperçu",
  tab_balances: "Soldes",
  tab_expenses: "Dépenses",
  tab_settlements: "Règlements",
  tab_categories: "Catégories",
  current_balance: "Solde actuel",
  must_receive: "doit recevoir",
  must_pay: "doit payer",
  you_owe: "Tu dois",
  owes_you: "te doit",
  you_are_settled: "Tu es à jour.",
  detailed_balances: "Voir les soldes détaillés",
  recent_activity: "Dernière activité",
  no_activity: "Rien ne s'est encore passé.",
  a_settlement: "Remboursement",
  see_all: "Voir tout",
  action_add_expense: "Ajouter dépense",
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
  confirm_delete_expense: "Supprimer cette dépense ? Elle ne pourra pas être récupérée, et les parts qu'elle porte disparaissent avec elle.",
  confirm_delete_payment: "Supprimer ce paiement ? La dette qu'il a soldée réapparaît.",
  expense_title: "Intitulé",
  amount: "Montant",
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
  payments: "Paiements",
  new_payment: "Enregistrer un paiement",
  edit_payment: "Modifier le paiement",
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
}, Xt = { en: Ce, fr: Kt };
function Zt(t) {
  const e = Xt[t.split("-")[0]] ?? Ce;
  return (i) => e[i] ?? Ce[i] ?? i;
}
function w(t, e) {
  const i = t?.code;
  return i && i in Ce ? e(i) : t?.message || e("error_generic");
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
var Jt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, Z = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Qt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Jt(e, i, r), r;
};
let L = class extends v {
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
        this.error = w(t, this.localize);
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
          ${this.error ? n`<div class="error">${this.error}</div>` : c}
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
L.styles = N;
Z([
  l({ attribute: !1 })
], L.prototype, "api", 2);
Z([
  l({ attribute: !1 })
], L.prototype, "localize", 2);
Z([
  d()
], L.prototype, "name", 2);
Z([
  d()
], L.prototype, "description", 2);
Z([
  d()
], L.prototype, "currency", 2);
Z([
  d()
], L.prototype, "busy", 2);
Z([
  d()
], L.prototype, "error", 2);
L = Z([
  _("se-group-dialog")
], L);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, oe = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ti(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && ei(e, i, r), r;
};
let W = class extends v {
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
      <div class="toolbar">
        <div class="header">
          <se-menu-button></se-menu-button>
          <h1>${t("groups")}</h1>
        </div>
      </div>

      <div class="page">
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : c}

          ${this.groups.length === 0 ? n`<div class="card">
                <div class="empty">${t("no_groups")}</div>
              </div>` : n`<div class="card">
                ${this.groups.map((e) => this.renderGroup(e))}
              </div>`}

          <div class="fab">
            <se-button @click=${() => this.dialogOpen = !0}>
              ${t("new_group")}
            </se-button>
          </div>
        </div>
      </div>

      ${this.dialogOpen ? n`
            <se-group-dialog
              .api=${this.api}
              .localize=${this.localize}
              @dialog-cancelled=${() => this.dialogOpen = !1}
              @group-created=${this.handleCreated}
            ></se-group-dialog>
          ` : c}
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
          ${t.description ? n`<div class="muted">${t.description}</div>` : c}
        </div>
        ${t.archived ? n`<span class="archived-tag">${this.localize("archived")}</span>` : c}
        <span class="chevron">›</span>
      </button>
    `;
  }
  async load() {
    this.loading = !0, this.error = void 0;
    try {
      this.groups = await this.api.listGroups();
    } catch (t) {
      this.error = w(t, this.localize);
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
W.styles = [
  N,
  C`
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
oe([
  l({ attribute: !1 })
], W.prototype, "api", 2);
oe([
  l({ attribute: !1 })
], W.prototype, "localize", 2);
oe([
  d()
], W.prototype, "groups", 2);
oe([
  d()
], W.prototype, "loading", 2);
oe([
  d()
], W.prototype, "error", 2);
oe([
  d()
], W.prototype, "dialogOpen", 2);
W = oe([
  _("se-dashboard-page")
], W);
function B(t, e, i) {
  return new Intl.NumberFormat(i, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function te(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const i = Number(e);
  return Number.isNaN(i) ? null : Math.round(i * 100);
}
function it(t, e) {
  const i = new Intl.DateTimeFormat(e, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
  return i.charAt(0).toUpperCase() + i.slice(1);
}
function pt() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), i = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${i}`;
}
function Me(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function ht(t) {
  const e = new Date(t), i = `${e.getMonth() + 1}`.padStart(2, "0"), s = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${i}-${s}`;
}
function ve(t) {
  return (t / 100).toFixed(2);
}
function H(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
const Te = [
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
function M(t) {
  let e = 0;
  for (let i = 0; i < t.length; i += 1)
    e = e * 31 + t.charCodeAt(i) >>> 0;
  return Te[e % Te.length];
}
var ii = Object.defineProperty, si = Object.getOwnPropertyDescriptor, J = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? si(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && ii(e, i, r), r;
};
let q = class extends v {
  constructor() {
    super(...arguments), this.balances = [], this.settlements = [], this.members = [], this.meId = null, this.currency = "EUR", this.language = "en";
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
    const t = this.balances.filter((s) => s.amount !== 0);
    if (t.length === 0)
      return n`<div class="settled muted">${this.localize("balance_settled")}</div>`;
    if (this.settlements.length === 0)
      return n`<div>${t.map((s) => this.renderRow(s))}</div>`;
    if (this.meId === null)
      return this.renderGroupView(t);
    const e = this.settlements.filter(
      (s) => s.from_member_id === this.meId || s.to_member_id === this.meId
    ), i = this.settlements.filter((s) => !e.includes(s));
    return n`
      ${e.length === 0 ? n`<div class="settled muted">${this.localize("you_are_settled")}</div>` : e.map((s) => this.renderMine(s))}
      ${i.length === 0 ? c : n`
            <div class="others">
              ${i.map((s) => this.renderTransfer(s))}
            </div>
          `}
    `;
  }
  /** No "you" to speak from: show the group as it stands. */
  renderGroupView(t) {
    return t.length === 2 ? this.renderDuel(t) : n`
      <div>${this.settlements.map((e) => this.renderTransfer(e))}</div>
    `;
  }
  /** Your own line, as a sentence: the one thing you came to find out. */
  renderMine(t) {
    const e = this.localize, i = t.from_member_id === this.meId, s = i ? t.to_member_id : t.from_member_id, r = this.memberById(s), o = r?.name ?? "?", a = n`
      <strong class=${`figure ${i ? "negative" : "positive"}`}>
        ${B(t.amount, this.currency, this.language)}
      </strong>
    `;
    return n`
      <div class="mine">
        <div class="avatar" style=${`background:${r?.color ?? M(s)}`}>
          ${H(o)}
        </div>
        <div class="sentence">
          ${i ? n`${e("you_owe")} ${a} ${e("to")} ${o}` : n`${o} ${e("owes_you")} ${a}`}
        </div>
      </div>
    `;
  }
  /** One transfer, as a gesture to make: who pays, to whom, how much. */
  renderTransfer(t) {
    return n`
      <div class="transfer">
        ${this.renderParty(t.from_member_id)}
        <span class="arrow">→</span>
        ${this.renderParty(t.to_member_id)}
        <span class="amount">
          ${B(t.amount, this.currency, this.language)}
        </span>
      </div>
    `;
  }
  renderParty(t) {
    const e = this.memberById(t), i = e?.name ?? "?";
    return n`
      <span class="party" title=${i}>
        <span
          class="avatar"
          style=${`background:${e?.color ?? M(t)}`}
          >${H(i)}</span
        >
        <span class="name">${i}</span>
      </span>
    `;
  }
  renderDuel(t) {
    const e = [...t].sort((i, s) => s.amount - i.amount);
    return n`
      <div class="duel">
        ${this.renderSide(e[0], !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(e[1], !0)}
      </div>
    `;
  }
  renderSide(t, e) {
    const i = this.memberById(t.member_id), s = t.amount > 0, r = s ? "positive" : "negative", o = n`
      <div class="avatar" style=${`background:${i?.color ?? M(t.member_id)}`}>
        ${H(i?.name ?? "?")}
      </div>
    `, a = n`
      <div class="body">
        <div class="name">${i?.name ?? "?"}</div>
        <div class=${`verdict ${r}`}>
          ${s ? this.localize("must_receive") : this.localize("must_pay")}
        </div>
        <div class=${`figure ${r}`}>
          ${B(Math.abs(t.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return n`
      <div class=${`side ${e ? "right" : ""}`}>
        ${e ? c : o}${a}${e ? o : c}
      </div>
    `;
  }
  renderRow(t) {
    const e = this.memberById(t.member_id), i = t.amount > 0, s = i ? "positive" : "negative";
    return n`
      <div class="row">
        <div class="avatar" style=${`background:${e?.color ?? M(t.member_id)}`}>
          ${H(e?.name ?? "?")}
        </div>
        <span class="name">${e?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${s}`}>
            ${i ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${s}`}>
            ${B(Math.abs(t.amount), this.currency, this.language)}
          </div>
        </div>
      </div>
    `;
  }
  memberById(t) {
    return this.members.find((e) => e.id === t);
  }
};
q.styles = [
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

      .mine {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px 14px;
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
J([
  l({ attribute: !1 })
], q.prototype, "localize", 2);
J([
  l({ attribute: !1 })
], q.prototype, "balances", 2);
J([
  l({ attribute: !1 })
], q.prototype, "settlements", 2);
J([
  l({ attribute: !1 })
], q.prototype, "members", 2);
J([
  l({ type: String })
], q.prototype, "meId", 2);
J([
  l({ type: String })
], q.prototype, "currency", 2);
J([
  l({ type: String })
], q.prototype, "language", 2);
q = J([
  _("se-balance-card")
], q);
var ri = Object.defineProperty, oi = Object.getOwnPropertyDescriptor, $e = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? oi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && ri(e, i, r), r;
};
let se = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.value = null, this.fallback = "#5c6b8a";
  }
  render() {
    const t = this.localize;
    return n`
      ${this.label ? n`<label>${this.label}</label>` : c}

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

        ${Te.map(
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
se.styles = [
  N,
  C`
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
$e([
  l({ attribute: !1 })
], se.prototype, "localize", 2);
$e([
  l({ type: String })
], se.prototype, "label", 2);
$e([
  l({ type: String })
], se.prototype, "value", 2);
$e([
  l({ type: String })
], se.prototype, "fallback", 2);
se = $e([
  _("se-color-picker")
], se);
var ai = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, V = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ni(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && ai(e, i, r), r;
};
const st = "/static/mdi/iconList.json", Ie = 48;
let xe = null;
function li() {
  return xe === null && (xe = fetch(st).then((t) => {
    if (!t.ok)
      throw new Error(`${t.status} on ${st}`);
    return t.json();
  }).catch((t) => {
    throw xe = null, t;
  })), xe;
}
let G = class extends v {
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
      ${this.label ? n`<label>${this.label}</label>` : c}

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
        ${this.value ? n`<button class="clear" @click=${this.clear} aria-label="×">×</button>` : c}
      </div>

      ${this.renderHint()} ${this.open ? this.renderGrid() : c}
    `;
  }
  renderHint() {
    return this.failed ? n`<div class="hint">${this.localize("icon_list_failed")}</div>` : n`<div class="hint">${this.localize("icon_hint")}</div>`;
  }
  renderGrid() {
    return this.suggestions.length === 0 ? c : n`
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
        this.icons = await li();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(t) {
    const e = t.trim().toLowerCase();
    if (e === "") {
      this.suggestions = this.icons.slice(0, Ie);
      return;
    }
    const i = [], s = [], r = [];
    for (const o of this.icons)
      if (o.name.startsWith(e) ? i.push(o) : o.name.includes(e) ? s.push(o) : o.keywords?.some((a) => a.includes(e)) && r.push(o), i.length >= Ie)
        break;
    this.suggestions = [...i, ...s, ...r].slice(0, Ie);
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
G.styles = [
  N,
  C`
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
V([
  l({ attribute: !1 })
], G.prototype, "localize", 2);
V([
  l({ type: String })
], G.prototype, "label", 2);
V([
  l({ type: String })
], G.prototype, "value", 2);
V([
  l({ type: String })
], G.prototype, "color", 2);
V([
  d()
], G.prototype, "icons", 2);
V([
  d()
], G.prototype, "suggestions", 2);
V([
  d()
], G.prototype, "open", 2);
V([
  d()
], G.prototype, "failed", 2);
G = V([
  _("se-icon-picker")
], G);
function je(t) {
  const { amount: e, payerId: i, memberIds: s } = t;
  if (!Number.isInteger(e) || e <= 0)
    return null;
  const r = [...new Set(s)];
  if (r.length === 0 || !r.includes(i))
    return null;
  const o = t.rule ?? {}, a = di(o, e);
  if (a === null)
    return null;
  const u = o.participants == null ? r : [...new Set(o.participants)];
  if (u.some((x) => !r.includes(x)))
    return null;
  const p = u.length === 0 ? 0 : a, g = ut(p, u), f = e - p;
  if (f > 0) {
    const x = ci(o.remainder, f, i, r);
    if (x === null)
      return null;
    for (const [j, mt] of Object.entries(x))
      g[j] = (g[j] ?? 0) + mt;
  }
  const h = {};
  for (const [x, j] of Object.entries(g))
    j !== 0 && (h[x] = j);
  return Object.values(h).reduce((x, j) => x + j, 0) === e ? h : null;
}
function di(t, e) {
  return t.envelope == null ? e : t.envelope < 0 ? null : Math.min(t.envelope, e);
}
function ci(t, e, i, s) {
  const r = t ?? {}, o = r.fixed ?? {};
  for (const [h, A] of Object.entries(o))
    if (!s.includes(h) || A < 0)
      return null;
  const a = r.members == null ? [i] : [...new Set(r.members)];
  if (a.length === 0 || a.some((h) => !s.includes(h)))
    return null;
  const u = {};
  for (const h of a)
    h in o && (u[h] = o[h]);
  const p = Object.values(u).reduce((h, A) => h + A, 0);
  if (p > e)
    return null;
  const g = a.filter((h) => !(h in u));
  if (g.length === 0)
    return p === e ? u : null;
  const f = { ...u };
  for (const [h, A] of Object.entries(
    ut(e - p, g)
  ))
    f[h] = (f[h] ?? 0) + A;
  return f;
}
function ut(t, e) {
  if (t <= 0 || e.length === 0)
    return {};
  const i = Math.floor(t / e.length), s = t % e.length, r = {};
  return e.forEach((o, a) => {
    r[o] = i + (a < s ? 1 : 0);
  }), r;
}
var pi = Object.defineProperty, hi = Object.getOwnPropertyDescriptor, D = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? hi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && pi(e, i, r), r;
};
const ui = 8542;
let k = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.required = !1, this.enabled = !1, this.envelopeInput = "", this.participants = /* @__PURE__ */ new Set(), this.takers = /* @__PURE__ */ new Set(), this.amounts = {};
  }
  connectedCallback() {
    super.connectedCallback(), this.enabled = this.required || this.rule !== null, this.envelopeInput = this.rule?.envelope != null ? ve(this.rule.envelope) : "", this.participants = new Set(
      this.rule?.participants ?? this.members.map((e) => e.id)
    );
    const t = this.rule?.remainder?.members;
    this.takers = new Set(
      t ?? (this.payerId ? [this.payerId] : [])
    ), this.amounts = Object.fromEntries(
      Object.entries(this.rule?.remainder?.fixed ?? {}).map(([e, i]) => [
        e,
        ve(i)
      ])
    );
  }
  willUpdate(t) {
    if (!t.has("payerId"))
      return;
    const e = t.get("payerId");
    e != null && this.takers.size === 1 && this.takers.has(e) && this.payerId && (this.takers = /* @__PURE__ */ new Set([this.payerId]), this.amounts = {});
  }
  firstUpdated() {
    this.emit();
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
    return this.amount != null && this.amount > 0 ? this.amount : ui;
  }
  renderPanel() {
    const t = this.localize, e = te(this.envelopeInput), i = this.envelopeInput.trim() !== "" && e !== null && e < this.previewAmount;
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
            @value-changed=${(s) => this.setEnvelope(s.detail.value)}
          ></se-field>

          <div class="muted" style="margin-top:8px">
            ${t("shared_between")}
          </div>
          ${this.members.map((s) => this.renderParticipant(s))}
        </div>

        ${i ? this.renderRemainder() : c} ${this.renderPreview()}
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
                @value-changed=${(i) => this.setAmount(e.id, i.detail.value)}
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
      return c;
    const e = this.previewAmount, i = je({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((r) => r.id),
      rule: this.build()
    });
    if (i === null)
      return n`<div class="preview negative">${this.localize("rule_invalid")}</div>`;
    const s = (r) => B(r, this.currency, this.language);
    return n`
      <div class="preview">
        <div class="muted">
          ${this.localize("rule_preview_intro")} ${s(e)}
          ${this.localize("rule_preview_paid_by")} ${t.name} :
        </div>
        ${this.members.map(
      (r) => n`
            <div class="line">
              <span>${r.name}</span>
              <strong>${s(i[r.id] ?? 0)}</strong>
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
    return !t || this.amount == null ? null : je({
      amount: this.amount,
      payerId: t.id,
      memberIds: this.members.map((e) => e.id),
      rule: this.build()
    });
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? M(t.id)}`}>
        ${H(t.name)}
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
    this.participants = rt(this.participants, t), this.emit();
  }
  toggleTaker(t) {
    if (this.takers = rt(this.takers, t), !this.takers.has(t)) {
      const { [t]: e, ...i } = this.amounts;
      this.amounts = i;
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
    const t = this.envelopeInput.trim(), e = t === "" ? null : te(t), i = {};
    for (const [s, r] of Object.entries(this.amounts)) {
      if (!this.takers.has(s) || r.trim() === "")
        continue;
      const o = te(r);
      o !== null && (i[s] = o);
    }
    return {
      envelope: e,
      participants: this.participants.size === this.members.length ? null : [...this.participants],
      remainder: {
        // Nobody ticked: whoever paid takes the rest, the useful default.
        members: this.takers.size === 0 ? null : [...this.takers],
        fixed: i
      }
    };
  }
};
k.styles = [
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
D([
  l({ attribute: !1 })
], k.prototype, "localize", 2);
D([
  l({ attribute: !1 })
], k.prototype, "members", 2);
D([
  l({ attribute: !1 })
], k.prototype, "rule", 2);
D([
  l({ type: String })
], k.prototype, "currency", 2);
D([
  l({ type: String })
], k.prototype, "language", 2);
D([
  l({ type: Number })
], k.prototype, "amount", 2);
D([
  l({ type: String })
], k.prototype, "payerId", 2);
D([
  l({ type: Boolean })
], k.prototype, "required", 2);
D([
  d()
], k.prototype, "enabled", 2);
D([
  d()
], k.prototype, "envelopeInput", 2);
D([
  d()
], k.prototype, "participants", 2);
D([
  d()
], k.prototype, "takers", 2);
D([
  d()
], k.prototype, "amounts", 2);
k = D([
  _("se-split-rule-editor")
], k);
function rt(t, e) {
  const i = new Set(t);
  return i.has(e) ? i.delete(e) : i.add(e), i;
}
var mi = Object.defineProperty, gi = Object.getOwnPropertyDescriptor, T = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? gi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && mi(e, i, r), r;
};
let E = class extends v {
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
        this.error = w(e, this.localize);
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
          ${this.error ? n`<div class="error">${this.error}</div>` : c}

          <se-field
            .label=${t("category_name")}
            .value=${this.name}
            required
            placeholder="Courses"
            @value-changed=${(i) => this.name = i.detail.value}
          ></se-field>

          <se-icon-picker
            .localize=${this.localize}
            .label=${t("icon")}
            .value=${this.icon}
            .color=${this.effectiveColor()}
            @value-changed=${(i) => this.icon = i.detail.value}
          ></se-icon-picker>

          <se-color-picker
            .localize=${this.localize}
            .label=${t("color")}
            .value=${this.color}
            .fallback=${this.autoColor()}
            @value-changed=${(i) => this.color = i.detail.value}
          ></se-color-picker>

          <div>
            <label class="muted">${t("default_split")}</label>
            <se-split-rule-editor
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
    return M(this.category?.id ?? this.name);
  }
};
E.styles = N;
T([
  l({ attribute: !1 })
], E.prototype, "api", 2);
T([
  l({ attribute: !1 })
], E.prototype, "localize", 2);
T([
  l({ attribute: !1 })
], E.prototype, "group", 2);
T([
  l({ attribute: !1 })
], E.prototype, "members", 2);
T([
  l({ attribute: !1 })
], E.prototype, "category", 2);
T([
  l({ type: String })
], E.prototype, "language", 2);
T([
  d()
], E.prototype, "name", 2);
T([
  d()
], E.prototype, "icon", 2);
T([
  d()
], E.prototype, "color", 2);
T([
  d()
], E.prototype, "rule", 2);
T([
  d()
], E.prototype, "busy", 2);
T([
  d()
], E.prototype, "error", 2);
E = T([
  _("se-category-dialog")
], E);
var bi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, R = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? fi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && bi(e, i, r), r;
};
let O = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.categories = [], this.creating = !1, this.loading = !0, this.dirty = !1, this.closeEditor = () => {
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
    const t = this.localize;
    return this.creating || this.editing ? n`
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
      ` : n`
      <se-dialog open heading=${t("categories")} @dialog-closed=${this.close}>
        ${this.loading ? n`<div class="empty">${t("loading")}</div>` : n`
              <div>
                ${this.error ? n`<div class="error">${this.error}</div>` : c}
                ${this.categories.length === 0 ? n`<div class="empty">${t("no_categories")}</div>` : this.categories.map((e) => this.renderRow(e))}
              </div>
            `}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${t("close")}
        </se-button>
        <se-button slot="actions" @click=${() => this.creating = !0}>
          ${t("new_category")}
        </se-button>
      </se-dialog>
    `;
  }
  renderRow(t) {
    return n`
      <button class="row" @click=${() => this.editing = t}>
        <se-icon
          .icon=${t.icon}
          .fallback=${t.name.charAt(0).toUpperCase()}
          .color=${t.color ?? M(t.id)}
          .size=${34}
        ></se-icon>
        <div class="info">
          <div class="name">${t.name}</div>
          <div class="muted">${this.describe(t)}</div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }
  /** Summarize a split rule in one line. */
  describe(t) {
    const e = t.split_rule?.envelope;
    if (e == null)
      return this.localize("rule_equal");
    const i = B(e, this.group.currency, this.language);
    return `${this.localize("rule_shares")} ${i}`;
  }
  async load() {
    this.error = void 0;
    try {
      this.categories = await this.api.listCategories(this.group.id);
    } catch (t) {
      this.error = w(t, this.localize);
    } finally {
      this.loading = !1;
    }
  }
};
O.styles = [
  N,
  C`
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
R([
  l({ attribute: !1 })
], O.prototype, "api", 2);
R([
  l({ attribute: !1 })
], O.prototype, "localize", 2);
R([
  l({ attribute: !1 })
], O.prototype, "group", 2);
R([
  l({ attribute: !1 })
], O.prototype, "members", 2);
R([
  l({ type: String })
], O.prototype, "language", 2);
R([
  d()
], O.prototype, "categories", 2);
R([
  d()
], O.prototype, "editing", 2);
R([
  d()
], O.prototype, "creating", 2);
R([
  d()
], O.prototype, "loading", 2);
R([
  d()
], O.prototype, "error", 2);
R([
  d()
], O.prototype, "dirty", 2);
O = R([
  _("se-categories-dialog")
], O);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vi = (t) => (...e) => ({ _$litDirective$: t, values: e });
let yi = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, i, s) {
    this._$Ct = e, this._$AM = i, this._$Ci = s;
  }
  _$AS(e, i) {
    return this.update(e, i);
  }
  update(e, i) {
    return this.render(...i);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $i = {}, _i = (t, e = $i) => t._$AH = e;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xi = vi(class extends yi {
  constructor() {
    super(...arguments), this.key = c;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, i]) {
    return e !== this.key && (_i(t), this.key = e), i;
  }
});
var wi = Object.defineProperty, Si = Object.getOwnPropertyDescriptor, pe = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Si(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && wi(e, i, r), r;
};
let X = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.options = [], this.disabled = !1;
  }
  render() {
    return n`
      ${this.label ? n`<label>${this.label}</label>` : c}
      <select .value=${this.value} ?disabled=${this.disabled} @change=${this.handleChange}>
        ${this.placeholder ? n`<option value="" ?selected=${!this.value}>${this.placeholder}</option>` : c}
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
X.styles = C`
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
pe([
  l({ type: String })
], X.prototype, "label", 2);
pe([
  l({ type: String })
], X.prototype, "value", 2);
pe([
  l({ attribute: !1 })
], X.prototype, "options", 2);
pe([
  l({ type: String })
], X.prototype, "placeholder", 2);
pe([
  l({ type: Boolean })
], X.prototype, "disabled", 2);
X = pe([
  _("se-select")
], X);
var zi = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, $ = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ci(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && zi(e, i, r), r;
};
let y = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = pt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.editingSplit = !1, this.showDescription = !1, this.pickCategory = (t) => {
      this.categoryId = t.detail.value, this.rule = null;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const t = te(this.amountInput), e = this.resolved(t);
      if (t === null || !e)
        return;
      this.busy = !0, this.error = void 0;
      const i = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: Me(this.date),
        category_id: this.categoryId || null,
        description: this.description.trim() || null,
        shares: Object.entries(e).map(([s, r]) => ({
          member_id: s,
          amount: r
        })),
        // The shares are the truth, but the rule has to travel with them, or
        // reopening the expense could only ever spell the amounts back out.
        split_rule: this.rule ?? this.defaultRule()
      };
      try {
        const s = this.expense ? await this.api.updateExpense(this.expense.id, {
          title: i.title,
          amount: i.amount,
          paid_by_member_id: i.paid_by_member_id,
          expense_date: i.expense_date,
          category_id: i.category_id,
          description: i.description,
          shares: i.shares,
          split_rule: i.split_rule
        }) : await this.api.createExpense(i);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: s },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (s) {
        this.error = w(s, this.localize);
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
          this.error = w(t, this.localize), this.confirmingDelete = !1;
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
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = ve(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = ht(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares(), this.showDescription = this.description !== "";
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
  /**
   * The shares the split comes out as.
   *
   * Resolved from this dialog's own state rather than asked of the editor:
   * during a render the editor still holds the previous amount, so it would
   * answer one keystroke behind. Same resolver either way — the one the backend
   * is checked against.
   */
  resolved(t) {
    return t === null || !this.paidBy || this.members.length === 0 ? null : je({
      amount: t,
      payerId: this.paidBy,
      memberIds: this.members.map((e) => e.id),
      rule: this.rule ?? this.defaultRule()
    });
  }
  render() {
    const t = this.localize, e = te(this.amountInput), i = this.expense ? t("edit_expense") : t("new_expense");
    return n`
      <se-dialog open heading=${i} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : c}

          <se-field
            .label=${t("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(s) => this.expenseTitle = s.detail.value}
          ></se-field>

          <div class="pair">
            <se-field
              .label=${t("amount")}
              .value=${this.amountInput}
              .suffix=${this.group.currency}
              required
              decimal
              placeholder="85,42"
              @value-changed=${(s) => this.amountInput = s.detail.value}
            ></se-field>

            <se-field
              .label=${t("date")}
              type="date"
              .value=${this.date}
              @value-changed=${(s) => this.date = s.detail.value}
            ></se-field>
          </div>

          <div class="pair">
            <se-select
              .label=${t("paid_by")}
              .value=${this.paidBy}
              .options=${this.members.map((s) => ({ value: s.id, label: s.name }))}
              @value-changed=${(s) => this.paidBy = s.detail.value}
            ></se-select>

            <se-select
              .label=${t("category")}
              .value=${this.categoryId}
              .placeholder=${t("no_category")}
              .options=${this.categories.map((s) => ({ value: s.id, label: s.name }))}
              @value-changed=${this.pickCategory}
            ></se-select>
          </div>

          ${this.showDescription ? n`
                <se-field
                  .label=${t("description")}
                  .value=${this.description}
                  placeholder=${t("description_placeholder")}
                  @value-changed=${(s) => this.description = s.detail.value}
                ></se-field>
              ` : n`
                <button class="link" @click=${() => this.showDescription = !0}>
                  + ${t("add_description")}
                </button>
              `}

          ${this.renderSplit(e)}
        </div>

        ${this.confirmingDelete ? n`<div slot="banner" class="warning">
              ${t("confirm_delete_expense")}
            </div>` : c}

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
            ` : c}
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
   * The split: its result always, its controls on request.
   *
   * The editor is the tallest thing here and the least often touched, since the
   * category rule usually does the job. So it stays folded away — but what it
   * resolves to is always on screen, because that is the part you must see
   * before saving.
   */
  renderSplit(t) {
    const e = this.localize;
    return n`
      <div>
        <div class="split-head">
          <label class="muted">${e("split")}</label>
          <button class="link" @click=${() => this.editingSplit = !this.editingSplit}>
            ${this.editingSplit ? e("done") : e("edit_split")}
          </button>
        </div>

        ${this.editingSplit ? c : this.renderSummary(t)}

        <!-- Kept mounted while folded: it owns the rule and resolves it. -->
        <div class="editor" ?hidden=${!this.editingSplit}>
          ${this.renderEditor(t)}
        </div>
      </div>
    `;
  }
  renderSummary(t) {
    const e = this.resolved(t);
    return e === null ? n`
        <div class="summary muted">
          ${t === null ? this.localize("split_needs_amount") : this.localize("rule_invalid")}
        </div>
      ` : n`
      <div class="summary">
        ${this.members.filter((i) => e[i.id]).map(
      (i) => n`
              <span class="who">
                ${i.name}
                <strong>
                  ${B(e[i.id], this.group.currency, this.language)}
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
   * Keyed on the category so picking one rebuilds it from that category's rule:
   * the default fills the screen in, and stays yours to overwrite.
   */
  renderEditor(t) {
    return xi(
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
    return this.expenseTitle.trim() === "" || t === null || t <= 0 || !this.paidBy || this.members.length === 0 ? !1 : this.resolved(t) !== null;
  }
};
y.styles = [
  N,
  C`
      /*
       * Two per row where they fit; one per row when the screen is narrow.
       *
       * minmax(0, …) rather than 1fr: a bare 1fr keeps an automatic minimum of
       * the content's own width, and a date input asks for more than half a
       * phone. The column would grow to grant it and take the dialog with it.
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

      .split-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .link {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-size: 13px;
        cursor: pointer;
        font-family: inherit;
        padding: 0;
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
  d()
], y.prototype, "expenseTitle", 2);
$([
  d()
], y.prototype, "description", 2);
$([
  d()
], y.prototype, "amountInput", 2);
$([
  d()
], y.prototype, "paidBy", 2);
$([
  d()
], y.prototype, "date", 2);
$([
  d()
], y.prototype, "categoryId", 2);
$([
  d()
], y.prototype, "rule", 2);
$([
  d()
], y.prototype, "busy", 2);
$([
  d()
], y.prototype, "error", 2);
$([
  d()
], y.prototype, "confirmingDelete", 2);
$([
  d()
], y.prototype, "editingSplit", 2);
$([
  d()
], y.prototype, "showDescription", 2);
y = $([
  _("se-expense-dialog")
], y);
var Ai = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, P = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ki(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Ai(e, i, r), r;
};
let S = class extends v {
  constructor() {
    super(...arguments), this.haUsers = [], this.members = [], this.memberships = [], this.newName = "", this.loading = !0, this.dirty = !1, this.pastMembers = [], this.addGuest = async () => {
      this.busy = "new", this.error = void 0;
      try {
        await this.api.createMember({
          name: this.newName.trim(),
          group_id: this.groupId
        }), this.newName = "", this.dirty = !0, await this.load();
      } catch (t) {
        this.error = w(t, this.localize);
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
                ${this.error ? n`<div class="error">${this.error}</div>` : c}
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
    const e = this.memberForUser(t.id), i = this.isOwner(e);
    return n`
      <div class="row">
        <input
          type="checkbox"
          .checked=${e !== void 0}
          ?disabled=${i || this.busy !== void 0}
          title=${i ? this.localize("owner_locked") : ""}
          @change=${() => this.toggleAccount(t, e)}
        />
        ${this.renderTintable(e, t.name, t.id)}
        <span class="name">${t.name}</span>
        ${i ? n`<span class="tag">${this.localize("group_owner")}</span>` : c}
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
  renderTintable(t, e, i) {
    const s = t?.color ?? M(i);
    return t ? n`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${s}`}
        @click=${() => this.toggleTint(t.id)}
      >
        ${H(e)}
      </button>
    ` : n`
        <div class="avatar" style=${`background:${s}`}>${H(e)}</div>
      `;
  }
  renderPalette(t) {
    return !t || this.tinting !== t.id ? c : n`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${t.color}
          .fallback=${M(t.id)}
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
    } catch (i) {
      this.error = w(i, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  renderGuests() {
    const t = this.localize, e = this.members.filter((s) => s.user_id === null), i = this.pastMembers.filter(
      (s) => s.user_id === null && !e.some((r) => r.id === s.id)
    );
    return n`
      <div class="section">
        <h3>${t("guests")}</h3>
        <div class="muted">${t("guests_hint")}</div>

        ${e.map(
      (s) => n`
            <div class="row">
              ${this.renderTintable(s, s.name, s.id)}
              <span class="name">${s.name}</span>
              ${this.confirming === s.id ? n`<span class="confirm">${t("confirm_remove")}</span>` : c}
              <button
                class=${`remove ${this.confirming === s.id ? "danger" : ""}`}
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

        ${i.map(
      (s) => n`
            <div class="row gone">
              <div
                class="avatar"
                style=${`background:${s.color ?? M(s.id)}`}
              >
                ${H(s.name)}
              </div>
              <span class="name">${s.name}</span>
              <se-button
                variant="text"
                ?disabled=${this.busy !== void 0}
                @click=${() => this.restoreGuest(s)}
              >
                ${t("restore_member")}
              </se-button>
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
      const [t, e, i, s] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listMemberships(this.groupId)
      ]);
      this.haUsers = t, this.members = e, this.pastMembers = i, this.memberships = s;
    } catch (t) {
      this.error = w(t, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  async toggleAccount(t, e) {
    if (e && this.confirming !== e.id) {
      this.confirming = e.id, this.requestUpdate();
      return;
    }
    this.busy = t.id, this.error = void 0, this.confirming = void 0;
    try {
      e ? await this.api.removeMemberFromGroup(this.groupId, e.id) : await this.api.createMember({
        name: t.name,
        group_id: this.groupId,
        user_id: t.id
      }), this.dirty = !0, await this.load();
    } catch (i) {
      this.error = w(i, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  async removeGuest(t) {
    if (this.confirming !== t.id) {
      this.confirming = t.id;
      return;
    }
    this.busy = t.id, this.error = void 0, this.confirming = void 0;
    try {
      await this.api.removeMemberFromGroup(this.groupId, t.id), this.dirty = !0, await this.load();
    } catch (e) {
      this.error = w(e, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  /** Bring a hidden guest back: they were never deleted, only set aside. */
  async restoreGuest(t) {
    this.busy = t.id, this.error = void 0;
    try {
      await this.api.addMemberToGroup(this.groupId, t.id), this.dirty = !0, await this.load();
    } catch (e) {
      this.error = w(e, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
};
S.styles = [
  N,
  C`
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
P([
  l({ attribute: !1 })
], S.prototype, "api", 2);
P([
  l({ attribute: !1 })
], S.prototype, "localize", 2);
P([
  l({ type: String })
], S.prototype, "groupId", 2);
P([
  d()
], S.prototype, "haUsers", 2);
P([
  d()
], S.prototype, "members", 2);
P([
  d()
], S.prototype, "memberships", 2);
P([
  d()
], S.prototype, "newName", 2);
P([
  d()
], S.prototype, "loading", 2);
P([
  d()
], S.prototype, "busy", 2);
P([
  d()
], S.prototype, "error", 2);
P([
  d()
], S.prototype, "dirty", 2);
P([
  d()
], S.prototype, "tinting", 2);
P([
  d()
], S.prototype, "confirming", 2);
P([
  d()
], S.prototype, "pastMembers", 2);
S = P([
  _("se-member-dialog")
], S);
var Ei = Object.defineProperty, Pi = Object.getOwnPropertyDescriptor, I = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Pi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Ei(e, i, r), r;
};
let z = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = pt(), this.busy = !1, this.confirmingDelete = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = te(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = this.payment ? await this.api.updatePayment(this.payment.id, {
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Me(this.date)
          }) : await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Me(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-saved", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = w(e, this.localize);
        } finally {
          this.busy = !1;
        }
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
        } catch (t) {
          this.error = w(t, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), this.payment) {
      this.fromMember = this.payment.from_member_id, this.toMember = this.payment.to_member_id, this.amountInput = ve(this.payment.amount), this.date = ht(this.payment.payment_date);
      return;
    }
    if (this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = ve(this.settlement.amount);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const t = this.localize, e = te(this.amountInput), i = this.members.map((r) => ({ value: r.id, label: r.name })), s = this.payment ? t("edit_payment") : t("new_payment");
    return n`
      <se-dialog open heading=${s} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : c}

          <se-select
            .label=${t("from_member")}
            .value=${this.fromMember}
            .options=${i}
            @value-changed=${(r) => this.fromMember = r.detail.value}
          ></se-select>

          <se-select
            .label=${t("to_member")}
            .value=${this.toMember}
            .options=${i}
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
                ${B(e, this.group.currency, this.language)}
              </div>` : c}
        </div>

        ${this.confirmingDelete ? n`<div slot="banner" class="warning">
              ${t("confirm_delete_payment")}
            </div>` : c}

        ${this.payment ? n`
              <se-button
                slot="actions"
                variant="danger"
                ?disabled=${this.busy}
                @click=${this.deletePayment}
              >
                ${this.confirmingDelete ? t("confirm_delete") : t("delete")}
              </se-button>
              <span slot="actions" class="spacer"></span>
            ` : c}
        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${t("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || !this.isValid(e)}
          @click=${this.submit}
        >
          ${this.payment ? t("save") : t("create")}
        </se-button>
      </se-dialog>
    `;
  }
  isValid(t) {
    return t !== null && t > 0 && this.fromMember !== "" && this.toMember !== "" && this.fromMember !== this.toMember;
  }
};
z.styles = N;
I([
  l({ attribute: !1 })
], z.prototype, "api", 2);
I([
  l({ attribute: !1 })
], z.prototype, "localize", 2);
I([
  l({ attribute: !1 })
], z.prototype, "group", 2);
I([
  l({ attribute: !1 })
], z.prototype, "members", 2);
I([
  l({ attribute: !1 })
], z.prototype, "payment", 2);
I([
  l({ attribute: !1 })
], z.prototype, "settlement", 2);
I([
  l({ type: String })
], z.prototype, "language", 2);
I([
  d()
], z.prototype, "fromMember", 2);
I([
  d()
], z.prototype, "toMember", 2);
I([
  d()
], z.prototype, "amountInput", 2);
I([
  d()
], z.prototype, "date", 2);
I([
  d()
], z.prototype, "busy", 2);
I([
  d()
], z.prototype, "error", 2);
I([
  d()
], z.prototype, "confirmingDelete", 2);
z = I([
  _("se-payment-dialog")
], z);
var Ii = Object.defineProperty, Oi = Object.getOwnPropertyDescriptor, b = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Oi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Ii(e, i, r), r;
};
const ot = 5, Oe = ["overview", "expenses", "settlements"], Di = 60, Mi = 24;
let m = class extends v {
  constructor() {
    super(...arguments), this.language = "en", this.userId = null, this.groups = [], this.members = [], this.pastMembers = [], this.categories = [], this.expenses = [], this.payments = [], this.tab = "overview", this.loading = !0, this.busy = !1, this.confirmingDelete = !1, this.deleteGroup = async () => {
      if (!this.confirmingDelete) {
        this.confirmingDelete = !0;
        return;
      }
      this.busy = !0;
      try {
        await this.api.deleteGroup(this.groupId), this.menu = void 0, this.goBack();
      } catch (t) {
        this.error = w(t, this.localize), this.confirmingDelete = !1;
      } finally {
        this.busy = !1;
      }
    }, this.startSwipe = (t) => {
      const e = t.touches[0];
      if (t.touches.length !== 1 || e.clientX < Mi) {
        this.swipeFrom = void 0;
        return;
      }
      this.swipeFrom = { x: e.clientX, y: e.clientY };
    }, this.endSwipe = (t) => {
      const e = this.swipeFrom;
      if (this.swipeFrom = void 0, !e)
        return;
      const i = t.changedTouches[0], s = i.clientX - e.x, r = i.clientY - e.y;
      if (Math.abs(s) < Di || Math.abs(s) < Math.abs(r) * 2)
        return;
      const o = Oe.indexOf(this.tab) + (s < 0 ? 1 : -1);
      o >= 0 && o < Oe.length && (this.tab = Oe[o]);
    }, this.cancelSwipe = () => {
      this.swipeFrom = void 0;
    }, this.add = () => {
      if (this.tab === "settlements") {
        this.openPayment();
        return;
      }
      this.openExpense();
    }, this.closeDialog = () => {
      this.dialog = void 0, this.prefill = void 0, this.editedExpense = void 0, this.editedPayment = void 0;
    }, this.handleChanged = () => {
      this.closeDialog(), this.load();
    }, this.toggleArchive = async () => {
      if (this.group) {
        this.busy = !0, this.error = void 0;
        try {
          this.group = await this.api.archiveGroup(this.group.id, !this.group.archived), this.menu = void 0;
        } catch (t) {
          this.error = w(t, this.localize);
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
      ${this.renderHeader()}

      <div class="page">
        <div class="stack">
          ${this.group.archived ? n`<div class="banner">${t("archived_hint")}</div>` : c}

          ${this.error ? n`<div class="error">${this.error}</div>` : c}

          <div class="tabs" role="tablist">
            ${this.renderTab("overview", t("tab_overview"))}
            ${this.renderTab("expenses", t("tab_expenses"))}
            ${this.renderTab("settlements", t("tab_settlements"))}
          </div>

          <div
            class="swipe"
            @touchstart=${this.startSwipe}
            @touchend=${this.endSwipe}
            @touchcancel=${this.cancelSwipe}
          >
            ${this.renderTabContent()}
          </div>
        </div>
      </div>

      <button
        class="fab"
        aria-label=${this.addLabel()}
        title=${this.addLabel()}
        @click=${this.add}
      >
        <se-icon plain .icon=${"mdi:plus"} fallback="+" .size=${26}></se-icon>
      </button>

      ${this.renderDialog()}
    `;
  }
  renderHeader() {
    const t = this.localize, e = this.group;
    return n`
      <div class="toolbar">
        <div class="header">
          <se-menu-button></se-menu-button>

        <div class="titles">
          <h1>${t("app_title")}</h1>
          <button class="switcher" @click=${() => this.openMenu("groups")}>
            <span class="current">${e.name}</span>
            <span class="caret">⌄</span>
            ${e.archived ? n`<span class="archived-tag">${t("archived")}</span>` : c}
          </button>
        </div>

        <button
          class="icon"
          aria-label=${t("more")}
          @click=${() => this.openMenu("more")}
        >
          <se-icon plain .icon=${"mdi:dots-vertical"} fallback="⋮" .size=${22}></se-icon>
        </button>

        </div>
      </div>
      ${this.menu ? this.renderMenu() : c}
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
            ${t.archived ? n`<span class="archived-tag">${this.localize("archived")}</span>` : c}
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
      <button role="menuitem" @click=${() => this.openDialog("member")}>
        ${t("members")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("categories")}>
        ${t("categories")}
      </button>
      <button
        role="menuitem"
        class="separated"
        ?disabled=${this.busy}
        @click=${this.toggleArchive}
      >
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
  openDialog(t) {
    this.menu = void 0, this.dialog = t;
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
    return this.tab === "overview" ? this.renderOverview() : this.tab === "expenses" ? this.renderExpenses() : this.renderSettlements();
  }
  renderOverview() {
    const t = this.localize;
    return n`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.result?.balances ?? []}
        .settlements=${this.result?.settlements ?? []}
        .members=${this.pastMembers}
        .meId=${this.meId()}
        .currency=${this.group.currency}
        .language=${this.language}
      ></se-balance-card>

      <div class="card">
        <div class="section-head">
          <h3>${t("recent_activity")}</h3>
          ${this.activity().length > ot ? n`<button class="link" @click=${() => this.tab = "expenses"}>
                ${t("see_all")}
              </button>` : c}
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
      (e, i) => i.at.localeCompare(e.at) || i.addedAt.localeCompare(e.addedAt)
    );
  }
  renderActivity() {
    const t = this.activity();
    return t.length === 0 ? n`<div class="empty">${this.localize("no_activity")}</div>` : t.slice(0, ot).map(
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
    `;
  }
  renderPayment(t) {
    const e = this.memberById(t.from_member_id), i = this.memberById(t.to_member_id);
    return n`
      <button class="item item-button" @click=${() => this.openPayment(void 0, t)}>
        <se-icon
          icon="mdi:swap-horizontal"
          fallback="⇄"
          .color=${e?.color ?? M(t.from_member_id)}
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">${e?.name ?? "?"} → ${i?.name ?? "?"}</div>
          <!-- Where an expense shows its category: same grid, same reading. -->
          <div class="muted">${this.localize("a_settlement")}</div>
          <div class="muted">
            ${it(t.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount settled-amount">
            ${B(t.amount, this.group.currency, this.language)}
          </span>
        </div>
      </button>
    `;
  }
  renderSettlement(t) {
    const e = this.localize, i = this.memberById(t.from_member_id), s = this.memberById(t.to_member_id);
    return n`
      <div class="settlement">
        <span>
          <strong>${i?.name ?? "?"}</strong> ${e("owes")}
          <strong class="amount">
            ${B(t.amount, this.group.currency, this.language)}
          </strong>
          ${e("to")} <strong>${s?.name ?? "?"}</strong>
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
    `;
  }
  renderExpense(t) {
    const e = this.localize, i = this.memberById(t.paid_by_member_id), s = this.categories.find((r) => r.id === t.category_id);
    return n`
      <button class="item item-button" @click=${() => this.openExpense(t)}>
        ${this.renderAvatar(
      i?.name ?? "?",
      t.paid_by_member_id,
      `${this.localize("paid_by")} ${i?.name ?? "?"}`
    )}
        <div class="info">
          <div class="title">
            ${t.title}
            ${t.description ? n`<span class="note">${t.description}</span>` : c}
          </div>
          <div class="muted">
            ${s ? s.name : e("no_category")}
          </div>
          <div class="muted">
            ${it(t.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${B(t.amount, t.currency, this.language)}
          </span>
          ${this.renderParticipants(t)}
        </div>
      </button>
    `;
  }
  /** The members actually sharing the expense, stacked like on a receipt. */
  renderParticipants(t) {
    const e = (t.shares ?? []).filter((i) => i.amount !== 0);
    return e.length === 0 ? c : n`
      <div class="stack-avatars">
        ${e.map((i) => {
      const s = this.memberById(i.member_id);
      return n`
            <div
              class="avatar small"
              title=${s?.name ?? "?"}
              style=${`background:${s?.color ?? M(i.member_id)}`}
            >
              ${H(s?.name ?? "?")}
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
  renderAvatar(t, e, i) {
    const s = this.memberById(e);
    return n`
      <div
        class="avatar"
        title=${i ?? t}
        style=${`background:${s?.color ?? M(e)}`}
      >
        ${H(t)}
      </div>
    `;
  }
  renderDialog() {
    return !this.dialog || !this.group ? c : this.dialog === "expense" ? n`
        <se-expense-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.membersFor(this.editedExpense)}
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
          .members=${this.membersForPayment(this.editedPayment)}
          .payment=${this.editedPayment}
          .settlement=${this.prefill}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @payment-saved=${this.handleChanged}
          @payment-deleted=${this.handleChanged}
        ></se-payment-dialog>
      ` : this.dialog === "categories" ? n`
        <se-categories-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @categories-changed=${this.handleChanged}
        ></se-categories-dialog>
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
  /**
   * Which member of this group you are, if any.
   *
   * Nobody, when the panel is open on an account no member is tied to — a
   * shared tablet in the kitchen, an admin looking at someone else's group.
   */
  meId() {
    return this.userId ? this.members.find((t) => t.user_id === this.userId)?.id ?? null : null;
  }
  /**
   * Who the expense dialog may offer.
   *
   * The active members, plus anyone this very expense already involves. Someone
   * removed from the group must not be pickable for something new, but an
   * expense they paid still has to show them as its payer: dropping them would
   * silently reassign it on the next save.
   */
  membersFor(t) {
    return t ? this.plusGone([
      t.paid_by_member_id,
      ...(t.shares ?? []).map((e) => e.member_id)
    ]) : this.members;
  }
  /** The same, for a payment: someone may have left since settling up. */
  membersForPayment(t) {
    return t ? this.plusGone([t.from_member_id, t.to_member_id]) : this.members;
  }
  plusGone(t) {
    const e = new Set(t), i = this.pastMembers.filter(
      (s) => e.has(s.id) && !this.members.some((r) => r.id === s.id)
    );
    return [...this.members, ...i];
  }
  async load() {
    this.error = void 0;
    try {
      const [
        t,
        e,
        i,
        s,
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
      this.group = t, this.groups = e, this.members = i, this.pastMembers = s, this.categories = r, this.expenses = o, this.payments = a, this.result = u;
    } catch (t) {
      this.error = w(t, this.localize), t?.code === "group_not_found" && this.dispatchEvent(
        new CustomEvent("group-unavailable", { bubbles: !0, composed: !0 })
      );
    } finally {
      this.loading = !1;
    }
  }
  addLabel() {
    return this.tab === "settlements" ? this.localize("new_payment") : this.localize("action_add_expense");
  }
  /** A suggested settlement to record, or a recorded payment to correct. */
  openPayment(t, e) {
    this.prefill = t, this.editedPayment = e, this.dialog = "payment";
  }
  openExpense(t) {
    this.editedExpense = t, this.dialog = "expense";
  }
};
m.styles = [
  N,
  C`
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

      .tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      /*
       * Carries the gesture, and the layout the tab content had when it was a
       * child of the stack itself: a wrapper must not cost the spacing.
       */
      .swipe {
        display: flex;
        flex-direction: column;
        gap: var(--se-gap);
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
        transition: transform 0.12s ease;
      }

      .fab:hover {
        transform: scale(1.06);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 4;
      }

      .menu {
        position: absolute;
        z-index: 5;
        top: 64px;
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
b([
  l({ attribute: !1 })
], m.prototype, "api", 2);
b([
  l({ attribute: !1 })
], m.prototype, "localize", 2);
b([
  l({ type: String })
], m.prototype, "groupId", 2);
b([
  l({ type: String })
], m.prototype, "language", 2);
b([
  l({ type: String })
], m.prototype, "userId", 2);
b([
  d()
], m.prototype, "group", 2);
b([
  d()
], m.prototype, "groups", 2);
b([
  d()
], m.prototype, "menu", 2);
b([
  d()
], m.prototype, "members", 2);
b([
  d()
], m.prototype, "pastMembers", 2);
b([
  d()
], m.prototype, "categories", 2);
b([
  d()
], m.prototype, "expenses", 2);
b([
  d()
], m.prototype, "payments", 2);
b([
  d()
], m.prototype, "result", 2);
b([
  d()
], m.prototype, "tab", 2);
b([
  d()
], m.prototype, "loading", 2);
b([
  d()
], m.prototype, "error", 2);
b([
  d()
], m.prototype, "dialog", 2);
b([
  d()
], m.prototype, "prefill", 2);
b([
  d()
], m.prototype, "editedExpense", 2);
b([
  d()
], m.prototype, "editedPayment", 2);
b([
  d()
], m.prototype, "busy", 2);
b([
  d()
], m.prototype, "confirmingDelete", 2);
m = b([
  _("se-group-page")
], m);
class Ti {
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
  updateGroup(e, i) {
    return this.call("update_group", { group_id: e, ...i });
  }
  archiveGroup(e, i) {
    return this.call("archive_group", { group_id: e, archived: i });
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
  listMembers(e, i = !1) {
    return this.call("list_members", {
      group_id: e,
      include_left: i
    });
  }
  listMemberships(e) {
    return this.call("list_memberships", { group_id: e });
  }
  createMember(e) {
    return this.call("create_member", e);
  }
  updateMember(e, i) {
    return this.call("update_member", { member_id: e, ...i });
  }
  /** Put an existing member back into a group they had left. */
  addMemberToGroup(e, i, s) {
    return this.call("add_member_to_group", {
      group_id: e,
      member_id: i,
      ...s ? { role: s } : {}
    });
  }
  removeMemberFromGroup(e, i) {
    return this.call("remove_member_from_group", {
      group_id: e,
      member_id: i
    });
  }
  // Categories
  listCategories(e) {
    return this.call("list_categories", { group_id: e });
  }
  createCategory(e) {
    return this.call("create_category", e);
  }
  updateCategory(e, i) {
    return this.call("update_category", { category_id: e, ...i });
  }
  deleteCategory(e) {
    return this.call("delete_category", { category_id: e });
  }
  // Expenses
  listExpenses(e, i = !0) {
    return this.call("list_expenses", { group_id: e, with_shares: i });
  }
  getExpense(e) {
    return this.call("get_expense", { expense_id: e });
  }
  createExpense(e) {
    return this.call("create_expense", e);
  }
  updateExpense(e, i) {
    return this.call("update_expense", { expense_id: e, ...i });
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
  updatePayment(e, i) {
    return this.call("update_payment", { payment_id: e, ...i });
  }
  deletePayment(e) {
    return this.call("delete_payment", { payment_id: e });
  }
  call(e, i = {}) {
    return this.hass.callWS({
      type: `shared_expenses/${e}`,
      ...i
    });
  }
}
var ji = Object.defineProperty, Ui = Object.getOwnPropertyDescriptor, _e = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ui(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && ji(e, i, r), r;
};
let re = class extends v {
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
      const i = Ni();
      if (i) {
        this.groupId = i, this.pushPath(`/group/${i}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (t) => {
      const e = t.detail.groupId;
      this.groupId = e, Ri(e), this.pushPath(`/group/${e}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.pushPath("");
    }, this.handleGroupUnavailable = () => {
      Bi(), this.goToDashboard();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new Ti(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = Zt(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
    return this.groupId ? n`
        <se-group-page
          .api=${this.api}
          .localize=${t}
          .groupId=${this.groupId}
          .language=${e}
          .userId=${this.hass.user?.id ?? null}
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
re.styles = C`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
_e([
  l({ attribute: !1 })
], re.prototype, "hass", 2);
_e([
  l({ type: Boolean })
], re.prototype, "narrow", 2);
_e([
  l({ attribute: !1 })
], re.prototype, "route", 2);
_e([
  d()
], re.prototype, "groupId", 2);
re = _e([
  _("shared-expenses-panel")
], re);
const qe = "shared_expenses.last_group";
function Ni() {
  try {
    return window.localStorage.getItem(qe);
  } catch {
    return null;
  }
}
function Ri(t) {
  try {
    window.localStorage.setItem(qe, t);
  } catch {
  }
}
function Bi() {
  try {
    window.localStorage.removeItem(qe);
  } catch {
  }
}
export {
  re as SharedExpensesPanel
};
