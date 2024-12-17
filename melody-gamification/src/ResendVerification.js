// src/ResendVerification.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import auth from your firebase.js
import { sendEmailVerification, signOut } from 'firebase/auth'; // Import directly from firebase/auth
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Optional: For better user feedback

const ResendVerification = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;

    try {
      const user = auth.currentUser;

      if (user) {
        await sendEmailVerification(user);
        setEmailSent(true);
        setError('');
        setCanResend(false);
        setTimer(60); // 60 seconds cooldown
        toast.success("Verification email resent. Please check your inbox.");
        await signOut(auth); // Optional: Sign out the user after resending
      } else {
        setError('No user is currently signed in.');
        toast.error('No user is currently signed in.');
      }
    } catch (err) {
      console.error("Resend Verification Error:", err);
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="resend-verification-container">
      <h2>Resend Verification Email</h2>
      {emailSent ? (
        <p>
          Verification email has been resent. Please check your inbox.
        </p>
      ) : (
        <>
          <p>
            Click the button below to resend the verification email.
          </p>
          <button onClick={handleResend} disabled={!canResend}>
            {canResend ? "Resend Email" : `Resend in ${timer}s`}
          </button>
        </>
      )}
      {error && <p className="error">{error}</p>}
      <p>
        Go back to <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ResendVerification;
