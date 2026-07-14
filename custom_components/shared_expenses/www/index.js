/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = globalThis, ue = oe.ShadowRoot && (oe.ShadyCSS === void 0 || oe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, me = Symbol(), ye = /* @__PURE__ */ new WeakMap();
let ze = class {
  constructor(e, s, r) {
    if (this._$cssResult$ = !0, r !== me) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ue && e === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (e = ye.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && ye.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Be = (t) => new ze(typeof t == "string" ? t : t + "", void 0, me), M = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((r, i, o) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[o + 1], t[0]);
  return new ze(s, t, me);
}, He = (t, e) => {
  if (ue) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const r = document.createElement("style"), i = oe.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, t.appendChild(r);
  }
}, _e = ue ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const r of e.cssRules) s += r.cssText;
  return Be(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: qe, defineProperty: Le, getOwnPropertyDescriptor: Ge, getOwnPropertyNames: Fe, getOwnPropertySymbols: Ve, getPrototypeOf: We } = Object, pe = globalThis, xe = pe.trustedTypes, Ke = xe ? xe.emptyScript : "", Ze = pe.reactiveElementPolyfillSupport, Y = (t, e) => t, ae = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ke : null;
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
} }, ge = (t, e) => !qe(t, e), we = { attribute: !0, type: String, converter: ae, reflect: !1, useDefault: !1, hasChanged: ge };
Symbol.metadata ??= Symbol("metadata"), pe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let q = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = we) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, s);
      i !== void 0 && Le(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, r) {
    const { get: i, set: o } = Ge(this.prototype, e) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: i, set(a) {
      const h = i?.call(this);
      o?.call(this, a), this.requestUpdate(e, h, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? we;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Y("elementProperties"))) return;
    const e = We(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Y("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Y("properties"))) {
      const s = this.properties, r = [...Fe(s), ...Ve(s)];
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
      for (const i of r) s.unshift(_e(i));
    } else e !== void 0 && s.push(_e(e));
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
    return He(e, this.constructor.elementStyles), e;
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
      const o = (r.converter?.toAttribute !== void 0 ? r.converter : ae).toAttribute(s, r.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : ae;
      this._$Em = i;
      const h = a.fromAttribute(s, o.type);
      this[i] = h ?? this._$Ej?.get(i) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, s, r, i = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (i === !1 && (o = this[e]), r ??= a.getPropertyOptions(e), !((r.hasChanged ?? ge)(o, s) || r.useDefault && r.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, r)))) return;
      this.C(e, s, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: r, reflect: i, wrapped: o }, a) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? s ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, o] of r) {
        const { wrapped: a } = o, h = this[i];
        a !== !0 || this._$AL.has(i) || h === void 0 || this.C(i, void 0, o, h);
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
q.elementStyles = [], q.shadowRootOptions = { mode: "open" }, q[Y("elementProperties")] = /* @__PURE__ */ new Map(), q[Y("finalized")] = /* @__PURE__ */ new Map(), Ze?.({ ReactiveElement: q }), (pe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const be = globalThis, Ae = (t) => t, ne = be.trustedTypes, Ce = ne ? ne.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Te = "$lit$", T = `lit$${Math.random().toFixed(9).slice(2)}$`, De = "?" + T, Je = `<${De}>`, j = document, Q = () => j.createComment(""), X = (t) => t === null || typeof t != "object" && typeof t != "function", fe = Array.isArray, Ye = (t) => fe(t) || typeof t?.[Symbol.iterator] == "function", he = `[ 	
\f\r]`, J = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ee = /-->/g, Se = />/g, I = RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Pe = /'/g, Oe = /"/g, ke = /^(?:script|style|textarea|title)$/i, Qe = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = Qe(1), G = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), U = j.createTreeWalker(j, 129);
function Ie(t, e) {
  if (!fe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ce !== void 0 ? Ce.createHTML(e) : e;
}
const Xe = (t, e) => {
  const s = t.length - 1, r = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = J;
  for (let h = 0; h < s; h++) {
    const c = t[h];
    let g, v, u = -1, S = 0;
    for (; S < c.length && (a.lastIndex = S, v = a.exec(c), v !== null); ) S = a.lastIndex, a === J ? v[1] === "!--" ? a = Ee : v[1] !== void 0 ? a = Se : v[2] !== void 0 ? (ke.test(v[2]) && (i = RegExp("</" + v[2], "g")), a = I) : v[3] !== void 0 && (a = I) : a === I ? v[0] === ">" ? (a = i ?? J, u = -1) : v[1] === void 0 ? u = -2 : (u = a.lastIndex - v[2].length, g = v[1], a = v[3] === void 0 ? I : v[3] === '"' ? Oe : Pe) : a === Oe || a === Pe ? a = I : a === Ee || a === Se ? a = J : (a = I, i = void 0);
    const z = a === I && t[h + 1].startsWith("/>") ? " " : "";
    o += a === J ? c + Je : u >= 0 ? (r.push(g), c.slice(0, u) + Te + c.slice(u) + T + z) : c + T + (u === -2 ? h : z);
  }
  return [Ie(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class ee {
  constructor({ strings: e, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let o = 0, a = 0;
    const h = e.length - 1, c = this.parts, [g, v] = Xe(e, s);
    if (this.el = ee.createElement(g, r), U.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = U.nextNode()) !== null && c.length < h; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(Te)) {
          const S = v[a++], z = i.getAttribute(u).split(T), ie = /([.?@])?(.*)/.exec(S);
          c.push({ type: 1, index: o, name: ie[2], strings: z, ctor: ie[1] === "." ? tt : ie[1] === "?" ? st : ie[1] === "@" ? rt : ce }), i.removeAttribute(u);
        } else u.startsWith(T) && (c.push({ type: 6, index: o }), i.removeAttribute(u));
        if (ke.test(i.tagName)) {
          const u = i.textContent.split(T), S = u.length - 1;
          if (S > 0) {
            i.textContent = ne ? ne.emptyScript : "";
            for (let z = 0; z < S; z++) i.append(u[z], Q()), U.nextNode(), c.push({ type: 2, index: ++o });
            i.append(u[S], Q());
          }
        }
      } else if (i.nodeType === 8) if (i.data === De) c.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(T, u + 1)) !== -1; ) c.push({ type: 7, index: o }), u += T.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const r = j.createElement("template");
    return r.innerHTML = e, r;
  }
}
function F(t, e, s = t, r) {
  if (e === G) return e;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const o = X(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(t), i._$AT(t, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (e = F(t, i._$AS(t, e.values), i, r)), e;
}
class et {
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
    const { el: { content: s }, parts: r } = this._$AD, i = (e?.creationScope ?? j).importNode(s, !0);
    U.currentNode = i;
    let o = U.nextNode(), a = 0, h = 0, c = r[0];
    for (; c !== void 0; ) {
      if (a === c.index) {
        let g;
        c.type === 2 ? g = new se(o, o.nextSibling, this, e) : c.type === 1 ? g = new c.ctor(o, c.name, c.strings, this, e) : c.type === 6 && (g = new it(o, this, e)), this._$AV.push(g), c = r[++h];
      }
      a !== c?.index && (o = U.nextNode(), a++);
    }
    return U.currentNode = j, i;
  }
  p(e) {
    let s = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, s), s += r.strings.length - 2) : r._$AI(e[s])), s++;
  }
}
class se {
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
    e = F(this, e, s), X(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== G && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ye(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && X(this._$AH) ? this._$AA.nextSibling.data = e : this.T(j.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = ee.createElement(Ie(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const o = new et(i, this), a = o.u(this.options);
      o.p(s), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let s = Me.get(e.strings);
    return s === void 0 && Me.set(e.strings, s = new ee(e)), s;
  }
  k(e) {
    fe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const o of e) i === s.length ? s.push(r = new se(this.O(Q()), this.O(Q()), this, this.options)) : r = s[i], r._$AI(o), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const r = Ae(e).nextSibling;
      Ae(e).remove(), e = r;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ce {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, r, i, o) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = o, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = d;
  }
  _$AI(e, s = this, r, i) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = F(this, e, s, 0), a = !X(e) || e !== this._$AH && e !== G, a && (this._$AH = e);
    else {
      const h = e;
      let c, g;
      for (e = o[0], c = 0; c < o.length - 1; c++) g = F(this, h[r + c], s, c), g === G && (g = this._$AH[c]), a ||= !X(g) || g !== this._$AH[c], g === d ? e = d : e !== d && (e += (g ?? "") + o[c + 1]), this._$AH[c] = g;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class tt extends ce {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class st extends ce {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class rt extends ce {
  constructor(e, s, r, i, o) {
    super(e, s, r, i, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = F(this, e, s, 0) ?? d) === G) return;
    const r = this._$AH, i = e === d && r !== d || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, o = e !== d && (r === d || i);
    i && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class it {
  constructor(e, s, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    F(this, e);
  }
}
const ot = be.litHtmlPolyfillSupport;
ot?.(ee, se), (be.litHtmlVersions ??= []).push("3.3.3");
const at = (t, e, s) => {
  const r = s?.renderBefore ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const o = s?.renderBefore ?? null;
    r._$litPart$ = i = new se(e.insertBefore(Q(), o), o, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ve = globalThis;
class $ extends q {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = at(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return G;
  }
}
$._$litElement$ = !0, $.finalized = !0, ve.litElementHydrateSupport?.({ LitElement: $ });
const nt = ve.litElementPolyfillSupport;
nt?.({ LitElement: $ });
(ve.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = { attribute: !0, type: String, converter: ae, reflect: !1, hasChanged: ge }, pt = (t = lt, e, s) => {
  const { kind: r, metadata: i } = s;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(s.name, t), r === "accessor") {
    const { name: a } = s;
    return { set(h) {
      const c = e.get.call(this);
      e.set.call(this, h), this.requestUpdate(a, c, t, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(a, void 0, t, h), h;
    } };
  }
  if (r === "setter") {
    const { name: a } = s;
    return function(h) {
      const c = this[a];
      e.call(this, h), this.requestUpdate(a, c, t, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function l(t) {
  return (e, s) => typeof s == "object" ? pt(t, e, s) : ((r, i, o) => {
    const a = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, r), a ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function p(t) {
  return l({ ...t, state: !0, attribute: !1 });
}
var ct = Object.defineProperty, dt = Object.getOwnPropertyDescriptor, de = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? dt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && ct(e, s, i), i;
};
let V = class extends $ {
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
V.styles = M`
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
de([
  l({ type: String })
], V.prototype, "variant", 2);
de([
  l({ type: Boolean })
], V.prototype, "disabled", 2);
de([
  l({ type: String })
], V.prototype, "icon", 2);
V = de([
  A("se-button")
], V);
var ht = Object.defineProperty, ut = Object.getOwnPropertyDescriptor, $e = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ut(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && ht(e, s, i), i;
};
let te = class extends $ {
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
te.styles = M`
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
$e([
  l({ type: String })
], te.prototype, "heading", 2);
$e([
  l({ type: Boolean, reflect: !0 })
], te.prototype, "open", 2);
te = $e([
  A("se-dialog")
], te);
var mt = Object.defineProperty, gt = Object.getOwnPropertyDescriptor, E = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? gt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && mt(e, s, i), i;
};
let w = class extends $ {
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
w.styles = M`
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
E([
  l({ type: String })
], w.prototype, "label", 2);
E([
  l({ type: String })
], w.prototype, "value", 2);
E([
  l({ type: String })
], w.prototype, "type", 2);
E([
  l({ type: String })
], w.prototype, "placeholder", 2);
E([
  l({ type: String })
], w.prototype, "suffix", 2);
E([
  l({ type: String })
], w.prototype, "helper", 2);
E([
  l({ type: Boolean })
], w.prototype, "required", 2);
E([
  l({ type: Boolean })
], w.prototype, "disabled", 2);
E([
  l({ type: Boolean })
], w.prototype, "decimal", 2);
w = E([
  A("se-field")
], w);
const le = {
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
  tab_balances: "Balances",
  tab_expenses: "Expenses",
  tab_members: "Members",
  balance_settled: "Everything is settled.",
  owes: "owes",
  to: "to",
  reimbursements: "Reimbursements",
  settle_up: "Settle up",
  expenses: "Expenses",
  no_expenses: "No expense yet.",
  new_expense: "New expense",
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
}, bt = {
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
  tab_balances: "Soldes",
  tab_expenses: "Dépenses",
  tab_members: "Membres",
  balance_settled: "Tout est réglé.",
  owes: "doit",
  to: "à",
  reimbursements: "Remboursements",
  settle_up: "Rembourser",
  expenses: "Dépenses",
  no_expenses: "Aucune dépense pour l'instant.",
  new_expense: "Nouvelle dépense",
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
}, ft = { en: le, fr: bt };
function vt(t) {
  const e = ft[t.split("-")[0]] ?? le;
  return (s) => e[s] ?? le[s] ?? s;
}
function W(t, e) {
  const s = t?.code;
  return s && s in le ? e(s) : t?.message || e("error_generic");
}
const K = M`
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
var $t = Object.defineProperty, yt = Object.getOwnPropertyDescriptor, k = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? yt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && $t(e, s, i), i;
};
let C = class extends $ {
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
        this.error = W(t, this.localize);
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
C.styles = K;
k([
  l({ attribute: !1 })
], C.prototype, "api", 2);
k([
  l({ attribute: !1 })
], C.prototype, "localize", 2);
k([
  p()
], C.prototype, "name", 2);
k([
  p()
], C.prototype, "description", 2);
k([
  p()
], C.prototype, "currency", 2);
k([
  p()
], C.prototype, "busy", 2);
k([
  p()
], C.prototype, "error", 2);
C = k([
  A("se-group-dialog")
], C);
var _t = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, B = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? xt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && _t(e, s, i), i;
};
let P = class extends $ {
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
      this.error = W(t, this.localize);
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
P.styles = [
  K,
  M`
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
B([
  l({ attribute: !1 })
], P.prototype, "api", 2);
B([
  l({ attribute: !1 })
], P.prototype, "localize", 2);
B([
  p()
], P.prototype, "groups", 2);
B([
  p()
], P.prototype, "loading", 2);
B([
  p()
], P.prototype, "error", 2);
B([
  p()
], P.prototype, "dialogOpen", 2);
P = B([
  A("se-dashboard-page")
], P);
var wt = Object.defineProperty, At = Object.getOwnPropertyDescriptor, Z = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? At(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && wt(e, s, i), i;
};
let D = class extends $ {
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
D.styles = M`
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
Z([
  l({ type: String })
], D.prototype, "label", 2);
Z([
  l({ type: String })
], D.prototype, "value", 2);
Z([
  l({ attribute: !1 })
], D.prototype, "options", 2);
Z([
  l({ type: String })
], D.prototype, "placeholder", 2);
Z([
  l({ type: Boolean })
], D.prototype, "disabled", 2);
D = Z([
  A("se-select")
], D);
function N(t, e, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function Ct(t, e, s) {
  const r = N(Math.abs(t), e, s);
  return t > 0 ? `+${r}` : t < 0 ? `-${r}` : r;
}
function L(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const s = Number(e);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function Et(t, e) {
  return new Intl.DateTimeFormat(e, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
}
function Ue() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function Ne(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function je(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
function Re(t) {
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
var St = Object.defineProperty, Pt = Object.getOwnPropertyDescriptor, f = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Pt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && St(e, s, i), i;
};
let m = class extends $ {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.expenseTitle = "", this.amountInput = "", this.paidBy = "", this.date = Ue(), this.categoryId = "", this.mode = "rule", this.participants = /* @__PURE__ */ new Set(), this.customAmounts = {}, this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = L(this.amountInput);
      if (t === null)
        return;
      this.busy = !0, this.error = void 0;
      const e = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: Ne(this.date),
        category_id: this.categoryId || null
      };
      this.mode === "equal" ? e.split_rule = {
        participants: [...this.participants],
        fixed: {},
        cap: null,
        remainder: "payer"
      } : this.mode === "custom" && (e.shares = this.members.map((s) => ({
        member_id: s.id,
        amount: L(this.customAmounts[s.id] ?? "") ?? 0
      })).filter((s) => s.amount !== 0));
      try {
        const s = await this.api.createExpense(e);
        this.dispatchEvent(
          new CustomEvent("expense-created", {
            detail: { expense: s },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (s) {
        this.error = W(s, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), !this.paidBy && this.members.length > 0 && (this.paidBy = this.members[0].id), this.participants = new Set(this.members.map((t) => t.id));
  }
  render() {
    const t = this.localize, e = L(this.amountInput);
    return n`
      <se-dialog open heading=${t("new_expense")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : d}

          <se-field
            .label=${t("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(s) => this.expenseTitle = s.detail.value}
          ></se-field>

          <se-field
            .label=${t("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            required
            decimal
            placeholder="85,42"
            @value-changed=${(s) => this.amountInput = s.detail.value}
          ></se-field>

          <se-select
            .label=${t("paid_by")}
            .value=${this.paidBy}
            .options=${this.members.map((s) => ({ value: s.id, label: s.name }))}
            @value-changed=${(s) => this.paidBy = s.detail.value}
          ></se-select>

          <se-field
            .label=${t("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(s) => this.date = s.detail.value}
          ></se-field>

          <se-select
            .label=${t("category")}
            .value=${this.categoryId}
            .placeholder=${t("no_category")}
            .options=${this.categories.map((s) => ({ value: s.id, label: s.name }))}
            @value-changed=${(s) => this.categoryId = s.detail.value}
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

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${t("cancel")}
        </se-button>
        <se-button slot="actions" ?disabled=${this.busy || !this.isValid(e)} @click=${this.submit}>
          ${t("create")}
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
        (r) => n`
              <div class="member-row">
                <input
                  type="checkbox"
                  .checked=${this.participants.has(r.id)}
                  @change=${() => this.toggleParticipant(r.id)}
                />
                ${this.renderAvatar(r)}
                <span class="name">${r.name}</span>
                <span class="amount muted">${this.equalShare(t, r.id)}</span>
              </div>
            `
      )}
        </div>
      `;
    const s = this.customTotal();
    return n`
      <div>
        ${this.members.map(
      (r) => n`
            <div class="member-row">
              ${this.renderAvatar(r)}
              <span class="name">${r.name}</span>
              <se-field
                .value=${this.customAmounts[r.id] ?? ""}
                .suffix=${this.group.currency}
                decimal
                placeholder="0"
                @value-changed=${(i) => this.setCustom(r.id, i.detail.value)}
              ></se-field>
            </div>
          `
    )}
        <div class="total">
          <span class="muted">Total</span>
          <span class=${`amount ${t !== null && s !== t ? "negative" : ""}`}>
            ${N(s, this.group.currency, this.language)}
            ${t !== null ? ` / ${N(t, this.group.currency, this.language)}` : ""}
          </span>
        </div>
      </div>
    `;
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? Re(t.id)}`}>
        ${je(t.name)}
      </div>
    `;
  }
  equalShare(t, e) {
    if (t === null || !this.participants.has(e))
      return "";
    const s = this.members.map((h) => h.id).filter((h) => this.participants.has(h)), r = s.indexOf(e);
    if (r < 0 || s.length === 0)
      return "";
    const i = Math.floor(t / s.length), o = t % s.length, a = i + (r < o ? 1 : 0);
    return N(a, this.group.currency, this.language);
  }
  customTotal() {
    return Object.values(this.customAmounts).reduce(
      (t, e) => t + (L(e) ?? 0),
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
  K,
  M`
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
  l({ type: String })
], m.prototype, "language", 2);
f([
  p()
], m.prototype, "expenseTitle", 2);
f([
  p()
], m.prototype, "amountInput", 2);
f([
  p()
], m.prototype, "paidBy", 2);
f([
  p()
], m.prototype, "date", 2);
f([
  p()
], m.prototype, "categoryId", 2);
f([
  p()
], m.prototype, "mode", 2);
f([
  p()
], m.prototype, "participants", 2);
f([
  p()
], m.prototype, "customAmounts", 2);
f([
  p()
], m.prototype, "busy", 2);
f([
  p()
], m.prototype, "error", 2);
m = f([
  A("se-expense-dialog")
], m);
var Ot = Object.defineProperty, Mt = Object.getOwnPropertyDescriptor, H = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Mt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Ot(e, s, i), i;
};
let O = class extends $ {
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
        this.error = W(t, this.localize);
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
          ${this.error ? n`<div class="error">${this.error}</div>` : d}
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
O.styles = K;
H([
  l({ attribute: !1 })
], O.prototype, "api", 2);
H([
  l({ attribute: !1 })
], O.prototype, "localize", 2);
H([
  l({ type: String })
], O.prototype, "groupId", 2);
H([
  p()
], O.prototype, "name", 2);
H([
  p()
], O.prototype, "busy", 2);
H([
  p()
], O.prototype, "error", 2);
O = H([
  A("se-member-dialog")
], O);
var zt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, x = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Tt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && zt(e, s, i), i;
};
let y = class extends $ {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = Ue(), this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = L(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Ne(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-created", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = W(e, this.localize);
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
    const t = this.localize, e = L(this.amountInput), s = this.members.map((r) => ({ value: r.id, label: r.name }));
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
                ${N(e, this.group.currency, this.language)}
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
y.styles = K;
x([
  l({ attribute: !1 })
], y.prototype, "api", 2);
x([
  l({ attribute: !1 })
], y.prototype, "localize", 2);
x([
  l({ attribute: !1 })
], y.prototype, "group", 2);
x([
  l({ attribute: !1 })
], y.prototype, "members", 2);
x([
  l({ attribute: !1 })
], y.prototype, "settlement", 2);
x([
  l({ type: String })
], y.prototype, "language", 2);
x([
  p()
], y.prototype, "fromMember", 2);
x([
  p()
], y.prototype, "toMember", 2);
x([
  p()
], y.prototype, "amountInput", 2);
x([
  p()
], y.prototype, "date", 2);
x([
  p()
], y.prototype, "busy", 2);
x([
  p()
], y.prototype, "error", 2);
y = x([
  A("se-payment-dialog")
], y);
var Dt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, _ = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? kt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Dt(e, s, i), i;
};
let b = class extends $ {
  constructor() {
    super(...arguments), this.language = "en", this.members = [], this.categories = [], this.expenses = [], this.tab = "balances", this.loading = !0, this.closeDialog = () => {
      this.dialog = void 0, this.prefill = void 0;
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

        ${this.error ? n`<div class="error">${this.error}</div>` : d}

        <div class="tabs" role="tablist">
          ${this.renderTab("balances", t("tab_balances"))}
          ${this.renderTab("expenses", t("tab_expenses"))}
          ${this.renderTab("members", t("tab_members"))}
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
    return this.tab === "balances" ? this.renderBalances() : this.tab === "expenses" ? this.renderExpenses() : this.renderMembers();
  }
  renderBalances() {
    const t = this.localize, e = this.group.currency, s = this.result?.settlements ?? [];
    return n`
      <div class="card">
        ${(this.result?.balances ?? []).map((r) => {
      const i = this.memberById(r.member_id);
      return n`
            <div class="item">
              ${this.renderAvatar(i?.name ?? "?", r.member_id)}
              <div class="info"><div class="title">${i?.name ?? "?"}</div></div>
              <span
                class=${`amount ${r.amount > 0 ? "positive" : r.amount < 0 ? "negative" : "muted"}`}
              >
                ${Ct(r.amount, e, this.language)}
              </span>
            </div>
          `;
    })}
      </div>

      <div class="card">
        <h3 class="section-title">${t("reimbursements")}</h3>
        ${s.length === 0 ? n`<div class="empty">${t("balance_settled")}</div>` : s.map((r) => this.renderSettlement(r))}
      </div>

      <div class="actions">
        <se-button variant="text" @click=${() => this.openPayment()}>
          ${t("new_payment")}
        </se-button>
      </div>
    `;
  }
  renderSettlement(t) {
    const e = this.localize, s = this.memberById(t.from_member_id), r = this.memberById(t.to_member_id);
    return n`
      <div class="settlement">
        <span>
          <strong>${s?.name ?? "?"}</strong> ${e("owes")}
          <strong class="amount">
            ${N(t.amount, this.group.currency, this.language)}
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
        <se-button @click=${() => this.dialog = "expense"}>
          ${t("new_expense")}
        </se-button>
      </div>
    `;
  }
  renderExpense(t) {
    const e = this.memberById(t.paid_by_member_id), s = this.categories.find((r) => r.id === t.category_id);
    return n`
      <div class="item">
        ${this.renderAvatar(e?.name ?? "?", t.paid_by_member_id)}
        <div class="info">
          <div class="title">${t.title}</div>
          <div class="muted">
            ${this.localize("paid_by")} ${e?.name ?? "?"} ·
            ${Et(t.expense_date, this.language)}
            ${s ? n` · ${s.name}` : d}
          </div>
        </div>
        <span class="amount">
          ${N(t.amount, t.currency, this.language)}
        </span>
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
      <div class="avatar" style=${`background:${s?.color ?? Re(e)}`}>
        ${je(t)}
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
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @expense-created=${this.handleChanged}
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
      const [t, e, s, r, i] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.getBalances(this.groupId)
      ]);
      this.group = t, this.members = e, this.categories = s, this.expenses = r, this.result = i;
    } catch (t) {
      this.error = W(t, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  openPayment(t) {
    this.prefill = t, this.dialog = "payment";
  }
};
b.styles = [
  K,
  M`
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
    `
];
_([
  l({ attribute: !1 })
], b.prototype, "api", 2);
_([
  l({ attribute: !1 })
], b.prototype, "localize", 2);
_([
  l({ type: String })
], b.prototype, "groupId", 2);
_([
  l({ type: String })
], b.prototype, "language", 2);
_([
  p()
], b.prototype, "group", 2);
_([
  p()
], b.prototype, "members", 2);
_([
  p()
], b.prototype, "categories", 2);
_([
  p()
], b.prototype, "expenses", 2);
_([
  p()
], b.prototype, "result", 2);
_([
  p()
], b.prototype, "tab", 2);
_([
  p()
], b.prototype, "loading", 2);
_([
  p()
], b.prototype, "error", 2);
_([
  p()
], b.prototype, "dialog", 2);
_([
  p()
], b.prototype, "prefill", 2);
b = _([
  A("se-group-page")
], b);
class It {
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
var Ut = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, re = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Nt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (i = (r ? a(e, s, i) : a(i)) || i);
  return r && i && Ut(e, s, i), i;
};
let R = class extends $ {
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
    this.hass && !this.api && (this.api = new It(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = vt(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
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
R.styles = M`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
re([
  l({ attribute: !1 })
], R.prototype, "hass", 2);
re([
  l({ type: Boolean })
], R.prototype, "narrow", 2);
re([
  l({ attribute: !1 })
], R.prototype, "route", 2);
re([
  p()
], R.prototype, "groupId", 2);
R = re([
  A("shared-expenses-panel")
], R);
export {
  R as SharedExpensesPanel
};
