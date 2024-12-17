// src/VerifyEmail.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        toast.success("Email verified successfully!");
        navigate('/'); // Redirect to home or dashboard
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="verify-email-container">
      <h2>Verify Your Email</h2>
      <p>
        A verification email has been sent to your email address. Please check your inbox and click on the verification link to activate your account.
      </p>
      <p>
        Didn't receive the email? <Link to="/resend-verification">Resend Verification Email</Link>
      </p>
    </div>
  );
};

export default VerifyEmail;
