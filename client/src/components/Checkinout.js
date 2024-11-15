import React, { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
const Checkinout = () => {
  const [rollNo, setRollNo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const {enqueueSnackbar} = useSnackbar();


  const sendSMS = async ( message) => {
    try {
        const response = await axios.post('http://localhost:3300/send-sms-in', {
           
            message: message
        });
        if (response.data.success) {
            console.log('SMS sent successfully!');
        } else {
            console.error('Failed to send SMS:', response.data.message);
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};
  // Function to verify fingerprint independently
  const handleFingerprintVerify = async () => {
    setError('');
    setMessage('');
    try {
      const response = await fetch('http://localhost:3300/run-jar-verify-checkin-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        sendSMS(data.parentno);
        setMessage('Student check-in successful!');
        enqueueSnackbar('Student check-in successful!', { 
          variant: 'success', 
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          autoHideDuration: 3000 
        });
      } else {
        setError('Fingerprint verification failed.');
        enqueueSnackbar('Fingerprint verification failed.', { 
          variant: 'error', 
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          autoHideDuration: 3000 
        });
      }
    } catch (err) {
      console.error('Error verifying fingerprint:', err);
      setError('Server error occurred during fingerprint verification.');
      enqueueSnackbar('Server error occurred during fingerprint verification.', { 
        variant: 'error', 
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        autoHideDuration: 3000 
      });
    }
  };

  const handleCheckIn = async () => {
    setMessage('');
    setError('');
    if (rollNo.trim() === '') {
      setError('Please enter a valid Roll Number.');
      enqueueSnackbar('Please enter a valid Roll Number.', { 
        variant: 'warning', 
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        autoHideDuration: 3000 
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3300/checkin-out/${rollNo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        sendSMS(data.parentno);
        setMessage('Check-in successful!');
        enqueueSnackbar('Check-in successful!', { 
          variant: 'success', 
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          autoHideDuration: 3000 
        });
        setError('');
      } else if (response.status === 404) {
        setError('No pending checkout record found for the roll number.');
        enqueueSnackbar('No pending checkout record found for the roll number.', { 
          variant: 'error', 
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          autoHideDuration: 3000 
        });
      } else {
        setError('Check-in failed.');
        enqueueSnackbar('Check-in failed.', { 
          variant: 'error', 
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          autoHideDuration: 3000 
        });
      }
    } catch (err) {
      console.error('Error during check-in:', err);
      setError('Server error occurred during check-in.');
      enqueueSnackbar('Server error occurred during check-in.', { 
        variant: 'error', 
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        autoHideDuration: 3000 
      });
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* <h1>Check-in System</h1>
      <div>
        <button onClick={handleFingerprintVerify} className="register-button">
          Verify Fingerprint
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Check-in via Roll Number</h3>
        <input 
          type="text" 
          value={rollNo} 
          onChange={(e) => setRollNo(e.target.value)} 
          placeholder="Enter Roll Number" 
        />
        <button onClick={handleCheckIn} className="register-button" style={{ marginLeft: '10px' }}>
          Check-in
        </button>
      </div> */}

      <h1 className="text-center text-2xl font-bold">Checkin for Outpass</h1>
      {/* <p className="text-center">Welcome to the Gate Pass Generation system.</p> */}
      
      <div className="button-container text-center mb-5">
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200" onClick={handleFingerprintVerify}>
          Verify Fingerprint
        </button>
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200 ml-2" onClick={handleCheckIn}>
          Verify Roll Number
        </button>
      </div>

      <input 
        type="text" 
        value={rollNo} 
        onChange={(e) => setRollNo(e.target.value)} 
        placeholder="Enter Roll Number" 
        className="border rounded w-1/3 px-3 py-2 mx-auto mb-4 block"
      />




      {/* Display error or success message */}
      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
      {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>}
    </div>
  );
};

export default Checkinout;