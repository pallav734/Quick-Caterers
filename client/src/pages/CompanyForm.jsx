import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import {
  createCompany,
  getSingleCompany,
  getSubCategoryByCategory,
  updateCompany,
} from "../api/companyApi";

import toast from "react-hot-toast";
import LayOut from "../components/layout/Layout";

import { Country, State, City } from "country-state-city";

import { ChevronDown, ChevronUp } from "lucide-react";

import { createService, getServices } from "../api/serviceApi";

import { getCategory } from "../api/categoryApi";

import Select from "react-select";

const AccordionSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-5 py-4 bg-slate-50 cursor-pointer border-b"
      >
        <h2 className="font-semibold text-slate-800">{title}</h2>

        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isOpen && <div className="p-5">{children}</div>}
    </div>
  );
};

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Company name must be at least 3 characters")
    .required("Company name is required"),

  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),

  website: Yup.string().nullable(),

  address: Yup.string().required("Address is required"),

  country: Yup.string().required("Country is required"),

  state: Yup.string().required("State is required"),

  city: Yup.string().required("City is required"),

  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),

  description: Yup.string().required("Description is required"),

  services: Yup.array().min(1, "At least one service is required"),
  documents: Yup.mixed().test("required","Company documents are required",
      (value) => {
        return value && value.length > 0;
      },
    ),

});

