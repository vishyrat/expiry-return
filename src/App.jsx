import { useState, useCallback } from 'react'
import { supabase } from './supabaseClient'

// ─── helpers ────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]

const genRef = () => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2,'0')
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const yy = String(d.getFullYear()).slice(-2)
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `RET-${dd}${mm}${yy}-${rand}`
}

const isValidDate = (val, sep) => {
  const re = sep === '.' ? /^\d{2}\.\d{2}\.\d{4}$/ : /^\d{2}\/\d{2}\/\d{4}$/
  if (!re.test(val)) return false
  const parts = val.split(sep)
  const d = +parts[0], m = +parts[1], y = +parts[2]
  return d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2099
}

const blankProduct = () => ({
  id: Date.now() + Math.random(),
  product_name: '', brand: '', mrp: '', mfg_date: '', exp_date: '', quantity: ''
})

// ─── sub-components ──────────────────────────────────────────────────────────
const Field = ({ label, error, hint, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#64748b', marginBottom:5, letterSpacing:'.03em', textTransform:'uppercase' }}>
      {label}
    </label>
    {children}
    {hint && !error && <p style={{ fontSize:11, color:'#94a3b8', marginTop:3 }}>{hint}</p>}
    {error && <p style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{error}</p>}
  </div>
)

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '11px 14px',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
  borderRadius: 10,
  fontSize: 15,
  color: '#0f172a',
  background: hasError ? '#fff5f5' : '#fff',
  outline: 'none',
  transition: 'border-color .15s',
})

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, errors, onChange, onRemove, canRemove }) => {
  const e = errors || {}
  const upd = (field, val) => onChange(product.id, field, val)

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e2e8f0',
      borderRadius: 14,
      padding: '16px 16px 8px',
      marginBottom: 12,
      position: 'relative',
    }}>
      {/* card header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width:26, height:26, borderRadius:8, background:'#dcfce7',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:12, fontWeight:600, color:'#16a34a'
          }}>{index+1}</div>
          <span style={{ fontSize:13, fontWeight:500, color:'#475569' }}>Product {index+1}</span>
        </div>
        {canRemove && (
          <button onClick={() => onRemove(product.id)} style={{
            padding:'4px 10px', border:'1px solid #fca5a5', borderRadius:6,
            background:'#fff5f5', color:'#dc2626', fontSize:12, fontWeight:500
          }}>Remove</button>
        )}
      </div>

      <Field label="Product Name" error={e.product_name}>
        <input
          style={inputStyle(e.product_name)}
          value={product.product_name}
          onChange={ev => upd('product_name', ev.target.value)}
          placeholder="e.g. Maggi Noodles 70g"
        />
      </Field>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Field label="Brand" error={e.brand}>
          <input
            style={inputStyle(e.brand)}
            value={product.brand}
            onChange={ev => upd('brand', ev.target.value)}
            placeholder="e.g. Nestlé"
          />
        </Field>
        <Field label="MRP (₹)" error={e.mrp}>
          <input
            style={inputStyle(e.mrp)}
            type="number" min="0" step="0.01"
            value={product.mrp}
            onChange={ev => upd('mrp', ev.target.value)}
            placeholder="0.00"
          />
        </Field>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Field label="Mfg Date" hint="DD.MM.YYYY" error={e.mfg_date}>
          <input
            style={inputStyle(e.mfg_date)}
            value={product.mfg_date}
            onChange={ev => upd('mfg_date', ev.target.value)}
            placeholder="01.03.2024"
            maxLength={10}
          />
        </Field>
        <Field label="Expiry Date" hint="DD/MM/YYYY" error={e.exp_date}>
          <input
            style={inputStyle(e.exp_date)}
            value={product.exp_date}
            onChange={ev => upd('exp_date', ev.target.value)}
            placeholder="01/03/2025"
            maxLength={10}
          />
        </Field>
      </div>

      <Field label="Quantity (pieces)" error={e.quantity}>
        <input
          style={inputStyle(e.quantity)}
          type="number" min="1"
          value={product.quantity}
          onChange={ev => upd('quantity', ev.target.value)}
          placeholder="Number of pieces to return"
        />
      </Field>
    </div>
  )
}

// ─── Success Screen ────────────────────────────────────────────────────────────
const SuccessScreen = ({ refNumber, shopName, totalProducts, totalQty, onNew }) => (
  <div style={{ padding:'40px 20px', textAlign:'center', maxWidth:400, margin:'0 auto' }}>
    <div style={{
      width:72, height:72, borderRadius:'50%', background:'#dcfce7',
      display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <h2 style={{ fontSize:22, fontWeight:600, color:'#0f172a', marginBottom:6 }}>Return Submitted!</h2>
    <p style={{ fontSize:14, color:'#64748b', marginBottom:24, lineHeight:1.6 }}>
      Expired goods return for <strong>{shopName}</strong> has been recorded successfully.
    </p>

    <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'16px 20px', marginBottom:24, textAlign:'left' }}>
      <p style={{ fontSize:11, color:'#94a3b8', marginBottom:4, textTransform:'uppercase', letterSpacing:'.04em' }}>Reference Number</p>
      <p style={{ fontSize:18, fontWeight:600, color:'#16a34a', fontFamily:'DM Mono, monospace', marginBottom:14 }}>{refNumber}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 12px' }}>
          <p style={{ fontSize:20, fontWeight:600, color:'#0f172a' }}>{totalProducts}</p>
          <p style={{ fontSize:11, color:'#94a3b8' }}>Products</p>
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 12px' }}>
          <p style={{ fontSize:20, fontWeight:600, color:'#0f172a' }}>{totalQty}</p>
          <p style={{ fontSize:11, color:'#94a3b8' }}>Total Qty</p>
        </div>
      </div>
    </div>

    <p style={{ fontSize:12, color:'#94a3b8', marginBottom:20 }}>
      Screenshot this screen for your records.
    </p>

    <button onClick={onNew} style={{
      width:'100%', padding:'13px', background:'#16a34a', color:'#fff',
      border:'none', borderRadius:12, fontSize:15, fontWeight:600
    }}>
      + New Submission
    </button>
  </div>
)

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [retailer, setRetailer] = useState({
    exec_name: '', shop_name: '', shop_phone: '', visit_date: today(), area: ''
  })
  const [products, setProducts] = useState([blankProduct()])
  const [errors, setErrors] = useState({ retailer:{}, products:{} })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [apiError, setApiError] = useState('')

  const totalQty = products.reduce((s, p) => s + (parseInt(p.quantity) || 0), 0)

  // ── product handlers ──────────────────────────────────────────────────────
  const addProduct = () => setProducts(ps => [...ps, blankProduct()])

  const removeProduct = (id) => setProducts(ps => ps.filter(p => p.id !== id))

  const updateProduct = useCallback((id, field, val) => {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, [field]: val } : p))
  }, [])

  // ── validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const re = {}
    const pe = {}
    let ok = true

    if (!retailer.exec_name.trim()) { re.exec_name = 'Required'; ok = false }
    if (!retailer.shop_name.trim()) { re.shop_name = 'Required'; ok = false }
    if (!retailer.area.trim())      { re.area = 'Required'; ok = false }
    if (!retailer.visit_date)       { re.visit_date = 'Required'; ok = false }
    if (retailer.shop_phone && !/^\d{10}$/.test(retailer.shop_phone)) {
      re.shop_phone = 'Enter 10-digit number'; ok = false
    }

    products.forEach(p => {
      const e = {}
      if (!p.product_name.trim())             { e.product_name = 'Required'; ok = false }
      if (!p.brand.trim())                     { e.brand = 'Required'; ok = false }
      if (!p.mrp || isNaN(p.mrp) || +p.mrp < 0) { e.mrp = 'Enter valid MRP'; ok = false }
      if (!isValidDate(p.mfg_date, '.'))       { e.mfg_date = 'Use DD.MM.YYYY'; ok = false }
      if (!isValidDate(p.exp_date, '/'))       { e.exp_date = 'Use DD/MM/YYYY'; ok = false }
      if (!p.quantity || +p.quantity < 1)      { e.quantity = 'Min 1'; ok = false }
      if (Object.keys(e).length) pe[p.id] = e
    })

    setErrors({ retailer: re, products: pe })
    return ok
  }

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setApiError('')

    try {
      const ref = genRef()

      // 1 — insert return header
      const { data: returnData, error: returnErr } = await supabase
        .from('expired_returns')
        .insert([{
          ref_number:  ref,
          exec_name:   retailer.exec_name.trim(),
          shop_name:   retailer.shop_name.trim(),
          shop_phone:  retailer.shop_phone || null,
          visit_date:  retailer.visit_date,
          area:        retailer.area.trim(),
        }])
        .select()
        .single()

      if (returnErr) throw returnErr

      // 2 — insert all products linked to the return
      const productRows = products.map(p => ({
        return_id:    returnData.id,
        product_name: p.product_name.trim(),
        brand:        p.brand.trim(),
        mrp:          parseFloat(p.mrp),
        mfg_date:     p.mfg_date,
        exp_date:     p.exp_date,
        quantity:     parseInt(p.quantity),
      }))

      const { error: prodErr } = await supabase
        .from('return_products')
        .insert(productRows)

      if (prodErr) throw prodErr

      setSubmitted({
        refNumber:     ref,
        shopName:      retailer.shop_name.trim(),
        totalProducts: products.length,
        totalQty,
      })
    } catch (err) {
      console.error(err)
      setApiError(err.message || 'Submission failed. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── reset ─────────────────────────────────────────────────────────────────
  const handleNew = () => {
    setRetailer({ exec_name:'', shop_name:'', shop_phone:'', visit_date:today(), area:'' })
    setProducts([blankProduct()])
    setErrors({ retailer:{}, products:{} })
    setSubmitted(null)
    setApiError('')
  }

  const inp = inputStyle
  const re = errors.retailer

  // ── success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight:'100dvh', background:'#f8fafc', display:'flex', flexDirection:'column' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 20px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:600 }}>Expired Goods Return</span>
        </header>
        <SuccessScreen {...submitted} onNew={handleNew} />
      </div>
    )
  }

  // ── form ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100dvh', background:'#f8fafc' }}>
      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 20px', display:'flex', alignItems:'center', gap:10, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </div>
        <div>
          <p style={{ fontSize:15, fontWeight:600, lineHeight:1.2 }}>Expired Goods Return</p>
          <p style={{ fontSize:11, color:'#94a3b8' }}>Field Executive Form</p>
        </div>
      </header>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'16px 16px 32px' }}>

        {/* ── Retailer Section ── */}
        <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'16px 16px 8px', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:6, height:20, borderRadius:3, background:'#16a34a' }}/>
            <p style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>Retailer Details</p>
          </div>

          <Field label="Executive Name" error={re.exec_name}>
            <input style={inp(re.exec_name)} value={retailer.exec_name}
              onChange={e => setRetailer(r => ({...r, exec_name: e.target.value}))}
              placeholder="Your full name" />
          </Field>

          <Field label="Shop / Retailer Name" error={re.shop_name}>
            <input style={inp(re.shop_name)} value={retailer.shop_name}
              onChange={e => setRetailer(r => ({...r, shop_name: e.target.value}))}
              placeholder="e.g. Sharma General Store" />
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Field label="Shop Phone" error={re.shop_phone}>
              <input style={inp(re.shop_phone)} value={retailer.shop_phone} type="tel" maxLength={10}
                onChange={e => setRetailer(r => ({...r, shop_phone: e.target.value}))}
                placeholder="10-digit" />
            </Field>
            <Field label="Visit Date" error={re.visit_date}>
              <input style={inp(re.visit_date)} value={retailer.visit_date} type="date"
                onChange={e => setRetailer(r => ({...r, visit_date: e.target.value}))} />
            </Field>
          </div>

          <Field label="Area / Location" error={re.area}>
            <input style={inp(re.area)} value={retailer.area}
              onChange={e => setRetailer(r => ({...r, area: e.target.value}))}
              placeholder="e.g. Raipur, Civil Lines" />
          </Field>
        </div>

        {/* ── Summary bar ── */}
        {products.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
            {[
              { val: products.length, lbl: 'Products' },
              { val: totalQty, lbl: 'Total Qty' },
              { val: `₹${products.reduce((s,p) => s + ((parseFloat(p.mrp)||0) * (parseInt(p.quantity)||0)), 0).toFixed(0)}`, lbl: 'Total MRP' },
            ].map(s => (
              <div key={s.lbl} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                <p style={{ fontSize:18, fontWeight:600, color:'#16a34a' }}>{s.val}</p>
                <p style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{s.lbl}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Products Section ── */}
        <div style={{ marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:6, height:20, borderRadius:3, background:'#16a34a' }}/>
            <p style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>Expired Products</p>
          </div>

          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              errors={errors.products[p.id]}
              onChange={updateProduct}
              onRemove={removeProduct}
              canRemove={products.length > 1}
            />
          ))}

          <button onClick={addProduct} style={{
            width:'100%', padding:'12px', border:'1.5px dashed #bbf7d0',
            borderRadius:12, background:'#f0fdf4', color:'#16a34a',
            fontSize:13, fontWeight:500, display:'flex', alignItems:'center',
            justifyContent:'center', gap:6, marginBottom:16
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Another Product
          </button>
        </div>

        {/* ── API Error ── */}
        {apiError && (
          <div style={{ background:'#fff5f5', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 14px', marginBottom:14 }}>
            <p style={{ fontSize:13, color:'#dc2626' }}>⚠ {apiError}</p>
          </div>
        )}

        {/* ── Submit ── */}
        <button onClick={handleSubmit} disabled={submitting} style={{
          width:'100%', padding:'15px', background: submitting ? '#86efac' : '#16a34a',
          color:'#fff', border:'none', borderRadius:12, fontSize:16, fontWeight:600,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8
        }}>
          {submitting ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ animation:'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Submit Return Request
            </>
          )}
        </button>

        <p style={{ textAlign:'center', fontSize:11, color:'#94a3b8', marginTop:12 }}>
          All data is saved securely to your company database.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
