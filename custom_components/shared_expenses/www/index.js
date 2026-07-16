/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const We = globalThis, nt = We.ShadowRoot && (We.ShadyCSS === void 0 || We.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, lt = Symbol(), yt = /* @__PURE__ */ new WeakMap();
let qt = class {
  constructor(t, r, i) {
    if (this._$cssResult$ = !0, i !== lt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = r;
  }
  get styleSheet() {
    let t = this.o;
    const r = this.t;
    if (nt && t === void 0) {
      const i = r !== void 0 && r.length === 1;
      i && (t = yt.get(r)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && yt.set(r, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const rr = (e) => new qt(typeof e == "string" ? e : e + "", void 0, lt), x = (e, ...t) => {
  const r = e.length === 1 ? e[0] : t.reduce((i, a, s) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(a) + e[s + 1], e[0]);
  return new qt(r, e, lt);
}, ir = (e, t) => {
  if (nt) e.adoptedStyleSheets = t.map((r) => r instanceof CSSStyleSheet ? r : r.styleSheet);
  else for (const r of t) {
    const i = document.createElement("style"), a = We.litNonce;
    a !== void 0 && i.setAttribute("nonce", a), i.textContent = r.cssText, e.appendChild(i);
  }
}, bt = nt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let r = "";
  for (const i of t.cssRules) r += i.cssText;
  return rr(r);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ar, defineProperty: sr, getOwnPropertyDescriptor: or, getOwnPropertyNames: nr, getOwnPropertySymbols: lr, getPrototypeOf: dr } = Object, Ze = globalThis, ft = Ze.trustedTypes, cr = ft ? ft.emptyScript : "", pr = Ze.reactiveElementPolyfillSupport, Te = (e, t) => e, Ke = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? cr : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let r = e;
  switch (t) {
    case Boolean:
      r = e !== null;
      break;
    case Number:
      r = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        r = JSON.parse(e);
      } catch {
        r = null;
      }
  }
  return r;
} }, dt = (e, t) => !ar(e, t), vt = { attribute: !0, type: String, converter: Ke, reflect: !1, useDefault: !1, hasChanged: dt };
Symbol.metadata ??= Symbol("metadata"), Ze.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Ae = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, r = vt) {
    if (r.state && (r.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((r = Object.create(r)).wrapped = !0), this.elementProperties.set(t, r), !r.noAccessor) {
      const i = Symbol(), a = this.getPropertyDescriptor(t, i, r);
      a !== void 0 && sr(this.prototype, t, a);
    }
  }
  static getPropertyDescriptor(t, r, i) {
    const { get: a, set: s } = or(this.prototype, t) ?? { get() {
      return this[r];
    }, set(n) {
      this[r] = n;
    } };
    return { get: a, set(n) {
      const p = a?.call(this);
      s?.call(this, n), this.requestUpdate(t, p, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? vt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Te("elementProperties"))) return;
    const t = dr(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Te("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Te("properties"))) {
      const r = this.properties, i = [...nr(r), ...lr(r)];
      for (const a of i) this.createProperty(a, r[a]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const r = litPropertyMetadata.get(t);
      if (r !== void 0) for (const [i, a] of r) this.elementProperties.set(i, a);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [r, i] of this.elementProperties) {
      const a = this._$Eu(r, i);
      a !== void 0 && this._$Eh.set(a, r);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const r = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const a of i) r.unshift(bt(a));
    } else t !== void 0 && r.push(bt(t));
    return r;
  }
  static _$Eu(t, r) {
    const i = r.attribute;
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
    const t = /* @__PURE__ */ new Map(), r = this.constructor.elementProperties;
    for (const i of r.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ir(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, r, i) {
    this._$AK(t, i);
  }
  _$ET(t, r) {
    const i = this.constructor.elementProperties.get(t), a = this.constructor._$Eu(t, i);
    if (a !== void 0 && i.reflect === !0) {
      const s = (i.converter?.toAttribute !== void 0 ? i.converter : Ke).toAttribute(r, i.type);
      this._$Em = t, s == null ? this.removeAttribute(a) : this.setAttribute(a, s), this._$Em = null;
    }
  }
  _$AK(t, r) {
    const i = this.constructor, a = i._$Eh.get(t);
    if (a !== void 0 && this._$Em !== a) {
      const s = i.getPropertyOptions(a), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : Ke;
      this._$Em = a;
      const p = n.fromAttribute(r, s.type);
      this[a] = p ?? this._$Ej?.get(a) ?? p, this._$Em = null;
    }
  }
  requestUpdate(t, r, i, a = !1, s) {
    if (t !== void 0) {
      const n = this.constructor;
      if (a === !1 && (s = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? dt)(s, r) || i.useDefault && i.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, r, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, r, { useDefault: i, reflect: a, wrapped: s }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? r ?? this[t]), s !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (r = void 0), this._$AL.set(t, r)), a === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (r) {
      Promise.reject(r);
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
        for (const [a, s] of this._$Ep) this[a] = s;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [a, s] of i) {
        const { wrapped: n } = s, p = this[a];
        n !== !0 || this._$AL.has(a) || p === void 0 || this.C(a, void 0, s, p);
      }
    }
    let t = !1;
    const r = this._$AL;
    try {
      t = this.shouldUpdate(r), t ? (this.willUpdate(r), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(r)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(r);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((r) => r.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((r) => this._$ET(r, this[r])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Ae.elementStyles = [], Ae.shadowRootOptions = { mode: "open" }, Ae[Te("elementProperties")] = /* @__PURE__ */ new Map(), Ae[Te("finalized")] = /* @__PURE__ */ new Map(), pr?.({ ReactiveElement: Ae }), (Ze.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = globalThis, wt = (e) => e, Fe = ct.trustedTypes, $t = Fe ? Fe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ut = "$lit$", ge = `lit$${Math.random().toFixed(9).slice(2)}$`, Bt = "?" + ge, hr = `<${Bt}>`, $e = document, Oe = () => $e.createComment(""), Ie = (e) => e === null || typeof e != "object" && typeof e != "function", pt = Array.isArray, ur = (e) => pt(e) || typeof e?.[Symbol.iterator] == "function", Xe = `[ 	
\f\r]`, De = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xt = /-->/g, kt = />/g, ve = RegExp(`>|${Xe}(?:([^\\s"'>=/]+)(${Xe}*=${Xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), zt = /'/g, jt = /"/g, Ht = /^(?:script|style|textarea|title)$/i, mr = (e) => (t, ...r) => ({ _$litType$: e, strings: t, values: r }), o = mr(1), ne = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), At = /* @__PURE__ */ new WeakMap(), we = $e.createTreeWalker($e, 129);
function Lt(e, t) {
  if (!pt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return $t !== void 0 ? $t.createHTML(t) : t;
}
const gr = (e, t) => {
  const r = e.length - 1, i = [];
  let a, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = De;
  for (let p = 0; p < r; p++) {
    const h = e[p];
    let y, z, u = -1, te = 0;
    for (; te < h.length && (n.lastIndex = te, z = n.exec(h), z !== null); ) te = n.lastIndex, n === De ? z[1] === "!--" ? n = xt : z[1] !== void 0 ? n = kt : z[2] !== void 0 ? (Ht.test(z[2]) && (a = RegExp("</" + z[2], "g")), n = ve) : z[3] !== void 0 && (n = ve) : n === ve ? z[0] === ">" ? (n = a ?? De, u = -1) : z[1] === void 0 ? u = -2 : (u = n.lastIndex - z[2].length, y = z[1], n = z[3] === void 0 ? ve : z[3] === '"' ? jt : zt) : n === jt || n === zt ? n = ve : n === xt || n === kt ? n = De : (n = ve, a = void 0);
    const S = n === ve && e[p + 1].startsWith("/>") ? " " : "";
    s += n === De ? h + hr : u >= 0 ? (i.push(y), h.slice(0, u) + Ut + h.slice(u) + ge + S) : h + ge + (u === -2 ? p : S);
  }
  return [Lt(e, s + (e[r] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Ne {
  constructor({ strings: t, _$litType$: r }, i) {
    let a;
    this.parts = [];
    let s = 0, n = 0;
    const p = t.length - 1, h = this.parts, [y, z] = gr(t, r);
    if (this.el = Ne.createElement(y, i), we.currentNode = this.el.content, r === 2 || r === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (a = we.nextNode()) !== null && h.length < p; ) {
      if (a.nodeType === 1) {
        if (a.hasAttributes()) for (const u of a.getAttributeNames()) if (u.endsWith(Ut)) {
          const te = z[n++], S = a.getAttribute(u).split(ge), C = /([.?@])?(.*)/.exec(te);
          h.push({ type: 1, index: s, name: C[2], strings: S, ctor: C[1] === "." ? yr : C[1] === "?" ? br : C[1] === "@" ? fr : Je }), a.removeAttribute(u);
        } else u.startsWith(ge) && (h.push({ type: 6, index: s }), a.removeAttribute(u));
        if (Ht.test(a.tagName)) {
          const u = a.textContent.split(ge), te = u.length - 1;
          if (te > 0) {
            a.textContent = Fe ? Fe.emptyScript : "";
            for (let S = 0; S < te; S++) a.append(u[S], Oe()), we.nextNode(), h.push({ type: 2, index: ++s });
            a.append(u[te], Oe());
          }
        }
      } else if (a.nodeType === 8) if (a.data === Bt) h.push({ type: 2, index: s });
      else {
        let u = -1;
        for (; (u = a.data.indexOf(ge, u + 1)) !== -1; ) h.push({ type: 7, index: s }), u += ge.length - 1;
      }
      s++;
    }
  }
  static createElement(t, r) {
    const i = $e.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Se(e, t, r = e, i) {
  if (t === ne) return t;
  let a = i !== void 0 ? r._$Co?.[i] : r._$Cl;
  const s = Ie(t) ? void 0 : t._$litDirective$;
  return a?.constructor !== s && (a?._$AO?.(!1), s === void 0 ? a = void 0 : (a = new s(e), a._$AT(e, r, i)), i !== void 0 ? (r._$Co ??= [])[i] = a : r._$Cl = a), a !== void 0 && (t = Se(e, a._$AS(e, t.values), a, i)), t;
}
class _r {
  constructor(t, r) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = r;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: r }, parts: i } = this._$AD, a = (t?.creationScope ?? $e).importNode(r, !0);
    we.currentNode = a;
    let s = we.nextNode(), n = 0, p = 0, h = i[0];
    for (; h !== void 0; ) {
      if (n === h.index) {
        let y;
        h.type === 2 ? y = new qe(s, s.nextSibling, this, t) : h.type === 1 ? y = new h.ctor(s, h.name, h.strings, this, t) : h.type === 6 && (y = new vr(s, this, t)), this._$AV.push(y), h = i[++p];
      }
      n !== h?.index && (s = we.nextNode(), n++);
    }
    return we.currentNode = $e, a;
  }
  p(t) {
    let r = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, r), r += i.strings.length - 2) : i._$AI(t[r])), r++;
  }
}
class qe {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, r, i, a) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = r, this._$AM = i, this.options = a, this._$Cv = a?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const r = this._$AM;
    return r !== void 0 && t?.nodeType === 11 && (t = r.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, r = this) {
    t = Se(this, t, r), Ie(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== ne && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ur(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && Ie(this._$AH) ? this._$AA.nextSibling.data = t : this.T($e.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: r, _$litType$: i } = t, a = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ne.createElement(Lt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === a) this._$AH.p(r);
    else {
      const s = new _r(a, this), n = s.u(this.options);
      s.p(r), this.T(n), this._$AH = s;
    }
  }
  _$AC(t) {
    let r = At.get(t.strings);
    return r === void 0 && At.set(t.strings, r = new Ne(t)), r;
  }
  k(t) {
    pt(this._$AH) || (this._$AH = [], this._$AR());
    const r = this._$AH;
    let i, a = 0;
    for (const s of t) a === r.length ? r.push(i = new qe(this.O(Oe()), this.O(Oe()), this, this.options)) : i = r[a], i._$AI(s), a++;
    a < r.length && (this._$AR(i && i._$AB.nextSibling, a), r.length = a);
  }
  _$AR(t = this._$AA.nextSibling, r) {
    for (this._$AP?.(!1, !0, r); t !== this._$AB; ) {
      const i = wt(t).nextSibling;
      wt(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Je {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, r, i, a, s) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = r, this._$AM = a, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = c;
  }
  _$AI(t, r = this, i, a) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) t = Se(this, t, r, 0), n = !Ie(t) || t !== this._$AH && t !== ne, n && (this._$AH = t);
    else {
      const p = t;
      let h, y;
      for (t = s[0], h = 0; h < s.length - 1; h++) y = Se(this, p[i + h], r, h), y === ne && (y = this._$AH[h]), n ||= !Ie(y) || y !== this._$AH[h], y === c ? t = c : t !== c && (t += (y ?? "") + s[h + 1]), this._$AH[h] = y;
    }
    n && !a && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class yr extends Je {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class br extends Je {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class fr extends Je {
  constructor(t, r, i, a, s) {
    super(t, r, i, a, s), this.type = 5;
  }
  _$AI(t, r = this) {
    if ((t = Se(this, t, r, 0) ?? c) === ne) return;
    const i = this._$AH, a = t === c && i !== c || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, s = t !== c && (i === c || a);
    a && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class vr {
  constructor(t, r, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = r, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Se(this, t);
  }
}
const wr = ct.litHtmlPolyfillSupport;
wr?.(Ne, qe), (ct.litHtmlVersions ??= []).push("3.3.3");
const $r = (e, t, r) => {
  const i = r?.renderBefore ?? t;
  let a = i._$litPart$;
  if (a === void 0) {
    const s = r?.renderBefore ?? null;
    i._$litPart$ = a = new qe(t.insertBefore(Oe(), s), s, void 0, r ?? {});
  }
  return a._$AI(e), a;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht = globalThis;
let g = class extends Ae {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const r = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = $r(r, this.renderRoot, this.renderOptions);
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
g._$litElement$ = !0, g.finalized = !0, ht.litElementHydrateSupport?.({ LitElement: g });
const xr = ht.litElementPolyfillSupport;
xr?.({ LitElement: g });
(ht.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const f = (e) => (t, r) => {
  r !== void 0 ? r.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kr = { attribute: !0, type: String, converter: Ke, reflect: !1, hasChanged: dt }, zr = (e = kr, t, r) => {
  const { kind: i, metadata: a } = r;
  let s = globalThis.litPropertyMetadata.get(a);
  if (s === void 0 && globalThis.litPropertyMetadata.set(a, s = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), s.set(r.name, e), i === "accessor") {
    const { name: n } = r;
    return { set(p) {
      const h = t.get.call(this);
      t.set.call(this, p), this.requestUpdate(n, h, e, !0, p);
    }, init(p) {
      return p !== void 0 && this.C(n, void 0, e, p), p;
    } };
  }
  if (i === "setter") {
    const { name: n } = r;
    return function(p) {
      const h = this[n];
      t.call(this, p), this.requestUpdate(n, h, e, !0, p);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function l(e) {
  return (t, r) => typeof r == "object" ? zr(e, t, r) : ((i, a, s) => {
    const n = a.hasOwnProperty(s);
    return a.constructor.createProperty(s, i), n ? Object.getOwnPropertyDescriptor(a, s) : void 0;
  })(e, t, r);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(e) {
  return l({ ...e, state: !0, attribute: !1 });
}
var jr = Object.defineProperty, Ar = Object.getOwnPropertyDescriptor, Qe = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Ar(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && jr(t, r, a), a;
};
let Ce = class extends g {
  constructor() {
    super(...arguments), this.variant = "filled", this.disabled = !1;
  }
  render() {
    return o`
      <button class=${this.variant} ?disabled=${this.disabled} @click=${this.handleClick}>
        ${this.icon ? o`<span aria-hidden="true">${this.icon}</span>` : c}
        <slot></slot>
      </button>
    `;
  }
  handleClick(e) {
    this.disabled && e.stopPropagation();
  }
};
Ce.styles = x`
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
Qe([
  l({ type: String })
], Ce.prototype, "variant", 2);
Qe([
  l({ type: Boolean })
], Ce.prototype, "disabled", 2);
Qe([
  l({ type: String })
], Ce.prototype, "icon", 2);
Ce = Qe([
  f("se-button")
], Ce);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const je = { ATTRIBUTE: 1, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4 }, Gt = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Wt = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, r, i) {
    this._$Ct = t, this._$AM = r, this._$Ci = i;
  }
  _$AS(t, r) {
    return this.update(t, r);
  }
  update(t, r) {
    return this.render(...r);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Sr = (e) => e.strings === void 0, Cr = {}, Kt = (e, t = Cr) => e._$AH = t;
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ft = Gt(class extends Wt {
  constructor(e) {
    if (super(e), e.type !== je.PROPERTY && e.type !== je.ATTRIBUTE && e.type !== je.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!Sr(e)) throw Error("`live` bindings can only contain a single expression");
  }
  render(e) {
    return e;
  }
  update(e, [t]) {
    if (t === ne || t === c) return t;
    const r = e.element, i = e.name;
    if (e.type === je.PROPERTY) {
      if (t === r[i]) return ne;
    } else if (e.type === je.BOOLEAN_ATTRIBUTE) {
      if (!!t === r.hasAttribute(i)) return ne;
    } else if (e.type === je.ATTRIBUTE && r.getAttribute(i) === t + "") return ne;
    return Kt(e), t;
  }
});
var Er = Object.defineProperty, Pr = Object.getOwnPropertyDescriptor, ut = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Pr(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Er(t, r, a), a;
};
const Dr = 300;
let Me = class extends g {
  constructor() {
    super(...arguments), this.heading = "", this.open = !1, this.keepInView = (e) => {
      const t = e.composedPath()[0]?.tagName;
      if (t !== "INPUT" && t !== "TEXTAREA")
        return;
      const r = e.target;
      r?.scrollIntoView && window.setTimeout(() => {
        r.scrollIntoView({ block: "center", behavior: "smooth" });
      }, Dr);
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
Me.styles = x`
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
ut([
  l({ type: String })
], Me.prototype, "heading", 2);
ut([
  l({ type: Boolean, reflect: !0 })
], Me.prototype, "open", 2);
Me = ut([
  f("se-dialog")
], Me);
var Tr = Object.defineProperty, Or = Object.getOwnPropertyDescriptor, ce = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Or(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Tr(t, r, a), a;
};
let Q = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.type = "text", this.placeholder = "", this.required = !1, this.disabled = !1, this.decimal = !1;
  }
  render() {
    return o`
      ${this.label ? o`<label>${this.label}${this.required ? " *" : ""}</label>` : c}
      <div class="wrapper">
        <input
          .type=${this.type}
          .value=${this.value}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          inputmode=${this.decimal ? "decimal" : c}
          @input=${this.handleInput}
        />
        ${this.suffix ? o`<span class="suffix">${this.suffix}</span>` : c}
        <!-- For a suffix that does something, where a word would sit. -->
        <slot name="suffix"></slot>
      </div>
      ${this.helper ? o`<div class="helper">${this.helper}</div>` : c}
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
Q.styles = x`
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
ce([
  l({ type: String })
], Q.prototype, "label", 2);
ce([
  l({ type: String })
], Q.prototype, "value", 2);
ce([
  l({ type: String })
], Q.prototype, "type", 2);
ce([
  l({ type: String })
], Q.prototype, "placeholder", 2);
ce([
  l({ type: String })
], Q.prototype, "suffix", 2);
ce([
  l({ type: String })
], Q.prototype, "helper", 2);
ce([
  l({ type: Boolean })
], Q.prototype, "required", 2);
ce([
  l({ type: Boolean })
], Q.prototype, "disabled", 2);
ce([
  l({ type: Boolean })
], Q.prototype, "decimal", 2);
Q = ce([
  f("se-field")
], Q);
var Ir = Object.defineProperty, Nr = Object.getOwnPropertyDescriptor, Ee = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Nr(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Ir(t, r, a), a;
};
let _e = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.options = [], this.disabled = !1;
  }
  render() {
    return o`
      ${this.label ? o`<label>${this.label}</label>` : c}
      <select .value=${this.value} ?disabled=${this.disabled} @change=${this.handleChange}>
        ${this.placeholder ? o`<option value="" ?selected=${!this.value}>${this.placeholder}</option>` : c}
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
_e.styles = x`
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
Ee([
  l({ type: String })
], _e.prototype, "label", 2);
Ee([
  l({ type: String })
], _e.prototype, "value", 2);
Ee([
  l({ attribute: !1 })
], _e.prototype, "options", 2);
Ee([
  l({ type: String })
], _e.prototype, "placeholder", 2);
Ee([
  l({ type: Boolean })
], _e.prototype, "disabled", 2);
_e = Ee([
  f("se-select")
], _e);
const J = 1e6, Mr = J * 1e4, mt = [
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
function Vt(e) {
  return Number.isInteger(e) && e > 0 && e <= Mr;
}
function Rr(e, t) {
  return !Number.isInteger(e) || e < 0 || !Vt(t) ? null : Math.floor((e * t + J / 2) / J);
}
function qr(e) {
  const t = e.trim().replace(",", ".");
  if (!t)
    return null;
  const r = /^(\d*)(?:\.(\d*))?$/.exec(t);
  if (!r)
    return null;
  const [, i, a = ""] = r;
  if (!i && !a || a.length > 6)
    return null;
  const s = Number(i || "0") * J + Number(a.padEnd(6, "0") || "0");
  return Vt(s) ? s : null;
}
function St(e) {
  const t = Math.floor(e / J), r = e % J;
  return r === 0 ? String(t) : `${t}.${String(r).padStart(6, "0")}`.replace(/0+$/, "");
}
const Ve = {
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
  stat_where: "Where it went",
  stat_avg: "{amount} / expense",
  stat_insight_half: "More than half went to {cat}.",
  stat_insight_mostly: "Mostly {cat} ({pct}%).",
  stat_insight_peak: "Peaked in {month}, at {amount}.",
  stat_owed: "Owed {amount}",
  stat_owes: "Owes {amount}",
  stat_even: "Settled up",
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
  currency_locked: "This project already has expenses, so its currency can no longer change.",
  not_loaded: "The integration is not loaded.",
  unknown_error: "Something went wrong."
}, Ur = {
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
  stat_where: "Où est passé l'argent",
  stat_avg: "{amount} / dép.",
  stat_insight_half: "Plus de la moitié est passée en {cat}.",
  stat_insight_mostly: "Surtout en {cat} ({pct} %).",
  stat_insight_peak: "Le pic est en {month}, à {amount}.",
  stat_owed: "On lui doit {amount}",
  stat_owes: "Doit {amount}",
  stat_even: "À l'équilibre",
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
  currency_locked: "Ce projet a déjà des dépenses : sa devise ne peut plus changer.",
  not_loaded: "L'intégration n'est pas chargée.",
  unknown_error: "Une erreur est survenue."
}, Br = {
  app_title: "Geteilte Ausgaben",
  groups: "Projekte",
  no_groups: "Noch kein Projekt. Erstelle eines, um zu beginnen.",
  new_group: "Neues Projekt",
  edit_group: "Projekt bearbeiten",
  all_groups: "Alle Projekte",
  more: "Mehr",
  delete_group: "Dieses Projekt löschen",
  create_group: "Projekt erstellen",
  group_name: "Projektname",
  description: "Beschreibung",
  currency: "Währung",
  archived: "Archiviert",
  archive: "Archivieren",
  restore: "Wiederherstellen",
  delete: "Löschen",
  cancel: "Abbrechen",
  save: "Speichern",
  create: "Erstellen",
  statistics: "Statistiken",
  period_all: "Gesamt",
  total_spent: "Gesamt ausgegeben",
  your_share: "Dein Anteil",
  by_category: "Nach Kategorie",
  by_month: "Nach Monat",
  by_member: "Nach Person",
  paid_total: "Bezahlt",
  consumed: "Anteil",
  stat_where: "Wohin das Geld ging",
  stat_avg: "{amount} / Ausg.",
  stat_insight_half: "Mehr als die Hälfte ging in {cat}.",
  stat_insight_mostly: "Vor allem {cat} ({pct} %).",
  stat_insight_peak: "Höchststand im {month}, bei {amount}.",
  stat_owed: "Bekommt {amount}",
  stat_owes: "Schuldet {amount}",
  stat_even: "Ausgeglichen",
  current_balance: "Aktueller Saldo",
  must_receive: "erhält",
  must_pay: "zahlt",
  you_owe: "Du schuldest",
  you_are_owed: "Man schuldet dir",
  owes_you: "schuldet dir",
  you_are_settled: "Du bist ausgeglichen.",
  detailed_balances: "Detaillierte Salden anzeigen",
  no_activity: "Es ist noch nichts passiert.",
  search: "Ausgabe, Person oder Betrag suchen…",
  no_match: "Kein Treffer.",
  a_settlement: "Rückzahlung",
  see_all: "Alle anzeigen",
  action_add_expense: "Ausgabe hinzufügen",
  fab_hint: "Ausgabe hinzufügen — ziehen zum Zurückzahlen",
  categories: "Kategorien",
  no_categories: "Noch keine Kategorie. Eine Kategorie trägt eine Standard-Aufteilungsregel.",
  new_category: "Neue Kategorie",
  default_category: "Standardkategorie",
  default_category_hint: "Eine neue Ausgabe öffnet sich mit dieser. Nur eine pro Projekt.",
  default_category_tag: "Standard",
  edit_category: "Kategorie bearbeiten",
  category_name: "Name",
  color: "Farbe",
  pick_color: "Farbe ändern",
  color_auto: "Automatisch",
  color_auto_short: "AUTO",
  icon: "Symbol",
  icon_hint: "Suche nach Name oder danach, was es darstellt, zum Beispiel cart.",
  icon_search: "Symbol suchen…",
  icon_list_failed: "Die Symbolliste konnte nicht geladen werden. Gib von Hand einen mdi:-Namen ein.",
  default_split: "Standardaufteilung",
  split_how: "Wie wird geteilt?",
  split_who_pays: "Wer zahlt was",
  split_untouched_hint: "Tippe einen Betrag ein, um ihn festzulegen. Der Rest wird geteilt.",
  split_reset: "Zurücksetzen",
  split_over_amount: "Das übersteigt den Betrag der Ausgabe.",
  split_default: "Standardregel",
  split_default_example: "z. B. die Kategorie sagt 60 / 40, also diese auch.",
  split_equal_example: "z. B. 90 € auf drei: 30 € pro Person.",
  split_exact_example: "z. B. Michel 12 €, André 14 €, der Rest für den, der bezahlt hat.",
  split_percent_example: "z. B. 60 / 40 — bei 100 € sind das 60 und 40, bei 30 € sind es 18 und 12.",
  split_partial_example: "z. B. 10 € geteilt bei 85 € Einkauf: 5 € pro Person, und die restlichen 75 € für den, der bezahlt hat.",
  split_custom_example: "z. B. 10 € geteilt, dann 8 € für den einen und 4 € für den anderen.",
  default_from_category: "Was die Kategorie sagt, oder das Projekt, wenn sie nichts sagt.",
  default_from_group: "Was das Projekt für Ausgaben ohne Kategorie sagt.",
  split_equal: "Gleiche Anteile",
  split_exact: "Genaue Beträge",
  split_shared_lower: "geteilt",
  rule_from_group: "Standardregel",
  no_category_rule: "Regel ohne Kategorie",
  no_category_rule_hint: "Gilt für eine Ausgabe ohne Kategorie und für jede Kategorie, die keine eigene Regel hat.",
  split_percent: "Prozentsätze",
  split_percent_hint: "Der Anteil, den jeder schuldet. Leer lassen, um einen gleichen Anteil vom Rest zu nehmen.",
  split_percent_total: "Gesamt",
  split_percent_over: "Mehr als die gesamte Ausgabe.",
  split_partial: "Einen Teil teilen",
  split_custom: "Benutzerdefiniert",
  split_custom_hint: "Alles, was die Regeln können. Für die Fälle, die die drei oben nicht abdecken.",
  split_shared_all: "Die ganze Ausgabe",
  split_shared_all_hint: "Leer lassen, um alles zu teilen.",
  split_rest_between: "Was übrig bleibt, geht an",
  split_rest_between_hint: "Kreuze an, wer es nimmt. Ein Betrag ist genau, ein leeres Feld ein gleicher Anteil. Niemand angekreuzt: Wer bezahlt hat, nimmt alles.",
  split_equal_hint: "Zu gleichen Teilen unter den Angekreuzten geteilt.",
  split_exact_hint: "Was jeder schuldet. Leer lassen, um einen gleichen Anteil vom Rest zu nehmen.",
  split_shared_amount: "Zu teilender Betrag",
  split_shared_between: "Geteilt zwischen",
  split_rest_for: "Der Rest ist für",
  split_rest_payer: "Wer bezahlt hat",
  split_the_rest_short: "der Rest",
  rule_invalid: "Diese Regel kann nicht aufgelöst werden.",
  balance_settled: "Alles ist ausgeglichen.",
  to: "an",
  settle_up: "Ausgleichen",
  expenses: "Ausgaben",
  no_expenses: "Noch keine Ausgabe.",
  new_expense: "Neue Ausgabe",
  edit_expense: "Ausgabe bearbeiten",
  confirm_delete: "Bestätigen?",
  confirm_delete_expense: "Diese Ausgabe löschen? Ihre Anteile gehen mit. Der Verlauf behält sie und kann sie wiederherstellen.",
  confirm_delete_payment: "Diese Rückzahlung löschen? Die damit beglichene Schuld kommt zurück.",
  expense_title: "Bezeichnung",
  amount: "Betrag",
  currency_label: "Währung",
  rate_heading: "Wechselkurs",
  rate_label: "Kurs",
  rate_of_day: "Kurs vom",
  rate_stale: "Nicht der heutige Kurs — dieser ist vom",
  rate_manual: "Von Hand eingegeben",
  rate_unavailable: "Der Kurs konnte nicht abgerufen werden. Gib einen ein, um fortzufahren: er dient als Referenz.",
  rate_needed: "Ein Kurs wird benötigt.",
  rate_retry: "Erneut versuchen",
  converts_to: "entspricht",
  invalid_exchange_rate: "Dieser Kurs ist unbrauchbar.",
  exchange_rate_unavailable: "Kein Kurs für diese Währungen gefunden.",
  paid_by: "Bezahlt von",
  date: "Datum",
  category: "Kategorie",
  no_category: "Ohne Kategorie",
  split: "Aufteilung",
  edit_split: "Ändern",
  done: "Fertig",
  add_description: "Beschreibung hinzufügen",
  split_needs_amount: "Gib einen Betrag ein, um die Aufteilung zu sehen.",
  description_placeholder: "Optional",
  split_total: "Aufgeteilt gesamt",
  apply_rule: "Regel anwenden von",
  group_rule: "des Projekts",
  shares_mismatch: "Die Summe der Anteile muss dem Betrag entsprechen.",
  participants: "Teilnehmer",
  members: "Mitglieder",
  member_name: "Name",
  remove_member: "Aus dem Projekt entfernen",
  restore_member: "Wieder aktivieren",
  confirm_remove: "Bestätigen?",
  add: "Hinzufügen",
  close: "Schließen",
  ha_accounts: "Home-Assistant-Konten",
  ha_accounts_hint: "Die angekreuzten Konten nehmen am Projekt teil und können es öffnen.",
  no_ha_accounts: "Kein Konto gefunden.",
  admin_locked: "Der Administrator kann nicht gehen. Gib das Projekt zuerst ab oder archiviere es.",
  cannot_remove_admin: "Der Administrator kann nicht gehen. Gib das Projekt zuerst ab oder archiviere es.",
  make_admin: "Projekt abgeben",
  confirm_make_admin: "Das Projekt an diese Person abgeben? Du wirst wieder ein gewöhnliches Mitglied, und nur sie kann es abgeben oder löschen.",
  admin_needs_account: "Nur eine Person mit einem Home-Assistant-Konto kann ein Projekt verwalten.",
  dashboard: "Auf dem Dashboard",
  dashboard_hint: "Nein. Home Assistant schottet Entitäten nicht ab: alle Konten im Haus würden die Salden dieses Projekts lesen, Mitglied oder nicht.",
  dashboard_on: "Dieses Projekt aufs Dashboard bringen",
  dashboard_on_hint: "Ein Sensor pro Mitglied und einer, der sagt, ob noch etwas geschuldet wird. Lesbar für alle Konten im Haus — nicht nur für die Leute in diesem Projekt.",
  permissions: "Was Mitglieder dürfen",
  permissions_hint: "Für alle im Projekt gleich. Du und die Administratoren stehen immer darüber.",
  perm_manage_members: "Mitglieder verwalten",
  perm_manage_members_hint: "Personen hinzufügen, entfernen und umbenennen. Nie, wer Administrator ist.",
  perm_manage_categories: "Kategorien verwalten",
  perm_manage_categories_hint: "Die Kategorien und ihre Regeln erstellen und ändern.",
  perm_manage_group: "Projekt bearbeiten",
  perm_manage_group_hint: "Es umbenennen, seine Standardregel ändern, es archivieren.",
  perm_edit_others: "Ändern, was nicht ihnen gehört",
  perm_edit_others_hint: "Eine Ausgabe ändern oder löschen, die jemand anderes erfasst und bezahlt hat.",
  not_allowed: "Das Projekt erlaubt dir das nicht.",
  archived_hint: "Dieses Projekt ist archiviert: es kann nichts mehr hinzugefügt werden.",
  guests: "Ohne Konto",
  guests_hint: "Sie tragen Ausgaben, melden sich aber nie an.",
  no_account: "Ohne Konto",
  role_admin: "Administrator",
  role_member: "Mitglied",
  new_payment: "Rückzahlung / Schuld erfassen",
  new_debt: "Eine Schuld eintragen",
  kind_label: "Worum geht es?",
  kind_reimbursement: "Rückzahlung",
  kind_debt: "Schuld",
  debt_who_owes: "Wer schuldet",
  debt_to_whom: "An wen",
  a_debt: "Schuld",
  you: "Du",
  edit_debt: "Schuld bearbeiten",
  confirm_delete_debt: "Diese Schuld löschen? Sie wird nicht mehr geschuldet.",
  edit_payment: "Rückzahlung bearbeiten",
  from_member: "Von",
  to_member: "An",
  history: "Verlauf",
  group_history: "Projektverlauf",
  no_history: "Noch nichts aufgezeichnet.",
  history_created: "hat hinzugefügt",
  history_updated: "hat geändert",
  history_deleted: "hat gelöscht",
  history_restored: "hat wiederhergestellt",
  restore_entry: "Wiederherstellen",
  the_expense: "die Ausgabe",
  the_payment: "die Rückzahlung",
  the_group: "das Projekt",
  the_category: "die Kategorie",
  the_member: "das Mitglied",
  field_name: "Name",
  field_role: "Status",
  permissions_none: "nichts",
  yes: "Ja",
  no: "Nein",
  someone: "Jemand",
  loading: "Wird geladen…",
  error_generic: "Etwas ist schiefgelaufen.",
  group_not_found: "Dieses Projekt existiert nicht mehr.",
  group_archived: "Dieses Projekt ist archiviert.",
  member_not_found: "Dieses Mitglied existiert nicht mehr.",
  member_already_in_group: "Dieses Mitglied gehört bereits zum Projekt.",
  category_not_found: "Diese Kategorie existiert nicht mehr.",
  expense_not_found: "Diese Ausgabe existiert nicht mehr.",
  invalid_expense: "Diese Ausgabe ist ungültig.",
  invalid_expense_shares: "Die Summe der Anteile entspricht nicht dem Betrag.",
  invalid_split_rule: "Diese Aufteilungsregel ist ungültig.",
  payment_not_found: "Diese Rückzahlung existiert nicht mehr.",
  invalid_payment: "Diese Rückzahlung ist ungültig.",
  currency_locked: "Dieses Projekt hat bereits Ausgaben: seine Währung kann sich nicht mehr ändern.",
  not_loaded: "Die Integration ist nicht geladen.",
  unknown_error: "Etwas ist schiefgelaufen."
}, Hr = {
  app_title: "Gedeelde uitgaven",
  groups: "Projecten",
  no_groups: "Nog geen project. Maak er een om te beginnen.",
  new_group: "Nieuw project",
  edit_group: "Project bewerken",
  all_groups: "Alle projecten",
  more: "Meer",
  delete_group: "Dit project verwijderen",
  create_group: "Project aanmaken",
  group_name: "Projectnaam",
  description: "Beschrijving",
  currency: "Valuta",
  archived: "Gearchiveerd",
  archive: "Archiveren",
  restore: "Herstellen",
  delete: "Verwijderen",
  cancel: "Annuleren",
  save: "Opslaan",
  create: "Aanmaken",
  statistics: "Statistieken",
  period_all: "Alles",
  total_spent: "Totaal uitgegeven",
  your_share: "Jouw deel",
  by_category: "Per categorie",
  by_month: "Per maand",
  by_member: "Per persoon",
  paid_total: "Betaald",
  consumed: "Deel",
  stat_where: "Waar het geld heenging",
  stat_avg: "{amount} / uitg.",
  stat_insight_half: "Meer dan de helft ging naar {cat}.",
  stat_insight_mostly: "Vooral {cat} ({pct} %).",
  stat_insight_peak: "Piek in {month}, op {amount}.",
  stat_owed: "Heeft {amount} tegoed",
  stat_owes: "Moet {amount}",
  stat_even: "In evenwicht",
  current_balance: "Huidig saldo",
  must_receive: "moet ontvangen",
  must_pay: "moet betalen",
  you_owe: "Jij bent schuldig",
  you_are_owed: "Men is jou schuldig",
  owes_you: "is jou schuldig",
  you_are_settled: "Je bent bij.",
  detailed_balances: "Bekijk gedetailleerde saldi",
  no_activity: "Er is nog niets gebeurd.",
  search: "Zoek een uitgave, een persoon, een bedrag…",
  no_match: "Geen resultaten.",
  a_settlement: "Terugbetaling",
  see_all: "Alles bekijken",
  action_add_expense: "Uitgave toevoegen",
  fab_hint: "Voeg een uitgave toe — sleep om terug te betalen",
  categories: "Categorieën",
  no_categories: "Geen categorie. Een categorie draagt een standaard verdeelregel.",
  new_category: "Nieuwe categorie",
  default_category: "Standaardcategorie",
  default_category_hint: "Een nieuwe uitgave opent op deze. Eén per project.",
  default_category_tag: "Standaard",
  edit_category: "Categorie bewerken",
  category_name: "Naam",
  color: "Kleur",
  pick_color: "Kleur wijzigen",
  color_auto: "Automatisch",
  color_auto_short: "AUTO",
  icon: "Pictogram",
  icon_hint: "Zoek op naam of op wat het voorstelt, bijvoorbeeld cart.",
  icon_search: "Een pictogram zoeken…",
  icon_list_failed: "De lijst met pictogrammen kon niet worden geladen. Typ zelf een mdi:-naam.",
  default_split: "Standaardverdeling",
  split_how: "Hoe verdelen?",
  split_who_pays: "Wie betaalt wat",
  split_untouched_hint: "Typ een bedrag om het vast te zetten. De rest wordt verdeeld.",
  split_reset: "Opnieuw instellen",
  split_over_amount: "Dit gaat het bedrag van de uitgave te boven.",
  split_default: "Standaardregel",
  split_default_example: "bijv. de categorie zegt 60 / 40, dus deze ook.",
  split_equal_example: "bijv. 90 € met drie: 30 € elk.",
  split_exact_example: "bijv. Michel 12 €, André 14 €, de rest voor wie betaald heeft.",
  split_percent_example: "bijv. 60 / 40 — op 100 € is dat 60 en 40, op 30 € is het 18 en 12.",
  split_partial_example: "bijv. 10 € gedeeld op 85 € boodschappen: 5 € elk, en de overige 75 € voor wie betaald heeft.",
  split_custom_example: "bijv. 10 € gedeeld, dan 8 € voor de een en 4 € voor de ander.",
  default_from_category: "Wat de categorie zegt, of het project als zij niets zegt.",
  default_from_group: "Wat het project zegt voor uitgaven zonder categorie.",
  split_equal: "Gelijke delen",
  split_exact: "Exacte bedragen",
  split_shared_lower: "gedeeld",
  rule_from_group: "Standaardregel",
  no_category_rule: "Regel zonder categorie",
  no_category_rule_hint: "Geldt voor een uitgave zonder categorie, en voor elke categorie die geen eigen regel heeft.",
  split_percent: "Percentages",
  split_percent_hint: "Het deel dat ieder moet. Laat leeg om een gelijk deel van de rest te nemen.",
  split_percent_total: "Totaal",
  split_percent_over: "Meer dan de hele uitgave.",
  split_partial: "Een deel delen",
  split_custom: "Aangepast",
  split_custom_hint: "Alles wat de regels kunnen. Bewaard voor de gevallen die de drie hierboven niet kunnen zeggen.",
  split_shared_all: "De hele uitgave",
  split_shared_all_hint: "Laat leeg om alles te delen.",
  split_rest_between: "Wat overblijft is voor",
  split_rest_between_hint: "Vink aan wie het krijgt. Een bedrag is exact, een leeg veld een gelijk deel. Niemand aangevinkt: wie betaald heeft krijgt alles.",
  split_equal_hint: "Gelijk verdeeld tussen de aangevinkte personen.",
  split_exact_hint: "Wat ieder moet. Laat leeg om een gelijk deel van de rest te nemen.",
  split_shared_amount: "Te delen bedrag",
  split_shared_between: "Verdeeld tussen",
  split_rest_for: "De rest is voor",
  split_rest_payer: "Wie betaald heeft",
  split_the_rest_short: "de rest",
  rule_invalid: "Deze regel kan niet worden opgelost.",
  balance_settled: "Alles is afgerekend.",
  to: "aan",
  settle_up: "Afrekenen",
  expenses: "Uitgaven",
  no_expenses: "Nog geen uitgave.",
  new_expense: "Nieuwe uitgave",
  edit_expense: "Uitgave bewerken",
  confirm_delete: "Bevestigen?",
  confirm_delete_expense: "Deze uitgave verwijderen? De delen gaan ermee mee. De geschiedenis bewaart ze, en kan ze terughalen.",
  confirm_delete_payment: "Deze terugbetaling verwijderen? De schuld die ze vereffende komt terug.",
  expense_title: "Titel",
  amount: "Bedrag",
  currency_label: "Valuta",
  rate_heading: "Wisselkoers",
  rate_label: "Koers",
  rate_of_day: "Koers van",
  rate_stale: "Niet de koers van vandaag — deze is van",
  rate_manual: "Handmatig ingevoerd",
  rate_unavailable: "De koers kon niet worden opgehaald. Voer er een in om door te gaan: hij wordt bewaard voor de volgende keer.",
  rate_needed: "Er is een koers nodig.",
  rate_retry: "Opnieuw proberen",
  converts_to: "oftewel",
  invalid_exchange_rate: "Deze koers is onbruikbaar.",
  exchange_rate_unavailable: "Geen koers gevonden voor deze valuta's.",
  paid_by: "Betaald door",
  date: "Datum",
  category: "Categorie",
  no_category: "Zonder categorie",
  split: "Verdeling",
  edit_split: "Wijzigen",
  done: "Klaar",
  add_description: "Een beschrijving toevoegen",
  split_needs_amount: "Voer een bedrag in om de verdeling te zien.",
  description_placeholder: "Optioneel",
  split_total: "Totaal verdeeld",
  apply_rule: "Pas de regel toe van",
  group_rule: "het project",
  shares_mismatch: "Het totaal van de delen moet gelijk zijn aan het bedrag.",
  participants: "Deelnemers",
  members: "Leden",
  member_name: "Naam",
  remove_member: "Uit het project verwijderen",
  restore_member: "Terughalen",
  confirm_remove: "Bevestigen?",
  add: "Toevoegen",
  close: "Sluiten",
  ha_accounts: "Home Assistant-accounts",
  ha_accounts_hint: "Aangevinkte accounts nemen deel aan dit project en kunnen het openen.",
  no_ha_accounts: "Geen account gevonden.",
  admin_locked: "De beheerder kan niet vertrekken. Draag het project eerst over, of archiveer het.",
  cannot_remove_admin: "De beheerder kan niet vertrekken. Draag het project eerst over, of archiveer het.",
  make_admin: "Project overdragen",
  confirm_make_admin: "Het project aan deze persoon overdragen? Je wordt een gewoon lid, en alleen zij kan het overdragen of verwijderen.",
  admin_needs_account: "Alleen iemand met een Home Assistant-account kan een project beheren.",
  dashboard: "Op het dashboard",
  dashboard_hint: "Nee. Home Assistant schermt entiteiten niet af: alle accounts in huis zouden de saldi van dit project lezen, lid of niet.",
  dashboard_on: "Dit project op het dashboard zetten",
  dashboard_on_hint: "Een sensor per lid, en een die zegt of er nog iets openstaat. Leesbaar voor alle accounts in huis — niet alleen voor de mensen in dit project.",
  permissions: "Wat leden mogen doen",
  permissions_hint: "Hetzelfde voor iedereen in het project. Jij en de beheerders staan hier altijd boven.",
  perm_manage_members: "Leden beheren",
  perm_manage_members_hint: "Personen toevoegen, verwijderen en hernoemen. Nooit wie beheerder is.",
  perm_manage_categories: "Categorieën beheren",
  perm_manage_categories_hint: "De categorieën en hun regels aanmaken en wijzigen.",
  perm_manage_group: "Het project bewerken",
  perm_manage_group_hint: "Het hernoemen, zijn standaardregel wijzigen, het archiveren.",
  perm_edit_others: "Wijzigen wat niet van hen is",
  perm_edit_others_hint: "Een uitgave die iemand anders heeft ingevoerd en betaald wijzigen of verwijderen.",
  not_allowed: "Het project staat je dit niet toe.",
  archived_hint: "Dit project is gearchiveerd: er kan niets nieuws meer aan worden toegevoegd.",
  guests: "Zonder account",
  guests_hint: "Zij dragen uitgaven maar loggen nooit in.",
  no_account: "Zonder account",
  role_admin: "Beheerder",
  role_member: "Lid",
  new_payment: "Een terugbetaling / schuld vastleggen",
  new_debt: "Een schuld noteren",
  kind_label: "Wat is dit?",
  kind_reimbursement: "Terugbetaling",
  kind_debt: "Schuld",
  debt_who_owes: "Wie is schuldig",
  debt_to_whom: "Aan wie",
  a_debt: "Schuld",
  you: "Jij",
  edit_debt: "Schuld bewerken",
  confirm_delete_debt: "Deze schuld verwijderen? Ze wordt niet meer verschuldigd.",
  edit_payment: "Terugbetaling bewerken",
  from_member: "Van",
  to_member: "Naar",
  history: "Geschiedenis",
  group_history: "Projectgeschiedenis",
  no_history: "Nog niets vastgelegd.",
  history_created: "heeft toegevoegd",
  history_updated: "heeft gewijzigd",
  history_deleted: "heeft verwijderd",
  history_restored: "heeft hersteld",
  restore_entry: "Herstellen",
  the_expense: "de uitgave",
  the_payment: "de terugbetaling",
  the_group: "het project",
  the_category: "de categorie",
  the_member: "het lid",
  field_name: "Naam",
  field_role: "Status",
  permissions_none: "niets",
  yes: "Ja",
  no: "Nee",
  someone: "Iemand",
  loading: "Laden…",
  error_generic: "Er is iets misgegaan.",
  group_not_found: "Dit project bestaat niet meer.",
  group_archived: "Dit project is gearchiveerd.",
  member_not_found: "Dit lid bestaat niet meer.",
  member_already_in_group: "Dit lid maakt al deel uit van het project.",
  category_not_found: "Deze categorie bestaat niet meer.",
  expense_not_found: "Deze uitgave bestaat niet meer.",
  invalid_expense: "Deze uitgave is ongeldig.",
  invalid_expense_shares: "Het totaal van de delen komt niet overeen met het bedrag.",
  invalid_split_rule: "Deze verdeelregel is ongeldig.",
  payment_not_found: "Deze terugbetaling bestaat niet meer.",
  invalid_payment: "Deze terugbetaling is ongeldig.",
  currency_locked: "Dit project heeft al uitgaven: de valuta kan niet meer worden gewijzigd.",
  not_loaded: "De integratie is niet geladen.",
  unknown_error: "Er is iets misgegaan."
}, Lr = {
  app_title: "Gastos compartidos",
  groups: "Proyectos",
  no_groups: "Aún no hay ningún proyecto. Crea uno para empezar.",
  new_group: "Nuevo proyecto",
  edit_group: "Editar el proyecto",
  all_groups: "Todos los proyectos",
  more: "Más",
  delete_group: "Eliminar este proyecto",
  create_group: "Crear el proyecto",
  group_name: "Nombre del proyecto",
  description: "Descripción",
  currency: "Moneda",
  archived: "Archivado",
  archive: "Archivar",
  restore: "Restaurar",
  delete: "Eliminar",
  cancel: "Cancelar",
  save: "Guardar",
  create: "Crear",
  statistics: "Estadísticas",
  period_all: "Todo",
  total_spent: "Total gastado",
  your_share: "Tu parte",
  by_category: "Por categoría",
  by_month: "Por mes",
  by_member: "Por persona",
  paid_total: "Pagado",
  consumed: "Parte",
  stat_where: "En qué se fue el dinero",
  stat_avg: "{amount} / gasto",
  stat_insight_half: "Más de la mitad se fue en {cat}.",
  stat_insight_mostly: "Sobre todo en {cat} ({pct} %).",
  stat_insight_peak: "El pico está en {month}, con {amount}.",
  stat_owed: "Le deben {amount}",
  stat_owes: "Debe {amount}",
  stat_even: "En equilibrio",
  current_balance: "Saldo actual",
  must_receive: "debe recibir",
  must_pay: "debe pagar",
  you_owe: "Debes",
  you_are_owed: "Te deben",
  owes_you: "te debe",
  you_are_settled: "Estás al día.",
  detailed_balances: "Ver los saldos detallados",
  no_activity: "Aún no ha pasado nada.",
  search: "Buscar un gasto, una persona, un importe…",
  no_match: "Ningún resultado.",
  a_settlement: "Reembolso",
  see_all: "Ver todo",
  action_add_expense: "Añadir gasto",
  fab_hint: "Añadir un gasto — arrastra para reembolsar",
  categories: "Categorías",
  no_categories: "Ninguna categoría. Una categoría lleva una regla de reparto por defecto.",
  new_category: "Nueva categoría",
  default_category: "Categoría por defecto",
  default_category_hint: "Un nuevo gasto se abrirá en esta. Una sola por proyecto.",
  default_category_tag: "Por defecto",
  edit_category: "Editar la categoría",
  category_name: "Nombre",
  color: "Color",
  pick_color: "Cambiar el color",
  color_auto: "Automático",
  color_auto_short: "AUTO",
  icon: "Icono",
  icon_hint: "Busca por nombre o por lo que representa, por ejemplo cart.",
  icon_search: "Buscar un icono…",
  icon_list_failed: "No se pudo cargar la lista de iconos. Escribe un nombre mdi: a mano.",
  default_split: "Reparto por defecto",
  split_how: "¿Cómo se reparte?",
  split_who_pays: "Quién paga qué",
  split_untouched_hint: "Escribe un importe para fijarlo. El resto se reparte.",
  split_reset: "Restablecer",
  split_over_amount: "Eso supera el importe del gasto.",
  split_default: "Regla por defecto",
  split_default_example: "ej. la categoría dice 60 / 40, así que esta también.",
  split_equal_example: "ej. 90 € entre tres: 30 € cada uno.",
  split_exact_example: "ej. Michel 12 €, André 14 €, el resto para quien pagó.",
  split_percent_example: "ej. 60 / 40 — sobre 100 € son 60 y 40, sobre 30 € son 18 y 12.",
  split_partial_example: "ej. 10 € compartidos en una compra de 85 €: 5 € cada uno, y los 75 € restantes para quien pagó.",
  split_custom_example: "ej. 10 € compartidos, luego 8 € para uno y 4 € para el otro.",
  default_from_category: "Lo que diga la categoría, o el proyecto si ella no dice nada.",
  default_from_group: "Lo que diga el proyecto para los gastos sin categoría.",
  split_equal: "Partes iguales",
  split_exact: "Importes exactos",
  split_shared_lower: "compartidos",
  rule_from_group: "Regla por defecto",
  no_category_rule: "Regla sin categoría",
  no_category_rule_hint: "Se aplica a un gasto sin categoría, y a cualquier categoría que no tenga su propia regla.",
  split_percent: "Porcentajes",
  split_percent_hint: "La parte que le corresponde a cada uno. Deja vacío para tomar una parte igual de lo que queda.",
  split_percent_total: "Total",
  split_percent_over: "Más que el gasto entero.",
  split_partial: "Compartir una parte",
  split_custom: "Personalizado",
  split_custom_hint: "Todo lo que las reglas saben hacer. Reservado para los casos que las tres anteriores no expresan.",
  split_shared_all: "Todo el gasto",
  split_shared_all_hint: "Deja vacío para compartirlo todo.",
  split_rest_between: "Lo que queda es para",
  split_rest_between_hint: "Marca quién lo toma. Un importe es exacto, un campo vacío una parte igual. Nadie marcado: quien pagó se lo lleva todo.",
  split_equal_hint: "Compartido a partes iguales entre las personas marcadas.",
  split_exact_hint: "Lo que debe cada uno. Deja vacío para tomar una parte igual de lo que queda.",
  split_shared_amount: "Importe a compartir",
  split_shared_between: "Compartido entre",
  split_rest_for: "El resto es para",
  split_rest_payer: "Quien pagó",
  split_the_rest_short: "el resto",
  rule_invalid: "Esta regla no se puede resolver.",
  balance_settled: "Todo está saldado.",
  to: "a",
  settle_up: "Saldar",
  expenses: "Gastos",
  no_expenses: "Aún no hay ningún gasto.",
  new_expense: "Nuevo gasto",
  edit_expense: "Editar el gasto",
  confirm_delete: "¿Confirmar?",
  confirm_delete_expense: "¿Eliminar este gasto? Sus partes se van con él. El historial lo conserva, y puede restaurarlo.",
  confirm_delete_payment: "¿Eliminar este reembolso? La deuda que saldó vuelve a aparecer.",
  expense_title: "Título",
  amount: "Importe",
  currency_label: "Moneda",
  rate_heading: "Tipo de cambio",
  rate_label: "Tipo",
  rate_of_day: "Tipo del",
  rate_stale: "No es el tipo de hoy — este es del",
  rate_manual: "Introducido a mano",
  rate_unavailable: "No se pudo obtener el tipo. Introduce uno para continuar: servirá de referencia.",
  rate_needed: "Se necesita un tipo.",
  rate_retry: "Reintentar",
  converts_to: "es decir",
  invalid_exchange_rate: "Este tipo no es utilizable.",
  exchange_rate_unavailable: "No se encontró ningún tipo para estas monedas.",
  paid_by: "Pagado por",
  date: "Fecha",
  category: "Categoría",
  no_category: "Sin categoría",
  split: "Reparto",
  edit_split: "Modificar",
  done: "Hecho",
  add_description: "Añadir una descripción",
  split_needs_amount: "Introduce un importe para ver el reparto.",
  description_placeholder: "Opcional",
  split_total: "Total repartido",
  apply_rule: "Aplicar la regla de",
  group_rule: "del proyecto",
  shares_mismatch: "El total de las partes debe igualar el importe.",
  participants: "Participantes",
  members: "Miembros",
  member_name: "Nombre",
  remove_member: "Quitar del proyecto",
  restore_member: "Reactivar",
  confirm_remove: "¿Confirmar?",
  add: "Añadir",
  close: "Cerrar",
  ha_accounts: "Cuentas de Home Assistant",
  ha_accounts_hint: "Las cuentas marcadas participan en el proyecto y pueden abrirlo.",
  no_ha_accounts: "No se encontró ninguna cuenta.",
  admin_locked: "El administrador no puede irse. Cede el proyecto, o archívalo.",
  cannot_remove_admin: "El administrador no puede irse. Cede el proyecto, o archívalo.",
  make_admin: "Ceder el proyecto",
  confirm_make_admin: "¿Ceder el proyecto a esta persona? Vuelves a ser un miembro ordinario, y solo ella podrá cederlo o eliminarlo.",
  admin_needs_account: "Solo una persona con una cuenta de Home Assistant puede administrar un proyecto.",
  dashboard: "En el panel de control",
  dashboard_hint: "No. Home Assistant no aísla las entidades: todas las cuentas de la casa leerían los saldos de este proyecto, sean miembros o no.",
  dashboard_on: "Poner este proyecto en el panel de control",
  dashboard_on_hint: "Un sensor por miembro, y uno que dice si queda algo por saldar. Legibles por todas las cuentas de la casa — no solo por la gente de este proyecto.",
  permissions: "Lo que los miembros pueden hacer",
  permissions_hint: "Igual para todos en el proyecto. Tú y los administradores siempre estáis por encima.",
  perm_manage_members: "Gestionar los miembros",
  perm_manage_members_hint: "Añadir, quitar y renombrar personas. Nunca quién es administrador.",
  perm_manage_categories: "Gestionar las categorías",
  perm_manage_categories_hint: "Crear y modificar las categorías y sus reglas.",
  perm_manage_group: "Editar el proyecto",
  perm_manage_group_hint: "Renombrarlo, cambiar su regla por defecto, archivarlo.",
  perm_edit_others: "Modificar lo que no es suyo",
  perm_edit_others_hint: "Cambiar o eliminar un gasto que otra persona introdujo y pagó.",
  not_allowed: "El proyecto no te permite hacer esto.",
  archived_hint: "Este proyecto está archivado: ya no se le puede añadir nada.",
  guests: "Sin cuenta",
  guests_hint: "Cargan con gastos pero nunca inician sesión.",
  no_account: "Sin cuenta",
  role_admin: "Administrador",
  role_member: "Miembro",
  new_payment: "Registrar un reembolso / deuda",
  new_debt: "Anotar una deuda",
  kind_label: "¿De qué se trata?",
  kind_reimbursement: "Reembolso",
  kind_debt: "Deuda",
  debt_who_owes: "Quién debe",
  debt_to_whom: "A quién",
  a_debt: "Deuda",
  you: "Tú",
  edit_debt: "Editar la deuda",
  confirm_delete_debt: "¿Eliminar esta deuda? Deja de estar pendiente.",
  edit_payment: "Editar el reembolso",
  from_member: "De",
  to_member: "A",
  history: "Historial",
  group_history: "Historial del proyecto",
  no_history: "Nada registrado por ahora.",
  history_created: "añadió",
  history_updated: "modificó",
  history_deleted: "eliminó",
  history_restored: "restauró",
  restore_entry: "Restaurar",
  the_expense: "el gasto",
  the_payment: "el reembolso",
  the_group: "el proyecto",
  the_category: "la categoría",
  the_member: "el miembro",
  field_name: "Nombre",
  field_role: "Estatus",
  permissions_none: "nada",
  yes: "Sí",
  no: "No",
  someone: "Alguien",
  loading: "Cargando…",
  error_generic: "Se produjo un error.",
  group_not_found: "Este proyecto ya no existe.",
  group_archived: "Este proyecto está archivado.",
  member_not_found: "Este miembro ya no existe.",
  member_already_in_group: "Este miembro ya forma parte del proyecto.",
  category_not_found: "Esta categoría ya no existe.",
  expense_not_found: "Este gasto ya no existe.",
  invalid_expense: "Este gasto no es válido.",
  invalid_expense_shares: "El total de las partes no corresponde al importe.",
  invalid_split_rule: "Esta regla de reparto no es válida.",
  payment_not_found: "Este reembolso ya no existe.",
  invalid_payment: "Este reembolso no es válido.",
  currency_locked: "Este proyecto ya tiene gastos: su moneda ya no puede cambiar.",
  not_loaded: "La integración no está cargada.",
  unknown_error: "Se produjo un error."
}, Gr = {
  app_title: "Spese condivise",
  groups: "Progetti",
  no_groups: "Nessun progetto per ora. Creane uno per iniziare.",
  new_group: "Nuovo progetto",
  edit_group: "Modifica progetto",
  all_groups: "Tutti i progetti",
  more: "Altro",
  delete_group: "Elimina questo progetto",
  create_group: "Crea il progetto",
  group_name: "Nome del progetto",
  description: "Descrizione",
  currency: "Valuta",
  archived: "Archiviato",
  archive: "Archivia",
  restore: "Ripristina",
  delete: "Elimina",
  cancel: "Annulla",
  save: "Salva",
  create: "Crea",
  statistics: "Statistiche",
  period_all: "Tutto",
  total_spent: "Totale speso",
  your_share: "La tua parte",
  by_category: "Per categoria",
  by_month: "Per mese",
  by_member: "Per persona",
  paid_total: "Pagato",
  consumed: "Parte",
  stat_where: "Dove sono andati i soldi",
  stat_avg: "{amount} / spesa",
  stat_insight_half: "Più della metà è andata in {cat}.",
  stat_insight_mostly: "Soprattutto in {cat} ({pct}%).",
  stat_insight_peak: "Il picco è a {month}, con {amount}.",
  stat_owed: "Gli si deve {amount}",
  stat_owes: "Deve {amount}",
  stat_even: "In pareggio",
  current_balance: "Saldo attuale",
  must_receive: "deve ricevere",
  must_pay: "deve pagare",
  you_owe: "Devi",
  you_are_owed: "Ti devono",
  owes_you: "ti deve",
  you_are_settled: "Sei in pari.",
  detailed_balances: "Vedi i saldi dettagliati",
  no_activity: "Non è ancora successo niente.",
  search: "Cerca una spesa, una persona, un importo…",
  no_match: "Nessun risultato.",
  a_settlement: "Rimborso",
  see_all: "Vedi tutto",
  action_add_expense: "Aggiungi spesa",
  fab_hint: "Aggiungi una spesa — trascina per rimborsare",
  categories: "Categorie",
  no_categories: "Nessuna categoria. Una categoria porta una regola di ripartizione predefinita.",
  new_category: "Nuova categoria",
  default_category: "Categoria predefinita",
  default_category_hint: "Una nuova spesa si aprirà su questa. Una sola per progetto.",
  default_category_tag: "Predefinita",
  edit_category: "Modifica categoria",
  category_name: "Nome",
  color: "Colore",
  pick_color: "Cambia il colore",
  color_auto: "Automatico",
  color_auto_short: "AUTO",
  icon: "Icona",
  icon_hint: "Cerca per nome o per ciò che rappresenta, per esempio cart.",
  icon_search: "Cerca un'icona…",
  icon_list_failed: "Impossibile caricare l'elenco delle icone. Digita un nome mdi: a mano.",
  default_split: "Ripartizione predefinita",
  split_how: "Come dividere?",
  split_who_pays: "Chi paga cosa",
  split_untouched_hint: "Digita un importo per fissarlo. Il resto si divide.",
  split_reset: "Reimposta",
  split_over_amount: "Supera l'importo della spesa.",
  split_default: "Regola predefinita",
  split_default_example: "es. la categoria dice 60 / 40, quindi anche questa.",
  split_equal_example: "es. 90 € in tre: 30 € ciascuno.",
  split_exact_example: "es. Michel 12 €, André 14 €, il resto a chi ha pagato.",
  split_percent_example: "es. 60 / 40 — su 100 € è 60 e 40, su 30 € è 18 e 12.",
  split_partial_example: "es. 10 € divisi su 85 € di spesa: 5 € ciascuno, e i 75 € restanti a chi ha pagato.",
  split_custom_example: "es. 10 € divisi, poi 8 € per uno e 4 € per l'altro.",
  default_from_category: "Ciò che dice la categoria, o il progetto se non dice nulla.",
  default_from_group: "Ciò che dice il progetto per le spese senza categoria.",
  split_equal: "Parti uguali",
  split_exact: "Importi esatti",
  split_shared_lower: "divisi",
  rule_from_group: "Regola predefinita",
  no_category_rule: "Regola senza categoria",
  no_category_rule_hint: "Si applica a una spesa senza categoria, e a qualsiasi categoria che non ha una regola propria.",
  split_percent: "Percentuali",
  split_percent_hint: "La parte che ciascuno deve. Lascia vuoto per prendere una parte uguale di ciò che resta.",
  split_percent_total: "Totale",
  split_percent_over: "Più dell'intera spesa.",
  split_partial: "Dividere una parte",
  split_custom: "Personalizzato",
  split_custom_hint: "Tutto ciò che le regole sanno fare. Tenuto per i casi che le tre qui sopra non dicono.",
  split_shared_all: "Tutta la spesa",
  split_shared_all_hint: "Lascia vuoto per dividere tutto.",
  split_rest_between: "Ciò che resta è per",
  split_rest_between_hint: "Spunta chi lo prende. Un importo è esatto, un campo vuoto una parte uguale. Nessuno spuntato: chi ha pagato prende tutto.",
  split_equal_hint: "Diviso in parti uguali tra le persone spuntate.",
  split_exact_hint: "Ciò che ciascuno deve. Lascia vuoto per prendere una parte uguale di ciò che resta.",
  split_shared_amount: "Importo da dividere",
  split_shared_between: "Diviso tra",
  split_rest_for: "Il resto è per",
  split_rest_payer: "Chi ha pagato",
  split_the_rest_short: "il resto",
  rule_invalid: "Questa regola non può essere risolta.",
  balance_settled: "Tutto è saldato.",
  to: "a",
  settle_up: "Rimborsa",
  expenses: "Spese",
  no_expenses: "Nessuna spesa per ora.",
  new_expense: "Nuova spesa",
  edit_expense: "Modifica spesa",
  confirm_delete: "Confermare?",
  confirm_delete_expense: "Eliminare questa spesa? Le sue parti se ne vanno con lei. La cronologia la conserva, e può ripristinarla.",
  confirm_delete_payment: "Eliminare questo rimborso? Il debito che aveva saldato riappare.",
  expense_title: "Titolo",
  amount: "Importo",
  currency_label: "Valuta",
  rate_heading: "Tasso di cambio",
  rate_label: "Tasso",
  rate_of_day: "Tasso del",
  rate_stale: "Non il tasso di oggi — questo risale al",
  rate_manual: "Inserito a mano",
  rate_unavailable: "Impossibile recuperare il tasso. Inseriscine uno per continuare: servirà da riferimento.",
  rate_needed: "È necessario un tasso.",
  rate_retry: "Riprova",
  converts_to: "ovvero",
  invalid_exchange_rate: "Questo tasso è inutilizzabile.",
  exchange_rate_unavailable: "Nessun tasso trovato per queste valute.",
  paid_by: "Pagato da",
  date: "Data",
  category: "Categoria",
  no_category: "Senza categoria",
  split: "Ripartizione",
  edit_split: "Modifica",
  done: "Fatto",
  add_description: "Aggiungi una descrizione",
  split_needs_amount: "Inserisci un importo per vedere la ripartizione.",
  description_placeholder: "Facoltativo",
  split_total: "Totale ripartito",
  apply_rule: "Applica la regola di",
  group_rule: "del progetto",
  shares_mismatch: "Il totale delle parti deve corrispondere all'importo.",
  participants: "Partecipanti",
  members: "Membri",
  member_name: "Nome",
  remove_member: "Rimuovi dal progetto",
  restore_member: "Riattiva",
  confirm_remove: "Confermare?",
  add: "Aggiungi",
  close: "Chiudi",
  ha_accounts: "Account Home Assistant",
  ha_accounts_hint: "Gli account spuntati partecipano al progetto e possono aprirlo.",
  no_ha_accounts: "Nessun account trovato.",
  admin_locked: "L'amministratore non può andarsene. Cedi il progetto, o archivialo.",
  cannot_remove_admin: "L'amministratore non può andarsene. Cedi il progetto, o archivialo.",
  make_admin: "Cedi il progetto",
  confirm_make_admin: "Cedere il progetto a questa persona? Tornerai a essere un membro ordinario, e solo lei potrà cederlo o eliminarlo.",
  admin_needs_account: "Solo una persona con un account Home Assistant può amministrare un progetto.",
  dashboard: "Sulla dashboard",
  dashboard_hint: "No. Home Assistant non isola le entità: tutti gli account della casa leggerebbero i saldi di questo progetto, membri o no.",
  dashboard_on: "Metti questo progetto sulla dashboard",
  dashboard_on_hint: "Un sensore per membro, e uno che dice se resta ancora qualcosa da saldare. Leggibili da tutti gli account della casa — non solo dalle persone di questo progetto.",
  permissions: "Ciò che i membri possono fare",
  permissions_hint: "Uguale per tutti nel progetto. Tu e gli amministratori siete sempre al di sopra.",
  perm_manage_members: "Gestire i membri",
  perm_manage_members_hint: "Aggiungere, rimuovere e rinominare. Mai chi è amministratore.",
  perm_manage_categories: "Gestire le categorie",
  perm_manage_categories_hint: "Creare e modificare le categorie e le loro regole.",
  perm_manage_group: "Modificare il progetto",
  perm_manage_group_hint: "Rinominarlo, cambiare la sua regola predefinita, archiviarlo.",
  perm_edit_others: "Modificare ciò che non è loro",
  perm_edit_others_hint: "Cambiare o eliminare una spesa che un altro ha inserito e pagato.",
  not_allowed: "Il progetto non ti autorizza a farlo.",
  archived_hint: "Questo progetto è archiviato: non si può più aggiungere nulla.",
  guests: "Senza account",
  guests_hint: "Portano spese ma non accedono mai.",
  no_account: "Senza account",
  role_admin: "Amministratore",
  role_member: "Membro",
  new_payment: "Registra un rimborso / debito",
  new_debt: "Annota un debito",
  kind_label: "Di cosa si tratta?",
  kind_reimbursement: "Rimborso",
  kind_debt: "Debito",
  debt_who_owes: "Chi deve",
  debt_to_whom: "A chi",
  a_debt: "Debito",
  you: "Tu",
  edit_debt: "Modifica debito",
  confirm_delete_debt: "Eliminare questo debito? Cessa di essere dovuto.",
  edit_payment: "Modifica rimborso",
  from_member: "Da",
  to_member: "A",
  history: "Cronologia",
  group_history: "Cronologia del progetto",
  no_history: "Niente registrato per ora.",
  history_created: "ha aggiunto",
  history_updated: "ha modificato",
  history_deleted: "ha eliminato",
  history_restored: "ha ripristinato",
  restore_entry: "Ripristina",
  the_expense: "la spesa",
  the_payment: "il rimborso",
  the_group: "il progetto",
  the_category: "la categoria",
  the_member: "il membro",
  field_name: "Nome",
  field_role: "Stato",
  permissions_none: "niente",
  yes: "Sì",
  no: "No",
  someone: "Qualcuno",
  loading: "Caricamento…",
  error_generic: "Si è verificato un errore.",
  group_not_found: "Questo progetto non esiste più.",
  group_archived: "Questo progetto è archiviato.",
  member_not_found: "Questo membro non esiste più.",
  member_already_in_group: "Questo membro fa già parte del progetto.",
  category_not_found: "Questa categoria non esiste più.",
  expense_not_found: "Questa spesa non esiste più.",
  invalid_expense: "Questa spesa non è valida.",
  invalid_expense_shares: "Il totale delle parti non corrisponde all'importo.",
  invalid_split_rule: "Questa regola di ripartizione non è valida.",
  payment_not_found: "Questo rimborso non esiste più.",
  invalid_payment: "Questo rimborso non è valido.",
  currency_locked: "Questo progetto ha già delle spese: la sua valuta non può più cambiare.",
  not_loaded: "L'integrazione non è caricata.",
  unknown_error: "Si è verificato un errore."
}, Wr = {
  app_title: "Wspólne wydatki",
  groups: "Projekty",
  no_groups: "Jeszcze żadnego projektu. Utwórz jeden, aby zacząć.",
  new_group: "Nowy projekt",
  edit_group: "Edytuj projekt",
  all_groups: "Wszystkie projekty",
  more: "Więcej",
  delete_group: "Usuń ten projekt",
  create_group: "Utwórz projekt",
  group_name: "Nazwa projektu",
  description: "Opis",
  currency: "Waluta",
  archived: "Zarchiwizowany",
  archive: "Archiwizuj",
  restore: "Przywróć",
  delete: "Usuń",
  cancel: "Anuluj",
  save: "Zapisz",
  create: "Utwórz",
  statistics: "Statystyki",
  period_all: "Wszystko",
  total_spent: "Łącznie wydano",
  your_share: "Twoja część",
  by_category: "Wg kategorii",
  by_month: "Wg miesiąca",
  by_member: "Wg osoby",
  paid_total: "Zapłacone",
  consumed: "Część",
  stat_where: "Na co poszło",
  stat_avg: "{amount} / wydatek",
  stat_insight_half: "Ponad połowa poszła na {cat}.",
  stat_insight_mostly: "Głównie {cat} ({pct}%).",
  stat_insight_peak: "Szczyt w {month}, przy {amount}.",
  stat_owed: "Należy mu się {amount}",
  stat_owes: "Jest winien {amount}",
  stat_even: "Rozliczone",
  current_balance: "Bieżące saldo",
  must_receive: "ma dostać",
  must_pay: "jest winien",
  you_owe: "Jesteś winien",
  you_are_owed: "Należy ci się",
  owes_you: "jest ci winien",
  you_are_settled: "Jesteś rozliczony.",
  detailed_balances: "Zobacz szczegółowe salda",
  no_activity: "Jeszcze nic się nie wydarzyło.",
  search: "Szukaj wydatku, osoby, kwoty…",
  no_match: "Brak wyników.",
  a_settlement: "Zwrot",
  see_all: "Zobacz wszystko",
  action_add_expense: "Dodaj wydatek",
  fab_hint: "Dodaj wydatek — przeciągnij, aby zwrócić",
  categories: "Kategorie",
  no_categories: "Jeszcze żadnej kategorii. Kategoria niesie domyślną regułę podziału.",
  new_category: "Nowa kategoria",
  default_category: "Domyślna kategoria",
  default_category_hint: "Nowy wydatek otworzy się na tej. Jedna na projekt.",
  default_category_tag: "Domyślna",
  edit_category: "Edytuj kategorię",
  category_name: "Nazwa",
  color: "Kolor",
  pick_color: "Zmień kolor",
  color_auto: "Automatyczny",
  color_auto_short: "AUTO",
  icon: "Ikona",
  icon_hint: "Szukaj po nazwie lub po tym, co przedstawia, na przykład cart.",
  icon_search: "Szukaj ikony…",
  icon_list_failed: "Nie udało się wczytać listy ikon. Wpisz nazwę mdi: ręcznie.",
  default_split: "Domyślny podział",
  split_how: "Jak to podzielić?",
  split_who_pays: "Kto ile płaci",
  split_untouched_hint: "Wpisz kwotę, aby ją ustalić. Reszta dzieli to, co zostaje.",
  split_reset: "Resetuj",
  split_over_amount: "To przekracza kwotę wydatku.",
  split_default: "Domyślna reguła",
  split_default_example: "np. kategoria mówi 60 / 40, więc ta też.",
  split_equal_example: "np. 90 na trzech: po 30.",
  split_exact_example: "np. Michel 12, André 14, resztę bierze ten, kto zapłacił.",
  split_percent_example: "np. 60 / 40 — na 100 to 60 i 40, na 30 to 18 i 12.",
  split_partial_example: "np. 10 dzielone na zakupach za 85: po 5, a pozostałe 75 dla tego, kto zapłacił.",
  split_custom_example: "np. 10 dzielone, potem 8 dla jednego i 4 dla drugiego.",
  default_from_category: "To, co mówi kategoria, albo projekt, gdy ona nic nie mówi.",
  default_from_group: "To, co mówi projekt dla wydatków bez kategorii.",
  split_equal: "Równe części",
  split_exact: "Dokładne kwoty",
  split_shared_lower: "dzielone",
  rule_from_group: "Domyślna reguła",
  no_category_rule: "Reguła bez kategorii",
  no_category_rule_hint: "Dotyczy wydatku bez kategorii oraz każdej kategorii, która nie ma własnej reguły.",
  split_percent: "Procenty",
  split_percent_hint: "Jaką część każdy jest winien. Zostaw pole puste, by wziąć równą część tego, co zostaje.",
  split_percent_total: "Razem",
  split_percent_over: "Więcej niż cały wydatek.",
  split_partial: "Podziel część",
  split_custom: "Niestandardowy",
  split_custom_hint: "Wszystko, co potrafią reguły. Zachowane dla przypadków, których trzy powyższe nie wyrażą.",
  split_shared_all: "Cały wydatek",
  split_shared_all_hint: "Zostaw puste, by podzielić całość.",
  split_rest_between: "To, co zostaje, idzie do",
  split_rest_between_hint: "Zaznacz, kto to bierze. Kwota jest dokładna, puste pole to równa część. Nikt nie zaznaczony: wszystko bierze ten, kto zapłacił.",
  split_equal_hint: "Dzielone równo między zaznaczonych.",
  split_exact_hint: "Ile każdy jest winien. Zostaw pole puste, by wziąć równą część tego, co zostaje.",
  split_shared_amount: "Kwota do podziału",
  split_shared_between: "Dzielone między",
  split_rest_for: "Reszta idzie do",
  split_rest_payer: "Ten, kto zapłacił",
  split_the_rest_short: "reszta",
  rule_invalid: "Tej reguły nie da się rozwiązać.",
  balance_settled: "Wszystko rozliczone.",
  to: "do",
  settle_up: "Rozlicz się",
  expenses: "Wydatki",
  no_expenses: "Jeszcze żadnego wydatku.",
  new_expense: "Nowy wydatek",
  edit_expense: "Edytuj wydatek",
  confirm_delete: "Potwierdzić?",
  confirm_delete_expense: "Usunąć ten wydatek? Jego części znikają razem z nim. Historia go zachowuje i może przywrócić.",
  confirm_delete_payment: "Usunąć ten zwrot? Dług, który rozliczył, wraca.",
  expense_title: "Tytuł",
  amount: "Kwota",
  currency_label: "Waluta",
  rate_heading: "Kurs wymiany",
  rate_label: "Kurs",
  rate_of_day: "Kurs z",
  rate_stale: "To nie dzisiejszy kurs — ten pochodzi z",
  rate_manual: "Wpisany ręcznie",
  rate_unavailable: "Nie udało się pobrać kursu. Wpisz go, aby kontynuować: zostanie zachowany na następny raz.",
  rate_needed: "Potrzebny jest kurs.",
  rate_retry: "Spróbuj ponownie",
  converts_to: "czyli",
  invalid_exchange_rate: "Ten kurs jest nieużyteczny.",
  exchange_rate_unavailable: "Nie znaleziono kursu dla tych walut.",
  paid_by: "Zapłacone przez",
  date: "Data",
  category: "Kategoria",
  no_category: "Bez kategorii",
  split: "Podział",
  edit_split: "Zmień",
  done: "Gotowe",
  add_description: "Dodaj opis",
  split_needs_amount: "Wpisz kwotę, aby zobaczyć podział.",
  description_placeholder: "Opcjonalnie",
  split_total: "Suma podziału",
  apply_rule: "Zastosuj regułę",
  group_rule: "projektu",
  shares_mismatch: "Suma części musi równać się kwocie.",
  participants: "Uczestnicy",
  members: "Członkowie",
  member_name: "Imię",
  remove_member: "Usuń z projektu",
  restore_member: "Przywróć",
  confirm_remove: "Potwierdzić?",
  add: "Dodaj",
  close: "Zamknij",
  ha_accounts: "Konta Home Assistant",
  ha_accounts_hint: "Zaznaczone konta biorą udział w tym projekcie i mogą go otworzyć.",
  no_ha_accounts: "Nie znaleziono konta.",
  admin_locked: "Administrator nie może odejść. Najpierw przekaż projekt albo go zarchiwizuj.",
  cannot_remove_admin: "Administrator nie może odejść. Najpierw przekaż projekt albo go zarchiwizuj.",
  make_admin: "Przekaż projekt",
  confirm_make_admin: "Przekazać projekt tej osobie? Stajesz się zwykłym członkiem, a tylko ona będzie mogła go przekazać lub usunąć.",
  admin_needs_account: "Tylko osoba z kontem Home Assistant może zarządzać projektem.",
  dashboard: "Na pulpicie",
  dashboard_hint: "Wyłączone. Home Assistant nie oddziela encji: każde konto w domu odczytałoby salda tego projektu, członek czy nie.",
  dashboard_on: "Umieść ten projekt na pulpicie",
  dashboard_on_hint: "Jeden czujnik na członka i jeden mówiący, czy coś jest jeszcze do oddania. Widoczne dla każdego konta w domu — nie tylko dla osób z tego projektu.",
  permissions: "Co członkowie mogą robić",
  permissions_hint: "Takie same dla wszystkich w projekcie. Ty i administratorzy jesteście zawsze ponad nimi.",
  perm_manage_members: "Zarządzaj członkami",
  perm_manage_members_hint: "Dodawaj, usuwaj i zmieniaj nazwy osób. Nigdy tego, kto jest administratorem.",
  perm_manage_categories: "Zarządzaj kategoriami",
  perm_manage_categories_hint: "Twórz i zmieniaj kategorie oraz ich reguły.",
  perm_manage_group: "Edytuj projekt",
  perm_manage_group_hint: "Zmień jego nazwę, zmień domyślną regułę, zarchiwizuj go.",
  perm_edit_others: "Edytuj to, co nie jest ich",
  perm_edit_others_hint: "Zmieniaj lub usuwaj wydatek, który ktoś inny wprowadził i zapłacił.",
  not_allowed: "Projekt nie pozwala ci tego zrobić.",
  archived_hint: "Ten projekt jest zarchiwizowany: nie można nic do niego dodać.",
  guests: "Bez konta",
  guests_hint: "Noszą wydatki, ale nigdy się nie logują.",
  no_account: "Bez konta",
  role_admin: "Administrator",
  role_member: "Członek",
  new_payment: "Zapisz zwrot / dług",
  new_debt: "Zapisz dług",
  kind_label: "Co to jest?",
  kind_reimbursement: "Zwrot",
  kind_debt: "Dług",
  debt_who_owes: "Kto jest winien",
  debt_to_whom: "Komu",
  a_debt: "Dług",
  you: "Ty",
  edit_debt: "Edytuj dług",
  confirm_delete_debt: "Usunąć ten dług? Przestaje być należny.",
  edit_payment: "Edytuj zwrot",
  from_member: "Od",
  to_member: "Do",
  history: "Historia",
  group_history: "Historia projektu",
  no_history: "Jeszcze nic nie zapisano.",
  history_created: "dodał",
  history_updated: "zmienił",
  history_deleted: "usunął",
  history_restored: "przywrócił",
  restore_entry: "Przywróć",
  the_expense: "wydatek",
  the_payment: "zwrot",
  the_group: "projekt",
  the_category: "kategorię",
  the_member: "członka",
  field_name: "Nazwa",
  field_role: "Status",
  permissions_none: "nic",
  yes: "Tak",
  no: "Nie",
  someone: "Ktoś",
  loading: "Ładowanie…",
  error_generic: "Coś poszło nie tak.",
  group_not_found: "Ten projekt już nie istnieje.",
  group_archived: "Ten projekt jest zarchiwizowany.",
  member_not_found: "Ten członek już nie istnieje.",
  member_already_in_group: "Ten członek już jest w projekcie.",
  category_not_found: "Ta kategoria już nie istnieje.",
  expense_not_found: "Ten wydatek już nie istnieje.",
  invalid_expense: "Ten wydatek jest nieprawidłowy.",
  invalid_expense_shares: "Części nie sumują się do kwoty.",
  invalid_split_rule: "Ta reguła podziału jest nieprawidłowa.",
  payment_not_found: "Ten zwrot już nie istnieje.",
  invalid_payment: "Ten zwrot jest nieprawidłowy.",
  currency_locked: "Ten projekt ma już wydatki, więc jego waluty nie można już zmienić.",
  not_loaded: "Integracja nie jest wczytana.",
  unknown_error: "Coś poszło nie tak."
}, Kr = {
  app_title: "Despesas compartilhadas",
  groups: "Projetos",
  no_groups: "Nenhum projeto ainda. Crie um para começar.",
  new_group: "Novo projeto",
  edit_group: "Editar projeto",
  all_groups: "Todos os projetos",
  more: "Mais",
  delete_group: "Excluir este projeto",
  create_group: "Criar projeto",
  group_name: "Nome do projeto",
  description: "Descrição",
  currency: "Moeda",
  archived: "Arquivado",
  archive: "Arquivar",
  restore: "Restaurar",
  delete: "Excluir",
  cancel: "Cancelar",
  save: "Salvar",
  create: "Criar",
  statistics: "Estatísticas",
  period_all: "Tudo",
  total_spent: "Total gasto",
  your_share: "Sua parte",
  by_category: "Por categoria",
  by_month: "Por mês",
  by_member: "Por pessoa",
  paid_total: "Pago",
  consumed: "Parte",
  stat_where: "Para onde foi o dinheiro",
  stat_avg: "{amount} / desp.",
  stat_insight_half: "Mais da metade foi para {cat}.",
  stat_insight_mostly: "Principalmente {cat} ({pct}%).",
  stat_insight_peak: "Pico em {month}, em {amount}.",
  stat_owed: "Devem-lhe {amount}",
  stat_owes: "Deve {amount}",
  stat_even: "Em equilíbrio",
  current_balance: "Saldo atual",
  must_receive: "deve receber",
  must_pay: "deve pagar",
  you_owe: "Você deve",
  you_are_owed: "Devem a você",
  owes_you: "deve a você",
  you_are_settled: "Você está em dia.",
  detailed_balances: "Ver saldos detalhados",
  no_activity: "Nada aconteceu ainda.",
  search: "Buscar uma despesa, uma pessoa, um valor…",
  no_match: "Nenhum resultado.",
  a_settlement: "Reembolso",
  see_all: "Ver tudo",
  action_add_expense: "Adicionar despesa",
  fab_hint: "Adicionar uma despesa — arraste para reembolsar",
  categories: "Categorias",
  no_categories: "Nenhuma categoria ainda. Uma categoria carrega uma regra de divisão padrão.",
  new_category: "Nova categoria",
  default_category: "Categoria padrão",
  default_category_hint: "Uma nova despesa abre nesta. Uma por projeto.",
  default_category_tag: "Padrão",
  edit_category: "Editar categoria",
  category_name: "Nome",
  color: "Cor",
  pick_color: "Mudar a cor",
  color_auto: "Automática",
  color_auto_short: "AUTO",
  icon: "Ícone",
  icon_hint: "Busque pelo nome ou pelo que representa, por exemplo cart.",
  icon_search: "Buscar um ícone…",
  icon_list_failed: "A lista de ícones não pôde ser carregada. Digite um nome mdi: à mão.",
  default_split: "Divisão padrão",
  split_how: "Como dividir?",
  split_who_pays: "Quem paga o quê",
  split_untouched_hint: "Digite sobre um valor para fixá-lo. O restante divide o que sobra.",
  split_reset: "Redefinir",
  split_over_amount: "Isso ultrapassa o valor da despesa.",
  split_default: "Regra padrão",
  split_default_example: "ex. a categoria diz 60 / 40, então esta também.",
  split_equal_example: "ex. 90 entre três: 30 cada.",
  split_exact_example: "ex. Michel 12, André 14, quem pagou fica com o resto.",
  split_percent_example: "ex. 60 / 40 — sobre 100 é 60 e 40, sobre 30 é 18 e 12.",
  split_partial_example: "ex. 10 divididos numa compra de 85: 5 cada, e os outros 75 para quem pagou.",
  split_custom_example: "ex. 10 divididos, depois 8 para um e 4 para o outro.",
  default_from_category: "O que a categoria diz, ou o projeto quando ela não diz nada.",
  default_from_group: "O que o projeto diz para despesas sem categoria.",
  split_equal: "Partes iguais",
  split_exact: "Valores exatos",
  split_shared_lower: "divididos",
  rule_from_group: "Regra padrão",
  no_category_rule: "Regra sem categoria",
  no_category_rule_hint: "Aplica-se a uma despesa sem categoria, e a qualquer categoria que não tenha regra própria.",
  split_percent: "Porcentagens",
  split_percent_hint: "A parte que cada um deve. Deixe vazio para pegar uma parte igual do que sobra.",
  split_percent_total: "Total",
  split_percent_over: "Mais que a despesa inteira.",
  split_partial: "Dividir uma parte",
  split_custom: "Personalizado",
  split_custom_hint: "Tudo o que as regras sabem fazer. Guardado para os casos que as três acima não dizem.",
  split_shared_all: "A despesa inteira",
  split_shared_all_hint: "Deixe vazio para dividir tudo.",
  split_rest_between: "O que sobra vai para",
  split_rest_between_hint: "Marque quem fica com isso. Um valor é exato, um campo vazio uma parte igual. Ninguém marcado: quem pagou fica com tudo.",
  split_equal_hint: "Dividido em partes iguais entre os marcados.",
  split_exact_hint: "O que cada um deve. Deixe vazio para pegar uma parte igual do que sobra.",
  split_shared_amount: "Valor a dividir",
  split_shared_between: "Dividido entre",
  split_rest_for: "O resto vai para",
  split_rest_payer: "Quem pagou",
  split_the_rest_short: "o resto",
  rule_invalid: "Esta regra não pode ser resolvida.",
  balance_settled: "Está tudo acertado.",
  to: "para",
  settle_up: "Acertar contas",
  expenses: "Despesas",
  no_expenses: "Nenhuma despesa ainda.",
  new_expense: "Nova despesa",
  edit_expense: "Editar despesa",
  confirm_delete: "Confirmar?",
  confirm_delete_expense: "Excluir esta despesa? Suas partes vão junto. O histórico a guarda, e pode trazê-la de volta.",
  confirm_delete_payment: "Excluir este reembolso? A dívida que ele quitou reaparece.",
  expense_title: "Título",
  amount: "Valor",
  currency_label: "Moeda",
  rate_heading: "Taxa de câmbio",
  rate_label: "Taxa",
  rate_of_day: "Taxa de",
  rate_stale: "Não é a taxa de hoje — esta é de",
  rate_manual: "Digitada à mão",
  rate_unavailable: "A taxa não pôde ser obtida. Digite uma para continuar: ela será guardada para a próxima vez.",
  rate_needed: "Uma taxa é necessária.",
  rate_retry: "Tentar de novo",
  converts_to: "equivale a",
  invalid_exchange_rate: "Esta taxa não é utilizável.",
  exchange_rate_unavailable: "Nenhuma taxa encontrada para essas moedas.",
  paid_by: "Pago por",
  date: "Data",
  category: "Categoria",
  no_category: "Sem categoria",
  split: "Divisão",
  edit_split: "Alterar",
  done: "Concluído",
  add_description: "Adicionar uma descrição",
  split_needs_amount: "Informe um valor para ver a divisão.",
  description_placeholder: "Opcional",
  split_total: "Total dividido",
  apply_rule: "Aplicar a regra de",
  group_rule: "do projeto",
  shares_mismatch: "O total das partes deve ser igual ao valor.",
  participants: "Participantes",
  members: "Membros",
  member_name: "Nome",
  remove_member: "Remover do projeto",
  restore_member: "Trazer de volta",
  confirm_remove: "Confirmar?",
  add: "Adicionar",
  close: "Fechar",
  ha_accounts: "Contas Home Assistant",
  ha_accounts_hint: "As contas marcadas participam deste projeto e podem abri-lo.",
  no_ha_accounts: "Nenhuma conta encontrada.",
  admin_locked: "O administrador não pode sair. Passe o projeto adiante primeiro, ou arquive-o.",
  cannot_remove_admin: "O administrador não pode sair. Passe o projeto adiante primeiro, ou arquive-o.",
  make_admin: "Passar o projeto adiante",
  confirm_make_admin: "Passar o projeto para esta pessoa? Você se torna um membro comum, e só ela poderá passá-lo adiante ou excluí-lo.",
  admin_needs_account: "Só alguém com uma conta Home Assistant pode administrar um projeto.",
  dashboard: "No painel de controle",
  dashboard_hint: "Não. O Home Assistant não isola as entidades: toda conta da casa leria os saldos deste projeto, sendo membro ou não.",
  dashboard_on: "Colocar este projeto no painel de controle",
  dashboard_on_hint: "Um sensor por membro, e um que diz se ainda há algo devido. Legível por toda conta da casa — não só pelas pessoas deste projeto.",
  permissions: "O que os membros podem fazer",
  permissions_hint: "O mesmo para todo mundo no projeto. Você e os administradores estão sempre acima disso.",
  perm_manage_members: "Gerenciar membros",
  perm_manage_members_hint: "Adicionar, remover e renomear pessoas. Nunca quem é administrador.",
  perm_manage_categories: "Gerenciar categorias",
  perm_manage_categories_hint: "Criar e alterar as categorias e suas regras.",
  perm_manage_group: "Editar o projeto",
  perm_manage_group_hint: "Renomeá-lo, mudar sua regra padrão, arquivá-lo.",
  perm_edit_others: "Editar o que não é seu",
  perm_edit_others_hint: "Alterar ou excluir uma despesa que outra pessoa lançou e pagou.",
  not_allowed: "O projeto não permite que você faça isso.",
  archived_hint: "Este projeto está arquivado: nada novo pode ser adicionado a ele.",
  guests: "Sem conta",
  guests_hint: "Carregam despesas mas nunca fazem login.",
  no_account: "Sem conta",
  role_admin: "Administrador",
  role_member: "Membro",
  new_payment: "Registrar um reembolso / dívida",
  new_debt: "Anotar uma dívida",
  kind_label: "Do que se trata?",
  kind_reimbursement: "Reembolso",
  kind_debt: "Dívida",
  debt_who_owes: "Quem deve",
  debt_to_whom: "Deve a",
  a_debt: "Dívida",
  you: "Você",
  edit_debt: "Editar dívida",
  confirm_delete_debt: "Excluir esta dívida? Ela deixa de ser devida.",
  edit_payment: "Editar reembolso",
  from_member: "De",
  to_member: "Para",
  history: "Histórico",
  group_history: "Histórico do projeto",
  no_history: "Nada registrado ainda.",
  history_created: "adicionou",
  history_updated: "alterou",
  history_deleted: "excluiu",
  history_restored: "restaurou",
  restore_entry: "Restaurar",
  the_expense: "a despesa",
  the_payment: "o reembolso",
  the_group: "o projeto",
  the_category: "a categoria",
  the_member: "o membro",
  field_name: "Nome",
  field_role: "Situação",
  permissions_none: "nada",
  yes: "Sim",
  no: "Não",
  someone: "Alguém",
  loading: "Carregando…",
  error_generic: "Algo deu errado.",
  group_not_found: "Este projeto não existe mais.",
  group_archived: "Este projeto está arquivado.",
  member_not_found: "Este membro não existe mais.",
  member_already_in_group: "Este membro já faz parte do projeto.",
  category_not_found: "Esta categoria não existe mais.",
  expense_not_found: "Esta despesa não existe mais.",
  invalid_expense: "Esta despesa é inválida.",
  invalid_expense_shares: "O total das partes não corresponde ao valor.",
  invalid_split_rule: "Esta regra de divisão é inválida.",
  payment_not_found: "Este reembolso não existe mais.",
  invalid_payment: "Este reembolso é inválido.",
  currency_locked: "Este projeto já tem despesas: sua moeda não pode mais mudar.",
  not_loaded: "A integração não está carregada.",
  unknown_error: "Algo deu errado."
}, Fr = {
  en: Ve,
  fr: Ur,
  de: Br,
  nl: Hr,
  es: Lr,
  it: Gr,
  pl: Wr,
  // Registered under "pt": the localizer strips the region, so pt-BR and
  // pt-PT both land here. Brazilian, the larger Home Assistant community.
  pt: Kr
};
function Zt(e) {
  const t = Fr[e.split("-")[0]] ?? Ve;
  return (r) => t[r] ?? Ve[r] ?? r;
}
function v(e, t) {
  const r = e?.code;
  return r && r in Ve ? t(r) : e?.message || t("error_generic");
}
const E = x`
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
`, Vr = [
  "manage_members",
  "manage_categories",
  "manage_group",
  "edit_others"
];
var Zr = Object.defineProperty, Jr = Object.getOwnPropertyDescriptor, X = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Jr(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Zr(t, r, a), a;
};
let B = class extends g {
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
        this.error = v(t, this.localize);
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
          ${this.error ? o`<div class="error">${this.error}</div>` : c}
          <se-field
            .label=${e("group_name")}
            .value=${this.name}
            required
            placeholder="Appartement"
            @value-changed=${(r) => this.name = r.detail.value}
          ></se-field>
          <se-field
            .label=${e("description")}
            .value=${this.description}
            @value-changed=${(r) => this.description = r.detail.value}
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
                .options=${mt.map((r) => ({ value: r, label: r }))}
                @value-changed=${(r) => this.currency = r.detail.value}
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
      return c;
    const e = this.localize;
    return o`
      <div class="section">
        <h3>${e("permissions")}</h3>
        <div class="muted">${e("permissions_hint")}</div>

        ${Vr.map(
      (t) => o`
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.permissions.has(t)}
                @change=${(r) => this.toggle(t, r)}
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
      return c;
    const e = this.localize;
    return o`
      <div class="section">
        <h3>${e("dashboard")}</h3>

        <label class="switch">
          <input
            type="checkbox"
            .checked=${Ft(this.exposed)}
            @change=${(t) => this.exposed = t.target.checked}
          />
          <span class="body">
            <span class="title">${e("dashboard_on")}</span>
            <span class="hint">${e("dashboard_on_hint")}</span>
          </span>
        </label>

        ${this.exposed ? c : o`<div class="muted">${e("dashboard_hint")}</div>`}
      </div>
    `;
  }
  toggle(e, t) {
    const r = new Set(this.permissions);
    t.target.checked ? r.add(e) : r.delete(e), this.permissions = r;
  }
};
B.styles = [
  E,
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
X([
  l({ attribute: !1 })
], B.prototype, "api", 2);
X([
  l({ attribute: !1 })
], B.prototype, "localize", 2);
X([
  l({ attribute: !1 })
], B.prototype, "group", 2);
X([
  l({ attribute: !1 })
], B.prototype, "role", 2);
X([
  d()
], B.prototype, "name", 2);
X([
  d()
], B.prototype, "description", 2);
X([
  d()
], B.prototype, "currency", 2);
X([
  d()
], B.prototype, "permissions", 2);
X([
  d()
], B.prototype, "exposed", 2);
X([
  d()
], B.prototype, "busy", 2);
X([
  d()
], B.prototype, "error", 2);
B = X([
  f("se-group-dialog")
], B);
var Qr = Object.defineProperty, Yr = Object.getOwnPropertyDescriptor, he = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Yr(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Qr(t, r, a), a;
};
let re = class extends g {
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
          ${this.error ? o`<div class="error">${this.error}</div>` : c}

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
          ` : c}
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
          ${e.description ? o`<div class="muted">${e.description}</div>` : c}
        </div>
        ${e.archived ? o`<span class="archived-tag">${this.localize("archived")}</span>` : c}
        <span class="chevron">›</span>
      </button>
    `;
  }
  async load() {
    this.loading = !0, this.error = void 0;
    try {
      this.groups = await this.api.listGroups();
    } catch (e) {
      this.error = v(e, this.localize);
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
re.styles = [
  E,
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
he([
  l({ attribute: !1 })
], re.prototype, "api", 2);
he([
  l({ attribute: !1 })
], re.prototype, "hass", 2);
he([
  l({ type: Boolean })
], re.prototype, "narrow", 2);
he([
  l({ attribute: !1 })
], re.prototype, "localize", 2);
he([
  d()
], re.prototype, "groups", 2);
he([
  d()
], re.prototype, "loading", 2);
he([
  d()
], re.prototype, "error", 2);
he([
  d()
], re.prototype, "dialogOpen", 2);
re = he([
  f("se-dashboard-page")
], re);
function T(e, t, r) {
  return new Intl.NumberFormat(r, {
    style: "currency",
    currency: t
  }).format(e / 100);
}
function Ct(e, t, r) {
  const i = T(e, t, r), a = (e / 100).toFixed(2);
  return [
    i,
    // The same, spelled with the space bar rather than with Intl's own.
    i.replace(/\s/gu, " "),
    a,
    a.replace(".", ",")
  ];
}
function xe(e) {
  const t = e.trim().replace(",", ".").replace(/\s/g, "");
  if (t === "" || !/^-?\d*\.?\d*$/.test(t))
    return null;
  const r = Number(t);
  return Number.isNaN(r) ? null : Math.round(r * 100);
}
function Re(e, t) {
  const r = new Intl.DateTimeFormat(t, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(e));
  return r.charAt(0).toUpperCase() + r.slice(1);
}
function Et(e, t) {
  const [r, i] = e.split("-").map(Number), a = new Intl.DateTimeFormat(t, {
    month: "short",
    year: "numeric"
  }).format(new Date(r, i - 1, 1));
  return a.charAt(0).toUpperCase() + a.slice(1);
}
function Jt() {
  const e = /* @__PURE__ */ new Date(), t = `${e.getMonth() + 1}`.padStart(2, "0"), r = `${e.getDate()}`.padStart(2, "0");
  return `${e.getFullYear()}-${t}-${r}`;
}
function Qt(e) {
  return (/* @__PURE__ */ new Date(`${e}T12:00:00`)).toISOString();
}
function Yt(e) {
  const t = new Date(e), r = `${t.getMonth() + 1}`.padStart(2, "0"), i = `${t.getDate()}`.padStart(2, "0");
  return `${t.getFullYear()}-${r}-${i}`;
}
function rt(e) {
  return (e / 100).toFixed(2);
}
function Xr(e) {
  return e.trim().split(/\s+/)[0] || e;
}
function Z(e) {
  const t = e.trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
const it = [
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
function I(e) {
  let t = 0;
  for (let r = 0; r < e.length; r += 1)
    t = t * 31 + e.charCodeAt(r) >>> 0;
  return it[t % it.length];
}
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, be = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? ti(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && ei(t, r, a), a;
};
let le = class extends g {
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
    ), r = this.settlements.filter((i) => !t.includes(i));
    return o`
      ${t.length === 0 ? o`<div class="settled muted">${this.localize("you_are_settled")}</div>` : t.map((i) => this.renderMine(i))}
      ${r.length === 0 ? c : o`
            <div class="others">
              ${r.map((i) => this.renderTransfer(i))}
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
    const t = this.localize, r = e.from_member_id === this.meId, i = r ? e.to_member_id : e.from_member_id, a = this.memberById(i), s = a?.name ?? "?", n = o`
      <strong class=${`figure ${r ? "negative" : "positive"}`}>
        ${T(e.amount, this.currency, this.language)}
      </strong>
    `;
    return o`
      <button
        class="mine line-button"
        title=${t("settle_up")}
        @click=${() => this.settle(e)}
      >
        <div class="avatar" style=${`background:${a?.color ?? I(i)}`}>
          ${Z(s)}
        </div>
        <div class="sentence">
          ${r ? o`${t("you_owe")} ${n} ${t("to")} ${s}` : o`${s} ${t("owes_you")} ${n}`}
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
          ${T(e.amount, this.currency, this.language)}
        </span>
      </button>
    `;
  }
  renderParty(e) {
    const t = this.memberById(e), r = t?.name ?? "?";
    return o`
      <span class="party" title=${r}>
        <span
          class="avatar"
          style=${`background:${t?.color ?? I(e)}`}
          >${Z(r)}</span
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
  renderDuel(e) {
    const t = e.find((s) => s.member_id === this.meId), [r, i] = t ? [t, e.find((s) => s !== t)] : [...e].sort((s, n) => n.amount - s.amount), a = this.settlements[0];
    return o`
      <button
        class="duel line-button"
        title=${this.localize("settle_up")}
        ?disabled=${a === void 0}
        @click=${() => a && this.settle(a)}
      >
        ${this.renderSide(r, !1)}
        <div class="swap">⇄</div>
        ${this.renderSide(i, !0)}
      </button>
    `;
  }
  renderSide(e, t) {
    const r = this.memberById(e.member_id), i = e.amount > 0, a = i ? "positive" : "negative", s = o`
      <div class="avatar" style=${`background:${r?.color ?? I(e.member_id)}`}>
        ${Z(r?.name ?? "?")}
      </div>
    `, n = T(Math.abs(e.amount), this.currency, this.language), p = o`
      <div class="body">
        <div class="name">${r?.name ?? "?"}</div>
        <div class=${`verdict ${a}`}>${this.verdict(e, i)}</div>
        <div class=${`figure ${a}`} style=${`--chars:${n.length}`}>${n}</div>
      </div>
    `;
    return o`
      <div class=${`side ${t ? "right" : ""}`}>
        ${t ? c : s}${p}${t ? s : c}
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
    const r = this.localize;
    return e.member_id === this.meId ? r(t ? "you_are_owed" : "you_owe") : r(t ? "must_receive" : "must_pay");
  }
  renderRow(e) {
    const t = this.memberById(e.member_id), r = e.amount > 0, i = r ? "positive" : "negative";
    return o`
      <div class="row">
        <div class="avatar" style=${`background:${t?.color ?? I(e.member_id)}`}>
          ${Z(t?.name ?? "?")}
        </div>
        <span class="name">${t?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${i}`}>
            ${r ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${i}`}>
            ${T(Math.abs(e.amount), this.currency, this.language)}
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
  E,
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
  f("se-balance-card")
], le);
var ri = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, Pe = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? ii(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && ri(t, r, a), a;
};
let ye = class extends g {
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
Pe([
  l({ type: String })
], ye.prototype, "icon", 2);
Pe([
  l({ type: String })
], ye.prototype, "fallback", 2);
Pe([
  l({ type: String })
], ye.prototype, "color", 2);
Pe([
  l({ type: Number })
], ye.prototype, "size", 2);
Pe([
  l({ type: Boolean })
], ye.prototype, "plain", 2);
ye = Pe([
  f("se-icon")
], ye);
var ai = Object.defineProperty, si = Object.getOwnPropertyDescriptor, Ue = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? si(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && ai(t, r, a), a;
};
let ke = class extends g {
  constructor() {
    super(...arguments), this.label = "", this.value = null, this.fallback = "#5c6b8a";
  }
  render() {
    const e = this.localize;
    return o`
      ${this.label ? o`<label>${this.label}</label>` : c}

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

        ${it.map(
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
  E,
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
Ue([
  l({ attribute: !1 })
], ke.prototype, "localize", 2);
Ue([
  l({ type: String })
], ke.prototype, "label", 2);
Ue([
  l({ type: String })
], ke.prototype, "value", 2);
Ue([
  l({ type: String })
], ke.prototype, "fallback", 2);
ke = Ue([
  f("se-color-picker")
], ke);
var oi = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, ue = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? ni(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && oi(t, r, a), a;
};
const Pt = "/static/mdi/iconList.json", et = 48;
let Le = null;
function li() {
  return Le === null && (Le = fetch(Pt).then((e) => {
    if (!e.ok)
      throw new Error(`${e.status} on ${Pt}`);
    return e.json();
  }).catch((e) => {
    throw Le = null, e;
  })), Le;
}
let ie = class extends g {
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
      ${this.label ? o`<label>${this.label}</label>` : c}

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
        ${this.value ? o`<button class="clear" @click=${this.clear} aria-label="×">×</button>` : c}
      </div>

      ${this.renderHint()} ${this.open ? this.renderGrid() : c}
    `;
  }
  renderHint() {
    return this.failed ? o`<div class="hint">${this.localize("icon_list_failed")}</div>` : o`<div class="hint">${this.localize("icon_hint")}</div>`;
  }
  renderGrid() {
    return this.suggestions.length === 0 ? c : o`
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
        this.icons = await li();
      } catch {
        this.failed = !0;
      }
  }
  /** Rank exact prefixes first, then any substring, then keyword matches. */
  search(e) {
    const t = e.trim().toLowerCase();
    if (t === "") {
      this.suggestions = this.icons.slice(0, et);
      return;
    }
    const r = [], i = [], a = [];
    for (const s of this.icons)
      if (s.name.startsWith(t) ? r.push(s) : s.name.includes(t) ? i.push(s) : s.keywords?.some((n) => n.includes(t)) && a.push(s), r.length >= et)
        break;
    this.suggestions = [...r, ...i, ...a].slice(0, et);
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
  E,
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
  d()
], ie.prototype, "icons", 2);
ue([
  d()
], ie.prototype, "suggestions", 2);
ue([
  d()
], ie.prototype, "open", 2);
ue([
  d()
], ie.prototype, "failed", 2);
ie = ue([
  f("se-icon-picker")
], ie);
function Xt(e) {
  const { amount: t, payerId: r, memberIds: i } = e;
  if (!Number.isInteger(t) || t <= 0)
    return null;
  const a = [...new Set(i)];
  if (a.length === 0 || !a.includes(r))
    return null;
  const s = e.rule ?? {}, n = di(s, t);
  if (n === null)
    return null;
  const p = s.participants == null ? a : [...new Set(s.participants)];
  if (p.some((S) => !a.includes(S)))
    return null;
  const h = p.length === 0 ? 0 : n, y = at(h, p), z = t - h;
  if (z > 0) {
    const S = ci(s.remainder, z, r, a);
    if (S === null)
      return null;
    for (const [C, He] of Object.entries(S))
      y[C] = (y[C] ?? 0) + He;
  }
  const u = {};
  for (const [S, C] of Object.entries(y))
    C !== 0 && (u[S] = C);
  return Object.values(u).reduce((S, C) => S + C, 0) === t ? u : null;
}
function di(e, t) {
  return e.envelope == null ? t : e.envelope < 0 ? null : Math.min(e.envelope, t);
}
const tt = 1e4;
function ci(e, t, r, i) {
  const a = e ?? {}, s = a.fixed ?? {}, n = a.percent ?? {};
  for (const [m, M] of Object.entries(s))
    if (!i.includes(m) || M < 0)
      return null;
  for (const [m, M] of Object.entries(n))
    if (!i.includes(m) || M < 0)
      return null;
  const p = a.members == null ? [r] : [...new Set(a.members)];
  if (p.length === 0 || p.some((m) => !i.includes(m)))
    return null;
  const h = {}, y = {};
  for (const m of p)
    m in s && (h[m] = s[m]), m in n && (y[m] = n[m]);
  if (Object.keys(h).some((m) => m in y))
    return null;
  const z = Object.values(y).reduce((m, M) => m + M, 0);
  if (z > tt)
    return null;
  const u = {};
  for (const [m, M] of Object.entries(y))
    u[m] = Math.floor(t * M / tt);
  const S = Object.values(h).reduce((m, M) => m + M, 0) + Object.values(u).reduce((m, M) => m + M, 0);
  if (S > t)
    return null;
  const C = { ...h, ...u }, He = p.filter(
    (m) => !(m in h) && !(m in y)
  ), Ye = t - S;
  if (He.length > 0) {
    for (const [m, M] of Object.entries(at(Ye, He)))
      C[m] = (C[m] ?? 0) + M;
    return C;
  }
  if (Ye === 0)
    return C;
  if (z === tt && Object.keys(y).length > 0) {
    for (const [m, M] of Object.entries(
      at(Ye, Object.keys(u))
    ))
      C[m] = (C[m] ?? 0) + M;
    return C;
  }
  return null;
}
function at(e, t) {
  if (e <= 0 || t.length === 0)
    return {};
  const r = Math.floor(e / t.length), i = e % t.length, a = {};
  return t.forEach((s, n) => {
    a[s] = r + (n < i ? 1 : 0);
  }), a;
}
const Dt = 1e4;
function gt(e) {
  if (e === null)
    return "default";
  const t = Object.keys(e.remainder?.percent ?? {}), r = Object.keys(e.remainder?.fixed ?? {});
  if (t.length > 0 && r.length > 0)
    return "custom";
  if (e.envelope === 0)
    return "exact";
  if (t.length > 0)
    return "custom";
  const i = e.remainder?.members ?? [], a = Object.keys(e.remainder?.fixed ?? {});
  return e.envelope == null && i.length === 0 && a.length === 0 ? "equal" : i.length <= 1 && a.length === 0 ? "partial" : "custom";
}
function pi(e, t) {
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
      remainder: t.unit === "percent" ? { members: [...t.participants], percent: Ot(t) } : { members: [...t.participants], fixed: Tt(t) }
    };
  const r = t.envelopeInput.trim() === "" ? null : xe(t.envelopeInput.trim()), i = t.participants.size === t.memberIds.length ? null : [...t.participants];
  return e === "custom" ? {
    envelope: r,
    participants: i,
    remainder: {
      // Nobody ticked: whoever paid takes it, which the model says with null.
      members: t.takers.size === 0 ? null : [...t.takers],
      fixed: Tt(t, t.takers),
      // Written back untouched. The panel offers no way to type a share here
      // — the `percent` mode is where that lives — but a rule that arrived
      // with some keeps them: dropping what an editor cannot show is how a
      // save quietly rewrites what people owe.
      percent: Ot(t, t.takers)
    }
  } : {
    envelope: r,
    participants: i,
    // Nobody named: whoever paid takes it, which the model says with null.
    remainder: { members: t.restTo ? [t.restTo] : null, fixed: {} }
  };
}
function hi(e, t, r) {
  const i = gt(e), a = e?.remainder?.members ?? (r ? [r] : []);
  return {
    participants: i === "exact" ? new Set(a) : new Set(e?.participants ?? t),
    takers: new Set(a),
    envelopeInput: e?.envelope != null ? It(e.envelope) : "",
    amounts: Object.fromEntries(
      Object.entries(e?.remainder?.fixed ?? {}).map(([n, p]) => [
        n,
        It(p)
      ])
    ),
    percents: Object.fromEntries(
      Object.entries(e?.remainder?.percent ?? {}).map(([n, p]) => [
        n,
        ui(p)
      ])
    ),
    // One taker is a person to name. Several is a shape this editor has no room
    // for, so the rest falls back to whoever paid — as `partial` reads it.
    restTo: i === "partial" && e?.remainder?.members?.length === 1 ? e.remainder.members[0] : r ?? "",
    // Whichever the rule was written in. A rule with neither is an equal split
    // dressed as `exact`, and money is the one to offer first.
    unit: Object.keys(e?.remainder?.percent ?? {}).length > 0 ? "percent" : "money",
    memberIds: t
  };
}
function Tt(e, t = e.participants) {
  const r = {};
  for (const [i, a] of Object.entries(e.amounts)) {
    if (!t.has(i) || a.trim() === "")
      continue;
    const s = xe(a);
    s !== null && (r[i] = s);
  }
  return r;
}
function Ot(e, t = e.participants) {
  const r = {};
  for (const [i, a] of Object.entries(e.percents)) {
    if (!t.has(i) || a.trim() === "")
      continue;
    const s = er(a);
    s !== null && (r[i] = s);
  }
  return r;
}
function er(e) {
  const t = e.trim().replace(",", ".");
  if (t === "")
    return null;
  const r = Number(t);
  return Number.isFinite(r) ? Math.round(r * 100) : null;
}
function ui(e) {
  return e % 100 === 0 ? String(e / 100) : (e / 100).toFixed(2);
}
function It(e) {
  return (e / 100).toFixed(2);
}
var mi = Object.defineProperty, gi = Object.getOwnPropertyDescriptor, O = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? gi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && mi(t, r, a), a;
};
const _i = 8542, Nt = ["equal", "exact", "partial", "custom"];
let P = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.rule = null, this.currency = "EUR", this.language = "en", this.amount = null, this.payerId = null, this.mode = "equal", this.participants = /* @__PURE__ */ new Set(), this.envelopeInput = "", this.amounts = {}, this.percents = {}, this.unit = "money", this.restTo = "", this.takers = /* @__PURE__ */ new Set();
  }
  connectedCallback() {
    super.connectedCallback(), this.mode = gt(this.rule);
    const e = hi(
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
    return this.amount != null && this.amount > 0 ? this.amount : _i;
  }
  renderPanel() {
    const e = this.localize, t = this.shares();
    return o`
      <div class="panel">
        <se-select
          .label=${e("split_how")}
          .value=${this.mode}
          .options=${this.offered().map((r) => ({
      value: r,
      label: e(`split_${r}`)
    }))}
          @value-changed=${(r) => this.pick(r.detail.value)}
        ></se-select>

        ${this.mode === "default" ? this.renderDefault() : c}
        ${this.mode === "equal" ? this.renderEqual(t) : c}
        ${this.mode === "exact" ? this.renderExact(t) : c}
        ${this.mode === "partial" ? this.renderPartial(t) : c}
        ${this.mode === "custom" ? this.renderCustom(t) : c}
        ${t === null ? o`<div class="warn">${e("rule_invalid")}</div>` : c}
      </div>
    `;
  }
  /** What can be picked here, and what this rule already happens to be. */
  offered() {
    const e = this.inherits ? ["default", ...Nt] : [...Nt];
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
    const t = this.localize, r = this.unit === "percent", i = this.percentTotal();
    return o`
      <div>
        <div class="head">
          <div>
            <div class="muted">
              ${t(r ? "split_percent_hint" : "split_exact_hint")}
            </div>
            <div class="muted example">
              ${t(r ? "split_percent_example" : "split_exact_example")}
            </div>
          </div>
          <div class="units" role="group">
            <button
              aria-pressed=${!r}
              @click=${() => this.setUnit("money")}
            >
              ${this.currency}
            </button>
            <button
              aria-pressed=${r}
              @click=${() => this.setUnit("percent")}
            >
              %
            </button>
          </div>
        </div>

        ${this.members.map(
      (a) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(a.id)}
                @change=${() => this.toggleParticipant(a.id)}
              />
              ${this.renderAvatar(a)}
              <span class="name">${a.name}</span>
              ${r ? o`<span class="share">${this.shareOf(e, a.id)}</span>` : c}
              <!--
                In money, an empty field says in grey what it would come to:
                that is what a placeholder is for, and it answers the only
                question the mode raises. In percent the figure needs its own
                column, the field being the share itself.
              -->
              <se-field
                .value=${(r ? this.percents : this.amounts)[a.id] ?? ""}
                .suffix=${r ? "%" : this.currency}
                .disabled=${!this.participants.has(a.id)}
                decimal
                placeholder=${r ? "—" : this.shareOf(e, a.id) || this.localize("split_the_rest_short")}
                @value-changed=${(s) => r ? this.setPercent(a.id, s.detail.value) : this.setAmount(a.id, s.detail.value)}
              ></se-field>
            </div>
          `
    )}

        ${r ? o`
              <div class="total">
                <span class="muted">${t("split_percent_total")}</span>
                <strong class=${i > Dt ? "negative" : ""}>
                  ${(i / 100).toFixed(i % 100 === 0 ? 0 : 2)} %
                </strong>
              </div>
              ${i > Dt ? o`<div class="warn">${t("split_percent_over")}</div>` : c}
            ` : c}
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
    for (const [t, r] of Object.entries(this.percents))
      this.participants.has(t) && (e += er(r) ?? 0);
    return e;
  }
  setPercent(e, t) {
    this.percents = { ...this.percents, [e]: t }, this.emit();
  }
  /** An amount shared between some; whatever is left goes to one person. */
  renderPartial(e) {
    const t = this.localize, r = xe(this.envelopeInput), i = r === null ? null : Math.max(this.previewAmount - r, 0);
    return o`
      <div>
        <div class="muted example">${t("split_partial_example")}</div>
        <se-field
          .label=${t("split_shared_amount")}
          .value=${this.envelopeInput}
          .suffix=${this.currency}
          decimal
          placeholder="5,00"
          @value-changed=${(a) => this.setEnvelope(a.detail.value)}
        ></se-field>

        <div class="muted" style="margin-top:10px">
          ${t("split_shared_between")}
        </div>
        ${this.members.map(
      (a) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(a.id)}
                @change=${() => this.toggleParticipant(a.id)}
              />
              ${this.renderAvatar(a)}
              <span class="name">${a.name}</span>
              <span class="share">${this.shareOf(e, a.id)}</span>
            </div>
          `
    )}
      </div>

      <div class="rest">
        <span>
          ${t("split_rest_for")}
          ${i === null ? c : o`<span class="figure">(${this.money(i)})</span>`}
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
          .options=${this.members.map((a) => ({ value: a.id, label: a.name }))}
          @value-changed=${(a) => this.setRestTo(a.detail.value)}
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
        @value-changed=${(r) => this.setEnvelope(r.detail.value)}
      ></se-field>

      <div>
        <div class="muted">${t("split_shared_between")}</div>
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

      <div>
        <div class="muted">${t("split_rest_between")}</div>
        <div class="muted">${t("split_rest_between_hint")}</div>
        ${this.members.map(
      (r) => o`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.takers.has(r.id)}
                @change=${() => this.toggleTaker(r.id)}
              />
              ${this.renderAvatar(r)}
              <span class="name">${r.name}</span>
              <se-field
                .value=${this.amounts[r.id] ?? ""}
                .suffix=${this.currency}
                .disabled=${!this.takers.has(r.id)}
                decimal
                placeholder="—"
                @value-changed=${(i) => this.setAmount(r.id, i.detail.value)}
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
      const { [e]: r, ...i } = this.amounts;
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
    const t = this.members.find((r) => r.id === this.payerId) ?? this.members[0];
    return t ? Xt({
      amount: e,
      payerId: t.id,
      memberIds: this.members.map((r) => r.id),
      rule: this.build()
    }) : null;
  }
  shareOf(e, t) {
    return e === null ? "" : e[t] ? this.money(e[t]) : "—";
  }
  money(e) {
    return T(e, this.currency, this.language);
  }
  renderAvatar(e) {
    return o`
      <div class="avatar" style=${`background:${e.color ?? I(e.id)}`}>
        ${Z(e.name)}
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
    if (this.mode = e, e !== "partial" && e !== "custom" && (this.envelopeInput = ""), e !== "exact" && e !== "custom" && (this.amounts = {}), e !== "exact" && (this.percents = {}), e === "exact" != (t === "exact") && (this.amounts = {}), e === "exact" && this.participants.size === 0 && (this.participants = new Set(this.members.map((r) => r.id))), e === "partial" && (this.restTo = this.restTo || [...this.takers][0] || this.payerId || ""), e === "custom" && this.takers.size === 0) {
      const r = this.restTo || this.payerId;
      this.takers = r ? /* @__PURE__ */ new Set([r]) : /* @__PURE__ */ new Set();
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
      const { [e]: r, ...i } = this.amounts;
      this.amounts = i;
      const { [e]: a, ...s } = this.percents;
      this.percents = s;
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
    return pi(this.mode, {
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
P.styles = [
  E,
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
O([
  l({ attribute: !1 })
], P.prototype, "localize", 2);
O([
  l({ attribute: !1 })
], P.prototype, "members", 2);
O([
  l({ attribute: !1 })
], P.prototype, "rule", 2);
O([
  l({ type: String })
], P.prototype, "currency", 2);
O([
  l({ type: String })
], P.prototype, "language", 2);
O([
  l({ type: Number })
], P.prototype, "amount", 2);
O([
  l({ type: String })
], P.prototype, "payerId", 2);
O([
  l({ type: String })
], P.prototype, "inherits", 2);
O([
  d()
], P.prototype, "mode", 2);
O([
  d()
], P.prototype, "participants", 2);
O([
  d()
], P.prototype, "envelopeInput", 2);
O([
  d()
], P.prototype, "amounts", 2);
O([
  d()
], P.prototype, "percents", 2);
O([
  d()
], P.prototype, "unit", 2);
O([
  d()
], P.prototype, "restTo", 2);
O([
  d()
], P.prototype, "takers", 2);
P = O([
  f("se-split-rule-editor")
], P);
var yi = Object.defineProperty, bi = Object.getOwnPropertyDescriptor, L = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? bi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && yi(t, r, a), a;
};
let N = class extends g {
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
        this.error = v(t, this.localize);
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
          ${this.error ? o`<div class="error">${this.error}</div>` : c}

          <se-field
            .label=${e("category_name")}
            .value=${this.name}
            required
            placeholder="Courses"
            @value-changed=${(r) => this.name = r.detail.value}
          ></se-field>

          <se-icon-picker
            .localize=${this.localize}
            .label=${e("icon")}
            .value=${this.icon}
            .color=${this.effectiveColor()}
            @value-changed=${(r) => this.icon = r.detail.value}
          ></se-icon-picker>

          <se-color-picker
            .localize=${this.localize}
            .label=${e("color")}
            .value=${this.color}
            .fallback=${this.autoColor()}
            @value-changed=${(r) => this.color = r.detail.value}
          ></se-color-picker>

          <div>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                @change=${(r) => this.isDefault = r.target.checked}
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
              @rule-changed=${(r) => this.rule = r.detail.rule}
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
    return I(this.category?.id ?? this.name);
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
N.styles = E;
L([
  l({ attribute: !1 })
], N.prototype, "api", 2);
L([
  l({ attribute: !1 })
], N.prototype, "localize", 2);
L([
  l({ attribute: !1 })
], N.prototype, "group", 2);
L([
  l({ attribute: !1 })
], N.prototype, "members", 2);
L([
  l({ attribute: !1 })
], N.prototype, "category", 2);
L([
  l({ type: String })
], N.prototype, "language", 2);
L([
  d()
], N.prototype, "name", 2);
L([
  d()
], N.prototype, "icon", 2);
L([
  d()
], N.prototype, "color", 2);
L([
  d()
], N.prototype, "rule", 2);
L([
  d()
], N.prototype, "isDefault", 2);
L([
  d()
], N.prototype, "busy", 2);
L([
  d()
], N.prototype, "error", 2);
N = L([
  f("se-category-dialog")
], N);
var fi = Object.defineProperty, vi = Object.getOwnPropertyDescriptor, pe = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? vi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && fi(t, r, a), a;
};
let Y = class extends g {
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
        this.error = v(e, this.localize);
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
          ${this.error ? o`<div class="error">${this.error}</div>` : c}

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
Y.styles = [
  E,
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
pe([
  l({ attribute: !1 })
], Y.prototype, "api", 2);
pe([
  l({ attribute: !1 })
], Y.prototype, "localize", 2);
pe([
  l({ attribute: !1 })
], Y.prototype, "group", 2);
pe([
  l({ attribute: !1 })
], Y.prototype, "members", 2);
pe([
  l({ type: String })
], Y.prototype, "language", 2);
pe([
  d()
], Y.prototype, "rule", 2);
pe([
  d()
], Y.prototype, "isDefault", 2);
pe([
  d()
], Y.prototype, "busy", 2);
pe([
  d()
], Y.prototype, "error", 2);
Y = pe([
  f("se-group-rule-dialog")
], Y);
function st(e, t, r, i) {
  if (e === null)
    return t("split_equal");
  const a = gt(e);
  if (a === "equal") {
    const s = e.participants?.length;
    return s ? `${t("split_equal")} · ${s}` : t("split_equal");
  }
  return a === "exact" ? Object.keys(e.remainder?.percent ?? {}).length > 0 ? wi(e, t) : t("split_exact") : a === "partial" ? e.envelope == null ? t("split_partial") : `${T(e.envelope, r, i)} ${t("split_shared_lower")}` : t("split_custom");
}
function wi(e, t) {
  const r = Object.values(e.remainder?.percent ?? {});
  return r.length === 0 ? t("split_percent") : r.map((i) => i % 100 === 0 ? String(i / 100) : (i / 100).toFixed(2)).join(" / ").concat(" %");
}
var $i = Object.defineProperty, xi = Object.getOwnPropertyDescriptor, K = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? xi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && $i(t, r, a), a;
};
let R = class extends g {
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
                ${this.error ? o`<div class="error">${this.error}</div>` : c}
                ${this.renderNoCategory()}
                ${this.categories.map((t) => this.renderRow(t))}
                ${this.categories.length === 0 ? o`<div class="empty">${e("no_categories")}</div>` : c}
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
          .color=${e.color ?? I(e.id)}
          .size=${34}
        ></se-icon>
        <div class="info">
          <div class="name">
            ${e.name}
            ${this.group.default_category_id === e.id ? o`<span class="tag">${this.localize("default_category_tag")}</span>` : c}
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
            ${this.group.default_category_id === null ? o`<span class="tag">${this.localize("default_category_tag")}</span>` : c}
          </div>
          <div class="muted">
            ${st(
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
    return e.split_rule === null ? this.localize("rule_from_group") : st(
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
      this.error = v(e, this.localize);
    } finally {
      this.loading = !1;
    }
  }
};
R.styles = [
  E,
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
K([
  l({ attribute: !1 })
], R.prototype, "api", 2);
K([
  l({ attribute: !1 })
], R.prototype, "localize", 2);
K([
  l({ attribute: !1 })
], R.prototype, "group", 2);
K([
  l({ attribute: !1 })
], R.prototype, "members", 2);
K([
  l({ type: String })
], R.prototype, "language", 2);
K([
  d()
], R.prototype, "categories", 2);
K([
  d()
], R.prototype, "editing", 2);
K([
  d()
], R.prototype, "creating", 2);
K([
  d()
], R.prototype, "editingGroupRule", 2);
K([
  d()
], R.prototype, "loading", 2);
K([
  d()
], R.prototype, "error", 2);
K([
  d()
], R.prototype, "dirty", 2);
R = K([
  f("se-categories-dialog")
], R);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ki = Gt(class extends Wt {
  constructor() {
    super(...arguments), this.key = c;
  }
  render(e, t) {
    return this.key = e, t;
  }
  update(e, [t, r]) {
    return t !== this.key && (Kt(e), this.key = t), r;
  }
});
var zi = Object.defineProperty, ji = Object.getOwnPropertyDescriptor, F = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? ji(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && zi(t, r, a), a;
};
let q = class extends g {
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
    return this.currency === this.groupCurrency ? c : this.renderRate();
  }
  renderRate() {
    const e = this.localize, t = this.rate();
    return o`
      <div>
        <div class="row">
          <label class="muted">${e("rate_heading")}</label>
          ${this.busy ? c : o`<button class="link" @click=${() => this.load(!0)}>
                ${e("rate_retry")}
              </button>`}
        </div>

        ${this.busy ? o`<div class="muted">${e("loading")}</div>` : c}
        ${this.error ? o`<div class="warning">${this.error}</div>` : c}

        <div class="rate">
          <div class="says">${this.renderSays(t)}</div>
          <se-field
            .label=${e("rate_label")}
            .value=${this.typed || (t === null ? "" : St(t))}
            decimal
            placeholder="0,87681"
            @value-changed=${(r) => this.type(r.detail.value)}
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
    const r = this.amount === null ? null : Rr(this.amount, e);
    return o`
      ${this.fetched?.stale && !this.typed ? o`<div class="stale">
            ${t("rate_stale")}
            ${Re(this.fetched.as_of, this.language)}
          </div>` : c}
      <div>
        1 ${this.currency} = ${St(e)} ${this.groupCurrency}
        ${r === null ? c : o`<br />${t("converts_to")}
              <strong>
                ${T(r, this.groupCurrency, this.language)}
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
    return this.typed.trim() ? qr(this.typed) : this.currency === this.groupCurrency ? 1e6 : this.fetched?.rate ?? null;
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
      this.fetched = void 0, this.error = t?.code === "exchange_rate_unavailable" ? this.localize("rate_unavailable") : v(t, this.localize);
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
q.styles = [
  E,
  x`
      /*
       * No box of our own. Nearly every expense is in the group's own currency
       * and this field shows nothing at all — but an empty flex item still
       * counts for its parent's gap, so it opened a second gap above whatever
       * came next, and the description below sat too far down. display: contents
       * lets the rate block, when there is one, stand as the column's own child,
       * and lets nothing take up no room.
       */
      :host {
        display: contents;
      }

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
F([
  l({ attribute: !1 })
], q.prototype, "api", 2);
F([
  l({ attribute: !1 })
], q.prototype, "localize", 2);
F([
  l({ type: String })
], q.prototype, "groupId", 2);
F([
  l({ type: String })
], q.prototype, "groupCurrency", 2);
F([
  l({ type: String })
], q.prototype, "currency", 2);
F([
  l({ type: String })
], q.prototype, "on", 2);
F([
  l({ type: Number })
], q.prototype, "amount", 2);
F([
  l({ type: String })
], q.prototype, "language", 2);
F([
  d()
], q.prototype, "fetched", 2);
F([
  d()
], q.prototype, "typed", 2);
F([
  d()
], q.prototype, "busy", 2);
F([
  d()
], q.prototype, "error", 2);
q = F([
  f("se-currency-field")
], q);
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
  exposed: "dashboard",
  default_category_id: "default_category",
  split_rule: "default_split",
  permissions: "permissions",
  role: "field_role"
};
function Si(e, t) {
  const r = Ai[e.field];
  return r ? {
    label: t.localize(r),
    before: Mt(e.field, e.before, t),
    after: Mt(e.field, e.after, t)
  } : null;
}
function Mt(e, t, r) {
  return t == null ? null : e === "amount" && typeof t == "number" ? T(t, r.currency, r.language) : e === "expense_date" || e === "payment_date" ? Re(String(t), r.language) : e === "category_id" ? r.categories.find((i) => i.id === t)?.name ?? r.localize("no_category") : e === "paid_by_member_id" || e === "from_member_id" || e === "to_member_id" ? tr(String(t), r) : e === "shares" && Ei(t) ? Ci(t, r) : e === "kind" ? r.localize(
    t === "debt" ? "kind_debt" : "kind_reimbursement"
  ) : e === "role" ? r.localize(t === "admin" ? "role_admin" : "role_member") : e === "archived" || e === "exposed" ? r.localize(t ? "yes" : "no") : e === "split_rule" ? st(
    t,
    r.localize,
    r.currency,
    r.language
  ) : e === "permissions" && Array.isArray(t) ? t.length === 0 ? r.localize("permissions_none") : t.map((i) => r.localize(`perm_${i}`)).join(" · ") : String(t);
}
function Ci(e, t) {
  const r = Object.entries(e).filter(([, i]) => i !== 0);
  return r.length === 0 ? "—" : r.map(
    ([i, a]) => `${tr(i, t)} ${T(a, t.currency, t.language)}`
  ).join(" · ");
}
function tr(e, t) {
  return t.members.find((r) => r.id === e)?.name ?? "?";
}
function Ei(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e) && Object.values(e).every((t) => typeof t == "number");
}
var Pi = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, se = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Di(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Pi(t, r, a), a;
};
const Ti = {
  expense: "the_expense",
  payment: "the_payment",
  group: "the_group",
  category: "the_category",
  member: "the_member"
};
let G = class extends g {
  constructor() {
    super(...arguments), this.revisions = [], this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.withSubject = !1, this.expenses = [], this.payments = [], this.restorable = !1;
  }
  render() {
    return this.revisions.length === 0 ? o`<div class="empty">${this.localize("no_history")}</div>` : o`${this.revisions.map((e) => this.renderEntry(e))}`;
  }
  renderEntry(e) {
    const t = this.actorOf(e), r = t?.name ?? this.localize("someone"), i = this.stillThere(e) !== void 0, a = this.withSubject ? this.subjectOf(e) : null, s = o`
      <div
        class="avatar"
        style=${`background:${t?.color ?? I(e.actor_user_id ?? e.id)}`}
      >
        ${Z(r)}
      </div>
      <div class="body">
        <div class="head">
          <span class="who">${r}</span>
          <!--
            When, whose, how much — stacked on the right, where the expense list
            keeps its figures too. An amount belongs at the edge a reader scans
            for one, and the name belongs beside it rather than in a sentence of
            its own: "Paid by Antonin" on its own line said one word of use and
            three of ceremony.
          -->
          <span class="stamp">
            <span class="when">${Re(e.at, this.language)}</span>
            ${a ? o`<span class="whose">${a.whose}</span>
                  <span class="sum">${a.money}</span>` : c}
          </span>
        </div>
        <div class="what">${this.headline(e)}</div>
        ${this.renderChanges(e)} ${this.renderRestore(e)}
      </div>
      ${i ? o`<span class="chevron">›</span>` : c}
    `;
    return i ? o`<button class="entry entry-button" @click=${() => this.pick(e)}>
          ${s}
        </button>` : o`<div class="entry">${s}</div>`;
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
    return e.entity_type !== "expense" && e.entity_type !== "payment" || e.action !== "deleted" || !this.restorable || this.stillThere(e) !== void 0 ? c : o`
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
      money: T(t.amount, t.currency, this.language),
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
      (p) => p.entity_id === e.entity_id && p.action === "deleted"
    );
    if (!t)
      return null;
    const r = new Map(t.changes.map((p) => [p.field, p.before])), i = r.get("amount");
    if (typeof i != "number")
      return null;
    const a = String(r.get("currency") ?? this.currency), s = r.get("paid_by_member_id"), n = typeof s == "string" ? this.nameOf(s) : `${this.nameOf(String(r.get("from_member_id")))} → ${this.nameOf(
      String(r.get("to_member_id"))
    )}`;
    return { money: T(i, a, this.language), whose: n };
  }
  /** What a member goes by, or "?" rather than a ULID leaking into a column. */
  nameOf(e) {
    const t = this.members.find((r) => r.id === e);
    return t ? Xr(t.name) : "?";
  }
  /**
   * What happened, in one line.
   *
   * Reads as a sentence rather than a code: "modified the expense", and in the
   * group journal, which one.
   */
  headline(e) {
    const t = this.localize, r = t(Ti[e.entity_type]), i = t(`history_${e.action}`), a = this.withSubject && e.entity_label ? ` "${e.entity_label}"` : "";
    return `${i} ${r}${a}`;
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
      return c;
    const t = {
      localize: this.localize,
      members: this.members,
      categories: this.categories,
      currency: this.currency,
      language: this.language
    }, r = e.changes.map((i) => Si(i, t)).filter((i) => i !== null);
    return o`
      ${r.map(
      (i) => o`
          <div class="change">
            <span class="field">${i.label}</span>
            ${i.before === null ? c : o`<span class="before">${i.before}</span>
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
  E,
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
se([
  l({ attribute: !1 })
], G.prototype, "localize", 2);
se([
  l({ attribute: !1 })
], G.prototype, "revisions", 2);
se([
  l({ attribute: !1 })
], G.prototype, "members", 2);
se([
  l({ attribute: !1 })
], G.prototype, "categories", 2);
se([
  l({ type: String })
], G.prototype, "currency", 2);
se([
  l({ type: String })
], G.prototype, "language", 2);
se([
  l({ type: Boolean })
], G.prototype, "withSubject", 2);
se([
  l({ attribute: !1 })
], G.prototype, "expenses", 2);
se([
  l({ attribute: !1 })
], G.prototype, "payments", 2);
se([
  l({ type: Boolean })
], G.prototype, "restorable", 2);
G = se([
  f("se-history")
], G);
var Oi = Object.defineProperty, Ii = Object.getOwnPropertyDescriptor, V = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Ii(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Oi(t, r, a), a;
};
let U = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.currency = "EUR", this.language = "en", this.open = !1, this.busy = !1, this.toggle = async () => {
      if (this.open = !this.open, !(!this.open || this.revisions || this.busy)) {
        this.busy = !0, this.error = void 0;
        try {
          this.revisions = await this.api.listEntityRevisions(this.groupId, this.entityId);
        } catch (e) {
          this.error = v(e, this.localize);
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

        ${this.open ? this.renderBody() : c}
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
U.styles = [
  E,
  x`
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
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
], U.prototype, "entityId", 2);
V([
  l({ attribute: !1 })
], U.prototype, "members", 2);
V([
  l({ attribute: !1 })
], U.prototype, "categories", 2);
V([
  l({ type: String })
], U.prototype, "currency", 2);
V([
  l({ type: String })
], U.prototype, "language", 2);
V([
  d()
], U.prototype, "open", 2);
V([
  d()
], U.prototype, "revisions", 2);
V([
  d()
], U.prototype, "busy", 2);
V([
  d()
], U.prototype, "error", 2);
U = V([
  f("se-entity-history")
], U);
var Ni = Object.defineProperty, Mi = Object.getOwnPropertyDescriptor, k = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Mi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Ni(t, r, a), a;
};
let w = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.language = "en", this.expenseTitle = "", this.description = "", this.amountInput = "", this.paidBy = "", this.date = Jt(), this.categoryId = "", this.rule = null, this.busy = !1, this.confirmingDelete = !1, this.editingSplit = !1, this.showDescription = !1, this.currency = "", this.rate = null, this.pickCategory = (e) => {
      this.categoryId = e.detail.value, this.rule = null;
    }, this.pickCurrency = (e) => {
      this.currency = e.target.value, this.rate = this.currency === this.group.currency ? J : null;
    }, this.handleRate = (e) => {
      this.currency = e.detail.currency, this.rate = e.detail.rate;
    }, this.cancel = () => {
      this.dispatchEvent(
        new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 })
      );
    }, this.submit = async () => {
      const e = xe(this.amountInput), t = this.resolved(e);
      if (e === null || !t)
        return;
      this.busy = !0, this.error = void 0;
      const r = {
        group_id: this.group.id,
        title: this.expenseTitle.trim(),
        amount: e,
        paid_by_member_id: this.paidBy,
        expense_date: Qt(this.date),
        category_id: this.categoryId || null,
        description: this.description.trim() || null,
        shares: Object.entries(t).map(([s, n]) => ({
          member_id: s,
          amount: n
        })),
        // The shares are the truth, but the rule has to travel with them, or
        // reopening the expense could only ever spell the amounts back out.
        currency: this.currency || this.group.currency,
        // The rate the panel showed and had accepted, so that what was agreed to
        // on screen is what lands in the balances.
        ...this.rate !== null && this.rate !== J ? { exchange_rate: this.rate } : {},
        split_rule: this.rule ?? this.defaultRule()
      }, { group_id: i, ...a } = r;
      try {
        const s = this.expense ? await this.api.updateExpense(this.expense.id, a) : await this.api.createExpense(r);
        this.dispatchEvent(
          new CustomEvent("expense-saved", {
            detail: { expense: s },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (s) {
        this.error = v(s, this.localize);
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
          this.error = v(e, this.localize), this.confirmingDelete = !1;
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
      this.categoryId = this.categories.some((t) => t.id === e) ? e : "", this.currency = this.group.currency, this.rate = J;
      return;
    }
    this.expenseTitle = this.expense.title, this.description = this.expense.description ?? "", this.amountInput = rt(this.expense.amount), this.paidBy = this.expense.paid_by_member_id, this.date = Yt(this.expense.expense_date), this.categoryId = this.expense.category_id ?? "", this.rule = this.expense.split_rule ?? this.ruleFromStoredShares(), this.showDescription = this.description !== "", this.currency = this.expense.currency, this.rate = this.expense.exchange_rate;
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
    return e === null || !this.paidBy || this.members.length === 0 ? null : Xt({
      amount: e,
      payerId: this.paidBy,
      memberIds: this.members.map((t) => t.id),
      rule: this.rule ?? this.defaultRule()
    });
  }
  render() {
    const e = this.localize, t = xe(this.amountInput), r = this.expense ? e("edit_expense") : e("new_expense");
    return o`
      <se-dialog open heading=${r} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : c}

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

          <!-- Between filling the expense in and how it is split: always. -->
          <div class="rule"></div>

          ${this.renderSplit(t)}

          <!-- Only once there is a past to read: a new expense has none. -->
          ${this.expense ? o`
                <div class="rule"></div>
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

        ${this.confirmingDelete ? o`<div slot="banner" class="warning">
              ${e("confirm_delete_expense")}
            </div>` : c}

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
            ` : c}
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

        ${this.editingSplit ? c : this.renderSummary(e)}

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
        ${this.members.filter((r) => t[r.id]).map(
      (r) => o`
              <span class="who">
                ${r.name}
                <strong>
                  ${T(t[r.id], this.currency, this.language)}
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
    return ki(
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
    return [.../* @__PURE__ */ new Set([...mt, this.group.currency, this.currency])].sort();
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
w.styles = [
  E,
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

      /*
       * A hairline where the column changes errand: the general fields, then
       * how they are split, then — when editing — the past being read. The
       * three ran into one another, and the stack gap gives each rule air on
       * either side. Drawn between general and split for every expense, since a
       * new one has that boundary too; the one before the history only when
       * there is a history.
       */
      .rule {
        height: 1px;
        background: var(--divider-color, rgba(0, 0, 0, 0.12));
      }
    `
];
k([
  l({ attribute: !1 })
], w.prototype, "api", 2);
k([
  l({ attribute: !1 })
], w.prototype, "localize", 2);
k([
  l({ attribute: !1 })
], w.prototype, "group", 2);
k([
  l({ attribute: !1 })
], w.prototype, "members", 2);
k([
  l({ attribute: !1 })
], w.prototype, "categories", 2);
k([
  l({ attribute: !1 })
], w.prototype, "expense", 2);
k([
  l({ type: String })
], w.prototype, "meId", 2);
k([
  l({ type: String })
], w.prototype, "language", 2);
k([
  d()
], w.prototype, "expenseTitle", 2);
k([
  d()
], w.prototype, "description", 2);
k([
  d()
], w.prototype, "amountInput", 2);
k([
  d()
], w.prototype, "paidBy", 2);
k([
  d()
], w.prototype, "date", 2);
k([
  d()
], w.prototype, "categoryId", 2);
k([
  d()
], w.prototype, "rule", 2);
k([
  d()
], w.prototype, "busy", 2);
k([
  d()
], w.prototype, "error", 2);
k([
  d()
], w.prototype, "confirmingDelete", 2);
k([
  d()
], w.prototype, "editingSplit", 2);
k([
  d()
], w.prototype, "showDescription", 2);
k([
  d()
], w.prototype, "currency", 2);
k([
  d()
], w.prototype, "rate", 2);
w = k([
  f("se-expense-dialog")
], w);
var Ri = Object.defineProperty, qi = Object.getOwnPropertyDescriptor, oe = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? qi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Ri(t, r, a), a;
};
let W = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.expenses = [], this.payments = [], this.language = "en", this.restore = async (e) => {
      const { entityType: t, entityId: r } = e.detail;
      this.error = void 0;
      try {
        t === "expense" ? await this.api.restoreExpense(this.group.id, r) : await this.api.restorePayment(this.group.id, r), this.dispatchEvent(
          new CustomEvent("history-restored", { bubbles: !0, composed: !0 })
        );
      } catch (i) {
        this.error = v(i, this.localize);
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
        ${this.error ? o`<div class="error">${this.error}</div>` : c}
        ${this.renderBody()}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${e("close")}
        </se-button>
      </se-dialog>
    `;
  }
  renderBody() {
    return this.error ? c : this.revisions ? o`
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
      this.error = v(e, this.localize);
    }
  }
};
W.styles = E;
oe([
  l({ attribute: !1 })
], W.prototype, "api", 2);
oe([
  l({ attribute: !1 })
], W.prototype, "localize", 2);
oe([
  l({ attribute: !1 })
], W.prototype, "group", 2);
oe([
  l({ attribute: !1 })
], W.prototype, "members", 2);
oe([
  l({ attribute: !1 })
], W.prototype, "categories", 2);
oe([
  l({ attribute: !1 })
], W.prototype, "expenses", 2);
oe([
  l({ attribute: !1 })
], W.prototype, "payments", 2);
oe([
  l({ type: String })
], W.prototype, "language", 2);
oe([
  d()
], W.prototype, "revisions", 2);
oe([
  d()
], W.prototype, "error", 2);
W = oe([
  f("se-history-dialog")
], W);
var Ui = Object.defineProperty, Bi = Object.getOwnPropertyDescriptor, D = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Bi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Ui(t, r, a), a;
};
let j = class extends g {
  constructor() {
    super(...arguments), this.role = null, this.meId = null, this.mayManage = !1, this.haUsers = [], this.members = [], this.memberships = [], this.newName = "", this.loading = !0, this.dirty = !1, this.pastMembers = [], this.addGuest = async () => {
      this.busy = "new", this.error = void 0;
      try {
        await this.api.createMember({
          name: this.newName.trim(),
          group_id: this.groupId
        }), this.newName = "", this.dirty = !0, await this.load();
      } catch (e) {
        this.error = v(e, this.localize);
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
                ${this.error ? o`<div class="error">${this.error}</div>` : c}
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
    const t = this.memberForUser(e.id), r = this.isAdmin(t), i = t !== void 0 && t.id === this.meId, a = this.mayManage || i;
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
          .checked=${Ft(t !== void 0)}
          ?disabled=${r || !a || this.busy !== void 0}
          title=${r ? this.localize("admin_locked") : ""}
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
        ${r ? o`<span class="tag">${this.localize("role_admin")}</span>` : c}
        ${this.renderHandOver(t, r)}
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
    return this.role !== "admin" || !e || t ? c : this.handingTo === e.id ? o`
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
      this.error = v(t, this.localize);
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
  renderTintable(e, t, r) {
    const i = e?.color ?? I(r), a = e && (e.id === this.meId || this.mayManage);
    return !e || !a ? o`
        <div class="avatar" style=${`background:${i}`}>${Z(t)}</div>
      ` : o`
      <button
        class="avatar tintable"
        title=${this.localize("pick_color")}
        style=${`background:${i}`}
        @click=${() => this.toggleTint(e.id)}
      >
        ${Z(t)}
      </button>
    `;
  }
  renderPalette(e) {
    return !e || this.tinting !== e.id ? c : o`
      <div class="palette">
        <se-color-picker
          .localize=${this.localize}
          .value=${e.color}
          .fallback=${I(e.id)}
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
    } catch (r) {
      this.error = v(r, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
  renderGuests() {
    const e = this.localize, t = this.members.filter((i) => i.user_id === null), r = this.pastMembers.filter(
      (i) => i.user_id === null && !t.some((a) => a.id === i.id)
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
              ${this.confirming === i.id ? o`<span class="confirm">${e("confirm_remove")}</span>` : c}
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
                  </button>` : c}
            </div>
            ${this.renderPalette(i)}
          `
    )}

        ${r.map(
      (i) => o`
            <div class="row gone">
              <div
                class="avatar"
                style=${`background:${i.color ?? I(i.id)}`}
              >
                ${Z(i.name)}
              </div>
              <span class="name">${i.name}</span>
              ${this.mayManage ? o`<se-button
                    variant="text"
                    ?disabled=${this.busy !== void 0}
                    @click=${() => this.restoreGuest(i)}
                  >
                    ${e("restore_member")}
                  </se-button>` : c}
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
            </div>` : c}
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
      const [e, t, r, i] = await Promise.all([
        this.api.listHaUsers(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, !0),
        this.api.listMemberships(this.groupId)
      ]);
      this.haUsers = e, this.members = t, this.pastMembers = r, this.memberships = i;
    } catch (e) {
      this.error = v(e, this.localize);
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
    } catch (r) {
      this.error = v(r, this.localize);
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
      this.error = v(t, this.localize);
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
      this.error = v(t, this.localize);
    } finally {
      this.busy = void 0;
    }
  }
};
j.styles = [
  E,
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
D([
  l({ attribute: !1 })
], j.prototype, "api", 2);
D([
  l({ attribute: !1 })
], j.prototype, "localize", 2);
D([
  l({ type: String })
], j.prototype, "groupId", 2);
D([
  l({ attribute: !1 })
], j.prototype, "role", 2);
D([
  l({ type: String })
], j.prototype, "meId", 2);
D([
  l({ type: Boolean })
], j.prototype, "mayManage", 2);
D([
  d()
], j.prototype, "haUsers", 2);
D([
  d()
], j.prototype, "members", 2);
D([
  d()
], j.prototype, "memberships", 2);
D([
  d()
], j.prototype, "newName", 2);
D([
  d()
], j.prototype, "loading", 2);
D([
  d()
], j.prototype, "busy", 2);
D([
  d()
], j.prototype, "error", 2);
D([
  d()
], j.prototype, "dirty", 2);
D([
  d()
], j.prototype, "tinting", 2);
D([
  d()
], j.prototype, "confirming", 2);
D([
  d()
], j.prototype, "handingTo", 2);
D([
  d()
], j.prototype, "pastMembers", 2);
j = D([
  f("se-member-dialog")
], j);
var Hi = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, A = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Li(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Hi(t, r, a), a;
};
let $ = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.initialKind = "reimbursement", this.language = "en", this.fromMember = "", this.toMember = "", this.amountInput = "", this.description = "", this.showDescription = !1, this.date = Jt(), this.busy = !1, this.confirmingDelete = !1, this.kind = "reimbursement", this.currency = "", this.rate = null, this.pickCurrency = (e) => {
      this.currency = e.target.value, this.rate = this.currency === this.group.currency ? J : null;
    }, this.handleRate = (e) => {
      this.currency = e.detail.currency, this.rate = e.detail.rate;
    }, this.pickKind = (e) => {
      const t = e.detail.value;
      t !== this.kind && (this.kind = t, [this.fromMember, this.toMember] = [this.toMember, this.fromMember]);
    }, this.cancel = () => {
      this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: !0, composed: !0 }));
    }, this.submit = async () => {
      const e = xe(this.amountInput);
      if (e === null)
        return;
      this.busy = !0, this.error = void 0;
      const t = {
        group_id: this.group.id,
        from_member_id: this.fromMember,
        to_member_id: this.toMember,
        amount: e,
        payment_date: Qt(this.date),
        description: this.description.trim() || null,
        currency: this.currency || this.group.currency,
        kind: this.kind,
        ...this.rate !== null && this.rate !== J ? { exchange_rate: this.rate } : {}
      }, { group_id: r, ...i } = t;
      try {
        const a = this.payment ? await this.api.updatePayment(this.payment.id, i) : await this.api.createPayment(t);
        this.dispatchEvent(
          new CustomEvent("payment-saved", {
            detail: { payment: a },
            bubbles: !0,
            composed: !0
          })
        );
      } catch (a) {
        this.error = v(a, this.localize);
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
          this.error = v(e, this.localize), this.confirmingDelete = !1;
        } finally {
          this.busy = !1;
        }
      }
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), this.payment) {
      this.fromMember = this.payment.from_member_id, this.toMember = this.payment.to_member_id, this.amountInput = rt(this.payment.amount), this.date = Yt(this.payment.payment_date), this.kind = this.payment.kind, this.currency = this.payment.currency, this.rate = this.payment.exchange_rate, this.description = this.payment.description ?? "", this.showDescription = this.description !== "";
      return;
    }
    if (this.kind = this.initialKind, this.currency = this.group.currency, this.rate = J, this.settlement) {
      this.fromMember = this.settlement.from_member_id, this.toMember = this.settlement.to_member_id, this.amountInput = rt(this.settlement.amount);
      return;
    }
    this.members.length > 0 && (this.fromMember = this.members[0].id, this.toMember = this.members[1]?.id ?? "");
  }
  render() {
    const e = this.localize, t = xe(this.amountInput), r = this.members.map((s) => ({ value: s.id, label: s.name })), i = this.kind === "debt", a = this.payment ? e(i ? "edit_debt" : "edit_payment") : e(i ? "new_debt" : "new_payment");
    return o`
      <se-dialog open heading=${a} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? o`<div class="error">${this.error}</div>` : c}

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
              .options=${r}
              @value-changed=${(s) => i ? this.toMember = s.detail.value : this.fromMember = s.detail.value}
            ></se-select>

            <se-select
              .label=${e(i ? "debt_to_whom" : "to_member")}
              .value=${i ? this.fromMember : this.toMember}
              .options=${r}
              @value-changed=${(s) => i ? this.fromMember = s.detail.value : this.toMember = s.detail.value}
            ></se-select>
          </div>

          <div class="pair">
            <se-field
              .label=${e("amount")}
              .value=${this.amountInput}
              decimal
              required
              @value-changed=${(s) => this.amountInput = s.detail.value}
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
      (s) => o`
                    <option value=${s} ?selected=${s === this.currency}>
                      ${s}
                    </option>
                  `
    )}
              </select>
            </se-field>

            <se-field
              .label=${e("date")}
              type="date"
              .value=${this.date}
              @value-changed=${(s) => this.date = s.detail.value}
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
                  @value-changed=${(s) => this.description = s.detail.value}
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
              ` : c}
        </div>

        ${this.confirmingDelete ? o`<div slot="banner" class="warning">
              ${e(
      this.kind === "debt" ? "confirm_delete_debt" : "confirm_delete_payment"
    )}
            </div>` : c}

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
            ` : c}
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
    return [.../* @__PURE__ */ new Set([...mt, this.group.currency, this.currency])].sort();
  }
};
$.styles = E;
A([
  l({ attribute: !1 })
], $.prototype, "api", 2);
A([
  l({ attribute: !1 })
], $.prototype, "localize", 2);
A([
  l({ attribute: !1 })
], $.prototype, "group", 2);
A([
  l({ attribute: !1 })
], $.prototype, "members", 2);
A([
  l({ attribute: !1 })
], $.prototype, "payment", 2);
A([
  l({ attribute: !1 })
], $.prototype, "settlement", 2);
A([
  l({ type: String })
], $.prototype, "initialKind", 2);
A([
  l({ type: String })
], $.prototype, "language", 2);
A([
  d()
], $.prototype, "fromMember", 2);
A([
  d()
], $.prototype, "toMember", 2);
A([
  d()
], $.prototype, "amountInput", 2);
A([
  d()
], $.prototype, "description", 2);
A([
  d()
], $.prototype, "showDescription", 2);
A([
  d()
], $.prototype, "date", 2);
A([
  d()
], $.prototype, "busy", 2);
A([
  d()
], $.prototype, "error", 2);
A([
  d()
], $.prototype, "confirmingDelete", 2);
A([
  d()
], $.prototype, "kind", 2);
A([
  d()
], $.prototype, "currency", 2);
A([
  d()
], $.prototype, "rate", 2);
$ = A([
  f("se-payment-dialog")
], $);
var Gi = Object.defineProperty, Wi = Object.getOwnPropertyDescriptor, ee = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Wi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Gi(t, r, a), a;
};
const Ge = "all", Ki = "#8a9099", Rt = "mdi:tag-off-outline";
let H = class extends g {
  constructor() {
    super(...arguments), this.members = [], this.categories = [], this.meId = null, this.currency = "EUR", this.language = "en", this.period = Ge;
  }
  connectedCallback() {
    super.connectedCallback(), this.load();
  }
  render() {
    const e = this.localize;
    return this.error ? o`<div class="error">${this.error}</div>` : this.result ? this.result.years.length === 0 ? o`<div class="panel"><div class="empty">${e("no_expenses")}</div></div>` : o`
      ${this.renderPeriod()} ${this.renderHero()} ${this.renderInsight()}
      ${this.renderCategories()} ${this.renderMonths()} ${this.renderMembers()}
    ` : o`<div class="panel"><div class="empty">${e("loading")}</div></div>`;
  }
  renderPeriod() {
    return o`
      <div class="seg" role="group">
        <button aria-pressed=${this.period === Ge} @click=${() => this.pick(Ge)}>
          ${this.localize("period_all")}
        </button>
        ${this.result.years.map(
      (e) => o`
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
  renderHero() {
    const e = this.result, t = e.by_member.find((i) => i.member_id === this.meId), r = e.count > 0 ? Math.round(e.total / e.count) : 0;
    return o`
      <div class="panel hero">
        <div class="lbl">${this.localize("total_spent")}</div>
        <div class="big">${this.money(e.total)}</div>
        <div class="pills">
          ${t ? o`<div class="pill">
                <div class="k">${this.localize("your_share")}</div>
                <div class="v">${this.money(t.share)}</div>
              </div>` : c}
          <div class="pill">
            <div class="k">${this.localize("expenses")}</div>
            <div class="v">${e.count}</div>
            ${e.count > 0 ? o`<div class="sub">
                  ${this.fill("stat_avg", { amount: this.money(r) })}
                </div>` : c}
          </div>
        </div>
      </div>
    `;
  }
  /**
   * The one line worth reading first: the dominant category, and the peak month.
   *
   * Shown only when it has something to say — categories spread evenly, or a
   * single month, leave it out rather than state the obvious.
   */
  renderInsight() {
    const e = this.result;
    if (e.total <= 0)
      return c;
    const t = [], r = e.by_category[0];
    if (r) {
      const s = r.total / e.total, n = this.categoryName(r.category_id);
      s >= 0.5 ? t.push(this.fill("stat_insight_half", { cat: n })) : s >= 0.34 && t.push(
        this.fill("stat_insight_mostly", {
          cat: n,
          pct: String(Math.round(s * 100))
        })
      );
    }
    if (e.by_month.length >= 2) {
      const s = e.by_month.reduce((n, p) => p.total > n.total ? p : n);
      t.push(
        this.fill("stat_insight_peak", {
          month: Et(s.month, this.language),
          amount: this.money(s.total)
        })
      );
    }
    if (t.length === 0)
      return c;
    const i = r ? this.category(r.category_id) : void 0, a = r && !i ? Rt : i?.icon;
    return o`
      <div class="insight">
        <se-icon
          plain
          .size=${20}
          .icon=${a}
          .fallback=${""}
          style=${`color:${i?.color ?? "var(--primary-color)"}`}
        ></se-icon>
        <p>${t.join(" ")}</p>
      </div>
    `;
  }
  renderCategories() {
    const e = this.result;
    if (e.by_category.length === 0)
      return c;
    const t = e.by_category[0].total || 1;
    return o`
      <div class="panel">
        <div class="sec">${this.localize("stat_where")}</div>
        ${e.by_category.map((r) => {
      const i = this.category(r.category_id), a = i?.color ?? Ki, s = i ? i.icon : Rt, n = i ? i.name.charAt(0).toUpperCase() : "";
      return o`
            <div class="cat">
              <div
                class="chip"
                style=${`background:color-mix(in srgb, ${a} 15%, transparent);color:${a}`}
              >
                <se-icon plain .size=${20} .icon=${s} .fallback=${n}></se-icon>
              </div>
              <div class="cb">
                <div class="t">
                  <span class="nm">${this.categoryName(r.category_id)}</span>
                  <span class="amt">${this.money(r.total)}</span>
                </div>
                <div class="track">
                  <i
                    style=${`width:${Math.max(3, r.total / t * 100)}%;background:${a}`}
                  ></i>
                </div>
              </div>
              <div class="pc">${Math.round(r.total / e.total * 100)}%</div>
            </div>
          `;
    })}
      </div>
    `;
  }
  renderMonths() {
    const e = this.result;
    if (e.by_month.length === 0)
      return c;
    const t = e.by_month.reduce((i, a) => a.total > i.total ? a : i), r = t.total || 1;
    return o`
      <div class="panel">
        <div class="sec">${this.localize("by_month")}</div>
        <div class="months">
          ${e.by_month.map((i) => {
      const a = i.month === t.month;
      return o`
              <div class="mo ${a ? "pk" : ""}">
                <div class="mv">${this.money(i.total)}</div>
                <div class="bx" style=${`height:${i.total / r * 100}%`}></div>
                <div class="ml">${Et(i.month, this.language)}</div>
              </div>
            `;
    })}
        </div>
      </div>
    `;
  }
  renderMembers() {
    const e = this.result;
    return e.by_member.length === 0 ? c : o`
      <div class="panel">
        <div class="sec">${this.localize("by_member")}</div>
        <div class="mem">
          ${e.by_member.map((t) => {
      const r = this.members.find((s) => s.id === t.member_id), i = r?.name ?? "?", a = t.paid - t.share;
      return o`
              <div class="mcard">
                <div class="top">
                  <div
                    class="avatar"
                    style=${`background:${r?.color ?? I(t.member_id)}`}
                  >
                    ${Z(i)}
                  </div>
                  <span class="nm">${i}</span>
                </div>
                <div class="kv">
                  <span>${this.localize("paid_total")}</span><b>${this.money(t.paid)}</b>
                </div>
                <div class="kv">
                  <span>${this.localize("consumed")}</span><b>${this.money(t.share)}</b>
                </div>
                ${this.renderBalance(a)}
              </div>
            `;
    })}
        </div>
      </div>
    `;
  }
  renderBalance(e) {
    return e > 0 ? o`<div class="bal up">
        ${this.fill("stat_owed", { amount: this.money(e) })}
      </div>` : e < 0 ? o`<div class="bal dn">
        ${this.fill("stat_owes", { amount: this.money(-e) })}
      </div>` : o`<div class="bal even">${this.localize("stat_even")}</div>`;
  }
  category(e) {
    return this.categories.find((t) => t.id === e);
  }
  categoryName(e) {
    return this.category(e)?.name ?? this.localize("no_category");
  }
  money(e) {
    return T(e, this.currency, this.language);
  }
  /** A translation with `{placeholders}` filled in — the grammar stays in the string. */
  fill(e, t) {
    let r = this.localize(e);
    for (const [i, a] of Object.entries(t))
      r = r.replace(`{${i}}`, a);
    return r;
  }
  pick(e) {
    e !== this.period && (this.period = e, this.load());
  }
  async load() {
    this.error = void 0;
    try {
      this.result = await this.api.getStatistics(
        this.groupId,
        this.period === Ge ? null : Number(this.period)
      );
    } catch (e) {
      this.error = v(e, this.localize);
    }
  }
};
H.styles = [
  E,
  x`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* The period picker, as one segmented control rather than a row of pills:
         a single choice among a few, which is what a segmented control is for. */
      .seg {
        display: inline-flex;
        align-self: flex-start;
        max-width: 100%;
        overflow-x: auto;
        gap: 2px;
        padding: 3px;
        border-radius: 12px;
        background: var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .seg button {
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        padding: 6px 13px;
        border-radius: 9px;
        cursor: pointer;
        white-space: nowrap;
      }

      .seg button[aria-pressed="true"] {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
      }

      .panel {
        background: var(--card-background-color, #fff);
        border-radius: var(--se-radius, 14px);
        box-shadow: var(--ha-card-box-shadow, 0 1px 2px rgba(20, 30, 40, 0.08));
        padding: 16px;
      }

      /* The hero. Follows the user's theme rather than a colour of our own, so
         it sits in whatever Home Assistant is wearing. */
      .hero {
        background: linear-gradient(
          150deg,
          var(--primary-color, #03a9f4),
          var(--dark-primary-color, #0277bd)
        );
        color: var(--text-primary-color, #fff);
      }

      .hero .lbl {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        opacity: 0.85;
      }

      .hero .big {
        font-size: 38px;
        font-weight: 800;
        letter-spacing: -1px;
        margin: 2px 0 12px;
        font-variant-numeric: tabular-nums;
      }

      .pills {
        display: flex;
        gap: 10px;
      }

      .pill {
        flex: 1;
        min-width: 0;
        padding: 9px 12px;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.16);
      }

      .pill .k {
        font-size: 11.5px;
        opacity: 0.85;
      }

      .pill .v {
        font-size: 17px;
        font-weight: 700;
        margin-top: 1px;
        font-variant-numeric: tabular-nums;
      }

      .pill .sub {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 1px;
        font-variant-numeric: tabular-nums;
      }

      /* The one sentence worth reading before the charts. */
      .insight {
        display: flex;
        gap: 11px;
        align-items: center;
        padding: 13px 14px;
        border-radius: 14px;
        background: var(--secondary-background-color, #eef4f0);
        background: color-mix(
          in srgb,
          var(--primary-color, #03a9f4) 10%,
          var(--card-background-color, #fff)
        );
      }

      .insight p {
        font-size: 13.5px;
        line-height: 1.45;
        color: var(--primary-text-color);
      }

      .sec {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        margin-bottom: 14px;
      }

      /* Where the money went: a ranking of bars, biggest first. A bar answers
         "how much of it" faster than a wedge does on a phone. */
      .cat {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cat + .cat {
        margin-top: 14px;
      }

      .chip {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cb {
        flex: 1;
        min-width: 0;
      }

      .cb .t {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 14.5px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .cb .t .nm {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cb .t .amt {
        font-variant-numeric: tabular-nums;
        flex: none;
      }

      .track {
        height: 7px;
        border-radius: 4px;
        background: var(--divider-color, rgba(0, 0, 0, 0.08));
        overflow: hidden;
      }

      .track i {
        display: block;
        height: 100%;
        border-radius: 4px;
      }

      .pc {
        width: 34px;
        flex: none;
        text-align: right;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      /* When, as bars: a run of months is read as time, and each month keeps its
         own figure above it. */
      .months {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 108px;
      }

      .mo {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        height: 100%;
        justify-content: flex-end;
      }

      .mo .bx {
        width: 100%;
        min-height: 3px;
        border-radius: 6px 6px 3px 3px;
        background: color-mix(
          in srgb,
          var(--primary-color, #03a9f4) 22%,
          transparent
        );
      }

      .mo.pk .bx {
        background: var(--primary-color, #03a9f4);
      }

      .mo .ml {
        font-size: 11px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .mo .mv {
        font-size: 10px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      .mo.pk .mv {
        color: var(--primary-color, #03a9f4);
        font-weight: 700;
      }

      /* Who paid against who consumed, as cards: their gap is the balance, said
         in the words the rest of the app says it in. */
      .mem {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .mcard {
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
        border-radius: 14px;
        padding: 13px;
      }

      .mcard .top {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 10px;
      }

      .mcard .nm {
        font-size: 14.5px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .kv {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        margin-bottom: 5px;
      }

      .kv b {
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }

      .bal {
        margin-top: 9px;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        border-radius: 9px;
        padding: 7px 4px;
        font-variant-numeric: tabular-nums;
      }

      .bal.up {
        color: var(--se-positive);
        background: color-mix(in srgb, var(--se-positive) 14%, transparent);
      }

      .bal.dn {
        color: var(--se-negative);
        background: color-mix(in srgb, var(--se-negative) 14%, transparent);
      }

      .bal.even {
        color: var(--secondary-text-color);
        background: var(--divider-color, rgba(0, 0, 0, 0.06));
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
  d()
], H.prototype, "result", 2);
ee([
  d()
], H.prototype, "period", 2);
ee([
  d()
], H.prototype, "error", 2);
H = ee([
  f("se-statistics")
], H);
var Fi = Object.defineProperty, Vi = Object.getOwnPropertyDescriptor, fe = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Vi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Fi(t, r, a), a;
};
let de = class extends g {
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
de.styles = E;
fe([
  l({ attribute: !1 })
], de.prototype, "api", 2);
fe([
  l({ attribute: !1 })
], de.prototype, "localize", 2);
fe([
  l({ attribute: !1 })
], de.prototype, "group", 2);
fe([
  l({ attribute: !1 })
], de.prototype, "members", 2);
fe([
  l({ attribute: !1 })
], de.prototype, "categories", 2);
fe([
  l({ type: String })
], de.prototype, "meId", 2);
fe([
  l({ type: String })
], de.prototype, "language", 2);
de = fe([
  f("se-statistics-dialog")
], de);
var Zi = Object.defineProperty, Ji = Object.getOwnPropertyDescriptor, b = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Ji(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Zi(t, r, a), a;
};
let _ = class extends g {
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
        this.error = v(e, this.localize), this.confirmingDelete = !1;
      } finally {
        this.busy = !1;
      }
    }, this.fabDown = (e) => {
      e.target.setPointerCapture(e.pointerId), this.fabFrom = { x: e.clientX, y: e.clientY }, this.addingPayment = !1;
    }, this.fabMove = (e) => {
      if (!this.fabFrom)
        return;
      const t = e.clientX - this.fabFrom.x, r = e.clientY - this.fabFrom.y;
      this.addingPayment = r < -40 || t < -40;
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
      const { entityType: t, entityId: r } = e.detail;
      if (t === "expense") {
        const a = this.expenses.find((s) => s.id === r);
        a && this.openExpense(a);
        return;
      }
      const i = this.payments.find((a) => a.id === r);
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
          this.error = v(e, this.localize);
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
          ${this.group.archived ? o`<div class="banner">${e("archived_hint")}</div>` : c}

          ${this.error ? o`<div class="error">${this.error}</div>` : c}

          ${this.renderHome()}
        </div>
      </div>

      ${this.addingPayment ? o`<div class="fab-hint">${e("new_payment")}</div>` : c}
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
            ${t.archived ? o`<span class="archived-tag">${e("archived")}</span>` : c}
          </button>
        </div>

        <button
          class="icon"
          aria-label=${e("more")}
          @click=${() => this.openMenu("more")}
        >
          <se-icon plain .icon=${"mdi:dots-vertical"} fallback="⋮" .size=${22}></se-icon>
        </button>

        ${this.menu ? this.renderMenu() : c}
        </div>
      </div>
      ${this.menu ? o`<div class="scrim" @click=${() => this.menu = void 0}></div>` : c}
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
            ${e.archived ? o`<span class="archived-tag">${this.localize("archived")}</span>` : c}
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
          </button>` : c}
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
          </button>` : c}
      ${this.myRole() === "admin" ? o`<button
            role="menuitem"
            class="danger separated"
            ?disabled=${this.busy}
            @click=${this.deleteGroup}
          >
            ${this.confirmingDelete ? e("confirm_delete") : e("delete_group")}
          </button>` : c}
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
      (t, r) => r.at.localeCompare(t.at) || r.addedAt.localeCompare(t.addedAt)
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
    const t = e.kind === "debt", r = t ? e.to_member_id : e.from_member_id, i = t ? e.from_member_id : e.to_member_id, s = this.memberById(r)?.color ?? I(r), n = this.mayEdit(e);
    return o`
      <button
        class=${`item ${n ? "item-button" : "item-fixed"}`}
        style=${`border-left-color:${s}`}
        ?disabled=${!n}
        @click=${() => this.openPayment(void 0, e)}
      >
        <se-icon
          icon=${t ? "mdi:hand-coin-outline" : "mdi:swap-horizontal"}
          fallback=${t ? "→" : "⇄"}
          .color=${s}
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">
            ${this.nameFrom(r)} → ${this.nameFrom(i)}
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
            ${Re(e.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount ${this.toneFor(r, i)}">
            ${T(e.amount, e.currency, this.language)}
          </span>
          <!-- What it weighs in the group, exactly as on an expense. -->
          ${e.currency === this.group.currency ? c : o`<span class="converted">
                ${T(
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
    const r = this.meId();
    return r === t ? "positive" : r === e ? "negative" : "neutral";
  }
  renderExpense(e) {
    const t = this.memberById(e.paid_by_member_id), r = this.categories.find((a) => a.id === e.category_id), i = this.mayEdit(e);
    return o`
      <button
        class=${`item ${i ? "item-button" : "item-fixed"}`}
        style=${`border-left-color:${t?.color ?? I(e.paid_by_member_id)}`}
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
            ${e.description ? o`<span class="note">${e.description}</span>` : c}
          </div>
          <!--
            Nothing where there is no category. "No category" is a fact about
            the form, not about the shop: it named an absence, on every row that
            had one, and said nothing anybody needed.
          -->
          ${r ? o`<div class="muted">${r.name}</div>` : c}
          <div class="muted">
            ${Re(e.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${T(e.amount, e.currency, this.language)}
          </span>
          <!--
            What it weighs in the group, under what was handed over at the till.
            Both, because both are true and neither answers the other: 100 USD
            is what was paid, 87,68 EUR is what it costs whoever shares it.
          -->
          ${e.currency === this.group.currency ? c : o`<span class="converted">
                ${T(
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
    const t = (e.shares ?? []).filter((r) => r.amount !== 0);
    return t.length === 0 ? c : o`
      <div class="stack-avatars">
        ${t.map((r) => {
      const i = this.memberById(r.member_id);
      return o`
            <div
              class="avatar small"
              title=${i?.name ?? "?"}
              style=${`background:${i?.color ?? I(r.member_id)}`}
            >
              ${Z(i?.name ?? "?")}
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
  renderAvatar(e, t, r) {
    const i = this.memberById(t);
    return o`
      <div
        class="avatar"
        title=${r ?? e}
        style=${`background:${i?.color ?? I(t)}`}
      >
        ${Z(e)}
      </div>
    `;
  }
  renderDialog() {
    return !this.dialog || !this.group ? c : this.dialog === "expense" ? o`
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
    const t = (this.result?.balances ?? []).filter((r) => r.amount !== 0).map((r) => r.member_id);
    return this.plusGone(t);
  }
  plusGone(e) {
    const t = new Set(e), r = this.pastMembers.filter(
      (i) => t.has(i.id) && !this.members.some((a) => a.id === i.id)
    );
    return [...this.members, ...r];
  }
  async load() {
    this.error = void 0;
    try {
      const [
        e,
        t,
        r,
        i,
        a,
        s,
        n,
        p,
        h
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
      this.group = e, this.groups = t, this.members = r, this.pastMembers = i, this.memberships = a, this.categories = s, this.expenses = n, this.payments = p, this.result = h;
    } catch (e) {
      this.error = v(e, this.localize), e?.code === "group_not_found" && this.dispatchEvent(
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
    return e ? t.filter((r) => this.haystack(r).includes(e)) : t;
  }
  haystack(e) {
    const t = (a) => this.memberById(a)?.name ?? "";
    if (e.kind === "payment") {
      const a = e.payment;
      return [
        this.localize("a_settlement"),
        a.description ?? "",
        t(a.from_member_id),
        t(a.to_member_id),
        ...this.amountNeedles(
          a.amount,
          a.currency,
          a.converted_amount
        )
      ].join(" ").toLowerCase();
    }
    const r = e.expense, i = this.categories.find((a) => a.id === r.category_id);
    return [
      r.title,
      r.description ?? "",
      i?.name ?? "",
      t(r.paid_by_member_id),
      ...this.amountNeedles(
        r.amount,
        r.currency,
        r.converted_amount
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
  amountNeedles(e, t, r) {
    const i = Ct(e, t, this.language);
    return t === this.group.currency ? i : [
      ...i,
      ...Ct(r, this.group.currency, this.language)
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
_.styles = [
  E,
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
b([
  l({ attribute: !1 })
], _.prototype, "api", 2);
b([
  l({ attribute: !1 })
], _.prototype, "hass", 2);
b([
  l({ type: Boolean })
], _.prototype, "narrow", 2);
b([
  l({ attribute: !1 })
], _.prototype, "localize", 2);
b([
  l({ type: String })
], _.prototype, "groupId", 2);
b([
  l({ type: String })
], _.prototype, "language", 2);
b([
  l({ type: String })
], _.prototype, "userId", 2);
b([
  d()
], _.prototype, "group", 2);
b([
  d()
], _.prototype, "groups", 2);
b([
  d()
], _.prototype, "menu", 2);
b([
  d()
], _.prototype, "members", 2);
b([
  d()
], _.prototype, "pastMembers", 2);
b([
  d()
], _.prototype, "memberships", 2);
b([
  d()
], _.prototype, "categories", 2);
b([
  d()
], _.prototype, "expenses", 2);
b([
  d()
], _.prototype, "payments", 2);
b([
  d()
], _.prototype, "result", 2);
b([
  d()
], _.prototype, "query", 2);
b([
  d()
], _.prototype, "loading", 2);
b([
  d()
], _.prototype, "error", 2);
b([
  d()
], _.prototype, "dialog", 2);
b([
  d()
], _.prototype, "prefill", 2);
b([
  d()
], _.prototype, "editedExpense", 2);
b([
  d()
], _.prototype, "editedPayment", 2);
b([
  d()
], _.prototype, "addingPayment", 2);
b([
  d()
], _.prototype, "busy", 2);
b([
  d()
], _.prototype, "confirmingDelete", 2);
_ = b([
  f("se-group-page")
], _);
class ot {
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
  updateGroup(t, r) {
    return this.call("update_group", { group_id: t, ...r });
  }
  /**
   * Hand a project to another member, who becomes its admin. The admin's alone.
   *
   * Whoever gives it up becomes an ordinary member — a project has one admin,
   * so this is giving it away, not sharing it — and may then leave, which
   * without this they never could.
   */
  transferAdmin(t, r) {
    return this.call("transfer_admin", {
      group_id: t,
      member_id: r
    });
  }
  archiveGroup(t, r) {
    return this.call("archive_group", { group_id: t, archived: r });
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
  subscribeGroup(t, r) {
    return this.hass.connection.subscribeMessage(r, {
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
  listMembers(t, r = !1) {
    return this.call("list_members", {
      group_id: t,
      include_left: r
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
  updateMember(t, r, i) {
    return this.call("update_member", {
      group_id: t,
      member_id: r,
      ...i
    });
  }
  /** Put an existing member back into a group they had left. */
  addMemberToGroup(t, r) {
    return this.call("add_member_to_group", {
      group_id: t,
      member_id: r
    });
  }
  removeMemberFromGroup(t, r) {
    return this.call("remove_member_from_group", {
      group_id: t,
      member_id: r
    });
  }
  // Categories
  listCategories(t) {
    return this.call("list_categories", { group_id: t });
  }
  createCategory(t) {
    return this.call("create_category", t);
  }
  updateCategory(t, r) {
    return this.call("update_category", { category_id: t, ...r });
  }
  deleteCategory(t) {
    return this.call("delete_category", { category_id: t });
  }
  // Expenses
  listExpenses(t, r = !0) {
    return this.call("list_expenses", { group_id: t, with_shares: r });
  }
  getExpense(t) {
    return this.call("get_expense", { expense_id: t });
  }
  createExpense(t) {
    return this.call("create_expense", t);
  }
  updateExpense(t, r) {
    return this.call("update_expense", { expense_id: t, ...r });
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
  restoreExpense(t, r) {
    return this.call("restore_expense", {
      group_id: t,
      expense_id: r
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
  updatePayment(t, r) {
    return this.call("update_payment", { payment_id: t, ...r });
  }
  deletePayment(t) {
    return this.call("delete_payment", { payment_id: t });
  }
  /** Bring a deleted payment back. See `restoreExpense`. */
  restorePayment(t, r) {
    return this.call("restore_payment", {
      group_id: t,
      payment_id: r
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
  getExchangeRate(t, r, i, a) {
    return this.call("get_exchange_rate", {
      group_id: t,
      base: r,
      quote: i,
      on: a
    });
  }
  /** Record a rate by hand. It becomes the last known one for the pair. */
  setExchangeRate(t, r, i, a, s) {
    return this.call("set_exchange_rate", {
      group_id: t,
      base: r,
      quote: i,
      on: a,
      rate: s
    });
  }
  // Statistics
  /** What the group spent. Leave `year` out for everything, ever. */
  getStatistics(t, r) {
    return this.call("get_statistics", {
      group_id: t,
      ...r ? { year: r } : {}
    });
  }
  // History
  /** What happened in the group, newest first. */
  listRevisions(t, r) {
    return this.call("list_revisions", {
      group_id: t,
      ...r ? { limit: r } : {}
    });
  }
  // `groupId` is required: a deleted expense can no longer say which group it
  // belonged to, and its history is exactly what is being asked for.
  listEntityRevisions(t, r) {
    return this.call("list_entity_revisions", {
      group_id: t,
      entity_id: r
    });
  }
  call(t, r = {}) {
    return this.hass.callWS({
      type: `shared_expenses/${t}`,
      ...r
    });
  }
}
var Qi = Object.defineProperty, Yi = Object.getOwnPropertyDescriptor, Be = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? Yi(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && Qi(t, r, a), a;
};
let ze = class extends g {
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
      const r = Xi();
      if (r) {
        this.groupId = r, this.replacePath(`/group/${r}`);
        return;
      }
      this.groupId = void 0;
    }, this.handleGroupSelected = (e) => {
      const t = e.detail.groupId;
      this.groupId = t, ea(t), this.replacePath(`/group/${t}`);
    }, this.goToDashboard = () => {
      this.groupId = void 0, this.replacePath("");
    }, this.handleGroupUnavailable = () => {
      ta(), this.goToDashboard();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.syncFromRoute(), window.addEventListener("popstate", this.syncFromRoute);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this.syncFromRoute);
  }
  willUpdate() {
    this.hass && !this.api && (this.api = new ot(this.hass));
  }
  render() {
    if (!this.hass || !this.api)
      return o``;
    const e = Zt(this.hass.locale?.language ?? this.hass.language), t = this.hass.locale?.language ?? this.hass.language;
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
    const t = this.route?.prefix ?? window.location.pathname.split("/")[1], r = t.startsWith("/") ? t : `/${t}`;
    history.replaceState(null, "", `${r}${e}`);
  }
};
ze.styles = x`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;
Be([
  l({ attribute: !1 })
], ze.prototype, "hass", 2);
Be([
  l({ type: Boolean })
], ze.prototype, "narrow", 2);
Be([
  l({ attribute: !1 })
], ze.prototype, "route", 2);
Be([
  d()
], ze.prototype, "groupId", 2);
ze = Be([
  f("shared-expenses-panel")
], ze);
const _t = "shared_expenses.last_group";
function Xi() {
  try {
    return window.localStorage.getItem(_t);
  } catch {
    return null;
  }
}
function ea(e) {
  try {
    window.localStorage.setItem(_t, e);
  } catch {
  }
}
function ta() {
  try {
    window.localStorage.removeItem(_t);
  } catch {
  }
}
var ra = Object.defineProperty, ia = Object.getOwnPropertyDescriptor, me = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? ia(t, r) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (a = (i ? n(t, r, a) : n(a)) || a);
  return i && a && ra(t, r, a), a;
};
let ae = class extends g {
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
    return { type: "custom:shared-expenses-card", group_id: (await new ot(e).listGroups(!1).catch(() => []))[0]?.id };
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
        const [r, i, a] = await Promise.all([
          t.getGroup(e),
          t.getBalances(e),
          // Everybody, including whoever left: leaving does not clear a debt, so
          // a settlement can still name them, and a name has to resolve.
          t.listMembers(e, !0)
        ]);
        this.currency = r.currency, this.balances = i.balances, this.settlements = i.settlements, this.members = a, this.error = void 0;
      } catch (r) {
        this.error = v(r, this.localize);
      } finally {
        this.loading = !1;
      }
  }
  get api() {
    return this.hass ? new ot(this.hass) : void 0;
  }
  get language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }
  get localize() {
    return Zt(this.language);
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
ae.styles = [
  E,
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
], ae.prototype, "hass", 2);
me([
  d()
], ae.prototype, "config", 2);
me([
  d()
], ae.prototype, "balances", 2);
me([
  d()
], ae.prototype, "settlements", 2);
me([
  d()
], ae.prototype, "members", 2);
me([
  d()
], ae.prototype, "currency", 2);
me([
  d()
], ae.prototype, "error", 2);
me([
  d()
], ae.prototype, "loading", 2);
ae = me([
  f("shared-expenses-card")
], ae);
const aa = window.customCards ??= [];
aa.push({
  type: "shared-expenses-card",
  name: "Shared Expenses",
  description: "Who owes what to whom, in one project."
});
export {
  ae as SharedExpensesCard,
  ze as SharedExpensesPanel
};
