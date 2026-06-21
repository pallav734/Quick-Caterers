import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import {
  updateCategory,
  getCategory,
} from "../api/categoryApi";

import { updateSubCategory } from "../api/subCategoryApi";

const EditCategoryModal = ({
  category,
  onClose,
  refetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    parentCategory: "",
    existingImages: [],
    newImages: [],
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
      } catch {
        toast.error("Failed to load categories");
      }
    };

    if (category) {
      fetchCategories();

      setForm({
        name: category.name || "",
        description: category.description || "",
        parentCategory:
          category.category?._id ||
          category.category ||
          "",
        existingImages: category.images || [],
        newImages: [],
        isActive: category.isActive ?? true,
      });
    }
  }, [category]);

  if (!category) return null;

  const removeExistingImage = (
    indexToRemove
  ) => {
    setForm((prev) => ({
      ...prev,
      existingImages:
        prev.existingImages.filter(
          (_, index) =>
            index !== indexToRemove
        ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append(
        "description",
        form.description
      );
      formData.append(
        "isActive",
        form.isActive
      );

      formData.append(
        "existingImages",
        JSON.stringify(
          form.existingImages
        )
      );

      for (const file of form.newImages) {
        formData.append("images", file);
      }

      if (form.parentCategory) {
        // UPDATE SUBCATEGORY
        formData.append(
          "category",
          form.parentCategory
        );

        await updateSubCategory(
          category._id,
          formData
        );

        toast.success(
          "SubCategory updated successfully!"
        );
      } else {
        // UPDATE CATEGORY
        await updateCategory(
          category._id,
          formData
        );

        toast.success(
          "Category updated successfully!"
        );
      }

      await refetch();
      onClose();

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Error updating"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {form.parentCategory
            ? "Edit SubCategory"
            : "Edit Category"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Name */}
          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="input w-full"
            required
          />

          {/* Description */}
          <input
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
            className="input w-full"
            required
          />

          {/* Parent Category Optional */}
          <select
            value={form.parentCategory}
            onChange={(e) =>
              setForm({
                ...form,
                parentCategory:
                  e.target.value,
              })
            }
            className="input w-full"
          >
            <option value="">
              No Parent (Main Category)
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
          <div className="flex gap-2 flex-wrap">
            {form.existingImages.map(
              (img, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-20 h-20 object-cover rounded border"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeExistingImage(
                        index
                      )
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            )}
          </div>

          {/* Upload New Images */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setForm({
                ...form,
                newImages:
                  Array.from(
                    e.target.files
                  ),
              })
            }
            className="input w-full"
          />

          {/* Status */}
          <select
            value={form.isActive}
            onChange={(e) =>
              setForm({
                ...form,
                isActive:
                  e.target.value ===
                  "true",
              })
            }
            className="input w-full"
          >
            <option value={true}>
              ACTIVE
            </option>
            <option value={false}>
              INACTIVE
            </option>
          </select>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg"
          >
            {loading
              ? "Updating..."
              : form.parentCategory
              ? "Update SubCategory"
              : "Update Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;