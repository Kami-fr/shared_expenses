/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pe = globalThis, ve = pe.ShadowRoot && (pe.ShadyCSS === void 0 || pe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ye = Symbol(), Ee = /* @__PURE__ */ new WeakMap();
let Ne = class {
  constructor(e, s, r) {
    if (this._$cssResult$ = !0, r !== ye) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ve && e === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (e = Ee.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && Ee.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ge = (t) => new Ne(typeof t == "string" ? t : t + "", void 0, ye), z = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((r, i, a) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[a + 1], t[0]);
  return new Ne(s, t, ye);
}, Ve = (t, e) => {
  if (ve) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const r = document.createElement("style"), i = pe.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, t.appendChild(r);
  }
}, Se = ve ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const r of e.cssRules) s += r.cssText;
  return Ge(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: We, defineProperty: Ke, getOwnPropertyDescriptor: Ze, getOwnPropertyNames: Je, getOwnPropertySymbols: Ye, getPrototypeOf: Qe } = Object, me = globalThis, Pe = me.trustedTypes, Xe = Pe ? Pe.emptyScript : "", et = me.reactiveElementPolyfillSupport, te = (t, e) => t, ce = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Xe : null;
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
} }, $e = (t, e) => !We(t, e), Oe = { attribute: !0, type: String, converter: ce, reflect: !1, useDefault: !1, hasChanged: $e };
Symbol.metadata ??= Symbol("metadata"), me.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Z = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Oe) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, s);
      i !== void 0 && Ke(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, r) {
    const { get: i, set: a } = Ze(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const h = i?.call(this);
      a?.call(this, o), this.requestUpdate(e, h, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(te("elementProperties"))) return;
    const e = Qe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(te("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(te("properties"))) {
      const s = this.properties, r = [...Je(s), ...Ye(s)];
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
      for (const i of r) s.unshift(Se(i));
    } else e !== void 0 && s.push(Se(e));
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
    return Ve(e, this.constructor.elementStyles), e;
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
      const a = (r.converter?.toAttribute !== void 0 ? r.converter : ce).toAttribute(s, r.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const a = r.getPropertyOptions(i), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : ce;
      this._$Em = i;
      const h = o.fromAttribute(s, a.type);
      this[i] = h ?? this._$Ej?.get(i) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, s, r, i = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (a = this[e]), r ??= o.getPropertyOptions(e), !((r.hasChanged ?? $e)(a, s) || r.useDefault && r.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, r)))) return;
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
        const { wrapped: o } = a, h = this[i];
        o !== !0 || this._$AL.has(i) || h === void 0 || this.C(i, void 0, a, h);
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
Z.elementStyles = [], Z.shadowRootOptions = { mode: "open" }, Z[te("elementProperties")] = /* @__PURE__ */ new Map(), Z[te("finalized")] = /* @__PURE__ */ new Map(), et?.({ ReactiveElement: Z }), (me.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _e = globalThis, ze = (t) => t, de = _e.trustedTypes, Me = de ? de.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Re = "$lit$", N = `lit$${Math.random().toFixed(9).slice(2)}$`, Be = "?" + N, tt = `<${Be}>`, G = document, se = () => G.createComment(""), re = (t) => t === null || typeof t != "object" && typeof t != "function", xe = Array.isArray, st = (t) => xe(t) || typeof t?.[Symbol.iterator] == "function", fe = `[ 	
\f\r]`, ee = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, De = /-->/g, ke = />/g, L = RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ie = /'/g, Te = /"/g, qe = /^(?:script|style|textarea|title)$/i, rt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = rt(1), J = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Ue = /* @__PURE__ */ new WeakMap(), F = G.createTreeWalker(G, 129);
function He(t, e) {
  if (!xe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Me !== void 0 ? Me.createHTML(e) : e;
}
const it = (t, e) => {
  const s = t.length - 1, r = [];
  let i, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ee;
  for (let h = 0; h < s; h++) {
    const c = t[h];
    let g, $, u = -1, k = 0;
    for (; k < c.length && (o.lastIndex = k, $ = o.exec(c), $ !== null); ) k = o.lastIndex, o === ee ? $[1] === "!--" ? o = De : $[1] !== void 0 ? o = ke : $[2] !== void 0 ? (qe.test($[2]) && (i = RegExp("</" + $[2], "g")), o = L) : $[3] !== void 0 && (o = L) : o === L ? $[0] === ">" ? (o = i ?? ee, u = -1) : $[1] === void 0 ? u = -2 : (u = o.lastIndex - $[2].length, g = $[1], o = $[3] === void 0 ? L : $[3] === '"' ? Te : Ie) : o === Te || o === Ie ? o = L : o === De || o === ke ? o = ee : (o = L, i = void 0);
    const j = o === L && t[h + 1].startsWith("/>") ? " " : "";
    a += o === ee ? c + tt : u >= 0 ? (r.push(g), c.slice(0, u) + Re + c.slice(u) + N + j) : c + N + (u === -2 ? h : j);
  }
  return [He(t, a + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class ie {
  constructor({ strings: e, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let a = 0, o = 0;
    const h = e.length - 1, c = this.parts, [g, $] = it(e, s);
    if (this.el = ie.createElement(g, r), F.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = F.nextNode()) !== null && c.length < h; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(Re)) {
          const k = $[o++], j = i.getAttribute(u).split(N), le = /([.?@])?(.*)/.exec(k);
          c.push({ type: 1, index: a, name: le[2], strings: j, ctor: le[1] === "." ? ot : le[1] === "?" ? nt : le[1] === "@" ? lt : ge }), i.removeAttribute(u);
        } else u.startsWith(N) && (c.push({ type: 6, index: a }), i.removeAttribute(u));
        if (qe.test(i.tagName)) {
          const u = i.textContent.split(N), k = u.length - 1;
          if (k > 0) {
            i.textContent = de ? de.emptyScript : "";
            for (let j = 0; j < k; j++) i.append(u[j], se()), F.nextNode(), c.push({ type: 2, index: ++a });
            i.append(u[k], se());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Be) c.push({ type: 2, index: a });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(N, u + 1)) !== -1; ) c.push({ type: 7, index: a }), u += N.length - 1;
      }
      a++;
    }
  }
  static createElement(e, s) {
    const r = G.createElement("template");
    return r.innerHTML = e, r;
  }
}
function Y(t, e, s = t, r) {
  if (e === J) return e;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const a = re(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(t), i._$AT(t, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (e = Y(t, i._$AS(t, e.values), i, r)), e;
}
class at {
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
    const { el: { content: s }, parts: r } = this._$AD, i = (e?.creationScope ?? G).importNode(s, !0);
    F.currentNode = i;
    let a = F.nextNode(), o = 0, h = 0, c = r[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let g;
        c.type === 2 ? g = new oe(a, a.nextSibling, this, e) : c.type === 1 ? g = new c.ctor(a, c.name, c.strings, this, e) : c.type === 6 && (g = new pt(a, this, e)), this._$AV.push(g), c = r[++h];
      }
      o !== c?.index && (a = F.nextNode(), o++);
    }
    return F.currentNode = G, i;
  }
  p(e) {
    let s = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, s), s += r.strings.length - 2) : r._$AI(e[s])), s++;
  }
}
class oe {
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
    e = Y(this, e, s), re(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== J && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : st(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && re(this._$AH) ? this._$AA.nextSibling.data = e : this.T(G.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = ie.createElement(He(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const a = new at(i, this), o = a.u(this.options);
      a.p(s), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let s = Ue.get(e.strings);
    return s === void 0 && Ue.set(e.strings, s = new ie(e)), s;
  }
  k(e) {
    xe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const a of e) i === s.length ? s.push(r = new oe(this.O(se()), this.O(se()), this, this.options)) : r = s[i], r._$AI(a), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const r = ze(e).nextSibling;
      ze(e).remove(), e = r;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ge {
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
    if (a === void 0) e = Y(this, e, s, 0), o = !re(e) || e !== this._$AH && e !== J, o && (this._$AH = e);
    else {
      const h = e;
      let c, g;
      for (e = a[0], c = 0; c < a.length - 1; c++) g = Y(this, h[r + c], s, c), g === J && (g = this._$AH[c]), o ||= !re(g) || g !== this._$AH[c], g === d ? e = d : e !== d && (e += (g ?? "") + a[c + 1]), this._$AH[c] = g;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class ot extends ge {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class nt extends ge {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class lt extends ge {
  constructor(e, s, r, i, a) {
    super(e, s, r, i, a), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = Y(this, e, s, 0) ?? d) === J) return;
    const r = this._$AH, i = e === d && r !== d || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, a = e !== d && (r === d || i);
    i && this.element.removeEventListener(this.name, this, r), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class pt {
  constructor(e, s, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Y(this, e);
  }
}
const ct = _e.litHtmlPolyfillSupport;
ct?.(ie, oe), (_e.litHtmlVersions ??= []).push("3.3.3");
const dt = (t, e, s) => {
  const r = s?.renderBefore ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const a = s?.renderBefore ?? null;
    r._$litPart$ = i = new oe(e.insertBefore(se(), a), a, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const we = globalThis;
class v extends Z {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = dt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return J;
  }
}
v._$litElement$ = !0, v.finalized = !0, we.litElementHydrateSupport?.({ LitElement: v });
const ht = we.litElementPolyfillSupport;
ht?.({ LitElement: v });
(we.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = { attribute: !0, type: String, converter: ce, reflect: !1, hasChanged: $e }, mt = (t = ut, e, s) => {
  const { kind: r, metadata: i } = s;
  let a = globalThis.litPropertyMetadata.get(i);
  if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(s.name, t), r === "accessor") {
    const { name: o } = s;
    return { set(h) {
      const c = e.get.call(this);
      e.set.call(this, h), this.requestUpdate(o, c, t, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(o, void 0, t, h), h;
    } };
  }
  if (r === "setter") {
    const { name: o } = s;
    return function(h) {
      const c = this[o];
      e.call(this, h), this.requestUpdate(o, c, t, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function l(t) {
  return (e, s) => typeof s == "object" ? mt(t, e, s) : ((r, i, a) => {
    const o = i.hasOwnProperty(a);
    return i.constructor.createProperty(a, r), o ? Object.getOwnPropertyDescriptor(i, a) : void 0;
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
var gt = Object.defineProperty, bt = Object.getOwnPropertyDescriptor, be = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? bt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && gt(e, s, i), i;
};
let Q = class extends v {
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
Q.styles = z`
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
be([
  l({ type: String })
], Q.prototype, "variant", 2);
be([
  l({ type: Boolean })
], Q.prototype, "disabled", 2);
be([
  l({ type: String })
], Q.prototype, "icon", 2);
Q = be([
  w("se-button")
], Q);
var ft = Object.defineProperty, vt = Object.getOwnPropertyDescriptor, Ce = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? vt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && ft(e, s, i), i;
};
let ae = class extends v {
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
ae.styles = z`
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
Ce([
  l({ type: String })
], ae.prototype, "heading", 2);
Ce([
  l({ type: Boolean, reflect: !0 })
], ae.prototype, "open", 2);
ae = Ce([
  w("se-dialog")
], ae);
var yt = Object.defineProperty, $t = Object.getOwnPropertyDescriptor, M = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? $t(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && yt(e, s, i), i;
};
let A = class extends v {
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
A.styles = z`
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
M([
  l({ type: String })
], A.prototype, "label", 2);
M([
  l({ type: String })
], A.prototype, "value", 2);
M([
  l({ type: String })
], A.prototype, "type", 2);
M([
  l({ type: String })
], A.prototype, "placeholder", 2);
M([
  l({ type: String })
], A.prototype, "suffix", 2);
M([
  l({ type: String })
], A.prototype, "helper", 2);
M([
  l({ type: Boolean })
], A.prototype, "required", 2);
M([
  l({ type: Boolean })
], A.prototype, "disabled", 2);
M([
  l({ type: Boolean })
], A.prototype, "decimal", 2);
A = M([
  w("se-field")
], A);
const he = {
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
  tab_categories: "Categories",
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
}, _t = {
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
  tab_categories: "Catégories",
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
}, xt = { en: he, fr: _t };
function wt(t) {
  const e = xt[t.split("-")[0]] ?? he;
  return (s) => e[s] ?? he[s] ?? s;
}
function R(t, e) {
  const s = t?.code;
  return s && s in he ? e(s) : t?.message || e("error_generic");
}
const q = z`
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
var Ct = Object.defineProperty, At = Object.getOwnPropertyDescriptor, H = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? At(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Ct(e, s, i), i;
};
let O = class extends v {
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
        this.error = R(t, this.localize);
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
O.styles = q;
H([
  l({ attribute: !1 })
], O.prototype, "api", 2);
H([
  l({ attribute: !1 })
], O.prototype, "localize", 2);
H([
  p()
], O.prototype, "name", 2);
H([
  p()
], O.prototype, "description", 2);
H([
  p()
], O.prototype, "currency", 2);
H([
  p()
], O.prototype, "busy", 2);
H([
  p()
], O.prototype, "error", 2);
O = H([
  w("se-group-dialog")
], O);
var Et = Object.defineProperty, St = Object.getOwnPropertyDescriptor, W = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? St(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Et(e, s, i), i;
};
let T = class extends v {
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
      this.error = R(t, this.localize);
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
T.styles = [
  q,
  z`
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
W([
  l({ attribute: !1 })
], T.prototype, "api", 2);
W([
  l({ attribute: !1 })
], T.prototype, "localize", 2);
W([
  p()
], T.prototype, "groups", 2);
W([
  p()
], T.prototype, "loading", 2);
W([
  p()
], T.prototype, "error", 2);
W([
  p()
], T.prototype, "dialogOpen", 2);
T = W([
  w("se-dashboard-page")
], T);
function I(t, e, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function Pt(t, e, s) {
  const r = I(Math.abs(t), e, s);
  return t > 0 ? `+${r}` : t < 0 ? `-${r}` : r;
}
function P(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const s = Number(e);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function Ot(t, e) {
  return new Intl.DateTimeFormat(e, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
}
function Le() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function Fe(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function zt(t) {
  const e = new Date(t), s = `${e.getMonth() + 1}`.padStart(2, "0"), r = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${s}-${r}`;
}
function je(t) {
  return (t / 100).toFixed(2);
}
function Ae(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
function ue(t) {
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
var Mt = Object.defineProperty, Dt = Object.getOwnPropertyDescriptor, D = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Dt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Mt(e, s, i), i;
};
let E = class extends v {
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
    const t = P(this.capInput);
    if (t === null || t <= 0 || this.participants.size === 0)
      return d;
    const e = 8542, s = Object.values(this.fixedInputs).reduce(
      (c, g) => c + (P(g) ?? 0),
      0
    ), r = e - s;
    if (r <= 0)
      return d;
    const i = Math.min(r, t), a = Math.floor(i / this.participants.size), o = r - i, h = (c) => I(c, this.currency, this.language);
    return n`
      <div class="preview">
        ${this.localize("rule_preview_intro")} <strong>${h(e)}</strong>:
        <strong>${h(i)}</strong> ${this.localize("rule_preview_shared")}
        (${this.participants.size} × ~<strong>${h(a)}</strong>),
        ${this.localize("rule_preview_rest")} <strong>${h(o)}</strong>
        ${this.localize("rule_preview_to_payer")}
      </div>
    `;
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? ue(t.id)}`}>
        ${Ae(t.name)}
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
    for (const [r, i] of Object.entries(this.fixedInputs)) {
      const a = P(i);
      a !== null && a > 0 && (t[r] = a);
    }
    const e = P(this.capInput);
    return {
      participants: this.participants.size === this.members.length ? null : [...this.participants],
      fixed: t,
      cap: e !== null && e > 0 ? e : null,
      remainder: "payer"
    };
  }
};
E.styles = [
  q,
  z`
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
D([
  l({ attribute: !1 })
], E.prototype, "localize", 2);
D([
  l({ attribute: !1 })
], E.prototype, "members", 2);
D([
  l({ attribute: !1 })
], E.prototype, "rule", 2);
D([
  l({ type: String })
], E.prototype, "currency", 2);
D([
  l({ type: String })
], E.prototype, "language", 2);
D([
  p()
], E.prototype, "enabled", 2);
D([
  p()
], E.prototype, "participants", 2);
D([
  p()
], E.prototype, "capInput", 2);
D([
  p()
], E.prototype, "fixedInputs", 2);
E = D([
  w("se-split-rule-editor")
], E);
var kt = Object.defineProperty, It = Object.getOwnPropertyDescriptor, S = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? It(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && kt(e, s, i), i;
};
let x = class extends v {
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
        this.error = R(e, this.localize);
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
x.styles = q;
S([
  l({ attribute: !1 })
], x.prototype, "api", 2);
S([
  l({ attribute: !1 })
], x.prototype, "localize", 2);
S([
  l({ attribute: !1 })
], x.prototype, "group", 2);
S([
  l({ attribute: !1 })
], x.prototype, "members", 2);
S([
  l({ attribute: !1 })
], x.prototype, "category", 2);
S([
  l({ type: String })
], x.prototype, "language", 2);
S([
  p()
], x.prototype, "name", 2);
S([
  p()
], x.prototype, "icon", 2);
S([
  p()
], x.prototype, "rule", 2);
S([
  p()
], x.prototype, "busy", 2);
S([
  p()
], x.prototype, "error", 2);
x = S([
  w("se-category-dialog")
], x);
var Tt = Object.defineProperty, Ut = Object.getOwnPropertyDescriptor, X = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ut(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Tt(e, s, i), i;
};
let B = class extends v {
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
B.styles = z`
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
X([
  l({ type: String })
], B.prototype, "label", 2);
X([
  l({ type: String })
], B.prototype, "value", 2);
X([
  l({ attribute: !1 })
], B.prototype, "options", 2);
X([
  l({ type: String })
], B.prototype, "placeholder", 2);
X([
  l({ type: Boolean })
], B.prototype, "disabled", 2);
B = X([
  w("se-select")
], B);
var jt = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, f = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Nt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && jt(e, s, i), i;
};
let m = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.language = "en", this.expenseTitle = "", this.amountInput = "", this.paidBy = "", this.date = Le(), this.categoryId = "", this.mode = "rule", this.participants = /* @__PURE__ */ new Set(), this.customAmounts = {}, this.busy = !1, this.confirmingDelete = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = P(this.amountInput);
      if (t === null)
        return;
      this.busy = !0, this.error = void 0;
      const e = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: Fe(this.date),
        category_id: this.categoryId || null
      };
      this.mode === "equal" ? e.split_rule = {
        participants: [...this.participants],
        fixed: {},
        cap: null,
        remainder: "payer"
      } : this.mode === "custom" && (e.shares = this.members.map((s) => ({
        member_id: s.id,
        amount: P(this.customAmounts[s.id] ?? "") ?? 0
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
        this.error = R(s, this.localize);
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
          this.error = R(t, this.localize), this.confirmingDelete = !1;
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
    this.expenseTitle = this.expense.title, this.amountInput = je(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = zt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.mode = "custom", this.customAmounts = Object.fromEntries(
      (this.expense.shares ?? []).map((t) => [
        t.member_id,
        je(t.amount)
      ])
    );
  }
  render() {
    const t = this.localize, e = P(this.amountInput), s = this.expense ? t("edit_expense") : t("new_expense");
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
            @value-changed=${(r) => this.categoryId = r.detail.value}
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
            ${I(s, this.group.currency, this.language)}
            ${t !== null ? ` / ${I(t, this.group.currency, this.language)}` : ""}
          </span>
        </div>
      </div>
    `;
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? ue(t.id)}`}>
        ${Ae(t.name)}
      </div>
    `;
  }
  equalShare(t, e) {
    if (t === null || !this.participants.has(e))
      return "";
    const s = this.members.map((h) => h.id).filter((h) => this.participants.has(h)), r = s.indexOf(e);
    if (r < 0 || s.length === 0)
      return "";
    const i = Math.floor(t / s.length), a = t % s.length, o = i + (r < a ? 1 : 0);
    return I(o, this.group.currency, this.language);
  }
  customTotal() {
    return Object.values(this.customAmounts).reduce(
      (t, e) => t + (P(e) ?? 0),
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
  q,
  z`
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
f([
  p()
], m.prototype, "confirmingDelete", 2);
m = f([
  w("se-expense-dialog")
], m);
var Rt = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, K = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Bt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Rt(e, s, i), i;
};
let U = class extends v {
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
        this.error = R(t, this.localize);
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
U.styles = q;
K([
  l({ attribute: !1 })
], U.prototype, "api", 2);
K([
  l({ attribute: !1 })
], U.prototype, "localize", 2);
K([
  l({ type: String })
], U.prototype, "groupId", 2);
K([
  p()
], U.prototype, "name", 2);
K([
  p()
], U.prototype, "busy", 2);
K([
  p()
], U.prototype, "error", 2);
U = K([
  w("se-member-dialog")
], U);
var qt = Object.defineProperty, Ht = Object.getOwnPropertyDescriptor, C = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ht(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && qt(e, s, i), i;
};
let _ = class extends v {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = Le(), this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = P(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: Fe(this.date)
          });
          this.dispatchEvent(
            new CustomEvent("payment-created", {
              detail: { payment: e },
              bubbles: !0,
              composed: !0
            })
          );
        } catch (e) {
          this.error = R(e, this.localize);
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
    const t = this.localize, e = P(this.amountInput), s = this.members.map((r) => ({ value: r.id, label: r.name }));
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
                ${I(e, this.group.currency, this.language)}
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
_.styles = q;
C([
  l({ attribute: !1 })
], _.prototype, "api", 2);
C([
  l({ attribute: !1 })
], _.prototype, "localize", 2);
C([
  l({ attribute: !1 })
], _.prototype, "group", 2);
C([
  l({ attribute: !1 })
], _.prototype, "members", 2);
C([
  l({ attribute: !1 })
], _.prototype, "settlement", 2);
C([
  l({ type: String })
], _.prototype, "language", 2);
C([
  p()
], _.prototype, "fromMember", 2);
C([
  p()
], _.prototype, "toMember", 2);
C([
  p()
], _.prototype, "amountInput", 2);
C([
  p()
], _.prototype, "date", 2);
C([
  p()
], _.prototype, "busy", 2);
C([
  p()
], _.prototype, "error", 2);
_ = C([
  w("se-payment-dialog")
], _);
var Lt = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, y = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ft(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Lt(e, s, i), i;
};
let b = class extends v {
  constructor() {
    super(...arguments), this.language = "en", this.members = [], this.categories = [], this.expenses = [], this.tab = "balances", this.loading = !0, this.closeDialog = () => {
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

        ${this.error ? n`<div class="error">${this.error}</div>` : d}

        <div class="tabs" role="tablist">
          ${this.renderTab("balances", t("tab_balances"))}
          ${this.renderTab("expenses", t("tab_expenses"))}
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
    return this.tab === "balances" ? this.renderBalances() : this.tab === "expenses" ? this.renderExpenses() : this.tab === "categories" ? this.renderCategories() : this.renderMembers();
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
        <div class="avatar" style=${`background:${t.color ?? ue(t.id)}`}>
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
    const s = I(e.cap, this.group.currency, this.language);
    return `${this.localize("rule_capped")} ${s}`;
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
                ${Pt(r.amount, e, this.language)}
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
            ${I(t.amount, this.group.currency, this.language)}
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
    const e = this.memberById(t.paid_by_member_id), s = this.categories.find((r) => r.id === t.category_id);
    return n`
      <button class="item item-button" @click=${() => this.openExpense(t)}>
        ${this.renderAvatar(e?.name ?? "?", t.paid_by_member_id)}
        <div class="info">
          <div class="title">${t.title}</div>
          <div class="muted">
            ${this.localize("paid_by")} ${e?.name ?? "?"} ·
            ${Ot(t.expense_date, this.language)}
            ${s ? n` · ${s.name}` : d}
          </div>
        </div>
        <span class="amount">
          ${I(t.amount, t.currency, this.language)}
        </span>
        <span class="chevron">›</span>
      </button>
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
      <div class="avatar" style=${`background:${s?.color ?? ue(e)}`}>
        ${Ae(t)}
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
      this.error = R(t, this.localize);
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
  q,
  z`
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
  p()
], b.prototype, "group", 2);
y([
  p()
], b.prototype, "members", 2);
y([
  p()
], b.prototype, "categories", 2);
y([
  p()
], b.prototype, "expenses", 2);
y([
  p()
], b.prototype, "result", 2);
y([
  p()
], b.prototype, "tab", 2);
y([
  p()
], b.prototype, "loading", 2);
y([
  p()
], b.prototype, "error", 2);
y([
  p()
], b.prototype, "dialog", 2);
y([
  p()
], b.prototype, "prefill", 2);
y([
  p()
], b.prototype, "editedCategory", 2);
y([
  p()
], b.prototype, "editedExpense", 2);
b = y([
  w("se-group-page")
], b);
class Gt {
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
var Vt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, ne = (t, e, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Wt(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (r ? o(e, s, i) : o(i)) || i);
  return r && i && Vt(e, s, i), i;
};
let V = class extends v {
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
    this.hass && !this.api && (this.api = new Gt(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = wt(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
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
V.styles = z`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
ne([
  l({ attribute: !1 })
], V.prototype, "hass", 2);
ne([
  l({ type: Boolean })
], V.prototype, "narrow", 2);
ne([
  l({ attribute: !1 })
], V.prototype, "route", 2);
ne([
  p()
], V.prototype, "groupId", 2);
V = ne([
  w("shared-expenses-panel")
], V);
export {
  V as SharedExpensesPanel
};
