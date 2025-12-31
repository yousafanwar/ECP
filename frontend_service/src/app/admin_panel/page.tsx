'use client'
import { useState } from "react";
import { PhotoIcon } from '@heroicons/react/24/solid'
import styles from "./admin.module.css";
import { CldUploadButton } from 'next-cloudinary';

const admin_panel = () => {

  const [showAddItemFields, setShowAddItemFields] = useState<boolean>(false);
  const [imageThumbnail, setImageThumbnail] = useState<string>("");
  const [formData, setFormData] = useState({
    productName: "",
    price: 0,
    sku: "",
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
        setImageThumbnail("");
        setFormData({
          productName: "",
          price: 0,
          sku: "",
          stockQuantity: 0,
          description: "",
          category: "",
          brand: "",
          fileUpload: "",
          imagePublicId: ""
        })
        alert(result.message);
      }
    } catch (err) {
      console.log("An error has occured", err);
    };

  };

  return (
    <>
      <h1 className={styles.header}>Admin panel</h1>
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
                    <label htmlFor="category" className="block text-sm/6 font-medium text-white">
                      Category
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                        <input
                          name="category"
                          type="text"
                          placeholder="Mens Clothing etc"
                          value={formData.category}
                          onChange={(e) => handleFormData(e)}
                          className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="brand" className="block text-sm/6 font-medium text-white">
                      Brand
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                        <input
                          name="brand"
                          type="text"
                          placeholder="Mens Clothing etc"
                          value={formData.brand}
                          onChange={(e) => handleFormData(e)}
                          className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                        />
                      </div>
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
                            <CldUploadButton uploadPreset="ecp_products" onSuccess={(result) => handleFileUpload(result)}/>
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

