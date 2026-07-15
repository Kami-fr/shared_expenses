/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ke = globalThis, pt = Ke.ShadowRoot && (Ke.ShadyCSS === void 0 || Ke.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ut = Symbol(), xt = /* @__PURE__ */ new WeakMap();
let Gt = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== ut) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (pt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = xt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && xt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ds = (e) => new Gt(typeof e == "string" ? e : e + "", void 0, ut), x = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, r, a) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[a + 1], e[0]);
  return new Gt(s, e, ut);
}, hs = (e, t) => {
  if (pt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), r = Ke.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, e.appendChild(i);
  }
}, wt = pt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return ds(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ps, defineProperty: us, getOwnPropertyDescriptor: ms, getOwnPropertyNames: gs, getOwnPropertySymbols: fs, getPrototypeOf: ys } = Object, et = globalThis, kt = et.trustedTypes, bs = kt ? kt.emptyScript : "", vs = et.reactiveElementPolyfillSupport, De = (e, t) => e, Ye = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? bs : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, mt = (e, t) => !ps(e, t), St = { attribute: !0, type: String, converter: Ye, reflect: !1, useDefault: !1, hasChanged: mt };
Symbol.metadata ??= Symbol("metadata"), et.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Ce = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = St) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, s);
      r !== void 0 && us(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: r, set: a } = ms(this.prototype, t) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: r, set(n) {
      const h = r?.call(this);
      a?.call(this, n), this.requestUpdate(t, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? St;
  }
  static _$Ei() {
    if (this.hasOwnProperty(De("elementProperties"))) return;
    const t = ys(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(De("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(De("properties"))) {
      const s = this.properties, i = [...gs(s), ...fs(s)];
      for (const r of i) this.createProperty(r, s[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, r] of s) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const r = this._$Eu(s, i);
      r !== void 0 && this._$Eh.set(r, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) s.unshift(wt(r));
    } else t !== void 0 && s.push(wt(t));
    return s;
  }
  static _$Eu(t, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return hs(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, i) {
    this._$AK(t, i);
  }
  _$ET(t, s) {
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const a = (i.converter?.toAttribute !== void 0 ? i.converter : Ye).toAttribute(s, i.type);
      this._$Em = t, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const a = i.getPropertyOptions(r), n = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : Ye;
      this._$Em = r;
      const h = n.fromAttribute(s, a.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, r = !1, a) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (a = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? mt)(a, s) || i.useDefault && i.reflect && a === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: r, wrapped: a }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? s ?? this[t]), a !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
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
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, a] of i) {
        const { wrapped: n } = a, h = this[r];
        n !== !0 || this._$AL.has(r) || h === void 0 || this.C(r, void 0, a, h);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Ce.elementStyles = [], Ce.shadowRootOptions = { mode: "open" }, Ce[De("elementProperties")] = /* @__PURE__ */ new Map(), Ce[De("finalized")] = /* @__PURE__ */ new Map(), vs?.({ ReactiveElement: Ce }), (et.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const gt = globalThis, zt = (e) => e, Ze = gt.trustedTypes, Ct = Ze ? Ze.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ft = "$lit$", ge = `lit$${Math.random().toFixed(9).slice(2)}$`, Wt = "?" + ge, _s = `<${Wt}>`, xe = document, Me = () => xe.createComment(""), Re = (e) => e === null || typeof e != "object" && typeof e != "function", ft = Array.isArray, $s = (e) => ft(e) || typeof e?.[Symbol.iterator] == "function", rt = `[ 	
\f\r]`, Te = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Pt = /-->/g, At = />/g, _e = RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Et = /'/g, Ot = /"/g, Vt = /^(?:script|style|textarea|title)$/i, Kt = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), o = Kt(1), It = Kt(2), ne = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Tt = /* @__PURE__ */ new WeakMap(), $e = xe.createTreeWalker(xe, 129);
function Yt(e, t) {
  if (!ft(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ct !== void 0 ? Ct.createHTML(t) : t;
}
const xs = (e, t) => {
  const s = e.length - 1, i = [];
  let r, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = Te;
  for (let h = 0; h < s; h++) {
    const p = e[h];
    let y, S, u = -1, te = 0;
    for (; te < p.length && (n.lastIndex = te, S = n.exec(p), S !== null); ) te = n.lastIndex, n === Te ? S[1] === "!--" ? n = Pt : S[1] !== void 0 ? n = At : S[2] !== void 0 ? (Vt.test(S[2]) && (r = RegExp("</" + S[2], "g")), n = _e) : S[3] !== void 0 && (n = _e) : n === _e ? S[0] === ">" ? (n = r ?? Te, u = -1) : S[1] === void 0 ? u = -2 : (u = n.lastIndex - S[2].length, y = S[1], n = S[3] === void 0 ? _e : S[3] === '"' ? Ot : Et) : n === Ot || n === Et ? n = _e : n === Pt || n === At ? n = Te : (n = _e, r = void 0);
    const A = n === _e && e[h + 1].startsWith("/>") ? " " : "";
    a += n === Te ? p + _s : u >= 0 ? (i.push(y), p.slice(0, u) + Ft + p.slice(u) + ge + A) : p + ge + (u === -2 ? h : A);
  }
  return [Yt(e, a + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Ne {
  constructor({ strings: t, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let a = 0, n = 0;
    const h = t.length - 1, p = this.parts, [y, S] = xs(t, s);
    if (this.el = Ne.createElement(y, i), $e.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = $e.nextNode()) !== null && p.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(Ft)) {
          const te = S[n++], A = r.getAttribute(u).split(ge), E = /([.?@])?(.*)/.exec(te);
          p.push({ type: 1, index: a, name: E[2], strings: A, ctor: E[1] === "." ? ks : E[1] === "?" ? Ss : E[1] === "@" ? zs : tt }), r.removeAttribute(u);
        } else u.startsWith(ge) && (p.push({ type: 6, index: a }), r.removeAttribute(u));
        if (Vt.test(r.tagName)) {
          const u = r.textContent.split(ge), te = u.length - 1;
          if (te > 0) {
            r.textContent = Ze ? Ze.emptyScript : "";
            for (let A = 0; A < te; A++) r.append(u[A], Me()), $e.nextNode(), p.push({ type: 2, index: ++a });
            r.append(u[te], Me());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Wt) p.push({ type: 2, index: a });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(ge, u + 1)) !== -1; ) p.push({ type: 7, index: a }), u += ge.length - 1;
      }
      a++;
    }
  }
  static createElement(t, s) {
    const i = xe.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Pe(e, t, s = e, i) {
  if (t === ne) return t;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const a = Re(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== a && (r?._$AO?.(!1), a === void 0 ? r = void 0 : (r = new a(e), r._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (t = Pe(e, r._$AS(e, t.values), r, i)), t;
}
class ws {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: i } = this._$AD, r = (t?.creationScope ?? xe).importNode(s, !0);
    $e.currentNode = r;
    let a = $e.nextNode(), n = 0, h = 0, p = i[0];
    for (; p !== void 0; ) {
      if (n === p.index) {
        let y;
        p.type === 2 ? y = new He(a, a.nextSibling, this, t) : p.type === 1 ? y = new p.ctor(a, p.name, p.strings, this, t) : p.type === 6 && (y = new Cs(a, this, t)), this._$AV.push(y), p = i[++h];
      }
      n !== p?.index && (a = $e.nextNode(), n++);
    }
    return $e.currentNode = xe, r;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class He {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, i, r) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = Pe(this, t, s), Re(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== ne && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : $s(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && Re(this._$AH) ? this._$AA.nextSibling.data = t : this.T(xe.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ne.createElement(Yt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const a = new ws(r, this), n = a.u(this.options);
      a.p(s), this.T(n), this._$AH = a;
    }
  }
  _$AC(t) {
    let s = Tt.get(t.strings);
    return s === void 0 && Tt.set(t.strings, s = new Ne(t)), s;
  }
  k(t) {
    ft(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const a of t) r === s.length ? s.push(i = new He(this.O(Me()), this.O(Me()), this, this.options)) : i = s[r], i._$AI(a), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = zt(t).nextSibling;
      zt(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class tt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, r, a) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = s, this._$AM = r, this.options = a, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(t, s = this, i, r) {
    const a = this.strings;
    let n = !1;
    if (a === void 0) t = Pe(this, t, s, 0), n = !Re(t) || t !== this._$AH && t !== ne, n && (this._$AH = t);
    else {
      const h = t;
      let p, y;
      for (t = a[0], p = 0; p < a.length - 1; p++) y = Pe(this, h[i + p], s, p), y === ne && (y = this._$AH[p]), n ||= !Re(y) || y !== this._$AH[p], y === d ? t = d : t !== d && (t += (y ?? "") + a[p + 1]), this._$AH[p] = y;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ks extends tt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class Ss extends tt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class zs extends tt {
  constructor(t, s, i, r, a) {
    super(t, s, i, r, a), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Pe(this, t, s, 0) ?? d) === ne) return;
    const i = this._$AH, r = t === d && i !== d || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, a = t !== d && (i === d || r);
    r && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Cs {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Pe(this, t);
  }
}
const Ps = gt.litHtmlPolyfillSupport;
Ps?.(Ne, He), (gt.litHtmlVersions ??= []).push("3.3.3");
const As = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const a = s?.renderBefore ?? null;
    i._$litPart$ = r = new He(t.insertBefore(Me(), a), a, void 0, s ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const yt = globalThis;
let m = class extends Ce {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = As(s, this.renderRoot, this.renderOptions);
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
m._$litElement$ = !0, m.finalized = !0, yt.litElementHydrateSupport?.({ LitElement: m });
const Es = yt.litElementPolyfillSupport;
Es?.({ LitElement: m });
(yt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Os = { attribute: !0, type: String, converter: Ye, reflect: !1, hasChanged: mt }, Is = (e = Os, t, s) => {
  const { kind: i, metadata: r } = s;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(s.name, e), i === "accessor") {
    const { name: n } = s;
    return { set(h) {
      const p = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(n, p, e, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(n, void 0, e, h), h;
    } };
  }
  if (i === "setter") {
    const { name: n } = s;
    return function(h) {
      const p = this[n];
      t.call(this, h), this.requestUpdate(n, p, e, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function l(e) {
  return (t, s) => typeof s == "object" ? Is(e, t, s) : ((i, r, a) => {
    const n = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, i), n ? Object.getOwnPropertyDescriptor(r, a) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function c(e) {
  return l({ ...e, state: !0, attribute: !1 });
}
var Ts = Object.defineProperty, js = Object.getOwnPropertyDescriptor, st = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? js(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ts(t, s, r), r;
};
let Ae = class extends m {
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
Ae.styles = x`
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
st([
  l({ type: String })
], Ae.prototype, "variant", 2);
st([
  l({ type: Boolean })
], Ae.prototype, "disabled", 2);
st([
  l({ type: String })
], Ae.prototype, "icon", 2);
Ae = st([
  b("se-button")
], Ae);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ze = { ATTRIBUTE: 1, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4 }, Zt = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Jt = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, s, i) {
    this._$Ct = t, this._$AM = s, this._$Ci = i;
  }
  _$AS(t, s) {
    return this.update(t, s);
  }
  update(t, s) {
    return this.render(...s);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ds = (e) => e.strings === void 0, Ms = {}, Xt = (e, t = Ms) => e._$AH = t;
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qt = Zt(class extends Jt {
  constructor(e) {
    if (super(e), e.type !== ze.PROPERTY && e.type !== ze.ATTRIBUTE && e.type !== ze.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!Ds(e)) throw Error("`live` bindings can only contain a single expression");
  }
  render(e) {
    return e;
  }
  update(e, [t]) {
    if (t === ne || t === d) return t;
    const s = e.element, i = e.name;
    if (e.type === ze.PROPERTY) {
      if (t === s[i]) return ne;
    } else if (e.type === ze.BOOLEAN_ATTRIBUTE) {
      if (!!t === s.hasAttribute(i)) return ne;
    } else if (e.type === ze.ATTRIBUTE && s.getAttribute(i) === t + "") return ne;
    return Xt(e), t;
  }
});
var Rs = Object.defineProperty, Ns = Object.getOwnPropertyDescriptor, bt = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ns(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Rs(t, s, r), r;
};
const Us = 300;
let Ue = class extends m {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.keepInView = (e) => {
      const t = e.target;
      t?.scrollIntoView && window.setTimeout(() => {
        t.scrollIntoView({ block: "center", behavior: "smooth" });
      }, Us);
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
Ue.styles = x`
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
bt([
  l({ type: String })
], Ue.prototype, "heading", 2);
bt([
  l({ type: Boolean, reflect: !0 })
], Ue.prototype, "open", 2);
Ue = bt([
  b("se-dialog")
], Ue);
var Bs = Object.defineProperty, qs = Object.getOwnPropertyDescriptor, de = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? qs(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Bs(t, s, r), r;
};
let J = class extends m {
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
J.styles = x`
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
de([
  l({ type: String })
], J.prototype, "label", 2);
de([
  l({ type: String })
], J.prototype, "value", 2);
de([
  l({ type: String })
], J.prototype, "type", 2);
de([
  l({ type: String })
], J.prototype, "placeholder", 2);
de([
  l({ type: String })
], J.prototype, "suffix", 2);
de([
  l({ type: String })
], J.prototype, "helper", 2);
de([
  l({ type: Boolean })
], J.prototype, "required", 2);
de([
  l({ type: Boolean })
], J.prototype, "disabled", 2);
de([
  l({ type: Boolean })
], J.prototype, "decimal", 2);
J = de([
  b("se-field")
], J);
var Hs = Object.defineProperty, Ls = Object.getOwnPropertyDescriptor, Oe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ls(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Hs(t, s, r), r;
};
let fe = class extends m {
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
fe.styles = x`
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

    /*
     * The list that drops down, which is not the box you can see.
     *
     * The popup is painted by the browser, and on a desktop it takes the
     * option's own background — not the select's. An option has none by
     * default, so the popup came out white while the text kept the theme's
     * near-white, and the choices were invisible until you hovered one.
     *
     * Never showed on a phone: there the popup is a system dialog that ignores
     * the page's CSS entirely and follows the OS theme, so it read fine.
     */
    option {
      background-color: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
  `;
Oe([
  l({ type: String })
], fe.prototype, "label", 2);
Oe([
  l({ type: String })
], fe.prototype, "value", 2);
Oe([
  l({ attribute: !1 })
], fe.prototype, "options", 2);
Oe([
  l({ type: String })
], fe.prototype, "placeholder", 2);
Oe([
  l({ type: Boolean })
], fe.prototype, "disabled", 2);
fe = Oe([
  b("se-select")
], fe);
const Z = 1e6, Gs = Z * 1e4, vt = [
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
function es(e) {
  return Number.isInteger(e) && e > 0 && e <= Gs;
}
function Fs(e, t) {
  return !Number.isInteger(e) || e < 0 || !es(t) ? null : Math.floor((e * t + Z / 2) / Z);
}
function Ws(e) {
  const t = e.trim().replace(",", ".");
  if (!t)
    return null;
  const s = /^(\d*)(?:\.(\d*))?$/.exec(t);
  if (!s)
    return null;
  const [, i, r = ""] = s;
  if (!i && !r || r.length > 6)
    return null;
  const a = Number(i || "0") * Z + Number(r.padEnd(6, "0") || "0");
  return es(a) ? a : null;
}
function jt(e) {
  const t = Math.floor(e / Z), s = e % Z;
  return s === 0 ? String(t) : `${t}.${String(s).padStart(6, "0")}`.replace(/0+$/, "");
}
const Je = {
  app_title: "Shared Expenses",
  groups: "Projects",
  no_groups: "No project yet. Create one to get started.",
  new_group: "New project",
  edit_group: "Edit project",
  all_groups: "All projects",
  more: "More",
  delete_group: "Delete this project",
  create_group: "Create project",
  group_name: "Project name",
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
  search: "Search an expense, a person, an amount…",
  no_match: "Nothing matches.",
  a_settlement: "Reimbursement",
  see_all: "See all",
  action_add_expense: "Add expense",
  fab_hint: "Add an expense — drag to reimburse instead",
  categories: "Categories",
  no_categories: "No category yet. A category carries a default split rule.",
  new_category: "New category",
  default_category: "Default category",
  default_category_hint: "A new expense opens on this one. One category per project.",
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
  default_from_category: "Whatever the category says, or the project when it says nothing.",
  default_from_group: "Whatever the project says for expenses with no category.",
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
  confirm_delete_expense: "Delete this expense? Its shares go with it. The history keeps it, and can bring it back.",
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
  group_rule: "the project",
  shares_mismatch: "The shares must add up to the amount.",
  participants: "Participants",
  members: "Members",
  member_name: "Name",
  remove_member: "Remove from project",
  restore_member: "Bring back",
  confirm_remove: "Confirm?",
  add: "Add",
  close: "Close",
  ha_accounts: "Home Assistant accounts",
  ha_accounts_hint: "Ticked accounts take part in this project and can open it.",
  no_ha_accounts: "No account found.",
  admin_locked: "The admin cannot leave. Hand the project on first, or archive it.",
  cannot_remove_admin: "The admin cannot leave. Hand the project on first, or archive it.",
  make_admin: "Hand the project over",
  confirm_make_admin: "Hand the project to this person? You become an ordinary member, and only they will be able to hand it on or delete it.",
  admin_needs_account: "Only somebody with a Home Assistant account can run a project.",
  dashboard: "On the dashboard",
  dashboard_hint: "Off. Home Assistant does not wall entities off: every account in the house would read this project's balances, member or not.",
  dashboard_on: "Put this project on the dashboard",
  dashboard_on_hint: "A sensor per member, and one saying whether anything is still owed. Readable by every account in the house — not only by the people in this project.",
  permissions: "What members may do",
  permissions_hint: "The same for everybody in the project. You and the admins are above these, always.",
  perm_manage_members: "Manage members",
  perm_manage_members_hint: "Add, remove and rename people. Never who is an admin.",
  perm_manage_categories: "Manage categories",
  perm_manage_categories_hint: "Create and change the categories and their rules.",
  perm_manage_group: "Edit the project",
  perm_manage_group_hint: "Rename it, change its default rule, archive it.",
  perm_edit_others: "Edit what is not theirs",
  perm_edit_others_hint: "Change or delete an expense somebody else entered and paid.",
  not_allowed: "The project does not allow you to do this.",
  archived_hint: "This project is archived: nothing new can be added to it.",
  guests: "Without an account",
  guests_hint: "They carry expenses but never log in.",
  no_account: "No account",
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
  /* Your own name, on a line about you. See renderPayment. */
  you: "You",
  edit_debt: "Edit debt",
  confirm_delete_debt: "Delete this debt? It stops being owed.",
  edit_payment: "Edit reimbursement",
  from_member: "From",
  to_member: "To",
  history: "History",
  group_history: "Project history",
  no_history: "Nothing recorded yet.",
  history_created: "added",
  history_updated: "changed",
  history_deleted: "deleted",
  history_restored: "brought back",
  restore_entry: "Bring it back",
  the_expense: "the expense",
  the_payment: "the reimbursement",
  the_group: "the project",
  the_category: "the category",
  the_member: "the member",
  field_name: "Name",
  field_role: "Standing",
  permissions_none: "nothing",
  yes: "Yes",
  no: "No",
  someone: "Someone",
  loading: "Loading…",
  error_generic: "Something went wrong.",
  group_not_found: "This project no longer exists.",
  group_archived: "This project is archived.",
  member_not_found: "This member no longer exists.",
  member_already_in_group: "This member is already in the project.",
  category_not_found: "This category no longer exists.",
  expense_not_found: "This expense no longer exists.",
  invalid_expense: "This expense is invalid.",
  invalid_expense_shares: "The shares do not add up to the amount.",
  invalid_split_rule: "This split rule is invalid.",
  payment_not_found: "This reimbursement no longer exists.",
  invalid_payment: "This reimbursement is invalid.",
  not_loaded: "The integration is not loaded.",
  unknown_error: "Something went wrong."
}, Vs = {
  app_title: "Dépenses partagées",
  groups: "Projets",
  no_groups: "Aucun projet pour l'instant. Créez-en un pour commencer.",
  new_group: "Nouveau projet",
  edit_group: "Modifier le projet",
  all_groups: "Tous les projets",
  more: "Plus",
  delete_group: "Supprimer ce projet",
  create_group: "Créer le projet",
  group_name: "Nom du projet",
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
  search: "Chercher une dépense, une personne, un montant…",
  no_match: "Aucun résultat.",
  a_settlement: "Remboursement",
  see_all: "Voir tout",
  action_add_expense: "Ajouter dépense",
  fab_hint: "Ajouter une dépense — glisser pour rembourser",
  categories: "Catégories",
  no_categories: "Aucune catégorie. Une catégorie porte une règle de répartition par défaut.",
  new_category: "Nouvelle catégorie",
  default_category: "Catégorie par défaut",
  default_category_hint: "Une nouvelle dépense s'ouvrira sur celle-ci. Une seule par projet.",
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
  default_from_category: "Ce que dit la catégorie, ou le projet si elle ne dit rien.",
  default_from_group: "Ce que dit le projet pour les dépenses sans catégorie.",
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
  confirm_delete_expense: "Supprimer cette dépense ? Ses parts partent avec elle. L'historique la garde, et peut la restaurer.",
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
  group_rule: "du projet",
  shares_mismatch: "Le total des parts doit égaler le montant.",
  participants: "Participants",
  members: "Membres",
  member_name: "Nom",
  remove_member: "Retirer du projet",
  restore_member: "Réactiver",
  confirm_remove: "Confirmer ?",
  add: "Ajouter",
  close: "Fermer",
  ha_accounts: "Comptes Home Assistant",
  ha_accounts_hint: "Les comptes cochés participent au projet et peuvent l'ouvrir.",
  no_ha_accounts: "Aucun compte trouvé.",
  admin_locked: "L'administrateur ne peut pas partir. Cédez le projet, ou archivez-le.",
  cannot_remove_admin: "L'administrateur ne peut pas partir. Cédez le projet, ou archivez-le.",
  make_admin: "Céder le projet",
  confirm_make_admin: "Céder le projet à cette personne ? Vous redevenez un membre ordinaire, et elle seule pourra le céder ou le supprimer.",
  admin_needs_account: "Seule une personne ayant un compte Home Assistant peut administrer un projet.",
  dashboard: "Sur le tableau de bord",
  dashboard_hint: "Non. Home Assistant ne cloisonne pas les entités : tous les comptes de la maison liraient les soldes de ce projet, membres ou non.",
  dashboard_on: "Mettre ce projet sur le tableau de bord",
  dashboard_on_hint: "Un capteur par membre, et un qui dit s'il reste quelque chose dû. Lisibles par tous les comptes de la maison — pas seulement par les gens de ce projet.",
  permissions: "Ce que les membres peuvent faire",
  permissions_hint: "Identique pour tout le monde dans le projet. Vous et les administrateurs passez toujours au-dessus.",
  perm_manage_members: "Gérer les membres",
  perm_manage_members_hint: "Ajouter, retirer et renommer. Jamais qui est administrateur.",
  perm_manage_categories: "Gérer les catégories",
  perm_manage_categories_hint: "Créer et modifier les catégories et leurs règles.",
  perm_manage_group: "Modifier le projet",
  perm_manage_group_hint: "Le renommer, changer sa règle par défaut, l'archiver.",
  perm_edit_others: "Modifier ce qui n'est pas à eux",
  perm_edit_others_hint: "Changer ou supprimer une dépense qu'un autre a saisie et payée.",
  not_allowed: "Le projet ne vous autorise pas à faire ça.",
  archived_hint: "Ce projet est archivé : plus rien ne peut y être ajouté.",
  guests: "Sans compte",
  guests_hint: "Ils portent des dépenses mais ne se connectent jamais.",
  no_account: "Sans compte",
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
  you: "Toi",
  edit_debt: "Modifier la dette",
  confirm_delete_debt: "Supprimer cette dette ? Elle cesse d'être due.",
  edit_payment: "Modifier le remboursement",
  from_member: "De",
  to_member: "Vers",
  history: "Historique",
  group_history: "Historique du projet",
  no_history: "Rien d'enregistré pour l'instant.",
  history_created: "a ajouté",
  history_updated: "a modifié",
  history_deleted: "a supprimé",
  history_restored: "a restauré",
  restore_entry: "Restaurer",
  the_expense: "la dépense",
  the_payment: "le remboursement",
  the_group: "le projet",
  the_category: "la catégorie",
  the_member: "le membre",
  field_name: "Nom",
  field_role: "Statut",
  permissions_none: "rien",
  yes: "Oui",
  no: "Non",
  someone: "Quelqu'un",
  loading: "Chargement…",
  error_generic: "Une erreur est survenue.",
  group_not_found: "Ce projet n'existe plus.",
  group_archived: "Ce projet est archivé.",
  member_not_found: "Ce membre n'existe plus.",
  member_already_in_group: "Ce membre fait déjà partie du projet.",
  category_not_found: "Cette catégorie n'existe plus.",
  expense_not_found: "Cette dépense n'existe plus.",
  invalid_expense: "Cette dépense est invalide.",
  invalid_expense_shares: "Le total des parts ne correspond pas au montant.",
  invalid_split_rule: "Cette règle de répartition est invalide.",
  payment_not_found: "Ce remboursement n'existe plus.",
  invalid_payment: "Ce remboursement est invalide.",
  not_loaded: "L'intégration n'est pas chargée.",
  unknown_error: "Une erreur est survenue."
}, Ks = { en: Je, fr: Vs };
function ts(e) {
  const t = Ks[e.split("-")[0]] ?? Je;
  return (s) => t[s] ?? Je[s] ?? s;
}
function _(e, t) {
  const s = e?.code;
  return s && s in Je ? t(s) : e?.message || t("error_generic");
}
const z = x`
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
   * The list it drops, which the rules above have nothing to do with.
   *
   * A desktop browser paints the popup from the option's own background, and an
   * option has none — so the popup came out white, wearing the muted grey this
   * select gives its face, and the currencies were barely legible. The face is
   * a suffix and stays muted; the list is a list and reads like one.
   *
   * A phone never saw it: the popup there is a system dialog that ignores the
   * page's CSS.
   */
  .currency option {
    background-color: var(--card-background-color, #fff);
    color: var(--primary-text-color);
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
`, Ys = [
  "manage_members",
  "manage_categories",
  "manage_group",
  "edit_others"
];
var Zs = Object.defineProperty, Js = Object.getOwnPropertyDescriptor, Q = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Js(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Zs(t, s, r), r;
};
let q = class extends m {
  constructor() {
    super(...arguments), this.role = null, this.name = "", this.description = "", this.currency = "EUR", this.permissions = /* @__PURE__ */ new Set(), this.exposed = !1, this.busy = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      this.busy = !0, this.error = void 0;
      const e = {
        name: this.name.trim(),
        description: this.description.trim() || null
      };
      try {
        const t = this.group ? await this.api.updateGroup(this.group.id, {
          ...e,
          ...this.role === "admin" ? { permissions: [...this.permissions], exposed: this.exposed } : {}
        }) : await this.api.createGroup({ ...e, currency: this.currency });
        this.dispatchEvent(
          new CustomEvent(this.group ? "group-saved" : "group-created", {
            detail: { group: t },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (t) {
        this.error = _(t, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.group && (this.name = this.group.name, this.description = this.group.description ?? "", this.currency = this.group.currency, this.permissions = new Set(this.group.permissions), this.exposed = this.group.exposed);
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
            @value-changed=${(s) => this.name = s.detail.value}
          ></se-field>
          <se-field
            .label=${e("description")}
            .value=${this.description}
            @value-changed=${(s) => this.description = s.detail.value}
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
                .options=${vt.map((s) => ({ value: s, label: s }))}
                @value-changed=${(s) => this.currency = s.detail.value}
              ></se-select>`}

          ${this.renderPermissions()} ${this.renderDashboard()}
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
  /**
   * What the project lets its members do.
   *
   * The admin's alone, and shown to nobody else — not even greyed out. A member
   * has no say and no reason to study the list; what they may do, they find out
   * by the panel offering it or not.
   *
   * On a creation there is nothing to show: a new project allows everything,
   * and asking four questions before the first expense is asking them of
   * somebody who has no idea yet.
   */
  renderPermissions() {
    if (!this.group || this.role !== "admin")
      return d;
    const e = this.localize;
    return o`
      <div class="section">
        <h3>${e("permissions")}</h3>
        <div class="muted">${e("permissions_hint")}</div>

        ${Ys.map(
      (t) => o`
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.permissions.has(t)}
                @change=${(s) => this.toggle(t, s)}
              />
              <span class="body">
                <span class="title">${e(`perm_${t}`)}</span>
                <span class="hint"
                  >${e(`perm_${t}_hint`)}</span
                >
              </span>
            </label>
          `
    )}
      </div>
    `;
  }
  /**
   * Whether this project's figures go on the dashboard.
   *
   * The admin's alone, like the permissions, and for a heavier reason: this one
   * takes a wall down rather than moving one. So it says what it does before
   * anybody touches it, rather than after somebody notices.
   *
   * Home Assistant has no wall around entities. The machinery is there — an
   * entity policy per account — but nothing sets it and there is no interface
   * for it, so every account in the house reads every entity's state whatever
   * this integration thinks about who is in which project.
   */
  renderDashboard() {
    if (!this.group || this.role !== "admin")
      return d;
    const e = this.localize;
    return o`
      <div class="section">
        <h3>${e("dashboard")}</h3>

        <label class="switch">
          <input
            type="checkbox"
            .checked=${Qt(this.exposed)}
            @change=${(t) => this.exposed = t.target.checked}
          />
          <span class="body">
            <span class="title">${e("dashboard_on")}</span>
            <span class="hint">${e("dashboard_on_hint")}</span>
          </span>
        </label>

        ${this.exposed ? d : o`<div class="muted">${e("dashboard_hint")}</div>`}
      </div>
    `;
  }
  toggle(e, t) {
    const s = new Set(this.permissions);
    t.target.checked ? s.add(e) : s.delete(e), this.permissions = s;
  }
};
q.styles = [
  z,
  x`
      .switch {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 8px 0;
      }

      .switch input {
        margin-top: 2px;
        flex: 0 0 auto;
      }

      .switch .body {
        min-width: 0;
      }

      .switch .title {
        font-size: 14px;
      }

      .switch .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .section {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        padding-top: 12px;
      }
    `
];
Q([
  l({ attribute: !1 })
], q.prototype, "api", 2);
Q([
  l({ attribute: !1 })
], q.prototype, "localize", 2);
Q([
  l({ attribute: !1 })
], q.prototype, "group", 2);
Q([
  l({ attribute: !1 })
], q.prototype, "role", 2);
Q([
  c()
], q.prototype, "name", 2);
Q([
  c()
], q.prototype, "description", 2);
Q([
  c()
], q.prototype, "currency", 2);
Q([
  c()
], q.prototype, "permissions", 2);
Q([
  c()
], q.prototype, "exposed", 2);
Q([
  c()
], q.prototype, "busy", 2);
Q([
  c()
], q.prototype, "error", 2);
q = Q([
  b("se-group-dialog")
], q);
var Xs = Object.defineProperty, Qs = Object.getOwnPropertyDescriptor, pe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qs(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Xs(t, s, r), r;
};
let se = class extends m {
  constructor() {
    super(...arguments), this.narrow = !1, this.groups = [], this.loading = !0, this.dialogOpen = !1, this.handleCreated = (e) => {
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
          <!-- Home Assistant's own, see the group page's header. -->
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
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
      this.error = _(e, this.localize);
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
se.styles = [
  z,
  x`
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

      /*
       * Full width and standard height, like the group page's and like Home
       * Assistant's own. Both come from there, see the group page's header.
       */
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 16px;
        min-height: var(--header-height, 56px);
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
], se.prototype, "api", 2);
pe([
  l({ attribute: !1 })
], se.prototype, "hass", 2);
pe([
  l({ type: Boolean })
], se.prototype, "narrow", 2);
pe([
  l({ attribute: !1 })
], se.prototype, "localize", 2);
pe([
  c()
], se.prototype, "groups", 2);
pe([
  c()
], se.prototype, "loading", 2);
pe([
  c()
], se.prototype, "error", 2);
pe([
  c()
], se.prototype, "dialogOpen", 2);
se = pe([
  b("se-dashboard-page")
], se);
function j(e, t, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: t
  }).format(e / 100);
}
function Dt(e, t, s) {
  const i = j(e, t, s), r = (e / 100).toFixed(2);
  return [
    i,
    // The same, spelled with the space bar rather than with Intl's own.
    i.replace(/\s/gu, " "),
    r,
    r.replace(".", ",")
  ];
}
function we(e) {
  const t = e.trim().replace(",", ".").replace(/\s/g, "");
  if (t === "" || !/^-?\d*\.?\d*$/.test(t))
    return null;
  const s = Number(t);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function Be(e, t) {
  const s = new Intl.DateTimeFormat(t, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(e));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function ei(e, t) {
  const [s, i] = e.split("-").map(Number), r = new Intl.DateTimeFormat(t, {
    month: "short",
    year: "numeric"
  }).format(new Date(s, i - 1, 1));
  return r.charAt(0).toUpperCase() + r.slice(1);
}
function ss() {
  const e = /* @__PURE__ */ new Date(), t = `${e.getMonth() + 1}`.padStart(2, "0"), s = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${t}-${s}`;
}
function is(e) {
  return (/* @__PURE__ */ new Date(`${e}T12:00:00`)).toISOString();
}
function rs(e) {
  const t = new Date(e), s = `${t.getMonth() + 1}`.padStart(2, "0"), i = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${s}-${i}`;
}
function nt(e) {
  return (e / 100).toFixed(2);
}
function ti(e) {
  return e.trim().split(/\s+/)[0] || e;
}
function Y(e) {
  const t = e.trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
const lt = [
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
function O(e) {
  let t = 0;
  for (let s = 0; s < e.length; s += 1)
    t = t * 31 + e.charCodeAt(s) >>> 0;
  return lt[t % lt.length];
}
var si = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, be = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ii(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && si(t, s, r), r;
};
let le = class extends m {
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
    const e = this.balances.filter((i) => i.amount !== 0);
    if (e.length === 0)
      return o`<div class="settled muted">${this.localize("balance_settled")}</div>`;
    if (this.settlements.length === 0)
      return o`<div>${e.map((i) => this.renderRow(i))}</div>`;
    if (e.length === 2)
      return this.renderDuel(e);
    if (this.meId === null)
      return this.renderGroupView();
    const t = this.settlements.filter(
      (i) => i.from_member_id === this.meId || i.to_member_id === this.meId
    ), s = this.settlements.filter((i) => !t.includes(i));
    return o`
      ${t.length === 0 ? o`<div class="settled muted">${this.localize("you_are_settled")}</div>` : t.map((i) => this.renderMine(i))}
      ${s.length === 0 ? d : o`
            <div class="others">
              ${s.map((i) => this.renderTransfer(i))}
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
    const t = this.localize, s = e.from_member_id === this.meId, i = s ? e.to_member_id : e.from_member_id, r = this.memberById(i), a = r?.name ?? "?", n = o`
      <strong class=${`figure ${s ? "negative" : "positive"}`}>
        ${j(e.amount, this.currency, this.language)}
      </strong>
    `;
    return o`
      <button
        class="mine line-button"
        title=${t("settle_up")}
        @click=${() => this.settle(e)}
      >
        <div class="avatar" style=${`background:${r?.color ?? O(i)}`}>
          ${Y(a)}
        </div>
        <div class="sentence">
          ${s ? o`${t("you_owe")} ${n} ${t("to")} ${a}` : o`${a} ${t("owes_you")} ${n}`}
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
    const t = this.memberById(e), s = t?.name ?? "?";
    return o`
      <span class="party" title=${s}>
        <span
          class="avatar"
          style=${`background:${t?.color ?? O(e)}`}
          >${Y(s)}</span
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
  renderDuel(e) {
    const t = e.find((a) => a.member_id === this.meId), [s, i] = t ? [t, e.find((a) => a !== t)] : [...e].sort((a, n) => n.amount - a.amount), r = this.settlements[0];
    return o`
      <button
        class="duel line-button"
        title=${this.localize("settle_up")}
        ?disabled=${r === void 0}
        @click=${() => r && this.settle(r)}
      >
        ${this.renderSide(s, !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(i, !0)}
      </button>
    `;
  }
  renderSide(e, t) {
    const s = this.memberById(e.member_id), i = e.amount > 0, r = i ? "positive" : "negative", a = o`
      <div class="avatar" style=${`background:${s?.color ?? O(e.member_id)}`}>
        ${Y(s?.name ?? "?")}
      </div>
    `, n = j(Math.abs(e.amount), this.currency, this.language), h = o`
      <div class="body">
        <div class="name">${s?.name ?? "?"}</div>
        <div class=${`verdict ${r}`}>${this.verdict(e, i)}</div>
        <div class=${`figure ${r}`} style=${`--chars:${n.length}`}>${n}</div>
      </div>
    `;
    return o`
      <div class=${`side ${t ? "right" : ""}`}>
        ${t ? d : a}${h}${t ? a : d}
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
    const s = this.localize;
    return e.member_id === this.meId ? s(t ? "you_are_owed" : "you_owe") : s(t ? "must_receive" : "must_pay");
  }
  renderRow(e) {
    const t = this.memberById(e.member_id), s = e.amount > 0, i = s ? "positive" : "negative";
    return o`
      <div class="row">
        <div class="avatar" style=${`background:${t?.color ?? O(e.member_id)}`}>
          ${Y(t?.name ?? "?")}
        </div>
        <span class="name">${t?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${i}`}>
            ${s ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${i}`}>
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
le.styles = [
  z,
  x`
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

      /*
       * Half the card each, and a container so the figure can size itself to
       * what it actually got.
       *
       * Safe to contain: this is flex 1 1 0%, so its width already comes from
       * the layout and never from what is inside it.
       */
      .side {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        container-type: inline-size;
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

      /*
       * As big as it can be and still fit the half of the card it was given.
       *
       * An amount is one unbreakable token: Intl separates the thousands with a
       * non-breaking space, so there is no break to take, no ellipsis worth
       * putting on a number, and nothing in CSS to catch it. At a fixed 22px it
       * simply ran over the divider and onto the other side — and not only in
       * theory: 2 238,77 € spilled 8px on a 380px phone, which is an ordinary
       * balance on an ordinary phone.
       *
       * So the type gives way to the figure rather than the figure to the type.
       * tabular-nums makes every digit the same width, so the count of
       * characters is what the width is proportional to; 46px is the avatar and
       * the gap it sits behind, the only other claim on the side. The factor
       * was measured, and leaves a margin: a 22px figure runs about 0.47px per
       * character per pixel of type.
       *
       * min(), so nothing is ever shrunk that had the room: a phone shrinks,
       * a desktop keeps its 22px.
       */
      .figure {
        font-size: min(22px, calc((100cqw - 46px) * 2 / var(--chars, 10)));
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
        white-space: nowrap;
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
be([
  l({ attribute: !1 })
], le.prototype, "localize", 2);
be([
  l({ attribute: !1 })
], le.prototype, "balances", 2);
be([
  l({ attribute: !1 })
], le.prototype, "settlements", 2);
be([
  l({ attribute: !1 })
], le.prototype, "members", 2);
be([
  l({ type: String })
], le.prototype, "meId", 2);
be([
  l({ type: String })
], le.prototype, "currency", 2);
be([
  l({ type: String })
], le.prototype, "language", 2);
le = be([
  b("se-balance-card")
], le);
var ri = Object.defineProperty, ai = Object.getOwnPropertyDescriptor, Ie = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ai(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && ri(t, s, r), r;
};
let ye = class extends m {
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
ye.styles = x`
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
Ie([
  l({ type: String })
], ye.prototype, "icon", 2);
Ie([
  l({ type: String })
], ye.prototype, "fallback", 2);
Ie([
  l({ type: String })
], ye.prototype, "color", 2);
Ie([
  l({ type: Number })
], ye.prototype, "size", 2);
Ie([
  l({ type: Boolean })
], ye.prototype, "plain", 2);
ye = Ie([
  b("se-icon")
], ye);
var oi = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, Le = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ni(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && oi(t, s, r), r;
};
let ke = class extends m {
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

        ${lt.map(
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
ke.styles = [
  z,
  x`
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
Le([
  l({ attribute: !1 })
], ke.prototype, "localize", 2);
Le([
  l({ type: String })
], ke.prototype, "label", 2);
Le([
  l({ type: String })
], ke.prototype, "value", 2);
Le([
  l({ type: String })
], ke.prototype, "fallback", 2);
ke = Le([
  b("se-color-picker")
], ke);
var li = Object.defineProperty, ci = Object.getOwnPropertyDescriptor, ue = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ci(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && li(t, s, r), r;
};
const Mt = "/static/mdi/iconList.json", at = 48;
let We = null;
function di() {
  return We === null && (We = fetch(Mt).then((e) => {
    if (!e.ok)
      throw new Error(`${e.status} on ${Mt}`);
    return e.json();
  }).catch((e) => {
    throw We = null, e;
  })), We;
}
let ie = class extends m {
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
        this.icons = await di();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(e) {
    const t = e.trim().toLowerCase();
    if (t === "") {
      this.suggestions = this.icons.slice(0, at);
      return;
    }
    const s = [], i = [], r = [];
    for (const a of this.icons)
      if (a.name.startsWith(t) ? s.push(a) : a.name.includes(t) ? i.push(a) : a.keywords?.some((n) => n.includes(t)) && r.push(a), s.length >= at)
        break;
    this.suggestions = [...s, ...i, ...r].slice(0, at);
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
ie.styles = [
  z,
  x`
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
ue([
  l({ attribute: !1 })
], ie.prototype, "localize", 2);
ue([
  l({ type: String })
], ie.prototype, "label", 2);
ue([
  l({ type: String })
], ie.prototype, "value", 2);
ue([
  l({ type: String })
], ie.prototype, "color", 2);
ue([
  c()
], ie.prototype, "icons", 2);
ue([
  c()
], ie.prototype, "suggestions", 2);
ue([
  c()
], ie.prototype, "open", 2);
ue([
  c()
], ie.prototype, "failed", 2);
ie = ue([
  b("se-icon-picker")
], ie);
function as(e) {
  const { amount: t, payerId: s, memberIds: i } = e;
  if (!Number.isInteger(t) || t <= 0)
    return null;
  const r = [...new Set(i)];
  if (r.length === 0 || !r.includes(s))
    return null;
  const a = e.rule ?? {}, n = hi(a, t);
  if (n === null)
    return null;
  const h = a.participants == null ? r : [...new Set(a.participants)];
  if (h.some((A) => !r.includes(A)))
    return null;
  const p = h.length === 0 ? 0 : n, y = ct(p, h), S = t - p;
  if (S > 0) {
    const A = pi(a.remainder, S, s, r);
    if (A === null)
      return null;
    for (const [E, Fe] of Object.entries(A))
      y[E] = (y[E] ?? 0) + Fe;
  }
  const u = {};
  for (const [A, E] of Object.entries(y))
    E !== 0 && (u[A] = E);
  return Object.values(u).reduce((A, E) => A + E, 0) === t ? u : null;
}
function hi(e, t) {
  return e.envelope == null ? t : e.envelope < 0 ? null : Math.min(e.envelope, t);
}
const ot = 1e4;
function pi(e, t, s, i) {
  const r = e ?? {}, a = r.fixed ?? {}, n = r.percent ?? {};
  for (const [g, R] of Object.entries(a))
    if (!i.includes(g) || R < 0)
      return null;
  for (const [g, R] of Object.entries(n))
    if (!i.includes(g) || R < 0)
      return null;
  const h = r.members == null ? [s] : [...new Set(r.members)];
  if (h.length === 0 || h.some((g) => !i.includes(g)))
    return null;
  const p = {}, y = {};
  for (const g of h)
    g in a && (p[g] = a[g]), g in n && (y[g] = n[g]);
  if (Object.keys(p).some((g) => g in y))
    return null;
  const S = Object.values(y).reduce((g, R) => g + R, 0);
  if (S > ot)
    return null;
  const u = {};
  for (const [g, R] of Object.entries(y))
    u[g] = Math.floor(t * R / ot);
  const A = Object.values(p).reduce((g, R) => g + R, 0) + Object.values(u).reduce((g, R) => g + R, 0);
  if (A > t)
    return null;
  const E = { ...p, ...u }, Fe = h.filter(
    (g) => !(g in p) && !(g in y)
  ), it = t - A;
  if (Fe.length > 0) {
    for (const [g, R] of Object.entries(ct(it, Fe)))
      E[g] = (E[g] ?? 0) + R;
    return E;
  }
  if (it === 0)
    return E;
  if (S === ot && Object.keys(y).length > 0) {
    for (const [g, R] of Object.entries(
      ct(it, Object.keys(u))
    ))
      E[g] = (E[g] ?? 0) + R;
    return E;
  }
  return null;
}
function ct(e, t) {
  if (e <= 0 || t.length === 0)
    return {};
  const s = Math.floor(e / t.length), i = e % t.length, r = {};
  return t.forEach((a, n) => {
    r[a] = s + (n < i ? 1 : 0);
  }), r;
}
const Rt = 1e4;
function _t(e) {
  if (e === null)
    return "default";
  const t = Object.keys(e.remainder?.percent ?? {}), s = Object.keys(e.remainder?.fixed ?? {});
  if (t.length > 0 && s.length > 0)
    return "custom";
  if (e.envelope === 0)
    return "exact";
  if (t.length > 0)
    return "custom";
  const i = e.remainder?.members ?? [], r = Object.keys(e.remainder?.fixed ?? {});
  return e.envelope == null && i.length === 0 && r.length === 0 ? "equal" : i.length <= 1 && r.length === 0 ? "partial" : "custom";
}
function ui(e, t) {
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
      remainder: t.unit === "percent" ? { members: [...t.participants], percent: Ut(t) } : { members: [...t.participants], fixed: Nt(t) }
    };
  const s = t.envelopeInput.trim() === "" ? null : we(t.envelopeInput.trim()), i = t.participants.size === t.memberIds.length ? null : [...t.participants];
  return e === "custom" ? {
    envelope: s,
    participants: i,
    remainder: {
      // Nobody ticked: whoever paid takes it, which the model says with null.
      members: t.takers.size === 0 ? null : [...t.takers],
      fixed: Nt(t, t.takers),
      // Written back untouched. The panel offers no way to type a share here
      // — the `percent` mode is where that lives — but a rule that arrived
      // with some keeps them: dropping what an editor cannot show is how a
      // save quietly rewrites what people owe.
      percent: Ut(t, t.takers)
    }
  } : {
    envelope: s,
    participants: i,
    // Nobody named: whoever paid takes it, which the model says with null.
    remainder: { members: t.restTo ? [t.restTo] : null, fixed: {} }
  };
}
function mi(e, t, s) {
  const i = _t(e), r = e?.remainder?.members ?? (s ? [s] : []);
  return {
    participants: i === "exact" ? new Set(r) : new Set(e?.participants ?? t),
    takers: new Set(r),
    envelopeInput: e?.envelope != null ? Bt(e.envelope) : "",
    amounts: Object.fromEntries(
      Object.entries(e?.remainder?.fixed ?? {}).map(([n, h]) => [
        n,
        Bt(h)
      ])
    ),
    percents: Object.fromEntries(
      Object.entries(e?.remainder?.percent ?? {}).map(([n, h]) => [
        n,
        gi(h)
      ])
    ),
    // One taker is a person to name. Several is a shape this editor has no room
    // for, so the rest falls back to whoever paid — as `partial` reads it.
    restTo: i === "partial" && e?.remainder?.members?.length === 1 ? e.remainder.members[0] : s ?? "",
    // Whichever the rule was written in. A rule with neither is an equal split
    // dressed as `exact`, and money is the one to offer first.
    unit: Object.keys(e?.remainder?.percent ?? {}).length > 0 ? "percent" : "money",
    memberIds: t
  };
}
function Nt(e, t = e.participants) {
  const s = {};
  for (const [i, r] of Object.entries(e.amounts)) {
    if (!t.has(i) || r.trim() === "")
      continue;
    const a = we(r);
    a !== null && (s[i] = a);
  }
  return s;
}
function Ut(e, t = e.participants) {
  const s = {};
  for (const [i, r] of Object.entries(e.percents)) {
    if (!t.has(i) || r.trim() === "")
      continue;
    const a = os(r);
    a !== null && (s[i] = a);
  }
  return s;
}
function os(e) {
  const t = e.trim().replace(",", ".");
  if (t === "")
    return null;
  const s = Number(t);
  return Number.isFinite(s) ? Math.round(s * 100) : null;
}
function gi(e) {
  return e % 100 === 0 ? String(e / 100) : (e / 100).toFixed(2);
}
function Bt(e) {
  return (e / 100).toFixed(2);
}
var fi = Object.defineProperty, yi = Object.getOwnPropertyDescriptor, D = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? yi(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && fi(t, s, r), r;
};
const bi = 8542, qt = ["equal", "exact", "partial", "custom"];
let I = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.mode = "equal", this.participants = /* @__PURE__ */ new Set(), this.envelopeInput = "", this.amounts = {}, this.percents = {}, this.unit = "money", this.restTo = "", this.takers = /* @__PURE__ */ new Set();
  }
  connectedCallback() {
    super.connectedCallback(), this.mode = _t(this.rule);
    const e = mi(
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
    return this.amount != null && this.amount > 0 ? this.amount : bi;
  }
  renderPanel() {
    const e = this.localize, t = this.shares();
    return o`
      <div class="panel">
        <se-select
          .label=${e("split_how")}
          .value=${this.mode}
          .options=${this.offered().map((s) => ({
      value: s,
      label: e(`split_${s}`)
    }))}
          @value-changed=${(s) => this.pick(s.detail.value)}
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
    const e = this.inherits ? ["default", ...qt] : [...qt];
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
    const t = this.localize, s = this.unit === "percent", i = this.percentTotal();
    return o`
      <div>
        <div class="head">
          <div>
            <div class="muted">
              ${t(s ? "split_percent_hint" : "split_exact_hint")}
            </div>
            <div class="muted example">
              ${t(s ? "split_percent_example" : "split_exact_example")}
            </div>
          </div>
          <div class="units" role="group">
            <button
              aria-pressed=${!s}
              @click=${() => this.setUnit("money")}
            >
              ${this.currency}
            </button>
            <button
              aria-pressed=${s}
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
              ${s ? o`<span class="share">${this.shareOf(e, r.id)}</span>` : d}
              <!--
                In money, an empty field says in grey what it would come to:
                that is what a placeholder is for, and it answers the only
                question the mode raises. In percent the figure needs its own
                column, the field being the share itself.
              -->
              <se-field
                .value=${(s ? this.percents : this.amounts)[r.id] ?? ""}
                .suffix=${s ? "%" : this.currency}
                .disabled=${!this.participants.has(r.id)}
                decimal
                placeholder=${s ? "—" : this.shareOf(e, r.id) || this.localize("split_the_rest_short")}
                @value-changed=${(a) => s ? this.setPercent(r.id, a.detail.value) : this.setAmount(r.id, a.detail.value)}
              ></se-field>
            </div>
          `
    )}

        ${s ? o`
              <div class="total">
                <span class="muted">${t("split_percent_total")}</span>
                <strong class=${i > Rt ? "negative" : ""}>
                  ${(i / 100).toFixed(i % 100 === 0 ? 0 : 2)} %
                </strong>
              </div>
              ${i > Rt ? o`<div class="warn">${t("split_percent_over")}</div>` : d}
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
    for (const [t, s] of Object.entries(this.percents))
      this.participants.has(t) && (e += os(s) ?? 0);
    return e;
  }
  setPercent(e, t) {
    this.percents = { ...this.percents, [e]: t }, this.emit();
  }
  /** An amount shared between some; whatever is left goes to one person. */
  renderPartial(e) {
    const t = this.localize, s = we(this.envelopeInput), i = s === null ? null : Math.max(this.previewAmount - s, 0);
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
          ${i === null ? d : o`<span class="figure">(${this.money(i)})</span>`}
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
        @value-changed=${(s) => this.setEnvelope(s.detail.value)}
      ></se-field>

      <div>
        <div class="muted">${t("split_shared_between")}</div>
        ${this.members.map(
      (s) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(s.id)}
                @change=${() => this.toggleParticipant(s.id)}
              />
              ${this.renderAvatar(s)}
              <span class="name">${s.name}</span>
              <span class="share">${this.shareOf(e, s.id)}</span>
            </div>
          `
    )}
      </div>

      <div>
        <div class="muted">${t("split_rest_between")}</div>
        <div class="muted">${t("split_rest_between_hint")}</div>
        ${this.members.map(
      (s) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.takers.has(s.id)}
                @change=${() => this.toggleTaker(s.id)}
              />
              ${this.renderAvatar(s)}
              <span class="name">${s.name}</span>
              <se-field
                .value=${this.amounts[s.id] ?? ""}
                .suffix=${this.currency}
                .disabled=${!this.takers.has(s.id)}
                decimal
                placeholder="—"
                @value-changed=${(i) => this.setAmount(s.id, i.detail.value)}
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
      const { [e]: s, ...i } = this.amounts;
      this.amounts = i;
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
    const t = this.members.find((s) => s.id === this.payerId) ?? this.members[0];
    return t ? as({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((s) => s.id),
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
      <div class="avatar" style=${`background:${e.color ?? O(e.id)}`}>
        ${Y(e.name)}
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
    if (this.mode = e, e !== "partial" && e !== "custom" && (this.envelopeInput = ""), e !== "exact" && e !== "custom" && (this.amounts = {}), e !== "exact" && (this.percents = {}), e === "exact" != (t === "exact") && (this.amounts = {}), e === "exact" && this.participants.size === 0 && (this.participants = new Set(this.members.map((s) => s.id))), e === "partial" && (this.restTo = this.restTo || [...this.takers][0] || this.payerId || ""), e === "custom" && this.takers.size === 0) {
      const s = this.restTo || this.payerId;
      this.takers = s ? /* @__PURE__ */ new Set([s]) : /* @__PURE__ */ new Set();
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
      const { [e]: s, ...i } = this.amounts;
      this.amounts = i;
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
    return ui(this.mode, {
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
I.styles = [
  z,
  x`
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
], I.prototype, "localize", 2);
D([
  l({ attribute: !1 })
], I.prototype, "members", 2);
D([
  l({ attribute: !1 })
], I.prototype, "rule", 2);
D([
  l({ type: String })
], I.prototype, "currency", 2);
D([
  l({ type: String })
], I.prototype, "language", 2);
D([
  l({ type: Number })
], I.prototype, "amount", 2);
D([
  l({ type: String })
], I.prototype, "payerId", 2);
D([
  l({ type: String })
], I.prototype, "inherits", 2);
D([
  c()
], I.prototype, "mode", 2);
D([
  c()
], I.prototype, "participants", 2);
D([
  c()
], I.prototype, "envelopeInput", 2);
D([
  c()
], I.prototype, "amounts", 2);
D([
  c()
], I.prototype, "percents", 2);
D([
  c()
], I.prototype, "unit", 2);
D([
  c()
], I.prototype, "restTo", 2);
D([
  c()
], I.prototype, "takers", 2);
I = D([
  b("se-split-rule-editor")
], I);
var vi = Object.defineProperty, _i = Object.getOwnPropertyDescriptor, L = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? _i(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && vi(t, s, r), r;
};
let M = class extends m {
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
        this.error = _(t, this.localize);
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
            @value-changed=${(s) => this.name = s.detail.value}
          ></se-field>

          <se-icon-picker
            .localize=${this.localize}
            .label=${e("icon")}
            .value=${this.icon}
            .color=${this.effectiveColor()}
            @value-changed=${(s) => this.icon = s.detail.value}
          ></se-icon-picker>

          <se-color-picker
            .localize=${this.localize}
            .label=${e("color")}
            .value=${this.color}
            .fallback=${this.autoColor()}
            @value-changed=${(s) => this.color = s.detail.value}
          ></se-color-picker>

          <div>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                @change=${(s) => this.isDefault = s.target.checked}
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
              @rule-changed=${(s) => this.rule = s.detail.rule}
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
    return O(this.category?.id ?? this.name);
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
M.styles = z;
L([
  l({ attribute: !1 })
], M.prototype, "api", 2);
L([
  l({ attribute: !1 })
], M.prototype, "localize", 2);
L([
  l({ attribute: !1 })
], M.prototype, "group", 2);
L([
  l({ attribute: !1 })
], M.prototype, "members", 2);
L([
  l({ attribute: !1 })
], M.prototype, "category", 2);
L([
  l({ type: String })
], M.prototype, "language", 2);
L([
  c()
], M.prototype, "name", 2);
L([
  c()
], M.prototype, "icon", 2);
L([
  c()
], M.prototype, "color", 2);
L([
  c()
], M.prototype, "rule", 2);
L([
  c()
], M.prototype, "isDefault", 2);
L([
  c()
], M.prototype, "busy", 2);
L([
  c()
], M.prototype, "error", 2);
M = L([
  b("se-category-dialog")
], M);
var $i = Object.defineProperty, xi = Object.getOwnPropertyDescriptor, he = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? xi(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && $i(t, s, r), r;
};
let X = class extends m {
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
        this.error = _(e, this.localize);
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
X.styles = [
  z,
  x`
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
he([
  l({ attribute: !1 })
], X.prototype, "api", 2);
he([
  l({ attribute: !1 })
], X.prototype, "localize", 2);
he([
  l({ attribute: !1 })
], X.prototype, "group", 2);
he([
  l({ attribute: !1 })
], X.prototype, "members", 2);
he([
  l({ type: String })
], X.prototype, "language", 2);
he([
  c()
], X.prototype, "rule", 2);
he([
  c()
], X.prototype, "isDefault", 2);
he([
  c()
], X.prototype, "busy", 2);
he([
  c()
], X.prototype, "error", 2);
X = he([
  b("se-group-rule-dialog")
], X);
function dt(e, t, s, i) {
  if (e === null)
    return t("split_equal");
  const r = _t(e);
  if (r === "equal") {
    const a = e.participants?.length;
    return a ? `${t("split_equal")} · ${a}` : t("split_equal");
  }
  return r === "exact" ? Object.keys(e.remainder?.percent ?? {}).length > 0 ? wi(e, t) : t("split_exact") : r === "partial" ? e.envelope == null ? t("split_partial") : `${j(e.envelope, s, i)} ${t("split_shared_lower")}` : t("split_custom");
}
function wi(e, t) {
  const s = Object.values(e.remainder?.percent ?? {});
  return s.length === 0 ? t("split_percent") : s.map((i) => i % 100 === 0 ? String(i / 100) : (i / 100).toFixed(2)).join(" / ").concat(" %");
}
var ki = Object.defineProperty, Si = Object.getOwnPropertyDescriptor, W = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Si(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && ki(t, s, r), r;
};
let N = class extends m {
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
          .color=${e.color ?? O(e.id)}
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
            ${dt(
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
    return e.split_rule === null ? this.localize("rule_from_group") : dt(
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
      this.error = _(e, this.localize);
    } finally {
      this.loading = !1;
    }
  }
};
N.styles = [
  z,
  x`
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
W([
  l({ attribute: !1 })
], N.prototype, "api", 2);
W([
  l({ attribute: !1 })
], N.prototype, "localize", 2);
W([
  l({ attribute: !1 })
], N.prototype, "group", 2);
W([
  l({ attribute: !1 })
], N.prototype, "members", 2);
W([
  l({ type: String })
], N.prototype, "language", 2);
W([
  c()
], N.prototype, "categories", 2);
W([
  c()
], N.prototype, "editing", 2);
W([
  c()
], N.prototype, "creating", 2);
W([
  c()
], N.prototype, "editingGroupRule", 2);
W([
  c()
], N.prototype, "loading", 2);
W([
  c()
], N.prototype, "error", 2);
W([
  c()
], N.prototype, "dirty", 2);
N = W([
  b("se-categories-dialog")
], N);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zi = Zt(class extends Jt {
  constructor() {
    super(...arguments), this.key = d;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, s]) {
    return t !== this.key && (Xt(e), this.key = t), s;
  }
});
var Ci = Object.defineProperty, Pi = Object.getOwnPropertyDescriptor, V = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Pi(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ci(t, s, r), r;
};
let U = class extends m {
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
            .value=${this.typed || (t === null ? "" : jt(t))}
            decimal
            placeholder="0,87681"
            @value-changed=${(s) => this.type(s.detail.value)}
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
    const s = this.amount === null ? null : Fs(this.amount, e);
    return o`
      ${this.fetched?.stale && !this.typed ? o`<div class="stale">
            ${t("rate_stale")}
            ${Be(this.fetched.as_of, this.language)}
          </div>` : d}
      <div>
        1 ${this.currency} = ${jt(e)} ${this.groupCurrency}
        ${s === null ? d : o`<br />${t("converts_to")}
              <strong>
                ${j(s, this.groupCurrency, this.language)}
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
    return this.typed.trim() ? Ws(this.typed) : this.currency === this.groupCurrency ? 1e6 : this.fetched?.rate ?? null;
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
      this.fetched = void 0, this.error = t?.code === "exchange_rate_unavailable" ? this.localize("rate_unavailable") : _(t, this.localize);
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
  x`
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
V([
  l({ attribute: !1 })
], U.prototype, "api", 2);
V([
  l({ attribute: !1 })
], U.prototype, "localize", 2);
V([
  l({ type: String })
], U.prototype, "groupId", 2);
V([
  l({ type: String })
], U.prototype, "groupCurrency", 2);
V([
  l({ type: String })
], U.prototype, "currency", 2);
V([
  l({ type: String })
], U.prototype, "on", 2);
V([
  l({ type: Number })
], U.prototype, "amount", 2);
V([
  l({ type: String })
], U.prototype, "language", 2);
V([
  c()
], U.prototype, "fetched", 2);
V([
  c()
], U.prototype, "typed", 2);
V([
  c()
], U.prototype, "busy", 2);
V([
  c()
], U.prototype, "error", 2);
U = V([
  b("se-currency-field")
], U);
const Ai = {
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
  kind: "kind_label",
  // The project, its categories and its people.
  name: "field_name",
  icon: "icon",
  color: "color",
  archived: "archived",
  default_category_id: "default_category",
  split_rule: "default_split",
  permissions: "permissions",
  role: "field_role"
};
function Ei(e, t) {
  const s = Ai[e.field];
  return s ? {
    label: t.localize(s),
    before: Ht(e.field, e.before, t),
    after: Ht(e.field, e.after, t)
  } : null;
}
function Ht(e, t, s) {
  return t == null ? null : e === "amount" && typeof t == "number" ? j(t, s.currency, s.language) : e === "expense_date" || e === "payment_date" ? Be(String(t), s.language) : e === "category_id" ? s.categories.find((i) => i.id === t)?.name ?? s.localize("no_category") : e === "paid_by_member_id" || e === "from_member_id" || e === "to_member_id" ? ns(String(t), s) : e === "shares" && Ii(t) ? Oi(t, s) : e === "kind" ? s.localize(
    t === "debt" ? "kind_debt" : "kind_reimbursement"
  ) : e === "role" ? s.localize(t === "admin" ? "role_admin" : "role_member") : e === "archived" ? s.localize(t ? "yes" : "no") : e === "split_rule" ? dt(
    t,
    s.localize,
    s.currency,
    s.language
  ) : e === "permissions" && Array.isArray(t) ? t.length === 0 ? s.localize("permissions_none") : t.map((i) => s.localize(`perm_${i}`)).join(" · ") : String(t);
}
function Oi(e, t) {
  const s = Object.entries(e).filter(([, i]) => i !== 0);
  return s.length === 0 ? "—" : s.map(
    ([i, r]) => `${ns(i, t)} ${j(r, t.currency, t.language)}`
  ).join(" · ");
}
function ns(e, t) {
  return t.members.find((s) => s.id === e)?.name ?? "?";
}
function Ii(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e) && Object.values(e).every((t) => typeof t == "number");
}
var Ti = Object.defineProperty, ji = Object.getOwnPropertyDescriptor, ae = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ji(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ti(t, s, r), r;
};
const Di = {
  expense: "the_expense",
  payment: "the_payment",
  group: "the_group",
  category: "the_category",
  member: "the_member"
};
let G = class extends m {
  constructor() {
    super(...arguments), this.revisions = [], this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.withSubject = !1, this.expenses = [], this.payments = [], this.restorable = !1;
  }
  render() {
    return this.revisions.length === 0 ? o`<div class="empty">${this.localize("no_history")}</div>` : o`${this.revisions.map((e) => this.renderEntry(e))}`;
  }
  renderEntry(e) {
    const t = this.actorOf(e), s = t?.name ?? this.localize("someone"), i = this.stillThere(e) !== void 0, r = this.withSubject ? this.subjectOf(e) : null, a = o`
      <div
        class="avatar"
        style=${`background:${t?.color ?? O(e.actor_user_id ?? e.id)}`}
      >
        ${Y(s)}
      </div>
      <div class="body">
        <div class="head">
          <span class="who">${s}</span>
          <!--
            When, whose, how much — stacked on the right, where the expense list
            keeps its figures too. An amount belongs at the edge a reader scans
            for one, and the name belongs beside it rather than in a sentence of
            its own: "Paid by Antonin" on its own line said one word of use and
            three of ceremony.
          -->
          <span class="stamp">
            <span class="when">${Be(e.at, this.language)}</span>
            ${r ? o`<span class="whose">${r.whose}</span>
                  <span class="sum">${r.money}</span>` : d}
          </span>
        </div>
        <div class="what">${this.headline(e)}</div>
        ${this.renderChanges(e)} ${this.renderRestore(e)}
      </div>
      ${i ? o`<span class="chevron">›</span>` : d}
    `;
    return i ? o`<button class="entry entry-button" @click=${() => this.pick(e)}>
          ${a}
        </button>` : o`<div class="entry">${a}</div>`;
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
   * Bring back what this line took away.
   *
   * Offered on a deletion, and only while the thing is still gone.
   */
  renderRestore(e) {
    return e.entity_type !== "expense" && e.entity_type !== "payment" || e.action !== "deleted" || !this.restorable || this.stillThere(e) !== void 0 ? d : o`
      <button class="link restore" @click=${() => this.restore(e)}>
        ${this.localize("restore_entry")}
      </button>
    `;
  }
  restore(e) {
    this.dispatchEvent(
      new CustomEvent("revision-restored", {
        detail: { entityType: e.entity_type, entityId: e.entity_id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /** The expense or payment an entry is about, while the group still holds it. */
  stillThere(e) {
    if (e.entity_type === "expense")
      return this.expenses.find((t) => t.id === e.entity_id);
    if (e.entity_type === "payment")
      return this.payments.find((t) => t.id === e.entity_id);
  }
  /**
   * What the entry is about: the money, and whose it is.
   *
   * A revision carries what moved, and nothing else. So an entry that changed a
   * date says "changed the expense" and then "Date, the 3rd → the 4th", and
   * whoever reads it a month later has no idea which 40 euros that was. The
   * amount and the person are what tell one shop from another.
   *
   * Read off the expense as it stands, not as it stood: this is here to point
   * at a thing, not to describe a past. The line above already says what moved.
   * A deleted one has no "as it stands", so the deletion is asked instead — the
   * only place it is still written down, and it froze exactly this.
   *
   * Null inside one expense's own history, like the title beside it: you got
   * there from the expense, and telling you which expense it is is telling you
   * what you just pressed.
   */
  subjectOf(e) {
    const t = this.stillThere(e);
    return t ? {
      money: j(t.amount, t.currency, this.language),
      whose: this.whoseOf(t)
    } : this.subjectFromDeletion(e);
  }
  /**
   * Who the money is about: the payer, or both parties to a payment.
   *
   * The name and nothing else. It sits between a date and an amount, where
   * every line is one fact, and "Paid by" would be the only ceremony in the
   * column — a name next to a figure is already read as whose figure it is.
   */
  whoseOf(e) {
    return "paid_by_member_id" in e ? this.nameOf(e.paid_by_member_id) : `${this.nameOf(e.from_member_id)} → ${this.nameOf(e.to_member_id)}`;
  }
  /**
   * The same facts, for something the group no longer holds.
   *
   * Its own deletion froze them, and this list has it: every revision of the
   * group is here, so the deletion of the thing this entry is about is a few
   * rows down. An entry from before there were snapshots may be missing the
   * amount, in which case there is nothing honest to show and nothing is shown.
   */
  subjectFromDeletion(e) {
    if (e.entity_type !== "expense" && e.entity_type !== "payment")
      return null;
    const t = this.revisions.find(
      (h) => h.entity_id === e.entity_id && h.action === "deleted"
    );
    if (!t)
      return null;
    const s = new Map(t.changes.map((h) => [h.field, h.before])), i = s.get("amount");
    if (typeof i != "number")
      return null;
    const r = String(s.get("currency") ?? this.currency), a = s.get("paid_by_member_id"), n = typeof a == "string" ? this.nameOf(a) : `${this.nameOf(String(s.get("from_member_id")))} → ${this.nameOf(
      String(s.get("to_member_id"))
    )}`;
    return { money: j(i, r, this.language), whose: n };
  }
  /** What a member goes by, or "?" rather than a ULID leaking into a column. */
  nameOf(e) {
    const t = this.members.find((s) => s.id === e);
    return t ? ti(t.name) : "?";
  }
  /**
   * What happened, in one line.
   *
   * Reads as a sentence rather than a code: "modified the expense", and in the
   * group journal, which one.
   */
  headline(e) {
    const t = this.localize, s = t(Di[e.entity_type]), i = t(`history_${e.action}`), r = this.withSubject && e.entity_label ? ` "${e.entity_label}"` : "";
    return `${i} ${s}${r}`;
  }
  /**
   * The changes, dropping the ones this version cannot say.
   *
   * Only what moved gets spelled out. A creation lists everything it was born
   * with, which on the group journal would drown out the changes that actually
   * mean something; a deletion takes every field there is, so naming them one
   * by one says only what "deleted" already said; and a restore is a deletion
   * read backwards. What a thing holds can be read on the thing itself — and
   * for a deletion, on the restore that brings it back.
   */
  renderChanges(e) {
    if (e.action !== "updated")
      return d;
    const t = {
      localize: this.localize,
      members: this.members,
      categories: this.categories,
      currency: this.currency,
      language: this.language
    }, s = e.changes.map((i) => Ei(i, t)).filter((i) => i !== null);
    return o`
      ${s.map(
      (i) => o`
          <div class="change">
            <span class="field">${i.label}</span>
            ${i.before === null ? d : o`<span class="before">${i.before}</span>
                  <span class="arrow">→</span>`}
            ${i.after === null ? o`<span class="after">—</span>` : o`<span class="after">${i.after}</span>`}
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
G.styles = [
  z,
  x`
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

      /* The date, and the money under it. Pushed to the edge together. */
      .stamp {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex: 0 0 auto;
      }

      .when {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .sum {
        font-size: 13px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      .what {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      /* Whose the figure below is. One word, so it never pushes the money. */
      .whose {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      /* Reads as a link, on the line whose deletion it undoes. See .link. */
      .restore {
        margin-top: 4px;
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
ae([
  l({ attribute: !1 })
], G.prototype, "localize", 2);
ae([
  l({ attribute: !1 })
], G.prototype, "revisions", 2);
ae([
  l({ attribute: !1 })
], G.prototype, "members", 2);
ae([
  l({ attribute: !1 })
], G.prototype, "categories", 2);
ae([
  l({ type: String })
], G.prototype, "currency", 2);
ae([
  l({ type: String })
], G.prototype, "language", 2);
ae([
  l({ type: Boolean })
], G.prototype, "withSubject", 2);
ae([
  l({ attribute: !1 })
], G.prototype, "expenses", 2);
ae([
  l({ attribute: !1 })
], G.prototype, "payments", 2);
ae([
  l({ type: Boolean })
], G.prototype, "restorable", 2);
G = ae([
  b("se-history")
], G);
var Mi = Object.defineProperty, Ri = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ri(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Mi(t, s, r), r;
};
let B = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.open = !1, this.busy = !1, this.toggle = async () => {
      if (this.open = !this.open, !(!this.open || this.revisions || this.busy)) {
        this.busy = !0, this.error = void 0;
        try {
          this.revisions = await this.api.listEntityRevisions(this.groupId, this.entityId);
        } catch (e) {
          this.error = _(e, this.localize);
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
B.styles = [
  z,
  x`
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

    `
];
K([
  l({ attribute: !1 })
], B.prototype, "api", 2);
K([
  l({ attribute: !1 })
], B.prototype, "localize", 2);
K([
  l({ type: String })
], B.prototype, "groupId", 2);
K([
  l({ type: String })
], B.prototype, "entityId", 2);
K([
  l({ attribute: !1 })
], B.prototype, "members", 2);
K([
  l({ attribute: !1 })
], B.prototype, "categories", 2);
K([
  l({ type: String })
], B.prototype, "currency", 2);
K([
  l({ type: String })
], B.prototype, "language", 2);
K([
  c()
], B.prototype, "open", 2);
K([
  c()
], B.prototype, "revisions", 2);
K([
  c()
], B.prototype, "busy", 2);
K([
  c()
], B.prototype, "error", 2);
B = K([
  b("se-entity-history")
], B);
var Ni = Object.defineProperty, Ui = Object.getOwnPropertyDescriptor, k = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ui(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ni(t, s, r), r;
};
let $ = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = ss(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.editingSplit = !1, this.showDescription = !1, this.currency = "", this.rate = null, this.pickCategory = (e) => {
      this.categoryId = e.detail.value, this.rule = null;
    }, this.pickCurrency = (e) => {
      this.currency = e.target.value, this.rate = this.currency === this.group.currency ? Z : null;
    }, this.handleRate = (e) => {
      this.currency = e.detail.currency, this.rate = e.detail.rate;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const e = we(this.amountInput), t = this.resolved(e);
      if (e === null || !t)
        return;
      this.busy = !0, this.error = void 0;
      const s = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: e,
        paid_by_member_id: this.paidBy,
        expense_date: is(this.date),
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
        ...this.rate !== null && this.rate !== Z ? { exchange_rate: this.rate } : {},
        split_rule: this.rule ?? this.defaultRule()
      }, { group_id: i, ...r } = s;
      try {
        const a = this.expense ? await this.api.updateExpense(this.expense.id, r) : await this.api.createExpense(s);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: a },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (a) {
        this.error = _(a, this.localize);
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
          this.error = _(e, this.localize), this.confirmingDelete = !1;
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
      this.categoryId = this.categories.some((t) => t.id === e) ? e : "", this.currency = this.group.currency, this.rate = Z;
      return;
    }
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = nt(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = rs(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares(), this.showDescription = this.description !== "", this.currency = this.expense.currency, this.rate = this.expense.exchange_rate;
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
    return e === null || !this.paidBy || this.members.length === 0 ? null : as({
      amount: e,
      payerId: this.paidBy,
      memberIds: this.members.map((t) => t.id),
      rule: this.rule ?? this.defaultRule()
    });
  }
  render() {
    const e = this.localize, t = we(this.amountInput), s = this.expense ? e("edit_expense") : e("new_expense");
    return o`
      <se-dialog open heading=${s} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : d}

          <se-field
            .label=${e("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(i) => this.expenseTitle = i.detail.value}
          ></se-field>

          <div class="pair">
            <se-field
              .label=${e("amount")}
              .value=${this.amountInput}
              required
              decimal
              placeholder="85,42"
              @value-changed=${(i) => this.amountInput = i.detail.value}
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
      (i) => o`
                    <option value=${i} ?selected=${i === this.currency}>
                      ${i}
                    </option>
                  `
    )}
              </select>
            </se-field>

            <se-field
              .label=${e("date")}
              type="date"
              .value=${this.date}
              @value-changed=${(i) => this.date = i.detail.value}
            ></se-field>
          </div>

          <div class="pair">
            <se-select
              .label=${e("paid_by")}
              .value=${this.paidBy}
              .options=${this.members.map((i) => ({ value: i.id, label: i.name }))}
              @value-changed=${(i) => this.paidBy = i.detail.value}
            ></se-select>

            <se-select
              .label=${e("category")}
              .value=${this.categoryId}
              .placeholder=${e("no_category")}
              .options=${this.categories.map((i) => ({ value: i.id, label: i.name }))}
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
                  @value-changed=${(i) => this.description = i.detail.value}
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
        ${this.members.filter((s) => t[s.id]).map(
      (s) => o`
              <span class="who">
                ${s.name}
                <strong>
                  ${j(t[s.id], this.currency, this.language)}
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
    return zi(
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
    return [.../* @__PURE__ */ new Set([...vt, this.group.currency, this.currency])].sort();
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
$.styles = [
  z,
  x`
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
k([
  l({ attribute: !1 })
], $.prototype, "api", 2);
k([
  l({ attribute: !1 })
], $.prototype, "localize", 2);
k([
  l({ attribute: !1 })
], $.prototype, "group", 2);
k([
  l({ attribute: !1 })
], $.prototype, "members", 2);
k([
  l({ attribute: !1 })
], $.prototype, "categories", 2);
k([
  l({ attribute: !1 })
], $.prototype, "expense", 2);
k([
  l({ type: String })
], $.prototype, "meId", 2);
k([
  l({ type: String })
], $.prototype, "language", 2);
k([
  c()
], $.prototype, "expenseTitle", 2);
k([
  c()
], $.prototype, "description", 2);
k([
  c()
], $.prototype, "amountInput", 2);
k([
  c()
], $.prototype, "paidBy", 2);
k([
  c()
], $.prototype, "date", 2);
k([
  c()
], $.prototype, "categoryId", 2);
k([
  c()
], $.prototype, "rule", 2);
k([
  c()
], $.prototype, "busy", 2);
k([
  c()
], $.prototype, "error", 2);
k([
  c()
], $.prototype, "confirmingDelete", 2);
k([
  c()
], $.prototype, "editingSplit", 2);
k([
  c()
], $.prototype, "showDescription", 2);
k([
  c()
], $.prototype, "currency", 2);
k([
  c()
], $.prototype, "rate", 2);
$ = k([
  b("se-expense-dialog")
], $);
var Bi = Object.defineProperty, qi = Object.getOwnPropertyDescriptor, oe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? qi(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Bi(t, s, r), r;
};
let F = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.expenses = [], this.payments = [], this.language = "en", this.restore = async (e) => {
      const { entityType: t, entityId: s } = e.detail;
      this.error = void 0;
      try {
        t === "expense" ? await this.api.restoreExpense(this.group.id, s) : await this.api.restorePayment(this.group.id, s), this.dispatchEvent(
          new CustomEvent("history-restored", { bubbles: !0, composed: !0 })
        );
      } catch (i) {
        this.error = _(i, this.localize);
      }
    }, this.close = () => {
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
        restorable
        .localize=${this.localize}
        .revisions=${this.revisions}
        .members=${this.members}
        .categories=${this.categories}
        .expenses=${this.expenses}
        .payments=${this.payments}
        .currency=${this.group.currency}
        .language=${this.language}
        @revision-restored=${this.restore}
      ></se-history>
    ` : o`<div class="muted">${this.localize("loading")}</div>`;
  }
  async load() {
    try {
      this.revisions = await this.api.listRevisions(this.group.id);
    } catch (e) {
      this.error = _(e, this.localize);
    }
  }
};
F.styles = z;
oe([
  l({ attribute: !1 })
], F.prototype, "api", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "localize", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "group", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "members", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "categories", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "expenses", 2);
oe([
  l({ attribute: !1 })
], F.prototype, "payments", 2);
oe([
  l({ type: String })
], F.prototype, "language", 2);
oe([
  c()
], F.prototype, "revisions", 2);
oe([
  c()
], F.prototype, "error", 2);
F = oe([
  b("se-history-dialog")
], F);
var Hi = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, T = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Li(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Hi(t, s, r), r;
};
let C = class extends m {
  constructor() {
    super(...arguments), this.role = null, this.meId = null, this.mayManage = !1, this.haUsers = [], this.members = [], this.memberships = [], this.newName = "", this.loading = !0, this.dirty = !1, this.pastMembers = [], this.addGuest = async () => {
      this.busy = "new", this.error = void 0;
      try {
        await this.api.createMember({
          name: this.newName.trim(),
          group_id: this.groupId
        }), this.newName = "", this.dirty = !0, await this.load();
      } catch (e) {
        this.error = _(e, this.localize);
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
    const t = this.memberForUser(e.id), s = this.isAdmin(t), i = t !== void 0 && t.id === this.meId, r = this.mayManage || i;
    return o`
      <div class="row">
        <!--
          live(), and it is not a nicety.

          A finger flips the box itself, and Lit only writes a property back
          when the value it renders has changed. Both sides say "in the group",
          so it writes nothing and the box keeps the flip — showing somebody out
          who is still in, until the dialog is thrown away and built again. The
          member reappearing "ticked" next time was not the tick coming back: it
          was the only moment the truth got a word in.

          live() compares against the DOM rather than against the last render,
          so the box can never drift from what the backend says. Which matters
          most on the path nobody tries: a removal that fails leaves the data
          alone, and without this the box would stay wrong and quietly claim it
          had worked.
        -->
        <input
          type="checkbox"
          .checked=${Qt(t !== void 0)}
          ?disabled=${s || !r || this.busy !== void 0}
          title=${s ? this.localize("admin_locked") : ""}
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
        ${s ? o`<span class="tag">${this.localize("role_admin")}</span>` : d}
        ${this.renderHandOver(t, s)}
      </div>
      ${this.renderPalette(t)}
    `;
  }
  /**
   * Hand the project to somebody else, who becomes its admin.
   *
   * The admin's alone, and offered only on an account that is in the project
   * and can log in: a member without one would hold every right nobody can
   * exercise, and the backend refuses it — so the panel does not ask.
   *
   * Confirmed once, because it cannot be taken back by the person doing it: you
   * become an ordinary member, and only the new admin can hand it on again.
   */
  renderHandOver(e, t) {
    return this.role !== "admin" || !e || t ? d : this.handingTo === e.id ? o`
        <se-button
          variant="text"
          class="danger"
          ?disabled=${this.busy !== void 0}
          @click=${() => this.handOver(e)}
        >
          ${this.localize("confirm_delete")}
        </se-button>
      ` : o`
      <se-button
        variant="text"
        ?disabled=${this.busy !== void 0}
        title=${this.localize("confirm_make_admin")}
        @click=${() => this.handOver(e)}
      >
        ${this.localize("make_admin")}
      </se-button>
    `;
  }
  async handOver(e) {
    if (this.handingTo !== e.id) {
      this.handingTo = e.id;
      return;
    }
    this.busy = e.id, this.error = void 0, this.handingTo = void 0;
    try {
      await this.api.transferAdmin(this.groupId, e.id), this.dirty = !0, await this.load();
    } catch (t) {
      this.error = _(t, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  /**
   * A member's avatar, clickable to recolour them.
   *
   * The avatar is what the colour actually shows up in, so it is the obvious
   * thing to press. Members with no account yet have nothing to recolour.
   *
   * Your own colour is always yours. Somebody else's is managing the members,
   * and where the project does not allow it the avatar is a plain circle: a
   * palette that opened and then refused to save would read as a broken panel
   * rather than as a shut door.
   */
  renderTintable(e, t, s) {
    const i = e?.color ?? O(s), r = e && (e.id === this.meId || this.mayManage);
    return !e || !r ? o`
        <div class="avatar" style=${`background:${i}`}>${Y(t)}</div>
      ` : o`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${i}`}
        @click=${() => this.toggleTint(e.id)}
      >
        ${Y(t)}
      </button>
    `;
  }
  renderPalette(e) {
    return !e || this.tinting !== e.id ? d : o`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${e.color}
          .fallback=${O(e.id)}
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
      await this.api.updateMember(this.groupId, e.id, { color: t }), this.dirty = !0, await this.load();
    } catch (s) {
      this.error = _(s, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  renderGuests() {
    const e = this.localize, t = this.members.filter((i) => i.user_id === null), s = this.pastMembers.filter(
      (i) => i.user_id === null && !t.some((r) => r.id === i.id)
    );
    return o`
      <div class="section">
        <h3>${e("guests")}</h3>
        <div class="muted">${e("guests_hint")}</div>

        ${t.map(
      (i) => o`
            <div class="row">
              ${this.renderTintable(i, i.name, i.id)}
              <span class="name">${i.name}</span>
              ${this.confirming === i.id ? o`<span class="confirm">${e("confirm_remove")}</span>` : d}
              <!--
                A guest has no account, so they are never you: removing one is
                always managing the members, and the project has to allow it.
              -->
              ${this.mayManage ? o`<button
                    class=${`remove ${this.confirming === i.id ? "danger" : ""}`}
                    ?disabled=${this.busy !== void 0}
                    aria-label=${e("remove_member")}
                    @click=${() => this.removeGuest(i)}
                  >
                    ×
                  </button>` : d}
            </div>
            ${this.renderPalette(i)}
          `
    )}

        ${s.map(
      (i) => o`
            <div class="row gone">
              <div
                class="avatar"
                style=${`background:${i.color ?? O(i.id)}`}
              >
                ${Y(i.name)}
              </div>
              <span class="name">${i.name}</span>
              ${this.mayManage ? o`<se-button
                    variant="text"
                    ?disabled=${this.busy !== void 0}
                    @click=${() => this.restoreGuest(i)}
                  >
                    ${e("restore_member")}
                  </se-button>` : d}
            </div>
          `
    )}
        ${this.mayManage ? o`<div class="add">
              <se-field
                .label=${e("member_name")}
                .value=${this.newName}
                placeholder="Clara"
                @value-changed=${(i) => this.newName = i.detail.value}
              ></se-field>
              <se-button
                variant="text"
                ?disabled=${this.busy !== void 0 || this.newName.trim() === ""}
                @click=${this.addGuest}
              >
                ${e("add")}
              </se-button>
            </div>` : d}
      </div>
    `;
  }
  memberForUser(e) {
    return this.members.find((t) => t.user_id === e);
  }
  /**
   * The admin stays: the backend refuses to let them out of their own group.
   *
   * Handing it on is the way out, and it is offered on every other row.
   */
  isAdmin(e) {
    return e ? this.memberships.some(
      (t) => t.member_id === e.id && t.left_at === null && t.role === "admin"
    ) : !1;
  }
  async load() {
    this.error = void 0;
    try {
      const [e, t, s, i] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listMemberships(this.groupId)
      ]);
      this.haUsers = e, this.members = t, this.pastMembers = s, this.memberships = i;
    } catch (e) {
      this.error = _(e, this.localize);
    } finally {
      this.loading = !1;
    }
  }
  /**
   * Put an account in the project, or take it out. Straight away.
   *
   * There used to be a confirmation here — a first press armed it, a second
   * carried it out — and it was the whole of the bug. A box flips under the
   * finger before anybody is asked anything, so the question always arrives
   * after the answer looks given; and nothing on the row said one was pending,
   * so the honest reading of the screen was "done", and it was not.
   *
   * A checkbox is a state, not a command, and confirming a state cannot be made
   * to work. Nor is there anything to protect: taking somebody out only ends
   * their membership. Their expenses stay, their balance stays, and ticking the
   * box again returns the very same member — `link_user` hands back the one the
   * account already has, name and colour and all. The undo is the same gesture.
   *
   * The guests keep their confirmation, where a × is a command and asking twice
   * is what a command is for.
   */
  async toggleAccount(e, t) {
    this.busy = e.id, this.error = void 0;
    try {
      t ? await this.api.removeMemberFromGroup(this.groupId, t.id) : await this.api.createMember({
        name: e.name,
        group_id: this.groupId,
        user_id: e.id
      }), this.dirty = !0, await this.load();
    } catch (s) {
      this.error = _(s, this.localize);
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
      this.error = _(t, this.localize);
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
      this.error = _(t, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
};
C.styles = [
  z,
  x`
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
T([
  l({ attribute: !1 })
], C.prototype, "api", 2);
T([
  l({ attribute: !1 })
], C.prototype, "localize", 2);
T([
  l({ type: String })
], C.prototype, "groupId", 2);
T([
  l({ attribute: !1 })
], C.prototype, "role", 2);
T([
  l({ type: String })
], C.prototype, "meId", 2);
T([
  l({ type: Boolean })
], C.prototype, "mayManage", 2);
T([
  c()
], C.prototype, "haUsers", 2);
T([
  c()
], C.prototype, "members", 2);
T([
  c()
], C.prototype, "memberships", 2);
T([
  c()
], C.prototype, "newName", 2);
T([
  c()
], C.prototype, "loading", 2);
T([
  c()
], C.prototype, "busy", 2);
T([
  c()
], C.prototype, "error", 2);
T([
  c()
], C.prototype, "dirty", 2);
T([
  c()
], C.prototype, "tinting", 2);
T([
  c()
], C.prototype, "confirming", 2);
T([
  c()
], C.prototype, "handingTo", 2);
T([
  c()
], C.prototype, "pastMembers", 2);
C = T([
  b("se-member-dialog")
], C);
var Gi = Object.defineProperty, Fi = Object.getOwnPropertyDescriptor, P = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Fi(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Gi(t, s, r), r;
};
let w = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.initialKind = "reimbursement", this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.description = "", this.showDescription = !1, this.date = ss(), this.busy = !1, this.confirmingDelete = !1, this.kind = "reimbursement", this.currency = "", this.rate = null, this.pickCurrency = (e) => {
      this.currency = e.target.value, this.rate = this.currency === this.group.currency ? Z : null;
    }, this.handleRate = (e) => {
      this.currency = e.detail.currency, this.rate = e.detail.rate;
    }, this.pickKind = (e) => {
      const t = e.detail.value;
      t !== this.kind && (this.kind = t, [this.fromMember, this.toMember] = [this.toMember, this.fromMember]);
    }, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const e = we(this.amountInput);
      if (e === null)
        return;
      this.busy = !0, this.error = void 0;
      const t = {
        group_id: this.group.id,
        from_member_id: this.fromMember,
        to_member_id: this.toMember,
        amount: e,
        payment_date: is(this.date),
        description: this.description.trim() || null,
        currency: this.currency || this.group.currency,
        kind: this.kind,
        ...this.rate !== null && this.rate !== Z ? { exchange_rate: this.rate } : {}
      }, { group_id: s, ...i } = t;
      try {
        const r = this.payment ? await this.api.updatePayment(this.payment.id, i) : await this.api.createPayment(t);
        this.dispatchEvent(
          new CustomEvent("payment-saved", {
            detail: { payment: r },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (r) {
        this.error = _(r, this.localize);
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
          this.error = _(e, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), this.payment) {
      this.fromMember = this.payment.from_member_id, this.toMember = this.payment.to_member_id, this.amountInput = nt(this.payment.amount), this.date = rs(this.payment.payment_date), this.kind = this.payment.kind, this.currency = this.payment.currency, this.rate = this.payment.exchange_rate, this.description = this.payment.description ?? "", this.showDescription = this.description !== "";
      return;
    }
    if (this.kind = this.initialKind, this.currency = this.group.currency, this.rate = Z, this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = nt(this.settlement.amount);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const e = this.localize, t = we(this.amountInput), s = this.members.map((a) => ({ value: a.id, label: a.name })), i = this.kind === "debt", r = this.payment ? e(i ? "edit_debt" : "edit_payment") : e(i ? "new_debt" : "new_payment");
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
              .label=${e(i ? "debt_who_owes" : "from_member")}
              .value=${i ? this.toMember : this.fromMember}
              .options=${s}
              @value-changed=${(a) => i ? this.toMember = a.detail.value : this.fromMember = a.detail.value}
            ></se-select>

            <se-select
              .label=${e(i ? "debt_to_whom" : "to_member")}
              .value=${i ? this.fromMember : this.toMember}
              .options=${s}
              @value-changed=${(a) => i ? this.fromMember = a.detail.value : this.toMember = a.detail.value}
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
    return [.../* @__PURE__ */ new Set([...vt, this.group.currency, this.currency])].sort();
  }
};
w.styles = z;
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
], w.prototype, "payment", 2);
P([
  l({ attribute: !1 })
], w.prototype, "settlement", 2);
P([
  l({ type: String })
], w.prototype, "initialKind", 2);
P([
  l({ type: String })
], w.prototype, "language", 2);
P([
  c()
], w.prototype, "fromMember", 2);
P([
  c()
], w.prototype, "toMember", 2);
P([
  c()
], w.prototype, "amountInput", 2);
P([
  c()
], w.prototype, "description", 2);
P([
  c()
], w.prototype, "showDescription", 2);
P([
  c()
], w.prototype, "date", 2);
P([
  c()
], w.prototype, "busy", 2);
P([
  c()
], w.prototype, "error", 2);
P([
  c()
], w.prototype, "confirmingDelete", 2);
P([
  c()
], w.prototype, "kind", 2);
P([
  c()
], w.prototype, "currency", 2);
P([
  c()
], w.prototype, "rate", 2);
w = P([
  b("se-payment-dialog")
], w);
var Wi = Object.defineProperty, Vi = Object.getOwnPropertyDescriptor, ls = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Vi(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Wi(t, s, r), r;
};
let Xe = class extends m {
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
                style=${`width:${Ki(t.value, e)}%${t.color ? `;background:${t.color}` : ""}`}
              ></div>
            </div>
          </div>
        `
    )}
    `;
  }
};
Xe.styles = [
  z,
  x`
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
ls([
  l({ attribute: !1 })
], Xe.prototype, "bars", 2);
Xe = ls([
  b("se-bar-chart")
], Xe);
function Ki(e, t) {
  return t <= 0 ? 0 : e / t * 100;
}
var Yi = Object.defineProperty, Zi = Object.getOwnPropertyDescriptor, cs = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Zi(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Yi(t, s, r), r;
};
const je = 160, qe = 70, Ee = je / 2, Ji = Math.PI * 2;
let Qe = class extends m {
  constructor() {
    super(...arguments), this.slices = [];
  }
  render() {
    const e = this.slices.filter((s) => s.value > 0), t = e.reduce((s, i) => s + i.value, 0);
    return t <= 0 ? d : o`
      <div class="chart">
        <svg viewBox="0 0 ${je} ${je}" width=${je} height=${je} role="img">
          ${this.renderWedges(e, t)}
        </svg>
        <div class="legend">
          ${e.map(
      (s) => o`
              <div class="entry">
                <span
                  class="dot"
                  style=${`background:${s.color ?? O(s.key)}`}
                ></span>
                <span class="label" title=${s.label}>${s.label}</span>
                <span class="value">${s.text}</span>
                <span class="share">${Qi(s.value, t)}</span>
              </div>
            `
    )}
        </div>
      </div>
    `;
  }
  renderWedges(e, t) {
    if (e.length === 1) {
      const i = e[0];
      return It`
        <circle
          cx=${Ee}
          cy=${Ee}
          r=${qe}
          fill=${i.color ?? O(i.key)}
        ></circle>
      `;
    }
    let s = 0;
    return e.map((i) => {
      const r = i.value / t * Ji, a = Xi(s, s + r);
      return s += r, It`<path d=${a} fill=${i.color ?? O(i.key)}></path>`;
    });
  }
};
Qe.styles = [
  z,
  x`
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
cs([
  l({ attribute: !1 })
], Qe.prototype, "slices", 2);
Qe = cs([
  b("se-pie-chart")
], Qe);
function Xi(e, t) {
  const [s, i] = Lt(e), [r, a] = Lt(t), n = t - e > Math.PI ? 1 : 0;
  return `M ${Ee} ${Ee} L ${s} ${i} A ${qe} ${qe} 0 ${n} 1 ${r} ${a} Z`;
}
function Lt(e) {
  const t = e - Math.PI / 2;
  return [
    Ee + qe * Math.cos(t),
    Ee + qe * Math.sin(t)
  ];
}
function Qi(e, t) {
  const s = e / t * 100;
  return `${s >= 10 ? Math.round(s) : s.toFixed(1)} %`;
}
var er = Object.defineProperty, tr = Object.getOwnPropertyDescriptor, ee = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? tr(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && er(t, s, r), r;
};
const Ve = "all";
let H = class extends m {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.currency = "EUR", this.language = "en", this.period = Ve;
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
          aria-pressed=${this.period === Ve}
          @click=${() => this.pick(Ve)}
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
    const e = this.localize, t = this.result.by_member.find((s) => s.member_id === this.meId);
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
        ${t.map((s) => {
      const i = this.members.find((a) => a.id === s.member_id), r = i?.name ?? "?";
      return o`
            <div class="member">
              <div
                class="avatar"
                style=${`background:${i?.color ?? O(s.member_id)}`}
              >
                ${Y(r)}
              </div>
              <span class="name">${r}</span>
              <div class="figures">
                <div>
                  ${e("paid_total")} <strong>${this.money(s.paid)}</strong>
                </div>
                <div class="muted">
                  ${e("consumed")} <strong>${this.money(s.share)}</strong>
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
      const t = this.categories.find((s) => s.id === e.category_id);
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
      label: ei(e.month, this.language),
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
        this.period === Ve ? null : Number(this.period)
      );
    } catch (e) {
      this.error = _(e, this.localize);
    }
  }
};
H.styles = [
  z,
  x`
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
ee([
  l({ attribute: !1 })
], H.prototype, "api", 2);
ee([
  l({ attribute: !1 })
], H.prototype, "localize", 2);
ee([
  l({ type: String })
], H.prototype, "groupId", 2);
ee([
  l({ attribute: !1 })
], H.prototype, "members", 2);
ee([
  l({ attribute: !1 })
], H.prototype, "categories", 2);
ee([
  l({ type: String })
], H.prototype, "meId", 2);
ee([
  l({ type: String })
], H.prototype, "currency", 2);
ee([
  l({ type: String })
], H.prototype, "language", 2);
ee([
  c()
], H.prototype, "result", 2);
ee([
  c()
], H.prototype, "period", 2);
ee([
  c()
], H.prototype, "error", 2);
H = ee([
  b("se-statistics")
], H);
var sr = Object.defineProperty, ir = Object.getOwnPropertyDescriptor, ve = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ir(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && sr(t, s, r), r;
};
let ce = class extends m {
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
ce.styles = z;
ve([
  l({ attribute: !1 })
], ce.prototype, "api", 2);
ve([
  l({ attribute: !1 })
], ce.prototype, "localize", 2);
ve([
  l({ attribute: !1 })
], ce.prototype, "group", 2);
ve([
  l({ attribute: !1 })
], ce.prototype, "members", 2);
ve([
  l({ attribute: !1 })
], ce.prototype, "categories", 2);
ve([
  l({ type: String })
], ce.prototype, "meId", 2);
ve([
  l({ type: String })
], ce.prototype, "language", 2);
ce = ve([
  b("se-statistics-dialog")
], ce);
var rr = Object.defineProperty, ar = Object.getOwnPropertyDescriptor, v = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ar(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && rr(t, s, r), r;
};
let f = class extends m {
  constructor() {
    super(...arguments), this.narrow = !1, this.language = "en", this.userId = null, this.groups = [], this.members = [], this.pastMembers = [], this.memberships = [], this.categories = [], this.expenses = [], this.payments = [], this.query = "", this.loading = !0, this.addingPayment = !1, this.draggedAway = !1, this.busy = !1, this.confirmingDelete = !1, this.deleteGroup = async () => {
      if (!this.confirmingDelete) {
        this.confirmingDelete = !0;
        return;
      }
      this.busy = !0;
      try {
        await this.api.deleteGroup(this.groupId), this.menu = void 0, this.goBack();
      } catch (e) {
        this.error = _(e, this.localize), this.confirmingDelete = !1;
      } finally {
        this.busy = !1;
      }
    }, this.fabDown = (e) => {
      e.target.setPointerCapture(e.pointerId), this.fabFrom = { x: e.clientX, y: e.clientY }, this.addingPayment = !1;
    }, this.fabMove = (e) => {
      if (!this.fabFrom)
        return;
      const t = e.clientX - this.fabFrom.x, s = e.clientY - this.fabFrom.y;
      this.addingPayment = s < -40 || t < -40;
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
      const { entityType: t, entityId: s } = e.detail;
      if (t === "expense") {
        const r = this.expenses.find((a) => a.id === s);
        r && this.openExpense(r);
        return;
      }
      const i = this.payments.find((r) => r.id === s);
      i && this.openPayment(void 0, i);
    }, this.closeDialog = () => {
      const e = history.state?.seDialog === !0;
      this.clearDialog(), e && history.back();
    }, this.handlePop = () => {
      this.dialog && this.clearDialog();
    }, this.handleChanged = () => {
      this.closeDialog(), this.load();
    }, this.toggleArchive = async () => {
      if (this.group) {
        this.busy = !0, this.error = void 0;
        try {
          this.group = await this.api.archiveGroup(this.group.id, !this.group.archived), this.menu = void 0;
        } catch (e) {
          this.error = _(e, this.localize);
        } finally {
          this.busy = !1;
        }
      }
    }, this.goBack = () => {
      this.dispatchEvent(new CustomEvent("navigate-back", { bubbles: !0, composed: !0 }));
    };
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("popstate", this.handlePop), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.handlePop);
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
          <!--
            Home Assistant's own, not one of ours. It knows something we would
            have to guess at and would guess wrong: whether the sidebar is
            already on screen. On a desktop it is, with a burger of its own, so
            this renders nothing and there is one burger instead of two; on a
            phone the sidebar is gone and this is the way back out of the panel.
            It carries the notification dot too, which ours never did.
          -->
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>

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

        ${this.menu ? this.renderMenu() : d}
        </div>
      </div>
      ${this.menu ? o`<div class="scrim" @click=${() => this.menu = void 0}></div>` : d}
    `;
  }
  /**
   * The open menu, inside the header so it can hang from the right button.
   *
   * The scrim that closes it stays outside: it covers the page, never the
   * toolbar, so the button you opened it with is still there to close it.
   */
  renderMenu() {
    return o`
      <div
        class=${`menu ${this.menu === "groups" ? "at-groups" : "at-more"}`}
        role="menu"
      >
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
  /**
   * What you may actually do here.
   *
   * An entry that is offered and then refused is worse than one that is not
   * there: it reads as the panel being broken rather than as the project being
   * shut. So each of these appears only where the backend would let it through
   * — the same rule, asked twice, and the backend's is the one that counts.
   *
   * The members and the project stay reachable either way: the first is where
   * you rename yourself or leave, the second where you read what the project
   * counts in. Both dialogs shut their own doors rather than close.
   */
  renderMoreMenu() {
    const e = this.localize;
    return o`
      <button role="menuitem" @click=${() => this.openDialog("group")}>
        ${e("edit_group")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("member")}>
        ${e("members")}
      </button>
      ${this.may("manage_categories") ? o`<button role="menuitem" @click=${() => this.openDialog("categories")}>
            ${e("categories")}
          </button>` : d}
      <button role="menuitem" @click=${() => this.openDialog("statistics")}>
        ${e("statistics")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("history")}>
        ${e("group_history")}
      </button>
      ${this.may("manage_group") ? o`<button
            role="menuitem"
            class="separated"
            ?disabled=${this.busy}
            @click=${this.toggleArchive}
          >
            ${this.group.archived ? e("restore") : e("archive")}
          </button>` : d}
      ${this.myRole() === "admin" ? o`<button
            role="menuitem"
            class="danger separated"
            ?disabled=${this.busy}
            @click=${this.deleteGroup}
          >
            ${this.confirmingDelete ? e("confirm_delete") : e("delete_group")}
          </button>` : d}
    `;
  }
  openDialog(e) {
    this.menu = void 0, this.show(e);
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
      (t, s) => s.at.localeCompare(t.at) || s.addedAt.localeCompare(t.addedAt)
    );
  }
  /**
   * A payment, said the way its kind reads, and from where you stand.
   *
   * The two kinds are one movement of money and differ only in words, so the
   * words are the whole job here: a debt shown as "Dupont → Michel" reads as
   * Dupont having paid, which is true of a loan and nonsense for a debt
   * somebody is only writing down.
   *
   * Which is why the names swap round by kind. The arrow always points at
   * whoever ends up with the money — a reimbursement has sent it, a debt owes
   * it — and on a debt the one who will pay is the one who owes, which is the
   * member on the receiving end of the stored payment.
   */
  renderPayment(e) {
    const t = e.kind === "debt", s = t ? e.to_member_id : e.from_member_id, i = t ? e.from_member_id : e.to_member_id, a = this.memberById(s)?.color ?? O(s), n = this.mayEdit(e);
    return o`
      <button
        class=${`item ${n ? "item-button" : "item-fixed"}`}
        style=${`border-left-color:${a}`}
        ?disabled=${!n}
        @click=${() => this.openPayment(void 0, e)}
      >
        <se-icon
          icon=${t ? "mdi:hand-coin-outline" : "mdi:swap-horizontal"}
          fallback=${t ? "→" : "⇄"}
          .color=${a}
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">
            ${this.nameFrom(s)} → ${this.nameFrom(i)}
          </div>
          <!--
            Where an expense shows its category: same grid, same reading. What
            somebody wrote about it wins the line — "Dette" is already said by
            the icon and the colour, and a note is only ever there because it
            said something they were not.
          -->
          <div class="muted">
            ${e.description || this.localize(t ? "a_debt" : "a_settlement")}
          </div>
          <div class="muted">
            ${Be(e.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount ${this.toneFor(s, i)}">
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
  /**
   * A member's name, or "you" when it is yours.
   *
   * The balance card has always been written from where you stand — "on te
   * doit", not "Stéphane doit recevoir". The list underneath it was not, so the
   * same fact was told twice in two voices, and finding yourself in a row meant
   * spotting your own name among the others first.
   */
  nameFrom(e) {
    return e === this.meId() ? this.localize("you") : this.memberById(e)?.name ?? "?";
  }
  /**
   * What a movement of money does to you, in one colour.
   *
   * Green when it comes your way, red when it leaves you — the reading the
   * balance card already trained. Kind has nothing to do with it: a debt owed
   * to you is money coming, and every debt used to be red on the grounds that a
   * debt is a bad thing, which is only true of the ones you owe.
   *
   * Neither, when the line is not about you: two other people settling up is a
   * fact, not good news or bad. Same when no member is you at all — an admin
   * looking in, a tablet in the kitchen. There is no point of view to take.
   */
  toneFor(e, t) {
    const s = this.meId();
    return s === t ? "positive" : s === e ? "negative" : "neutral";
  }
  renderExpense(e) {
    const t = this.memberById(e.paid_by_member_id), s = this.categories.find((r) => r.id === e.category_id), i = this.mayEdit(e);
    return o`
      <button
        class=${`item ${i ? "item-button" : "item-fixed"}`}
        style=${`border-left-color:${t?.color ?? O(e.paid_by_member_id)}`}
        ?disabled=${!i}
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
          ${s ? o`<div class="muted">${s.name}</div>` : d}
          <div class="muted">
            ${Be(e.expense_date, this.language)}
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
    const t = (e.shares ?? []).filter((s) => s.amount !== 0);
    return t.length === 0 ? d : o`
      <div class="stack-avatars">
        ${t.map((s) => {
      const i = this.memberById(s.member_id);
      return o`
            <div
              class="avatar small"
              title=${i?.name ?? "?"}
              style=${`background:${i?.color ?? O(s.member_id)}`}
            >
              ${Y(i?.name ?? "?")}
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
  renderAvatar(e, t, s) {
    const i = this.memberById(t);
    return o`
      <div
        class="avatar"
        title=${s ?? e}
        style=${`background:${i?.color ?? O(t)}`}
      >
        ${Y(e)}
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
          .expenses=${this.expenses}
          .payments=${this.payments}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @revision-picked=${this.openFromHistory}
          @history-restored=${this.handleChanged}
        ></se-history-dialog>
      ` : this.dialog === "group" ? o`
        <se-group-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .role=${this.myRole()}
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
        .role=${this.myRole()}
        .meId=${this.meId()}
        .mayManage=${this.may("manage_members")}
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
  /** What standing you have here, or null on an account no member is tied to. */
  myRole() {
    const e = this.meId();
    return e === null ? null : this.memberships.find(
      (t) => t.member_id === e && t.left_at === null
    )?.role ?? null;
  }
  /**
   * Whether the project lets you do this.
   *
   * The same rule the backend applies, and only ever used to decide what to
   * offer. A courtesy, never a guard: the panel is a program on somebody's
   * machine, and the door is `ensure_permission`. Offering what would be
   * refused is the thing to avoid — a button that always errors is worse than
   * no button.
   */
  may(e) {
    return this.myRole() === "admin" ? !0 : this.group?.permissions.includes(e) ?? !1;
  }
  /** Whether an entry is yours: you entered it, or it is about you. */
  mine(e) {
    const t = this.meId();
    return t === null ? !1 : e.created_by_member_id === t ? !0 : "paid_by_member_id" in e ? e.paid_by_member_id === t : e.from_member_id === t || e.to_member_id === t;
  }
  /** Whether you may open an entry to change it, rather than only read it. */
  mayEdit(e) {
    return this.mine(e) || this.may("edit_others");
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
    const t = (this.result?.balances ?? []).filter((s) => s.amount !== 0).map((s) => s.member_id);
    return this.plusGone(t);
  }
  plusGone(e) {
    const t = new Set(e), s = this.pastMembers.filter(
      (i) => t.has(i.id) && !this.members.some((r) => r.id === i.id)
    );
    return [...this.members, ...s];
  }
  async load() {
    this.error = void 0;
    try {
      const [
        e,
        t,
        s,
        i,
        r,
        a,
        n,
        h,
        p
      ] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listGroups(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listMemberships(this.groupId),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.listPayments(this.groupId),
        this.api.getBalances(this.groupId)
      ]);
      this.group = e, this.groups = t, this.members = s, this.pastMembers = i, this.memberships = r, this.categories = a, this.expenses = n, this.payments = h, this.result = p;
    } catch (e) {
      this.error = _(e, this.localize), e?.code === "group_not_found" && this.dispatchEvent(
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
   * people, the amount — because that is what someone types: they look for
   * "carrefour", "antonin", "essence" or "300" without thinking about which
   * field it is.
   *
   * The balance above never moves with it: it is the group's, not the list's,
   * and a total that shrank as you typed would be a lie.
   */
  matching() {
    const e = this.query.trim().toLowerCase(), t = this.activity();
    return e ? t.filter((s) => this.haystack(s).includes(e)) : t;
  }
  haystack(e) {
    const t = (r) => this.memberById(r)?.name ?? "";
    if (e.kind === "payment") {
      const r = e.payment;
      return [
        this.localize("a_settlement"),
        r.description ?? "",
        t(r.from_member_id),
        t(r.to_member_id),
        ...this.amountNeedles(
          r.amount,
          r.currency,
          r.converted_amount
        )
      ].join(" ").toLowerCase();
    }
    const s = e.expense, i = this.categories.find((r) => r.id === s.category_id);
    return [
      s.title,
      s.description ?? "",
      i?.name ?? "",
      t(s.paid_by_member_id),
      ...this.amountNeedles(
        s.amount,
        s.currency,
        s.converted_amount
      )
    ].join(" ").toLowerCase();
  }
  /**
   * What was paid, and what it came to — both are findable.
   *
   * A row in a foreign currency shows two figures, and either is the one that
   * stuck in somebody's memory: the 100 they handed over, or the 87,68 it cost
   * the group.
   */
  amountNeedles(e, t, s) {
    const i = Dt(e, t, this.language);
    return t === this.group.currency ? i : [
      ...i,
      ...Dt(s, this.group.currency, this.language)
    ];
  }
  /** A suggested settlement to record, or a recorded payment to correct. */
  openPayment(e, t) {
    this.prefill = e, this.editedPayment = t, this.show("payment");
  }
  openExpense(e) {
    this.editedExpense = e, this.show("expense");
  }
  /**
   * Show a dialog, and leave a step behind for the phone's back button.
   *
   * Back is how you dismiss a sheet on a phone, and without a step to go back
   * to it left the panel altogether — half a typed expense gone, and Home
   * Assistant's front page instead. The step is the dialog's, and it is dropped
   * again the moment it closes, so nothing accumulates and back still leaves
   * the panel once no dialog is open.
   *
   * One step for the whole chain: the journal opens the expense it points at
   * and closes on the way, and two steps for one sheet on screen would mean
   * pressing back twice for the same thing.
   */
  show(e) {
    this.dialog || history.pushState({ seDialog: !0 }, ""), this.dialog = e;
  }
  clearDialog() {
    this.dialog = void 0, this.prefill = void 0, this.editedExpense = void 0, this.editedPayment = void 0;
  }
};
f.styles = [
  z,
  x`
      :host {
        display: block;
        position: relative;
      }

      /*
       * The banner every other Home Assistant panel wears. Its colours come
       * from the theme: hard-coding a grey would look wrong the moment someone
       * picks a theme that is not the default.
       */
      /*
       * Above the scrim, so the buttons it carries stay live while a menu is
       * open: pressing the same button again is how you close it.
       */
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 4;
      }

      .page {
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
      }

      /*
       * The full width of the window, like every other Home Assistant header.
       * The page below keeps its 720px column — a line of text that long is
       * unreadable, which is not true of a title and two buttons. Capping the
       * header as well left it floating in the middle of a desktop screen,
       * detached from the banner it is painted on.
       *
       * As tall as every other header in Home Assistant, and from the same
       * variable rather than a number of our own: a theme that sets its bars
       * taller means it, and ours would have stayed the odd one out.
       *
       * Positioned: the menus hang from it, see .menu.
       */
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 16px;
        min-height: var(--header-height, 56px);
        box-sizing: border-box;
        position: relative;
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

      /*
       * A row you may read but not rewrite: somebody else's, in a project that
       * does not let its members touch what is not theirs.
       *
       * Never greyed out. The line is true, it is somebody's money and it is
       * worth reading — it is simply not yours to change. Dimming it would say
       * it mattered less, which is a different thing and a false one. Only the
       * pointer and the hover go, so nothing invites a press that would do
       * nothing.
       */
      .item-fixed {
        border-top: none;
        border-right: none;
        border-bottom: none;
        background: none;
        color: inherit;
        opacity: 1;
        width: 100%;
        text-align: left;
        font-family: inherit;
        cursor: default;
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
        z-index: 3;
      }

      /*
       * Under the button that opened it, wherever the page has been scrolled.
       *
       * Absolute against the header, not fixed against the viewport. Both were
       * tried and both were wrong on their own: absolute against the *host*
       * pinned the menu 64px from the top of an element as tall as the whole
       * page, so once scrolled down it opened above the screen and never
       * showed; fixed cured that but hung the menu off the viewport, and the
       * viewport is not the panel — Home Assistant's sidebar owns the left of
       * it. A left of 16px therefore parked the menu at the far edge of the
       * screen, half under the sidebar, pointing at nothing. On a phone it went
       * unseen: the viewport *is* the panel there, and a menu spanning the
       * width looks deliberate.
       *
       * The header is both: the 720px column the buttons actually live in, and
       * inside a sticky toolbar that is always on screen.
       */
      .menu {
        position: absolute;
        z-index: 1;
        top: 100%;
        width: min(320px, calc(100% - 32px));
        /* What is left below the header it drops from, less a little air. */
        max-height: calc(100dvh - var(--header-height, 56px) - 32px);
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

      /* Each menu drops from its own button: the groups left, the rest right. */
      .menu.at-groups {
        left: 16px;
      }

      .menu.at-more {
        right: 16px;
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

      /* Not about you: it says what happened, not what it does to you. */
      .amount.neutral {
        color: var(--secondary-text-color);
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
], f.prototype, "api", 2);
v([
  l({ attribute: !1 })
], f.prototype, "hass", 2);
v([
  l({ type: Boolean })
], f.prototype, "narrow", 2);
v([
  l({ attribute: !1 })
], f.prototype, "localize", 2);
v([
  l({ type: String })
], f.prototype, "groupId", 2);
v([
  l({ type: String })
], f.prototype, "language", 2);
v([
  l({ type: String })
], f.prototype, "userId", 2);
v([
  c()
], f.prototype, "group", 2);
v([
  c()
], f.prototype, "groups", 2);
v([
  c()
], f.prototype, "menu", 2);
v([
  c()
], f.prototype, "members", 2);
v([
  c()
], f.prototype, "pastMembers", 2);
v([
  c()
], f.prototype, "memberships", 2);
v([
  c()
], f.prototype, "categories", 2);
v([
  c()
], f.prototype, "expenses", 2);
v([
  c()
], f.prototype, "payments", 2);
v([
  c()
], f.prototype, "result", 2);
v([
  c()
], f.prototype, "query", 2);
v([
  c()
], f.prototype, "loading", 2);
v([
  c()
], f.prototype, "error", 2);
v([
  c()
], f.prototype, "dialog", 2);
v([
  c()
], f.prototype, "prefill", 2);
v([
  c()
], f.prototype, "editedExpense", 2);
v([
  c()
], f.prototype, "editedPayment", 2);
v([
  c()
], f.prototype, "addingPayment", 2);
v([
  c()
], f.prototype, "busy", 2);
v([
  c()
], f.prototype, "confirmingDelete", 2);
f = v([
  b("se-group-page")
], f);
class ht {
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
  updateGroup(t, s) {
    return this.call("update_group", { group_id: t, ...s });
  }
  /**
   * Hand a project to another member, who becomes its admin. The admin's alone.
   *
   * Whoever gives it up becomes an ordinary member — a project has one admin,
   * so this is giving it away, not sharing it — and may then leave, which
   * without this they never could.
   */
  transferAdmin(t, s) {
    return this.call("transfer_admin", {
      group_id: t,
      member_id: s
    });
  }
  archiveGroup(t, s) {
    return this.call("archive_group", { group_id: t, archived: s });
  }
  deleteGroup(t) {
    return this.call("delete_group", { group_id: t });
  }
  getBalances(t) {
    return this.call("get_balances", { group_id: t });
  }
  /**
   * Call `onChange` whenever the group moves. Returns how to stop listening.
   *
   * The ping carries nothing, on purpose: read the group again on it rather
   * than believing it. The subscription was authorized once and the read is
   * authorized every time, so a card left open by somebody since removed from
   * the group is refused at the read, not trusted at the ping.
   */
  subscribeGroup(t, s) {
    return this.hass.connection.subscribeMessage(s, {
      type: "shared_expenses/subscribe_group",
      group_id: t
    });
  }
  // Members
  /** The Home Assistant accounts a group can be built from. */
  listHaUsers() {
    return this.call("list_ha_users");
  }
  // `groupId` is required: the backend refuses to list every member of the
  // house, as that would leak the people of groups you have nothing to do with.
  listMembers(t, s = !1) {
    return this.call("list_members", {
      group_id: t,
      include_left: s
    });
  }
  listMemberships(t) {
    return this.call("list_memberships", { group_id: t });
  }
  /**
   * Add somebody to a project, as a member.
   *
   * There is no role to pass, and the backend's schema does not know the word:
   * a project has one admin, handed on rather than handed out.
   */
  createMember(t) {
    return this.call("create_member", t);
  }
  /**
   * Rename a member, or recolour them.
   *
   * `groupId` is which project is asking. A member is global — one per Home
   * Assistant account, across every project — so there is no per-project answer
   * to who may rename them; the project asking is the one whose leave is needed.
   */
  updateMember(t, s, i) {
    return this.call("update_member", {
      group_id: t,
      member_id: s,
      ...i
    });
  }
  /** Put an existing member back into a group they had left. */
  addMemberToGroup(t, s) {
    return this.call("add_member_to_group", {
      group_id: t,
      member_id: s
    });
  }
  removeMemberFromGroup(t, s) {
    return this.call("remove_member_from_group", {
      group_id: t,
      member_id: s
    });
  }
  // Categories
  listCategories(t) {
    return this.call("list_categories", { group_id: t });
  }
  createCategory(t) {
    return this.call("create_category", t);
  }
  updateCategory(t, s) {
    return this.call("update_category", { category_id: t, ...s });
  }
  deleteCategory(t) {
    return this.call("delete_category", { category_id: t });
  }
  // Expenses
  listExpenses(t, s = !0) {
    return this.call("list_expenses", { group_id: t, with_shares: s });
  }
  getExpense(t) {
    return this.call("get_expense", { expense_id: t });
  }
  createExpense(t) {
    return this.call("create_expense", t);
  }
  updateExpense(t, s) {
    return this.call("update_expense", { expense_id: t, ...s });
  }
  deleteExpense(t) {
    return this.call("delete_expense", { expense_id: t });
  }
  /**
   * Bring a deleted expense back, as the one it was.
   *
   * Takes the project as well as the expense, because there is no expense left
   * to find the project from: it is built from the deletion, which is the only
   * place it still exists.
   */
  restoreExpense(t, s) {
    return this.call("restore_expense", {
      group_id: t,
      expense_id: s
    });
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
  updatePayment(t, s) {
    return this.call("update_payment", { payment_id: t, ...s });
  }
  deletePayment(t) {
    return this.call("delete_payment", { payment_id: t });
  }
  /** Bring a deleted payment back. See `restoreExpense`. */
  restorePayment(t, s) {
    return this.call("restore_payment", {
      group_id: t,
      payment_id: s
    });
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
  getExchangeRate(t, s, i, r) {
    return this.call("get_exchange_rate", {
      group_id: t,
      base: s,
      quote: i,
      on: r
    });
  }
  /** Record a rate by hand. It becomes the last known one for the pair. */
  setExchangeRate(t, s, i, r, a) {
    return this.call("set_exchange_rate", {
      group_id: t,
      base: s,
      quote: i,
      on: r,
      rate: a
    });
  }
  // Statistics
  /** What the group spent. Leave `year` out for everything, ever. */
  getStatistics(t, s) {
    return this.call("get_statistics", {
      group_id: t,
      ...s ? { year: s } : {}
    });
  }
  // History
  /** What happened in the group, newest first. */
  listRevisions(t, s) {
    return this.call("list_revisions", {
      group_id: t,
      ...s ? { limit: s } : {}
    });
  }
  // `groupId` is required: a deleted expense can no longer say which group it
  // belonged to, and its history is exactly what is being asked for.
  listEntityRevisions(t, s) {
    return this.call("list_entity_revisions", {
      group_id: t,
      entity_id: s
    });
  }
  call(t, s = {}) {
    return this.hass.callWS({
      type: `shared_expenses/${t}`,
      ...s
    });
  }
}
var or = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, Ge = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? nr(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && or(t, s, r), r;
};
let Se = class extends m {
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
      const s = lr();
      if (s) {
        this.groupId = s, this.replacePath(`/group/${s}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (e) => {
      const t = e.detail.groupId;
      this.groupId = t, cr(t), this.replacePath(`/group/${t}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.replacePath("");
    }, this.handleGroupUnavailable = () => {
      dr(), this.goToDashboard();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new ht(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return o``;
    const e = ts(this.hass.locale?.language ?? this.hass.language), t = this.hass.locale?.language ?? this.hass.language;
    return this.groupId ? o`
        <se-group-page
          .api=${this.api}
          .hass=${this.hass}
          .narrow=${this.narrow}
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
        .hass=${this.hass}
        .narrow=${this.narrow}
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
    const t = this.route?.prefix ?? window.location.pathname.split("/")[1], s = t.startsWith("/") ? t : `/${t}`;
    history.replaceState(null, "", `${s}${e}`);
  }
};
Se.styles = x`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
Ge([
  l({ attribute: !1 })
], Se.prototype, "hass", 2);
Ge([
  l({ type: Boolean })
], Se.prototype, "narrow", 2);
Ge([
  l({ attribute: !1 })
], Se.prototype, "route", 2);
Ge([
  c()
], Se.prototype, "groupId", 2);
Se = Ge([
  b("shared-expenses-panel")
], Se);
const $t = "shared_expenses.last_group";
function lr() {
  try {
    return window.localStorage.getItem($t);
  } catch {
    return null;
  }
}
function cr(e) {
  try {
    window.localStorage.setItem($t, e);
  } catch {
  }
}
function dr() {
  try {
    window.localStorage.removeItem($t);
  } catch {
  }
}
var hr = Object.defineProperty, pr = Object.getOwnPropertyDescriptor, me = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? pr(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && hr(t, s, r), r;
};
let re = class extends m {
  constructor() {
    super(...arguments), this.balances = [], this.settlements = [], this.members = [], this.currency = "EUR", this.loading = !0, this.settleUp = () => {
      const e = `/shared_expenses/group/${this.config.group_id}`;
      history.pushState(null, "", e), window.dispatchEvent(
        new CustomEvent("location-changed", { bubbles: !0, composed: !0 })
      );
    };
  }
  /**
   * Which project to show.
   *
   * Throwing is how a Lovelace card reports a config it cannot use: Home
   * Assistant catches it and puts the message on the card, where the person
   * writing the YAML is looking. Saying where the id lives is the whole of the
   * help they need — no selector lists a project, so there is nowhere else to
   * find out.
   */
  setConfig(e) {
    if (!e?.group_id)
      throw new Error(
        "shared-expenses-card needs a group_id. Every entity of the project carries it: Developer tools → States."
      );
    this.config = e;
  }
  /**
   * What the card picker drops in when it is picked.
   *
   * Without this it would offer a card that throws on sight. The first project
   * of whoever is adding it is a guess, but it is a working one, and the id is
   * right there in the YAML to change.
   */
  static async getStubConfig(e) {
    return { type: "custom:shared-expenses-card", group_id: (await new ht(e).listGroups(!1).catch(() => []))[0]?.id };
  }
  /** Roughly the height of the answer, in Home Assistant's own unit of card. */
  getCardSize() {
    return 3;
  }
  connectedCallback() {
    super.connectedCallback(), this.refresh();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.loadedFor = void 0, this.stop();
  }
  willUpdate() {
    this.refresh();
  }
  /**
   * Load the project, once.
   *
   * The guard is the point. Home Assistant hands a card a new `hass` on every
   * state change anywhere in the house — a light, a sensor, a door — so this
   * runs constantly and must do nothing almost every time.
   */
  refresh() {
    const e = this.config?.group_id;
    !this.hass || !e || !this.isConnected || this.loadedFor === e || (this.loadedFor = e, this.start(e));
  }
  async start(e) {
    await this.stop(), await this.load(e);
    try {
      this.unsubscribe = await this.api.subscribeGroup(e, () => {
        this.load(e);
      });
    } catch {
    }
  }
  async stop() {
    const e = this.unsubscribe;
    this.unsubscribe = void 0, await e?.().catch(() => {
    });
  }
  async load(e) {
    const t = this.api;
    if (t)
      try {
        const [s, i, r] = await Promise.all([
          t.getGroup(e),
          t.getBalances(e),
          // Everybody, including whoever left: leaving does not clear a debt, so
          // a settlement can still name them, and a name has to resolve.
          t.listMembers(e, !0)
        ]);
        this.currency = s.currency, this.balances = i.balances, this.settlements = i.settlements, this.members = r, this.error = void 0;
      } catch (s) {
        this.error = _(s, this.localize);
      } finally {
        this.loading = !1;
      }
  }
  get api() {
    return this.hass ? new ht(this.hass) : void 0;
  }
  get language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }
  get localize() {
    return ts(this.language);
  }
  /**
   * Which member you are, or null when the account is nobody in this project.
   *
   * Null is the kitchen tablet, and an ordinary answer rather than a failure:
   * the card drops to the project's own view, and says who owes whom without
   * ever saying "you". Same as the panel on the same tablet.
   */
  meId() {
    const e = this.hass?.user?.id;
    return e ? this.members.find((t) => t.user_id === e)?.id ?? null : null;
  }
  render() {
    return this.error ? o`<div class="card note">${this.error}</div>` : this.loading ? o`<div class="card note">${this.localize("loading")}</div>` : o`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.balances}
        .settlements=${this.settlements}
        .members=${this.members}
        .meId=${this.meId()}
        .currency=${this.currency}
        .language=${this.language}
        @settle-up=${this.settleUp}
      ></se-balance-card>
    `;
  }
};
re.styles = [
  z,
  x`
      :host {
        display: block;
      }

      .note {
        padding: 16px;
        color: var(--secondary-text-color);
      }
    `
];
me([
  l({ attribute: !1 })
], re.prototype, "hass", 2);
me([
  c()
], re.prototype, "config", 2);
me([
  c()
], re.prototype, "balances", 2);
me([
  c()
], re.prototype, "settlements", 2);
me([
  c()
], re.prototype, "members", 2);
me([
  c()
], re.prototype, "currency", 2);
me([
  c()
], re.prototype, "error", 2);
me([
  c()
], re.prototype, "loading", 2);
re = me([
  b("shared-expenses-card")
], re);
const ur = window.customCards ??= [];
ur.push({
  type: "shared-expenses-card",
  name: "Shared Expenses",
  description: "Who owes what to whom, in one project."
});
export {
  re as SharedExpensesCard,
  Se as SharedExpensesPanel
};
