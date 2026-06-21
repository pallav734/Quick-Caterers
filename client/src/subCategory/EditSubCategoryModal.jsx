    import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { getCategory } from "../api/categoryApi";
import { updateSubCategory } from "../api/subCategoryApi";

const EditSubCategoryModal = ({
  subCategory,
  onClose,
  refetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    images: null,
    isActive: true,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategory({
          page: 1,
          limit: 100,
        });

        setCategories(res.data?.category || []);
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (subCategory) {
      setForm({
        name: subCategory.name || "",
        description: subCategory.description || "",
        category: subCategory.category?._id || "",
        images: null,
        isActive: subCategory.isActive ?? true,
      });
    }
  }, [subCategory]);

  if (!subCategory) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "isActive"
          ? e.target.value === "true"
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("isActive", form.isActive);

      if (form.images) {
        formData.append("images", form.images);
      }

      await updateSubCategory(
        subCategory._id,
        formData
      );

      toast.success("SubCategory updated successfully");

      await refetch();

      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update subcategory"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-white p-6 space-y-5 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold">
          Edit Sub Category
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid sm:grid-cols-2 gap-4"
        >
          <input
            required
            name="name"
            value={form.name}
            placeholder="SubCategory Name"
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border"
          />

          <input
            required
            name="description"
            value={form.description}
            placeholder="Description"
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border"
          />

          <select
            required
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border"
          >
            <option value="">
              Select Parent Category
            </option>

            {categories.map((cat) => (
              <option
                key={cat._id}
                value={cat._id}
              >
                {cat.name}
              </option>
            ))}
          </select>

          {/* Existing Images */}
          {subCategory.images?.length > 0 && (
            <div className="flex gap-2 flex-wrap sm:col-span-2">
              {subCategory.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover border"
                />
              ))}
            </div>
          )}

          {/* New Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({
                ...form,
                images: e.target.files[0],
              })
            }
            className="w-full px-3 py-2.5 rounded-lg border sm:col-span-2"
          />

          <select
            name="isActive"
            value={form.isActive}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border sm:col-span-2"
          >
            <option value={true}>ACTIVE</option>
            <option value={false}>INACTIVE</option>
          </select>

          <button
            disabled={loading}
            className="col-span-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold"
          >
            {loading
              ? "Updating..."
              : "Update SubCategory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSubCategoryModal;