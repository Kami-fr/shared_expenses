/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis, qe = ke.ShadowRoot && (ke.ShadyCSS === void 0 || ke.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Fe = Symbol(), Je = /* @__PURE__ */ new WeakMap();
let ut = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Fe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (qe && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = Je.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Je.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const wt = (t) => new ut(typeof t == "string" ? t : t + "", void 0, Fe), w = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, o) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[o + 1], t[0]);
  return new ut(s, t, Fe);
}, zt = (t, e) => {
  if (qe) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = ke.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, Qe = qe ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return wt(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: St, defineProperty: Ct, getOwnPropertyDescriptor: Et, getOwnPropertyNames: At, getOwnPropertySymbols: kt, getPrototypeOf: Pt } = Object, Me = globalThis, et = Me.trustedTypes, It = et ? et.emptyScript : "", Ot = Me.reactiveElementPolyfillSupport, ve = (t, e) => t, Pe = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? It : null;
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
} }, Ve = (t, e) => !St(t, e), tt = { attribute: !0, type: String, converter: Pe, reflect: !1, useDefault: !1, hasChanged: Ve };
Symbol.metadata ??= Symbol("metadata"), Me.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let he = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = tt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && Ct(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: o } = Et(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? tt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ve("elementProperties"))) return;
    const e = Pt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ve("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ve("properties"))) {
      const s = this.properties, i = [...At(s), ...kt(s)];
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
      for (const r of i) s.unshift(Qe(r));
    } else e !== void 0 && s.push(Qe(e));
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
    return zt(e, this.constructor.elementStyles), e;
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
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : Pe).toAttribute(s, i.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : Pe;
      this._$Em = r;
      const u = a.fromAttribute(s, o.type);
      this[r] = u ?? this._$Ej?.get(r) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (o = this[e]), i ??= a.getPropertyOptions(e), !((i.hasChanged ?? Ve)(o, s) || i.useDefault && i.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, i)))) return;
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
he.elementStyles = [], he.shadowRootOptions = { mode: "open" }, he[ve("elementProperties")] = /* @__PURE__ */ new Map(), he[ve("finalized")] = /* @__PURE__ */ new Map(), Ot?.({ ReactiveElement: he }), (Me.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const We = globalThis, st = (t) => t, Ie = We.trustedTypes, it = Ie ? Ie.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, mt = "$lit$", ee = `lit$${Math.random().toFixed(9).slice(2)}$`, gt = "?" + ee, Dt = `<${gt}>`, le = document, $e = () => le.createComment(""), _e = (t) => t === null || typeof t != "object" && typeof t != "function", Ye = Array.isArray, Mt = (t) => Ye(t) || typeof t?.[Symbol.iterator] == "function", Ue = `[ 	
\f\r]`, ye = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, rt = /-->/g, ot = />/g, oe = RegExp(`>|${Ue}(?:([^\\s"'>=/]+)(${Ue}*=${Ue}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), at = /'/g, nt = /"/g, bt = /^(?:script|style|textarea|title)$/i, Tt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = Tt(1), ue = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), lt = /* @__PURE__ */ new WeakMap(), ae = le.createTreeWalker(le, 129);
function ft(t, e) {
  if (!Ye(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return it !== void 0 ? it.createHTML(e) : e;
}
const jt = (t, e) => {
  const s = t.length - 1, i = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = ye;
  for (let u = 0; u < s; u++) {
    const p = t[u];
    let b, y, h = -1, E = 0;
    for (; E < p.length && (a.lastIndex = E, y = a.exec(p), y !== null); ) E = a.lastIndex, a === ye ? y[1] === "!--" ? a = rt : y[1] !== void 0 ? a = ot : y[2] !== void 0 ? (bt.test(y[2]) && (r = RegExp("</" + y[2], "g")), a = oe) : y[3] !== void 0 && (a = oe) : a === oe ? y[0] === ">" ? (a = r ?? ye, h = -1) : y[1] === void 0 ? h = -2 : (h = a.lastIndex - y[2].length, b = y[1], a = y[3] === void 0 ? oe : y[3] === '"' ? nt : at) : a === nt || a === at ? a = oe : a === rt || a === ot ? a = ye : (a = oe, r = void 0);
    const z = a === oe && t[u + 1].startsWith("/>") ? " " : "";
    o += a === ye ? p + Dt : h >= 0 ? (i.push(b), p.slice(0, h) + mt + p.slice(h) + ee + z) : p + ee + (h === -2 ? u : z);
  }
  return [ft(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class xe {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let o = 0, a = 0;
    const u = e.length - 1, p = this.parts, [b, y] = jt(e, s);
    if (this.el = xe.createElement(b, i), ae.currentNode = this.el.content, s === 2 || s === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = ae.nextNode()) !== null && p.length < u; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(mt)) {
          const E = y[a++], z = r.getAttribute(h).split(ee), B = /([.?@])?(.*)/.exec(E);
          p.push({ type: 1, index: o, name: B[2], strings: z, ctor: B[1] === "." ? Rt : B[1] === "?" ? Nt : B[1] === "@" ? Bt : Te }), r.removeAttribute(h);
        } else h.startsWith(ee) && (p.push({ type: 6, index: o }), r.removeAttribute(h));
        if (bt.test(r.tagName)) {
          const h = r.textContent.split(ee), E = h.length - 1;
          if (E > 0) {
            r.textContent = Ie ? Ie.emptyScript : "";
            for (let z = 0; z < E; z++) r.append(h[z], $e()), ae.nextNode(), p.push({ type: 2, index: ++o });
            r.append(h[E], $e());
          }
        }
      } else if (r.nodeType === 8) if (r.data === gt) p.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(ee, h + 1)) !== -1; ) p.push({ type: 7, index: o }), h += ee.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const i = le.createElement("template");
    return i.innerHTML = e, i;
  }
}
function me(t, e, s = t, i) {
  if (e === ue) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const o = _e(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = me(t, r._$AS(t, e.values), r, i)), e;
}
class Ut {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? le).importNode(s, !0);
    ae.currentNode = r;
    let o = ae.nextNode(), a = 0, u = 0, p = i[0];
    for (; p !== void 0; ) {
      if (a === p.index) {
        let b;
        p.type === 2 ? b = new Se(o, o.nextSibling, this, e) : p.type === 1 ? b = new p.ctor(o, p.name, p.strings, this, e) : p.type === 6 && (b = new Gt(o, this, e)), this._$AV.push(b), p = i[++u];
      }
      a !== p?.index && (o = ae.nextNode(), a++);
    }
    return ae.currentNode = le, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class Se {
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
    e = me(this, e, s), _e(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== ue && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Mt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && _e(this._$AH) ? this._$AA.nextSibling.data = e : this.T(le.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = xe.createElement(ft(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const o = new Ut(r, this), a = o.u(this.options);
      o.p(s), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let s = lt.get(e.strings);
    return s === void 0 && lt.set(e.strings, s = new xe(e)), s;
  }
  k(e) {
    Ye(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const o of e) r === s.length ? s.push(i = new Se(this.O($e()), this.O($e()), this, this.options)) : i = s[r], i._$AI(o), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = st(e).nextSibling;
      st(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class Te {
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
    if (o === void 0) e = me(this, e, s, 0), a = !_e(e) || e !== this._$AH && e !== ue, a && (this._$AH = e);
    else {
      const u = e;
      let p, b;
      for (e = o[0], p = 0; p < o.length - 1; p++) b = me(this, u[i + p], s, p), b === ue && (b = this._$AH[p]), a ||= !_e(b) || b !== this._$AH[p], b === d ? e = d : e !== d && (e += (b ?? "") + o[p + 1]), this._$AH[p] = b;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Rt extends Te {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class Nt extends Te {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Bt extends Te {
  constructor(e, s, i, r, o) {
    super(e, s, i, r, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = me(this, e, s, 0) ?? d) === ue) return;
    const i = this._$AH, r = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== d && (i === d || r);
    r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Gt {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    me(this, e);
  }
}
const Ht = We.litHtmlPolyfillSupport;
Ht?.(xe, Se), (We.litHtmlVersions ??= []).push("3.3.3");
const Lt = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const o = s?.renderBefore ?? null;
    i._$litPart$ = r = new Se(e.insertBefore($e(), o), o, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ke = globalThis;
let m = class extends he {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Lt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ue;
  }
};
m._$litElement$ = !0, m.finalized = !0, Ke.litElementHydrateSupport?.({ LitElement: m });
const qt = Ke.litElementPolyfillSupport;
qt?.({ LitElement: m });
(Ke.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $ = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ft = { attribute: !0, type: String, converter: Pe, reflect: !1, hasChanged: Ve }, Vt = (t = Ft, e, s) => {
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
  return (e, s) => typeof s == "object" ? Vt(t, e, s) : ((i, r, o) => {
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
var Wt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, je = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Yt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Wt(e, s, r), r;
};
let ge = class extends m {
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
ge.styles = w`
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
je([
  l({ type: String })
], ge.prototype, "variant", 2);
je([
  l({ type: Boolean })
], ge.prototype, "disabled", 2);
je([
  l({ type: String })
], ge.prototype, "icon", 2);
ge = je([
  $("se-button")
], ge);
var Kt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, be = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Xt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Kt(e, s, r), r;
};
let te = class extends m {
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
te.styles = w`
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
be([
  l({ type: String })
], te.prototype, "icon", 2);
be([
  l({ type: String })
], te.prototype, "fallback", 2);
be([
  l({ type: String })
], te.prototype, "color", 2);
be([
  l({ type: Number })
], te.prototype, "size", 2);
be([
  l({ type: Boolean })
], te.prototype, "plain", 2);
te = be([
  $("se-icon")
], te);
var Zt = Object.getOwnPropertyDescriptor, Jt = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Zt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = a(r) || r);
  return r;
};
let Be = class extends m {
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
Be.styles = w`
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
Be = Jt([
  $("se-menu-button")
], Be);
var Qt = Object.defineProperty, es = Object.getOwnPropertyDescriptor, Xe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? es(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Qt(e, s, r), r;
};
let we = class extends m {
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
we.styles = w`
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
Xe([
  l({ type: String })
], we.prototype, "heading", 2);
Xe([
  l({ type: Boolean, reflect: !0 })
], we.prototype, "open", 2);
we = Xe([
  $("se-dialog")
], we);
var ts = Object.defineProperty, ss = Object.getOwnPropertyDescriptor, K = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ss(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ts(e, s, r), r;
};
let G = class extends m {
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
G.styles = w`
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
K([
  l({ type: String })
], G.prototype, "label", 2);
K([
  l({ type: String })
], G.prototype, "value", 2);
K([
  l({ type: String })
], G.prototype, "type", 2);
K([
  l({ type: String })
], G.prototype, "placeholder", 2);
K([
  l({ type: String })
], G.prototype, "suffix", 2);
K([
  l({ type: String })
], G.prototype, "helper", 2);
K([
  l({ type: Boolean })
], G.prototype, "required", 2);
K([
  l({ type: Boolean })
], G.prototype, "disabled", 2);
K([
  l({ type: Boolean })
], G.prototype, "decimal", 2);
G = K([
  $("se-field")
], G);
const Oe = {
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
  tab_settlements: "Reimbursements",
  tab_categories: "Categories",
  current_balance: "Current balance",
  must_receive: "is owed",
  must_pay: "owes",
  you_owe: "You owe",
  you_are_owed: "You are owed",
  owes_you: "owes you",
  you_are_settled: "You are settled up.",
  detailed_balances: "See detailed balances",
  recent_activity: "Recent activity",
  no_activity: "Nothing has happened yet.",
  a_settlement: "Reimbursement",
  see_all: "See all",
  action_add_expense: "Add expense",
  no_settlements: "No reimbursement yet.",
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
  reimbursements: "To reimburse",
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
  payments: "Reimbursements made",
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
}, is = {
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
  tab_settlements: "Remboursements",
  tab_categories: "Catégories",
  current_balance: "Solde actuel",
  must_receive: "doit recevoir",
  must_pay: "doit payer",
  you_owe: "Tu dois",
  you_are_owed: "On te doit",
  owes_you: "te doit",
  you_are_settled: "Tu es à jour.",
  detailed_balances: "Voir les soldes détaillés",
  recent_activity: "Dernière activité",
  no_activity: "Rien ne s'est encore passé.",
  a_settlement: "Remboursement",
  see_all: "Voir tout",
  action_add_expense: "Ajouter dépense",
  no_settlements: "Aucun remboursement pour l'instant.",
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
  reimbursements: "À rembourser",
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
  payments: "Remboursements effectués",
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
}, rs = { en: Oe, fr: is };
function os(t) {
  const e = rs[t.split("-")[0]] ?? Oe;
  return (s) => e[s] ?? Oe[s] ?? s;
}
function x(t, e) {
  const s = t?.code;
  return s && s in Oe ? e(s) : t?.message || e("error_generic");
}
const O = w`
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
var as = Object.defineProperty, ns = Object.getOwnPropertyDescriptor, ie = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ns(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && as(e, s, r), r;
};
let W = class extends m {
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
        this.error = x(t, this.localize);
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
W.styles = O;
ie([
  l({ attribute: !1 })
], W.prototype, "api", 2);
ie([
  l({ attribute: !1 })
], W.prototype, "localize", 2);
ie([
  c()
], W.prototype, "name", 2);
ie([
  c()
], W.prototype, "description", 2);
ie([
  c()
], W.prototype, "currency", 2);
ie([
  c()
], W.prototype, "busy", 2);
ie([
  c()
], W.prototype, "error", 2);
W = ie([
  $("se-group-dialog")
], W);
var ls = Object.defineProperty, cs = Object.getOwnPropertyDescriptor, pe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? cs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ls(e, s, r), r;
};
let Z = class extends m {
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
          ${this.error ? n`<div class="error">${this.error}</div>` : d}

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
      this.error = x(t, this.localize);
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
Z.styles = [
  O,
  w`
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
pe([
  l({ attribute: !1 })
], Z.prototype, "api", 2);
pe([
  l({ attribute: !1 })
], Z.prototype, "localize", 2);
pe([
  c()
], Z.prototype, "groups", 2);
pe([
  c()
], Z.prototype, "loading", 2);
pe([
  c()
], Z.prototype, "error", 2);
pe([
  c()
], Z.prototype, "dialogOpen", 2);
Z = pe([
  $("se-dashboard-page")
], Z);
function U(t, e, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function ne(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const s = Number(e);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function De(t, e) {
  const s = new Intl.DateTimeFormat(e, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function yt() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function Ge(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function vt(t) {
  const e = new Date(t), s = `${e.getMonth() + 1}`.padStart(2, "0"), i = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${s}-${i}`;
}
function ze(t) {
  return (t / 100).toFixed(2);
}
function q(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
const He = [
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
function A(t) {
  let e = 0;
  for (let s = 0; s < t.length; s += 1)
    e = e * 31 + t.charCodeAt(s) >>> 0;
  return He[e % He.length];
}
var ds = Object.defineProperty, ps = Object.getOwnPropertyDescriptor, re = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ps(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ds(e, s, r), r;
};
let Y = class extends m {
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
    ), s = this.settlements.filter((i) => !e.includes(i));
    return n`
      ${e.length === 0 ? n`<div class="settled muted">${this.localize("you_are_settled")}</div>` : e.map((i) => this.renderMine(i))}
      ${s.length === 0 ? d : n`
            <div class="others">
              ${s.map((i) => this.renderTransfer(i))}
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
  /** Your own line, as a sentence: the one thing you came to find out. */
  renderMine(t) {
    const e = this.localize, s = t.from_member_id === this.meId, i = s ? t.to_member_id : t.from_member_id, r = this.memberById(i), o = r?.name ?? "?", a = n`
      <strong class=${`figure ${s ? "negative" : "positive"}`}>
        ${U(t.amount, this.currency, this.language)}
      </strong>
    `;
    return n`
      <div class="mine">
        <div class="avatar" style=${`background:${r?.color ?? A(i)}`}>
          ${q(o)}
        </div>
        <div class="sentence">
          ${s ? n`${e("you_owe")} ${a} ${e("to")} ${o}` : n`${o} ${e("owes_you")} ${a}`}
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
          ${U(t.amount, this.currency, this.language)}
        </span>
      </div>
    `;
  }
  renderParty(t) {
    const e = this.memberById(t), s = e?.name ?? "?";
    return n`
      <span class="party" title=${s}>
        <span
          class="avatar"
          style=${`background:${e?.color ?? A(t)}`}
          >${q(s)}</span
        >
        <span class="name">${s}</span>
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
    const e = t.find((r) => r.member_id === this.meId), [s, i] = e ? [e, t.find((r) => r !== e)] : [...t].sort((r, o) => o.amount - r.amount);
    return n`
      <div class="duel">
        ${this.renderSide(s, !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(i, !0)}
      </div>
    `;
  }
  renderSide(t, e) {
    const s = this.memberById(t.member_id), i = t.amount > 0, r = i ? "positive" : "negative", o = n`
      <div class="avatar" style=${`background:${s?.color ?? A(t.member_id)}`}>
        ${q(s?.name ?? "?")}
      </div>
    `, a = n`
      <div class="body">
        <div class="name">${s?.name ?? "?"}</div>
        <div class=${`verdict ${r}`}>${this.verdict(t, i)}</div>
        <div class=${`figure ${r}`}>
          ${U(Math.abs(t.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return n`
      <div class=${`side ${e ? "right" : ""}`}>
        ${e ? d : o}${a}${e ? o : d}
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
    const s = this.localize;
    return t.member_id === this.meId ? s(e ? "you_are_owed" : "you_owe") : s(e ? "must_receive" : "must_pay");
  }
  renderRow(t) {
    const e = this.memberById(t.member_id), s = t.amount > 0, i = s ? "positive" : "negative";
    return n`
      <div class="row">
        <div class="avatar" style=${`background:${e?.color ?? A(t.member_id)}`}>
          ${q(e?.name ?? "?")}
        </div>
        <span class="name">${e?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${i}`}>
            ${s ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${i}`}>
            ${U(Math.abs(t.amount), this.currency, this.language)}
          </div>
        </div>
      </div>
    `;
  }
  memberById(t) {
    return this.members.find((e) => e.id === t);
  }
};
Y.styles = [
  O,
  w`
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
re([
  l({ attribute: !1 })
], Y.prototype, "localize", 2);
re([
  l({ attribute: !1 })
], Y.prototype, "balances", 2);
re([
  l({ attribute: !1 })
], Y.prototype, "settlements", 2);
re([
  l({ attribute: !1 })
], Y.prototype, "members", 2);
re([
  l({ type: String })
], Y.prototype, "meId", 2);
re([
  l({ type: String })
], Y.prototype, "currency", 2);
re([
  l({ type: String })
], Y.prototype, "language", 2);
Y = re([
  $("se-balance-card")
], Y);
var hs = Object.defineProperty, us = Object.getOwnPropertyDescriptor, Ce = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? us(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && hs(e, s, r), r;
};
let ce = class extends m {
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

        ${He.map(
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
ce.styles = [
  O,
  w`
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
Ce([
  l({ attribute: !1 })
], ce.prototype, "localize", 2);
Ce([
  l({ type: String })
], ce.prototype, "label", 2);
Ce([
  l({ type: String })
], ce.prototype, "value", 2);
Ce([
  l({ type: String })
], ce.prototype, "fallback", 2);
ce = Ce([
  $("se-color-picker")
], ce);
var ms = Object.defineProperty, gs = Object.getOwnPropertyDescriptor, J = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? gs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ms(e, s, r), r;
};
const ct = "/static/mdi/iconList.json", Re = 48;
let Ae = null;
function bs() {
  return Ae === null && (Ae = fetch(ct).then((t) => {
    if (!t.ok)
      throw new Error(`${t.status} on ${ct}`);
    return t.json();
  }).catch((t) => {
    throw Ae = null, t;
  })), Ae;
}
let F = class extends m {
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
        this.icons = await bs();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(t) {
    const e = t.trim().toLowerCase();
    if (e === "") {
      this.suggestions = this.icons.slice(0, Re);
      return;
    }
    const s = [], i = [], r = [];
    for (const o of this.icons)
      if (o.name.startsWith(e) ? s.push(o) : o.name.includes(e) ? i.push(o) : o.keywords?.some((a) => a.includes(e)) && r.push(o), s.length >= Re)
        break;
    this.suggestions = [...s, ...i, ...r].slice(0, Re);
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
F.styles = [
  O,
  w`
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
J([
  l({ attribute: !1 })
], F.prototype, "localize", 2);
J([
  l({ type: String })
], F.prototype, "label", 2);
J([
  l({ type: String })
], F.prototype, "value", 2);
J([
  l({ type: String })
], F.prototype, "color", 2);
J([
  c()
], F.prototype, "icons", 2);
J([
  c()
], F.prototype, "suggestions", 2);
J([
  c()
], F.prototype, "open", 2);
J([
  c()
], F.prototype, "failed", 2);
F = J([
  $("se-icon-picker")
], F);
function Le(t) {
  const { amount: e, payerId: s, memberIds: i } = t;
  if (!Number.isInteger(e) || e <= 0)
    return null;
  const r = [...new Set(i)];
  if (r.length === 0 || !r.includes(s))
    return null;
  const o = t.rule ?? {}, a = fs(o, e);
  if (a === null)
    return null;
  const u = o.participants == null ? r : [...new Set(o.participants)];
  if (u.some((z) => !r.includes(z)))
    return null;
  const p = u.length === 0 ? 0 : a, b = $t(p, u), y = e - p;
  if (y > 0) {
    const z = ys(o.remainder, y, s, r);
    if (z === null)
      return null;
    for (const [B, xt] of Object.entries(z))
      b[B] = (b[B] ?? 0) + xt;
  }
  const h = {};
  for (const [z, B] of Object.entries(b))
    B !== 0 && (h[z] = B);
  return Object.values(h).reduce((z, B) => z + B, 0) === e ? h : null;
}
function fs(t, e) {
  return t.envelope == null ? e : t.envelope < 0 ? null : Math.min(t.envelope, e);
}
function ys(t, e, s, i) {
  const r = t ?? {}, o = r.fixed ?? {};
  for (const [h, E] of Object.entries(o))
    if (!i.includes(h) || E < 0)
      return null;
  const a = r.members == null ? [s] : [...new Set(r.members)];
  if (a.length === 0 || a.some((h) => !i.includes(h)))
    return null;
  const u = {};
  for (const h of a)
    h in o && (u[h] = o[h]);
  const p = Object.values(u).reduce((h, E) => h + E, 0);
  if (p > e)
    return null;
  const b = a.filter((h) => !(h in u));
  if (b.length === 0)
    return p === e ? u : null;
  const y = { ...u };
  for (const [h, E] of Object.entries(
    $t(e - p, b)
  ))
    y[h] = (y[h] ?? 0) + E;
  return y;
}
function $t(t, e) {
  if (t <= 0 || e.length === 0)
    return {};
  const s = Math.floor(t / e.length), i = t % e.length, r = {};
  return e.forEach((o, a) => {
    r[o] = s + (a < i ? 1 : 0);
  }), r;
}
var vs = Object.defineProperty, $s = Object.getOwnPropertyDescriptor, j = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? $s(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && vs(e, s, r), r;
};
const _s = 8542;
let k = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.required = !1, this.enabled = !1, this.envelopeInput = "", this.participants = /* @__PURE__ */ new Set(), this.takers = /* @__PURE__ */ new Set(), this.amounts = {};
  }
  connectedCallback() {
    super.connectedCallback(), this.enabled = this.required || this.rule !== null, this.envelopeInput = this.rule?.envelope != null ? ze(this.rule.envelope) : "", this.participants = new Set(
      this.rule?.participants ?? this.members.map((e) => e.id)
    );
    const t = this.rule?.remainder?.members;
    this.takers = new Set(
      t ?? (this.payerId ? [this.payerId] : [])
    ), this.amounts = Object.fromEntries(
      Object.entries(this.rule?.remainder?.fixed ?? {}).map(([e, s]) => [
        e,
        ze(s)
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
    return this.amount != null && this.amount > 0 ? this.amount : _s;
  }
  renderPanel() {
    const t = this.localize, e = ne(this.envelopeInput), s = this.envelopeInput.trim() !== "" && e !== null && e < this.previewAmount;
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
    const e = this.previewAmount, s = Le({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((r) => r.id),
      rule: this.build()
    });
    if (s === null)
      return n`<div class="preview negative">${this.localize("rule_invalid")}</div>`;
    const i = (r) => U(r, this.currency, this.language);
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
    return !t || this.amount == null ? null : Le({
      amount: this.amount,
      payerId: t.id,
      memberIds: this.members.map((e) => e.id),
      rule: this.build()
    });
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? A(t.id)}`}>
        ${q(t.name)}
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
    this.participants = dt(this.participants, t), this.emit();
  }
  toggleTaker(t) {
    if (this.takers = dt(this.takers, t), !this.takers.has(t)) {
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
    const t = this.envelopeInput.trim(), e = t === "" ? null : ne(t), s = {};
    for (const [i, r] of Object.entries(this.amounts)) {
      if (!this.takers.has(i) || r.trim() === "")
        continue;
      const o = ne(r);
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
k.styles = [
  O,
  w`
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
j([
  l({ attribute: !1 })
], k.prototype, "localize", 2);
j([
  l({ attribute: !1 })
], k.prototype, "members", 2);
j([
  l({ attribute: !1 })
], k.prototype, "rule", 2);
j([
  l({ type: String })
], k.prototype, "currency", 2);
j([
  l({ type: String })
], k.prototype, "language", 2);
j([
  l({ type: Number })
], k.prototype, "amount", 2);
j([
  l({ type: String })
], k.prototype, "payerId", 2);
j([
  l({ type: Boolean })
], k.prototype, "required", 2);
j([
  c()
], k.prototype, "enabled", 2);
j([
  c()
], k.prototype, "envelopeInput", 2);
j([
  c()
], k.prototype, "participants", 2);
j([
  c()
], k.prototype, "takers", 2);
j([
  c()
], k.prototype, "amounts", 2);
k = j([
  $("se-split-rule-editor")
], k);
function dt(t, e) {
  const s = new Set(t);
  return s.has(e) ? s.delete(e) : s.add(e), s;
}
var xs = Object.defineProperty, ws = Object.getOwnPropertyDescriptor, R = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ws(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && xs(e, s, r), r;
};
let P = class extends m {
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
        this.error = x(e, this.localize);
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
    return A(this.category?.id ?? this.name);
  }
};
P.styles = O;
R([
  l({ attribute: !1 })
], P.prototype, "api", 2);
R([
  l({ attribute: !1 })
], P.prototype, "localize", 2);
R([
  l({ attribute: !1 })
], P.prototype, "group", 2);
R([
  l({ attribute: !1 })
], P.prototype, "members", 2);
R([
  l({ attribute: !1 })
], P.prototype, "category", 2);
R([
  l({ type: String })
], P.prototype, "language", 2);
R([
  c()
], P.prototype, "name", 2);
R([
  c()
], P.prototype, "icon", 2);
R([
  c()
], P.prototype, "color", 2);
R([
  c()
], P.prototype, "rule", 2);
R([
  c()
], P.prototype, "busy", 2);
R([
  c()
], P.prototype, "error", 2);
P = R([
  $("se-category-dialog")
], P);
var zs = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, L = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ss(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && zs(e, s, r), r;
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
                ${this.error ? n`<div class="error">${this.error}</div>` : d}
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
          .color=${t.color ?? A(t.id)}
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
    const s = U(e, this.group.currency, this.language);
    return `${this.localize("rule_shares")} ${s}`;
  }
  async load() {
    this.error = void 0;
    try {
      this.categories = await this.api.listCategories(this.group.id);
    } catch (t) {
      this.error = x(t, this.localize);
    } finally {
      this.loading = !1;
    }
  }
};
T.styles = [
  O,
  w`
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
], T.prototype, "api", 2);
L([
  l({ attribute: !1 })
], T.prototype, "localize", 2);
L([
  l({ attribute: !1 })
], T.prototype, "group", 2);
L([
  l({ attribute: !1 })
], T.prototype, "members", 2);
L([
  l({ type: String })
], T.prototype, "language", 2);
L([
  c()
], T.prototype, "categories", 2);
L([
  c()
], T.prototype, "editing", 2);
L([
  c()
], T.prototype, "creating", 2);
L([
  c()
], T.prototype, "loading", 2);
L([
  c()
], T.prototype, "error", 2);
L([
  c()
], T.prototype, "dirty", 2);
T = L([
  $("se-categories-dialog")
], T);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Cs = (t) => (...e) => ({ _$litDirective$: t, values: e });
let Es = class {
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
const As = {}, ks = (t, e = As) => t._$AH = e;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ps = Cs(class extends Es {
  constructor() {
    super(...arguments), this.key = d;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, s]) {
    return e !== this.key && (ks(t), this.key = e), s;
  }
}), Is = {
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
function Os(t, e) {
  const s = Is[t.field];
  return s ? {
    label: e.localize(s),
    before: pt(t.field, t.before, e),
    after: pt(t.field, t.after, e)
  } : null;
}
function pt(t, e, s) {
  return e == null ? null : t === "amount" && typeof e == "number" ? U(e, s.currency, s.language) : t === "expense_date" || t === "payment_date" ? De(String(e), s.language) : t === "category_id" ? s.categories.find((i) => i.id === e)?.name ?? s.localize("no_category") : t === "paid_by_member_id" || t === "from_member_id" || t === "to_member_id" ? _t(String(e), s) : t === "shares" && Ms(e) ? Ds(e, s) : String(e);
}
function Ds(t, e) {
  const s = Object.entries(t).filter(([, i]) => i !== 0);
  return s.length === 0 ? "—" : s.map(
    ([i, r]) => `${_t(i, e)} ${U(r, e.currency, e.language)}`
  ).join(" · ");
}
function _t(t, e) {
  return e.members.find((s) => s.id === t)?.name ?? "?";
}
function Ms(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t) && Object.values(t).every((e) => typeof e == "number");
}
var Ts = Object.defineProperty, js = Object.getOwnPropertyDescriptor, Q = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? js(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Ts(e, s, r), r;
};
let V = class extends m {
  constructor() {
    super(...arguments), this.revisions = [], this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.withSubject = !1;
  }
  render() {
    return this.revisions.length === 0 ? n`<div class="empty">${this.localize("no_history")}</div>` : n`${this.revisions.map((t) => this.renderEntry(t))}`;
  }
  renderEntry(t) {
    const e = this.actorOf(t), s = e?.name ?? this.localize("someone"), i = this.openable?.has(t.entity_id) ?? !1, r = n`
      <div
        class="avatar"
        style=${`background:${e?.color ?? A(t.actor_user_id ?? t.id)}`}
      >
        ${q(s)}
      </div>
      <div class="body">
        <div class="head">
          <span class="who">${s}</span>
          <span class="when">${De(t.at, this.language)}</span>
        </div>
        <div class="what">${this.headline(t)}</div>
        ${this.renderChanges(t)}
      </div>
      ${i ? n`<span class="chevron">›</span>` : d}
    `;
    return i ? n`<button class="entry entry-button" @click=${() => this.pick(t)}>
          ${r}
        </button>` : n`<div class="entry">${r}</div>`;
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
    const e = this.localize, s = t.entity_type === "expense" ? e("the_expense") : e("the_payment"), i = e(`history_${t.action}`), r = this.withSubject && t.entity_label ? ` "${t.entity_label}"` : "";
    return `${i} ${s}${r}`;
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
      return d;
    const e = {
      localize: this.localize,
      members: this.members,
      categories: this.categories,
      currency: this.currency,
      language: this.language
    }, s = t.changes.map((i) => Os(i, e)).filter((i) => i !== null);
    return n`
      ${s.map(
      (i) => n`
          <div class="change">
            <span class="field">${i.label}</span>
            ${i.before === null ? d : n`<span class="before">${i.before}</span>
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
V.styles = [
  O,
  w`
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
Q([
  l({ attribute: !1 })
], V.prototype, "localize", 2);
Q([
  l({ attribute: !1 })
], V.prototype, "revisions", 2);
Q([
  l({ attribute: !1 })
], V.prototype, "members", 2);
Q([
  l({ attribute: !1 })
], V.prototype, "categories", 2);
Q([
  l({ type: String })
], V.prototype, "currency", 2);
Q([
  l({ type: String })
], V.prototype, "language", 2);
Q([
  l({ type: Boolean })
], V.prototype, "withSubject", 2);
Q([
  l({ attribute: !1 })
], V.prototype, "openable", 2);
V = Q([
  $("se-history")
], V);
var Us = Object.defineProperty, Rs = Object.getOwnPropertyDescriptor, N = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Rs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Us(e, s, r), r;
};
let I = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.open = !1, this.busy = !1, this.toggle = async () => {
      if (this.open = !this.open, !(!this.open || this.revisions || this.busy)) {
        this.busy = !0, this.error = void 0;
        try {
          this.revisions = await this.api.listEntityRevisions(this.groupId, this.entityId);
        } catch (t) {
          this.error = x(t, this.localize);
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

        ${this.open ? this.renderBody() : d}
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
I.styles = [
  O,
  w`
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
N([
  l({ attribute: !1 })
], I.prototype, "api", 2);
N([
  l({ attribute: !1 })
], I.prototype, "localize", 2);
N([
  l({ type: String })
], I.prototype, "groupId", 2);
N([
  l({ type: String })
], I.prototype, "entityId", 2);
N([
  l({ attribute: !1 })
], I.prototype, "members", 2);
N([
  l({ attribute: !1 })
], I.prototype, "categories", 2);
N([
  l({ type: String })
], I.prototype, "currency", 2);
N([
  l({ type: String })
], I.prototype, "language", 2);
N([
  c()
], I.prototype, "open", 2);
N([
  c()
], I.prototype, "revisions", 2);
N([
  c()
], I.prototype, "busy", 2);
N([
  c()
], I.prototype, "error", 2);
I = N([
  $("se-entity-history")
], I);
var Ns = Object.defineProperty, Bs = Object.getOwnPropertyDescriptor, fe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Ns(e, s, r), r;
};
let se = class extends m {
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
se.styles = w`
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
fe([
  l({ type: String })
], se.prototype, "label", 2);
fe([
  l({ type: String })
], se.prototype, "value", 2);
fe([
  l({ attribute: !1 })
], se.prototype, "options", 2);
fe([
  l({ type: String })
], se.prototype, "placeholder", 2);
fe([
  l({ type: Boolean })
], se.prototype, "disabled", 2);
se = fe([
  $("se-select")
], se);
var Gs = Object.defineProperty, Hs = Object.getOwnPropertyDescriptor, _ = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Hs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Gs(e, s, r), r;
};
let v = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = yt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.editingSplit = !1, this.showDescription = !1, this.pickCategory = (t) => {
      this.categoryId = t.detail.value, this.rule = null;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const t = ne(this.amountInput), e = this.resolved(t);
      if (t === null || !e)
        return;
      this.busy = !0, this.error = void 0;
      const s = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: Ge(this.date),
        category_id: this.categoryId || null,
        description: this.description.trim() || null,
        shares: Object.entries(e).map(([i, r]) => ({
          member_id: i,
          amount: r
        })),
        // The shares are the truth, but the rule has to travel with them, or
        // reopening the expense could only ever spell the amounts back out.
        split_rule: this.rule ?? this.defaultRule()
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
        this.error = x(i, this.localize);
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
          this.error = x(t, this.localize), this.confirmingDelete = !1;
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
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = ze(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = vt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares(), this.showDescription = this.description !== "";
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
    return t === null || !this.paidBy || this.members.length === 0 ? null : Le({
      amount: t,
      payerId: this.paidBy,
      memberIds: this.members.map((e) => e.id),
      rule: this.rule ?? this.defaultRule()
    });
  }
  render() {
    const t = this.localize, e = ne(this.amountInput), s = this.expense ? t("edit_expense") : t("new_expense");
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
              ` : d}
        </div>

        ${this.confirmingDelete ? n`<div slot="banner" class="warning">
              ${t("confirm_delete_expense")}
            </div>` : d}

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

        ${this.editingSplit ? d : this.renderSummary(t)}

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
        ${this.members.filter((s) => e[s.id]).map(
      (s) => n`
              <span class="who">
                ${s.name}
                <strong>
                  ${U(e[s.id], this.group.currency, this.language)}
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
    return Ps(
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
v.styles = [
  O,
  w`
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
_([
  l({ attribute: !1 })
], v.prototype, "api", 2);
_([
  l({ attribute: !1 })
], v.prototype, "localize", 2);
_([
  l({ attribute: !1 })
], v.prototype, "group", 2);
_([
  l({ attribute: !1 })
], v.prototype, "members", 2);
_([
  l({ attribute: !1 })
], v.prototype, "categories", 2);
_([
  l({ attribute: !1 })
], v.prototype, "expense", 2);
_([
  l({ type: String })
], v.prototype, "meId", 2);
_([
  l({ type: String })
], v.prototype, "language", 2);
_([
  c()
], v.prototype, "expenseTitle", 2);
_([
  c()
], v.prototype, "description", 2);
_([
  c()
], v.prototype, "amountInput", 2);
_([
  c()
], v.prototype, "paidBy", 2);
_([
  c()
], v.prototype, "date", 2);
_([
  c()
], v.prototype, "categoryId", 2);
_([
  c()
], v.prototype, "rule", 2);
_([
  c()
], v.prototype, "busy", 2);
_([
  c()
], v.prototype, "error", 2);
_([
  c()
], v.prototype, "confirmingDelete", 2);
_([
  c()
], v.prototype, "editingSplit", 2);
_([
  c()
], v.prototype, "showDescription", 2);
v = _([
  $("se-expense-dialog")
], v);
var Ls = Object.defineProperty, qs = Object.getOwnPropertyDescriptor, X = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? qs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Ls(e, s, r), r;
};
let H = class extends m {
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
        ${this.error ? n`<div class="error">${this.error}</div>` : d}
        ${this.renderBody()}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${t("close")}
        </se-button>
      </se-dialog>
    `;
  }
  renderBody() {
    return this.error ? d : this.revisions ? n`
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
      this.error = x(t, this.localize);
    }
  }
};
H.styles = O;
X([
  l({ attribute: !1 })
], H.prototype, "api", 2);
X([
  l({ attribute: !1 })
], H.prototype, "localize", 2);
X([
  l({ attribute: !1 })
], H.prototype, "group", 2);
X([
  l({ attribute: !1 })
], H.prototype, "members", 2);
X([
  l({ attribute: !1 })
], H.prototype, "categories", 2);
X([
  l({ attribute: !1 })
], H.prototype, "openable", 2);
X([
  l({ type: String })
], H.prototype, "language", 2);
X([
  c()
], H.prototype, "revisions", 2);
X([
  c()
], H.prototype, "error", 2);
H = X([
  $("se-history-dialog")
], H);
var Fs = Object.defineProperty, Vs = Object.getOwnPropertyDescriptor, D = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Vs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Fs(e, s, r), r;
};
let S = class extends m {
  constructor() {
    super(...arguments), this.haUsers = [], this.members = [], this.memberships = [], this.newName = "", this.loading = !0, this.dirty = !1, this.pastMembers = [], this.addGuest = async () => {
      this.busy = "new", this.error = void 0;
      try {
        await this.api.createMember({
          name: this.newName.trim(),
          group_id: this.groupId
        }), this.newName = "", this.dirty = !0, await this.load();
      } catch (t) {
        this.error = x(t, this.localize);
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
    const i = t?.color ?? A(s);
    return t ? n`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${i}`}
        @click=${() => this.toggleTint(t.id)}
      >
        ${q(e)}
      </button>
    ` : n`
        <div class="avatar" style=${`background:${i}`}>${q(e)}</div>
      `;
  }
  renderPalette(t) {
    return !t || this.tinting !== t.id ? d : n`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${t.color}
          .fallback=${A(t.id)}
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
      this.error = x(s, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  renderGuests() {
    const t = this.localize, e = this.members.filter((i) => i.user_id === null), s = this.pastMembers.filter(
      (i) => i.user_id === null && !e.some((r) => r.id === i.id)
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
              ${this.confirming === i.id ? n`<span class="confirm">${t("confirm_remove")}</span>` : d}
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

        ${s.map(
      (i) => n`
            <div class="row gone">
              <div
                class="avatar"
                style=${`background:${i.color ?? A(i.id)}`}
              >
                ${q(i.name)}
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
      const [t, e, s, i] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listMemberships(this.groupId)
      ]);
      this.haUsers = t, this.members = e, this.pastMembers = s, this.memberships = i;
    } catch (t) {
      this.error = x(t, this.localize);
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
    } catch (s) {
      this.error = x(s, this.localize);
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
      this.error = x(e, this.localize);
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
      this.error = x(e, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
};
S.styles = [
  O,
  w`
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
], S.prototype, "api", 2);
D([
  l({ attribute: !1 })
], S.prototype, "localize", 2);
D([
  l({ type: String })
], S.prototype, "groupId", 2);
D([
  c()
], S.prototype, "haUsers", 2);
D([
  c()
], S.prototype, "members", 2);
D([
  c()
], S.prototype, "memberships", 2);
D([
  c()
], S.prototype, "newName", 2);
D([
  c()
], S.prototype, "loading", 2);
D([
  c()
], S.prototype, "busy", 2);
D([
  c()
], S.prototype, "error", 2);
D([
  c()
], S.prototype, "dirty", 2);
D([
  c()
], S.prototype, "tinting", 2);
D([
  c()
], S.prototype, "confirming", 2);
D([
  c()
], S.prototype, "pastMembers", 2);
S = D([
  $("se-member-dialog")
], S);
var Ws = Object.defineProperty, Ys = Object.getOwnPropertyDescriptor, M = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ys(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Ws(e, s, r), r;
};
let C = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = yt(), this.busy = !1, this.confirmingDelete = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = ne(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = this.payment ? await this.api.updatePayment(this.payment.id, {
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Ge(this.date)
          }) : await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Ge(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-saved", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = x(e, this.localize);
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
          this.error = x(t, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), this.payment) {
      this.fromMember = this.payment.from_member_id, this.toMember = this.payment.to_member_id, this.amountInput = ze(this.payment.amount), this.date = vt(this.payment.payment_date);
      return;
    }
    if (this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = ze(this.settlement.amount);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const t = this.localize, e = ne(this.amountInput), s = this.members.map((r) => ({ value: r.id, label: r.name })), i = this.payment ? t("edit_payment") : t("new_payment");
    return n`
      <se-dialog open heading=${i} @dialog-closed=${this.cancel}>
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
                ${U(e, this.group.currency, this.language)}
              </div>` : d}

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
              ` : d}
        </div>

        ${this.confirmingDelete ? n`<div slot="banner" class="warning">
              ${t("confirm_delete_payment")}
            </div>` : d}

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
            ` : d}
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
C.styles = O;
M([
  l({ attribute: !1 })
], C.prototype, "api", 2);
M([
  l({ attribute: !1 })
], C.prototype, "localize", 2);
M([
  l({ attribute: !1 })
], C.prototype, "group", 2);
M([
  l({ attribute: !1 })
], C.prototype, "members", 2);
M([
  l({ attribute: !1 })
], C.prototype, "payment", 2);
M([
  l({ attribute: !1 })
], C.prototype, "settlement", 2);
M([
  l({ type: String })
], C.prototype, "language", 2);
M([
  c()
], C.prototype, "fromMember", 2);
M([
  c()
], C.prototype, "toMember", 2);
M([
  c()
], C.prototype, "amountInput", 2);
M([
  c()
], C.prototype, "date", 2);
M([
  c()
], C.prototype, "busy", 2);
M([
  c()
], C.prototype, "error", 2);
M([
  c()
], C.prototype, "confirmingDelete", 2);
C = M([
  $("se-payment-dialog")
], C);
var Ks = Object.defineProperty, Xs = Object.getOwnPropertyDescriptor, f = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Xs(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && Ks(e, s, r), r;
};
const ht = 5, Ne = ["overview", "expenses", "settlements"], Zs = 60, Js = 24;
let g = class extends m {
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
        this.error = x(t, this.localize), this.confirmingDelete = !1;
      } finally {
        this.busy = !1;
      }
    }, this.startSwipe = (t) => {
      const e = t.touches[0];
      if (t.touches.length !== 1 || e.clientX < Js) {
        this.swipeFrom = void 0;
        return;
      }
      this.swipeFrom = { x: e.clientX, y: e.clientY };
    }, this.endSwipe = (t) => {
      const e = this.swipeFrom;
      if (this.swipeFrom = void 0, !e)
        return;
      const s = t.changedTouches[0], i = s.clientX - e.x, r = s.clientY - e.y;
      if (Math.abs(i) < Zs || Math.abs(i) < Math.abs(r) * 2)
        return;
      const o = Ne.indexOf(this.tab) + (i < 0 ? 1 : -1);
      o >= 0 && o < Ne.length && (this.tab = Ne[o]);
    }, this.cancelSwipe = () => {
      this.swipeFrom = void 0;
    }, this.add = () => {
      if (this.tab === "settlements") {
        this.openPayment();
        return;
      }
      this.openExpense();
    }, this.openFromHistory = (t) => {
      const { entityType: e, entityId: s } = t.detail;
      if (e === "expense") {
        const r = this.expenses.find((o) => o.id === s);
        r && this.openExpense(r);
        return;
      }
      const i = this.payments.find((r) => r.id === s);
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
          this.error = x(t, this.localize);
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
          ${this.group.archived ? n`<div class="banner">${t("archived_hint")}</div>` : d}

          ${this.error ? n`<div class="error">${this.error}</div>` : d}

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
            ${e.archived ? n`<span class="archived-tag">${t("archived")}</span>` : d}
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
      ${this.menu ? this.renderMenu() : d}
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
      <button role="menuitem" @click=${() => this.openDialog("member")}>
        ${t("members")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("categories")}>
        ${t("categories")}
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
          ${this.activity().length > ht ? n`<button class="link" @click=${() => this.tab = "expenses"}>
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
    return t.length === 0 ? n`<div class="empty">${this.localize("no_activity")}</div>` : t.slice(0, ht).map(
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
    const e = this.memberById(t.from_member_id), s = this.memberById(t.to_member_id);
    return n`
      <button
        class="item item-button"
        style=${`border-left-color:${e?.color ?? A(t.from_member_id)}`}
        @click=${() => this.openPayment(void 0, t)}
      >
        <se-icon
          icon="mdi:swap-horizontal"
          fallback="⇄"
          .color=${e?.color ?? A(t.from_member_id)}
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">${e?.name ?? "?"} → ${s?.name ?? "?"}</div>
          <!-- Where an expense shows its category: same grid, same reading. -->
          <div class="muted">${this.localize("a_settlement")}</div>
          <div class="muted">
            ${De(t.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount settled-amount">
            ${U(t.amount, this.group.currency, this.language)}
          </span>
        </div>
      </button>
    `;
  }
  renderSettlement(t) {
    const e = this.localize, s = this.memberById(t.from_member_id), i = this.memberById(t.to_member_id);
    return n`
      <div class="settlement">
        <span>
          <strong>${s?.name ?? "?"}</strong> ${e("owes")}
          <strong class="amount">
            ${U(t.amount, this.group.currency, this.language)}
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
    `;
  }
  renderExpense(t) {
    const e = this.localize, s = this.memberById(t.paid_by_member_id), i = this.categories.find((r) => r.id === t.category_id);
    return n`
      <button
        class="item item-button"
        style=${`border-left-color:${s?.color ?? A(t.paid_by_member_id)}`}
        @click=${() => this.openExpense(t)}
      >
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
            ${De(t.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${U(t.amount, t.currency, this.language)}
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
              style=${`background:${i?.color ?? A(s.member_id)}`}
            >
              ${q(i?.name ?? "?")}
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
  renderAvatar(t, e, s) {
    const i = this.memberById(e);
    return n`
      <div
        class="avatar"
        title=${s ?? t}
        style=${`background:${i?.color ?? A(e)}`}
      >
        ${q(t)}
      </div>
    `;
  }
  renderDialog() {
    return !this.dialog || !this.group ? d : this.dialog === "expense" ? n`
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
    const e = (this.result?.balances ?? []).filter((s) => s.amount !== 0).map((s) => s.member_id);
    return this.plusGone(e);
  }
  plusGone(t) {
    const e = new Set(t), s = this.pastMembers.filter(
      (i) => e.has(i.id) && !this.members.some((r) => r.id === i.id)
    );
    return [...this.members, ...s];
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
      this.error = x(t, this.localize), t?.code === "group_not_found" && this.dispatchEvent(
        new CustomEvent("group-unavailable", { bubbles: !0, composed: !0 })
      );
    } finally {
      this.loading = !1;
    }
  }
  addLabel() {
    return this.tab === "settlements" ? this.localize("new_payment") : this.localize("action_add_expense");
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
  O,
  w`
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
f([
  l({ attribute: !1 })
], g.prototype, "api", 2);
f([
  l({ attribute: !1 })
], g.prototype, "localize", 2);
f([
  l({ type: String })
], g.prototype, "groupId", 2);
f([
  l({ type: String })
], g.prototype, "language", 2);
f([
  l({ type: String })
], g.prototype, "userId", 2);
f([
  c()
], g.prototype, "group", 2);
f([
  c()
], g.prototype, "groups", 2);
f([
  c()
], g.prototype, "menu", 2);
f([
  c()
], g.prototype, "members", 2);
f([
  c()
], g.prototype, "pastMembers", 2);
f([
  c()
], g.prototype, "categories", 2);
f([
  c()
], g.prototype, "expenses", 2);
f([
  c()
], g.prototype, "payments", 2);
f([
  c()
], g.prototype, "result", 2);
f([
  c()
], g.prototype, "tab", 2);
f([
  c()
], g.prototype, "loading", 2);
f([
  c()
], g.prototype, "error", 2);
f([
  c()
], g.prototype, "dialog", 2);
f([
  c()
], g.prototype, "prefill", 2);
f([
  c()
], g.prototype, "editedExpense", 2);
f([
  c()
], g.prototype, "editedPayment", 2);
f([
  c()
], g.prototype, "busy", 2);
f([
  c()
], g.prototype, "confirmingDelete", 2);
g = f([
  $("se-group-page")
], g);
class Qs {
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
  /** Put an existing member back into a group they had left. */
  addMemberToGroup(e, s, i) {
    return this.call("add_member_to_group", {
      group_id: e,
      member_id: s,
      ...i ? { role: i } : {}
    });
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
  updatePayment(e, s) {
    return this.call("update_payment", { payment_id: e, ...s });
  }
  deletePayment(e) {
    return this.call("delete_payment", { payment_id: e });
  }
  // History
  /** What happened in the group, newest first. */
  listRevisions(e, s) {
    return this.call("list_revisions", {
      group_id: e,
      ...s ? { limit: s } : {}
    });
  }
  // `groupId` is required: a deleted expense can no longer say which group it
  // belonged to, and its history is exactly what is being asked for.
  listEntityRevisions(e, s) {
    return this.call("list_entity_revisions", {
      group_id: e,
      entity_id: s
    });
  }
  call(e, s = {}) {
    return this.hass.callWS({
      type: `shared_expenses/${e}`,
      ...s
    });
  }
}
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, Ee = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ti(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (i ? a(e, s, r) : a(r)) || r);
  return i && r && ei(e, s, r), r;
};
let de = class extends m {
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
      const s = si();
      if (s) {
        this.groupId = s, this.pushPath(`/group/${s}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (t) => {
      const e = t.detail.groupId;
      this.groupId = e, ii(e), this.pushPath(`/group/${e}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.pushPath("");
    }, this.handleGroupUnavailable = () => {
      ri(), this.goToDashboard();
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
      return n``;
    const t = os(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
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
de.styles = w`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
Ee([
  l({ attribute: !1 })
], de.prototype, "hass", 2);
Ee([
  l({ type: Boolean })
], de.prototype, "narrow", 2);
Ee([
  l({ attribute: !1 })
], de.prototype, "route", 2);
Ee([
  c()
], de.prototype, "groupId", 2);
de = Ee([
  $("shared-expenses-panel")
], de);
const Ze = "shared_expenses.last_group";
function si() {
  try {
    return window.localStorage.getItem(Ze);
  } catch {
    return null;
  }
}
function ii(t) {
  try {
    window.localStorage.setItem(Ze, t);
  } catch {
  }
}
function ri() {
  try {
    window.localStorage.removeItem(Ze);
  } catch {
  }
}
export {
  de as SharedExpensesPanel
};
