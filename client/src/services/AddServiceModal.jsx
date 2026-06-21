
import { useState } from "react";
import { useAuth } from "../components/context/AuthContext";
import useFetch from "../hooks/useFetch";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { createService } from "../api/serviceApi";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),

  description: Yup.string()
    .min(3, "Description must be at least 3 characters")
    .required("Description is required"),
});

const AddServiceModal = ({ open, setOpen, refetch }) => {
  const { user } = useAuth();

  const { data } = useFetch();

  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: "",
    description: "",
  };

  useEffect(() => {}, []);

  if (!open) return null;

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);

      await createService(values);

      toast.success("Event created Successfully !");

      await refetch();

      resetForm();

      setOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error creating event",
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
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4"
        >
          <X size={18} />
        </button>

        {/* TITLE */}
        <h2 className="text-xl font-bold">
          Add New Event
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => {
            const inputClass = (field) =>
              `w-full px-3 py-2.5 rounded-lg bg-slate-50 border outline-none transition-all ${
                errors[field] && touched[field]
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-slate-200 focus:ring-2 focus:ring-indigo-500"
              }`;

            return (
              <Form className="grid sm:grid-cols-2 gap-4">
                {/* NAME */}
                <div>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className={inputClass("name")}
                  />

                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <Field
                    type="text"
                    name="description"
                    placeholder="Description"
                    className={inputClass("description")}
                  />

                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`col-span-full py-2.5 rounded-lg font-semibold text-white transition-all ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading
                    ? "Creating..."
                    : "Create Event"}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AddServiceModal;

