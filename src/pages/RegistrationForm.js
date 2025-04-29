import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "../styles/RegistrationForm.css";
import { auth } from '../services/api';

const RegistrationForm = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  
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
        setLoading(true);
        const response = await auth.register(values);
        console.log("Registration response:", response);
        
        toast.success("Registration Successful! 🎉");
        
        // Reset form
        formik.resetForm();
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage = error.response?.data?.message || "Registration failed";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="modal-title">Create Account</h2>
        <p className="modal-subtitle">Join us for exclusive deals & a delightful experience.</p>
        
        <form onSubmit={formik.handleSubmit} className="registration-form">
          
          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              {...formik.getFieldProps("fullName")}
              className={formik.touched.fullName && formik.errors.fullName ? "input-error" : ""}
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            {formik.touched.password && formik.errors.password ? (
              <p className="error-message">{formik.errors.password}</p>
            ) : null}
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;