'use client'
import { useRouter } from "next/navigation";

const AddProductBtn = () => {

  const router = useRouter();

  return (
    <button onClick={() => router.push('/admin_panel')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
      + Add Product
    </button>
  )
}

export default AddProductBtn;