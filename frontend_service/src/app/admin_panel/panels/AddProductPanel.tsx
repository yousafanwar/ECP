'use client'
import { useState } from "react";
import { PhotoIcon } from '@heroicons/react/24/solid';
import { CldUploadButton } from 'next-cloudinary';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Spinner, FullPageSpinner } from "../../components/LoadingSpinners";
import { apiPost, apiGet } from "@/lib/api";
import styles from "../admin.module.css";

const inputCls = "block w-full rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline outline-1 outline-gray-200 focus:outline-2 focus:outline-indigo-500";
const menuBtnCls = "flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900 ring-1 ring-gray-200 hover:bg-gray-100";
const menuItemsCls = "absolute z-10 mt-1 w-full rounded-md bg-white ring-1 ring-gray-200 max-h-60 overflow-y-auto shadow-lg";
const menuOptCls = "block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900";

interface FormData {
  productName: string;
  price: number;
  sku: number;
  stockQuantity: number;
  description: string;
  category: string;
  brand: string;
  fileUpload: string;
  imagePublicId: string;
}

const EMPTY_FORM: FormData = {
  productName: "", price: 0, sku: 0, stockQuantity: 0,
  description: "", category: "", brand: "", fileUpload: "", imagePublicId: "",
};

export default function AddProductPanel() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [imageThumbnail, setImageThumbnail] = useState("");
  const [categories, setCategories] = useState<Array<{ category_id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ brand_id: number; name: string }>>([]);
  const [selectedLabels, setSelectedLabels] = useState({ category: "", brand: "" });
  const [loading, setLoading] = useState({ fullPage: false, category: false, brand: false });

  const handleFileUpload = (e: any) => {
    setFormData(prev => ({ ...prev, fileUpload: e.info.secure_url, imagePublicId: e.info.public_id }));
    setImageThumbnail(e.info.thumbnail_url);
  };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, category: true }));
      const res = await apiGet('/categories');
      const data = await res.json();
      setCategories(data.payload);
    } catch (err) { console.error(err); }
    finally { setLoading(prev => ({ ...prev, category: false })); }
  };

  const fetchBrands = async () => {
    try {
      setLoading(prev => ({ ...prev, brand: true }));
      const res = await apiGet('/brands');
      const data = await res.json();
      setBrands(data.payload);
    } catch (err) { console.error(err); }
    finally { setLoading(prev => ({ ...prev, brand: false })); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const obj = {
      name: formData.productName,
      price: Number(formData.price),
      sku: formData.sku,
      stock_quantity: Number(formData.stockQuantity),
      description: formData.description,
      category_id: formData.category,
      brand_id: formData.brand,
      image_url: formData.fileUpload,
      imagePublicId: formData.imagePublicId,
    };
    try {
      setLoading(prev => ({ ...prev, fullPage: true }));
      const res = await apiPost('/product', obj);
      const result = await res.json();
      if (!res.ok) { alert(`Error: ${result.message}`); return; }
      setFormData(EMPTY_FORM);
      setImageThumbnail("");
      setSelectedLabels({ category: "", brand: "" });
      alert(result.message);
    } catch (err) { console.error(err); }
    finally { setLoading(prev => ({ ...prev, fullPage: false })); }
  };

  return (
    <>
      {loading.fullPage && <FullPageSpinner />}
      <h2 className={styles.panelTitle}>Add New Product</h2>
      <form onSubmit={handleSubmit} className={styles.panelForm}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">

          <div className="sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
            <input name="productName" type="text" placeholder="ThinkPad"
              value={formData.productName}
              onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input name="price" type="number" min="0" step="0.01" placeholder="0.00"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: e.target.value as any }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input name="sku" type="text" placeholder="123456789" maxLength={12}
              value={formData.sku}
              onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value as any }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock quantity</label>
            <input name="stockQuantity" type="number" min="0" placeholder="0"
              value={formData.stockQuantity}
              onChange={e => setFormData(prev => ({ ...prev, stockQuantity: e.target.value as any }))}
              className={inputCls}
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={3} placeholder="Describe the product..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Menu as="div" className="relative w-full">
              <MenuButton type="button" onClick={fetchCategories} className={menuBtnCls}>
                {selectedLabels.category || "Select category"}
                <span className="flex items-center gap-1">
                  {loading.category && <Spinner />}
                  <ChevronDownIcon className="size-4 text-gray-400" />
                </span>
              </MenuButton>
              <MenuItems className={menuItemsCls}>
                {categories.map(c => (
                  <MenuItem key={c.category_id}>
                    <button type="button" className={menuOptCls}
                      onClick={() => { setSelectedLabels(p => ({ ...p, category: c.name })); setFormData(p => ({ ...p, category: c.category_id })); }}
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
                  {loading.brand && <Spinner />}
                  <ChevronDownIcon className="size-4 text-gray-400" />
                </span>
              </MenuButton>
              <MenuItems className={menuItemsCls}>
                {brands.map(b => (
                  <MenuItem key={b.brand_id}>
                    <button type="button" className={menuOptCls}
                      onClick={() => { setSelectedLabels(p => ({ ...p, brand: b.name })); setFormData(p => ({ ...p, brand: b.brand_id.toString() })); }}
                    >{b.name}</button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
            {imageThumbnail && (
              <img src={imageThumbnail} alt="thumbnail" width={64} height={64} className="mb-2 rounded object-cover h-16 w-16" />
            )}
            <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
              <div className="text-center">
                <PhotoIcon className="mx-auto size-10 text-gray-600 mb-2" />
                <CldUploadButton uploadPreset="ecp_products" onSuccess={handleFileUpload}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.addBtn}>Add Product</button>
        </div>
      </form>
    </>
  );
}
