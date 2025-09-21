import React, { useEffect, useState } from 'react'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import SalesList from './components/SalesList'

const API = 'http://localhost:5000/api'

export default function App() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [cart, setCart] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [me, setMe] = useState(null)

  async function load() {
    const p = await fetch(`${API}/products`).then(r=>r.json()).then(d=>d.products||[])
    setProducts(p)
    if (token) {
      // try to load sales (requires auth)
      const s = await fetch(`${API}/sales`, { headers: { Authorization: 'Bearer ' + token } }).then(r=>r.json()).then(d=>d.sales||[])
      setSales(s)
    } else {
      setSales([])
    }
  }
  useEffect(()=>{ load() }, [token])

  async function addProduct(prod) {
    await fetch(`${API}/products`, { method:'POST', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify(prod) })
    await load()
  }

  async function updateProduct(id, updates) {
    await fetch(`${API}/products/${id}`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify(updates) })
    await load()
  }

  async function deleteProduct(id) {
    if(!confirm('Delete product?')) return
    await fetch(`${API}/products/${id}`, { method:'DELETE', headers:{ Authorization: 'Bearer ' + token } })
    await load()
  }

  function addToCart(product, qty=1) {
    setCart(prev => {
      const existing = prev.find(i=>i.productId===product.id)
      if (existing) return prev.map(i => i.productId===product.id ? {...i, qty: i.qty + qty} : i)
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty }]
    })
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i=>i.productId!==productId))
  }

  async function checkout() {
    if (cart.length===0) return alert('Cart is empty')
    // validate quantities against products
    for (const it of cart) {
      const p = products.find(pp => pp.id === it.productId)
      if (!p) return alert('Product missing: ' + it.name)
      if (p.quantity < it.qty) return alert(`Insufficient stock for ${p.name}`)
    }
    if (!token) return alert('You must be logged in to checkout')
    const payload = { items: cart.map(i=>({ productId: i.productId, qty: i.qty })) }
    const res = await fetch(`${API}/sales`, { method:'POST', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify(payload) })
    if (!res.ok) {
      const err = await res.json().catch(()=>({ error:'unknown' }))
      return alert('Checkout error: '+ (err.error || 'unknown'))
    }
    const sale = await res.json()
    alert(`Sale complete! ₹${sale.totalAmount}`)
    setCart([])
    await load()
  }

  async function handleLogin(e) {
    e.preventDefault()
    const form = e.target
    const username = form.username.value
    const password = form.password.value
    const res = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) })
    const data = await res.json()
    if (!res.ok) return alert(data.error || 'Login failed')
    setToken(data.token)
    localStorage.setItem('token', data.token)
    setMe(data.user)
    form.reset()
  }

  function logout() {
    setToken('')
    localStorage.removeItem('token')
    setMe(null)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">🛒 Supermarket Manager</h1>
        <div className="text-sm text-gray-600">Backend: <a className="text-teal-600" href="http://localhost:5000" target="_blank">http://localhost:5000</a></div>
      </header>

      <div className="mb-4 flex justify-end gap-4">
        {me ? (
          <div className="text-sm">
            Logged in as <strong>{me.username}</strong> <button onClick={logout} className="ml-2 px-2 py-1 border rounded">Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex items-center gap-2">
            <input name="username" placeholder="username" className="border rounded px-2 py-1" />
            <input name="password" type="password" placeholder="password" className="border rounded px-2 py-1" />
            <button className="px-3 py-1 bg-indigo-600 text-white rounded">Login</button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Products</h2>
            <ProductList products={products} onAddToCart={addToCart} onUpdate={updateProduct} onDelete={deleteProduct} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Sales history</h2>
            <SalesList sales={sales} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Add / Edit product</h2>
            <ProductForm onAdd={addProduct} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Cart</h2>
            <Cart cart={cart} onRemove={removeFromCart} onCheckout={checkout} onChangeQty={(id,qty)=> setCart(prev=>prev.map(i=>i.productId===id?{...i,qty}:i))} />
          </div>
        </aside>
      </div>
    </div>
  )
}
