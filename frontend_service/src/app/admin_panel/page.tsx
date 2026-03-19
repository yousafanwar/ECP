'use client'
import { useState } from "react";
import styles from "./admin.module.css";
import { AdminRoute } from "@/app/components/ProtectedRoute";
import AddProductPanel from "./panels/AddProductPanel";
import EditProductPanel from "./panels/EditProductPanel";
import AddImagesPanel from "./panels/AddImagesPanel";
import AddCategoryPanel from "./panels/AddCategoryPanel";
import AddBrandPanel from "./panels/AddBrandPanel";
import UserListPanel from "./panels/UserListPanel";

type View =
  | "products.add"
  | "products.edit"
  | "products.images"
  | "categories.add"
  | "brands.add"
  | "users.list";

const NAV = [
  {
    section: "Products",
    items: [
      { label: "Add Product", view: "products.add" as View },
      { label: "Edit Product", view: "products.edit" as View },
      { label: "Add Images", view: "products.images" as View },
    ],
  },
  {
    section: "Categories",
    items: [{ label: "Add Category", view: "categories.add" as View }],
  },
  {
    section: "Brands",
    items: [{ label: "Add Brand", view: "brands.add" as View }],
  },
  {
    section: "Users",
    items: [{ label: "View Users", view: "users.list" as View }],
  },
];

const AdminPanel = () => {
  const [activeView, setActiveView] = useState<View | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV.map(n => [n.section, false]))
  );

  const toggleSection = (section: string) =>
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const renderPanel = () => {
    if (!activeView) return (
      <div className={styles.welcome}>
        <p className={styles.welcomeText}>Supreme Commander, welcome to the control room.</p>
      </div>
    );
    switch (activeView) {
      case "products.add":    return <AddProductPanel />;
      case "products.edit":   return <EditProductPanel />;
      case "products.images": return <AddImagesPanel />;
      case "categories.add":  return <AddCategoryPanel />;
      case "brands.add":      return <AddBrandPanel />;
      case "users.list":      return <UserListPanel />;
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Admin Panel</h1>
          <p className={styles.sidebarSubtitle}>Control Room</p>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ section, items }) => {
            const isOpen = openSections[section];
            return (
              <div key={section} className={styles.navSection}>
                <button
                  className={styles.accordionTrigger}
                  onClick={() => toggleSection(section)}
                >
                  <span>{section}</span>
                  <svg
                    className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ""}`}
                    viewBox="0 0 20 20" fill="currentColor" width="12" height="12"
                  >
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" />
                  </svg>
                </button>
                {isOpen && (
                  <div className={styles.accordionContent}>
                    {items.map(({ label, view }) => (
                      <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`${styles.navItem} ${activeView === view ? styles.navItemActive : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <main className={styles.content}>
        <div className={styles.contentInner}>
          {renderPanel()}
        </div>
      </main>
    </div>
  );
};

const AdminPanelPage = () => (
  <AdminRoute>
    <AdminPanel />
  </AdminRoute>
);

export default AdminPanelPage;

