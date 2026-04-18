'use client'
import { useState } from "react";
import { PhotoIcon } from '@heroicons/react/24/solid';
import { CldUploadButton } from 'next-cloudinary';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Spinner, FullPageSpinner } from "../../components/LoadingSpinners";
import { apiGet, apiPost } from "@/lib/api";
import styles from "../admin.module.css";

const menuBtnCls = "flex w-full items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900 ring-1 ring-gray-200 hover:bg-gray-100";
const menuItemsCls = "absolute z-10 mt-1 w-full rounded-md bg-white ring-1 ring-gray-200 max-h-60 overflow-y-auto shadow-lg";
const menuOptCls = "block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900";
const productMenuOptCls = "flex w-full items-center gap-2 text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 min-h-[2.75rem]";
const heroThumbCls = "h-8 w-8 shrink-0 rounded object-cover ring-1 ring-gray-200 bg-gray-100";

interface ProductListItem { product_id: string; name: string; image_url: string; }
interface UploadedImage { url: string; thumbnail: string; }

export default function AddImagesPanel() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; image_url: string } | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await apiGet('/product');
      const data = await res.json();
      setProducts(data.payload);
    } catch (err) { console.error(err); }
    finally { setLoadingProducts(false); }
  };

  const handleFileUpload = (e: any) => {
    setUploadedImages(prev => [...prev, { url: e.info.secure_url, thumbnail: e.info.thumbnail_url }]);
  };

  const removeImage = (idx: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!selectedProduct || uploadedImages.length === 0) return;
    try {
      setSubmitting(true);
      const res = await apiPost(`/product/${selectedProduct.id}/images`, {
        image_urls: uploadedImages.map(i => i.url),
      });
      const result = await res.json();
      if (!res.ok) { alert(`Error: ${result.message}`); return; }
      setUploadedImages([]);
      alert(result.message);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      {submitting && <FullPageSpinner />}
      <h2 className={styles.panelTitle}>Add Images to Product</h2>

      <div className={styles.panelForm}>
        {/* Product selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select product</label>
          <Menu as="div" className="relative max-w-sm">
            <MenuButton type="button" onClick={fetchProducts} className={menuBtnCls}>
              <span className="flex min-w-0 flex-1 items-center gap-2">
                {selectedProduct?.image_url ? (
                  <img src={selectedProduct.image_url} alt="" className={heroThumbCls} width={32} height={32} />
                ) : null}
                <span className="truncate">{selectedProduct?.name || "Select a product"}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {loadingProducts && <Spinner />}
                <ChevronDownIcon className="size-4 text-gray-400" />
              </span>
            </MenuButton>
            <MenuItems className={menuItemsCls}>
              {products.map(p => (
                <MenuItem key={p.product_id}>
                  <button type="button" className={productMenuOptCls}
                    onClick={() => setSelectedProduct({ id: p.product_id, name: p.name, image_url: p.image_url })}
                  >
                    <img src={p.image_url} alt="" className={heroThumbCls} width={32} height={32} />
                    <span className="min-w-0 truncate">{p.name}</span>
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>

        {/* Upload area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload images</label>

          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.thumbnail} alt={`upload-${idx}`} className="rounded object-cover h-16 w-16" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
            <div className="text-center">
              <PhotoIcon className="mx-auto size-10 text-gray-600 mb-2" />
              <CldUploadButton uploadPreset="ecp_products" onSuccess={handleFileUpload}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Each click adds one image. Upload as many as needed.</p>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedProduct || uploadedImages.length === 0}
            className={`${styles.addBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Save {uploadedImages.length > 0 ? `${uploadedImages.length} ` : ""}Image{uploadedImages.length !== 1 ? "s" : ""}
          </button>
          {uploadedImages.length > 0 && (
            <button type="button" className={styles.cancelBtn} onClick={() => setUploadedImages([])}>
              Clear all
            </button>
          )}
        </div>
      </div>
    </>
  );
}
