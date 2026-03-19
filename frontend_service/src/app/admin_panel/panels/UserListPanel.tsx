'use client'
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import styles from "../admin.module.css";

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_deleted: boolean;
}

export default function UserListPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet('/users');
        const data = await res.json();
        if (!res.ok) { setError(data.message || "Failed to load users"); return; }
        setUsers(data.payload);
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <h2 className={styles.panelTitle}>Users</h2>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading users...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm">No users found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Joined</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} className={styles.tr}>
                  <td className={styles.td}>{u.first_name} {u.last_name}</td>
                  <td className={styles.td}>{u.email}</td>
                  <td className={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className={styles.td}>
                    <span className={u.is_deleted ? styles.badgeInactive : styles.badgeActive}>
                      {u.is_deleted ? "Inactive" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
