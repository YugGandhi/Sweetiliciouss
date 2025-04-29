// src/RegistrationForm.js

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
const RegistrationForm = ({ onLogin }) => { 
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            fullName: '',
            phoneNumber: '',
            email: '',
            address: '',
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Full Name is required'),
            phoneNumber: Yup.string()
                .required('Phone Number is required')
                .matches(/^[0-9]{10}$/, 'Phone Number must be 10 digits'),
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            address: Yup.string().required('Address is required'),
        }),
        onSubmit: values => {
           // console.log('Form data', values);
            onLogin(); 
             navigate('/home'); 
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="registration-form">
            <h2>Register for Sweetilicious</h2>
            <div>
                <label htmlFor="fullName">Full Name</label>
                <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    onChange={formik.handleChange}
                    value={formik.values.fullName}
                />
                {formik.touched.fullName && formik.errors.fullName ? (
                    <div className="error">{formik.errors.fullName}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    onChange={formik.handleChange}
                    value={formik.values.phoneNumber}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                    <div className="error">{formik.errors.phoneNumber}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor="email">Email Address</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                    <div className="error">{formik.errors.email}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor="address">Address</label>
                <input
                    id="address"
                    name="address"
                    type="text"
                    onChange={formik.handleChange}
                    value={formik.values.address}
                />
                {formik.touched.address && formik.errors.address ? (
                    <div className="error">{formik.errors.address}</div>
                ) : null}
            </div>

            <button type="submit">Submit</button>
        </form>
    );
};

export default RegistrationForm;