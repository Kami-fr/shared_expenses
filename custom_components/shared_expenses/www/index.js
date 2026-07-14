/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Me = globalThis, Ke = Me.ShadowRoot && (Me.ShadyCSS === void 0 || Me.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Xe = Symbol(), it = /* @__PURE__ */ new WeakMap();
let ft = class {
  constructor(e, r, i) {
    if (this._$cssResult$ = !0, i !== Xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = r;
  }
  get styleSheet() {
    let e = this.o;
    const r = this.t;
    if (Ke && e === void 0) {
      const i = r !== void 0 && r.length === 1;
      i && (e = it.get(r)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && it.set(r, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const kt = (t) => new ft(typeof t == "string" ? t : t + "", void 0, Xe), _ = (t, ...e) => {
  const r = t.length === 1 ? t[0] : e.reduce((i, s, o) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + t[o + 1], t[0]);
  return new ft(r, t, Xe);
}, At = (t, e) => {
  if (Ke) t.adoptedStyleSheets = e.map((r) => r instanceof CSSStyleSheet ? r : r.styleSheet);
  else for (const r of e) {
    const i = document.createElement("style"), s = Me.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = r.cssText, t.appendChild(i);
  }
}, st = Ke ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let r = "";
  for (const i of e.cssRules) r += i.cssText;
  return kt(r);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Et, defineProperty: It, getOwnPropertyDescriptor: Ot, getOwnPropertyNames: Dt, getOwnPropertySymbols: Mt, getPrototypeOf: Tt } = Object, Be = globalThis, ot = Be.trustedTypes, jt = ot ? ot.emptyScript : "", Ut = Be.reactiveElementPolyfillSupport, we = (t, e) => t, Te = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? jt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let r = t;
  switch (e) {
    case Boolean:
      r = t !== null;
      break;
    case Number:
      r = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        r = JSON.parse(t);
      } catch {
        r = null;
      }
  }
  return r;
} }, Ze = (t, e) => !Et(t, e), at = { attribute: !0, type: String, converter: Te, reflect: !1, useDefault: !1, hasChanged: Ze };
Symbol.metadata ??= Symbol("metadata"), Be.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let be = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, r = at) {
    if (r.state && (r.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((r = Object.create(r)).wrapped = !0), this.elementProperties.set(e, r), !r.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(e, i, r);
      s !== void 0 && It(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, r, i) {
    const { get: s, set: o } = Ot(this.prototype, e) ?? { get() {
      return this[r];
    }, set(a) {
      this[r] = a;
    } };
    return { get: s, set(a) {
      const u = s?.call(this);
      o?.call(this, a), this.requestUpdate(e, u, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? at;
  }
  static _$Ei() {
    if (this.hasOwnProperty(we("elementProperties"))) return;
    const e = Tt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(we("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(we("properties"))) {
      const r = this.properties, i = [...Dt(r), ...Mt(r)];
      for (const s of i) this.createProperty(s, r[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const r = litPropertyMetadata.get(e);
      if (r !== void 0) for (const [i, s] of r) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [r, i] of this.elementProperties) {
      const s = this._$Eu(r, i);
      s !== void 0 && this._$Eh.set(s, r);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const r = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const s of i) r.unshift(st(s));
    } else e !== void 0 && r.push(st(e));
    return r;
  }
  static _$Eu(e, r) {
    const i = r.attribute;
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
    const e = /* @__PURE__ */ new Map(), r = this.constructor.elementProperties;
    for (const i of r.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return At(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, r, i) {
    this._$AK(e, i);
  }
  _$ET(e, r) {
    const i = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : Te).toAttribute(r, i.type);
      this._$Em = e, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$Em = null;
    }
  }
  _$AK(e, r) {
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const o = i.getPropertyOptions(s), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : Te;
      this._$Em = s;
      const u = a.fromAttribute(r, o.type);
      this[s] = u ?? this._$Ej?.get(s) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, r, i, s = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (s === !1 && (o = this[e]), i ??= a.getPropertyOptions(e), !((i.hasChanged ?? Ze)(o, r) || i.useDefault && i.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, i)))) return;
      this.C(e, r, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, r, { useDefault: i, reflect: s, wrapped: o }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? r ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (r = void 0), this._$AL.set(e, r)), s === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (r) {
      Promise.reject(r);
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
        for (const [s, o] of this._$Ep) this[s] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, o] of i) {
        const { wrapped: a } = o, u = this[s];
        a !== !0 || this._$AL.has(s) || u === void 0 || this.C(s, void 0, o, u);
      }
    }
    let e = !1;
    const r = this._$AL;
    try {
      e = this.shouldUpdate(r), e ? (this.willUpdate(r), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(r)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(r);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((r) => r.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
    this._$Eq &&= this._$Eq.forEach((r) => this._$ET(r, this[r])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
be.elementStyles = [], be.shadowRootOptions = { mode: "open" }, be[we("elementProperties")] = /* @__PURE__ */ new Map(), be[we("finalized")] = /* @__PURE__ */ new Map(), Ut?.({ ReactiveElement: be }), (Be.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Je = globalThis, nt = (t) => t, je = Je.trustedTypes, lt = je ? je.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, yt = "$lit$", ie = `lit$${Math.random().toFixed(9).slice(2)}$`, vt = "?" + ie, Rt = `<${vt}>`, he = document, ze = () => he.createComment(""), Se = (t) => t === null || typeof t != "object" && typeof t != "function", Qe = Array.isArray, Nt = (t) => Qe(t) || typeof t?.[Symbol.iterator] == "function", qe = `[ 	
\f\r]`, xe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, dt = /-->/g, ct = />/g, de = RegExp(`>|${qe}(?:([^\\s"'>=/]+)(${qe}*=${qe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), pt = /'/g, ht = /"/g, $t = /^(?:script|style|textarea|title)$/i, Bt = (t) => (e, ...r) => ({ _$litType$: t, strings: e, values: r }), n = Bt(1), fe = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), ut = /* @__PURE__ */ new WeakMap(), ce = he.createTreeWalker(he, 129);
function _t(t, e) {
  if (!Qe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return lt !== void 0 ? lt.createHTML(e) : e;
}
const Ht = (t, e) => {
  const r = t.length - 1, i = [];
  let s, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = xe;
  for (let u = 0; u < r; u++) {
    const p = t[u];
    let b, v, h = -1, A = 0;
    for (; A < p.length && (a.lastIndex = A, v = a.exec(p), v !== null); ) A = a.lastIndex, a === xe ? v[1] === "!--" ? a = dt : v[1] !== void 0 ? a = ct : v[2] !== void 0 ? ($t.test(v[2]) && (s = RegExp("</" + v[2], "g")), a = de) : v[3] !== void 0 && (a = de) : a === de ? v[0] === ">" ? (a = s ?? xe, h = -1) : v[1] === void 0 ? h = -2 : (h = a.lastIndex - v[2].length, b = v[1], a = v[3] === void 0 ? de : v[3] === '"' ? ht : pt) : a === ht || a === pt ? a = de : a === dt || a === ct ? a = xe : (a = de, s = void 0);
    const S = a === de && t[u + 1].startsWith("/>") ? " " : "";
    o += a === xe ? p + Rt : h >= 0 ? (i.push(b), p.slice(0, h) + yt + p.slice(h) + ie + S) : p + ie + (h === -2 ? u : S);
  }
  return [_t(t, o + (t[r] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Ce {
  constructor({ strings: e, _$litType$: r }, i) {
    let s;
    this.parts = [];
    let o = 0, a = 0;
    const u = e.length - 1, p = this.parts, [b, v] = Ht(e, r);
    if (this.el = Ce.createElement(b, i), ce.currentNode = this.el.content, r === 2 || r === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (s = ce.nextNode()) !== null && p.length < u; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const h of s.getAttributeNames()) if (h.endsWith(yt)) {
          const A = v[a++], S = s.getAttribute(h).split(ie), H = /([.?@])?(.*)/.exec(A);
          p.push({ type: 1, index: o, name: H[2], strings: S, ctor: H[1] === "." ? qt : H[1] === "?" ? Lt : H[1] === "@" ? Ft : He }), s.removeAttribute(h);
        } else h.startsWith(ie) && (p.push({ type: 6, index: o }), s.removeAttribute(h));
        if ($t.test(s.tagName)) {
          const h = s.textContent.split(ie), A = h.length - 1;
          if (A > 0) {
            s.textContent = je ? je.emptyScript : "";
            for (let S = 0; S < A; S++) s.append(h[S], ze()), ce.nextNode(), p.push({ type: 2, index: ++o });
            s.append(h[A], ze());
          }
        }
      } else if (s.nodeType === 8) if (s.data === vt) p.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = s.data.indexOf(ie, h + 1)) !== -1; ) p.push({ type: 7, index: o }), h += ie.length - 1;
      }
      o++;
    }
  }
  static createElement(e, r) {
    const i = he.createElement("template");
    return i.innerHTML = e, i;
  }
}
function ye(t, e, r = t, i) {
  if (e === fe) return e;
  let s = i !== void 0 ? r._$Co?.[i] : r._$Cl;
  const o = Se(e) ? void 0 : e._$litDirective$;
  return s?.constructor !== o && (s?._$AO?.(!1), o === void 0 ? s = void 0 : (s = new o(t), s._$AT(t, r, i)), i !== void 0 ? (r._$Co ??= [])[i] = s : r._$Cl = s), s !== void 0 && (e = ye(t, s._$AS(t, e.values), s, i)), e;
}
class Gt {
  constructor(e, r) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = r;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: r }, parts: i } = this._$AD, s = (e?.creationScope ?? he).importNode(r, !0);
    ce.currentNode = s;
    let o = ce.nextNode(), a = 0, u = 0, p = i[0];
    for (; p !== void 0; ) {
      if (a === p.index) {
        let b;
        p.type === 2 ? b = new Ae(o, o.nextSibling, this, e) : p.type === 1 ? b = new p.ctor(o, p.name, p.strings, this, e) : p.type === 6 && (b = new Vt(o, this, e)), this._$AV.push(b), p = i[++u];
      }
      a !== p?.index && (o = ce.nextNode(), a++);
    }
    return ce.currentNode = he, s;
  }
  p(e) {
    let r = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, r), r += i.strings.length - 2) : i._$AI(e[r])), r++;
  }
}
class Ae {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, r, i, s) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = e, this._$AB = r, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const r = this._$AM;
    return r !== void 0 && e?.nodeType === 11 && (e = r.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, r = this) {
    e = ye(this, e, r), Se(e) ? e === c || e == null || e === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : e !== this._$AH && e !== fe && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Nt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== c && Se(this._$AH) ? this._$AA.nextSibling.data = e : this.T(he.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: r, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Ce.createElement(_t(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(r);
    else {
      const o = new Gt(s, this), a = o.u(this.options);
      o.p(r), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let r = ut.get(e.strings);
    return r === void 0 && ut.set(e.strings, r = new Ce(e)), r;
  }
  k(e) {
    Qe(this._$AH) || (this._$AH = [], this._$AR());
    const r = this._$AH;
    let i, s = 0;
    for (const o of e) s === r.length ? r.push(i = new Ae(this.O(ze()), this.O(ze()), this, this.options)) : i = r[s], i._$AI(o), s++;
    s < r.length && (this._$AR(i && i._$AB.nextSibling, s), r.length = s);
  }
  _$AR(e = this._$AA.nextSibling, r) {
    for (this._$AP?.(!1, !0, r); e !== this._$AB; ) {
      const i = nt(e).nextSibling;
      nt(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class He {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, r, i, s, o) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = e, this.name = r, this._$AM = s, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = c;
  }
  _$AI(e, r = this, i, s) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = ye(this, e, r, 0), a = !Se(e) || e !== this._$AH && e !== fe, a && (this._$AH = e);
    else {
      const u = e;
      let p, b;
      for (e = o[0], p = 0; p < o.length - 1; p++) b = ye(this, u[i + p], r, p), b === fe && (b = this._$AH[p]), a ||= !Se(b) || b !== this._$AH[p], b === c ? e = c : e !== c && (e += (b ?? "") + o[p + 1]), this._$AH[p] = b;
    }
    a && !s && this.j(e);
  }
  j(e) {
    e === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class qt extends He {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === c ? void 0 : e;
  }
}
class Lt extends He {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== c);
  }
}
class Ft extends He {
  constructor(e, r, i, s, o) {
    super(e, r, i, s, o), this.type = 5;
  }
  _$AI(e, r = this) {
    if ((e = ye(this, e, r, 0) ?? c) === fe) return;
    const i = this._$AH, s = e === c && i !== c || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== c && (i === c || s);
    s && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Vt {
  constructor(e, r, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = r, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ye(this, e);
  }
}
const Wt = Je.litHtmlPolyfillSupport;
Wt?.(Ce, Ae), (Je.litHtmlVersions ??= []).push("3.3.3");
const Yt = (t, e, r) => {
  const i = r?.renderBefore ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const o = r?.renderBefore ?? null;
    i._$litPart$ = s = new Ae(e.insertBefore(ze(), o), o, void 0, r ?? {});
  }
  return s._$AI(t), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = globalThis;
let m = class extends be {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const r = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Yt(r, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return fe;
  }
};
m._$litElement$ = !0, m.finalized = !0, et.litElementHydrateSupport?.({ LitElement: m });
const Kt = et.litElementPolyfillSupport;
Kt?.({ LitElement: m });
(et.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const f = (t) => (e, r) => {
  r !== void 0 ? r.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xt = { attribute: !0, type: String, converter: Te, reflect: !1, hasChanged: Ze }, Zt = (t = Xt, e, r) => {
  const { kind: i, metadata: s } = r;
  let o = globalThis.litPropertyMetadata.get(s);
  if (o === void 0 && globalThis.litPropertyMetadata.set(s, o = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(r.name, t), i === "accessor") {
    const { name: a } = r;
    return { set(u) {
      const p = e.get.call(this);
      e.set.call(this, u), this.requestUpdate(a, p, t, !0, u);
    }, init(u) {
      return u !== void 0 && this.C(a, void 0, t, u), u;
    } };
  }
  if (i === "setter") {
    const { name: a } = r;
    return function(u) {
      const p = this[a];
      e.call(this, u), this.requestUpdate(a, p, t, !0, u);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function l(t) {
  return (e, r) => typeof r == "object" ? Zt(t, e, r) : ((i, s, o) => {
    const a = s.hasOwnProperty(o);
    return s.constructor.createProperty(o, i), a ? Object.getOwnPropertyDescriptor(s, o) : void 0;
  })(t, e, r);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(t) {
  return l({ ...t, state: !0, attribute: !1 });
}
var Jt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, Ge = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Qt(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Jt(e, r, s), s;
};
let ve = class extends m {
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
ve.styles = _`
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
Ge([
  l({ type: String })
], ve.prototype, "variant", 2);
Ge([
  l({ type: Boolean })
], ve.prototype, "disabled", 2);
Ge([
  l({ type: String })
], ve.prototype, "icon", 2);
ve = Ge([
  f("se-button")
], ve);
var er = Object.defineProperty, tr = Object.getOwnPropertyDescriptor, $e = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? tr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && er(e, r, s), s;
};
let se = class extends m {
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
se.styles = _`
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
$e([
  l({ type: String })
], se.prototype, "icon", 2);
$e([
  l({ type: String })
], se.prototype, "fallback", 2);
$e([
  l({ type: String })
], se.prototype, "color", 2);
$e([
  l({ type: Number })
], se.prototype, "size", 2);
$e([
  l({ type: Boolean })
], se.prototype, "plain", 2);
se = $e([
  f("se-icon")
], se);
var rr = Object.getOwnPropertyDescriptor, ir = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? rr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = a(s) || s);
  return s;
};
let Fe = class extends m {
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
Fe.styles = _`
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
Fe = ir([
  f("se-menu-button")
], Fe);
var sr = Object.defineProperty, or = Object.getOwnPropertyDescriptor, tt = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? or(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && sr(e, r, s), s;
};
let Pe = class extends m {
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
Pe.styles = _`
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
tt([
  l({ type: String })
], Pe.prototype, "heading", 2);
tt([
  l({ type: Boolean, reflect: !0 })
], Pe.prototype, "open", 2);
Pe = tt([
  f("se-dialog")
], Pe);
var ar = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, J = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? nr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && ar(e, r, s), s;
};
let q = class extends m {
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
q.styles = _`
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
J([
  l({ type: String })
], q.prototype, "label", 2);
J([
  l({ type: String })
], q.prototype, "value", 2);
J([
  l({ type: String })
], q.prototype, "type", 2);
J([
  l({ type: String })
], q.prototype, "placeholder", 2);
J([
  l({ type: String })
], q.prototype, "suffix", 2);
J([
  l({ type: String })
], q.prototype, "helper", 2);
J([
  l({ type: Boolean })
], q.prototype, "required", 2);
J([
  l({ type: Boolean })
], q.prototype, "disabled", 2);
J([
  l({ type: Boolean })
], q.prototype, "decimal", 2);
q = J([
  f("se-field")
], q);
const Ue = {
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
  new_payment: "Record a reimbursement",
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
}, lr = {
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
  new_payment: "Enregistrer un remboursement",
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
}, dr = { en: Ue, fr: lr };
function cr(t) {
  const e = dr[t.split("-")[0]] ?? Ue;
  return (r) => e[r] ?? Ue[r] ?? r;
}
function w(t, e) {
  const r = t?.code;
  return r && r in Ue ? e(r) : t?.message || e("error_generic");
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
var pr = Object.defineProperty, hr = Object.getOwnPropertyDescriptor, ae = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? hr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && pr(e, r, s), s;
};
let K = class extends m {
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
K.styles = z;
ae([
  l({ attribute: !1 })
], K.prototype, "api", 2);
ae([
  l({ attribute: !1 })
], K.prototype, "localize", 2);
ae([
  d()
], K.prototype, "name", 2);
ae([
  d()
], K.prototype, "description", 2);
ae([
  d()
], K.prototype, "currency", 2);
ae([
  d()
], K.prototype, "busy", 2);
ae([
  d()
], K.prototype, "error", 2);
K = ae([
  f("se-group-dialog")
], K);
var ur = Object.defineProperty, mr = Object.getOwnPropertyDescriptor, ge = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? mr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && ur(e, r, s), s;
};
let ee = class extends m {
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
ee.styles = [
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
ge([
  l({ attribute: !1 })
], ee.prototype, "api", 2);
ge([
  l({ attribute: !1 })
], ee.prototype, "localize", 2);
ge([
  d()
], ee.prototype, "groups", 2);
ge([
  d()
], ee.prototype, "loading", 2);
ge([
  d()
], ee.prototype, "error", 2);
ge([
  d()
], ee.prototype, "dialogOpen", 2);
ee = ge([
  f("se-dashboard-page")
], ee);
function R(t, e, r) {
  return new Intl.NumberFormat(r, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function pe(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const r = Number(e);
  return Number.isNaN(r) ? null : Math.round(r * 100);
}
function Re(t, e) {
  const r = new Intl.DateTimeFormat(e, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
  return r.charAt(0).toUpperCase() + r.slice(1);
}
function gr(t, e) {
  const [r, i] = t.split("-").map(Number), s = new Intl.DateTimeFormat(e, {
    month: "short",
    year: "numeric"
  }).format(new Date(r, i - 1, 1));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function xt() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), r = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${r}`;
}
function Ve(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function wt(t) {
  const e = new Date(t), r = `${e.getMonth() + 1}`.padStart(2, "0"), i = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${r}-${i}`;
}
function ke(t) {
  return (t / 100).toFixed(2);
}
function G(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
const We = [
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
function C(t) {
  let e = 0;
  for (let r = 0; r < t.length; r += 1)
    e = e * 31 + t.charCodeAt(r) >>> 0;
  return We[e % We.length];
}
var br = Object.defineProperty, fr = Object.getOwnPropertyDescriptor, ne = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? fr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && br(e, r, s), s;
};
let X = class extends m {
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
    const t = this.balances.filter((i) => i.amount !== 0);
    if (t.length === 0)
      return n`<div class="settled muted">${this.localize("balance_settled")}</div>`;
    if (this.settlements.length === 0)
      return n`<div>${t.map((i) => this.renderRow(i))}</div>`;
    if (t.length === 2)
      return this.renderDuel(t);
    if (this.meId === null)
      return this.renderGroupView();
    const e = this.settlements.filter(
      (i) => i.from_member_id === this.meId || i.to_member_id === this.meId
    ), r = this.settlements.filter((i) => !e.includes(i));
    return n`
      ${e.length === 0 ? n`<div class="settled muted">${this.localize("you_are_settled")}</div>` : e.map((i) => this.renderMine(i))}
      ${r.length === 0 ? c : n`
            <div class="others">
              ${r.map((i) => this.renderTransfer(i))}
            </div>
          `}
    `;
  }
  /** No "you" to speak from: show the transfers as the group's own business. */
  renderGroupView() {
    return n`
      <div>${this.settlements.map((t) => this.renderTransfer(t))}</div>
    `;
  }
  /**
   * Ask to record the reimbursement a line stands for.
   *
   * The dialog opens filled in with it, which is the whole trick: the figure
   * you are looking at is the one you are about to pay, so nothing needs
   * retyping — and nothing can be mistyped either.
   */
  settle(t) {
    this.dispatchEvent(
      new CustomEvent("settle-up", {
        detail: { settlement: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /** Your own line, as a sentence: the one thing you came to find out. */
  renderMine(t) {
    const e = this.localize, r = t.from_member_id === this.meId, i = r ? t.to_member_id : t.from_member_id, s = this.memberById(i), o = s?.name ?? "?", a = n`
      <strong class=${`figure ${r ? "negative" : "positive"}`}>
        ${R(t.amount, this.currency, this.language)}
      </strong>
    `;
    return n`
      <button
        class="mine line-button"
        title=${e("settle_up")}
        @click=${() => this.settle(t)}
      >
        <div class="avatar" style=${`background:${s?.color ?? C(i)}`}>
          ${G(o)}
        </div>
        <div class="sentence">
          ${r ? n`${e("you_owe")} ${a} ${e("to")} ${o}` : n`${o} ${e("owes_you")} ${a}`}
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }
  /** One transfer, as a gesture to make: who pays, to whom, how much. */
  renderTransfer(t) {
    return n`
      <button
        class="transfer line-button"
        title=${this.localize("settle_up")}
        @click=${() => this.settle(t)}
      >
        ${this.renderParty(t.from_member_id)}
        <span class="arrow">→</span>
        ${this.renderParty(t.to_member_id)}
        <span class="amount">
          ${R(t.amount, this.currency, this.language)}
        </span>
      </button>
    `;
  }
  renderParty(t) {
    const e = this.memberById(t), r = e?.name ?? "?";
    return n`
      <span class="party" title=${r}>
        <span
          class="avatar"
          style=${`background:${e?.color ?? C(t)}`}
          >${G(r)}</span
        >
        <span class="name">${r}</span>
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
  renderDuel(t) {
    const e = t.find((o) => o.member_id === this.meId), [r, i] = e ? [e, t.find((o) => o !== e)] : [...t].sort((o, a) => a.amount - o.amount), s = this.settlements[0];
    return n`
      <button
        class="duel line-button"
        title=${this.localize("settle_up")}
        ?disabled=${s === void 0}
        @click=${() => s && this.settle(s)}
      >
        ${this.renderSide(r, !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(i, !0)}
      </button>
    `;
  }
  renderSide(t, e) {
    const r = this.memberById(t.member_id), i = t.amount > 0, s = i ? "positive" : "negative", o = n`
      <div class="avatar" style=${`background:${r?.color ?? C(t.member_id)}`}>
        ${G(r?.name ?? "?")}
      </div>
    `, a = n`
      <div class="body">
        <div class="name">${r?.name ?? "?"}</div>
        <div class=${`verdict ${s}`}>${this.verdict(t, i)}</div>
        <div class=${`figure ${s}`}>
          ${R(Math.abs(t.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return n`
      <div class=${`side ${e ? "right" : ""}`}>
        ${e ? c : o}${a}${e ? o : c}
      </div>
    `;
  }
  /**
   * What a side of the duel is about, addressed to whoever is reading.
   *
   * Your own side speaks to you — "You owe" rather than "Antonin owes" about
   * yourself, which is how a balance sheet talks, not a person.
   */
  verdict(t, e) {
    const r = this.localize;
    return t.member_id === this.meId ? r(e ? "you_are_owed" : "you_owe") : r(e ? "must_receive" : "must_pay");
  }
  renderRow(t) {
    const e = this.memberById(t.member_id), r = t.amount > 0, i = r ? "positive" : "negative";
    return n`
      <div class="row">
        <div class="avatar" style=${`background:${e?.color ?? C(t.member_id)}`}>
          ${G(e?.name ?? "?")}
        </div>
        <span class="name">${e?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${i}`}>
            ${r ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${i}`}>
            ${R(Math.abs(t.amount), this.currency, this.language)}
          </div>
        </div>
      </div>
    `;
  }
  memberById(t) {
    return this.members.find((e) => e.id === t);
  }
};
X.styles = [
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
ne([
  l({ attribute: !1 })
], X.prototype, "localize", 2);
ne([
  l({ attribute: !1 })
], X.prototype, "balances", 2);
ne([
  l({ attribute: !1 })
], X.prototype, "settlements", 2);
ne([
  l({ attribute: !1 })
], X.prototype, "members", 2);
ne([
  l({ type: String })
], X.prototype, "meId", 2);
ne([
  l({ type: String })
], X.prototype, "currency", 2);
ne([
  l({ type: String })
], X.prototype, "language", 2);
X = ne([
  f("se-balance-card")
], X);
var yr = Object.defineProperty, vr = Object.getOwnPropertyDescriptor, Ee = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? vr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && yr(e, r, s), s;
};
let ue = class extends m {
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

        ${We.map(
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
ue.styles = [
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
Ee([
  l({ attribute: !1 })
], ue.prototype, "localize", 2);
Ee([
  l({ type: String })
], ue.prototype, "label", 2);
Ee([
  l({ type: String })
], ue.prototype, "value", 2);
Ee([
  l({ type: String })
], ue.prototype, "fallback", 2);
ue = Ee([
  f("se-color-picker")
], ue);
var $r = Object.defineProperty, _r = Object.getOwnPropertyDescriptor, te = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? _r(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && $r(e, r, s), s;
};
const mt = "/static/mdi/iconList.json", Le = 48;
let Oe = null;
function xr() {
  return Oe === null && (Oe = fetch(mt).then((t) => {
    if (!t.ok)
      throw new Error(`${t.status} on ${mt}`);
    return t.json();
  }).catch((t) => {
    throw Oe = null, t;
  })), Oe;
}
let W = class extends m {
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
        this.icons = await xr();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(t) {
    const e = t.trim().toLowerCase();
    if (e === "") {
      this.suggestions = this.icons.slice(0, Le);
      return;
    }
    const r = [], i = [], s = [];
    for (const o of this.icons)
      if (o.name.startsWith(e) ? r.push(o) : o.name.includes(e) ? i.push(o) : o.keywords?.some((a) => a.includes(e)) && s.push(o), r.length >= Le)
        break;
    this.suggestions = [...r, ...i, ...s].slice(0, Le);
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
W.styles = [
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
te([
  l({ attribute: !1 })
], W.prototype, "localize", 2);
te([
  l({ type: String })
], W.prototype, "label", 2);
te([
  l({ type: String })
], W.prototype, "value", 2);
te([
  l({ type: String })
], W.prototype, "color", 2);
te([
  d()
], W.prototype, "icons", 2);
te([
  d()
], W.prototype, "suggestions", 2);
te([
  d()
], W.prototype, "open", 2);
te([
  d()
], W.prototype, "failed", 2);
W = te([
  f("se-icon-picker")
], W);
function Ye(t) {
  const { amount: e, payerId: r, memberIds: i } = t;
  if (!Number.isInteger(e) || e <= 0)
    return null;
  const s = [...new Set(i)];
  if (s.length === 0 || !s.includes(r))
    return null;
  const o = t.rule ?? {}, a = wr(o, e);
  if (a === null)
    return null;
  const u = o.participants == null ? s : [...new Set(o.participants)];
  if (u.some((S) => !s.includes(S)))
    return null;
  const p = u.length === 0 ? 0 : a, b = zt(p, u), v = e - p;
  if (v > 0) {
    const S = zr(o.remainder, v, r, s);
    if (S === null)
      return null;
    for (const [H, Pt] of Object.entries(S))
      b[H] = (b[H] ?? 0) + Pt;
  }
  const h = {};
  for (const [S, H] of Object.entries(b))
    H !== 0 && (h[S] = H);
  return Object.values(h).reduce((S, H) => S + H, 0) === e ? h : null;
}
function wr(t, e) {
  return t.envelope == null ? e : t.envelope < 0 ? null : Math.min(t.envelope, e);
}
function zr(t, e, r, i) {
  const s = t ?? {}, o = s.fixed ?? {};
  for (const [h, A] of Object.entries(o))
    if (!i.includes(h) || A < 0)
      return null;
  const a = s.members == null ? [r] : [...new Set(s.members)];
  if (a.length === 0 || a.some((h) => !i.includes(h)))
    return null;
  const u = {};
  for (const h of a)
    h in o && (u[h] = o[h]);
  const p = Object.values(u).reduce((h, A) => h + A, 0);
  if (p > e)
    return null;
  const b = a.filter((h) => !(h in u));
  if (b.length === 0)
    return p === e ? u : null;
  const v = { ...u };
  for (const [h, A] of Object.entries(
    zt(e - p, b)
  ))
    v[h] = (v[h] ?? 0) + A;
  return v;
}
function zt(t, e) {
  if (t <= 0 || e.length === 0)
    return {};
  const r = Math.floor(t / e.length), i = t % e.length, s = {};
  return e.forEach((o, a) => {
    s[o] = r + (a < i ? 1 : 0);
  }), s;
}
var Sr = Object.defineProperty, Cr = Object.getOwnPropertyDescriptor, U = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Cr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Sr(e, r, s), s;
};
const Pr = 8542;
let E = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.required = !1, this.enabled = !1, this.envelopeInput = "", this.participants = /* @__PURE__ */ new Set(), this.takers = /* @__PURE__ */ new Set(), this.amounts = {};
  }
  connectedCallback() {
    super.connectedCallback(), this.enabled = this.required || this.rule !== null, this.envelopeInput = this.rule?.envelope != null ? ke(this.rule.envelope) : "", this.participants = new Set(
      this.rule?.participants ?? this.members.map((e) => e.id)
    );
    const t = this.rule?.remainder?.members;
    this.takers = new Set(
      t ?? (this.payerId ? [this.payerId] : [])
    ), this.amounts = Object.fromEntries(
      Object.entries(this.rule?.remainder?.fixed ?? {}).map(([e, r]) => [
        e,
        ke(r)
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
    return this.amount != null && this.amount > 0 ? this.amount : Pr;
  }
  renderPanel() {
    const t = this.localize, e = pe(this.envelopeInput), r = this.envelopeInput.trim() !== "" && e !== null && e < this.previewAmount;
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

        ${r ? this.renderRemainder() : c} ${this.renderPreview()}
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
                @value-changed=${(r) => this.setAmount(e.id, r.detail.value)}
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
    const t = this.members.find((s) => s.id === this.payerId) ?? this.members[0];
    if (!t)
      return c;
    const e = this.previewAmount, r = Ye({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((s) => s.id),
      rule: this.build()
    });
    if (r === null)
      return n`<div class="preview negative">${this.localize("rule_invalid")}</div>`;
    const i = (s) => R(s, this.currency, this.language);
    return n`
      <div class="preview">
        <div class="muted">
          ${this.localize("rule_preview_intro")} ${i(e)}
          ${this.localize("rule_preview_paid_by")} ${t.name} :
        </div>
        ${this.members.map(
      (s) => n`
            <div class="line">
              <span>${s.name}</span>
              <strong>${i(r[s.id] ?? 0)}</strong>
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
    return !t || this.amount == null ? null : Ye({
      amount: this.amount,
      payerId: t.id,
      memberIds: this.members.map((e) => e.id),
      rule: this.build()
    });
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? C(t.id)}`}>
        ${G(t.name)}
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
    this.participants = gt(this.participants, t), this.emit();
  }
  toggleTaker(t) {
    if (this.takers = gt(this.takers, t), !this.takers.has(t)) {
      const { [t]: e, ...r } = this.amounts;
      this.amounts = r;
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
    const t = this.envelopeInput.trim(), e = t === "" ? null : pe(t), r = {};
    for (const [i, s] of Object.entries(this.amounts)) {
      if (!this.takers.has(i) || s.trim() === "")
        continue;
      const o = pe(s);
      o !== null && (r[i] = o);
    }
    return {
      envelope: e,
      participants: this.participants.size === this.members.length ? null : [...this.participants],
      remainder: {
        // Nobody ticked: whoever paid takes the rest, the useful default.
        members: this.takers.size === 0 ? null : [...this.takers],
        fixed: r
      }
    };
  }
};
E.styles = [
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
U([
  l({ attribute: !1 })
], E.prototype, "localize", 2);
U([
  l({ attribute: !1 })
], E.prototype, "members", 2);
U([
  l({ attribute: !1 })
], E.prototype, "rule", 2);
U([
  l({ type: String })
], E.prototype, "currency", 2);
U([
  l({ type: String })
], E.prototype, "language", 2);
U([
  l({ type: Number })
], E.prototype, "amount", 2);
U([
  l({ type: String })
], E.prototype, "payerId", 2);
U([
  l({ type: Boolean })
], E.prototype, "required", 2);
U([
  d()
], E.prototype, "enabled", 2);
U([
  d()
], E.prototype, "envelopeInput", 2);
U([
  d()
], E.prototype, "participants", 2);
U([
  d()
], E.prototype, "takers", 2);
U([
  d()
], E.prototype, "amounts", 2);
E = U([
  f("se-split-rule-editor")
], E);
function gt(t, e) {
  const r = new Set(t);
  return r.has(e) ? r.delete(e) : r.add(e), r;
}
var kr = Object.defineProperty, Ar = Object.getOwnPropertyDescriptor, N = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Ar(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && kr(e, r, s), s;
};
let I = class extends m {
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
            @value-changed=${(r) => this.name = r.detail.value}
          ></se-field>

          <se-icon-picker
            .localize=${this.localize}
            .label=${t("icon")}
            .value=${this.icon}
            .color=${this.effectiveColor()}
            @value-changed=${(r) => this.icon = r.detail.value}
          ></se-icon-picker>

          <se-color-picker
            .localize=${this.localize}
            .label=${t("color")}
            .value=${this.color}
            .fallback=${this.autoColor()}
            @value-changed=${(r) => this.color = r.detail.value}
          ></se-color-picker>

          <div>
            <label class="muted">${t("default_split")}</label>
            <se-split-rule-editor
              .localize=${this.localize}
              .members=${this.members}
              .rule=${this.rule}
              .currency=${this.group.currency}
              .language=${this.language}
              @rule-changed=${(r) => this.rule = r.detail.rule}
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
    return C(this.category?.id ?? this.name);
  }
};
I.styles = z;
N([
  l({ attribute: !1 })
], I.prototype, "api", 2);
N([
  l({ attribute: !1 })
], I.prototype, "localize", 2);
N([
  l({ attribute: !1 })
], I.prototype, "group", 2);
N([
  l({ attribute: !1 })
], I.prototype, "members", 2);
N([
  l({ attribute: !1 })
], I.prototype, "category", 2);
N([
  l({ type: String })
], I.prototype, "language", 2);
N([
  d()
], I.prototype, "name", 2);
N([
  d()
], I.prototype, "icon", 2);
N([
  d()
], I.prototype, "color", 2);
N([
  d()
], I.prototype, "rule", 2);
N([
  d()
], I.prototype, "busy", 2);
N([
  d()
], I.prototype, "error", 2);
I = N([
  f("se-category-dialog")
], I);
var Er = Object.defineProperty, Ir = Object.getOwnPropertyDescriptor, F = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Ir(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Er(e, r, s), s;
};
let T = class extends m {
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
          .color=${t.color ?? C(t.id)}
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
    const r = R(e, this.group.currency, this.language);
    return `${this.localize("rule_shares")} ${r}`;
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
T.styles = [
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
F([
  l({ attribute: !1 })
], T.prototype, "api", 2);
F([
  l({ attribute: !1 })
], T.prototype, "localize", 2);
F([
  l({ attribute: !1 })
], T.prototype, "group", 2);
F([
  l({ attribute: !1 })
], T.prototype, "members", 2);
F([
  l({ type: String })
], T.prototype, "language", 2);
F([
  d()
], T.prototype, "categories", 2);
F([
  d()
], T.prototype, "editing", 2);
F([
  d()
], T.prototype, "creating", 2);
F([
  d()
], T.prototype, "loading", 2);
F([
  d()
], T.prototype, "error", 2);
F([
  d()
], T.prototype, "dirty", 2);
T = F([
  f("se-categories-dialog")
], T);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Or = (t) => (...e) => ({ _$litDirective$: t, values: e });
let Dr = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, r, i) {
    this._$Ct = e, this._$AM = r, this._$Ci = i;
  }
  _$AS(e, r) {
    return this.update(e, r);
  }
  update(e, r) {
    return this.render(...r);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Mr = {}, Tr = (t, e = Mr) => t._$AH = e;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const jr = Or(class extends Dr {
  constructor() {
    super(...arguments), this.key = c;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, r]) {
    return e !== this.key && (Tr(t), this.key = e), r;
  }
}), Ur = {
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
  shares: "split"
};
function Rr(t, e) {
  const r = Ur[t.field];
  return r ? {
    label: e.localize(r),
    before: bt(t.field, t.before, e),
    after: bt(t.field, t.after, e)
  } : null;
}
function bt(t, e, r) {
  return e == null ? null : t === "amount" && typeof e == "number" ? R(e, r.currency, r.language) : t === "expense_date" || t === "payment_date" ? Re(String(e), r.language) : t === "category_id" ? r.categories.find((i) => i.id === e)?.name ?? r.localize("no_category") : t === "paid_by_member_id" || t === "from_member_id" || t === "to_member_id" ? St(String(e), r) : t === "shares" && Br(e) ? Nr(e, r) : String(e);
}
function Nr(t, e) {
  const r = Object.entries(t).filter(([, i]) => i !== 0);
  return r.length === 0 ? "—" : r.map(
    ([i, s]) => `${St(i, e)} ${R(s, e.currency, e.language)}`
  ).join(" · ");
}
function St(t, e) {
  return e.members.find((r) => r.id === t)?.name ?? "?";
}
function Br(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t) && Object.values(t).every((e) => typeof e == "number");
}
var Hr = Object.defineProperty, Gr = Object.getOwnPropertyDescriptor, re = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Gr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Hr(e, r, s), s;
};
let Y = class extends m {
  constructor() {
    super(...arguments), this.revisions = [], this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.withSubject = !1;
  }
  render() {
    return this.revisions.length === 0 ? n`<div class="empty">${this.localize("no_history")}</div>` : n`${this.revisions.map((t) => this.renderEntry(t))}`;
  }
  renderEntry(t) {
    const e = this.actorOf(t), r = e?.name ?? this.localize("someone"), i = this.openable?.has(t.entity_id) ?? !1, s = n`
      <div
        class="avatar"
        style=${`background:${e?.color ?? C(t.actor_user_id ?? t.id)}`}
      >
        ${G(r)}
      </div>
      <div class="body">
        <div class="head">
          <span class="who">${r}</span>
          <span class="when">${Re(t.at, this.language)}</span>
        </div>
        <div class="what">${this.headline(t)}</div>
        ${this.renderChanges(t)}
      </div>
      ${i ? n`<span class="chevron">›</span>` : c}
    `;
    return i ? n`<button class="entry entry-button" @click=${() => this.pick(t)}>
          ${s}
        </button>` : n`<div class="entry">${s}</div>`;
  }
  pick(t) {
    this.dispatchEvent(
      new CustomEvent("revision-picked", {
        detail: { entityType: t.entity_type, entityId: t.entity_id },
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
  headline(t) {
    const e = this.localize, r = t.entity_type === "expense" ? e("the_expense") : e("the_payment"), i = e(`history_${t.action}`), s = this.withSubject && t.entity_label ? ` "${t.entity_label}"` : "";
    return `${i} ${r}${s}`;
  }
  /**
   * The changes, dropping the ones this version cannot say.
   *
   * A creation lists everything it was born with, which on the group journal
   * would drown out the changes that actually mean something. Only what moved
   * gets spelled out; what a thing started as can be read on the thing itself.
   */
  renderChanges(t) {
    if (t.action === "created")
      return c;
    const e = {
      localize: this.localize,
      members: this.members,
      categories: this.categories,
      currency: this.currency,
      language: this.language
    }, r = t.changes.map((i) => Rr(i, e)).filter((i) => i !== null);
    return n`
      ${r.map(
      (i) => n`
          <div class="change">
            <span class="field">${i.label}</span>
            ${i.before === null ? c : n`<span class="before">${i.before}</span>
                  <span class="arrow">→</span>`}
            ${i.after === null ? n`<span class="after">—</span>` : n`<span class="after">${i.after}</span>`}
          </div>
        `
    )}
    `;
  }
  /** The member behind the account that made the change, if we can place them. */
  actorOf(t) {
    if (t.actor_user_id)
      return this.members.find((e) => e.user_id === t.actor_user_id);
  }
};
Y.styles = [
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
re([
  l({ attribute: !1 })
], Y.prototype, "localize", 2);
re([
  l({ attribute: !1 })
], Y.prototype, "revisions", 2);
re([
  l({ attribute: !1 })
], Y.prototype, "members", 2);
re([
  l({ attribute: !1 })
], Y.prototype, "categories", 2);
re([
  l({ type: String })
], Y.prototype, "currency", 2);
re([
  l({ type: String })
], Y.prototype, "language", 2);
re([
  l({ type: Boolean })
], Y.prototype, "withSubject", 2);
re([
  l({ attribute: !1 })
], Y.prototype, "openable", 2);
Y = re([
  f("se-history")
], Y);
var qr = Object.defineProperty, Lr = Object.getOwnPropertyDescriptor, B = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Lr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && qr(e, r, s), s;
};
let O = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.open = !1, this.busy = !1, this.toggle = async () => {
      if (this.open = !this.open, !(!this.open || this.revisions || this.busy)) {
        this.busy = !0, this.error = void 0;
        try {
          this.revisions = await this.api.listEntityRevisions(this.groupId, this.entityId);
        } catch (t) {
          this.error = w(t, this.localize);
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  render() {
    const t = this.localize;
    return n`
      <div>
        <div class="head">
          <label class="muted">${t("history")}</label>
          <button class="link" @click=${this.toggle}>
            ${this.open ? t("done") : t("see_all")}
          </button>
        </div>

        ${this.open ? this.renderBody() : c}
      </div>
    `;
  }
  renderBody() {
    return this.error ? n`<div class="error">${this.error}</div>` : this.busy || !this.revisions ? n`<div class="muted">${this.localize("loading")}</div>` : n`
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
O.styles = [
  z,
  _`
      .head {
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
    `
];
B([
  l({ attribute: !1 })
], O.prototype, "api", 2);
B([
  l({ attribute: !1 })
], O.prototype, "localize", 2);
B([
  l({ type: String })
], O.prototype, "groupId", 2);
B([
  l({ type: String })
], O.prototype, "entityId", 2);
B([
  l({ attribute: !1 })
], O.prototype, "members", 2);
B([
  l({ attribute: !1 })
], O.prototype, "categories", 2);
B([
  l({ type: String })
], O.prototype, "currency", 2);
B([
  l({ type: String })
], O.prototype, "language", 2);
B([
  d()
], O.prototype, "open", 2);
B([
  d()
], O.prototype, "revisions", 2);
B([
  d()
], O.prototype, "busy", 2);
B([
  d()
], O.prototype, "error", 2);
O = B([
  f("se-entity-history")
], O);
var Fr = Object.defineProperty, Vr = Object.getOwnPropertyDescriptor, _e = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Vr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Fr(e, r, s), s;
};
let oe = class extends m {
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
oe.styles = _`
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
_e([
  l({ type: String })
], oe.prototype, "label", 2);
_e([
  l({ type: String })
], oe.prototype, "value", 2);
_e([
  l({ attribute: !1 })
], oe.prototype, "options", 2);
_e([
  l({ type: String })
], oe.prototype, "placeholder", 2);
_e([
  l({ type: Boolean })
], oe.prototype, "disabled", 2);
oe = _e([
  f("se-select")
], oe);
var Wr = Object.defineProperty, Yr = Object.getOwnPropertyDescriptor, x = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Yr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Wr(e, r, s), s;
};
let $ = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = xt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.editingSplit = !1, this.showDescription = !1, this.pickCategory = (t) => {
      this.categoryId = t.detail.value, this.rule = null;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const t = pe(this.amountInput), e = this.resolved(t);
      if (t === null || !e)
        return;
      this.busy = !0, this.error = void 0;
      const r = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: Ve(this.date),
        category_id: this.categoryId || null,
        description: this.description.trim() || null,
        shares: Object.entries(e).map(([i, s]) => ({
          member_id: i,
          amount: s
        })),
        // The shares are the truth, but the rule has to travel with them, or
        // reopening the expense could only ever spell the amounts back out.
        split_rule: this.rule ?? this.defaultRule()
      };
      try {
        const i = this.expense ? await this.api.updateExpense(this.expense.id, {
          title: r.title,
          amount: r.amount,
          paid_by_member_id: r.paid_by_member_id,
          expense_date: r.expense_date,
          category_id: r.category_id,
          description: r.description,
          shares: r.shares,
          split_rule: r.split_rule
        }) : await this.api.createExpense(r);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: i },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (i) {
        this.error = w(i, this.localize);
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
      this.paidBy = this.meId ?? this.members[0]?.id ?? "";
      return;
    }
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = ke(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = wt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares(), this.showDescription = this.description !== "";
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
    return t === null || !this.paidBy || this.members.length === 0 ? null : Ye({
      amount: t,
      payerId: this.paidBy,
      memberIds: this.members.map((e) => e.id),
      rule: this.rule ?? this.defaultRule()
    });
  }
  render() {
    const t = this.localize, e = pe(this.amountInput), r = this.expense ? t("edit_expense") : t("new_expense");
    return n`
      <se-dialog open heading=${r} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : c}

          <se-field
            .label=${t("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(i) => this.expenseTitle = i.detail.value}
          ></se-field>

          <div class="pair">
            <se-field
              .label=${t("amount")}
              .value=${this.amountInput}
              .suffix=${this.group.currency}
              required
              decimal
              placeholder="85,42"
              @value-changed=${(i) => this.amountInput = i.detail.value}
            ></se-field>

            <se-field
              .label=${t("date")}
              type="date"
              .value=${this.date}
              @value-changed=${(i) => this.date = i.detail.value}
            ></se-field>
          </div>

          <div class="pair">
            <se-select
              .label=${t("paid_by")}
              .value=${this.paidBy}
              .options=${this.members.map((i) => ({ value: i.id, label: i.name }))}
              @value-changed=${(i) => this.paidBy = i.detail.value}
            ></se-select>

            <se-select
              .label=${t("category")}
              .value=${this.categoryId}
              .placeholder=${t("no_category")}
              .options=${this.categories.map((i) => ({ value: i.id, label: i.name }))}
              @value-changed=${this.pickCategory}
            ></se-select>
          </div>

          ${this.showDescription ? n`
                <se-field
                  .label=${t("description")}
                  .value=${this.description}
                  placeholder=${t("description_placeholder")}
                  @value-changed=${(i) => this.description = i.detail.value}
                ></se-field>
              ` : n`
                <button class="link" @click=${() => this.showDescription = !0}>
                  + ${t("add_description")}
                </button>
              `}

          ${this.renderSplit(e)}

          <!-- Only once there is a past to read: a new expense has none. -->
          ${this.expense ? n`
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
              ` : c}
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
        ${this.members.filter((r) => e[r.id]).map(
      (r) => n`
              <span class="who">
                ${r.name}
                <strong>
                  ${R(e[r.id], this.group.currency, this.language)}
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
    return jr(
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
$.styles = [
  z,
  _`
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
x([
  l({ attribute: !1 })
], $.prototype, "api", 2);
x([
  l({ attribute: !1 })
], $.prototype, "localize", 2);
x([
  l({ attribute: !1 })
], $.prototype, "group", 2);
x([
  l({ attribute: !1 })
], $.prototype, "members", 2);
x([
  l({ attribute: !1 })
], $.prototype, "categories", 2);
x([
  l({ attribute: !1 })
], $.prototype, "expense", 2);
x([
  l({ type: String })
], $.prototype, "meId", 2);
x([
  l({ type: String })
], $.prototype, "language", 2);
x([
  d()
], $.prototype, "expenseTitle", 2);
x([
  d()
], $.prototype, "description", 2);
x([
  d()
], $.prototype, "amountInput", 2);
x([
  d()
], $.prototype, "paidBy", 2);
x([
  d()
], $.prototype, "date", 2);
x([
  d()
], $.prototype, "categoryId", 2);
x([
  d()
], $.prototype, "rule", 2);
x([
  d()
], $.prototype, "busy", 2);
x([
  d()
], $.prototype, "error", 2);
x([
  d()
], $.prototype, "confirmingDelete", 2);
x([
  d()
], $.prototype, "editingSplit", 2);
x([
  d()
], $.prototype, "showDescription", 2);
$ = x([
  f("se-expense-dialog")
], $);
var Kr = Object.defineProperty, Xr = Object.getOwnPropertyDescriptor, Q = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Xr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Kr(e, r, s), s;
};
let L = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.close = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const t = this.localize;
    return n`
      <se-dialog open heading=${t("group_history")} @dialog-closed=${this.close}>
        ${this.error ? n`<div class="error">${this.error}</div>` : c}
        ${this.renderBody()}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${t("close")}
        </se-button>
      </se-dialog>
    `;
  }
  renderBody() {
    return this.error ? c : this.revisions ? n`
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
    ` : n`<div class="muted">${this.localize("loading")}</div>`;
  }
  async load() {
    try {
      this.revisions = await this.api.listRevisions(this.group.id);
    } catch (t) {
      this.error = w(t, this.localize);
    }
  }
};
L.styles = z;
Q([
  l({ attribute: !1 })
], L.prototype, "api", 2);
Q([
  l({ attribute: !1 })
], L.prototype, "localize", 2);
Q([
  l({ attribute: !1 })
], L.prototype, "group", 2);
Q([
  l({ attribute: !1 })
], L.prototype, "members", 2);
Q([
  l({ attribute: !1 })
], L.prototype, "categories", 2);
Q([
  l({ attribute: !1 })
], L.prototype, "openable", 2);
Q([
  l({ type: String })
], L.prototype, "language", 2);
Q([
  d()
], L.prototype, "revisions", 2);
Q([
  d()
], L.prototype, "error", 2);
L = Q([
  f("se-history-dialog")
], L);
var Zr = Object.defineProperty, Jr = Object.getOwnPropertyDescriptor, D = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? Jr(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Zr(e, r, s), s;
};
let P = class extends m {
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
    const e = this.memberForUser(t.id), r = this.isOwner(e);
    return n`
      <div class="row">
        <input
          type="checkbox"
          .checked=${e !== void 0}
          ?disabled=${r || this.busy !== void 0}
          title=${r ? this.localize("owner_locked") : ""}
          @change=${() => this.toggleAccount(t, e)}
        />
        ${this.renderTintable(e, t.name, t.id)}
        <span class="name">${t.name}</span>
        ${r ? n`<span class="tag">${this.localize("group_owner")}</span>` : c}
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
  renderTintable(t, e, r) {
    const i = t?.color ?? C(r);
    return t ? n`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${i}`}
        @click=${() => this.toggleTint(t.id)}
      >
        ${G(e)}
      </button>
    ` : n`
        <div class="avatar" style=${`background:${i}`}>${G(e)}</div>
      `;
  }
  renderPalette(t) {
    return !t || this.tinting !== t.id ? c : n`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${t.color}
          .fallback=${C(t.id)}
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
    } catch (r) {
      this.error = w(r, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  renderGuests() {
    const t = this.localize, e = this.members.filter((i) => i.user_id === null), r = this.pastMembers.filter(
      (i) => i.user_id === null && !e.some((s) => s.id === i.id)
    );
    return n`
      <div class="section">
        <h3>${t("guests")}</h3>
        <div class="muted">${t("guests_hint")}</div>

        ${e.map(
      (i) => n`
            <div class="row">
              ${this.renderTintable(i, i.name, i.id)}
              <span class="name">${i.name}</span>
              ${this.confirming === i.id ? n`<span class="confirm">${t("confirm_remove")}</span>` : c}
              <button
                class=${`remove ${this.confirming === i.id ? "danger" : ""}`}
                ?disabled=${this.busy !== void 0}
                aria-label=${t("remove_member")}
                @click=${() => this.removeGuest(i)}
              >
                ×
              </button>
            </div>
            ${this.renderPalette(i)}
          `
    )}

        ${r.map(
      (i) => n`
            <div class="row gone">
              <div
                class="avatar"
                style=${`background:${i.color ?? C(i.id)}`}
              >
                ${G(i.name)}
              </div>
              <span class="name">${i.name}</span>
              <se-button
                variant="text"
                ?disabled=${this.busy !== void 0}
                @click=${() => this.restoreGuest(i)}
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
            @value-changed=${(i) => this.newName = i.detail.value}
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
      const [t, e, r, i] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listMemberships(this.groupId)
      ]);
      this.haUsers = t, this.members = e, this.pastMembers = r, this.memberships = i;
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
    } catch (r) {
      this.error = w(r, this.localize);
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
P.styles = [
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
D([
  l({ attribute: !1 })
], P.prototype, "api", 2);
D([
  l({ attribute: !1 })
], P.prototype, "localize", 2);
D([
  l({ type: String })
], P.prototype, "groupId", 2);
D([
  d()
], P.prototype, "haUsers", 2);
D([
  d()
], P.prototype, "members", 2);
D([
  d()
], P.prototype, "memberships", 2);
D([
  d()
], P.prototype, "newName", 2);
D([
  d()
], P.prototype, "loading", 2);
D([
  d()
], P.prototype, "busy", 2);
D([
  d()
], P.prototype, "error", 2);
D([
  d()
], P.prototype, "dirty", 2);
D([
  d()
], P.prototype, "tinting", 2);
D([
  d()
], P.prototype, "confirming", 2);
D([
  d()
], P.prototype, "pastMembers", 2);
P = D([
  f("se-member-dialog")
], P);
var Qr = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, M = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? ei(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && Qr(e, r, s), s;
};
let k = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = xt(), this.busy = !1, this.confirmingDelete = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = pe(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = this.payment ? await this.api.updatePayment(this.payment.id, {
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Ve(this.date)
          }) : await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Ve(this.date)
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
      this.fromMember = this.payment.from_member_id, this.toMember = this.payment.to_member_id, this.amountInput = ke(this.payment.amount), this.date = wt(this.payment.payment_date);
      return;
    }
    if (this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = ke(this.settlement.amount);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const t = this.localize, e = pe(this.amountInput), r = this.members.map((s) => ({ value: s.id, label: s.name })), i = this.payment ? t("edit_payment") : t("new_payment");
    return n`
      <se-dialog open heading=${i} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : c}

          <se-select
            .label=${t("from_member")}
            .value=${this.fromMember}
            .options=${r}
            @value-changed=${(s) => this.fromMember = s.detail.value}
          ></se-select>

          <se-select
            .label=${t("to_member")}
            .value=${this.toMember}
            .options=${r}
            @value-changed=${(s) => this.toMember = s.detail.value}
          ></se-select>

          <se-field
            .label=${t("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            decimal
            required
            @value-changed=${(s) => this.amountInput = s.detail.value}
          ></se-field>

          <se-field
            .label=${t("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(s) => this.date = s.detail.value}
          ></se-field>

          ${e !== null && e > 0 ? n`<div class="muted">
                ${R(e, this.group.currency, this.language)}
              </div>` : c}

          <!-- Only once there is a past to read: a new one has none. -->
          ${this.payment ? n`
                <se-entity-history
                  .api=${this.api}
                  .localize=${this.localize}
                  .groupId=${this.group.id}
                  .entityId=${this.payment.id}
                  .members=${this.members}
                  .currency=${this.group.currency}
                  .language=${this.language}
                ></se-entity-history>
              ` : c}
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
k.styles = z;
M([
  l({ attribute: !1 })
], k.prototype, "api", 2);
M([
  l({ attribute: !1 })
], k.prototype, "localize", 2);
M([
  l({ attribute: !1 })
], k.prototype, "group", 2);
M([
  l({ attribute: !1 })
], k.prototype, "members", 2);
M([
  l({ attribute: !1 })
], k.prototype, "payment", 2);
M([
  l({ attribute: !1 })
], k.prototype, "settlement", 2);
M([
  l({ type: String })
], k.prototype, "language", 2);
M([
  d()
], k.prototype, "fromMember", 2);
M([
  d()
], k.prototype, "toMember", 2);
M([
  d()
], k.prototype, "amountInput", 2);
M([
  d()
], k.prototype, "date", 2);
M([
  d()
], k.prototype, "busy", 2);
M([
  d()
], k.prototype, "error", 2);
M([
  d()
], k.prototype, "confirmingDelete", 2);
k = M([
  f("se-payment-dialog")
], k);
var ti = Object.defineProperty, ri = Object.getOwnPropertyDescriptor, Ct = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? ri(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && ti(e, r, s), s;
};
let Ne = class extends m {
  constructor() {
    super(...arguments), this.bars = [];
  }
  render() {
    if (this.bars.length === 0)
      return c;
    const t = Math.max(...this.bars.map((e) => e.value), 0);
    return n`
      ${this.bars.map(
      (e) => n`
          <div class="bar">
            <div class="head">
              <span class="label" title=${e.label}>${e.label}</span>
              <span class="value">${e.text}</span>
            </div>
            <div class="track">
              <div
                class="fill"
                style=${`width:${ii(e.value, t)}%${e.color ? `;background:${e.color}` : ""}`}
              ></div>
            </div>
          </div>
        `
    )}
    `;
  }
};
Ne.styles = [
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
Ct([
  l({ attribute: !1 })
], Ne.prototype, "bars", 2);
Ne = Ct([
  f("se-bar-chart")
], Ne);
function ii(t, e) {
  return e <= 0 ? 0 : t / e * 100;
}
var si = Object.defineProperty, oi = Object.getOwnPropertyDescriptor, V = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? oi(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && si(e, r, s), s;
};
const De = "all";
let j = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.currency = "EUR", this.language = "en", this.period = De;
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const t = this.localize;
    return this.error ? n`<div class="error">${this.error}</div>` : this.result ? this.result.years.length === 0 ? n`<div class="card">
        <div class="empty">${t("no_expenses")}</div>
      </div>` : n`
      <div class="card">
        ${this.renderPeriod()} ${this.renderTotals()}
      </div>

      ${this.renderCard("by_category", this.categoryBars())}
      ${this.renderCard("by_month", this.monthBars())}
      ${this.renderMembers()}
    ` : n`<div class="card"><div class="empty">${t("loading")}</div></div>`;
  }
  renderPeriod() {
    const t = this.localize;
    return n`
      <div class="period">
        <button
          aria-pressed=${this.period === De}
          @click=${() => this.pick(De)}
        >
          ${t("period_all")}
        </button>
        ${this.result.years.map(
      (e) => n`
            <button
              aria-pressed=${this.period === String(e)}
              @click=${() => this.pick(String(e))}
            >
              ${e}
            </button>
          `
    )}
      </div>
    `;
  }
  renderTotals() {
    const t = this.localize, e = this.result.by_member.find((r) => r.member_id === this.meId);
    return n`
      <div class="totals">
        <div class="total">
          <div class="muted">${t("total_spent")}</div>
          <div class="figure">${this.money(this.result.total)}</div>
        </div>
        ${e ? n`
              <div class="total">
                <div class="muted">${t("your_share")}</div>
                <div class="figure">${this.money(e.share)}</div>
              </div>
            ` : c}
      </div>
    `;
  }
  renderCard(t, e) {
    return e.length === 0 ? c : n`
      <div class="card">
        <h3 class="section-title">${this.localize(t)}</h3>
        <se-bar-chart .bars=${e}></se-bar-chart>
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
    const t = this.localize, e = this.result.by_member;
    return e.length === 0 ? c : n`
      <div class="card">
        <h3 class="section-title">${t("by_member")}</h3>
        ${e.map((r) => {
      const i = this.members.find((o) => o.id === r.member_id), s = i?.name ?? "?";
      return n`
            <div class="member">
              <div
                class="avatar"
                style=${`background:${i?.color ?? C(r.member_id)}`}
              >
                ${G(s)}
              </div>
              <span class="name">${s}</span>
              <div class="figures">
                <div>
                  ${t("paid_total")} <strong>${this.money(r.paid)}</strong>
                </div>
                <div class="muted">
                  ${t("consumed")} <strong>${this.money(r.share)}</strong>
                </div>
              </div>
            </div>
          `;
    })}
      </div>
    `;
  }
  categoryBars() {
    return this.result.by_category.map((t) => {
      const e = this.categories.find((r) => r.id === t.category_id);
      return {
        key: t.category_id ?? "none",
        label: e?.name ?? this.localize("no_category"),
        value: t.total,
        text: this.money(t.total),
        color: e?.color ?? void 0
      };
    });
  }
  monthBars() {
    return this.result.by_month.map((t) => ({
      key: t.month,
      label: gr(t.month, this.language),
      value: t.total,
      text: this.money(t.total)
    }));
  }
  money(t) {
    return R(t, this.currency, this.language);
  }
  pick(t) {
    t !== this.period && (this.period = t, this.load());
  }
  async load() {
    this.error = void 0;
    try {
      this.result = await this.api.getStatistics(
        this.groupId,
        this.period === De ? null : Number(this.period)
      );
    } catch (t) {
      this.error = w(t, this.localize);
    }
  }
};
j.styles = [
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
V([
  l({ attribute: !1 })
], j.prototype, "api", 2);
V([
  l({ attribute: !1 })
], j.prototype, "localize", 2);
V([
  l({ type: String })
], j.prototype, "groupId", 2);
V([
  l({ attribute: !1 })
], j.prototype, "members", 2);
V([
  l({ attribute: !1 })
], j.prototype, "categories", 2);
V([
  l({ type: String })
], j.prototype, "meId", 2);
V([
  l({ type: String })
], j.prototype, "currency", 2);
V([
  l({ type: String })
], j.prototype, "language", 2);
V([
  d()
], j.prototype, "result", 2);
V([
  d()
], j.prototype, "period", 2);
V([
  d()
], j.prototype, "error", 2);
j = V([
  f("se-statistics")
], j);
var ai = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, le = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? ni(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && ai(e, r, s), s;
};
let Z = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.close = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    };
  }
  render() {
    const t = this.localize;
    return n`
      <se-dialog open heading=${t("statistics")} @dialog-closed=${this.close}>
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
          ${t("close")}
        </se-button>
      </se-dialog>
    `;
  }
};
Z.styles = z;
le([
  l({ attribute: !1 })
], Z.prototype, "api", 2);
le([
  l({ attribute: !1 })
], Z.prototype, "localize", 2);
le([
  l({ attribute: !1 })
], Z.prototype, "group", 2);
le([
  l({ attribute: !1 })
], Z.prototype, "members", 2);
le([
  l({ attribute: !1 })
], Z.prototype, "categories", 2);
le([
  l({ type: String })
], Z.prototype, "meId", 2);
le([
  l({ type: String })
], Z.prototype, "language", 2);
Z = le([
  f("se-statistics-dialog")
], Z);
var li = Object.defineProperty, di = Object.getOwnPropertyDescriptor, y = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? di(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && li(e, r, s), s;
};
const ci = 8;
let g = class extends m {
  constructor() {
    super(...arguments), this.language = "en", this.userId = null, this.groups = [], this.members = [], this.pastMembers = [], this.categories = [], this.expenses = [], this.payments = [], this.query = "", this.loading = !0, this.addingPayment = !1, this.draggedAway = !1, this.busy = !1, this.confirmingDelete = !1, this.deleteGroup = async () => {
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
    }, this.fabDown = (t) => {
      t.target.setPointerCapture(t.pointerId), this.fabFrom = { x: t.clientX, y: t.clientY }, this.addingPayment = !1;
    }, this.fabMove = (t) => {
      if (!this.fabFrom)
        return;
      const e = t.clientX - this.fabFrom.x, r = t.clientY - this.fabFrom.y;
      this.addingPayment = r < -40 || e < -40;
    }, this.fabUp = () => {
      if (!this.fabFrom)
        return;
      const t = this.addingPayment;
      this.fabFrom = void 0, this.addingPayment = !1, t && (this.draggedAway = !0, this.openPayment());
    }, this.fabCancel = () => {
      this.fabFrom = void 0, this.addingPayment = !1;
    }, this.fabClick = () => {
      if (this.draggedAway) {
        this.draggedAway = !1;
        return;
      }
      this.openExpense();
    }, this.settleUp = (t) => {
      this.openPayment(t.detail.settlement);
    }, this.openFromHistory = (t) => {
      const { entityType: e, entityId: r } = t.detail;
      if (e === "expense") {
        const s = this.expenses.find((o) => o.id === r);
        s && this.openExpense(s);
        return;
      }
      const i = this.payments.find((s) => s.id === r);
      i && this.openPayment(void 0, i);
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

          ${this.renderHome()}
        </div>
      </div>

      ${this.addingPayment ? n`<div class="fab-hint">${t("new_payment")}</div>` : c}
      <button
        class=${`fab ${this.addingPayment ? "reimbursing" : ""}`}
        aria-label=${t("action_add_expense")}
        title=${t("fab_hint")}
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
      <button role="menuitem" @click=${() => this.openDialog("statistics")}>
        ${t("statistics")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("history")}>
        ${t("group_history")}
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
  /**
   * The group, on one page: what is owed, then everything that happened.
   *
   * Expenses and reimbursements were on separate tabs, so a debt and the
   * payment clearing it never met, and the overview was a third view showing a
   * truncated copy of both. One list, scrolling with the page.
   */
  renderHome() {
    return n`
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
   * Shown once there is enough to look for something in.
   *
   * Judged on everything the group holds, never on what is left after
   * filtering: the box would vanish under your fingers the moment you narrowed
   * it down, taking your own query with it.
   */
  renderSearch() {
    return this.activity().length < ci ? c : n`
      <se-field
        .value=${this.query}
        .label=${""}
        placeholder=${this.localize("search")}
        @value-changed=${(t) => this.query = t.detail.value}
      ></se-field>
    `;
  }
  renderActivityCard() {
    const t = this.matching();
    return t.length === 0 ? n`
        <div class="card">
          <div class="empty">
            ${this.query.trim() ? this.localize("no_match") : this.localize("no_activity")}
          </div>
        </div>
      ` : n`
      <div class="card">
        ${t.map(
      (e) => e.kind === "expense" ? this.renderExpense(e.expense) : this.renderPayment(e.payment)
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
      (e, r) => r.at.localeCompare(e.at) || r.addedAt.localeCompare(e.addedAt)
    );
  }
  renderPayment(t) {
    const e = this.memberById(t.from_member_id), r = this.memberById(t.to_member_id);
    return n`
      <button
        class="item item-button"
        style=${`border-left-color:${e?.color ?? C(t.from_member_id)}`}
        @click=${() => this.openPayment(void 0, t)}
      >
        <se-icon
          icon="mdi:swap-horizontal"
          fallback="⇄"
          .color=${e?.color ?? C(t.from_member_id)}
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">${e?.name ?? "?"} → ${r?.name ?? "?"}</div>
          <!-- Where an expense shows its category: same grid, same reading. -->
          <div class="muted">${this.localize("a_settlement")}</div>
          <div class="muted">
            ${Re(t.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount settled-amount">
            ${R(t.amount, this.group.currency, this.language)}
          </span>
        </div>
      </button>
    `;
  }
  renderExpense(t) {
    const e = this.localize, r = this.memberById(t.paid_by_member_id), i = this.categories.find((s) => s.id === t.category_id);
    return n`
      <button
        class="item item-button"
        style=${`border-left-color:${r?.color ?? C(t.paid_by_member_id)}`}
        @click=${() => this.openExpense(t)}
      >
        ${this.renderAvatar(
      r?.name ?? "?",
      t.paid_by_member_id,
      `${this.localize("paid_by")} ${r?.name ?? "?"}`
    )}
        <div class="info">
          <div class="title">
            ${t.title}
            ${t.description ? n`<span class="note">${t.description}</span>` : c}
          </div>
          <div class="muted">
            ${i ? i.name : e("no_category")}
          </div>
          <div class="muted">
            ${Re(t.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${R(t.amount, t.currency, this.language)}
          </span>
          ${this.renderParticipants(t)}
        </div>
      </button>
    `;
  }
  /** The members actually sharing the expense, stacked like on a receipt. */
  renderParticipants(t) {
    const e = (t.shares ?? []).filter((r) => r.amount !== 0);
    return e.length === 0 ? c : n`
      <div class="stack-avatars">
        ${e.map((r) => {
      const i = this.memberById(r.member_id);
      return n`
            <div
              class="avatar small"
              title=${i?.name ?? "?"}
              style=${`background:${i?.color ?? C(r.member_id)}`}
            >
              ${G(i?.name ?? "?")}
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
  renderAvatar(t, e, r) {
    const i = this.memberById(e);
    return n`
      <div
        class="avatar"
        title=${r ?? t}
        style=${`background:${i?.color ?? C(e)}`}
      >
        ${G(t)}
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
          .meId=${this.meId()}
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
      ` : this.dialog === "statistics" ? n`
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
      ` : this.dialog === "history" ? n`
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
  membersForPayment(t) {
    if (t)
      return this.plusGone([t.from_member_id, t.to_member_id]);
    const e = (this.result?.balances ?? []).filter((r) => r.amount !== 0).map((r) => r.member_id);
    return this.plusGone(e);
  }
  plusGone(t) {
    const e = new Set(t), r = this.pastMembers.filter(
      (i) => e.has(i.id) && !this.members.some((s) => s.id === i.id)
    );
    return [...this.members, ...r];
  }
  async load() {
    this.error = void 0;
    try {
      const [
        t,
        e,
        r,
        i,
        s,
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
      this.group = t, this.groups = e, this.members = r, this.pastMembers = i, this.categories = s, this.expenses = o, this.payments = a, this.result = u;
    } catch (t) {
      this.error = w(t, this.localize), t?.code === "group_not_found" && this.dispatchEvent(
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
    const t = this.query.trim().toLowerCase(), e = this.activity();
    return t ? e.filter((r) => this.haystack(r).includes(t)) : e;
  }
  haystack(t) {
    const e = (s) => this.memberById(s)?.name ?? "";
    if (t.kind === "payment")
      return [
        this.localize("a_settlement"),
        t.payment.description ?? "",
        e(t.payment.from_member_id),
        e(t.payment.to_member_id)
      ].join(" ").toLowerCase();
    const r = t.expense, i = this.categories.find((s) => s.id === r.category_id);
    return [
      r.title,
      r.description ?? "",
      i?.name ?? "",
      e(r.paid_by_member_id)
    ].join(" ").toLowerCase();
  }
  /** What the journal can still send you to: everything not deleted. */
  openable() {
    return /* @__PURE__ */ new Set([
      ...this.expenses.map((t) => t.id),
      ...this.payments.map((t) => t.id)
    ]);
  }
  /** A suggested settlement to record, or a recorded payment to correct. */
  openPayment(t, e) {
    this.prefill = t, this.editedPayment = e, this.dialog = "payment";
  }
  openExpense(t) {
    this.editedExpense = t, this.dialog = "expense";
  }
};
g.styles = [
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
y([
  l({ attribute: !1 })
], g.prototype, "api", 2);
y([
  l({ attribute: !1 })
], g.prototype, "localize", 2);
y([
  l({ type: String })
], g.prototype, "groupId", 2);
y([
  l({ type: String })
], g.prototype, "language", 2);
y([
  l({ type: String })
], g.prototype, "userId", 2);
y([
  d()
], g.prototype, "group", 2);
y([
  d()
], g.prototype, "groups", 2);
y([
  d()
], g.prototype, "menu", 2);
y([
  d()
], g.prototype, "members", 2);
y([
  d()
], g.prototype, "pastMembers", 2);
y([
  d()
], g.prototype, "categories", 2);
y([
  d()
], g.prototype, "expenses", 2);
y([
  d()
], g.prototype, "payments", 2);
y([
  d()
], g.prototype, "result", 2);
y([
  d()
], g.prototype, "query", 2);
y([
  d()
], g.prototype, "loading", 2);
y([
  d()
], g.prototype, "error", 2);
y([
  d()
], g.prototype, "dialog", 2);
y([
  d()
], g.prototype, "prefill", 2);
y([
  d()
], g.prototype, "editedExpense", 2);
y([
  d()
], g.prototype, "editedPayment", 2);
y([
  d()
], g.prototype, "addingPayment", 2);
y([
  d()
], g.prototype, "busy", 2);
y([
  d()
], g.prototype, "confirmingDelete", 2);
g = y([
  f("se-group-page")
], g);
class pi {
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
  updateGroup(e, r) {
    return this.call("update_group", { group_id: e, ...r });
  }
  archiveGroup(e, r) {
    return this.call("archive_group", { group_id: e, archived: r });
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
  listMembers(e, r = !1) {
    return this.call("list_members", {
      group_id: e,
      include_left: r
    });
  }
  listMemberships(e) {
    return this.call("list_memberships", { group_id: e });
  }
  createMember(e) {
    return this.call("create_member", e);
  }
  updateMember(e, r) {
    return this.call("update_member", { member_id: e, ...r });
  }
  /** Put an existing member back into a group they had left. */
  addMemberToGroup(e, r, i) {
    return this.call("add_member_to_group", {
      group_id: e,
      member_id: r,
      ...i ? { role: i } : {}
    });
  }
  removeMemberFromGroup(e, r) {
    return this.call("remove_member_from_group", {
      group_id: e,
      member_id: r
    });
  }
  // Categories
  listCategories(e) {
    return this.call("list_categories", { group_id: e });
  }
  createCategory(e) {
    return this.call("create_category", e);
  }
  updateCategory(e, r) {
    return this.call("update_category", { category_id: e, ...r });
  }
  deleteCategory(e) {
    return this.call("delete_category", { category_id: e });
  }
  // Expenses
  listExpenses(e, r = !0) {
    return this.call("list_expenses", { group_id: e, with_shares: r });
  }
  getExpense(e) {
    return this.call("get_expense", { expense_id: e });
  }
  createExpense(e) {
    return this.call("create_expense", e);
  }
  updateExpense(e, r) {
    return this.call("update_expense", { expense_id: e, ...r });
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
  updatePayment(e, r) {
    return this.call("update_payment", { payment_id: e, ...r });
  }
  deletePayment(e) {
    return this.call("delete_payment", { payment_id: e });
  }
  // Statistics
  /** What the group spent. Leave `year` out for everything, ever. */
  getStatistics(e, r) {
    return this.call("get_statistics", {
      group_id: e,
      ...r ? { year: r } : {}
    });
  }
  // History
  /** What happened in the group, newest first. */
  listRevisions(e, r) {
    return this.call("list_revisions", {
      group_id: e,
      ...r ? { limit: r } : {}
    });
  }
  // `groupId` is required: a deleted expense can no longer say which group it
  // belonged to, and its history is exactly what is being asked for.
  listEntityRevisions(e, r) {
    return this.call("list_entity_revisions", {
      group_id: e,
      entity_id: r
    });
  }
  call(e, r = {}) {
    return this.hass.callWS({
      type: `shared_expenses/${e}`,
      ...r
    });
  }
}
var hi = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, Ie = (t, e, r, i) => {
  for (var s = i > 1 ? void 0 : i ? ui(e, r) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (s = (i ? a(e, r, s) : a(s)) || s);
  return i && s && hi(e, r, s), s;
};
let me = class extends m {
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
      const r = mi();
      if (r) {
        this.groupId = r, this.replacePath(`/group/${r}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (t) => {
      const e = t.detail.groupId;
      this.groupId = e, gi(e), this.replacePath(`/group/${e}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.replacePath("");
    }, this.handleGroupUnavailable = () => {
      bi(), this.goToDashboard();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new pi(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = cr(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
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
  /**
   * Say where you are without adding a step to go back through.
   *
   * replaceState, never pushState: every group opened used to leave an entry
   * behind, so back walked you through them and out via the group list. The
   * URL still describes where you are — a link, a reload, a shared address all
   * land right — it simply is not a trail.
   */
  replacePath(t) {
    const e = this.route?.prefix ?? window.location.pathname.split("/")[1], r = e.startsWith("/") ? e : `/${e}`;
    history.replaceState(null, "", `${r}${t}`);
  }
};
me.styles = _`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
Ie([
  l({ attribute: !1 })
], me.prototype, "hass", 2);
Ie([
  l({ type: Boolean })
], me.prototype, "narrow", 2);
Ie([
  l({ attribute: !1 })
], me.prototype, "route", 2);
Ie([
  d()
], me.prototype, "groupId", 2);
me = Ie([
  f("shared-expenses-panel")
], me);
const rt = "shared_expenses.last_group";
function mi() {
  try {
    return window.localStorage.getItem(rt);
  } catch {
    return null;
  }
}
function gi(t) {
  try {
    window.localStorage.setItem(rt, t);
  } catch {
  }
}
function bi() {
  try {
    window.localStorage.removeItem(rt);
  } catch {
  }
}
export {
  me as SharedExpensesPanel
};
