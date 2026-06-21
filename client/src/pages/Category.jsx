import { useEffect, useState } from "react";
import {
  deleteCategory,
  getCategory,
} from "../api/categoryApi";
import LayOut from "../components/layout/Layout";
import {
  LayoutGrid,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import AddCategoryModal from "../category/AddCategoryModal";
import EditCategoryModal from "../category/EditCategoryModal";
import DeleteConfirmModal from "../users/DeleteConfirmModal";
import toast from "react-hot-toast";

const Category = () => {
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [viewSubCategory, setViewSubCategory] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  /* FETCH CATEGORY */
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        const res = await getCategory({
          page,
          limit: 1000,
          search,
        });

        setCategoryData(res.data?.category || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch {
        toast.error("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchCategory, 400);
    return () => clearTimeout(delay);
  }, [page, search]);

  /* REFETCH */
  const refetchCategory = async () => {
    const res = await getCategory({
      page,
      limit: 1000,
      search,
    });

    setCategoryData(res.data?.category || []);
    setTotalPages(res.data?.totalPages || 1);
  };

  /* DELETE */
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      await deleteCategory(deleteCategoryId);

      toast.success("Deleted successfully");

      await refetchCategory();

      setDeleteCategoryId(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* SPLIT DATA */
  const parentCategories = categoryData.filter(
    (item) => !item.parentCategory
  );

  const subCategories = categoryData.filter(
    (item) => item.parentCategory
  );

  /* TOGGLE EXPAND */
  const toggleExpand = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <LayOut>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
            <LayoutGrid size={28} />
            Category Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage categories and nested subcategories
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium shadow-md"
        >
          + Add Category / SubCategory
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-96 border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center py-10 text-slate-500">
          Loading categories...
        </p>
      )}

      {/* EMPTY */}
      {!loading && categoryData.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <p className="text-slate-500 font-medium">
            No Category Found
          </p>
        </div>
      )}

      {/* CATEGORY LIST */}
      <div className="space-y-6">
        {parentCategories.map((parent) => {
          const children = subCategories.filter(
            (sub) =>
              sub.parentCategory?._id === parent._id
          );

          const isExpanded = expandedRows.includes(
            parent._id
          );

          return (
            <div
              key={parent._id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* PARENT CARD */}
              <div className="p-5">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div
                    onClick={() => toggleExpand(parent._id)}
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                  >
                    <div className="text-slate-500">
                      {isExpanded ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>

                    <img
                      src={
                        parent.images?.[0] ||
                        "https://via.placeholder.com/80"
                      }
                      alt={parent.name}
                      className="w-16 h-16 rounded-xl object-cover border"
                    />

                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        {parent.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {parent.description}
                      </p>

                      <p className="text-xs text-indigo-500 mt-1 font-medium">
                        {children.length} Subcategories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        parent.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {parent.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>

                    <button
                      onClick={() =>
                        setEditCategory(parent)
                      }
                      className="p-2 rounded-lg hover:bg-slate-100"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteCategoryId(parent._id)
                      }
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBCATEGORY SECTION */}
              {isExpanded && children.length > 0 && (
                <div className="px-5 pb-5">
                  <div className="custom-scrollbar ml-10 border-l-2 border-indigo-100 pl-6 flex gap-5 flex-wrap max-h-[500px] overflow-y-scroll">
                    {children.map((sub) => (
                      <div
                          key={sub._id}
                            onClick={() => {
                              setViewSubCategory(sub);
                              setCurrentImage(0);
                            }  
                          }
                          className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                        <div className="flex flex-col md:items-center md:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                sub.images?.[0] ||
                                "https://via.placeholder.com/60"
                              }
                              alt={sub.name}
                              className="w-14 h-14 rounded-lg object-cover border"
                            />

                            <div>
                              <h4 className="font-semibold text-indigo-700">
                                {sub.name}
                              </h4>

                              <p className="text-sm text-slate-500">
                                {sub.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                sub.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {sub.isActive
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>

                            <button
                              onClick={() =>
                                setEditCategory(sub)
                              }
                              className="p-2 rounded-lg hover:bg-white"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteCategoryId(sub._id)
                              }
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* SEARCHED SUBCATEGORIES WITHOUT PARENT */}
        {search &&
          subCategories
            .filter(
              (sub) =>
                !parentCategories.some(
                  (parent) =>
                    parent._id === sub.parentCategory?._id
                )
            )
            .map((sub) => (
              <div
                key={sub._id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        sub.images?.[0] ||
                        "https://via.placeholder.com/60"
                      }
                      alt={sub.name}
                      className="w-16 h-16 rounded-xl object-cover border"
                    />

                    <div>
                      <h3 className="font-bold text-lg text-indigo-700">
                        {sub.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {sub.description}
                      </p>

                      <p className="text-xs text-indigo-500 mt-1">
                        Parent Category:{" "}
                        {sub.parentCategory?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {sub.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>

                    <button
                      onClick={() =>
                        setEditCategory(sub)
                      }
                      className="p-2 rounded-lg hover:bg-slate-100"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteCategoryId(sub._id)
                      }
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-10">
        <button
          disabled={page === 1}
          onClick={() =>
            setPage((prev) => prev - 1)
          }
          className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded-lg ${
              page === i + 1
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() =>
            setPage((prev) => prev + 1)
          }
          className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* VIEW SUBCATEGORY MODAL */}
        {viewSubCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b">

                <h2 className="text-xl font-bold text-slate-800">
                  View Subcategory
                </h2>

                <button
                  onClick={() =>
                    setViewSubCategory(null)
                  }
                  className="text-slate-500 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="p-6">

                <div className="relative">

              <img
                src={
                  viewSubCategory.images?.[currentImage] ||
                  "https://via.placeholder.com/300"
                }
                alt={viewSubCategory.name}
                className="w-full h-56 object-cover rounded-xl border"
              />

              {/* LEFT BUTTON */}
              {viewSubCategory.images?.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage((prev) =>
                        prev === 0
                          ? viewSubCategory.images.length - 1
                          : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full"
                  >
                    ‹
                  </button>

                  {/* RIGHT BUTTON */}
                  <button
                    onClick={() =>
                      setCurrentImage((prev) =>
                        prev ===
                        viewSubCategory.images.length - 1
                          ? 0
                          : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full"
                  >
                    ›
                  </button>
                </>
              )}

              {/* DOTS */}
              {viewSubCategory.images?.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  {viewSubCategory.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setCurrentImage(index)
                      }
                      className={`w-2.5 h-2.5 rounded-full ${
                        currentImage === index
                          ? "bg-indigo-600"
                          : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              )}

            </div>

                <div className="mt-5 space-y-3">

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Subcategory Name
                    </p>

                    <h3 className="text-lg font-semibold text-indigo-700">
                      {viewSubCategory.name}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Description
                    </p>

                    <p className="text-sm text-slate-600">
                      {viewSubCategory.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Parent Category
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {viewSubCategory.parentCategory?.name}
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setEditCategory(viewSubCategory);
                        setViewSubCategory(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium"
                    >
                      <Pencil size={16} />
                      Edit Subcategory
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* MODALS */}
      <AddCategoryModal
        open={open}
        setOpen={setOpen}
        refetch={refetchCategory}
      />

      <EditCategoryModal
        category={editCategory}
        onClose={() => setEditCategory(null)}
        refetch={refetchCategory}
      />

      <DeleteConfirmModal
        open={!!deleteCategoryId}
        setOpen={() =>
          setDeleteCategoryId(null)
        }
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName="Category"
      />
    </LayOut>
  );
};

export default Category;