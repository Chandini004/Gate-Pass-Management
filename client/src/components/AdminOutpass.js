import React, { useState } from 'react';
import './styles/Pass.css'; // Ensure you import the CSS file for styling
import jsPDF from 'jspdf';
import axios from 'axios';

const AdminOutpass = () => {
  const [rollNo, setRollNo] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [error1, setError1] = useState('');
  const [expectedOutTime,  setExpectedOutTime] = useState('');

  const [fingerprintData, setFingerprintData] = useState(null);
 
  // Function to verify and fetch full data for Pink Pass
  const handleVerifyPinkPass = async () => {
    setFingerprintData(null);
    setError1(null);
    if (rollNo.trim() === '') {
      setError('Please enter a valid Roll Number.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3300/verify-roll-outpass/${rollNo}`);
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

  // Function to update gate pass with current date and time
  const updateGatepass = async (rollNo,parentno) => {
    try {
      const response = await fetch(`http://localhost:3300/update-outpass-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roll_no: rollNo }),
      });
      const data = await response.json();
      if (!response.ok) {
        
        setError(data.message);
        console.error('Error updating out pass:', data.message);
      } else {
        sendSMS(parentno);
        console.log('Gate pass updated successfully.');
        setExpectedOutTime(data.expectedOutTime);
        // Send a WhatsApp message to the parent
        // await sendWhatsAppMessage(parentWhatsAppNumber, 'The MSG SENT successfully.');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  

//   app.post('/update-outpass', async (req, res) => {
//     const { roll_no } = req.body;
//     const currentDateTime = new Date();
//     const currentDay = currentDateTime.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

//     // Function to format date and time as 'YYYY-MM-DD HH:MM:SS'
//     const formatDateTime = (date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         const hours = String(date.getHours()).padStart(2, '0');
//         const minutes = String(date.getMinutes()).padStart(2, '0');
//         const seconds = String(date.getSeconds()).padStart(2, '0');
//         return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     };

//     const formattedDateTime = formatDateTime(currentDateTime);
//     console.log("Formatted DateTime:", formattedDateTime);

//     try {
//         // Check if there’s a recent outpass record within the current week
//         const checkQuery = `
//             SELECT * FROM outpass
//             WHERE roll_no = ? AND WEEKOFYEAR(issueDate) = WEEKOFYEAR(NOW())
//             ORDER BY issueDate DESC
//             LIMIT 1
//         `;
//         const [rows] = await dbconnect.execute(checkQuery, [roll_no]);

//         if (rows.length > 0) {
//             const lastOutpassDate = new Date(rows[0].issueDate);
//             const daysDifference = (currentDateTime - lastOutpassDate) / (1000 * 60 * 60 * 24);

//             if (daysDifference < 2 && currentDay !== 0) { // Ensure it’s not Sunday for weekly reset
//                 return res.status(400).send({ message: 'You took an outpass yesterday. You can take it again tomorrow.' });
//             }
//         }

//         // Check for expired passes and clean up as before
//         const existingRecord = rows[0];
//         const expectedOutTime = new Date(existingRecord.expOutTime);
//         const timeDifferenceInHours = (currentDateTime - expectedOutTime) / (1000 * 60 * 60);

//         if (timeDifferenceInHours >= 2) {
//             const deleteQuery = `DELETE FROM outpass WHERE outpassID = ?`;
//             await dbconnect.execute(deleteQuery, [existingRecord.outpassID]);
//             return res.status(400).send({ message: 'Your time is over, and your issued pass has been rejected.' });
//         }
//         if (timeDifferenceInHours < -2) {
//             return res.status(400).send({ message: 'You have still time to go.' });
//         }

//         // Update outTime if valid
//         const updateQuery = `UPDATE outpass SET outTime = ? WHERE outpassID = ?`;
//         await dbconnect.execute(updateQuery, [formattedDateTime, existingRecord.outpassID]);
//         res.status(200).send({
//             message: 'Outpass updated successfully!',
//             expectedOutTime: formatDateTime(expectedOutTime),
//         });
//     } catch (error) {
//         console.error('Error updating Outpass:', error);
//         res.status(500).send({ error: 'Failed to update Outpass.' });
//     }
// });







  
  // Function to generate Pink Pass PDF
 
  // Function to generate Outpass PDF

  const sendSMS = async ( message) => {
    try {
        const response = await axios.post('http://localhost:3300/send-sms-out', {
           
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

 

  const handleVerifyFingerprint = async () => {
    setUserData(null);
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
const generateOutpassPDF = () => {
  if (userData) {
    
    // updateGatepass(userData.studentId,userData.parentno);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Formats date as MM/DD/YYYY
    const formattedTime = currentDate.toLocaleTimeString();
    const expectedDateTime = new Date(expectedOutTime); // Formats time as HH:MM:SS AM/PM
   
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 100],
      margin: 0 // Remove margins
    });

const base64image='data:image/png;base64,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';
  




// Add the image to the PDF at the specified position (x, y) and size (width, height)
doc.addImage(base64image, 'JPEG', 15, 1, 40, 10); // Adjust position and size as needed


// Header Section
doc.setFontSize(10);
doc.setFont('helvetica', 'bold'); // Bold font for header
doc.text('GMR INSTITUTE OF TECHNOLOGY', 1.5, 16); // Adjusted to start near the left
doc.setFontSize(8.5);
doc.text('OUTPASS FOR HOSTLERS', 14, 21);
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.text('GMR Nagar, RAJAM-532 127,  1800-129-118', 5, 26);

// Draw a line to divide the header from the data
doc.line(2, 28, 75, 28); // Divider line

// Student Information Section
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.text('Student Name:', 3, 35);
doc.setFont('helvetica', 'normal');
doc.text(userData.sname?.toString() || '', 28.5, 35); // Ensure toString()

doc.setFont('helvetica', 'bold');
doc.text('Roll No:', 3, 42);
doc.setFont('helvetica', 'normal');
doc.text(userData.studentId?.toString() || '',  28.5, 42);

// Display Branch and Year separately
doc.setFont('helvetica', 'bold');
doc.text('Branch:', 3, 49);
doc.setFont('helvetica', 'normal');
doc.text(userData.branch?.toString() || '',  28.5, 49);

doc.setFont('helvetica', 'bold');
doc.text('Year:', 3, 56);
doc.setFont('helvetica', 'normal');
doc.text(userData.syear?.toString() || '',  28.5, 56);

doc.setFont('helvetica', 'bold');
doc.text('Block Name:', 3, 63);
doc.setFont('helvetica', 'normal');
doc.text(userData.hostelblock?.toString() || '',  28.5, 63);

doc.setFont('helvetica', 'bold');
doc.text('Room No:', 3, 70);
doc.setFont('helvetica', 'normal');
doc.text(userData.roomno?.toString() || '',  28.5, 70);

// Separate Out Time and Out Date
doc.setFont('helvetica', 'bold');
doc.text('Issued OutTime: ', 3, 77);
doc.setFont('helvetica', 'normal');
doc.text(`${formattedDate} ${formattedTime}`?.toString() || '',  29, 77); // Display only time


doc.setFont('helvetica', 'italic');
doc.text('Note: Return to college by 8:30pm',  10.5, 84); // Display only date

// Display only date

// Note Section
// doc.setFont('helvetica', 'italic');
// doc.text('Note: Return to college by 8:30 PM.', 4, 93);

// Implementing the PDF printing logic
const pdfBlob = doc.output('blob');
const url = URL.createObjectURL(pdfBlob);
const iframe = document.createElement('iframe');
iframe.style.display = 'none';
iframe.src = url;
document.body.appendChild(iframe);
iframe.onload = function() {
iframe.contentWindow.print();
};
} else {
alert("No user data to generate the Outpass.");
}
};



const generateOutpassPDF1 = () => {
  if (fingerprintData) {
    

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Formats date as MM/DD/YYYY
    const formattedTime = currentDate.toLocaleTimeString(); // Formats time as HH:MM:SS AM/PM

    // Create PDF with 80x100 mm layout without margins
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 100],
      margin: 0 // Remove margins
    });

        
const base64image='data:image/png;base64,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';
    

// Add the image to the PDF at the specified position (x, y) and size (width, height)
  doc.addImage(base64image, 'JPEG', 16, 1, 40, 10); // Adjust position and size as needed

    // Header Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold'); // Bold font for header
    doc.text('GMR INSTITUTE OF TECHNOLOGY', 1.5, 16); // Adjusted to start near the left
    doc.setFontSize(9);
    doc.text('OUTPASS FOR HOSTLERS', 14, 21);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('GMR Nagar, RAJAM-532 127,  1800-129-118', 5, 26);
    
    // Draw a line to divide the header from the data
    doc.line(2, 28, 75, 28); // Divider line

    // Student Information Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Student Name:', 4.2, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.sname?.toString() || '',  28.5, 35); // Ensure toString()

    doc.setFont('helvetica', 'bold');
    doc.text('Roll No:', 4.2, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.studentId?.toString() || '',  28.5, 42);

    // Display Branch and Year separately
    doc.setFont('helvetica', 'bold');
    doc.text('Branch:', 4.2, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.branch?.toString() || '',  28.5, 49);

    doc.setFont('helvetica', 'bold');
    doc.text('Year:', 4.2, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.syear?.toString() || '',  28.5, 56);

    doc.setFont('helvetica', 'bold');
    doc.text('Block Name:', 4.2, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.hostelblock?.toString() || '',  28.5, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('Room No:', 4.2, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.roomno?.toString() || '',  28.5, 70);

    // Separate Out Time and Out Date
    doc.setFont('helvetica', 'bold');
    doc.text('Out Time:', 4.2, 77);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedTime?.toString() || '',  28.5, 77); // Display only time

    doc.setFont('helvetica', 'bold');
    doc.text('Out Date:', 4.2, 84);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedDate?.toString() || '',  28.5, 84); // Display only date

    // Note Section
    doc.setFont('helvetica', 'italic');
    doc.text('Note: Return to college by 8:30 PM.', 4, 93);

    // Implementing the PDF printing logic
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = function() {
      iframe.contentWindow.print();
    };
  } else {
    alert("No fingerprint data to generate the Outpass.");
  }
};





  return (
    <div className="p-5 ">
      <h1 className="text-center text-white text-2xl font-bold">OutPass Generation</h1>
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
                      <div><strong>Parent Mobile No:</strong> {fingerprintData.parentno}</div>
                      
                      <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                      <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                  </div>
              </div>
            
    <br />
    {/* <div style={{ margin: '20px 0' }}>
      <strong>Outing Count for Current Month: {fingerprintData.gatepassCount}</strong>
      {fingerprintData.gatepassCount > 4 && (
          <button className="bg-gray-500 text-white font-semibold py-2 ml-4 px-4 rounded hover:bg-gray-700 transition duration-200">
              Get Permission
          </button>
      )}
  </div> */}
    {/* <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 " onClick={generatePinkPassPDF1}>
      Print Pink Pass
    </button> */}
    <button className="bg-gray-900 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 " onClick={generateOutpassPDF1}>
      Print Outpass
    </button>
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
                            <div><strong>Parent Mobile No:</strong> {userData.parentno}</div>
                            
                            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                            <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                  

        <br />
        
        {/* Display Gatepass Count */}
        {/* <div style={{ margin: '20px 0' }}>
            <strong>Outing Count for Current Month: {userData.gatepassCount}</strong>
            {userData.gatepassCount > 4 && (
                <button className="bg-gray-500 text-white font-semibold py-2 ml-4 px-4 rounded hover:bg-gray-700 transition duration-200">
                    Get Permission
                </button>
            )}
        </div> */}

        {/* Print Buttons */}
        {/* <button className=" bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generatePinkPassPDF}>
            Print Pink Pass
        </button> */}
        <button className=" bg-gray-900 text-white font-semibold py-2 ml-3 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generateOutpassPDF}>
            Print Outpass
        </button> 
    </div>
)}
      {error1 && <p style={{ color: 'white', textAlign: 'center' }}>{error1}</p>}

    </div>
  );
};

export default AdminOutpass;
