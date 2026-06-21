import { X } from "lucide-react";

const DeleteConfirmModal = ({ open, setOpen, onConfirm, loading , itemName = "item" }) => {
  if (!open) return null;

  return (
    <div
      onClick={() => !loading && setOpen(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Confirm Delete</h2>
          <button onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-600">
          Are you sure you want to Delete this {itemName}?
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? `Deleteing ${itemName}...` : `Delete ${itemName}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;