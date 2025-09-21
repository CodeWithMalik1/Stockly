import React from 'react'

export default function Cart({ cart = [], onRemove, onCheckout, onChangeQty }) {
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0)
  return (
    <div>
      {cart.length === 0 ? <div className="text-gray-500">Cart is empty</div> :
        <div className="space-y-2">
          {cart.map(it => (
            <div key={it.productId} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-500">₹{it.price} × {it.qty} = ₹{(it.price*it.qty).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" className="w-16 border rounded px-2 py-1" value={it.qty} onChange={e=>onChangeQty(it.productId, Number(e.target.value))} />
                <button onClick={()=>onRemove(it.productId)} className="px-2 py-1 border rounded text-red-600">Remove</button>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <div className="font-semibold">Total</div>
              <div>₹{total.toFixed(2)}</div>
            </div>
            <button onClick={onCheckout} className="mt-3 w-full bg-indigo-600 text-white py-2 rounded">Checkout</button>
          </div>
        </div>
      }
    </div>
  )
}
