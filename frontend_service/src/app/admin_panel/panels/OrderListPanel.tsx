'use client'
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
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

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-500",
  confirmed: "bg-blue-500",
  paid:      "bg-green-500",
  shipped:   "bg-purple-500",
  delivered: "bg-teal-500",
  cancelled: "bg-red-500",
};

export default function OrderListPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  return (
    <>
      <h2 className={styles.panelTitle}>Orders</h2>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading orders...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 text-sm">No orders found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Items</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.order_id} className={styles.tr}>
                  <td className={styles.td}>{o.first_name} {o.last_name}</td>
                  <td className={styles.td}>{o.email}</td>
                  <td className={styles.td}>{o.item_count}</td>
                  <td className={styles.td}>${o.total}</td>
                  <td className={styles.td}>
                    <span className={`text-xs text-white font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-500"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className={styles.td}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
