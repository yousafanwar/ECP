'use client'
import { useState } from "react";
import { PhotoIcon } from '@heroicons/react/24/solid'
import styles from "./admin.module.css";
import { CldUploadButton } from 'next-cloudinary';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Spinner, FullPageSpinner } from "../components/LoadingSpinners";

type UUID = string;
interface FormDataType {
  productName: string;
  price: number;
  sku: number;
  stockQuantity: number;
  description: string;
  category: UUID | null;
  brand: UUID | null;
  fileUpload: string;
  imagePublicId: string;
}
const admin_panel = () => {

  const [showAddItemFields, setShowAddItemFields] = useState<boolean>(false);
  const [imageThumbnail, setImageThumbnail] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ category_id: string, name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ brand_id: number, name: string, description: string }>>([]);
  const [selectedCategoryAndBrand, setSelectedCategoryAndBrand] = useState<{ category: string, brand: string }>({ category: "", brand: "" });
  const [loading, setLoading] = useState<{ fullPage: boolean, category: boolean, brand: boolean }>({ fullPage: false, category: false, brand: false });
  const [formData, setFormData] = useState<FormDataType>({
    productName: "",
    price: 0,
    sku: 0,
    stockQuantity: 0,
    description: "",
    category: "",
    brand: "",
    fileUpload: "",
    imagePublicId: ""
  });

  const handleFileUpload = (e: any) => {
    const publicId = e.info.public_id;
    const imageUrl = e.info.secure_url;
    const thumbnail = e.info.thumbnail_url;
    setFormData((prev) => ({ ...prev, fileUpload: imageUrl, imagePublicId: publicId }));
    setImageThumbnail(thumbnail);

    console.log("Upload successful! Public ID:", publicId, "Image URL:", imageUrl);
  };

  const handleFormData = (e: any) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const obj = {
      name: formData.productName,
      price: formData.price,
      sku: formData.sku,
      stock_quantity: formData.stockQuantity,
      description: formData.description,
      category_id: formData.category,
      brand_id: formData.brand,
      image_url: formData.fileUpload,
      imagePublicId: formData.imagePublicId
    };

    try {
      setLoading((prev) => ({ ...prev, fullPage: true }));
      const response = await fetch(`http://localhost:5000/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj)
      });
      const result = await response.json();
      if (!response.ok) {
        alert(`Error while adding product: ${result.message}`);
        throw new Error('request failed');
      } else {
        setLoading((prev) => ({ ...prev, fullPage: false }));
        setImageThumbnail("");
        setFormData({
          productName: "",
          price: 0,
          sku: 0,
          stockQuantity: 0,
          description: "",
          category: "category",
          brand: "brand",
          fileUpload: "",
          imagePublicId: ""
        })
        alert(result.message);
      }
    } catch (err) {
      console.log("An error has occured", err);
    };

  };

  const fetchCategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, category: true }));
      const response = await fetch('http://localhost:5000/categories');
      const result = await response.json();
      setLoading((prev) => ({ ...prev, category: false }));
      setCategories(result);
    } catch (err) {
      console.error(err);
    };
  }

  const fetchBrands = async () => {
    try {
      setLoading((prev) => ({ ...prev, brand: true }));
      const response = await fetch('http://localhost:5000/brands');
      const result = await response.json();
      setLoading((prev) => ({ ...prev, brand: false }));
      console.log('Brands fetched:', result);
      setBrands(result);
    } catch (err) {
      console.error(err);
    };
  }

  return (
    <>
      {loading.fullPage && <FullPageSpinner />}
      <h1 className={styles.header}>Admin panel</h1>
      <h1 className={styles.header}>Welcome to the control room, Mr. President!</h1>
      <button className={styles.addBtn} onClick={() => setShowAddItemFields(true)}>Add new item</button>
      {showAddItemFields && <>
        <form onSubmit={handleSubmit}>
          <div className={styles.centerDiv}>
            <div className="space-y-12">
              <div className="border-b border-white/10 pb-12">
                <h2 className="text-base/7 font-semibold text-white">Add new product</h2>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="productName" className="block text-sm/6 font-medium text-white">
                      Product name
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                        <input
                          name="productName"
                          type="text"
                          placeholder="Think pad"
                          value={formData.productName}
                          onChange={(e) => handleFormData(e)}
                          className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="price" className="block text-sm/6 font-medium text-white">
                      Price
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                        <input
                          name="price"
                          type="number"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => handleFormData(e)}
                          className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="sku" className="block text-sm/6 font-medium text-white">
                      SKU
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                        <input
                          name="sku"
                          type="text"
                          placeholder="123345678"
                          maxLength={12}
                          value={formData.sku}
                          onChange={(e) => handleFormData(e)}
                          className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="stockQuantity" className="block text-sm/6 font-medium text-white">
                      Stock quantity
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                        <input
                          name="stockQuantity"
                          type="number"
                          placeholder="0"
                          value={formData.stockQuantity}
                          onChange={(e) => handleFormData(e)}
                          className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="description" className="block text-sm/6 font-medium text-white">
                      Description
                    </label>
                    <div className="mt-2">
                      <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleFormData(e)}
                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                      />
                    </div>
                    <p className="mt-3 text-sm/6 text-gray-400">Write a few sentences about the product.</p>
                  </div>

                  <div className="sm:col-span-4">
                    <div className="mt-2">
                      <Menu as="div" className="relative w-full">
                        <MenuButton
                          type="button"
                          onClick={fetchCategories}
                          className="flex w-full items-center justify-between rounded-md
                   bg-white/5 px-3 py-2 text-sm font-semibold text-white
                   ring-1 ring-white/10 hover:bg-white/20
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {selectedCategoryAndBrand.category || "Category"}
                          <ChevronDownIcon className="size-5 text-gray-400" />
                          {loading.category && <Spinner />}
                        </MenuButton>

                        <MenuItems
                          transition
                          className="absolute z-10 mt-1 w-full origin-top-right rounded-md
                   bg-gray-800 ring-1 ring-white/10
                   transition data-closed:scale-95 data-closed:opacity-0"
                        >
                          {categories.map((ele) => (
                            <MenuItem key={ele.category_id}>
                              <button
                                type="button"
                                onClick={() => { setSelectedCategoryAndBrand((prev) => ({ ...prev, category: ele.name })); setFormData((prev) => ({ ...prev, category: ele.category_id.toString() })) }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-300
                         hover:bg-white/5 hover:text-white"
                              >
                                {ele.name}
                              </button>
                            </MenuItem>
                          ))}
                        </MenuItems>
                      </Menu>
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <div className="mt-2">
                      <Menu as="div" className="relative w-full">
                        <MenuButton
                          type="button"
                          onClick={fetchBrands}
                          className="flex w-full items-center justify-between rounded-md
                   bg-white/5 px-3 py-2 text-sm font-semibold text-white
                   ring-1 ring-white/10 hover:bg-white/20
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {selectedCategoryAndBrand.brand || "Brand"}
                          <ChevronDownIcon className="size-5 text-gray-400" />
                          {loading.brand && <Spinner />}
                        </MenuButton>

                        <MenuItems
                          transition
                          className="absolute z-10 mt-1 w-full origin-top-right rounded-md
                   bg-gray-800 ring-1 ring-white/10
                   transition data-closed:scale-95 data-closed:opacity-0"
                        >
                          {brands.map((ele) => (
                            <MenuItem key={ele.brand_id}>
                              <button
                                type="button"
                                onClick={() => { setSelectedCategoryAndBrand((prev) => ({ ...prev, brand: ele.name })); setFormData((prev) => ({ ...prev, brand: ele.brand_id.toString() })) }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-300
                         hover:bg-white/5 hover:text-white"
                              >
                                {ele.name}
                              </button>
                            </MenuItem>
                          ))}
                        </MenuItems>
                      </Menu>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="cover-photo" className="block text-sm/6 font-medium text-white">
                      Add Images
                    </label>
                    {imageThumbnail && <img src={imageThumbnail} alt="image" width={50} height={50} />}
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                      <div className="text-center">
                        <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-600" />
                        <div className="mt-4 flex text-sm/6 text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-300"
                          >
                            <CldUploadButton uploadPreset="ecp_products" onSuccess={(result) => handleFileUpload(result)} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs/5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className={styles.addBtn}>Submit</button>
        </form>
      </>}
    </>
  )
};

export default admin_panel;

