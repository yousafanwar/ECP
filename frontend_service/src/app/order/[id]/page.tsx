'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { apiGet, apiPut, apiDelete } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  isHeroImage: boolean;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  type?: string;
}


const Order = () => {
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [priceTotal, setPriceTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [newAddress, setNewAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "",
    type: "both",
  })
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  const { user, isGuest, guestId } = useAuth();
  const currentUserId = user?.userId || guestId;

  useEffect(() => {
    const getOrderById = async () => {
      try {
        const response = await apiGet(`/order/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch the order');
        }
        const result = await response.json();
        setSavedAddress(result.payload.orderAddress);
        setOrderItems(result.payload.orderItems);
        
        const total = result.payload.orderItems.reduce(
          (acc: number, item: any) => acc + item.price * item.quantity,
          0
        );
        setPriceTotal(total);
      } catch (err: any) {
        console.error(err);
      }
    };

    if (orderId) {
      getOrderById();
    }
  }, [orderId]);

  const updateAddress = async () => {
    try {
      if (!currentUserId) {
        console.error('User ID not available');
        return;
      }

      setIsSavingAddress(true);

      const response = await apiPut(`/users/updateAddress/${currentUserId}`, {
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        country: newAddress.country,
        type: newAddress.type,
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      const result = await response.json();
      
      if (result?.payload) {
        setSavedAddress({
          street: result.payload.street,
          city: result.payload.city,
          state: result.payload.state,
          country: result.payload.country,
          type: result.payload.type,
        });
        alert(savedAddress ? 'Address updated successfully!' : 'Address added successfully!');
        setIsEditingAddress(false);
        setNewAddress({} as Address);
      }
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = () => {
    router.push(`/payment/${orderId}?method=${selectedPaymentMethod}`);
  };

  const backToCart = async () => {
    const cartId = localStorage.getItem('cartId');

    if (!cartId) {
      return;
    } else {
      try {
        const response = await apiDelete(`/order/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to delete order');
        }
        const result = await response.json();
        console.log('order deleted', result);
        router.push(`/cart/${cartId}`);
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-400">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white text-black rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Address</h2>
              </div>

              {!savedAddress && !isEditingAddress && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  borderLeft: '4px solid #f59e0b',
                  color: '#92400e',
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '0.375rem'
                }}>
                  <strong>⚠️ Attention:</strong> You must add a shipping or billing address to complete your order.
                </div>
              )}

              {savedAddress && !isEditingAddress ? (
                <div className="space-y-4">
                  <div>
                    {savedAddress.type && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded inline-block mb-3">
                        {savedAddress.type === 'both' ? 'Billing & Shipping' : savedAddress.type}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{savedAddress.street}</p>
                    <p className="text-gray-700">{savedAddress.country}</p>
                  </div>
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="mt-4 cursor-pointer px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Change address
                  </button>
                </div>
              ) : (
                <div>
                  {savedAddress && isEditingAddress && (
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="text-sm cursor-pointer text-red-500 mb-4 hover:underline"
                    >
                      ← Back to saved address
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Street *</label>
                      <input
                        type="text"
                        name="address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                        placeholder="House #, Street #, Area"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                        placeholder="Lahore"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                        placeholder="Punjab"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, country: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
                        placeholder="Pakistan"
                      />
                    </div>

                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Address Type
                    </label>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addressType"
                          value="billing"
                          checked={newAddress.type === 'billing'}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, type: e.target.value }))
                          }
                        />
                        <span>Billing</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addressType"
                          value="shipping"
                          checked={newAddress.type === 'shipping'}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, type: e.target.value }))
                          }
                        />
                        <span>Shipping</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addressType"
                          value="both"
                          checked={newAddress.type === 'both'}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, type: e.target.value }))
                          }
                        />
                        <span>Both</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={updateAddress}
                    disabled={isSavingAddress}
                    className="w-full bg-black cursor-pointer text-white py-3 rounded-lg mt-6 font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSavingAddress ? 'Saving...' : savedAddress ? 'Update address' : 'Add address'}
                  </button>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white text-black rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Select Payment Method</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Easypaisa */}
                <button
                  onClick={() => setSelectedPaymentMethod("easypaisa")}
                  className={`flex flex-col cursor-pointer items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === "easypaisa"
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="mb-2">
                    <img src="/EasyPaisa.png" alt="Easy Paisa" className="w-12 h-12 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-center">Easypaisa</span>
                </button>

                {/* JazzCash */}
                <button
                  onClick={() => setSelectedPaymentMethod("jazzcash")}
                  className={`flex flex-col cursor-pointer items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === "jazzcash"
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="mb-2">
                    <img src="/JazzCash.png" alt="Jazz Cash" className="w-12 h-12 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-center">JazzCash</span>
                </button>

                {/* Credit/Debit Card */}
                <button
                  onClick={() => setSelectedPaymentMethod("card")}
                  className={`flex flex-col cursor-pointer items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === "card"
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-3xl mb-2">💳</div>
                  <span className="text-sm font-medium text-center">Credit/Debit Card</span>
                </button>

                {/* Cash on Delivery */}
                <button
                  onClick={() => setSelectedPaymentMethod("cod")}
                  className={`flex flex-col cursor-pointer items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === "cod"
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-3xl mb-2">💰</div>
                  <span className="text-sm font-medium text-center">Cash on Delivery</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white text-black rounded-lg p-6 sticky top-4">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {orderItems.map((item) => (
                  <div key={item.name} className="flex gap-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">${item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span>Price Total</span>
                  <span>${priceTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$30</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>${priceTotal + 30}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading || !savedAddress || !selectedPaymentMethod}
                className="w-full bg-black cursor-pointer text-white py-3 rounded-lg mt-6 font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {!savedAddress ? 'Add Address First' : !selectedPaymentMethod ? 'Select Payment Method' : isLoading ? 'Processing...' : 'Proceed to Pay'}
              </button>

              <button
                onClick={backToCart}
                className="w-full cursor-pointer bg-transparent border border-black text-black py-3 rounded-lg mt-3 font-medium hover:bg-gray-100 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;