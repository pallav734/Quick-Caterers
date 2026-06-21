import { useState } from "react";
import { useAuth } from "../components/context/AuthContext";
import useFetch from "../hooks/useFetch";
import { createUser } from "../api/userApi";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const roles = ["SUB_ADMIN"];

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),

  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  address: Yup.string().required("Address is required"),

  role: Yup.string().required("Role is required"),
});

const AddUserModal = ({ open, setOpen, refetch }) => {
  const { user } = useAuth();
  const { data } = useFetch();

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const initialValues = {
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
    role: "",
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      const trimmedValues = {
        name: values.name.trim(),
        email: values.email.trim(),
        mobile: values.mobile.trim(),
        password: values.password.trim(),
        address: values.address.trim(),
        role: values.role.trim(),
    };
      await createUser(trimmedValues);

      toast.success("User created successfully!");

      await refetch();

      resetForm();

      setOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error creating user"
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

        <h2 className="text-xl font-bold">Add New User</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="grid sm:grid-cols-2 gap-4">
              {[
                { name: "name", placeholder: "Full Name" },
                { name: "email", placeholder: "Email" },
                { name: "mobile", placeholder: "Mobile" },
                {
                  name: "password",
                  placeholder: "Password",
                  type: "password",
                },
                {
                  name: "address",
                  placeholder: "Address",
                },
              ].map((input) => (
                <div key={input.name} className="flex flex-col">
                  <Field
                    type={input.type || "text"}
                    name={input.name}
                    placeholder={input.placeholder}
                     className={`w-full px-3 py-2.5 rounded-lg bg-slate-50 border outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[input.name] && touched[input.name]
                        ? "border-red-500"
                        : "border-slate-200"
                    }`}
                  />

                  <ErrorMessage
                    name={input.name}
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              ))}

              <div className="flex flex-col">
                <Field
                  as="select"
                  name="role"
                 className={`w-full px-3 py-2.5 rounded-lg bg-slate-50 border outline-none ${
                    errors.role && touched.role
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
                >
                  <option value="">Select Role</option>

                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Field>

                <ErrorMessage
                  name="role"
                  component="span"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="col-span-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddUserModal;