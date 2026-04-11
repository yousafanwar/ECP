'use client'
import { useState } from "react";
import { FullPageSpinner } from "../../components/LoadingSpinners";
import { apiPost } from "@/lib/api";
import styles from "../admin.module.css";

const inputCls = "block w-full rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline outline-1 outline-gray-200 focus:outline-2 focus:outline-indigo-500";

export default function AddBrandPanel() {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiPost('/brands', formData);
      const result = await res.json();
      if (!res.ok) { alert(`Error: ${result.message}`); return; }
      setFormData({ name: "", description: "" });
      alert(result.message);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <>
      {loading && <FullPageSpinner />}
      <h2 className={styles.panelTitle}>Add New Brand</h2>
      <form onSubmit={handleSubmit} className={styles.panelForm}>
        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand name</label>
            <input type="text" placeholder="Apple"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} placeholder="Brief description of this brand..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.addBtn}>Add Brand</button>
        </div>
      </form>
    </>
  );
}
