/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Be = globalThis, ot = Be.ShadowRoot && (Be.ShadyCSS === void 0 || Be.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, nt = Symbol(), gt = /* @__PURE__ */ new WeakMap();
let jt = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== nt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ot && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = gt.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && gt.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Kt = (t) => new jt(typeof t == "string" ? t : t + "", void 0, nt), _ = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, a) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[a + 1], t[0]);
  return new jt(s, t, nt);
}, Zt = (t, e) => {
  if (ot) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = Be.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, ft = ot ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Kt(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Xt, defineProperty: Jt, getOwnPropertyDescriptor: Qt, getOwnPropertyNames: es, getOwnPropertySymbols: ts, getPrototypeOf: ss } = Object, Ye = globalThis, bt = Ye.trustedTypes, is = bt ? bt.emptyScript : "", rs = Ye.reactiveElementPolyfillSupport, Ae = (t, e) => t, Ge = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? is : null;
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
} }, lt = (t, e) => !Xt(t, e), yt = { attribute: !0, type: String, converter: Ge, reflect: !1, useDefault: !1, hasChanged: lt };
Symbol.metadata ??= Symbol("metadata"), Ye.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let $e = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = yt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && Jt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: a } = Qt(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? yt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Ae("elementProperties"))) return;
    const e = ss(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ae("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ae("properties"))) {
      const s = this.properties, i = [...es(s), ...ts(s)];
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
      for (const r of i) s.unshift(ft(r));
    } else e !== void 0 && s.push(ft(e));
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
    return Zt(e, this.constructor.elementStyles), e;
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
      const a = (i.converter?.toAttribute !== void 0 ? i.converter : Ge).toAttribute(s, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = i.getPropertyOptions(r), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : Ge;
      this._$Em = r;
      const h = o.fromAttribute(s, a.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (a = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? lt)(a, s) || i.useDefault && i.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
$e.elementStyles = [], $e.shadowRootOptions = { mode: "open" }, $e[Ae("elementProperties")] = /* @__PURE__ */ new Map(), $e[Ae("finalized")] = /* @__PURE__ */ new Map(), rs?.({ ReactiveElement: $e }), (Ye.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = globalThis, vt = (t) => t, Le = ct.trustedTypes, $t = Le ? Le.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Rt = "$lit$", ne = `lit$${Math.random().toFixed(9).slice(2)}$`, Ut = "?" + ne, as = `<${Ut}>`, ge = document, Ee = () => ge.createComment(""), Oe = (t) => t === null || typeof t != "object" && typeof t != "function", pt = Array.isArray, os = (t) => pt(t) || typeof t?.[Symbol.iterator] == "function", Je = `[ 	
\f\r]`, Ce = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _t = /-->/g, xt = />/g, ue = RegExp(`>|${Je}(?:([^\\s"'>=/]+)(${Je}*=${Je}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), wt = /'/g, zt = /"/g, Nt = /^(?:script|style|textarea|title)$/i, qt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), n = qt(1), St = qt(2), _e = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), kt = /* @__PURE__ */ new WeakMap(), me = ge.createTreeWalker(ge, 129);
function Bt(t, e) {
  if (!pt(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return $t !== void 0 ? $t.createHTML(e) : e;
}
const ns = (t, e) => {
  const s = t.length - 1, i = [];
  let r, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = Ce;
  for (let h = 0; h < s; h++) {
    const d = t[h];
    let f, x, u = -1, K = 0;
    for (; K < d.length && (o.lastIndex = K, x = o.exec(d), x !== null); ) K = o.lastIndex, o === Ce ? x[1] === "!--" ? o = _t : x[1] !== void 0 ? o = xt : x[2] !== void 0 ? (Nt.test(x[2]) && (r = RegExp("</" + x[2], "g")), o = ue) : x[3] !== void 0 && (o = ue) : o === ue ? x[0] === ">" ? (o = r ?? Ce, u = -1) : x[1] === void 0 ? u = -2 : (u = o.lastIndex - x[2].length, f = x[1], o = x[3] === void 0 ? ue : x[3] === '"' ? zt : wt) : o === zt || o === wt ? o = ue : o === _t || o === xt ? o = Ce : (o = ue, r = void 0);
    const S = o === ue && t[h + 1].startsWith("/>") ? " " : "";
    a += o === Ce ? d + as : u >= 0 ? (i.push(f), d.slice(0, u) + Rt + d.slice(u) + ne + S) : d + ne + (u === -2 ? h : S);
  }
  return [Bt(t, a + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Ie {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let a = 0, o = 0;
    const h = e.length - 1, d = this.parts, [f, x] = ns(e, s);
    if (this.el = Ie.createElement(f, i), me.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = me.nextNode()) !== null && d.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(Rt)) {
          const K = x[o++], S = r.getAttribute(u).split(ne), k = /([.?@])?(.*)/.exec(K);
          d.push({ type: 1, index: a, name: k[2], strings: S, ctor: k[1] === "." ? cs : k[1] === "?" ? ps : k[1] === "@" ? ds : Ke }), r.removeAttribute(u);
        } else u.startsWith(ne) && (d.push({ type: 6, index: a }), r.removeAttribute(u));
        if (Nt.test(r.tagName)) {
          const u = r.textContent.split(ne), K = u.length - 1;
          if (K > 0) {
            r.textContent = Le ? Le.emptyScript : "";
            for (let S = 0; S < K; S++) r.append(u[S], Ee()), me.nextNode(), d.push({ type: 2, index: ++a });
            r.append(u[K], Ee());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Ut) d.push({ type: 2, index: a });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(ne, u + 1)) !== -1; ) d.push({ type: 7, index: a }), u += ne.length - 1;
      }
      a++;
    }
  }
  static createElement(e, s) {
    const i = ge.createElement("template");
    return i.innerHTML = e, i;
  }
}
function xe(t, e, s = t, i) {
  if (e === _e) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const a = Oe(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== a && (r?._$AO?.(!1), a === void 0 ? r = void 0 : (r = new a(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = xe(t, r._$AS(t, e.values), r, i)), e;
}
class ls {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? ge).importNode(s, !0);
    me.currentNode = r;
    let a = me.nextNode(), o = 0, h = 0, d = i[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let f;
        d.type === 2 ? f = new Me(a, a.nextSibling, this, e) : d.type === 1 ? f = new d.ctor(a, d.name, d.strings, this, e) : d.type === 6 && (f = new hs(a, this, e)), this._$AV.push(f), d = i[++h];
      }
      o !== d?.index && (a = me.nextNode(), o++);
    }
    return me.currentNode = ge, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class Me {
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
    e = xe(this, e, s), Oe(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== _e && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : os(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && Oe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ge.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Ie.createElement(Bt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const a = new ls(r, this), o = a.u(this.options);
      a.p(s), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let s = kt.get(e.strings);
    return s === void 0 && kt.set(e.strings, s = new Ie(e)), s;
  }
  k(e) {
    pt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const a of e) r === s.length ? s.push(i = new Me(this.O(Ee()), this.O(Ee()), this, this.options)) : i = s[r], i._$AI(a), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = vt(e).nextSibling;
      vt(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class Ke {
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
    if (a === void 0) e = xe(this, e, s, 0), o = !Oe(e) || e !== this._$AH && e !== _e, o && (this._$AH = e);
    else {
      const h = e;
      let d, f;
      for (e = a[0], d = 0; d < a.length - 1; d++) f = xe(this, h[i + d], s, d), f === _e && (f = this._$AH[d]), o ||= !Oe(f) || f !== this._$AH[d], f === p ? e = p : e !== p && (e += (f ?? "") + a[d + 1]), this._$AH[d] = f;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class cs extends Ke {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class ps extends Ke {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class ds extends Ke {
  constructor(e, s, i, r, a) {
    super(e, s, i, r, a), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = xe(this, e, s, 0) ?? p) === _e) return;
    const i = this._$AH, r = e === p && i !== p || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, a = e !== p && (i === p || r);
    r && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class hs {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    xe(this, e);
  }
}
const us = ct.litHtmlPolyfillSupport;
us?.(Ie, Me), (ct.litHtmlVersions ??= []).push("3.3.3");
const ms = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const a = s?.renderBefore ?? null;
    i._$litPart$ = r = new Me(e.insertBefore(Ee(), a), a, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt = globalThis;
let g = class extends $e {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ms(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return _e;
  }
};
g._$litElement$ = !0, g.finalized = !0, dt.litElementHydrateSupport?.({ LitElement: g });
const gs = dt.litElementPolyfillSupport;
gs?.({ LitElement: g });
(dt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const y = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fs = { attribute: !0, type: String, converter: Ge, reflect: !1, hasChanged: lt }, bs = (t = fs, e, s) => {
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
  return (e, s) => typeof s == "object" ? bs(t, e, s) : ((i, r, a) => {
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
var ys = Object.defineProperty, vs = Object.getOwnPropertyDescriptor, Ze = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? vs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ys(e, s, r), r;
};
let we = class extends g {
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
we.styles = _`
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
Ze([
  l({ type: String })
], we.prototype, "variant", 2);
Ze([
  l({ type: Boolean })
], we.prototype, "disabled", 2);
Ze([
  l({ type: String })
], we.prototype, "icon", 2);
we = Ze([
  y("se-button")
], we);
var $s = Object.defineProperty, _s = Object.getOwnPropertyDescriptor, Se = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? _s(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && $s(e, s, r), r;
};
let le = class extends g {
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
le.styles = _`
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
Se([
  l({ type: String })
], le.prototype, "icon", 2);
Se([
  l({ type: String })
], le.prototype, "fallback", 2);
Se([
  l({ type: String })
], le.prototype, "color", 2);
Se([
  l({ type: Number })
], le.prototype, "size", 2);
Se([
  l({ type: Boolean })
], le.prototype, "plain", 2);
le = Se([
  y("se-icon")
], le);
var xs = Object.getOwnPropertyDescriptor, ws = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? xs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = o(r) || r);
  return r;
};
let tt = class extends g {
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
tt.styles = _`
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
tt = ws([
  y("se-menu-button")
], tt);
var zs = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, ht = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ss(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && zs(e, s, r), r;
};
const ks = 300;
let De = class extends g {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.keepInView = (t) => {
      const e = t.target;
      e?.scrollIntoView && window.setTimeout(() => {
        e.scrollIntoView({ block: "center", behavior: "smooth" });
      }, ks);
    }, this.close = () => {
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
    super.connectedCallback(), window.addEventListener("keydown", this.handleKeydown), this.addEventListener("focusin", this.keepInView);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", this.handleKeydown), this.removeEventListener("focusin", this.keepInView);
  }
  stop(t) {
    t.stopPropagation();
  }
};
De.styles = _`
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
ht([
  l({ type: String })
], De.prototype, "heading", 2);
ht([
  l({ type: Boolean, reflect: !0 })
], De.prototype, "open", 2);
De = ht([
  y("se-dialog")
], De);
var Cs = Object.defineProperty, Ps = Object.getOwnPropertyDescriptor, te = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ps(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Cs(e, s, r), r;
};
let F = class extends g {
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
F.styles = _`
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
te([
  l({ type: String })
], F.prototype, "label", 2);
te([
  l({ type: String })
], F.prototype, "value", 2);
te([
  l({ type: String })
], F.prototype, "type", 2);
te([
  l({ type: String })
], F.prototype, "placeholder", 2);
te([
  l({ type: String })
], F.prototype, "suffix", 2);
te([
  l({ type: String })
], F.prototype, "helper", 2);
te([
  l({ type: Boolean })
], F.prototype, "required", 2);
te([
  l({ type: Boolean })
], F.prototype, "disabled", 2);
te([
  l({ type: Boolean })
], F.prototype, "decimal", 2);
F = te([
  y("se-field")
], F);
const He = {
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
  default_category: "Default category",
  default_category_hint: "A new expense opens on this one. One category per group.",
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
  default_from_category: "Whatever the category says, or the group when it says nothing.",
  default_from_group: "Whatever the group says for expenses with no category.",
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
}, As = {
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
  default_category: "Catégorie par défaut",
  default_category_hint: "Une nouvelle dépense s'ouvrira sur celle-ci. Une seule par groupe.",
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
  default_from_category: "Ce que dit la catégorie, ou le groupe si elle ne dit rien.",
  default_from_group: "Ce que dit le groupe pour les dépenses sans catégorie.",
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
}, Es = { en: He, fr: As };
function Os(t) {
  const e = Es[t.split("-")[0]] ?? He;
  return (s) => e[s] ?? He[s] ?? s;
}
function w(t, e) {
  const s = t?.code;
  return s && s in He ? e(s) : t?.message || e("error_generic");
}
const P = _`
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
var Is = Object.defineProperty, Ds = Object.getOwnPropertyDescriptor, pe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ds(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Is(e, s, r), r;
};
let J = class extends g {
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
J.styles = P;
pe([
  l({ attribute: !1 })
], J.prototype, "api", 2);
pe([
  l({ attribute: !1 })
], J.prototype, "localize", 2);
pe([
  c()
], J.prototype, "name", 2);
pe([
  c()
], J.prototype, "description", 2);
pe([
  c()
], J.prototype, "currency", 2);
pe([
  c()
], J.prototype, "busy", 2);
pe([
  c()
], J.prototype, "error", 2);
J = pe([
  y("se-group-dialog")
], J);
var Ts = Object.defineProperty, Ms = Object.getOwnPropertyDescriptor, ve = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ms(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ts(e, s, r), r;
};
let re = class extends g {
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
          ${this.error ? n`<div class="error">${this.error}</div>` : p}

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
re.styles = [
  P,
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
ve([
  l({ attribute: !1 })
], re.prototype, "api", 2);
ve([
  l({ attribute: !1 })
], re.prototype, "localize", 2);
ve([
  c()
], re.prototype, "groups", 2);
ve([
  c()
], re.prototype, "loading", 2);
ve([
  c()
], re.prototype, "error", 2);
ve([
  c()
], re.prototype, "dialogOpen", 2);
re = ve([
  y("se-dashboard-page")
], re);
function B(t, e, s) {
  return new Intl.NumberFormat(s, {
    style: "currency",
    currency: e
  }).format(t / 100);
}
function fe(t) {
  const e = t.trim().replace(",", ".").replace(/\s/g, "");
  if (e === "" || !/^-?\d*\.?\d*$/.test(e))
    return null;
  const s = Number(e);
  return Number.isNaN(s) ? null : Math.round(s * 100);
}
function Fe(t, e) {
  const s = new Intl.DateTimeFormat(e, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(t));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function js(t, e) {
  const [s, i] = t.split("-").map(Number), r = new Intl.DateTimeFormat(e, {
    month: "short",
    year: "numeric"
  }).format(new Date(s, i - 1, 1));
  return r.charAt(0).toUpperCase() + r.slice(1);
}
function Gt() {
  const t = /* @__PURE__ */ new Date(), e = `${t.getMonth() + 1}`.padStart(2, "0"), s = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
function st(t) {
  return (/* @__PURE__ */ new Date(`${t}T12:00:00`)).toISOString();
}
function Lt(t) {
  const e = new Date(t), s = `${e.getMonth() + 1}`.padStart(2, "0"), i = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${s}-${i}`;
}
function it(t) {
  return (t / 100).toFixed(2);
}
function H(t) {
  const e = t.trim().split(/\s+/).filter(Boolean);
  return e.length === 0 ? "?" : e.length === 1 ? e[0].slice(0, 2).toUpperCase() : (e[0][0] + e[e.length - 1][0]).toUpperCase();
}
const rt = [
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
  for (let s = 0; s < t.length; s += 1)
    e = e * 31 + t.charCodeAt(s) >>> 0;
  return rt[e % rt.length];
}
var Rs = Object.defineProperty, Us = Object.getOwnPropertyDescriptor, de = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Us(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Rs(e, s, r), r;
};
let Q = class extends g {
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
      ${s.length === 0 ? p : n`
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
    const e = this.localize, s = t.from_member_id === this.meId, i = s ? t.to_member_id : t.from_member_id, r = this.memberById(i), a = r?.name ?? "?", o = n`
      <strong class=${`figure ${s ? "negative" : "positive"}`}>
        ${B(t.amount, this.currency, this.language)}
      </strong>
    `;
    return n`
      <button
        class="mine line-button"
        title=${e("settle_up")}
        @click=${() => this.settle(t)}
      >
        <div class="avatar" style=${`background:${r?.color ?? C(i)}`}>
          ${H(a)}
        </div>
        <div class="sentence">
          ${s ? n`${e("you_owe")} ${o} ${e("to")} ${a}` : n`${a} ${e("owes_you")} ${o}`}
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
          ${B(t.amount, this.currency, this.language)}
        </span>
      </button>
    `;
  }
  renderParty(t) {
    const e = this.memberById(t), s = e?.name ?? "?";
    return n`
      <span class="party" title=${s}>
        <span
          class="avatar"
          style=${`background:${e?.color ?? C(t)}`}
          >${H(s)}</span
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
    const e = t.find((a) => a.member_id === this.meId), [s, i] = e ? [e, t.find((a) => a !== e)] : [...t].sort((a, o) => o.amount - a.amount), r = this.settlements[0];
    return n`
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
  renderSide(t, e) {
    const s = this.memberById(t.member_id), i = t.amount > 0, r = i ? "positive" : "negative", a = n`
      <div class="avatar" style=${`background:${s?.color ?? C(t.member_id)}`}>
        ${H(s?.name ?? "?")}
      </div>
    `, o = n`
      <div class="body">
        <div class="name">${s?.name ?? "?"}</div>
        <div class=${`verdict ${r}`}>${this.verdict(t, i)}</div>
        <div class=${`figure ${r}`}>
          ${B(Math.abs(t.amount), this.currency, this.language)}
        </div>
      </div>
    `;
    return n`
      <div class=${`side ${e ? "right" : ""}`}>
        ${e ? p : a}${o}${e ? a : p}
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
        <div class="avatar" style=${`background:${e?.color ?? C(t.member_id)}`}>
          ${H(e?.name ?? "?")}
        </div>
        <span class="name">${e?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${i}`}>
            ${s ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${i}`}>
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
Q.styles = [
  P,
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
de([
  l({ attribute: !1 })
], Q.prototype, "localize", 2);
de([
  l({ attribute: !1 })
], Q.prototype, "balances", 2);
de([
  l({ attribute: !1 })
], Q.prototype, "settlements", 2);
de([
  l({ attribute: !1 })
], Q.prototype, "members", 2);
de([
  l({ type: String })
], Q.prototype, "meId", 2);
de([
  l({ type: String })
], Q.prototype, "currency", 2);
de([
  l({ type: String })
], Q.prototype, "language", 2);
Q = de([
  y("se-balance-card")
], Q);
var Ns = Object.defineProperty, qs = Object.getOwnPropertyDescriptor, je = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? qs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ns(e, s, r), r;
};
let be = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = null, this.fallback = "#5c6b8a";
  }
  render() {
    const t = this.localize;
    return n`
      ${this.label ? n`<label>${this.label}</label>` : p}

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

        ${rt.map(
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
be.styles = [
  P,
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
je([
  l({ attribute: !1 })
], be.prototype, "localize", 2);
je([
  l({ type: String })
], be.prototype, "label", 2);
je([
  l({ type: String })
], be.prototype, "value", 2);
je([
  l({ type: String })
], be.prototype, "fallback", 2);
be = je([
  y("se-color-picker")
], be);
var Bs = Object.defineProperty, Gs = Object.getOwnPropertyDescriptor, ae = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Gs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Bs(e, s, r), r;
};
const Ct = "/static/mdi/iconList.json", Qe = 48;
let Ne = null;
function Ls() {
  return Ne === null && (Ne = fetch(Ct).then((t) => {
    if (!t.ok)
      throw new Error(`${t.status} on ${Ct}`);
    return t.json();
  }).catch((t) => {
    throw Ne = null, t;
  })), Ne;
}
let Z = class extends g {
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
        this.icons = await Ls();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(t) {
    const e = t.trim().toLowerCase();
    if (e === "") {
      this.suggestions = this.icons.slice(0, Qe);
      return;
    }
    const s = [], i = [], r = [];
    for (const a of this.icons)
      if (a.name.startsWith(e) ? s.push(a) : a.name.includes(e) ? i.push(a) : a.keywords?.some((o) => o.includes(e)) && r.push(a), s.length >= Qe)
        break;
    this.suggestions = [...s, ...i, ...r].slice(0, Qe);
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
Z.styles = [
  P,
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
ae([
  l({ attribute: !1 })
], Z.prototype, "localize", 2);
ae([
  l({ type: String })
], Z.prototype, "label", 2);
ae([
  l({ type: String })
], Z.prototype, "value", 2);
ae([
  l({ type: String })
], Z.prototype, "color", 2);
ae([
  c()
], Z.prototype, "icons", 2);
ae([
  c()
], Z.prototype, "suggestions", 2);
ae([
  c()
], Z.prototype, "open", 2);
ae([
  c()
], Z.prototype, "failed", 2);
Z = ae([
  y("se-icon-picker")
], Z);
var Hs = Object.defineProperty, Fs = Object.getOwnPropertyDescriptor, ke = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Fs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Hs(e, s, r), r;
};
let ce = class extends g {
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
ce.styles = _`
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
ke([
  l({ type: String })
], ce.prototype, "label", 2);
ke([
  l({ type: String })
], ce.prototype, "value", 2);
ke([
  l({ attribute: !1 })
], ce.prototype, "options", 2);
ke([
  l({ type: String })
], ce.prototype, "placeholder", 2);
ke([
  l({ type: Boolean })
], ce.prototype, "disabled", 2);
ce = ke([
  y("se-select")
], ce);
function Ht(t) {
  const { amount: e, payerId: s, memberIds: i } = t;
  if (!Number.isInteger(e) || e <= 0)
    return null;
  const r = [...new Set(i)];
  if (r.length === 0 || !r.includes(s))
    return null;
  const a = t.rule ?? {}, o = Ws(a, e);
  if (o === null)
    return null;
  const h = a.participants == null ? r : [...new Set(a.participants)];
  if (h.some((S) => !r.includes(S)))
    return null;
  const d = h.length === 0 ? 0 : o, f = at(d, h), x = e - d;
  if (x > 0) {
    const S = Vs(a.remainder, x, s, r);
    if (S === null)
      return null;
    for (const [k, Ue] of Object.entries(S))
      f[k] = (f[k] ?? 0) + Ue;
  }
  const u = {};
  for (const [S, k] of Object.entries(f))
    k !== 0 && (u[S] = k);
  return Object.values(u).reduce((S, k) => S + k, 0) === e ? u : null;
}
function Ws(t, e) {
  return t.envelope == null ? e : t.envelope < 0 ? null : Math.min(t.envelope, e);
}
const et = 1e4;
function Vs(t, e, s, i) {
  const r = t ?? {}, a = r.fixed ?? {}, o = r.percent ?? {};
  for (const [m, T] of Object.entries(a))
    if (!i.includes(m) || T < 0)
      return null;
  for (const [m, T] of Object.entries(o))
    if (!i.includes(m) || T < 0)
      return null;
  const h = r.members == null ? [s] : [...new Set(r.members)];
  if (h.length === 0 || h.some((m) => !i.includes(m)))
    return null;
  const d = {}, f = {};
  for (const m of h)
    m in a && (d[m] = a[m]), m in o && (f[m] = o[m]);
  if (Object.keys(d).some((m) => m in f))
    return null;
  const x = Object.values(f).reduce((m, T) => m + T, 0);
  if (x > et)
    return null;
  const u = {};
  for (const [m, T] of Object.entries(f))
    u[m] = Math.floor(e * T / et);
  const S = Object.values(d).reduce((m, T) => m + T, 0) + Object.values(u).reduce((m, T) => m + T, 0);
  if (S > e)
    return null;
  const k = { ...d, ...u }, Ue = h.filter(
    (m) => !(m in d) && !(m in f)
  ), Xe = e - S;
  if (Ue.length > 0) {
    for (const [m, T] of Object.entries(at(Xe, Ue)))
      k[m] = (k[m] ?? 0) + T;
    return k;
  }
  if (Xe === 0)
    return k;
  if (x === et && Object.keys(f).length > 0) {
    for (const [m, T] of Object.entries(
      at(Xe, Object.keys(u))
    ))
      k[m] = (k[m] ?? 0) + T;
    return k;
  }
  return null;
}
function at(t, e) {
  if (t <= 0 || e.length === 0)
    return {};
  const s = Math.floor(t / e.length), i = t % e.length, r = {};
  return e.forEach((a, o) => {
    r[a] = s + (o < i ? 1 : 0);
  }), r;
}
const Pt = 1e4;
function ut(t) {
  if (t === null)
    return "default";
  const e = Object.keys(t.remainder?.percent ?? {}), s = Object.keys(t.remainder?.fixed ?? {});
  if (e.length > 0 && s.length > 0)
    return "custom";
  if (t.envelope === 0)
    return "exact";
  if (e.length > 0)
    return "custom";
  const i = t.remainder?.members ?? [], r = Object.keys(t.remainder?.fixed ?? {});
  return t.envelope == null && i.length === 0 && r.length === 0 ? "equal" : i.length <= 1 && r.length === 0 ? "partial" : "custom";
}
function Ys(t, e) {
  if (t === "default")
    return null;
  if (t === "equal")
    return {
      envelope: null,
      participants: e.participants.size === e.memberIds.length ? null : [...e.participants],
      remainder: {}
    };
  if (t === "exact")
    return {
      envelope: 0,
      remainder: e.unit === "percent" ? { members: [...e.participants], percent: Et(e) } : { members: [...e.participants], fixed: At(e) }
    };
  const s = e.envelopeInput.trim() === "" ? null : fe(e.envelopeInput.trim()), i = e.participants.size === e.memberIds.length ? null : [...e.participants];
  return t === "custom" ? {
    envelope: s,
    participants: i,
    remainder: {
      // Nobody ticked: whoever paid takes it, which the model says with null.
      members: e.takers.size === 0 ? null : [...e.takers],
      fixed: At(e, e.takers),
      // Written back untouched. The panel offers no way to type a share here
      // — the `percent` mode is where that lives — but a rule that arrived
      // with some keeps them: dropping what an editor cannot show is how a
      // save quietly rewrites what people owe.
      percent: Et(e, e.takers)
    }
  } : {
    envelope: s,
    participants: i,
    // Nobody named: whoever paid takes it, which the model says with null.
    remainder: { members: e.restTo ? [e.restTo] : null, fixed: {} }
  };
}
function Ks(t, e, s) {
  const i = ut(t), r = t?.remainder?.members ?? (s ? [s] : []);
  return {
    participants: i === "exact" ? new Set(r) : new Set(t?.participants ?? e),
    takers: new Set(r),
    envelopeInput: t?.envelope != null ? Ot(t.envelope) : "",
    amounts: Object.fromEntries(
      Object.entries(t?.remainder?.fixed ?? {}).map(([o, h]) => [
        o,
        Ot(h)
      ])
    ),
    percents: Object.fromEntries(
      Object.entries(t?.remainder?.percent ?? {}).map(([o, h]) => [
        o,
        Zs(h)
      ])
    ),
    // One taker is a person to name. Several is a shape this editor has no room
    // for, so the rest falls back to whoever paid — as `partial` reads it.
    restTo: i === "partial" && t?.remainder?.members?.length === 1 ? t.remainder.members[0] : s ?? "",
    // Whichever the rule was written in. A rule with neither is an equal split
    // dressed as `exact`, and money is the one to offer first.
    unit: Object.keys(t?.remainder?.percent ?? {}).length > 0 ? "percent" : "money",
    memberIds: e
  };
}
function At(t, e = t.participants) {
  const s = {};
  for (const [i, r] of Object.entries(t.amounts)) {
    if (!e.has(i) || r.trim() === "")
      continue;
    const a = fe(r);
    a !== null && (s[i] = a);
  }
  return s;
}
function Et(t, e = t.participants) {
  const s = {};
  for (const [i, r] of Object.entries(t.percents)) {
    if (!e.has(i) || r.trim() === "")
      continue;
    const a = Ft(r);
    a !== null && (s[i] = a);
  }
  return s;
}
function Ft(t) {
  const e = t.trim().replace(",", ".");
  if (e === "")
    return null;
  const s = Number(e);
  return Number.isFinite(s) ? Math.round(s * 100) : null;
}
function Zs(t) {
  return t % 100 === 0 ? String(t / 100) : (t / 100).toFixed(2);
}
function Ot(t) {
  return (t / 100).toFixed(2);
}
var Xs = Object.defineProperty, Js = Object.getOwnPropertyDescriptor, I = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Js(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Xs(e, s, r), r;
};
const Qs = 8542, It = ["equal", "exact", "partial", "custom"];
let A = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.mode = "equal", this.participants = /* @__PURE__ */ new Set(), this.envelopeInput = "", this.amounts = {}, this.percents = {}, this.unit = "money", this.restTo = "", this.takers = /* @__PURE__ */ new Set();
  }
  connectedCallback() {
    super.connectedCallback(), this.mode = ut(this.rule);
    const t = Ks(
      this.rule,
      this.members.map((e) => e.id),
      this.payerId
    );
    this.participants = t.participants, this.envelopeInput = t.envelopeInput, this.amounts = t.amounts, this.percents = t.percents, this.unit = t.unit, this.takers = t.takers, this.restTo = this.mode === "partial" ? t.restTo : "";
  }
  willUpdate(t) {
    if (!t.has("payerId"))
      return;
    const e = t.get("payerId");
    e != null && this.restTo === e && (this.restTo = this.payerId ?? "");
  }
  firstUpdated() {
    this.emit();
  }
  updated(t) {
    t.has("payerId") && this.emit();
  }
  render() {
    return this.renderPanel();
  }
  /** What the panel works on: the real expense, or a sample to stand for one. */
  get previewAmount() {
    return this.amount != null && this.amount > 0 ? this.amount : Qs;
  }
  renderPanel() {
    const t = this.localize, e = this.shares();
    return n`
      <div class="panel">
        <se-select
          .label=${t("split_how")}
          .value=${this.mode}
          .options=${this.offered().map((s) => ({
      value: s,
      label: t(`split_${s}`)
    }))}
          @value-changed=${(s) => this.pick(s.detail.value)}
        ></se-select>

        ${this.mode === "default" ? this.renderDefault() : p}
        ${this.mode === "equal" ? this.renderEqual(e) : p}
        ${this.mode === "exact" ? this.renderExact(e) : p}
        ${this.mode === "partial" ? this.renderPartial(e) : p}
        ${this.mode === "custom" ? this.renderCustom(e) : p}
        ${e === null ? n`<div class="warn">${t("rule_invalid")}</div>` : p}
      </div>
    `;
  }
  /** What can be picked here, and what this rule already happens to be. */
  offered() {
    const t = this.inherits ? ["default", ...It] : [...It];
    return t.includes(this.mode) ? t : [...t, this.mode];
  }
  /** Nothing to fill in: the rule is somebody else's. */
  renderDefault() {
    return n`
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
  renderEqual(t) {
    return n`
      <div>
        <div class="muted">${this.localize("split_equal_hint")}</div>
        <div class="muted example">${this.localize("split_equal_example")}</div>
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
              <span class="share">${this.shareOf(t, e.id)}</span>
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
  renderExact(t) {
    const e = this.localize, s = this.unit === "percent", i = this.percentTotal();
    return n`
      <div>
        <div class="head">
          <div>
            <div class="muted">
              ${e(s ? "split_percent_hint" : "split_exact_hint")}
            </div>
            <div class="muted example">
              ${e(s ? "split_percent_example" : "split_exact_example")}
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
      (r) => n`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(r.id)}
                @change=${() => this.toggleParticipant(r.id)}
              />
              ${this.renderAvatar(r)}
              <span class="name">${r.name}</span>
              ${s ? n`<span class="share">${this.shareOf(t, r.id)}</span>` : p}
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
                placeholder=${s ? "—" : this.shareOf(t, r.id) || this.localize("split_the_rest_short")}
                @value-changed=${(a) => s ? this.setPercent(r.id, a.detail.value) : this.setAmount(r.id, a.detail.value)}
              ></se-field>
            </div>
          `
    )}

        ${s ? n`
              <div class="total">
                <span class="muted">${e("split_percent_total")}</span>
                <strong class=${i > Pt ? "negative" : ""}>
                  ${(i / 100).toFixed(i % 100 === 0 ? 0 : 2)} %
                </strong>
              </div>
              ${i > Pt ? n`<div class="warn">${e("split_percent_over")}</div>` : p}
            ` : p}
      </div>
    `;
  }
  /**
   * Switch the unit, dropping what was typed in the other.
   *
   * 40 EUR is not 40%, and carrying the figures across would turn one into the
   * other without a word — a different expense, silently.
   */
  setUnit(t) {
    t !== this.unit && (this.unit = t, this.amounts = {}, this.percents = {}, this.emit());
  }
  /** What has been claimed so far, in hundredths of a percent. */
  percentTotal() {
    let t = 0;
    for (const [e, s] of Object.entries(this.percents))
      this.participants.has(e) && (t += Ft(s) ?? 0);
    return t;
  }
  setPercent(t, e) {
    this.percents = { ...this.percents, [t]: e }, this.emit();
  }
  /** An amount shared between some; whatever is left goes to one person. */
  renderPartial(t) {
    const e = this.localize, s = fe(this.envelopeInput), i = s === null ? null : Math.max(this.previewAmount - s, 0);
    return n`
      <div>
        <div class="muted example">${e("split_partial_example")}</div>
        <se-field
          .label=${e("split_shared_amount")}
          .value=${this.envelopeInput}
          .suffix=${this.currency}
          decimal
          placeholder="5,00"
          @value-changed=${(r) => this.setEnvelope(r.detail.value)}
        ></se-field>

        <div class="muted" style="margin-top:10px">
          ${e("split_shared_between")}
        </div>
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
              <span class="share">${this.shareOf(t, r.id)}</span>
            </div>
          `
    )}
      </div>

      <div class="rest">
        <span>
          ${e("split_rest_for")}
          ${i === null ? p : n`<span class="figure">(${this.money(i)})</span>`}
        </span>
        <!--
          "Whoever paid" only where nobody has yet. On an expense the payer is
          picked two fields up, so the phrase names a person already on screen —
          say their name. On a lasting rule it is the whole point: it applies to
          expenses whose payer is not known and will not always be the same.
        -->
        <se-select
          .value=${this.restTo || this.payerId || ""}
          .placeholder=${this.payerId ? void 0 : e("split_rest_payer")}
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
  renderCustom(t) {
    const e = this.localize;
    return n`
      <div>
        <div class="muted">${e("split_custom_hint")}</div>
        <div class="muted example">${e("split_custom_example")}</div>
      </div>

      <se-field
        .label=${e("split_shared_amount")}
        .value=${this.envelopeInput}
        .suffix=${this.currency}
        .helper=${e("split_shared_all_hint")}
        decimal
        placeholder=${e("split_shared_all")}
        @value-changed=${(s) => this.setEnvelope(s.detail.value)}
      ></se-field>

      <div>
        <div class="muted">${e("split_shared_between")}</div>
        ${this.members.map(
      (s) => n`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(s.id)}
                @change=${() => this.toggleParticipant(s.id)}
              />
              ${this.renderAvatar(s)}
              <span class="name">${s.name}</span>
              <span class="share">${this.shareOf(t, s.id)}</span>
            </div>
          `
    )}
      </div>

      <div>
        <div class="muted">${e("split_rest_between")}</div>
        <div class="muted">${e("split_rest_between_hint")}</div>
        ${this.members.map(
      (s) => n`
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
  toggleTaker(t) {
    const e = new Set(this.takers);
    if (e.has(t)) {
      e.delete(t);
      const { [t]: s, ...i } = this.amounts;
      this.amounts = i;
    } else
      e.add(t);
    this.takers = e, this.emit();
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
  shares(t = this.previewAmount) {
    const e = this.members.find((s) => s.id === this.payerId) ?? this.members[0];
    return e ? Ht({
      amount: t,
      payerId: e.id,
      memberIds: this.members.map((s) => s.id),
      rule: this.build()
    }) : null;
  }
  shareOf(t, e) {
    return t === null ? "" : t[e] ? this.money(t[e]) : "—";
  }
  money(t) {
    return B(t, this.currency, this.language);
  }
  renderAvatar(t) {
    return n`
      <div class="avatar" style=${`background:${t.color ?? C(t.id)}`}>
        ${H(t.name)}
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
  pick(t) {
    if (t === this.mode)
      return;
    const e = this.mode;
    if (this.mode = t, t !== "partial" && t !== "custom" && (this.envelopeInput = ""), t !== "exact" && t !== "custom" && (this.amounts = {}), t !== "exact" && (this.percents = {}), t === "exact" != (e === "exact") && (this.amounts = {}), t === "exact" && this.participants.size === 0 && (this.participants = new Set(this.members.map((s) => s.id))), t === "partial" && (this.restTo = this.restTo || [...this.takers][0] || this.payerId || ""), t === "custom" && this.takers.size === 0) {
      const s = this.restTo || this.payerId;
      this.takers = s ? /* @__PURE__ */ new Set([s]) : /* @__PURE__ */ new Set();
    }
    t !== "partial" && (this.restTo = ""), this.emit();
  }
  setEnvelope(t) {
    this.envelopeInput = t, this.emit();
  }
  setRestTo(t) {
    this.restTo = t, this.emit();
  }
  toggleParticipant(t) {
    const e = new Set(this.participants);
    if (e.has(t)) {
      e.delete(t);
      const { [t]: s, ...i } = this.amounts;
      this.amounts = i;
      const { [t]: r, ...a } = this.percents;
      this.percents = a;
    } else
      e.add(t);
    this.participants = e, this.emit();
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
  build() {
    return Ys(this.mode, {
      participants: this.participants,
      envelopeInput: this.envelopeInput,
      amounts: this.amounts,
      percents: this.percents,
      unit: this.unit,
      restTo: this.restTo,
      takers: this.takers,
      memberIds: this.members.map((t) => t.id)
    });
  }
};
A.styles = [
  P,
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
I([
  l({ attribute: !1 })
], A.prototype, "localize", 2);
I([
  l({ attribute: !1 })
], A.prototype, "members", 2);
I([
  l({ attribute: !1 })
], A.prototype, "rule", 2);
I([
  l({ type: String })
], A.prototype, "currency", 2);
I([
  l({ type: String })
], A.prototype, "language", 2);
I([
  l({ type: Number })
], A.prototype, "amount", 2);
I([
  l({ type: String })
], A.prototype, "payerId", 2);
I([
  l({ type: String })
], A.prototype, "inherits", 2);
I([
  c()
], A.prototype, "mode", 2);
I([
  c()
], A.prototype, "participants", 2);
I([
  c()
], A.prototype, "envelopeInput", 2);
I([
  c()
], A.prototype, "amounts", 2);
I([
  c()
], A.prototype, "percents", 2);
I([
  c()
], A.prototype, "unit", 2);
I([
  c()
], A.prototype, "restTo", 2);
I([
  c()
], A.prototype, "takers", 2);
A = I([
  y("se-split-rule-editor")
], A);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, q = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ti(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ei(e, s, r), r;
};
let D = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.name = "", this.icon = "", this.color = null, this.rule = null, this.isDefault = !1, this.busy = !1, this.cancel = () => {
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
        await this.saveDefault(e.id), this.dispatchEvent(
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
    super.connectedCallback(), this.isDefault = this.category !== void 0 && this.group.default_category_id === this.category.id, this.category && (this.name = this.category.name, this.icon = this.category.icon ?? "", this.color = this.category.color, this.rule = this.category.split_rule);
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
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                @change=${(s) => this.isDefault = s.target.checked}
              />
              <span>${t("default_category")}</span>
            </label>
            <div class="muted hint">${t("default_category_hint")}</div>
          </div>

          <div>
            <label class="muted">${t("default_split")}</label>
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
  /**
   * Say whether this is the group's default, if that changed.
   *
   * The flag lives on the group, not the category — there is one of it, and a
   * category cannot know it is the chosen one. Saved after the category itself,
   * because a category being created has no id until then.
   */
  async saveDefault(t) {
    this.group.default_category_id === t !== this.isDefault && await this.api.updateGroup(this.group.id, {
      default_category_id: this.isDefault ? t : null
    });
  }
};
D.styles = P;
q([
  l({ attribute: !1 })
], D.prototype, "api", 2);
q([
  l({ attribute: !1 })
], D.prototype, "localize", 2);
q([
  l({ attribute: !1 })
], D.prototype, "group", 2);
q([
  l({ attribute: !1 })
], D.prototype, "members", 2);
q([
  l({ attribute: !1 })
], D.prototype, "category", 2);
q([
  l({ type: String })
], D.prototype, "language", 2);
q([
  c()
], D.prototype, "name", 2);
q([
  c()
], D.prototype, "icon", 2);
q([
  c()
], D.prototype, "color", 2);
q([
  c()
], D.prototype, "rule", 2);
q([
  c()
], D.prototype, "isDefault", 2);
q([
  c()
], D.prototype, "busy", 2);
q([
  c()
], D.prototype, "error", 2);
D = q([
  y("se-category-dialog")
], D);
var si = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, se = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ii(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && si(e, s, r), r;
};
let W = class extends g {
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
      } catch (t) {
        this.error = w(t, this.localize);
      } finally {
        this.busy = !1;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.rule = this.group.split_rule, this.isDefault = this.group.default_category_id === null;
  }
  render() {
    const t = this.localize;
    return n`
      <se-dialog
        open
        heading=${t("no_category_rule")}
        @dialog-closed=${this.cancel}
      >
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : p}

          <div>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                ?disabled=${this.group.default_category_id === null}
                @change=${(e) => this.isDefault = e.target.checked}
              />
              <span>${t("default_category")}</span>
            </label>
            <div class="muted hint">${t("default_category_hint")}</div>
          </div>

          <div class="muted">${t("no_category_rule_hint")}</div>

          <se-split-rule-editor
            .localize=${this.localize}
            .members=${this.members}
            .rule=${this.group.split_rule}
            .currency=${this.group.currency}
            .language=${this.language}
            @rule-changed=${(e) => this.rule = e.detail.rule}
          ></se-split-rule-editor>
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${t("cancel")}
        </se-button>
        <se-button slot="actions" ?disabled=${this.busy} @click=${this.submit}>
          ${t("save")}
        </se-button>
      </se-dialog>
    `;
  }
};
W.styles = [
  P,
  _`
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
se([
  l({ attribute: !1 })
], W.prototype, "api", 2);
se([
  l({ attribute: !1 })
], W.prototype, "localize", 2);
se([
  l({ attribute: !1 })
], W.prototype, "group", 2);
se([
  l({ attribute: !1 })
], W.prototype, "members", 2);
se([
  l({ type: String })
], W.prototype, "language", 2);
se([
  c()
], W.prototype, "rule", 2);
se([
  c()
], W.prototype, "isDefault", 2);
se([
  c()
], W.prototype, "busy", 2);
se([
  c()
], W.prototype, "error", 2);
W = se([
  y("se-group-rule-dialog")
], W);
function Dt(t, e, s, i) {
  if (t === null)
    return e("split_equal");
  const r = ut(t);
  if (r === "equal") {
    const a = t.participants?.length;
    return a ? `${e("split_equal")} · ${a}` : e("split_equal");
  }
  return r === "exact" ? Object.keys(t.remainder?.percent ?? {}).length > 0 ? ri(t, e) : e("split_exact") : r === "partial" ? t.envelope == null ? e("split_partial") : `${B(t.envelope, s, i)} ${e("split_shared_lower")}` : e("split_custom");
}
function ri(t, e) {
  const s = Object.values(t.remainder?.percent ?? {});
  return s.length === 0 ? e("split_percent") : s.map((i) => i % 100 === 0 ? String(i / 100) : (i / 100).toFixed(2)).join(" / ").concat(" %");
}
var ai = Object.defineProperty, oi = Object.getOwnPropertyDescriptor, G = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? oi(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ai(e, s, r), r;
};
let M = class extends g {
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
    const t = this.localize;
    return this.editingGroupRule ? n`
        <se-group-rule-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .language=${this.language}
          @dialog-cancelled=${() => this.editingGroupRule = !1}
          @rule-saved=${this.handleGroupRuleSaved}
        ></se-group-rule-dialog>
      ` : this.creating || this.editing ? n`
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
                ${this.error ? n`<div class="error">${this.error}</div>` : p}
                ${this.renderNoCategory()}
                ${this.categories.map((e) => this.renderRow(e))}
                ${this.categories.length === 0 ? n`<div class="empty">${t("no_categories")}</div>` : p}
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
          <div class="name">
            ${t.name}
            ${this.group.default_category_id === t.id ? n`<span class="tag">${this.localize("default_category_tag")}</span>` : p}
          </div>
          <div class="muted">${this.describe(t)}</div>
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
    return n`
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
            ${this.group.default_category_id === null ? n`<span class="tag">${this.localize("default_category_tag")}</span>` : p}
          </div>
          <div class="muted">
            ${Dt(
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
  describe(t) {
    return t.split_rule === null ? this.localize("rule_from_group") : Dt(
      t.split_rule,
      this.localize,
      this.group.currency,
      this.language
    );
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
M.styles = [
  P,
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
G([
  l({ attribute: !1 })
], M.prototype, "api", 2);
G([
  l({ attribute: !1 })
], M.prototype, "localize", 2);
G([
  l({ attribute: !1 })
], M.prototype, "group", 2);
G([
  l({ attribute: !1 })
], M.prototype, "members", 2);
G([
  l({ type: String })
], M.prototype, "language", 2);
G([
  c()
], M.prototype, "categories", 2);
G([
  c()
], M.prototype, "editing", 2);
G([
  c()
], M.prototype, "creating", 2);
G([
  c()
], M.prototype, "editingGroupRule", 2);
G([
  c()
], M.prototype, "loading", 2);
G([
  c()
], M.prototype, "error", 2);
G([
  c()
], M.prototype, "dirty", 2);
M = G([
  y("se-categories-dialog")
], M);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ni = (t) => (...e) => ({ _$litDirective$: t, values: e });
let li = class {
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
const ci = {}, pi = (t, e = ci) => t._$AH = e;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const di = ni(class extends li {
  constructor() {
    super(...arguments), this.key = p;
  }
  render(t, e) {
    return this.key = t, e;
  }
  update(t, [e, s]) {
    return e !== this.key && (pi(t), this.key = e), s;
  }
}), hi = {
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
function ui(t, e) {
  const s = hi[t.field];
  return s ? {
    label: e.localize(s),
    before: Tt(t.field, t.before, e),
    after: Tt(t.field, t.after, e)
  } : null;
}
function Tt(t, e, s) {
  return e == null ? null : t === "amount" && typeof e == "number" ? B(e, s.currency, s.language) : t === "expense_date" || t === "payment_date" ? Fe(String(e), s.language) : t === "category_id" ? s.categories.find((i) => i.id === e)?.name ?? s.localize("no_category") : t === "paid_by_member_id" || t === "from_member_id" || t === "to_member_id" ? Wt(String(e), s) : t === "shares" && gi(e) ? mi(e, s) : String(e);
}
function mi(t, e) {
  const s = Object.entries(t).filter(([, i]) => i !== 0);
  return s.length === 0 ? "—" : s.map(
    ([i, r]) => `${Wt(i, e)} ${B(r, e.currency, e.language)}`
  ).join(" · ");
}
function Wt(t, e) {
  return e.members.find((s) => s.id === t)?.name ?? "?";
}
function gi(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t) && Object.values(t).every((e) => typeof e == "number");
}
var fi = Object.defineProperty, bi = Object.getOwnPropertyDescriptor, oe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? bi(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && fi(e, s, r), r;
};
let X = class extends g {
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
        style=${`background:${e?.color ?? C(t.actor_user_id ?? t.id)}`}
      >
        ${H(s)}
      </div>
      <div class="body">
        <div class="head">
          <span class="who">${s}</span>
          <span class="when">${Fe(t.at, this.language)}</span>
        </div>
        <div class="what">${this.headline(t)}</div>
        ${this.renderChanges(t)}
      </div>
      ${i ? n`<span class="chevron">›</span>` : p}
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
      return p;
    const e = {
      localize: this.localize,
      members: this.members,
      categories: this.categories,
      currency: this.currency,
      language: this.language
    }, s = t.changes.map((i) => ui(i, e)).filter((i) => i !== null);
    return n`
      ${s.map(
      (i) => n`
          <div class="change">
            <span class="field">${i.label}</span>
            ${i.before === null ? p : n`<span class="before">${i.before}</span>
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
X.styles = [
  P,
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
oe([
  l({ attribute: !1 })
], X.prototype, "localize", 2);
oe([
  l({ attribute: !1 })
], X.prototype, "revisions", 2);
oe([
  l({ attribute: !1 })
], X.prototype, "members", 2);
oe([
  l({ attribute: !1 })
], X.prototype, "categories", 2);
oe([
  l({ type: String })
], X.prototype, "currency", 2);
oe([
  l({ type: String })
], X.prototype, "language", 2);
oe([
  l({ type: Boolean })
], X.prototype, "withSubject", 2);
oe([
  l({ attribute: !1 })
], X.prototype, "openable", 2);
X = oe([
  y("se-history")
], X);
var yi = Object.defineProperty, vi = Object.getOwnPropertyDescriptor, L = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? vi(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && yi(e, s, r), r;
};
let j = class extends g {
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

        ${this.open ? this.renderBody() : p}
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
j.styles = [
  P,
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
L([
  l({ attribute: !1 })
], j.prototype, "api", 2);
L([
  l({ attribute: !1 })
], j.prototype, "localize", 2);
L([
  l({ type: String })
], j.prototype, "groupId", 2);
L([
  l({ type: String })
], j.prototype, "entityId", 2);
L([
  l({ attribute: !1 })
], j.prototype, "members", 2);
L([
  l({ attribute: !1 })
], j.prototype, "categories", 2);
L([
  l({ type: String })
], j.prototype, "currency", 2);
L([
  l({ type: String })
], j.prototype, "language", 2);
L([
  c()
], j.prototype, "open", 2);
L([
  c()
], j.prototype, "revisions", 2);
L([
  c()
], j.prototype, "busy", 2);
L([
  c()
], j.prototype, "error", 2);
j = L([
  y("se-entity-history")
], j);
var $i = Object.defineProperty, _i = Object.getOwnPropertyDescriptor, z = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? _i(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && $i(e, s, r), r;
};
let $ = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = Gt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.editingSplit = !1, this.showDescription = !1, this.pickCategory = (t) => {
      this.categoryId = t.detail.value, this.rule = null;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const t = fe(this.amountInput), e = this.resolved(t);
      if (t === null || !e)
        return;
      this.busy = !0, this.error = void 0;
      const s = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: t,
        paid_by_member_id: this.paidBy,
        expense_date: st(this.date),
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
      const t = this.group.default_category_id;
      this.categoryId = this.categories.some((e) => e.id === t) ? t : "";
      return;
    }
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = it(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = Lt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares(), this.showDescription = this.description !== "";
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
  /**
   * What the editor opens on: the category's rule, then the group's.
   *
   * Never null. Nothing above saying anything means an equal split, and that is
   * worth spelling out here — a null would read as "default rule", the one mode
   * this dialog does not offer, because saving freezes the rule anyway.
   */
  defaultRule() {
    return this.categories.find((e) => e.id === this.categoryId)?.split_rule ?? this.group.split_rule ?? { envelope: null, participants: null, remainder: {} };
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
    return t === null || !this.paidBy || this.members.length === 0 ? null : Ht({
      amount: t,
      payerId: this.paidBy,
      memberIds: this.members.map((e) => e.id),
      rule: this.rule ?? this.defaultRule()
    });
  }
  render() {
    const t = this.localize, e = fe(this.amountInput), s = this.expense ? t("edit_expense") : t("new_expense");
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
              ` : p}
        </div>

        ${this.confirmingDelete ? n`<div slot="banner" class="warning">
              ${t("confirm_delete_expense")}
            </div>` : p}

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

        ${this.editingSplit ? p : this.renderSummary(t)}

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
                  ${B(e[s.id], this.group.currency, this.language)}
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
  renderEditor(t) {
    return di(
      this.categoryId,
      n`
        <se-split-rule-editor
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
  P,
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
z([
  l({ attribute: !1 })
], $.prototype, "api", 2);
z([
  l({ attribute: !1 })
], $.prototype, "localize", 2);
z([
  l({ attribute: !1 })
], $.prototype, "group", 2);
z([
  l({ attribute: !1 })
], $.prototype, "members", 2);
z([
  l({ attribute: !1 })
], $.prototype, "categories", 2);
z([
  l({ attribute: !1 })
], $.prototype, "expense", 2);
z([
  l({ type: String })
], $.prototype, "meId", 2);
z([
  l({ type: String })
], $.prototype, "language", 2);
z([
  c()
], $.prototype, "expenseTitle", 2);
z([
  c()
], $.prototype, "description", 2);
z([
  c()
], $.prototype, "amountInput", 2);
z([
  c()
], $.prototype, "paidBy", 2);
z([
  c()
], $.prototype, "date", 2);
z([
  c()
], $.prototype, "categoryId", 2);
z([
  c()
], $.prototype, "rule", 2);
z([
  c()
], $.prototype, "busy", 2);
z([
  c()
], $.prototype, "error", 2);
z([
  c()
], $.prototype, "confirmingDelete", 2);
z([
  c()
], $.prototype, "editingSplit", 2);
z([
  c()
], $.prototype, "showDescription", 2);
$ = z([
  y("se-expense-dialog")
], $);
var xi = Object.defineProperty, wi = Object.getOwnPropertyDescriptor, ie = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wi(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && xi(e, s, r), r;
};
let V = class extends g {
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
        ${this.error ? n`<div class="error">${this.error}</div>` : p}
        ${this.renderBody()}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${t("close")}
        </se-button>
      </se-dialog>
    `;
  }
  renderBody() {
    return this.error ? p : this.revisions ? n`
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
V.styles = P;
ie([
  l({ attribute: !1 })
], V.prototype, "api", 2);
ie([
  l({ attribute: !1 })
], V.prototype, "localize", 2);
ie([
  l({ attribute: !1 })
], V.prototype, "group", 2);
ie([
  l({ attribute: !1 })
], V.prototype, "members", 2);
ie([
  l({ attribute: !1 })
], V.prototype, "categories", 2);
ie([
  l({ attribute: !1 })
], V.prototype, "openable", 2);
ie([
  l({ type: String })
], V.prototype, "language", 2);
ie([
  c()
], V.prototype, "revisions", 2);
ie([
  c()
], V.prototype, "error", 2);
V = ie([
  y("se-history-dialog")
], V);
var zi = Object.defineProperty, Si = Object.getOwnPropertyDescriptor, R = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Si(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && zi(e, s, r), r;
};
let E = class extends g {
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
                ${this.error ? n`<div class="error">${this.error}</div>` : p}
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
        <!--
          Seeded on the member, never on the account: an automatic colour is
          derived from the member id everywhere else — expense rows, balances,
          statistics — so seeding it here on the Home Assistant account gave the
          same person two different colours. An account not in the group has no
          member to seed on yet, and its colour is only a preview until it does.
        -->
        ${this.renderTintable(e, t.name, e?.id ?? t.id)}
        <span class="name">${t.name}</span>
        ${s ? n`<span class="tag">${this.localize("group_owner")}</span>` : p}
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
    const i = t?.color ?? C(s);
    return t ? n`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${i}`}
        @click=${() => this.toggleTint(t.id)}
      >
        ${H(e)}
      </button>
    ` : n`
        <div class="avatar" style=${`background:${i}`}>${H(e)}</div>
      `;
  }
  renderPalette(t) {
    return !t || this.tinting !== t.id ? p : n`
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
    } catch (s) {
      this.error = w(s, this.localize);
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
              ${this.confirming === i.id ? n`<span class="confirm">${t("confirm_remove")}</span>` : p}
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
                style=${`background:${i.color ?? C(i.id)}`}
              >
                ${H(i.name)}
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
    } catch (s) {
      this.error = w(s, this.localize);
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
E.styles = [
  P,
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
R([
  l({ attribute: !1 })
], E.prototype, "api", 2);
R([
  l({ attribute: !1 })
], E.prototype, "localize", 2);
R([
  l({ type: String })
], E.prototype, "groupId", 2);
R([
  c()
], E.prototype, "haUsers", 2);
R([
  c()
], E.prototype, "members", 2);
R([
  c()
], E.prototype, "memberships", 2);
R([
  c()
], E.prototype, "newName", 2);
R([
  c()
], E.prototype, "loading", 2);
R([
  c()
], E.prototype, "busy", 2);
R([
  c()
], E.prototype, "error", 2);
R([
  c()
], E.prototype, "dirty", 2);
R([
  c()
], E.prototype, "tinting", 2);
R([
  c()
], E.prototype, "confirming", 2);
R([
  c()
], E.prototype, "pastMembers", 2);
E = R([
  y("se-member-dialog")
], E);
var ki = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, U = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ci(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ki(e, s, r), r;
};
let O = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.date = Gt(), this.busy = !1, this.confirmingDelete = !1, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const t = fe(this.amountInput);
      if (t !== null) {
        this.busy = !0, this.error = void 0;
        try {
          const e = this.payment ? await this.api.updatePayment(this.payment.id, {
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: st(this.date)
          }) : await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount: t,
            payment_date: st(this.date)
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
      this.fromMember = this.payment.from_member_id, this.toMember = this.payment.to_member_id, this.amountInput = it(this.payment.amount), this.date = Lt(this.payment.payment_date);
      return;
    }
    if (this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = it(this.settlement.amount);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const t = this.localize, e = fe(this.amountInput), s = this.members.map((r) => ({ value: r.id, label: r.name })), i = this.payment ? t("edit_payment") : t("new_payment");
    return n`
      <se-dialog open heading=${i} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? n`<div class="error">${this.error}</div>` : p}

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
                ${B(e, this.group.currency, this.language)}
              </div>` : p}

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
              ` : p}
        </div>

        ${this.confirmingDelete ? n`<div slot="banner" class="warning">
              ${t("confirm_delete_payment")}
            </div>` : p}

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
            ` : p}
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
O.styles = P;
U([
  l({ attribute: !1 })
], O.prototype, "api", 2);
U([
  l({ attribute: !1 })
], O.prototype, "localize", 2);
U([
  l({ attribute: !1 })
], O.prototype, "group", 2);
U([
  l({ attribute: !1 })
], O.prototype, "members", 2);
U([
  l({ attribute: !1 })
], O.prototype, "payment", 2);
U([
  l({ attribute: !1 })
], O.prototype, "settlement", 2);
U([
  l({ type: String })
], O.prototype, "language", 2);
U([
  c()
], O.prototype, "fromMember", 2);
U([
  c()
], O.prototype, "toMember", 2);
U([
  c()
], O.prototype, "amountInput", 2);
U([
  c()
], O.prototype, "date", 2);
U([
  c()
], O.prototype, "busy", 2);
U([
  c()
], O.prototype, "error", 2);
U([
  c()
], O.prototype, "confirmingDelete", 2);
O = U([
  y("se-payment-dialog")
], O);
var Pi = Object.defineProperty, Ai = Object.getOwnPropertyDescriptor, Vt = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ai(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Pi(e, s, r), r;
};
let We = class extends g {
  constructor() {
    super(...arguments), this.bars = [];
  }
  render() {
    if (this.bars.length === 0)
      return p;
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
                style=${`width:${Ei(e.value, t)}%${e.color ? `;background:${e.color}` : ""}`}
              ></div>
            </div>
          </div>
        `
    )}
    `;
  }
};
We.styles = [
  P,
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
Vt([
  l({ attribute: !1 })
], We.prototype, "bars", 2);
We = Vt([
  y("se-bar-chart")
], We);
function Ei(t, e) {
  return e <= 0 ? 0 : t / e * 100;
}
var Oi = Object.defineProperty, Ii = Object.getOwnPropertyDescriptor, Yt = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ii(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Oi(e, s, r), r;
};
const Pe = 160, Te = 70, ze = Pe / 2, Di = Math.PI * 2;
let Ve = class extends g {
  constructor() {
    super(...arguments), this.slices = [];
  }
  render() {
    const t = this.slices.filter((s) => s.value > 0), e = t.reduce((s, i) => s + i.value, 0);
    return e <= 0 ? p : n`
      <div class="chart">
        <svg viewBox="0 0 ${Pe} ${Pe}" width=${Pe} height=${Pe} role="img">
          ${this.renderWedges(t, e)}
        </svg>
        <div class="legend">
          ${t.map(
      (s) => n`
              <div class="entry">
                <span
                  class="dot"
                  style=${`background:${s.color ?? C(s.key)}`}
                ></span>
                <span class="label" title=${s.label}>${s.label}</span>
                <span class="value">${s.text}</span>
                <span class="share">${Mi(s.value, e)}</span>
              </div>
            `
    )}
        </div>
      </div>
    `;
  }
  renderWedges(t, e) {
    if (t.length === 1) {
      const i = t[0];
      return St`
        <circle
          cx=${ze}
          cy=${ze}
          r=${Te}
          fill=${i.color ?? C(i.key)}
        ></circle>
      `;
    }
    let s = 0;
    return t.map((i) => {
      const r = i.value / e * Di, a = Ti(s, s + r);
      return s += r, St`<path d=${a} fill=${i.color ?? C(i.key)}></path>`;
    });
  }
};
Ve.styles = [
  P,
  _`
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
Yt([
  l({ attribute: !1 })
], Ve.prototype, "slices", 2);
Ve = Yt([
  y("se-pie-chart")
], Ve);
function Ti(t, e) {
  const [s, i] = Mt(t), [r, a] = Mt(e), o = e - t > Math.PI ? 1 : 0;
  return `M ${ze} ${ze} L ${s} ${i} A ${Te} ${Te} 0 ${o} 1 ${r} ${a} Z`;
}
function Mt(t) {
  const e = t - Math.PI / 2;
  return [
    ze + Te * Math.cos(e),
    ze + Te * Math.sin(e)
  ];
}
function Mi(t, e) {
  const s = t / e * 100;
  return `${s >= 10 ? Math.round(s) : s.toFixed(1)} %`;
}
var ji = Object.defineProperty, Ri = Object.getOwnPropertyDescriptor, Y = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ri(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ji(e, s, r), r;
};
const qe = "all";
let N = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.currency = "EUR", this.language = "en", this.period = qe;
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

      ${this.renderCategories()}
      ${this.renderCard("by_month", this.monthBars())}
      ${this.renderMembers()}
    ` : n`<div class="card"><div class="empty">${t("loading")}</div></div>`;
  }
  renderPeriod() {
    const t = this.localize;
    return n`
      <div class="period">
        <button
          aria-pressed=${this.period === qe}
          @click=${() => this.pick(qe)}
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
    const t = this.localize, e = this.result.by_member.find((s) => s.member_id === this.meId);
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
            ` : p}
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
    const t = this.categorySlices();
    return t.length === 0 ? p : n`
      <div class="card">
        <h3 class="section-title">${this.localize("by_category")}</h3>
        <se-pie-chart .slices=${t}></se-pie-chart>
      </div>
    `;
  }
  renderCard(t, e) {
    return e.length === 0 ? p : n`
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
    return e.length === 0 ? p : n`
      <div class="card">
        <h3 class="section-title">${t("by_member")}</h3>
        ${e.map((s) => {
      const i = this.members.find((a) => a.id === s.member_id), r = i?.name ?? "?";
      return n`
            <div class="member">
              <div
                class="avatar"
                style=${`background:${i?.color ?? C(s.member_id)}`}
              >
                ${H(r)}
              </div>
              <span class="name">${r}</span>
              <div class="figures">
                <div>
                  ${t("paid_total")} <strong>${this.money(s.paid)}</strong>
                </div>
                <div class="muted">
                  ${t("consumed")} <strong>${this.money(s.share)}</strong>
                </div>
              </div>
            </div>
          `;
    })}
      </div>
    `;
  }
  categorySlices() {
    return this.result.by_category.map((t) => {
      const e = this.categories.find((s) => s.id === t.category_id);
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
      label: js(t.month, this.language),
      value: t.total,
      text: this.money(t.total)
    }));
  }
  money(t) {
    return B(t, this.currency, this.language);
  }
  pick(t) {
    t !== this.period && (this.period = t, this.load());
  }
  async load() {
    this.error = void 0;
    try {
      this.result = await this.api.getStatistics(
        this.groupId,
        this.period === qe ? null : Number(this.period)
      );
    } catch (t) {
      this.error = w(t, this.localize);
    }
  }
};
N.styles = [
  P,
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
Y([
  l({ attribute: !1 })
], N.prototype, "api", 2);
Y([
  l({ attribute: !1 })
], N.prototype, "localize", 2);
Y([
  l({ type: String })
], N.prototype, "groupId", 2);
Y([
  l({ attribute: !1 })
], N.prototype, "members", 2);
Y([
  l({ attribute: !1 })
], N.prototype, "categories", 2);
Y([
  l({ type: String })
], N.prototype, "meId", 2);
Y([
  l({ type: String })
], N.prototype, "currency", 2);
Y([
  l({ type: String })
], N.prototype, "language", 2);
Y([
  c()
], N.prototype, "result", 2);
Y([
  c()
], N.prototype, "period", 2);
Y([
  c()
], N.prototype, "error", 2);
N = Y([
  y("se-statistics")
], N);
var Ui = Object.defineProperty, Ni = Object.getOwnPropertyDescriptor, he = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ni(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ui(e, s, r), r;
};
let ee = class extends g {
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
ee.styles = P;
he([
  l({ attribute: !1 })
], ee.prototype, "api", 2);
he([
  l({ attribute: !1 })
], ee.prototype, "localize", 2);
he([
  l({ attribute: !1 })
], ee.prototype, "group", 2);
he([
  l({ attribute: !1 })
], ee.prototype, "members", 2);
he([
  l({ attribute: !1 })
], ee.prototype, "categories", 2);
he([
  l({ type: String })
], ee.prototype, "meId", 2);
he([
  l({ type: String })
], ee.prototype, "language", 2);
ee = he([
  y("se-statistics-dialog")
], ee);
var qi = Object.defineProperty, Bi = Object.getOwnPropertyDescriptor, v = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bi(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && qi(e, s, r), r;
};
const Gi = 8;
let b = class extends g {
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
      const e = t.clientX - this.fabFrom.x, s = t.clientY - this.fabFrom.y;
      this.addingPayment = s < -40 || e < -40;
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
      const { entityType: e, entityId: s } = t.detail;
      if (e === "expense") {
        const r = this.expenses.find((a) => a.id === s);
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
          ${this.group.archived ? n`<div class="banner">${t("archived_hint")}</div>` : p}

          ${this.error ? n`<div class="error">${this.error}</div>` : p}

          ${this.renderHome()}
        </div>
      </div>

      ${this.addingPayment ? n`<div class="fab-hint">${t("new_payment")}</div>` : p}
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
            ${e.archived ? n`<span class="archived-tag">${t("archived")}</span>` : p}
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
      ${this.menu ? this.renderMenu() : p}
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
            ${t.archived ? n`<span class="archived-tag">${this.localize("archived")}</span>` : p}
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
    return this.activity().length < Gi ? p : n`
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
      (e, s) => s.at.localeCompare(e.at) || s.addedAt.localeCompare(e.addedAt)
    );
  }
  renderPayment(t) {
    const e = this.memberById(t.from_member_id), s = this.memberById(t.to_member_id);
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
          <div class="title">${e?.name ?? "?"} → ${s?.name ?? "?"}</div>
          <!-- Where an expense shows its category: same grid, same reading. -->
          <div class="muted">${this.localize("a_settlement")}</div>
          <div class="muted">
            ${Fe(t.payment_date, this.language)}
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
  renderExpense(t) {
    const e = this.localize, s = this.memberById(t.paid_by_member_id), i = this.categories.find((r) => r.id === t.category_id);
    return n`
      <button
        class="item item-button"
        style=${`border-left-color:${s?.color ?? C(t.paid_by_member_id)}`}
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
            ${t.description ? n`<span class="note">${t.description}</span>` : p}
          </div>
          <div class="muted">
            ${i ? i.name : e("no_category")}
          </div>
          <div class="muted">
            ${Fe(t.expense_date, this.language)}
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
    const e = (t.shares ?? []).filter((s) => s.amount !== 0);
    return e.length === 0 ? p : n`
      <div class="stack-avatars">
        ${e.map((s) => {
      const i = this.memberById(s.member_id);
      return n`
            <div
              class="avatar small"
              title=${i?.name ?? "?"}
              style=${`background:${i?.color ?? C(s.member_id)}`}
            >
              ${H(i?.name ?? "?")}
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
        style=${`background:${i?.color ?? C(e)}`}
      >
        ${H(t)}
      </div>
    `;
  }
  renderDialog() {
    return !this.dialog || !this.group ? p : this.dialog === "expense" ? n`
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
        a,
        o,
        h
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
      this.group = t, this.groups = e, this.members = s, this.pastMembers = i, this.categories = r, this.expenses = a, this.payments = o, this.result = h;
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
    return t ? e.filter((s) => this.haystack(s).includes(t)) : e;
  }
  haystack(t) {
    const e = (r) => this.memberById(r)?.name ?? "";
    if (t.kind === "payment")
      return [
        this.localize("a_settlement"),
        t.payment.description ?? "",
        e(t.payment.from_member_id),
        e(t.payment.to_member_id)
      ].join(" ").toLowerCase();
    const s = t.expense, i = this.categories.find((r) => r.id === s.category_id);
    return [
      s.title,
      s.description ?? "",
      i?.name ?? "",
      e(s.paid_by_member_id)
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
b.styles = [
  P,
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

      /*
       * Under the toolbar it belongs to, wherever the page has been scrolled.
       *
       * Fixed, not absolute: absolute pinned it 64px from the top of the host,
       * which is as tall as the whole page — so once you had scrolled down, the
       * menu opened somewhere above the screen and never showed. The toolbar it
       * hangs from is sticky and always there, so this hangs from the viewport
       * too.
       */
      .menu {
        position: fixed;
        z-index: 5;
        top: 64px;
        left: 16px;
        right: 16px;
        max-width: 320px;
        max-height: calc(100dvh - 96px);
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
v([
  l({ attribute: !1 })
], b.prototype, "api", 2);
v([
  l({ attribute: !1 })
], b.prototype, "localize", 2);
v([
  l({ type: String })
], b.prototype, "groupId", 2);
v([
  l({ type: String })
], b.prototype, "language", 2);
v([
  l({ type: String })
], b.prototype, "userId", 2);
v([
  c()
], b.prototype, "group", 2);
v([
  c()
], b.prototype, "groups", 2);
v([
  c()
], b.prototype, "menu", 2);
v([
  c()
], b.prototype, "members", 2);
v([
  c()
], b.prototype, "pastMembers", 2);
v([
  c()
], b.prototype, "categories", 2);
v([
  c()
], b.prototype, "expenses", 2);
v([
  c()
], b.prototype, "payments", 2);
v([
  c()
], b.prototype, "result", 2);
v([
  c()
], b.prototype, "query", 2);
v([
  c()
], b.prototype, "loading", 2);
v([
  c()
], b.prototype, "error", 2);
v([
  c()
], b.prototype, "dialog", 2);
v([
  c()
], b.prototype, "prefill", 2);
v([
  c()
], b.prototype, "editedExpense", 2);
v([
  c()
], b.prototype, "editedPayment", 2);
v([
  c()
], b.prototype, "addingPayment", 2);
v([
  c()
], b.prototype, "busy", 2);
v([
  c()
], b.prototype, "confirmingDelete", 2);
b = v([
  y("se-group-page")
], b);
class Li {
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
  // Statistics
  /** What the group spent. Leave `year` out for everything, ever. */
  getStatistics(e, s) {
    return this.call("get_statistics", {
      group_id: e,
      ...s ? { year: s } : {}
    });
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
var Hi = Object.defineProperty, Fi = Object.getOwnPropertyDescriptor, Re = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Fi(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Hi(e, s, r), r;
};
let ye = class extends g {
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
      const s = Wi();
      if (s) {
        this.groupId = s, this.replacePath(`/group/${s}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (t) => {
      const e = t.detail.groupId;
      this.groupId = e, Vi(e), this.replacePath(`/group/${e}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.replacePath("");
    }, this.handleGroupUnavailable = () => {
      Yi(), this.goToDashboard();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new Li(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return n``;
    const t = Os(this.hass.locale?.language ?? this.hass.language), e = this.hass.locale?.language ?? this.hass.language;
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
    const e = this.route?.prefix ?? window.location.pathname.split("/")[1], s = e.startsWith("/") ? e : `/${e}`;
    history.replaceState(null, "", `${s}${t}`);
  }
};
ye.styles = _`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
Re([
  l({ attribute: !1 })
], ye.prototype, "hass", 2);
Re([
  l({ type: Boolean })
], ye.prototype, "narrow", 2);
Re([
  l({ attribute: !1 })
], ye.prototype, "route", 2);
Re([
  c()
], ye.prototype, "groupId", 2);
ye = Re([
  y("shared-expenses-panel")
], ye);
const mt = "shared_expenses.last_group";
function Wi() {
  try {
    return window.localStorage.getItem(mt);
  } catch {
    return null;
  }
}
function Vi(t) {
  try {
    window.localStorage.setItem(mt, t);
  } catch {
  }
}
function Yi() {
  try {
    window.localStorage.removeItem(mt);
  } catch {
  }
}
export {
  ye as SharedExpensesPanel
};
