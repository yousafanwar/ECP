'use client'
import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Spinner, FullPageSpinner } from "../../components/LoadingSpinners";
import { apiGet, apiPut } from "@/lib/api";
import styles from "../admin.module.css";

const inputCls = "block w-full rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline outline-1 outline-gray-200 focus:outline-2 focus:outline-indigo-500";
const menuBtnCls = "flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900 ring-1 ring-gray-200 hover:bg-gray-100";
const menuItemsCls = "absolute z-10 mt-1 w-full rounded-md bg-white ring-1 ring-gray-200 max-h-60 overflow-y-auto shadow-lg";
const menuOptCls = "block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900";

interface ProductListItem {
  product_id: string;
  name: string;
}

interface EditFormData {
  name: string;
  price: string;
  sku: string;
  stock_quantity: string;
  description: string;
  category_id: string;
  brand_id: string;
}

export default function EditProductPanel() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState<EditFormData | null>(null);
  const [categories, setCategories] = useState<Array<{ category_id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ brand_id: number; name: string }>>([]);
  const [selectedLabels, setSelectedLabels] = useState({ category: "", brand: "" });
  const [loading, setLoading] = useState({ products: false, product: false, categories: false, brands: false, submit: false });

  const set = (key: keyof typeof loading, val: boolean) =>
    setLoading(prev => ({ ...prev, [key]: val }));

  const fetchProducts = async () => {
    try {
      set('products', true);
      const res = await apiGet('/product');
      const data = await res.json();
      setProducts(data.payload);
    } catch (err) { console.error(err); }
    finally { set('products', false); }
  };

  const fetchCategories = async () => {
    try {
      set('categories', true);
      const res = await apiGet('/categories');
      const data = await res.json();
      setCategories(data.payload);
    } catch (err) { console.error(err); }
    finally { set('categories', false); }
  };

  const fetchBrands = async () => {
    try {
      set('brands', true);
      const res = await apiGet('/brands');
      const data = await res.json();
      setBrands(data.payload);
    } catch (err) { console.error(err); }
    finally { set('brands', false); }
  };

  const loadProduct = async (productId: string, productName: string) => {
    try {
      set('product', true);
      setSelectedProduct({ id: productId, name: productName });
      const res = await apiGet(`/product/${productId}`);
      const data = await res.json();
      const p = data.payload;
      setFormData({
        name: p.product_title,
        price: String(p.price),
        sku: String(p.sku),
        stock_quantity: String(p.stock_quantity),
        description: p.description,
        category_id: p.category_id,
        brand_id: p.brand_id,
      });
      setSelectedLabels({ category: p.category_title, brand: p.brand_title });
    } catch (err) { console.error(err); }
    finally { set('product', false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !formData) return;
    const obj = {
      name: formData.name,
      price: Number(formData.price),
      sku: Number(formData.sku),
      stock_quantity: Number(formData.stock_quantity),
      description: formData.description,
      category_id: formData.category_id,
      brand_id: formData.brand_id,
    };
    try {
      set('submit', true);
      const res = await apiPut(`/product/${selectedProduct.id}`, obj);
      const result = await res.json();
      if (!res.ok) { alert(`Error: ${result.message}`); return; }
      alert(result.message);
    } catch (err) { console.error(err); }
    finally { set('submit', false); }
  };

  const handleClear = () => {
    setFormData(null);
    setSelectedProduct(null);
    setSelectedLabels({ category: "", brand: "" });
  };

  return (
    <>
      {(loading.product || loading.submit) && <FullPageSpinner />}
      <h2 className={styles.panelTitle}>Edit Product</h2>

      <div className={styles.panelForm}>
        {/* Product selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select product to edit</label>
          <Menu as="div" className="relative max-w-sm">
            <MenuButton type="button" onClick={fetchProducts} className={menuBtnCls}>
              {selectedProduct?.name || "Select a product"}
              <span className="flex items-center gap-1">
                {loading.products && <Spinner />}
                <ChevronDownIcon className="size-4 text-gray-400" />
              </span>
            </MenuButton>
            <MenuItems className={menuItemsCls}>
              {products.map(p => (
                <MenuItem key={p.product_id}>
                  <button type="button" className={menuOptCls}
                    onClick={() => loadProduct(p.product_id, p.name)}
                  >{p.name}</button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>

        {formData && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">

              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
                <input type="text" value={formData.name} className={inputCls}
                  onChange={e => setFormData(prev => ({ ...prev!, name: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" min="0" step="0.01" value={formData.price} className={inputCls}
                  onChange={e => setFormData(prev => ({ ...prev!, price: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={formData.sku} className={inputCls}
                  onChange={e => setFormData(prev => ({ ...prev!, sku: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock quantity</label>
                <input type="number" min="0" value={formData.stock_quantity} className={inputCls}
                  onChange={e => setFormData(prev => ({ ...prev!, stock_quantity: e.target.value }))}
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={formData.description} className={inputCls}
                  onChange={e => setFormData(prev => ({ ...prev!, description: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Menu as="div" className="relative w-full">
                  <MenuButton type="button" onClick={fetchCategories} className={menuBtnCls}>
                    {selectedLabels.category || "Select category"}
                    <span className="flex items-center gap-1">
                      {loading.categories && <Spinner />}
                      <ChevronDownIcon className="size-4 text-gray-400" />
                    </span>
                  </MenuButton>
                  <MenuItems className={menuItemsCls}>
                    {categories.map(c => (
                      <MenuItem key={c.category_id}>
                        <button type="button" className={menuOptCls}
                          onClick={() => { setSelectedLabels(p => ({ ...p, category: c.name })); setFormData(p => ({ ...p!, category_id: c.category_id })); }}
                        >{c.name}</button>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <Menu as="div" className="relative w-full">
                  <MenuButton type="button" onClick={fetchBrands} className={menuBtnCls}>
                    {selectedLabels.brand || "Select brand"}
                    <span className="flex items-center gap-1">
                      {loading.brands && <Spinner />}
                      <ChevronDownIcon className="size-4 text-gray-400" />
                    </span>
                  </MenuButton>
                  <MenuItems className={menuItemsCls}>
                    {brands.map(b => (
                      <MenuItem key={b.brand_id}>
                        <button type="button" className={menuOptCls}
                          onClick={() => { setSelectedLabels(p => ({ ...p, brand: b.name })); setFormData(p => ({ ...p!, brand_id: b.brand_id.toString() })); }}
                        >{b.name}</button>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>

            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.addBtn}>Save Changes</button>
              <button type="button" className={styles.cancelBtn} onClick={handleClear}>Clear</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
