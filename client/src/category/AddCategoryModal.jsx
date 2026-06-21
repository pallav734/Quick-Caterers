import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { createCategory, getCategory } from "../api/categoryApi";
import { createSubCategory } from "../api/subCategoryApi";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),

  description: Yup.string()
    .min(3, "Description must be at least 3 characters")
    .required("Description is required"),

  images: Yup.mixed().required("Image is required"),

  isActive: Yup.boolean().required("Status is required"),
});

const AddCategoryModal = ({
  open,
  setOpen,
  refetch,
}) => {
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategory({
          page: 1,
          limit: 100,
        });

        const onlyParentCategories =
          (res.data?.category || []).filter(
            (item) => !item.parentCategory
          );

        setCategories(onlyParentCategories);
      } catch {
        toast.error("Failed to load categories");
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  if (!open) return null;

  const initialValues = {
    name: "",
    description: "",
    parentCategory: "",
    images: null,
    isActive: true,
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", values.name);
      formData.append(
        "description",
        values.description
      );
      formData.append("images", values.images);
      formData.append(
        "isActive",
        values.isActive
      );

      if (values.parentCategory) {
        formData.append(
          "category",
          values.parentCategory
        );

        await createSubCategory(formData);

        toast.success(
          "SubCategory created successfully"
        );
      } else {
        await createCategory(formData);

        toast.success(
          "Category created successfully"
        );
      }

      await refetch();

      resetForm();

      setOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save"
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

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <Form className="space-y-4">
              <h2 className="text-xl font-bold">
                {values.parentCategory
                  ? "Add SubCategory"
                  : "Add Category"}
              </h2>

              <p className="text-sm text-gray-500">
                Leave Parent Category empty to
                create a main category.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Field
                    type="text"
                    name="name"
                    placeholder={
                      values.parentCategory
                        ? "SubCategory Name"
                        : "Category Name"
                    }
                    className={`w-full px-3 py-2.5 rounded-lg border ${
                      errors.name &&
                      touched.name
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />

                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Field
                    type="text"
                    name="description"
                    placeholder="Description"
                    className={`w-full px-3 py-2.5 rounded-lg border ${
                      errors.description &&
                      touched.description
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />

                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <Field
                    as="select"
                    name="parentCategory"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
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
                  </Field>
                </div>

                {/* Image */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFieldValue(
                        "images",
                        e.target.files[0]
                      )
                    }
                    className={`w-full px-3 py-2.5 rounded-lg border bg-white ${
                      errors.images &&
                      touched.images
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  />

                  <ErrorMessage
                    name="images"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <Field
                    as="select"
                    name="isActive"
                    className={`w-full px-3 py-2.5 rounded-lg border ${
                      errors.isActive &&
                      touched.isActive
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                  >
                    <option value={true}>
                      ACTIVE
                    </option>

                    <option value={false}>
                      INACTIVE
                    </option>
                  </Field>

                  <ErrorMessage
                    name="isActive"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="col-span-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold"
                >
                  {loading
                    ? "Saving..."
                    : values.parentCategory
                    ? "Create SubCategory"
                    : "Create Category"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddCategoryModal;