'use client';
import { useState, useEffect } from "react";
import { productData } from "@/interfaces";
import styles from "../product.module.css";
import AddToCartBtn from "@/app/components/buttons/AddToCartBtn";
import { useRouter } from "next/navigation";

const ProductPage = ({ params }: { params: { id: number } }) => {

  const [result, setResult] = useState<productData | null>(null);
  const [productQty, setProductQty] = useState<number>(1);
  const [productId, setProductId] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {

    const fetchProduct = async () => {
      const { id } = await params;
      const response = await fetch(`http://localhost:5000/product/${id}`);
      const data = await response.json();
      setResult(data.payload[0]);
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

  return (
    <div>
      {result &&
        <div className={styles.productContainer}>
          <div className={styles.imageSection}>
            <img src={result.image_url} alt="Product" className={styles.mainImage} />
            <div className={styles.thumbnailRow}>
              <img src="/images/sample.jpg" className={styles.thumbnail} />
              <img src="/images/sample2.jpg" className={styles.thumbnail} />
            </div>
          </div>
          <div className={styles.detailsSection}>
            <h1 className={styles.productTitle}>{result.product_title}</h1>
            <p className={styles.productPrice}>${result.price}</p>
            <p className={styles.productDescription}>
              {result.description}
            </p>
            <div className={styles.quantityContainer}>
              <button className={styles.qtyBtn} onClick={() => { setProductQty((prev) => { return Math.max(1, prev - 1) }) }}>-</button>
              <span className={styles.qtyCount}>{productQty}</span>
              <button className={styles.qtyBtn} onClick={() => { setProductQty(productQty + 1) }}>+</button>
            </div>
            <AddToCartBtn product_id={productId} qty={productQty} />
            <button className={styles.goToCartBtn} onClick={navigateToCart}>Go to Cart</button>
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