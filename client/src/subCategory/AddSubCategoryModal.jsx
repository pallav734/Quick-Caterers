import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createSubCategory } from "../api/subCategoryApi";
import { getCategory } from "../api/categoryApi";


const AddSubCategoryModal = ({
  open,
  setOpen,
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

    if (open) fetchCategories();
  }, [open]);

  if (!open) return null;

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
      formData.append("images", form.images);
      formData.append("isActive", form.isActive);

      await createSubCategory(formData);

      toast.success("SubCategory created successfully");

      await refetch();

      setOpen(false);

      setForm({
        name: "",
        description: "",
        category: "",
        images: null,
        isActive: true,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create subcategory"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-white p-6 space-y-5 shadow-2xl"
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold">
          Add Sub Category
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid sm:grid-cols-2 gap-4"
        >
          {/* Name */}
          <input
            required
            name="name"
            value={form.name}
            placeholder="SubCategory Name"
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border"
          />

          {/* Description */}
          <input
            required
            name="description"
            value={form.description}
            placeholder="Description"
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border"
          />

          {/* Category Dropdown */}
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

          {/* Image Upload */}
          <input
            required
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({
                ...form,
                images: e.target.files[0],
              })
            }
            className="w-full px-3 py-2.5 rounded-lg border"
          />

          {/* Status */}
          <select
            name="isActive"
            value={form.isActive}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border sm:col-span-2"
          >
            <option value={true}>ACTIVE</option>
            <option value={false}>INACTIVE</option>
          </select>

          {/* Submit */}
          <button
            disabled={loading}
            className="col-span-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold"
          >
            {loading
              ? "Creating..."
              : "Create SubCategory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubCategoryModal;