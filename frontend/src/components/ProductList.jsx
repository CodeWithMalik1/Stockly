import React, { useState } from 'react'

export default function ProductList({ products = [], onAddToCart, onUpdate, onDelete }) {
  const [editId, setEditId] = useState(null)
  const [editQty, setEditQty] = useState(0)

  return (
    <div className="space-y-3">
      {products.length === 0 && <div className="text-gray-500">No products yet</div>}
      {products.map(p => (
        <div key={p.id} className="flex items-center justify-between p-3 border rounded">
          <div>
            <div className="font-medium">{p.name} <span className="text-xs text-gray-500">({p.sku})</span></div>
            <div className="text-sm text-gray-600">{p.category} • ₹{p.price} • {p.quantity} units</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={()=>onAddToCart(p,1)} className="px-3 py-1 bg-emerald-600 text-white rounded">Add to cart</button>
            <button onClick={()=>{ setEditId(p.id); setEditQty(p.quantity) }} className="px-3 py-1 border rounded">Edit</button>
            <button onClick={()=>onDelete(p.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
          </div>

          {editId === p.id && (
            <div className="mt-2 w-full">
              <div className="flex items-center gap-2">
                <input type="number" value={editQty} onChange={e=>setEditQty(Number(e.target.value))} className="w-32 border rounded px-2 py-1" />
                <button onClick={()=>{ onUpdate(p.id, { quantity: editQty }); setEditId(null) }} className="px-3 py-1 bg-teal-600 text-white rounded">Save</button>
                <button onClick={()=>setEditId(null)} className="px-3 py-1 border rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
