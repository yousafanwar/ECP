'use client'
import { useState, useEffect, useRef } from "react";
import { apiGet, apiDelete, apiCall } from "@/lib/api";
import styles from "../admin.module.css";

interface Order {
  order_id: string;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  total: number;
  item_count: number;
}

interface OrderDetail {
  orderStatus: string;
  orderAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    type: string;
  } | null;
  orderItems: {
    name: string;
    quantity: number;
    price: number;
    image_url: string;
  }[];
}

const ALL_STATUSES = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-500",
  confirmed: "bg-sky-500",
  paid:      "bg-emerald-500",
  shipped:   "bg-violet-500",
  delivered: "bg-green-600",
  cancelled: "bg-rose-600",
};

export default function OrderListPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredOrders = orders.filter(o => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
      if (!fullName.includes(q) && !o.email.toLowerCase().includes(q) && !o.order_id.toLowerCase().includes(q)) return false;
    }
    if (statusFilter.length > 0 && !statusFilter.includes(o.status)) return false;
    if (dateFrom && new Date(o.created_at) < new Date(dateFrom)) return false;
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(o.created_at) > to) return false;
    }
    return true;
  });

  const toggleStatusFilter = (s: string) =>
    setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchTerm || statusFilter.length > 0 || dateFrom || dateTo;

  // View modal state
  const [viewOrder, setViewOrder] = useState<OrderDetail | null>(null);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Per-row updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet('/order');
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to load orders"); return; }
      setOrders(data.payload);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    setViewOrderId(orderId);
    setViewLoading(true);
    setViewOrder(null);
    try {
      const res = await apiGet(`/order/${orderId}`);
      const data = await res.json();
      if (res.ok) setViewOrder(data.payload);
    } catch (err) {
      console.error(err);
    } finally {
      setViewLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await apiCall(`/order/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    setDeletingId(orderId);
    try {
      const res = await apiDelete(`/order/${orderId}`);
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.order_id !== orderId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <h2 className={styles.panelTitle}>Orders</h2>

      {/* Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, email or order ID…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {/* Date From */}
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-xs whitespace-nowrap">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <label className="text-gray-500 text-xs whitespace-nowrap">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors whitespace-nowrap"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => toggleStatusFilter(s)}
              className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                statusFilter.includes(s)
                  ? `${STATUS_COLORS[s]} text-white border-transparent`
                  : 'bg-transparent text-gray-500 border-gray-300 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-gray-500 text-xs">
          {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading orders...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 text-sm">No orders found.</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-400 text-sm">No orders match the current filters.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Order ID</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Items</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.order_id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className="font-mono text-xs text-gray-400" title={o.order_id}>
                      {o.order_id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className={styles.td}>{o.first_name} {o.last_name}</td>
                  <td className={styles.td}>{o.email}</td>
                  <td className={styles.td}>{o.item_count}</td>
                  <td className={styles.td}>${o.total}</td>
                  <td className={styles.td}>
                    <div className="relative" ref={openDropdownId === o.order_id ? dropdownRef : null}>
                      <button
                        disabled={updatingId === o.order_id}
                        onClick={() => setOpenDropdownId(openDropdownId === o.order_id ? null : o.order_id)}
                        className={`flex items-center gap-1 text-xs text-white font-semibold px-2 py-1 rounded-full transition-opacity disabled:opacity-50 ${STATUS_COLORS[o.status] ?? 'bg-gray-500'}`}
                      >
                        {updatingId === o.order_id ? '…' : o.status}
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {openDropdownId === o.order_id && (
                        <div className="absolute left-0 top-8 z-30 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[120px]">
                          {ALL_STATUSES.map(s => (
                            <button
                              key={s}
                              onClick={() => { handleStatusChange(o.order_id, s); setOpenDropdownId(null); }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[s] ?? 'bg-gray-500'}`} />
                              <span className="text-gray-700 capitalize">{s}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className={styles.td}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewOrder(o.order_id)}
                        className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(o.order_id)}
                        disabled={deletingId === o.order_id}
                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === o.order_id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrderId && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setViewOrderId(null)}
        >
          <div
            className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 font-semibold text-lg">Order Details</h3>
              <button
                onClick={() => setViewOrderId(null)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-xs font-mono mb-4 break-all">{viewOrderId}</p>

            {viewLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : !viewOrder ? (
              <p className="text-red-400 text-sm">Failed to load order details.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Status</span>
                  <span className={`ml-2 text-xs text-white font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[viewOrder.orderStatus] ?? 'bg-gray-500'}`}>
                    {viewOrder.orderStatus}
                  </span>
                </div>

                {viewOrder.orderAddress && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Shipping Address</p>
                    <p className="text-gray-900 text-sm">
                      {viewOrder.orderAddress.street}, {viewOrder.orderAddress.city}
                      {viewOrder.orderAddress.state ? `, ${viewOrder.orderAddress.state}` : ''}, {viewOrder.orderAddress.country}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Items</p>
                  <div className="space-y-2">
                    {viewOrder.orderItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{item.name}</p>
                          <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gray-900 text-sm">${item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
