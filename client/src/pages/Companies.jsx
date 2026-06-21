import { useEffect } from "react";
import { useAuth } from "../components/context/AuthContext";
import LayOut from "../components/layout/Layout";
import { UserCog, Pencil, Trash2, MoreVertical } from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../users/DeleteConfirmModal";
import {
  deleteCompany,
  getCompany,
  updateCompanyStatus,
} from "../api/companyApi";
import Table from "../components/common/Table";

const Companies = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteCompanyId, setDeleteCompanyId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("approved");
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const tabs = [
    { label: "Active", value: "approved" },
    { label: "Under Review", value: "pending" },
    { label: "Rejected", value: "rejected" },
  ];
  const handlers = {
    renderActions: (u) => (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(openDropdown === u._id ? null : u._id);
          }}
          className="p-1 rounded hover:bg-slate-100"
        >
          <MoreVertical size={18} />
        </button>

        {openDropdown === u._id && (
          <div className="absolute right-0 top-8 w-40 bg-white border rounded-lg shadow-md z-10">
            <button
              onClick={() => {
                navigate(`/companies/edit/${u._id}`);
                setOpenDropdown(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => {
                setDeleteCompanyId(u._id);
                setOpenDropdown(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
            >
              🗑 Delete
            </button>

            {user?.role === "SUPER_ADMIN" && u.status === "pending" && (
              <>
                <button
                  onClick={() => updateStatus(u._id, "approved")}
                  className="w-full text-left px-4 py-2 hover:bg-green-100 text-green-600"
                >
                  ✅ Approve
                </button>

                <button
                  onClick={() => {
                    setSelectedCompany(u._id);
                    setRejectModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                >
                  ❌ Reject
                </button>
              </>
            )}
          </div>
        )}
      </div>
    ),
  };
  const getTableConfig = (status, handlers, user) => [
    {
      key: "name",
      label: "Name",
      render: (u) => <span className="font-medium">{u.name}</span>,
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Mobile", hide: status === "rejected" },
    { key: "city", label: "City" },

    {
      key: "services",
      label: "Services",
      hide: status === "rejected",
      render: (u) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {console.log(u.services)}
          {u.services?.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-md"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
  key: "documents",
  label: "Documents",
  render: (u) => {
    const docs = u.documents || [];

    return (
      <div className="flex gap-2 items-center">
        {docs.slice(0, 3).map((doc, i) => {
          const isImage = /\.(jpg|jpeg|png|webp)$/i.test(doc);

          return (
            <a key={i} href={doc} target="_blank" rel="noreferrer">
              {isImage ? (
                <img
                  src={doc}
                  className="w-10 h-10 object-cover rounded border"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center border rounded text-xs bg-gray-100">
                  📄
                </div>
              )}
            </a>
          );
        })}

        {/* SHOW COUNT */}
        {docs.length > 3 && (
          <span className="text-xs text-indigo-600">
            +{docs.length - 3} more
          </span>
        )}
      </div>
    );
  },
},
    {
      key: "status",
      label: "Status",
      render: (u) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            u.status === "approved"
              ? "bg-green-100 text-green-700"
              : u.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {u.status}
        </span>
      ),
    },
    {
        key: "createdAt",
        label: "Applied On",
        render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      key: "rejectionReason",
      label: "Reason",
      hide: status !== "rejected",
      render: (u) =>
        u.rejectionReason ? (
          <div className="relative group">
            <p className="text-xs text-red-500 truncate max-w-[150px]">
              {u.rejectionReason}
            </p>
            <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded w-56">
              {u.rejectionReason}
            </div>
          </div>
        ) : (
          "N/A"
        ),
    },

    {
      key: "actions",
      label: "",
      render: (u) => handlers.renderActions(u),
    },
  ];

  const columns = getTableConfig(status, handlers, user);
  //Fetch Company
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await getCompany({ page, limit: 5, search, status });
        setCompanyData(res.data?.company || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (err) {
        setError("Failed to fetch Companies");
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(() => {
      fetchCompanies();
    }, 500);
    return () => clearTimeout(delay);
  }, [page, search, status]);
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteCompany(deleteCompanyId);
      toast.success("Company Deleted successfully ");
      if (companyData.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await refetchCompanies();
      }
      setDeleteCompanyId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };
  /* Manual refetch*/
  const refetchCompanies = async () => {
    const res = await getCompany({
      page,
      limit: 5,
      search,
      status,
    });
    setCompanyData(res.data?.company || []);
    setTotalPages(res.data?.totalPages || 1);
  };

  const updateStatus = async (id, status) => {
    try {
      await updateCompanyStatus(id, {status}); // API call
      toast.success(`Company ${status}`);
      refetchCompanies();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  //Reject Company handle
  const handleReject = async () => {
    try {
      if (!rejectReason.trim()) {
        return toast.error("Please enter a reason");
      }

      await updateCompanyStatus(selectedCompany, {
        status: "rejected",
        rejectionReason: rejectReason,
      });

      toast.success("Company rejected");

      setRejectModal(false);
      setRejectReason("");
      setSelectedCompany(null);

      refetchCompanies();
    } catch (err) {
      toast.error("Failed to reject");
    }
  };
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const companies = companyData;

  return (
    <LayOut>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog size={24} />
            Company Management
          </h1>
        </div>
        <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
          <input
            type="text"
            placeholder="Search by name or email or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="form-control border px-4 py-2 rounded-lg w-full md:w-64"
            style={{ maxWidth: "250px" }}
          />

          <button
            disabled={
              user?.role !== "SUPER_ADMIN" && user?.role !== "SUB_ADMIN"
            }
            onClick={() => navigate("/companies/add")}
            className="bg-indigo-600 disabled:bg-gray-300 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg ml-5"
          >
            + Add Company
          </button>
        </div>
      </div>
      <div className="flex gap-4 mb-4 ">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              status === tab.value
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* LOADING */}
      {loading && <p className="text-center py-10">Loading company...</p>}

      {/* EMPTY STATE */}
      {!loading && companies.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-slate-500 font-medium">No users found</p>
        </div>
      )}
      {/* TABLE */}
      {!loading && companies.length > 0 && (
        <div className="hidden md:block w-full overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
          {/* ✅ NEW REUSABLE TABLE */}
          <Table data={companies} columns={columns} />

          {/* ✅ KEEP YOUR PAGINATION SAME */}
          <div className="flex justify-center items-center gap-2 mt-6 mb-4 w-[100%]">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* Modals */}
      <DeleteConfirmModal
        open={!!deleteCompanyId}
        setOpen={() => setDeleteCompanyId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName="company"
      />
      {rejectModal && (
        <div
          onClick={() => setRejectModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Reject Company</h2>
              <button onClick={() => setRejectModal(false)}>✖</button>
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-slate-600">
              Please provide a reason for rejecting this company.
            </p>

            {/* TEXTAREA */}
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject Company
              </button>
            </div>
          </div>
        </div>
      )}
    </LayOut>
  );
};
export default Companies;
