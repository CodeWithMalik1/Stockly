import React from 'react'

export default function SalesList({ sales = [] }) {
  if (!sales.length) return <div className="text-gray-500">No sales yet</div>
  return (
    <div className="space-y-3">
      {sales.slice().reverse().map(s => (
        <div key={s.id} className="border rounded p-3">
          <div className="flex justify-between">
            <div className="font-medium">Sale • ₹{s.totalAmount}</div>
            <div className="text-sm text-gray-500">{new Date(s.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-sm mt-2">
            {s.items.map(it => (
              <div key={it.productId} className="flex justify-between">
                <div>{it.name} × {it.qty}</div>
                <div>₹{it.lineTotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
