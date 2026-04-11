'use client';
import { useState, useEffect } from "react";
import { ProductData } from "@/app/interfaces";
import styles from "../product.module.css";
import AddToCartBtn from "@/app/components/buttons/AddToCartBtn";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

const ProductPage = ({ params }: { params: Promise<{ id: string }> }) => {

  const [result, setResult] = useState<ProductData | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [productQty, setProductQty] = useState<number>(1);
  const [productId, setProductId] = useState<string>("");
  const [disableIncrement, setDisableIncrement] = useState<boolean>(false);
  const [lowQty, setLowQty] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {

    const fetchProduct = async () => {
      const { id } = await params;
      const response = await apiGet(`/product/${id}`);
      const data = await response.json();
      if (data.payload.stock_quantity <= 3) {
        setLowQty(true)
      };
      setResult(data.payload);
      setMainImage(data.payload.heroImageData.image_url);
      setProductId(id);
    };

    fetchProduct()
  }, [])

  const navigateToCart = () => {
    const storesCartId = localStorage.getItem('cartId');
    if (storesCartId) {
      router.push(`/cart/${parseInt(storesCartId)}`);
    }
  };

  const getStockQty = async () => {
    try {
      const response = await apiGet(`/cart/check-stock/${productId}`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error('Failed to get stock quantity');
      }
      return result.payload
    } catch (err) {
      throw new Error(`Stock check failed: ${err}`);
    }
  }

  const handleQtyIncrement = async () => {
    try {

      const result = await getStockQty();
      console.log({
        'result': result,
        'productQty': productQty,
        'productQty >= result': productQty >= result
      })
      if (productQty >= result) {
        console.log('ETNER: productQty >= result ')
        setDisableIncrement(true);
        return;
      }
      setProductQty((prev) => prev + 1);

    } catch (err) {
      throw new Error(`Stock check failed: ${err}`);
    }
  };

  const handleQtydecrement = async () => {
    setProductQty((prev) => { return Math.max(1, prev - 1) })
    setDisableIncrement(false);
  };

  // Get all images: hero image first, then additional images
  const getAllImages = () => {
    if (!result) return [];
    const images = [result.heroImageData];
    if (result.images && result.images.length > 0) {
      images.push(...result.images);
    }
    return images;
  };

  return (
    <div className="bg-white min-h-screen">
      {result &&
        <div className={styles.productContainer}>
          <div className={styles.imageSection}>
            <img src={mainImage} alt="Product" className={styles.mainImage} />
            {getAllImages().length > 1 && (
              <div className={styles.thumbnailRow}>
                {getAllImages().map((img, index) => (
                  <img
                    key={index}
                    src={img.image_url}
                    alt={`Product view ${index + 1}`}
                    className={styles.thumbnail}
                    onClick={() => setMainImage(img.image_url)}
                    style={{
                      cursor: "pointer",
                      opacity: mainImage === img.image_url ? 1 : 0.6,
                      border: mainImage === img.image_url ? "2px solid #6366f1" : "2px solid #e2e8f0",
                      boxSizing: "border-box"
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className={styles.detailsSection}>
            <div className="flex items-center gap-2 mb-1">
              {result.brand_title && (
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{result.brand_title}</span>
              )}
              {result.category_title && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{result.category_title}</span>
              )}
            </div>
            <h1 className={styles.productTitle}>{result.product_title}</h1>
            <p className={styles.productPrice}>${result.price}</p>
            <p className={styles.productDescription}>
              {result.description}
            </p>
            {lowQty && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <svg
                  className="h-5 w-5 text-amber-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86l-7.4 12.82A1.5 1.5 0 004.2 19h15.6a1.5 1.5 0 001.31-2.32L13.71 3.86a1.5 1.5 0 00-2.42 0z"
                  />
                </svg>

                {result.stock_quantity <= 0 ? <span>
                  <strong>Out of stock</strong>
                </span> : <span>
                  Only <strong>{result.stock_quantity}</strong> left in stock — order soon.
                </span>}
              </div>
            )}
            <div className={styles.quantityContainer}>
              <button className={styles.qtyBtn} onClick={handleQtydecrement}>-</button>
              <span className={styles.qtyCount}>{productQty}</span>
              <button className={styles.qtyBtn} disabled={disableIncrement} onClick={handleQtyIncrement}>+</button>
            </div>
            {result.stock_quantity > 0 && <AddToCartBtn product_id={productId} qty={productQty} />}
            {result.stock_quantity > 0 && <button className={styles.goToCartBtn} onClick={navigateToCart}>Go to Cart</button>}
            <button className={styles.goToCartBtn} onClick={() => { router.push('/') }}>Continue Shopping</button>
            <div className={styles.productMeta}>
              <span><strong>Category:</strong> {result.category_title}</span>
              <span><strong>Brand:</strong> {result.brand_title}</span>
              <span><strong>About the Brand:</strong> {result.brand_description}</span>
              <span><strong>SKU:</strong> {result.sku}</span>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default ProductPage;