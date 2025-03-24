import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "../styles/RegistrationForm.css";

const RegistrationForm = ({ isOpen, onClose }) => {
  const formik = useFormik({
    initialValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      password: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full Name is required"),
      phoneNumber: Yup.string()
        .required("Phone Number is required")
        .matches(/^[0-9]{10}$/, "Phone Number must be 10 digits"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      address: Yup.string().required("Address is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success("Registration Successful! 🎉");

          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          toast.error(data.message || "Registration failed");
        }
      } catch (error) {
        toast.error("Server error. Please try again.");
      }
    },
  });


return (
  <div className={`modal-overlay ${isOpen ? "show" : "hide"}`} onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <span className="close-btn" onClick={onClose}>&times;</span>
      <h2 className="modal-title">Create Account</h2> {/* ✅ Updated Title */}
      <p className="modal-subtitle">Join us for exclusive deals & a delightful experience.</p> {/* ✅ New Subtitle */}
      
      <form onSubmit={formik.handleSubmit} className="registration-form">
        
        {/* Full Name Field */}
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            {...formik.getFieldProps("fullName")}
            className={formik.touched.fullName && formik.errors.fullName ? "input-error" : ""}
          />
          {formik.touched.fullName && formik.errors.fullName ? (
            <p className="error-message">{formik.errors.fullName}</p>
          ) : null}
        </div>

        {/* Phone Number Field */}
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="text"
            {...formik.getFieldProps("phoneNumber")}
            className={formik.touched.phoneNumber && formik.errors.phoneNumber ? "input-error" : ""}
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
            <p className="error-message">{formik.errors.phoneNumber}</p>
          ) : null}
        </div>

        {/* Email Address Field */}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            {...formik.getFieldProps("email")}
            className={formik.touched.email && formik.errors.email ? "input-error" : ""}
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="error-message">{formik.errors.email}</p>
          ) : null}
        </div>

        {/* Address Field */}
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            id="address"
            type="text"
            {...formik.getFieldProps("address")}
            className={formik.touched.address && formik.errors.address ? "input-error" : ""}
          />
          {formik.touched.address && formik.errors.address ? (
            <p className="error-message">{formik.errors.address}</p>
          ) : null}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...formik.getFieldProps("password")}
            className={formik.touched.password && formik.errors.password ? "input-error" : ""}
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="error-message">{formik.errors.password}</p>
          ) : null}
        </div>
        <button type="submit" className="submit-button">Create Account</button>
      </form>
    </div>
  </div>
);
};

export default RegistrationForm;