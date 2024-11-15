import React, { useState } from 'react';
import './styles/Pass.css'; // Ensure you import the CSS file for styling
import jsPDF from 'jspdf';
import axios from 'axios';

const Pass = () => {
  const [rollNo, setRollNo] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [error1, setError1] = useState('');
 
 
  const [fingerprintData, setFingerprintData] = useState(null);

  // Function to verify and fetch full data for Pink Pass
  const handleVerifyPinkPass = async () => {
    setFingerprintData(null);
    setError1(null);
    setError(null)
    if (rollNo.trim() === '') {
      setError('Please enter a valid Roll Number.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3300/verify-roll/${rollNo}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        setError(''); // Clear error

        // After fetching user data, update the gatepass table
        await updateGatepass(rollNo,data.parentno);
        
      } else if (response.status === 404) {
        setError('User not found');
        setUserData(null);
      } else {
        setError('Error fetching user data');
        setUserData(null);
      }
    } catch (err) {
      console.log(err);
      setError('Server error');
      setUserData(null);
    }
  };
  const sendSMS = async ( message) => {
    try {
        const response = await axios.post('http://localhost:3300/send-sms-pink', {
           
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
  // Function to update gate pass with current date and time
  const updateGatepass = async (rollNo,parentno) => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:3300/update-gatepass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roll_no: rollNo }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        console.error('Error updating gate pass:', data.message);
      } else {
        sendSMS(parentno);
        console.log('Gate pass updated successfully.');

        setError("");
        // Send a WhatsApp message to the parent
        // await sendWhatsAppMessage(parentWhatsAppNumber, 'The MSG SENT successfully.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Server error occurred while updating the gate pass.');
    }
  };
 
  
   // Function to update gate pass with current date and time
   
  
 
  const handleVerifyFingerprint = async () => {
    setUserData(null);
    setError(null)
    try {
        const response = await axios.post('http://localhost:3300/run-jar-verify');
        const data = response.data;

        // Assuming data is the student object now
        if (data && Object.keys(data).length > 0) {
            setFingerprintData(data); // Set the entire student data
            await updateGatepass(data.studentId,data.parentno); // Use data.studentId
        } else {
            alert("No user found.");
        }
    } catch (error) {
        console.error('Error running JAR:', error);
        // alert('Error occurred while adding fingerprint.');
    }
};

  return (
    <div className="p-5">
      <h1 className="text-center text-2xl font-bold">PinkPass</h1>
      {/* <p className="text-center">Welcome to the Gate Pass Generation system.</p> */}
      
      <div className="button-container text-center mb-5">
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200" onClick={handleVerifyFingerprint}>
          Verify Fingerprint
        </button>
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200 ml-2" onClick={handleVerifyPinkPass}>
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
       {error && <p style={{ color: 'white', textAlign: 'center' }}>{error}</p>}

      {(!error) && fingerprintData && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
         
          <div className="flex items-center bg-white shadow-md p-6 rounded-lg mx-auto" style={{ maxWidth: '800px' }}>
                        {/* Image Section */}
                        {fingerprintData.imageUrl ? (
                            <img 
                                src={fingerprintData.imageUrl} 
                                alt="Student" 
                                className="h-32 w-32 object-cover rounded mr-6" 
                            />
                        ) : (
                            <span>No image available</span>
                        )}
                        {/* Details Section */}
                        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                            <div><strong>Name:</strong> {fingerprintData.sname}</div>
                            <div><strong>Roll No:</strong> {fingerprintData.studentId}</div>
                            <div><strong>Branch:</strong> {fingerprintData.branch}</div>
                            <div><strong>Year:</strong> {fingerprintData.syear}</div>
                           
                            <div><strong>Hostel Name:</strong> {fingerprintData.hostelblock}</div>
                            <div><strong>Room No:</strong> {fingerprintData.roomno}</div>
                            {/* <div><strong>Gatepass Count:</strong> {userData.gatepassCount}</div> */}
                            <div><strong>Parent No:</strong> {fingerprintData.parentno}</div>
                            
                            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                            <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                  
          <br />
         
          {/* <button className="bg-gray-900 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 " onClick={generatePinkPassPDF1}>
            Print Pink Pass
          </button> */}
          {/* <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 ml-2" onClick={generateOutpassPDF1}>
            Print Outpass
          </button> */}
        </div>
      )}

      
      
      {(!error) && userData &&  (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
        
        


<div className="flex items-center bg-white shadow-md p-6 rounded-lg mx-auto" style={{ maxWidth: '800px' }}>
                        {/* Image Section */}
                        {userData.imageUrl ? (
                            <img 
                                src={userData.imageUrl} 
                                alt="Student" 
                                className="h-32 w-32 object-cover rounded mr-6" 
                            />
                        ) : (
                            <span>No image available</span>
                        )}
                        {/* Details Section */}
                        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                            <div><strong>Name:</strong> {userData.sname}</div>
                            <div><strong>Roll No:</strong> {userData.studentId}</div>
                            <div><strong>Branch:</strong> {userData.branch}</div>
                            <div><strong>Year:</strong> {userData.syear}</div>
                           
                            <div><strong>Hostel Name:</strong> {userData.hostelblock}</div>
                            <div><strong>Room No:</strong> {userData.roomno}</div>
                            {/* <div><strong>Gatepass Count:</strong> {userData.gatepassCount}</div> */}
                            <div><strong>Parent No:</strong> {userData.parentno}</div>
                            
                            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                            <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                  

        <br />
        
        {/* Display Gatepass Count */}
       

        {/* Print Buttons */}
        {/* <button className=" bg-gray-900 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generatePinkPassPDF}>
            Print Pink Pass
        </button> */}
        {/* <button className=" bg-gray-800 text-white font-semibold py-2 ml-3 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generateOutpassPDF}>
            Print Outpass
        </button> */}
    </div>
)}
     

    </div>
  );
};

export default Pass;