const CompanyForm = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = !!id;

  const [loading, setLoading] = useState(false);

  const [countries] = useState(Country.getAllCountries());

  const [states, setStates] = useState([]);

  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");

  const [selectedState, setSelectedState] = useState("");

  const [serviceInput, setServiceInput] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  const [selectedServices, setSelectedServices] = useState([]);

  const [categoriesList, setCategoriesList] = useState([]);

  const [openCategory, setOpenCategory] = useState(null);

  const [categoryGroups, setCategoryGroups] = useState([
    {
      category: "",
      subCategories: [],
      availableSubCategories: [],
    },
  ]);

  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    services: [],
    logo: null,
    images: [],
    documents: [],
  });

  useEffect(() => {
    if (isEdit) {
      fetchCompany();
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategory({
        page: 1,
        limit: 50,
      });

      setCategoriesList(res.data.category || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchCompany = async () => {
    try {
      const res = await getSingleCompany(id);

      const company = res.data.company;

      setInitialValues({
        name: company.name || "",
        description: company.description || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        address: company.address || "",
        city: company.city || "",
        state: company.state || "",
        country: company.country || "",
        pincode: company.pincode || "",
        services: (company.services || []).map(
          (service) => service._id || service,
        ),
        logo: null,
        images: [],
        documents: [],
      });

      setSelectedServices(
        (company.services || []).map((service) => ({
          _id: service._id || service,
          name: service.name || service,
        })),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load company");
    }
  };

  const handleCountryChange = (
    e,
    setFieldValue,
    values,
  ) => {
    const countryCode = e.target.value;

    setSelectedCountry(countryCode);

    const selected = countries.find((c) => c.isoCode === countryCode);

    setFieldValue("country", selected?.name || "");

    setFieldValue("state", "");

    setFieldValue("city", "");

    setStates(State.getStatesOfCountry(countryCode));

    setCities([]);
  };

  const handleStateChange = (
    e,
    setFieldValue,
  ) => {
    const stateCode = e.target.value;

    setSelectedState(stateCode);

    const selected = states.find((s) => s.isoCode === stateCode);

    setFieldValue("state", selected?.name || "");

    setFieldValue("city", "");

    setCities(City.getCitiesOfState(selectedCountry, stateCode));
  };

  const fetchServices = async (value) => {
    if (!value) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await getServices({
        search: value,
      });

      setSuggestions(res.data.services || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleServiceChange = (e) => {
    const value = e.target.value;

    setServiceInput(value);

    fetchServices(value);
  };

  const selectService = (service, setFieldValue) => {
    if (selectedServices.find((s) => s._id === service._id)) {
      return;
    }

    const updated = [...selectedServices, service];

    setSelectedServices(updated);

    setFieldValue(
      "services",
      updated.map((s) => s._id),
    );

    setServiceInput("");

    setSuggestions([]);
  };

  const removeService = (id, setFieldValue) => {
    const updated = selectedServices.filter((s) => s._id !== id);

    setSelectedServices(updated);

    setFieldValue(
      "services",
      updated.map((s) => s._id),
    );
  };

  const handleCreateService = async (setFieldValue) => {
    try {
      const res = await createService({
        name: serviceInput,
        description: serviceInput,
      });

      const newService = res.data.service;

      const updated = [...selectedServices, newService];

      setSelectedServices(updated);

      setFieldValue(
        "services",
        updated.map((s) => s._id),
      );

      setServiceInput("");

      setSuggestions([]);

      toast.success("Service created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create service");
    }
  };

  const addCategoryGroup = () => {
    setCategoryGroups([
      ...categoryGroups,
      {
        category: "",
        subCategories: [],
        availableSubCategories: [],
      },
    ]);
  };

  const removeCategoryGroup = (index) => {
    setCategoryGroups(categoryGroups.filter((_, i) => i !== index));
  };

  const handleCategoryChange = async (index, categoryId) => {
    try {
      const res = await getSubCategoryByCategory(categoryId);

      const updated = [...categoryGroups];

      updated[index].category = categoryId;

      updated[index].subCategories = [];

      updated[index].availableSubCategories = Array.isArray(
        res.data.subCategories,
      )
        ? res.data.subCategories
        : [];

      setCategoryGroups(updated);
    } catch (err) {
      toast.error("Failed to load subcategories");
    }
  };

  const handleSubCategoryChange = (index, values) => {
    const updated = [...categoryGroups];

    updated[index].subCategories = values;

    setCategoryGroups(updated);
  };

  const handleSubmit = async (values) => {
    const hasEmptyCategory = categoryGroups.some(
      (group) => !group.category,
    );

    if (hasEmptyCategory) {
      toast.error("Please select category");
      return;
    }

    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (key === "images" || key === "documents") {
        if (values[key]) {
          for (let file of values[key]) {
            formData.append(key, file);
          }
        }
      } else if (key === "services") {
        values.services.forEach((id) => {
          formData.append("services", id);
        });
      } else if (key === "logo") {
        if (values.logo) {
          formData.append("logo", values.logo);
        }
      } else {
        formData.append(key, values[key]);
      }
    });

    formData.append(
      "categories",
      JSON.stringify(
        categoryGroups.map(({ category, subCategories }) => ({
          category,
          subCategories,
        })),
      ),
    );

    try {
      setLoading(true);

      if (isEdit) {
        await updateCompany(id, formData);

        toast.success("Company updated");
      } else {
        await createCompany(formData);

        toast.success("Company created");
      }

      navigate("/companies");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayOut>
      <div
        className="p-6 bg-white rounded-2xl shadow max-w-5xl mx-auto"
        style={{ height: "min-content" }}
      >
        <h2 className="text-2xl font-bold mb-6">
          {isEdit ? "Edit Company" : "Add Company"}
        </h2>

        <Formik
  initialValues={initialValues}
  enableReinitialize
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
>
  {({
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
  }) => {
    // reusable class
    const inputClass = (field) =>
      `w-full border rounded-xl px-4 py-3 outline-none transition-all ${
        errors[field] && touched[field]
          ? "border-red-500 focus:border-red-500"
          : "border-slate-300 focus:border-indigo-500"
      }`;

    return (
      <Form className="space-y-6">
        {/* BASIC */}
        <AccordionSection title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Field
                type="text"
                name="name"
                placeholder="Company Name"
                className={inputClass("name")}
              />

              <ErrorMessage
                name="name"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className={inputClass("email")}
              />

              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                type="text"
                name="phone"
                placeholder="Phone"
                className={inputClass("phone")}
              />

              <ErrorMessage
                name="phone"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                type="text"
                name="website"
                placeholder="Website"
                className={inputClass("website")}
              />

              <ErrorMessage
                name="website"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          </div>
        </AccordionSection>

        {/* LOCATION */}
        <AccordionSection title="Location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Field
                type="text"
                name="address"
                placeholder="Address"
                className={inputClass("address")}
              />

              <ErrorMessage
                name="address"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <select
                value={selectedCountry}
                onChange={(e) =>
                  handleCountryChange(
                    e,
                    setFieldValue,
                    values,
                  )
                }
                onBlur={handleBlur}
                name="country"
                className={inputClass("country")}
              >
                <option value="">Select Country</option>

                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>

              <ErrorMessage
                name="country"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <select
                value={selectedState}
                onChange={(e) =>
                  handleStateChange(
                    e,
                    setFieldValue,
                  )
                }
                onBlur={handleBlur}
                name="state"
                className={inputClass("state")}
              >
                <option value="">Select State</option>

                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>

              <ErrorMessage
                name="state"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                as="select"
                name="city"
                className={inputClass("city")}
              >
                <option value="">Select City</option>

                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </Field>

              <ErrorMessage
                name="city"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                type="text"
                name="pincode"
                placeholder="Pincode"
                className={inputClass("pincode")}
              />

              <ErrorMessage
                name="pincode"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          </div>
        </AccordionSection>

        {/* SERVICES */}
        <AccordionSection title="Services">
          <div className="relative">
            <input
              type="text"
              value={serviceInput}
              onChange={handleServiceChange}
              placeholder="Search services..."
              className={`w-full border rounded-xl px-4 py-3 ${
                errors.services && touched.services
                  ? "border-red-500"
                  : "border-slate-300"
              }`}
            />

            {suggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-white border rounded-xl shadow mt-2">
                {suggestions.map((s) => (
                  <div
                    key={s._id}
                    onClick={() =>
                      selectService(
                        s,
                        setFieldValue,
                      )
                    }
                    className="px-4 py-3 hover:bg-slate-100 cursor-pointer"
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}

            {suggestions.length === 0 && serviceInput && (
              <div
                onClick={() =>
                  handleCreateService(
                    setFieldValue,
                  )
                }
                className="mt-2 border rounded-xl px-4 py-3 cursor-pointer hover:bg-green-50 text-green-700"
              >
                Add "{serviceInput}"
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {selectedServices.map((s) => (
                <span
                  key={s._id}
                  onClick={() =>
                    removeService(
                      s._id,
                      setFieldValue,
                    )
                  }
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full cursor-pointer"
                >
                  {s.name} ✕
                </span>
              ))}
            </div>

            <ErrorMessage
              name="services"
              component="p"
              className="text-red-500 text-sm mt-2"
            />
          </div>
        </AccordionSection>

        {/* DESCRIPTION */}
        <AccordionSection title="Description">
          <div>
            <Field
              as="textarea"
              name="description"
              rows="5"
              placeholder="Description..."
              className={inputClass("description")}
            />

            <ErrorMessage
              name="description"
              component="p"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        </AccordionSection>

        {/* MEDIA */}
        <AccordionSection title="Media">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LOGO */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Company Logo
              </label>

              <input
                type="file"
                onChange={(e) =>
                  setFieldValue(
                    "logo",
                    e.target.files[0],
                  )
                }
                className={`w-full border rounded-xl px-4 py-3 bg-white ${
                  errors.logo && touched.logo
                    ? "border-red-500"
                    : "border-slate-300"
                }`}
              />
            </div>

            {/* IMAGES */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Company Images
              </label>

              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFieldValue(
                    "images",
                    e.target.files,
                  )
                }
                className={`w-full border rounded-xl px-4 py-3 bg-white ${
                  errors.images && touched.images
                    ? "border-red-500"
                    : "border-slate-300"
                }`}
              />
            </div>

            {/* DOCUMENTS */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Company Documents
              </label>

              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFieldValue(
                    "documents",
                    e.target.files,
                  )
                }
                onBlur={handleBlur}
                name="documents"
                className={`w-full border rounded-xl px-4 py-3 bg-white ${
                  errors.documents && touched.documents
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-indigo-500"
                }`}
              />

              <ErrorMessage
                name="documents"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          </div>
        </AccordionSection>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-2xl font-medium transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Update Company"
              : "Create Company"}
        </button>
      </Form>
    );
  }}
</Formik>
      </div>
    </LayOut>
  );
};

export default CompanyForm;