'use client';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { apiGet, apiPost } from "@/lib/api";
import { OrderItem, Address, OrderSummary } from "@/app/interfaces";
import { resetCount } from "@/app/store/cartSlice";

const PaymentPage = () => {
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId;
    const dispatch = useDispatch();

    const [order, setOrder] = useState<OrderSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");

    // Card form state — commented out until card payment is implemented
    // const [cardNumber, setCardNumber] = useState("");
    // const [cardHolder, setCardHolder] = useState("");
    // const [expiry, setExpiry] = useState("");
    // const [cvv, setCvv] = useState("");

    // Mobile wallet state — commented out until wallet payments are implemented
    // const [mobileNumber, setMobileNumber] = useState("");
    // const [mpin, setMpin] = useState("");

    const [step, setStep] = useState<"details" | "success">("details");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await apiGet(`/order/${orderId}`);
                if (!response.ok) throw new Error("Failed to fetch order");
                const result = await response.json();
                const payload = result.payload;

                const total = payload.orderItems.reduce(
                    (acc: number, item: OrderItem) => acc + item.price * item.quantity,
                    0
                );

                setOrder({
                    orderId: orderId as string,
                    items: payload.orderItems,
                    priceTotal: total,
                    shippingCost: 30,
                    paymentMethod: payload.paymentMethod || "",
                    address: payload.orderAddress,
                });

                // Only COD is supported for now; always default to cod
                setPaymentMethod("cod");
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    // Formatters kept for future use when card payment is re-enabled
    // const formatCardNumber = (value: string) => ...
    // const formatExpiry = (value: string) => ...

    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            const response = await apiPost(`/order/${orderId}/payment/cod`, {});

            if (!response.ok) throw new Error("Failed to confirm order");

            localStorage.removeItem('cartId');
            dispatch(resetCount());

            setStep("success");
        } catch (err) {
            console.error(err);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading payment details...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Order not found.</div>
            </div>
        );
    }

    const total = order.priceTotal + order.shippingCost;

    // ── Success Screen ──────────────────────────────────────────────────────────
    if (step === "success") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
                    <div className="text-7xl mb-4">📦</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
                    <p className="text-gray-600 mb-1 font-medium">Thank you for your order.</p>
                    <p className="text-gray-400 text-sm mb-6">
                        Order ID: <span className="font-mono text-gray-700">{order.orderId}</span>
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg p-4 mb-6 text-left text-sm">
                        <p className="font-semibold mb-1">💰 Cash on Delivery</p>
                        <p>Please keep <strong>${total}</strong> ready at the time of delivery.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount Due on Delivery</span>
                            <span className="font-bold text-gray-900">${total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-medium">Cash on Delivery</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Shipping to</span>
                            <span className="font-medium text-right max-w-[60%]">
                                {order.address.street}, {order.address.city}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => router.push("/orders")}
                        className="w-full mt-3 border border-black text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        View My Orders
                    </button>
                </div>
            </div>
        );
    }

    // ── Payment Form ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-white py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-2 text-gray-400">Payment</h1>
                <p className="text-center text-gray-500 mb-8 text-sm">Complete your purchase securely</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: Payment Form ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Payment Method Selector */}
                        <div className="bg-white text-black rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {/* Easypaisa — commented out until wallet payments are implemented */}
                                {/* <button onClick={() => setPaymentMethod("easypaisa")} ...>
                                    <img src="/EasyPaisa.png" ... /> Easypaisa
                                </button> */}

                                {/* JazzCash — commented out until wallet payments are implemented */}
                                {/* <button onClick={() => setPaymentMethod("jazzcash")} ...>
                                    <img src="/JazzCash.png" ... /> JazzCash
                                </button> */}

                                {/* Card — commented out until card payment is implemented */}
                                {/* <button onClick={() => setPaymentMethod("card")} ...>
                                    💳 Card
                                </button> */}

                                <button
                                    onClick={() => setPaymentMethod("cod")}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                        paymentMethod === "cod"
                                            ? "border-black bg-gray-100"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    <span className="text-2xl mb-1">💰</span>
                                    <span className="text-xs font-medium text-center">Cash on Delivery</span>
                                </button>
                            </div>
                        </div>

                        {/* Card Form — commented out until card payment is implemented */}
                        {/* {paymentMethod === "card" && ( ... )} */}

                        {/* Mobile Wallet Form — commented out until wallet payments are implemented */}
                        {/* {(paymentMethod === "easypaisa" || paymentMethod === "jazzcash") && ( ... )} */}

                        {/* Cash on Delivery */}
                        {paymentMethod === "cod" && (
                            <div className="bg-white text-black rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl">💰</span>
                                    <h2 className="text-xl font-semibold">Cash on Delivery</h2>
                                </div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded text-sm space-y-1">
                                    <p><strong>📦 How it works:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 mt-1">
                                        <li>Your order will be packed and dispatched.</li>
                                        <li>Pay <strong>${total}</strong> in cash upon delivery.</li>
                                        <li>Please keep exact change ready.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* No method selected */}
                        {!paymentMethod && (
                            <div className="bg-white text-black rounded-xl p-6 text-center text-gray-400">
                                Please select a payment method above to continue.
                            </div>
                        )}
                    </div>

                    {/* ── Right: Order Summary ── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white text-black rounded-xl p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
                                {order.items.map((item) => (
                                    <div key={item.name} className="flex gap-3">
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-14 h-14 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium leading-tight">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold">${item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Address */}
                            {order.address && (
                                <div className="border-t pt-4 mb-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Shipping to</p>
                                    <p className="text-sm font-medium">{order.address.street}</p>
                                    <p className="text-sm text-gray-600">{order.address.city}, {order.address.state}</p>
                                    <p className="text-sm text-gray-600">{order.address.country}</p>
                                </div>
                            )}

                            {/* Totals */}
                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>${order.priceTotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shipping</span>
                                    <span>${order.shippingCost}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span>${total}</span>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || !paymentMethod}
                                className="w-full bg-black text-white py-3 rounded-lg mt-5 font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : paymentMethod === "cod"
                                        ? `Place Order • $${total}`
                                        : paymentMethod
                                            ? `Pay $${total}`
                                            : "Select a Payment Method"}
                            </button>

                            <button
                                onClick={() => router.back()}
                                className="w-full mt-3 border border-black text-black py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                ← Back to Checkout
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                🔒 Secured &amp; encrypted payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
