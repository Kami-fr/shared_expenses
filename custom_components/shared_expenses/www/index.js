/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ve = globalThis, Pe = ve.ShadowRoot && (ve.ShadyCSS === void 0 || ve.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ze = Symbol(), Te = /* @__PURE__ */ new WeakMap();
let Ze = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== ze) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (Pe && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = Te.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Te.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const rt = (t) => new Ze(typeof t == "string" ? t : t + "", void 0, ze), C = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, a) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[a + 1], t[0]);
  return new Ze(s, t, ze);
}, at = (t, e) => {
  if (Pe) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = ve.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, je = Pe ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return rt(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ot, defineProperty: nt, getOwnPropertyDescriptor: lt, getOwnPropertyNames: ct, getOwnPropertySymbols: pt, getPrototypeOf: dt } = Object, we = globalThis, Ue = we.trustedTypes, ht = Ue ? Ue.emptyScript : "", ut = we.reactiveElementPolyfillSupport, le = (t, e) => t, ye = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? ht : null;
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
} }, Oe = (t, e) => !ot(t, e), Ne = { attribute: !0, type: String, converter: ye, reflect: !1, useDefault: !1, hasChanged: Oe };
Symbol.metadata ??= Symbol("metadata"), we.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ee = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Ne) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && nt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: a } = lt(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Ne;
  }
  static _$Ei() {
    if (this.hasOwnProperty(le("elementProperties"))) return;
    const e = dt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(le("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(le("properties"))) {
      const s = this.properties, i = [...ct(s), ...pt(s)];
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
      for (const r of i) s.unshift(je(r));
    } else e !== void 0 && s.push(je(e));
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
    return at(e, this.constructor.elementStyles), e;
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
      const a = (i.converter?.toAttribute !== void 0 ? i.converter : ye).toAttribute(s, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = i.getPropertyOptions(r), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : ye;
      this._$Em = r;
      const h = o.fromAttribute(s, a.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (a = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? Oe)(a, s) || i.useDefault && i.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
ee.elementStyles = [], ee.shadowRootOptions = { mode: "open" }, ee[le("elementProperties")] = /* @__PURE__ */ new Map(), ee[le("finalized")] = /* @__PURE__ */ new Map(), ut?.({ ReactiveElement: ee }), (we.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis, Re = (t) => t, $e = ke.trustedTypes, Be = $e ? $e.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Je = "$lit$", H = `lit$${Math.random().toFixed(9).slice(2)}$`, Xe = "?" + H, mt = `<${Xe}>`, Q = document, ce = () => Q.createComment(""), pe = (t) => t === null || typeof t != "object" && typeof t != "function", De = Array.isArray, gt = (t) => De(t) || typeof t?.[Symbol.iterator] == "function", Se = `[ 	
\f\r]`, ne = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, qe = /-->/g, He = />/g, W = RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Le = /'/g, Ge = /"/g, Ye = /^(?:script|style|textarea|title)$/i, bt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = bt(1), te = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Fe = /* @__PURE__ */ new WeakMap(), K = Q.createTreeWalker(Q, 129);
function et(t, e) {
  if (!De(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Be !== void 0 ? Be.createHTML(e) : e;
}
const ft = (t, e) => {
  const s = t.length - 1, i = [];
  let r, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ne;
  for (let h = 0; h < s; h++) {
    const d = t[h];
    let b, _, u = -1, j = 0;
    for (; j < d.length && (o.lastIndex = j, _ = o.exec(d), _ !== null); ) j = o.lastIndex, o === ne ? _[1] === "!--" ? o = qe : _[1] !== void 0 ? o = He : _[2] !== void 0 ? (Ye.test(_[2]) && (r = RegExp("</" + _[2], "g")), o = W) : _[3] !== void 0 && (o = W) : o === W ? _[0] === ">" ? (o = r ?? ne, u = -1) : _[1] === void 0 ? u = -2 : (u = o.lastIndex - _[2].length, b = _[1], o = _[3] === void 0 ? W : _[3] === '"' ? Ge : Le) : o === Ge || o === Le ? o = W : o === qe || o === He ? o = ne : (o = W, r = void 0);
    const q = o === W && t[h + 1].startsWith("/>") ? " " : "";
    a += o === ne ? d + mt : u >= 0 ? (i.push(b), d.slice(0, u) + Je + d.slice(u) + H + q) : d + H + (u === -2 ? h : q);
  }
  return [et(t, a + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class de {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let a = 0, o = 0;
    const h = e.length - 1, d = this.parts, [b, _] = ft(e, s);
    if (this.el = de.createElement(b, i), K.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = K.nextNode()) !== null && d.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(Je)) {
          const j = _[o++], q = r.getAttribute(u).split(H), be = /([.?@])?(.*)/.exec(j);
          d.push({ type: 1, index: a, name: be[2], strings: q, ctor: be[1] === "." ? yt : be[1] === "?" ? $t : be[1] === "@" ? _t : Ce }), r.removeAttribute(u);
        } else u.startsWith(H) && (d.push({ type: 6, index: a }), r.removeAttribute(u));
        if (Ye.test(r.tagName)) {
          const u = r.textContent.split(H), j = u.length - 1;
          if (j > 0) {
            r.textContent = $e ? $e.emptyScript : "";
            for (let q = 0; q < j; q++) r.append(u[q], ce()), K.nextNode(), d.push({ type: 2, index: ++a });
            r.append(u[j], ce());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Xe) d.push({ type: 2, index: a });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(H, u + 1)) !== -1; ) d.push({ type: 7, index: a }), u += H.length - 1;
      }
      a++;
    }
  }
  static createElement(e, s) {
    const i = Q.createElement("template");
    return i.innerHTML = e, i;
  }
}
function se(t, e, s = t, i) {
  if (e === te) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const a = pe(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== a && (r?._$AO?.(!1), a === void 0 ? r = void 0 : (r = new a(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = se(t, r._$AS(t, e.values), r, i)), e;
}
class vt {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? Q).importNode(s, !0);
    K.currentNode = r;
    let a = K.nextNode(), o = 0, h = 0, d = i[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let b;
        d.type === 2 ? b = new ue(a, a.nextSibling, this, e) : d.type === 1 ? b = new d.ctor(a, d.name, d.strings, this, e) : d.type === 6 && (b = new xt(a, this, e)), this._$AV.push(b), d = i[++h];
      }
      o !== d?.index && (a = K.nextNode(), o++);
    }
    return K.currentNode = Q, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class ue {
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
    e = se(this, e, s), pe(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== te && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : gt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && pe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Q.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = de.createElement(et(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const a = new vt(r, this), o = a.u(this.options);
      a.p(s), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let s = Fe.get(e.strings);
    return s === void 0 && Fe.set(e.strings, s = new de(e)), s;
  }
  k(e) {
    De(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const a of e) r === s.length ? s.push(i = new ue(this.O(ce()), this.O(ce()), this, this.options)) : i = s[r], i._$AI(a), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = Re(e).nextSibling;
      Re(e).remove(), e = i;
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
  constructor(e, s, i, r, a) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = s, this._$AM = r, this.options = a, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(e, s = this, i, r) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) e = se(this, e, s, 0), o = !pe(e) || e !== this._$AH && e !== te, o && (this._$AH = e);
    else {
      const h = e;
      let d, b;
      for (e = a[0], d = 0; d < a.length - 1; d++) b = se(this, h[i + d], s, d), b === te && (b = this._$AH[d]), o ||= !pe(b) || b !== this._$AH[d], b === p ? e = p : e !== p && (e += (b ?? "") + a[d + 1]), this._$AH[d] = b;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class yt extends Ce {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class $t extends Ce {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class _t extends Ce {
  constructor(e, s, i, r, a) {
    super(e, s, i, r, a), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = se(this, e, s, 0) ?? p) === te) return;
    const i = this._$AH, r = e === p && i !== p || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, a = e !== p && (i === p || r);
    r && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class xt {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    se(this, e);
  }
}
const wt = ke.litHtmlPolyfillSupport;
wt?.(de, ue), (ke.litHtmlVersions ??= []).push("3.3.3");
const Ct = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const a = s?.renderBefore ?? null;
    i._$litPart$ = r = new ue(e.insertBefore(ce(), a), a, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ie = globalThis;
class m extends ee {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ct(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return te;
  }
}
m._$litElement$ = !0, m.finalized = !0, Ie.litElementHydrateSupport?.({ LitElement: m });
const Et = Ie.litElementPolyfillSupport;
Et?.({ LitElement: m });
(Ie.litElementVersions ??= []).push("4.2.2");
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
const St = { attribute: !0, type: String, converter: ye, reflect: !1, hasChanged: Oe }, At = (t = St, e, s) => {
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
  return (e, s) => typeof s == "object" ? At(t, e, s) : ((i, r, a) => {
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
var Pt = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, Ee = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? zt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Pt(e, s, r), r;
};
let ie = class extends m {
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
ie.styles = C`
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
], ie.prototype, "variant", 2);
Ee([
  l({ type: Boolean })
], ie.prototype, "disabled", 2);
Ee([
  l({ type: String })
], ie.prototype, "icon", 2);
ie = Ee([
  $("se-button")
], ie);
var Ot = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, Me = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? kt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ot(e, s, r), r;
};
let he = class extends m {
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
he.styles = C`
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
Me([
  l({ type: String })
], he.prototype, "heading", 2);
Me([
  l({ type: Boolean, reflect: !0 })
], he.prototype, "open", 2);
he = Me([
  $("se-dialog")
], he);
var Dt = Object.defineProperty, It = Object.getOwnPropertyDescriptor, I = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? It(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Dt(e, s, r), r;
};
let S = class extends m {
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
S.styles = C`
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
I([
  l({ type: String })
], S.prototype, "label", 2);
I([
  l({ type: String })
], S.prototype, "value", 2);
I([
  l({ type: String })
], S.prototype, "type", 2);
I([
  l({ type: String })
], S.prototype, "placeholder", 2);
I([
  l({ type: String })
], S.prototype, "suffix", 2);
I([
  l({ type: String })
], S.prototype, "helper", 2);
I([
  l({ type: Boolean })
], S.prototype, "required", 2);
I([
  l({ type: Boolean })
], S.prototype, "disabled", 2);
I([
  l({ type: Boolean })
], S.prototype, "decimal", 2);
S = I([
  $("se-field")
], S);
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
}, Mt = {
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
}, Tt = { en: _e, fr: Mt };
function jt(t) {
  const e = Tt[t.split("-")[0]] ?? _e;
  return (s) => e[s] ?? _e[s] ?? s;
}
function L(t, e) {
  const s = t?.code;
  return s && s in _e ? e(s) : t?.message || e("error_generic");
}
const M = C`
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
var Ut = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, V = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Nt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ut(e, s, r), r;
};
let D = class extends m {
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
        this.error = L(t, this.localize);
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
D.styles = M;
V([
  l({ attribute: !1 })
], D.prototype, "api", 2);
V([
  l({ attribute: !1 })
], D.prototype, "localize", 2);
V([
  c()
], D.prototype, "name", 2);
V([
  c()
], D.prototype, "description", 2);
V([
  c()
], D.prototype, "currency", 2);
V([
  c()
], D.prototype, "busy", 2);
V([
  c()
], D.prototype, "error", 2);
D = V([
  $("se-group-dialog")
], D);
var Rt = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, X = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Rt(e, s, r), r;
};
let N = class extends m {
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
      this.error = L(t, this.localize);
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
N.styles = [
  M,
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
X([
  l({ attribute: !1 })
], N.prototype, "api", 2);
X([
  l({ attribute: !1 })
], N.prototype, "localize", 2);
X([
  c()
], N.prototype, "groups", 2);
X([
  c()
], N.prototype, "loading", 2);
X([
  c()
], N.prototype, "error", 2);
X([
  c()
], N.prototype, "dialogOpen", 2);
N = X([
  $("se-dashboard-page")
], N);
function z(t, e, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function k(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const s = Number(e);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function Ve(t, e) {
  return new Intl.DateTimeFormat(e, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
}
function tt() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function st(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function qt(t) {
  const e = new Date(t), s = `${e.getMonth() + 1}`.padStart(2, "0"), i = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${s}-${i}`;
}
function We(t) {
  return (t / 100).toFixed(2);
}
function re(t) {
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
  for (let i = 0; i < t.length; i += 1)
    s = s * 31 + t.charCodeAt(i) >>> 0;
  return e[s % e.length];
}
var Ht = Object.defineProperty, Lt = Object.getOwnPropertyDescriptor, ae = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Lt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ht(e, s, r), r;
};
let G = class extends m {
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
      <div class="avatar" style=${`background:${s?.color ?? U(t.member_id)}`}>
        ${re(s?.name ?? "?")}
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
        <div class="avatar" style=${`background:${e?.color ?? U(t.member_id)}`}>
          ${re(e?.name ?? "?")}
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
G.styles = [
  M,
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
ae([
  l({ attribute: !1 })
], G.prototype, "localize", 2);
ae([
  l({ attribute: !1 })
], G.prototype, "balances", 2);
ae([
  l({ attribute: !1 })
], G.prototype, "members", 2);
ae([
  l({ type: String })
], G.prototype, "currency", 2);
ae([
  l({ type: String })
], G.prototype, "language", 2);
G = ae([
  $("se-balance-card")
], G);
var Gt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, me = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ft(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Gt(e, s, r), r;
};
let Z = class extends m {
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
Z.styles = C`
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
me([
  l({ type: String })
], Z.prototype, "icon", 2);
me([
  l({ type: String })
], Z.prototype, "fallback", 2);
me([
  l({ type: String })
], Z.prototype, "color", 2);
me([
  l({ type: Number })
], Z.prototype, "size", 2);
Z = me([
  $("se-icon")
], Z);
var Vt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, it = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Wt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Vt(e, s, r), r;
};
let xe = class extends m {
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
xe.styles = C`
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
it([
  l({ attribute: !1 })
], xe.prototype, "actions", 2);
xe = it([
  $("se-quick-actions")
], xe);
var Kt = Object.defineProperty, Qt = Object.getOwnPropertyDescriptor, B = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Kt(e, s, r), r;
};
const Ke = "/static/mdi/iconList.json", Ae = 48;
let fe = null;
function Zt() {
  return fe === null && (fe = fetch(Ke).then((t) => {
    if (!t.ok)
      throw new Error(`${t.status} on ${Ke}`);
    return t.json();
  }).catch((t) => {
    throw fe = null, t;
  })), fe;
}
let O = class extends m {
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
      ${this.label ? n`<label>${this.label}</label>` : p}

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
        ${this.value ? n`<button class="clear" @click=${this.clear} aria-label="×">×</button>` : p}
      </div>

      ${this.renderHint()} ${this.open ? this.renderGrid() : p}
    `;
  }
  renderHint() {
    return this.failed ? n`<div class="hint">${this.localize("icon_list_failed")}</div>` : n`<div class="hint">${this.localize("icon_hint")}</div>`;
  }
  renderGrid() {
    return this.suggestions.length === 0 ? p : n`
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
        this.icons = await Zt();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(t) {
    const e = t.trim().toLowerCase();
    if (e === "") {
      this.suggestions = this.icons.slice(0, Ae);
      return;
    }
    const s = [], i = [], r = [];
    for (const a of this.icons)
      if (a.name.startsWith(e) ? s.push(a) : a.name.includes(e) ? i.push(a) : a.keywords?.some((o) => o.includes(e)) && r.push(a), s.length >= Ae)
        break;
    this.suggestions = [...s, ...i, ...r].slice(0, Ae);
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
O.styles = [
  M,
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
B([
  l({ attribute: !1 })
], O.prototype, "localize", 2);
B([
  l({ type: String })
], O.prototype, "label", 2);
B([
  l({ type: String })
], O.prototype, "value", 2);
B([
  l({ type: String })
], O.prototype, "color", 2);
B([
  c()
], O.prototype, "icons", 2);
B([
  c()
], O.prototype, "suggestions", 2);
B([
  c()
], O.prototype, "open", 2);
B([
  c()
], O.prototype, "failed", 2);
O = B([
  $("se-icon-picker")
], O);
var Jt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, T = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Xt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Jt(e, s, r), r;
};
let A = class extends m {
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
    const t = k(this.capInput);
    if (t === null || t <= 0 || this.participants.size === 0)
      return p;
    const e = 8542, s = Object.values(this.fixedInputs).reduce(
      (d, b) => d + (k(b) ?? 0),
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
      <div class="avatar" style=${`background:${t.color ?? U(t.id)}`}>
        ${re(t.name)}
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
      const a = k(r);
      a !== null && a > 0 && (t[i] = a);
    }
    const e = k(this.capInput);
    return {
      participants: this.participants.size === this.members.length ? null : [...this.participants],
      fixed: t,
      cap: e !== null && e > 0 ? e : null,
      remainder: "payer"
    };
  }
};
A.styles = [
  M,
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
T([
  l({ attribute: !1 })
], A.prototype, "localize", 2);
T([
  l({ attribute: !1 })
], A.prototype, "members", 2);
T([
  l({ attribute: !1 })
], A.prototype, "rule", 2);
T([
  l({ type: String })
], A.prototype, "currency", 2);
T([
  l({ type: String })
], A.prototype, "language", 2);
T([
  c()
], A.prototype, "enabled", 2);
T([
  c()
], A.prototype, "participants", 2);
T([
  c()
], A.prototype, "capInput", 2);
T([
  c()
], A.prototype, "fixedInputs", 2);
A = T([
  $("se-split-rule-editor")
], A);
var Yt = Object.defineProperty, es = Object.getOwnPropertyDescriptor, P = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? es(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Yt(e, s, r), r;
};
let w = class extends m {
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
        this.error = L(e, this.localize);
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
w.styles = M;
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
  $("se-category-dialog")
], w);
var ts = Object.defineProperty, ss = Object.getOwnPropertyDescriptor, oe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ss(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ts(e, s, r), r;
};
let F = class extends m {
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
F.styles = C`
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
oe([
  l({ type: String })
], F.prototype, "label", 2);
oe([
  l({ type: String })
], F.prototype, "value", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "options", 2);
oe([
  l({ type: String })
], F.prototype, "placeholder", 2);
oe([
  l({ type: Boolean })
], F.prototype, "disabled", 2);
F = oe([
  $("se-select")
], F);
var is = Object.defineProperty, rs = Object.getOwnPropertyDescriptor, v = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? rs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && is(e, s, r), r;
};
let g = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.expenseTitle = "", this.amountInput = "", this.paidBy = "", this.date = tt(), this.categoryId = "", this.mode = "rule", this.participants = /* @__PURE__ */ new Set(), this.customAmounts = {}, this.busy = !1, this.confirmingDelete = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = k(this.amountInput);
      if (t === null)
        return;
      this.busy = !0, this.error = void 0;
      const e = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: st(this.date),
        category_id: this.categoryId || null
      };
      this.mode === "equal" ? e.split_rule = {
        participants: [...this.participants],
        fixed: {},
        cap: null,
        remainder: "payer"
      } : this.mode === "custom" && (e.shares = this.members.map((s) => ({
        member_id: s.id,
        amount: k(this.customAmounts[s.id] ?? "") ?? 0
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
        this.error = L(s, this.localize);
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
          this.error = L(t, this.localize), this.confirmingDelete = !1;
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
    this.expenseTitle = this.expense.title, this.amountInput = We(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = qt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.mode = "custom", this.customAmounts = Object.fromEntries(
      (this.expense.shares ?? []).map((t) => [
        t.member_id,
        We(t.amount)
      ])
    );
  }
  render() {
    const t = this.localize, e = k(this.amountInput), s = this.expense ? t("edit_expense") : t("new_expense");
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
      <div class="avatar" style=${`background:${t.color ?? U(t.id)}`}>
        ${re(t.name)}
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
      (t, e) => t + (k(e) ?? 0),
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
g.styles = [
  M,
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
v([
  l({ attribute: !1 })
], g.prototype, "api", 2);
v([
  l({ attribute: !1 })
], g.prototype, "localize", 2);
v([
  l({ attribute: !1 })
], g.prototype, "group", 2);
v([
  l({ attribute: !1 })
], g.prototype, "members", 2);
v([
  l({ attribute: !1 })
], g.prototype, "categories", 2);
v([
  l({ attribute: !1 })
], g.prototype, "expense", 2);
v([
  l({ type: String })
], g.prototype, "language", 2);
v([
  c()
], g.prototype, "expenseTitle", 2);
v([
  c()
], g.prototype, "amountInput", 2);
v([
  c()
], g.prototype, "paidBy", 2);
v([
  c()
], g.prototype, "date", 2);
v([
  c()
], g.prototype, "categoryId", 2);
v([
  c()
], g.prototype, "mode", 2);
v([
  c()
], g.prototype, "participants", 2);
v([
  c()
], g.prototype, "customAmounts", 2);
v([
  c()
], g.prototype, "busy", 2);
v([
  c()
], g.prototype, "error", 2);
v([
  c()
], g.prototype, "confirmingDelete", 2);
g = v([
  $("se-expense-dialog")
], g);
var as = Object.defineProperty, os = Object.getOwnPropertyDescriptor, Y = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? os(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && as(e, s, r), r;
};
let R = class extends m {
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
        this.error = L(t, this.localize);
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
R.styles = M;
Y([
  l({ attribute: !1 })
], R.prototype, "api", 2);
Y([
  l({ attribute: !1 })
], R.prototype, "localize", 2);
Y([
  l({ type: String })
], R.prototype, "groupId", 2);
Y([
  c()
], R.prototype, "name", 2);
Y([
  c()
], R.prototype, "busy", 2);
Y([
  c()
], R.prototype, "error", 2);
R = Y([
  $("se-member-dialog")
], R);
var ns = Object.defineProperty, ls = Object.getOwnPropertyDescriptor, E = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ls(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ns(e, s, r), r;
};
let x = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = tt(), this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = k(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: st(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-created", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = L(e, this.localize);
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
    const t = this.localize, e = k(this.amountInput), s = this.members.map((i) => ({ value: i.id, label: i.name }));
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
x.styles = M;
E([
  l({ attribute: !1 })
], x.prototype, "api", 2);
E([
  l({ attribute: !1 })
], x.prototype, "localize", 2);
E([
  l({ attribute: !1 })
], x.prototype, "group", 2);
E([
  l({ attribute: !1 })
], x.prototype, "members", 2);
E([
  l({ attribute: !1 })
], x.prototype, "settlement", 2);
E([
  l({ type: String })
], x.prototype, "language", 2);
E([
  c()
], x.prototype, "fromMember", 2);
E([
  c()
], x.prototype, "toMember", 2);
E([
  c()
], x.prototype, "amountInput", 2);
E([
  c()
], x.prototype, "date", 2);
E([
  c()
], x.prototype, "busy", 2);
E([
  c()
], x.prototype, "error", 2);
x = E([
  $("se-payment-dialog")
], x);
var cs = Object.defineProperty, ps = Object.getOwnPropertyDescriptor, y = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ps(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && cs(e, s, r), r;
};
const Qe = 4;
let f = class extends m {
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
          ${this.expenses.length > Qe ? n`<button class="link" @click=${() => this.tab = "expenses"}>
                ${t("see_all")}
              </button>` : p}
        </div>
        ${this.expenses.length === 0 ? n`<div class="empty">${t("no_expenses")}</div>` : this.expenses.slice(0, Qe).map((e) => this.renderExpense(e))}
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
          <div class="muted">${Ve(t.payment_date, this.language)}</div>
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
    const e = this.memberById(t.paid_by_member_id), s = this.categories.find((r) => r.id === t.category_id), i = e?.color ?? U(t.paid_by_member_id);
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
            ${Ve(t.expense_date, this.language)}
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
              style=${`background:${i?.color ?? U(s.member_id)}`}
            >
              ${re(i?.name ?? "?")}
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
      <div class="avatar" style=${`background:${s?.color ?? U(e)}`}>
        ${re(t)}
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
      this.error = L(t, this.localize);
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
f.styles = [
  M,
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
], f.prototype, "api", 2);
y([
  l({ attribute: !1 })
], f.prototype, "localize", 2);
y([
  l({ type: String })
], f.prototype, "groupId", 2);
y([
  l({ type: String })
], f.prototype, "language", 2);
y([
  c()
], f.prototype, "group", 2);
y([
  c()
], f.prototype, "members", 2);
y([
  c()
], f.prototype, "categories", 2);
y([
  c()
], f.prototype, "expenses", 2);
y([
  c()
], f.prototype, "payments", 2);
y([
  c()
], f.prototype, "result", 2);
y([
  c()
], f.prototype, "tab", 2);
y([
  c()
], f.prototype, "loading", 2);
y([
  c()
], f.prototype, "error", 2);
y([
  c()
], f.prototype, "dialog", 2);
y([
  c()
], f.prototype, "prefill", 2);
y([
  c()
], f.prototype, "editedCategory", 2);
y([
  c()
], f.prototype, "editedExpense", 2);
f = y([
  $("se-group-page")
], f);
class ds {
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
var hs = Object.defineProperty, us = Object.getOwnPropertyDescriptor, ge = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? us(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && hs(e, s, r), r;
};
let J = class extends m {
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
    this.hass && !this.api && (this.api = new ds(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = jt(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
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
J.styles = C`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
ge([
  l({ attribute: !1 })
], J.prototype, "hass", 2);
ge([
  l({ type: Boolean })
], J.prototype, "narrow", 2);
ge([
  l({ attribute: !1 })
], J.prototype, "route", 2);
ge([
  c()
], J.prototype, "groupId", 2);
J = ge([
  $("shared-expenses-panel")
], J);
export {
  J as SharedExpensesPanel
};
