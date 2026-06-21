import { useEffect, useState } from "react";
import LayOut from "../components/layout/Layout";
import { FolderTree, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteSubCategory, getSubCategory } from "../api/subCategoryApi";
import AddSubCategoryModal from "../subCategory/AddSubCategoryModal";
import EditSubCategoryModal from "../subCategory/EditSubCategoryModal";
import DeleteConfirmModal from "../users/DeleteConfirmModal";


const statusColor = {
  true: "bg-green-100 text-green-700",
  false: "bg-red-100 text-red-700",
};

const SubCategory = () => {
  const [open, setOpen] = useState(false);
  const [editSubCategory, setEditSubCategory] = useState(null);

  const [subCategoryData, setSubCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);

        const res = await getSubCategory({
          page,
          limit: 10,
          search,
        });

        setSubCategoryData(res.data?.subCategory || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (error) {
        toast.error("Failed to fetch subcategories");
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchSubCategories, 500);

    return () => clearTimeout(delay);
  }, [page, search]);

  const refetchSubCategory = async () => {
    const res = await getSubCategory({
      page,
      limit: 10,
      search,
    });

    setSubCategoryData(res.data?.subCategory || []);
    setTotalPages(res.data?.totalPages || 1);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      await deleteSubCategory(deleteId);

      toast.success("Subcategory deleted successfully");

      await refetchSubCategory();

      setDeleteId(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <LayOut>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderTree size={24} />
          Sub Category Management
        </h1>

        <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
          <input
            type="text"
            placeholder="Search subcategory"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="form-control border px-4 py-2 rounded-lg w-full md:w-64"
                        style={{ maxWidth: "250px" }}
          />

          <button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg ml-2"
          >
            + Add SubCategory
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-center py-10">
          Loading SubCategories...
        </p>
      )}

      {!loading && subCategoryData.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          No SubCategories Found
        </div>
      )}

      {!loading && subCategoryData.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-slate-600">
                <th className="p-4">Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Images</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody >
              {subCategoryData.map((sub) => (
                <tr
                  key={sub._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-4">{sub.name}</td>
                  <td className="p-4">{sub.description}</td>

                  <td className="p-4">
                    {sub.category?.name || "-"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {sub.images?.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover border"
                        />
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[sub.isActive]
                        }`}
                      >
                        {sub.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>

                      <button
                        onClick={() =>
                          setEditSubCategory(sub)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteId(sub._id)
                        }
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center gap-2 py-4">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
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
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AddSubCategoryModal
        open={open}
        setOpen={setOpen}
        refetch={refetchSubCategory}
      />

      <EditSubCategoryModal
        subCategory={editSubCategory}
        onClose={() => setEditSubCategory(null)}
        refetch={refetchSubCategory}
      />

      <DeleteConfirmModal
        open={!!deleteId}
        setOpen={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName="SubCategory"
      />
    </LayOut>
  );
};

export default SubCategory;