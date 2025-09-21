import React, { useState } from 'react'

export default function ProductForm({ onAdd }) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const [imageUrl, setImageUrl] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name || price == null || quantity == null) return alert('Please enter name, price and quantity')
    onAdd({ name, sku, category, price: Number(price), quantity: Number(quantity), imageUrl })
    setName(''); setSku(''); setCategory(''); setPrice(0); setQuantity(0); setImageUrl('')
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Product name" className="w-full border rounded px-3 py-2" />
      <input value={sku} onChange={e=>setSku(e.target.value)} placeholder="SKU (optional)" className="w-full border rounded px-3 py-2" />
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="w-full border rounded px-3 py-2" />
      <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="w-full border rounded px-3 py-2" />
      <input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="Quantity" className="w-full border rounded px-3 py-2" />
      <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="w-full border rounded px-3 py-2" />
      <button className="w-full bg-teal-600 text-white py-2 rounded">Add product</button>
    </form>
  )
}
