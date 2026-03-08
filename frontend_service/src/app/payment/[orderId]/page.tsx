'use client';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { OrderItem, Address, OrderSummary } from "@/app/interfaces";

const PaymentPage = () => {
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId;

    const [order, setOrder] = useState<OrderSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("");

    // Card form state
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    // Mobile wallet state
    const [mobileNumber, setMobileNumber] = useState("");
    const [mpin, setMpin] = useState("");

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

                // Pre-select payment method passed via query param
                const searchParams = new URLSearchParams(window.location.search);
                const method = searchParams.get("method");
                if (method) setPaymentMethod(method);
                else if (payload.paymentMethod) setPaymentMethod(payload.paymentMethod);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    const formatCardNumber = (value: string) =>
        value
            .replace(/\D/g, "")
            .slice(0, 16)
            .replace(/(.{4})/g, "$1 ")
            .trim();

    const formatExpiry = (value: string) =>
        value
            .replace(/\D/g, "")
            .slice(0, 4)
            .replace(/^(\d{2})(\d)/, "$1/$2");

    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            const response = await apiPost(`/payment/process`, {
                orderId,
                paymentMethod,
                ...(paymentMethod === "card" && { cardNumber, cardHolder, expiry, cvv }),
                ...(["easypaisa", "jazzcash"].includes(paymentMethod) && { mobileNumber, mpin }),
            });

            if (!response.ok) throw new Error("Payment failed");

            setStep("success");
        } catch (err) {
            console.error(err);
            alert("Payment failed. Please try again.");
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
                    <div className="text-7xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-500 mb-1">Your order has been placed.</p>
                    <p className="text-gray-400 text-sm mb-6">
                        Order ID: <span className="font-mono text-gray-700">{order.orderId}</span>
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-bold text-gray-900">${total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-medium capitalize">{paymentMethod}</span>
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
                                {[
                                    { id: "easypaisa", label: "Easypaisa", img: "/EasyPaisa.png" },
                                    { id: "jazzcash", label: "JazzCash", img: "/JazzCash.png" },
                                    { id: "card", label: "Card", emoji: "💳" },
                                    { id: "cod", label: "Cash on Delivery", emoji: "💰" },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === method.id
                                                ? "border-black bg-gray-100"
                                                : "border-gray-200 hover:border-gray-400"
                                            }`}
                                    >
                                        {method.img ? (
                                            <img src={method.img} alt={method.label} className="w-10 h-10 object-contain mb-1" />
                                        ) : (
                                            <span className="text-2xl mb-1">{method.emoji}</span>
                                        )}
                                        <span className="text-xs font-medium text-center">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Card Form */}
                        {paymentMethod === "card" && (
                            <div className="bg-white text-black rounded-xl p-6 space-y-4">
                                <h2 className="text-xl font-semibold mb-2">Card Details</h2>

                                {/* Card Preview */}
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl p-5 mb-4 shadow-lg">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-xs text-gray-400 uppercase tracking-widest">Credit / Debit</span>
                                        <span className="text-2xl">💳</span>
                                    </div>
                                    <p className="text-lg font-mono tracking-widest mb-4">
                                        {cardNumber || "•••• •••• •••• ••••"}
                                    </p>
                                    <div className="flex justify-between text-sm">
                                        <span>{cardHolder || "FULL NAME"}</span>
                                        <span>{expiry || "MM/YY"}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Card Number *</label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cardholder Name *</label>
                                    <input
                                        type="text"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                        placeholder="JOHN DOE"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Expiry *</label>
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CVV *</label>
                                        <input
                                            type="password"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                            placeholder="•••"
                                            maxLength={4}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Wallet Form */}
                        {(paymentMethod === "easypaisa" || paymentMethod === "jazzcash") && (
                            <div className="bg-white text-black rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <img
                                        src={paymentMethod === "easypaisa" ? "/EasyPaisa.png" : "/JazzCash.png"}
                                        alt={paymentMethod}
                                        className="w-10 h-10 object-contain"
                                    />
                                    <h2 className="text-xl font-semibold capitalize">{paymentMethod} Details</h2>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 rounded text-sm">
                                    💡 Enter your registered mobile number and MPIN to authorize the payment.
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                        placeholder="03XXXXXXXXX"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">MPIN *</label>
                                    <input
                                        type="password"
                                        value={mpin}
                                        onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="••••••"
                                        maxLength={6}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono"
                                    />
                                </div>
                            </div>
                        )}

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
