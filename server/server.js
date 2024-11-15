import express from 'express';
import dbconnect from './database.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process';
import path, { dirname } from 'path';
import multer from 'multer';
import fs from 'fs'; // Import fs module
import { fileURLToPath } from 'url';
import XLSX from 'xlsx'; // Import xlsx library
import { fetchAndEmailData } from './Report.js'; 
import cron from 'node-cron'; // Import node-cron for scheduling tasks
import axios from 'axios';
import ExcelJS from 'exceljs';
import { scheduleReportTime } from './Report.js'; // Adjust the path if necessary
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3300;
const JWT_SECRET = 'bala222333';

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',  // Your frontend URL
    credentials: true,
}));
app.use(bodyParser.json());


// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify your upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original file name
    }
});
const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Uploads directory created:', uploadDir);
}

// Registration Endpoint
app.post('/register', async (req, res) => {
    const { name, roll_no, year, branch, hostel_block_name, room_no, parent_no,gender } = req.body;

    try {
        const query = ` INSERT INTO users ( studentId,sname,syear, branch, hostelblock,  roomno,parentno,gender) VALUES (?, ?, ?, ?, ?, ?, ?,?) `;

        const values = [roll_no,name,  year, branch, hostel_block_name, room_no, parent_no,gender|| null];

        await dbconnect.execute(query, values);
        res.status(201).send({ message: 'Registration details inserted successfully!' });
    } catch (error) {
        console.error('Error inserting registration details:', error);
        res.status(500).send({ error: 'Failed to insert registration details.' });
    }
});
// Endpoint to verify roll number and get user data
app.get('/verify-rollupdate/:roll_no', async (req, res) => {
    const rollNo = req.params.roll_no;
  
    try {
      const query = 'SELECT * FROM users WHERE studentId = ?';
      const [rows] = await dbconnect.execute(query, [rollNo]);
  
      if (rows.length > 0) {
        res.json(rows); // Send user data as response
      } else {
        res.status(404).json({ message: 'No user found with that roll number.' });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
  
  // Endpoint to update user data
  app.put('/update-user', async (req, res) => {
    const { name, roll_no, year, branch, hostel_block_name, room_no, parent_no,gender } = req.body;
  
    try {
      const query = `
        UPDATE users SET 
          sname = ?, 
          syear = ?, 
          branch = ?, 
          hostelblock = ?, 
          roomno = ?, 
          parentno = ? ,
          gender = ?
        WHERE studentId = ?
      `;
      const [result] = await dbconnect.execute(query, [name, year, branch, hostel_block_name, room_no, parent_no,gender, roll_no]);
  
      if (result.affectedRows > 0) {
        res.json({ message: 'User updated successfully.' });
      } else {
        res.status(404).json({ message: 'No user found to update.' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
  


// Endpoint to verify roll number and get user data
app.get('/verify-roll/:roll_no', async (req, res) => {
    const rollNo = req.params.roll_no;

    try {
        const query = 'SELECT * FROM users WHERE studentId = ?';
        const [rows] = await dbconnect.execute(query, [rollNo]);

        if (rows.length > 0) {
            const gatepassQuery = `
            SELECT 
                g.date,
                g.outTime,
                g.inTime
            FROM 
                Gatepass g
            WHERE 
                g.roll_no = ?
        `;
        const [gatepassRows] = await dbconnect.execute(gatepassQuery, [rollNo]);

        // Get the current year and month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // getMonth() returns 0 for January

        // Count the number of entries in the Gatepass table for the user for the current month
        const countQuery = `
            SELECT COUNT(*) as count 
            FROM Gatepass 
            WHERE roll_no = ? 
              AND YEAR(date) = ? 
              AND MONTH(date) = ?
        `;
        const [countRows] = await dbconnect.execute(countQuery, [rollNo, currentYear, currentMonth]);

      
        const studentData = {
            ...rows[0], // Student details
            gatepasses: gatepassRows, // All Gatepass entries (date, outTime, inTime)
            gatepassCount: countRows[0].count // Gatepass count for the current month
        };

        res.json(studentData); // Return the user data
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send({ error: 'Failed to fetch user data' });
    }
});




app.get('/verify-roll-outpass/:roll_no', async (req, res) => {
    const rollNo = req.params.roll_no;

    try {
        const query = 'SELECT * FROM users WHERE studentId = ?';
        const [rows] = await dbconnect.execute(query, [rollNo]);

        if (rows.length > 0) {
            const gatepassQuery = `
            SELECT 
                g.date,
                g.outTime,
                g.inTime
            FROM 
                Outpass g
            WHERE 
                g.roll_no = ?
        `;
        const [gatepassRows] = await dbconnect.execute(gatepassQuery, [rollNo]);

        // Get the current year and month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // getMonth() returns 0 for January

        // Count the number of entries in the Gatepass table for the user for the current month
        const countQuery = `
            SELECT COUNT(*) as count 
            FROM Outpass 
            WHERE roll_no = ? 
              AND YEAR(date) = ? 
              AND MONTH(date) = ?
        `;
        const [countRows] = await dbconnect.execute(countQuery, [rollNo, currentYear, currentMonth]);

      
        const studentData = {
            ...rows[0], // Student details
            gatepasses: gatepassRows, // All Gatepass entries (date, outTime, inTime)
            gatepassCount: countRows[0].count // Gatepass count for the current month
        };

        res.json(studentData); // Return the user data
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send({ error: 'Failed to fetch user data' });
    }
});


// Endpoint to run the JAR file
app.post('/run-jar', async (req, res) => {
    // const jarPath = path.join(__dirname, '..', 'Register.jar');
    const jarPath="Register.jar";
    exec(`java -jar ${jarPath}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send(stderr);
        }

        console.log(`Output: ${stdout}`);
        const lines = stdout.split('\n');
        const id = lines[0].trim();
        const getUserDataById = async (id) => {
            const query = `SELECT * FROM users WHERE studentId = ?`;
            const values = [id];
          
            try {
              const [rows, fields] = await dbconnect.execute(query, values);
              return rows;
            } catch (error) {
              console.error('Error retrieving user data:', error);
              return [];
            }
          };
        try {
            const userData = await getUserDataById(id);
            if (userData.length > 0) {
                res.json(userData);
            } else {
                res.status(404).send('User not found');
            }
        } catch (dbError) {
            console.error('Database query failed:', dbError);
            res.status(500).send('Database query failed');
        }
    });
});


// Endpoint to run the JAR file to update
app.post('/run-jar-update', async (req, res) => {
    // const jarPath = path.join(__dirname, '..', 'Register.jar');
    const jarPath="Update.jar";
    exec(`java -jar ${jarPath}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send(stderr);
        }

        console.log(`Output: ${stdout}`);
        const lines = stdout.split('\n');
        const id = lines[0].trim();
        const getUserDataById = async (id) => {
            const query = `SELECT * FROM users WHERE studentId = ?`;
            const values = [id];
          
            try {
              const [rows, fields] = await dbconnect.execute(query, values);
              return rows;
            } catch (error) {
              console.error('Error retrieving user data:', error);
              return [];
            }
          };
        try {
            const userData = await getUserDataById(id);
            if (userData.length > 0) {
                res.json(userData);
            } else {
                res.status(404).send('User not found');
            }
        } catch (dbError) {
            console.error('Database query failed:', dbError);
            res.status(500).send('Database query failed');
        }
    });
});



// Endpoint to run the JAR file
app.post('/run-jar-verify', async (req, res) => {
    // const jarPath = path.join(__dirname, '..', 'Verify.jar');
    const jarPath="Verify.jar";

    exec(`java -jar ${jarPath}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send(stderr);
        }

        console.log(`Output: ${stdout}`);
        const lines = stdout.split('\n');
        const id = lines[0].trim(); // Assuming the first line contains the studentId

        const getUserDataById = async (id) => {
            const query = `SELECT * FROM users WHERE studentId = ?`;
            const values = [id];

            try {
                const [rows, fields] = await dbconnect.execute(query, values);
                return rows;
            } catch (error) {
                console.error('Error retrieving user data:', error);
                return [];
            }
        };

        try {
            const userData = await getUserDataById(id);
            if (userData.length > 0) {
                const gatepassQuery = `
                    SELECT 
                        g.date,
                        g.outTime,
                        g.inTime
                    FROM 
                        Gatepass g
                    WHERE 
                        g.roll_no = ?`;
                const [gatepassRows] = await dbconnect.execute(gatepassQuery, [id]);

                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;

                const countQuery = `
                    SELECT COUNT(*) as count 
                    FROM Gatepass 
                    WHERE roll_no = ? 
                      AND YEAR(date) = ? 
                      AND MONTH(date) = ?`;
                const [countRows] = await dbconnect.execute(countQuery, [id, currentYear, currentMonth]);

                const studentData = {
                    ...userData[0], // Ensure you're merging the first object from the userData array
                    gatepasses: gatepassRows,
                    gatepassCount: countRows[0].count
                };
                res.json(studentData);
            } else {
                res.status(404).send('User not found');
            }
        } catch (dbError) {
            console.error('Database query failed:', dbError);
            res.status(500).send('Database query failed');
        }
    });
});
const username = 'GMRInstitute';  // Your SMS Striker username
const password = '778465';       // Your SMS Striker password
const from = 'GMRITe';     // Replace with your sender ID
const to = '+917993675966';  // Ensure the number is formatted correctly, e.g. with country code if needed
const id = '1407166599141887662';  // Ensure this template ID is correct and matches the message content
const p1='Dear Parent, Pink Pass issued for your ward at';
const p3 = 'and will be reaching home';
app.post('/send-sms-pink', async (req, res) => {
    const { message } = req.body;
    
    // Ensure the message is URL encoded to handle any special characters
   
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    const p =`${p1}+${formattedTime}+${formattedDate}+${p3}`;
    // Construct the API URL
    const smsApiUrl = `https://www.smsstriker.com/API/sms.php?username=${username}&password=${password}&from=${from}&to=${message}&msg=${p}&type=1&template_id=${id}`;

    try {
        // Make the API request
        const response = await axios.get(smsApiUrl);
        
        // Log the full response for debugging purposes
        // console.log('SMS API Response:', response.data);
        
        // Send a successful response to the client
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        // Log the error details for troubleshooting
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);

        // Send a failure response to the client
        res.status(500).json({ success: false, message: 'Error sending SMS', error: error.response ? error.response.data : error.message });
    }
});

app.post('/send-sms-out', async (req, res) => {
    const { message } = req.body;
    
    // Ensure the message is URL encoded to handle any special characters
   
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const p =`${p1}+${formattedDate}+${p3}`;
    // Construct the API URL
    const smsApiUrl = `https://www.smsstriker.com/API/sms.php?username=${username}&password=${password}&from=${from}&to=${message}&msg=${p}&type=1&template_id=${id}`;

    try {
        // Make the API request
        const response = await axios.get(smsApiUrl);
        
        // Log the full response for debugging purposes
        // console.log('SMS API Response:', response.data);
        
        // Send a successful response to the client
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        // Log the error details for troubleshooting
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);

        // Send a failure response to the client
        res.status(500).json({ success: false, message: 'Error sending SMS', error: error.response ? error.response.data : error.message });
    }
});


const id1 = '1407166599148308069';  // Ensure this template ID is correct and matches the message content
const p4='Dear Parent,Your ward has reported back at hostel at ';

app.post('/send-sms-in', async (req, res) => {
    const { message } = req.body;
    
    // Ensure the message is URL encoded to handle any special characters
   
    const currentDate1 = new Date();
    const formattedDate1 = currentDate1.toLocaleDateString();
    const formattedTime = currentDate1.toLocaleTimeString();
    const p =`${p4}+${formattedTime}+${formattedDate1}`;
    // Construct the API URL
    const smsApiUrl = `https://www.smsstriker.com/API/sms.php?username=${username}&password=${password}&from=${from}&to=${message}&msg=${p}&type=1&template_id=${id1}`;

    try {
        // Make the API request
        const response = await axios.get(smsApiUrl);
        
        // Log the full response for debugging purposes
        // console.log('SMS API Response:', response.data);
        
        // Send a successful response to the client
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        // Log the error details for troubleshooting
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);

        // Send a failure response to the client
        res.status(500).json({ success: false, message: 'Error sending SMS', error: error.response ? error.response.data : error.message });
    }
});


// Endpoint to update the Gatepass table
app.post('/update-gatepass', async (req, res) => {
    const { roll_no } = req.body;
    const currentDateTime = new Date();

    // Function to format date and time as 'YYYY-MM-DD HH:MM:SS'
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedDateTime = formatDateTime(currentDateTime);
    console.log("Formatted DateTime:", formattedDateTime);

    try {
        // Check if there is an existing record with outTime NULL
        const checkQuery = `
            SELECT * FROM Gatepass
            WHERE roll_no = ? AND outTime IS NULL
            ORDER BY gatepassID DESC
            LIMIT 1
        `;
        const [rows] = await dbconnect.execute(checkQuery, [roll_no]);

        if (rows.length === 0) {
            res.status(400).send({ message: 'No active issue found for this roll number.' });
            return;
        }

        const existingRecord = rows[0];
        const expectedOutTime = new Date(existingRecord.expectedOutTime);

        // Calculate time difference in hours
        const timeDifferenceInHours = (expectedOutTime - currentDateTime) / (1000 * 60 * 60);

        // If the time is over
        if (timeDifferenceInHours <= -2) {
            // Delete the student record from the database
            const deleteQuery = `
                DELETE FROM Gatepass WHERE gatepassID = ?
            `;
            await dbconnect.execute(deleteQuery, [existingRecord.gatepassID]);
            res.status(400).send({ message: 'Your time is over, and your issued pass has been rejected.' });
            return;
        }
        if (timeDifferenceInHours >=2) {
            // Delete the student record from the database
            
            res.status(400).send({ message: 'You have still time to go.' });
            return;
        }

        // Update the outTime if valid
        const updateQuery = `
            UPDATE Gatepass SET outTime = ? WHERE gatepassID = ?
        `;
        await dbconnect.execute(updateQuery, [formattedDateTime, existingRecord.gatepassID]);

        res.status(200).send({ message: 'Gatepass updated successfully!' });
    } catch (error) {
        console.error('Error updating Gatepass:', error);
        res.status(500).send({ error: 'Failed to update Gatepass.' });
    }
});





// // Endpoint to update the Gatepass table
// app.post('/update-gatepass', async (req, res) => {
//     const { roll_no } = req.body; // Get roll number from request body

//     // Get current date and time
//     const currentDateTime = new Date();

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
//     console.log("Formatted DateTime:", formattedDateTime); // To verify the format

//     try {
//         // Check if the last transaction for the student has non-null outTime but null inTime (incomplete transaction)
//         const checkQuery = `
//             SELECT * FROM Gatepass
//             WHERE roll_no = ?
//             ORDER BY gatepassID DESC
//             LIMIT 1
//         `;
//         const [rows] = await dbconnect.execute(checkQuery, [roll_no]);
//         const outpassCheckQuery = `
//         SELECT * FROM Outpass
//         WHERE roll_no = ?
//         ORDER BY outpassID DESC
//         LIMIT 1
//     `;
//     const [outpassRows] = await dbconnect.execute(outpassCheckQuery, [roll_no]);
//     const gatepassIncomplete = rows.length > 0 && rows[0].inTime === null;
//     const outpassIncomplete = outpassRows.length > 0 && outpassRows[0].inTime === null;

//     // If either the Gatepass or Outpass tables have an incomplete transaction, block the insertion
//     if (gatepassIncomplete || outpassIncomplete) {
//         res.status(400).send({ 
//             message: 'Cannot create new gatepass. The student has not yet returned from a previous outing (either Gatepass or Outpass is incomplete).' 
//         });
//     } else {
//         // Insert a new record into the Gatepass table
//         const insertQuery = `
//             INSERT INTO Gatepass (roll_no, outTime, date)
//             VALUES (?, ?, ?)
//         `;
//         const values = [roll_no, formattedDateTime, formattedDateTime.split(' ')[0]]; // Insert formatted datetime and date

//         await dbconnect.execute(insertQuery, values);
//         res.status(200).send({ message: 'Gatepass updated successfully!' });
//     }
//     } catch (error) {
//         console.error('Error updating Gatepass:', error);
//         res.status(500).send({ error: 'Failed to update Gatepass.' });
//     }
// });


// Endpoint to update the Gatepass table
app.post('/update-gatepass-issue', async (req, res) => {
    const { roll_no, current_time, expected_out_time  } = req.body; // Get roll number from request body
    if (!roll_no || !current_time || !expected_out_time) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      const currentDateTime = new Date(current_time);
      const expectedDateTime = new Date(expected_out_time);

   
    console.log("Formatted DateTime:",currentDateTime, expectedDateTime ); // To verify the format

    try {
        // Check if the last transaction for the student has non-null outTime but null inTime (incomplete transaction)
        const checkQuery = `
            SELECT * FROM Gatepass
            WHERE roll_no = ?
            ORDER BY gatepassID DESC
            LIMIT 1
        `;
        const [rows] = await dbconnect.execute(checkQuery, [roll_no]);
        const outpassCheckQuery = `
        SELECT * FROM Outpass
        WHERE roll_no = ?
        ORDER BY outpassID DESC
        LIMIT 1
    `;
    const [outpassRows] = await dbconnect.execute(outpassCheckQuery, [roll_no]);
    const gatepassIncomplete = rows.length > 0 && rows[0].inTime === null;
    const outpassIncomplete = outpassRows.length > 0 && outpassRows[0].inTime === null;

    // If either the Gatepass or Outpass tables have an incomplete transaction, block the insertion
    if (gatepassIncomplete) {
        res.status(400).send({ 
            message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (pink pass).' 
        });
    } 
    else if(outpassIncomplete){
        res.status(400).send({ 
            message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (ou tpass).' 
        });
    }
else {
        // Insert a new record into the Gatepass table
        const insertQuery = `
            INSERT INTO Gatepass (roll_no, issueTime, expOutTime)
            VALUES (?, ?, ?)
        `;
        const values = [roll_no, currentDateTime, expectedDateTime]; // Insert formatted datetime and date

        await dbconnect.execute(insertQuery, values);
        res.status(200).send({ message: 'Gatepass updated successfully!' });
    }
    } catch (error) {
        console.error('Error updating Gatepass:', error);
        res.status(500).send({ error: 'Failed to update Gatepass.' });
    }
});




// Endpoint to update the Gatepass table
app.post('/update-outpass-issue', async (req, res) => {
    const { roll_no,  expected_out_time  } = req.body; // Get roll number from request body
    if (!roll_no  || !expected_out_time) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      
      const expectedDateTime = new Date(expected_out_time);

     console.log(expectedDateTime);
   // To verify the format

    try {
        // Check if the last transaction for the student has non-null outTime but null inTime (incomplete transaction)
        const checkQuery = `
            SELECT * FROM Gatepass
            WHERE roll_no = ?
            ORDER BY gatepassID DESC
            LIMIT 1
        `;
        const [rows] = await dbconnect.execute(checkQuery, [roll_no]);
        const outpassCheckQuery = `
        SELECT * FROM Outpass
        WHERE roll_no = ?
        ORDER BY outpassID DESC
        LIMIT 1
    `;
    const [outpassRows] = await dbconnect.execute(outpassCheckQuery, [roll_no]);
    const gatepassIncomplete = rows.length > 0 && rows[0].inTime === null;
    const outpassIncomplete = outpassRows.length > 0 && outpassRows[0].inTime === null;

    // If either the Gatepass or Outpass tables have an incomplete transaction, block the insertion
    if (gatepassIncomplete) {
        res.status(400).send({ 
            message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (pink pass).' 
        });
    } 
    else if(outpassIncomplete){
        res.status(400).send({ 
            message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (out pass).' 
        });
    }
else {
        // Insert a new record into the Gatepass table
        const insertQuery = `
            INSERT INTO Outpass (roll_no, expOutTime)
            VALUES (?, ?)
        `;
        const values = [roll_no, expected_out_time]; // Insert formatted datetime and date

        await dbconnect.execute(insertQuery, values);
        res.status(200).send({ message: 'Outpass updated successfully!' });
    }
    } catch (error) {
        console.error('Error updating Outpass:', error);
        res.status(500).send({ error: 'Failed to update Outpass.' });
    }
});


// Endpoint to update the outpass table
app.post('/update-outpass-admin', async (req, res) => {
    const { roll_no } = req.body;
    const currentDateTime = new Date();

    // Function to format date and time as 'YYYY-MM-DD HH:MM:SS'
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formattedDateTime = formatDateTime(currentDateTime);
    const formattedDate = formatDate(currentDateTime);
    // console.log("Formatted DateTime:", formattedDateTime);//2024-10-22 09:54:59
    try {
        // Check if the last transaction for the student has non-null outTime but null inTime (incomplete transaction)
        const checkQuery = `
            SELECT * FROM Gatepass
            WHERE roll_no = ?
            ORDER BY gatepassID DESC
            LIMIT 1
        `;
        const [rows] = await dbconnect.execute(checkQuery, [roll_no]);
        const outpassCheckQuery = `
        SELECT * FROM Outpass
        WHERE roll_no = ?
        ORDER BY outpassID DESC
        LIMIT 1
    `;
    const [outpassRows] = await dbconnect.execute(outpassCheckQuery, [roll_no]);
    const gatepassIncomplete = rows.length > 0 && rows[0].inTime === null;
    const outpassIncomplete = outpassRows.length > 0 && outpassRows[0].inTime === null;

    // If either the Gatepass or Outpass tables have an incomplete transaction, block the insertion
    if (gatepassIncomplete) {
        res.status(400).send({ 
            message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (pink pass).' 
        });
    } 
    else if(outpassIncomplete){
        res.status(400).send({ 
            message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (out pass).' 
        });
    }
    else {
        // Insert a new record into the Gatepass table
        const insertQuery = `
            INSERT INTO Outpass (roll_no, outTime,date)
            VALUES (?, ?,?)
        `;
        const values = [roll_no, formattedDateTime,formattedDate]; // Insert formatted datetime and date

        await dbconnect.execute(insertQuery, values);
        res.status(200).send({ message: 'Outpass updated successfully!' });
    }
    } catch (error) {
        console.error('Error updating Outpass:', error);
        res.status(500).send({ error: 'Failed to update Outpass.' });
    }
});


// Endpoint to update the outpass table
app.post('/update-outpass-guard', async (req, res) => {
    const { roll_no } = req.body;
    const currentDateTime = new Date();

    // Function to format date and time as 'YYYY-MM-DD HH:MM:SS'
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedDateTime = formatDateTime(currentDateTime);
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const formattedDate = formatDate(currentDateTime);
    // console.log("Formatted DateTime:", formattedDateTime);

    try {
        //if already taken today...
        const checkTodayQuery = `
            SELECT * FROM Outpass
            WHERE roll_no = ? AND DATE(outTime) = ?
            ORDER BY outpassID DESC
            LIMIT 1
        `;
        const [todayRows] = await dbconnect.execute(checkTodayQuery, [roll_no, formattedDate]);

        // If an outpass was already issued today, block the request
        if (todayRows.length > 0) {
            res.status(400).send({ message: 'You have already been issued outpass today. You can only request a new one tomorrow.' });
            return;
        }



        // Check if there is an outpass issued yesterday
        const yesterday = new Date(currentDateTime);
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterday = formatDateTime(yesterday).split(' ')[0]; // Only date portion

        const checkYesterdayQuery = `
            SELECT * FROM Outpass
            WHERE roll_no = ? AND DATE(outTime) = ?
            ORDER BY outpassID DESC
            LIMIT 1
        `;
        const [yesterdayRows] = await dbconnect.execute(checkYesterdayQuery, [roll_no, formattedYesterday]);

        // If an outpass was issued yesterday, block today's request
        if (yesterdayRows.length > 0) {
            res.status(400).send({ message: 'You have already been issued outpass yesterday, so you can only request new one tomorrow.' });
            return;
        }

        // Check if there is an existing record with outTime NULL
        const checkQuery = `
        SELECT * FROM Gatepass
        WHERE roll_no = ?
        ORDER BY gatepassID DESC
        LIMIT 1
    `;
    const [rows] = await dbconnect.execute(checkQuery, [roll_no]);
    const outpassCheckQuery = `
    SELECT * FROM Outpass
    WHERE roll_no = ?
    ORDER BY outpassID DESC
    LIMIT 1
`;
const [outpassRows] = await dbconnect.execute(outpassCheckQuery, [roll_no]);
const gatepassIncomplete = rows.length > 0 && rows[0].inTime === null;
const outpassIncomplete = outpassRows.length > 0 && outpassRows[0].inTime === null;




if (gatepassIncomplete) {
    res.status(400).send({ 
        message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (pink pass).' 
    });
} 
else if(outpassIncomplete){
    res.status(400).send({ 
        message: 'Cannot issue new gatepass. The student has not yet returned from a previous outing (out pass).' 
    });
}
else {
    // Insert a new record into the Gatepass table
    const insertQuery = `
        INSERT INTO Outpass (roll_no, outTime,date)
        VALUES (?, ?,?)
    `;
    const values = [roll_no, formattedDateTime,formattedDate]; // Insert formatted datetime and date

    await dbconnect.execute(insertQuery, values);
    res.status(200).send({ message: 'Outpass updated successfully!' });
}}
catch (error) {
        console.error('Error updating Outpass:', error);
        res.status(500).send({ error: 'Failed to update Outpass.' });
    }
});





// Endpoint to upload an Excel file
app.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path; // Get the uploaded file path
    console.log('Excel file uploaded:', filePath);

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Insert data into the database
        for (const row of data) {
            const { roll_no,name,  year, branch, hostel_block_name, room_no, parent_no,gender } = row;

            const query = `INSERT INTO users (studentId,sname, syear, branch, hostelblock,  roomno,parentno,gender) VALUES (?, ?, ?, ?, ?, ?, ?,?) `;
            const values = [roll_no,name,  year, branch, hostel_block_name, room_no, parent_no,gender || null];

            await dbconnect.execute(query, values);
        }

        res.status(200).send({ message: 'Excel file uploaded and data inserted successfully.' });
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).send({ message: 'Failed to process Excel file.' });
    }
});




app.post('/upload-images-excel', upload.single('imageExcelFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path; // Get the uploaded file path
    console.log('Excel file with images uploaded:', filePath);

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Insert data into the database
        for (const row of data) {
            const { studentId, imageUrl } = row; // Ensure these column names match your Excel file

            const query = `UPDATE users SET imageUrl = ? WHERE studentId = ?`;
            const values = [imageUrl, studentId];

            await dbconnect.execute(query, values);
        }

        res.status(200).send({ message: 'Image data inserted successfully.' });
    } catch (error) {
        console.error('Error processing image Excel file:', error);
        res.status(500).send({ message: 'Failed to process image Excel file.' });
    }
});



app.get('/get-student-details/:roll_no', async (req, res) => {
    const rollNo = req.params.roll_no;

    try {
        // Fetch the student details
        const studentQuery = `SELECT r.studentId, r.sname,r.gender, r.syear, r.branch, r.hostelblock, r.roomno, r.parentno,r.imageUrl FROM users r WHERE r.studentId = ?`;
        const [studentRows] = await dbconnect.execute(studentQuery, [rollNo]);

        if (studentRows.length > 0) {
            // Fetch the Gatepass details (date, outTime, inTime)
            const gatepassQuery = `
                SELECT 
                    g.date,
                    g.outTime,
                    g.inTime
                FROM 
                    Gatepass g
                WHERE 
                    g.roll_no = ?
            `;
            const outpassQuery = `
                SELECT 
                    g.date,
                    g.outTime,
                    g.inTime
                FROM 
                    Outpass g
                WHERE 
                    g.roll_no = ?
            `;
            const [outpassRows] = await dbconnect.execute(outpassQuery, [rollNo]);
            const [gatepassRows] = await dbconnect.execute(gatepassQuery, [rollNo]);

            // Fetch the image URL associated with the student
            const imageQuery = `SELECT imageUrl FROM images WHERE studentId = ?`;
            const [imageRows] = await dbconnect.execute(imageQuery, [rollNo]);

            // Get the current year and month
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // getMonth() returns 0 for January

            // Count the number of entries in the Gatepass table for the user for the current month
            const countQuery = `
                SELECT COUNT(*) as count 
                FROM Gatepass 
                WHERE roll_no = ? 
                  AND YEAR(date) = ? 
                  AND MONTH(date) = ?
            `;
            const countoutQuery = `
                SELECT COUNT(*) as count 
                FROM Outpass 
                WHERE roll_no = ? 
                  AND YEAR(date) = ? 
                  AND MONTH(date) = ?
            `;
            const [countRows] = await dbconnect.execute(countQuery, [rollNo, currentYear, currentMonth]);
            const [countoutRows] = await dbconnect.execute(countoutQuery, [rollNo, currentYear, currentMonth]);

            // Prepare student data
            const studentData = {
                ...studentRows[0], // Student details
                gatepasses: gatepassRows,
                outpasses: outpassRows,
                gatepassCount: countRows[0].count, // Gatepass count for the current month
                outpassCount: countoutRows[0].count, // Outpass count for the current month
                // imageUrl: imageRows.length > 0 ? imageRows[0].imageUrl : null // Fetching the image URL, if available
            };

            res.json(studentData);
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).send({ error: 'Failed to fetch student details' });
    }
});

app.get('/getAllStudents', async (req, res) => {
    try {
        const query = `SELECT studentId, sname, syear, branch, hostelblock, roomno, parentno FROM users `;
      const [students] = await dbconnect.execute(query);
      res.status(200).json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).send({ message: 'Failed to retrieve student data' });
    }
  });


  
// REPORT routes


// Endpoint to fetch current gatepass report
app.get('/current-gatepass-report', async (req, res) => {
    const query = `
    SELECT 
        r.sname,
        r.studentId,
        r.syear,
        r.branch,
        r.hostelblock,
        r.roomno,
        r.parentno,
        g.outTime AS outTime,
        g.inTime AS inTime,
        DATE(g.date) AS date,  
        g.fine,
        'Gatepass' AS type
    FROM 
        users r
    JOIN 
        Gatepass g ON r.studentId = g.roll_no
    WHERE 
        (DATE(g.outTime) = CURDATE() OR DATE(g.inTime) = CURDATE())

    UNION ALL

    SELECT 
        r.sname,
        r.studentId,
        r.syear,
        r.branch,
        r.hostelblock,
        r.roomno,
        r.parentno,
        o.outTime AS outTime,
        o.inTime AS inTime,
        DATE(o.date) AS date,  
        o.fine,
        'Outpass' AS type
    FROM 
        users r
    JOIN 
        Outpass o ON r.studentId = o.roll_no
    WHERE 
        (DATE(o.outTime) = CURDATE() OR DATE(o.inTime) = CURDATE());
    `;

    try {
        const [rows] = await dbconnect.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching current gatepass report:', error);
        res.status(500).send({ error: 'Failed to fetch current gatepass report' });
    }
});

///filtered report
app.get('/current-gatepass-report-filtered', async (req, res) => {
    const { from, to, type } = req.query; // Get the type from the query
    let query;
    let params = [from, to,from,to];

    if (type === 'gatepass') {
        query = `
            SELECT 
                r.sname,
                r.studentId,
                r.syear,
                r.branch,
                r.hostelblock,
                r.roomno,
                r.parentno,
                g.outTime AS outTime,
                g.inTime AS inTime,
                DATE(g.date) AS date,  
                g.fine
            FROM 
                users r
            JOIN 
                Gatepass g ON r.studentId = g.roll_no
            WHERE 
                DATE(g.outTime) BETWEEN ? AND ? 
                OR DATE(g.inTime) BETWEEN ? AND ?;  
        `;
       // Add params for inTime comparison
       
    } else if (type === 'outpass') {
        query = `
            SELECT 
                r.sname,
                r.studentId,
                r.syear,
                r.branch,
                r.hostelblock,
                r.roomno,
                r.parentno,
                o.outTime AS outTime,
                o.inTime AS inTime,
                DATE(o.date) AS date,  
                o.fine
            FROM 
                users r
            JOIN 
                Outpass o ON r.studentId = o.roll_no
            WHERE 
                DATE(o.outTime) BETWEEN ? AND ? 
                OR DATE(o.inTime) BETWEEN ? AND ?;  
        `;
        // Add params for inTime comparison
       
    } else if (type === 'all') {
        query = `
            SELECT 
                r.sname,
                r.studentId,
                r.syear,
                r.branch,
                r.hostelblock,
                r.roomno,
                r.parentno,
                g.outTime AS outTime,
                g.inTime AS inTime,
                DATE(g.date) AS date,  
                g.fine
            FROM 
                users r
            JOIN 
                Gatepass g ON r.studentId = g.roll_no
            WHERE 
                DATE(g.outTime) BETWEEN ? AND ? 
                OR DATE(g.inTime) BETWEEN ? AND ? 
            UNION ALL
            SELECT 
                r.sname,
                r.studentId,
                r.syear,
                r.branch,
                r.hostelblock,
                r.roomno,
                r.parentno,
                o.outTime AS outTime,
                o.inTime AS inTime,
                DATE(o.date) AS date,  
                o.fine
            FROM 
                users r
            JOIN 
                Outpass o ON r.studentId = o.roll_no
            WHERE 
                DATE(o.outTime) BETWEEN ? AND ? 
                OR DATE(o.inTime) BETWEEN ? AND ?;  
        `;
        params.push(from, to,from,to); // Add params for second query in the UNION
    } else {
        return res.status(400).send({ error: 'Invalid report type' });
    }

    try {
        const [rows] = await dbconnect.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching current gatepass report:', error);
        res.status(500).send({ error: 'Failed to fetch current gatepass report' });
    }
});

app.get('/dashboard-data', async (req, res) => {
    const { date } = req.query;  // Get date from query parameters
  const formattedDate = date || 'CURDATE()';

    try {
      const queries = {
        totalStudents: `
          SELECT COUNT(*) AS totalStudents
          FROM users
        `,
        totalGirls: `
          SELECT COUNT(*) AS totalGirls
          FROM users
          WHERE gender = 'Female'
        `,
        totalBoys: `
          SELECT COUNT(*) AS totalBoys
          FROM users
          WHERE gender = 'Male'
        `,
        totalPasses: `
          SELECT (SELECT COUNT(*) FROM Gatepass) + (SELECT COUNT(*) FROM Outpass) AS totalPasses
        `,
        pinkPass: `
          SELECT COUNT(*) AS pinkpass
          FROM Gatepass
          WHERE outTime IS NOT NULL
        `,
        outPass: `
        SELECT COUNT(*) AS outpass
        FROM Outpass
        WHERE outTime IS NOT NULL
      `,
        present: `
          SELECT COUNT(DISTINCT u.studentId) AS present
          FROM users u
          LEFT JOIN Gatepass g ON u.studentId = g.roll_no
          LEFT JOIN Outpass o ON u.studentId = o.roll_no
          WHERE 
            NOT EXISTS (
              SELECT 1
              FROM Gatepass g2
              WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            AND NOT EXISTS (
              SELECT 1
              FROM Outpass o2
              WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            )
        `,
        presentGirls: `
          SELECT COUNT(DISTINCT u.studentId) AS presentgirls
          FROM users u
          LEFT JOIN Gatepass g ON u.studentId = g.roll_no
          LEFT JOIN Outpass o ON u.studentId = o.roll_no
          WHERE u.gender = 'Female'
            AND NOT EXISTS (
              SELECT 1
              FROM Gatepass g2
              WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            AND NOT EXISTS (
              SELECT 1
              FROM Outpass o2
              WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            )
        `,
        presentBoys: `
          SELECT COUNT(DISTINCT u.studentId) AS presentboys
          FROM users u
          LEFT JOIN Gatepass g ON u.studentId = g.roll_no
          LEFT JOIN Outpass o ON u.studentId = o.roll_no
          WHERE u.gender = 'Male'
            AND NOT EXISTS (
              SELECT 1
              FROM Gatepass g2
              WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            AND NOT EXISTS (
              SELECT 1
              FROM Outpass o2
              WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            )
        `,
        notRet: `
          SELECT COUNT(DISTINCT u.studentId) AS notret
          FROM users u
          LEFT JOIN Gatepass g ON u.studentId = g.roll_no
          LEFT JOIN Outpass o ON u.studentId = o.roll_no
          WHERE (
            EXISTS (
              SELECT 1
              FROM Gatepass g2
              WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            OR EXISTS (
              SELECT 1
              FROM Outpass o2
              WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            ))
        `,
        notRetGirls: `
          SELECT COUNT(DISTINCT u.studentId) AS notretgirls
          FROM users u
          LEFT JOIN Gatepass g ON u.studentId = g.roll_no
          LEFT JOIN Outpass o ON u.studentId = o.roll_no
          WHERE u.gender = 'Female' AND
            (EXISTS (
              SELECT 1
              FROM Gatepass g2
              WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            OR EXISTS (
              SELECT 1
              FROM Outpass o2
              WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
      ))
        `,
        notRetBoys: `
          SELECT COUNT(DISTINCT u.studentId) AS notretboys
          FROM users u
          LEFT JOIN Gatepass g ON u.studentId = g.roll_no
          LEFT JOIN Outpass o ON u.studentId = o.roll_no
          WHERE u.gender = 'Male' AND
            (EXISTS (
              SELECT 1
              FROM Gatepass g2
              WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            OR EXISTS (
              SELECT 1
              FROM Outpass o2
              WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
      ))
        `,
        todaysGatepassGirlsIssued: `
          SELECT COUNT(*) AS todaysGatepassGirlsIssued FROM Gatepass g
          JOIN users u ON g.roll_no = u.studentId
          WHERE u.gender = 'Female' AND DATE(g.issueTime) = '${formattedDate}'
        `,
        todaysGatepassGirls: `
          SELECT COUNT(*) AS todaysGatepassGirls FROM Gatepass g
          JOIN users u ON g.roll_no = u.studentId
          WHERE u.gender = 'Female' AND DATE(g.outTime) = '${formattedDate}'
        `,
        todaysOutpassBoys: `
        SELECT COUNT(*) AS todaysOutpassBoys FROM Outpass g
        JOIN users u ON g.roll_no = u.studentId
        WHERE u.gender = 'Male' AND DATE(g.outTime) = '${formattedDate}'
      `,
      todaysGatepassBoysIssued: `
      SELECT COUNT(*) AS todaysGatepassBoysIssued FROM Gatepass g
      JOIN users u ON g.roll_no = u.studentId
      WHERE u.gender = 'Male' AND DATE(g.issueTime) = '${formattedDate}'
    `,
      todaysGatepassBoys: `
      SELECT COUNT(*) AS todaysGatepassBoys FROM Gatepass g
      JOIN users u ON g.roll_no = u.studentId
      WHERE u.gender = 'Male' AND DATE(g.outTime) = '${formattedDate}'
    `,
  todaysInTimeGirls: `
         SELECT COUNT(*) AS todaysGatepassGirlsIntime FROM Gatepass g
    JOIN users u ON g.roll_no = u.studentId
    WHERE u.gender = 'Female' AND DATE(g.inTime) = '${formattedDate}'
        `,
        todaysOutTimeBoys: `
        SELECT COUNT(*) AS todaysOutTimeBoys FROM (
          SELECT g.roll_no FROM Gatepass g
          JOIN users u ON g.roll_no = u.studentId
          WHERE u.gender = 'Male' AND DATE(g.outTime) = '${formattedDate}'
          UNION ALL
          SELECT o.roll_no FROM Outpass o
          JOIN users u ON o.roll_no = u.studentId
          WHERE u.gender = 'Male' AND DATE(o.outTime) = '${formattedDate}' 
        ) AS combined
      `,
      todaysInTimeBoys: `
        SELECT COUNT(*) AS todaysInTimeBoys FROM (
          SELECT g.roll_no FROM Gatepass g
          JOIN users u ON g.roll_no = u.studentId
          WHERE u.gender = 'Male' AND DATE(g.inTime) = '${formattedDate}'
          UNION ALL
          SELECT o.roll_no FROM Outpass o
          JOIN users u ON o.roll_no = u.studentId
          WHERE u.gender = 'Male' AND DATE(o.inTime) = '${formattedDate}'
        ) AS combined
      `
      };
      const results = await Promise.all(
        Object.keys(queries).map(async (key) => {
          const [rows] = await dbconnect.execute(queries[key]);
          return { [key]: rows[0][Object.keys(rows[0])[0]] };
        })
      );
  
      const data = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      res.json(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });
  

app.get('/students-filtered', async (req, res) => {
    const { gender, blockName } = req.query;
    
    let query = `
        SELECT 
            sname,
            studentId,
            syear,
            branch,
            hostelblock,
            roomno,
            parentno
        FROM 
            users 
        WHERE 
            1 = 1
    `;
    let params = [];

    // Add conditions based on provided filters
    if (gender && gender !== 'all') {
        query += ' AND gender = ?';
        params.push(gender);
    }

    if (blockName && blockName !== 'all') {
        query += ' AND hostelblock = ?';
        params.push(blockName);
    }

    try {
        const [rows] = await dbconnect.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching filtered students data:', error);
        res.status(500).send({ error: 'Failed to fetch filtered students data' });
    }
});
//in studentprofile

app.get('/get-student-details-profile/:roll_no', async (req, res) => {
    const rollNo = req.params.roll_no;

    try {
        // Fetch the student details
        const studentQuery = `SELECT r.studentId, r.sname,r.gender, r.syear, r.branch, r.hostelblock, r.roomno, r.parentno,r.imageUrl FROM users r WHERE r.studentId = ?`;
        const [studentRows] = await dbconnect.execute(studentQuery, [rollNo]);

        if (studentRows.length > 0) {
            // Fetch the Gatepass and Outpass details (date, outTime, inTime)
            const gatepassQuery = `
                SELECT g.date, g.outTime, g.inTime FROM Gatepass g WHERE g.roll_no = ?`;
            const outpassQuery = `
                SELECT g.date, g.outTime, g.inTime FROM Outpass g WHERE g.roll_no = ?`;

            const [gatepassRows] = await dbconnect.execute(gatepassQuery, [rollNo]);
            const [outpassRows] = await dbconnect.execute(outpassQuery, [rollNo]);

            // Combine the passes and add type
            const passes = [
                ...gatepassRows.map(pass => ({ ...pass, type: 'Gatepass' })),
                ...outpassRows.map(pass => ({ ...pass, type: 'Outpass' }))
            ];

            // Fetch the image URL associated with the student
            const imageQuery = `SELECT imageUrl FROM images WHERE studentId = ?`;
            const [imageRows] = await dbconnect.execute(imageQuery, [rollNo]);

            // Get the current year and month
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // getMonth() returns 0 for January

            // Count the number of entries in the Gatepass table for the user for the current month
            const countQuery = `
                SELECT COUNT(*) as count 
                FROM Gatepass 
                WHERE roll_no = ? 
                  AND YEAR(date) = ? 
                  AND MONTH(date) = ?`;
            const countoutQuery = `
                SELECT COUNT(*) as count 
                FROM Outpass 
                WHERE roll_no = ? 
                  AND YEAR(date) = ? 
                  AND MONTH(date) = ?`;
            const [countRows] = await dbconnect.execute(countQuery, [rollNo, currentYear, currentMonth]);
            const [countoutRows] = await dbconnect.execute(countoutQuery, [rollNo, currentYear, currentMonth]);

            // Prepare student data
            const studentData = {
                ...studentRows[0], // Student details
                passes, // Combined gatepasses and outpasses
                gatepassCount: countRows[0].count, // Gatepass count for the current month
                outpassCount: countoutRows[0].count, // Outpass count for the current month
            };

            res.json(studentData);
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).send({ error: 'Failed to fetch student details' });
    }
});




app.get('/current-passes-filtered/:rollNo', async (req, res) => {
    const { rollNo } = req.params;  // Get the rollNo from the URL parameter
    const { from, to, type } = req.query;  // Get the date range and type from the query string

    // Validate date format (Optional but recommended)
    if (!from || !to) {
        return res.status(400).send({ error: 'Both "from" and "to" dates are required.' });
    }

    let query;
    let params = [rollNo, from, to, from, to];  // Basic params for rollNo and dates

    // Check for pass type filter and modify query accordingly
    if (type === 'gatepass') {
        // Only fetch Gatepass data
        query = `
            SELECT 
               
                g.outTime AS outTime,
                g.inTime AS inTime,
                
                'gatepass' AS type 
            FROM 
                users r
            JOIN 
                Gatepass g ON r.studentId = g.roll_no
            WHERE 
                r.studentId = ? 
                AND ((DATE(g.outTime) BETWEEN ? AND ?) OR (DATE(g.inTime) BETWEEN ? AND ?));
        `;
    } else if (type === 'outpass') {
        // Only fetch Outpass data
        query = `
            SELECT 
               
                o.outTime AS outTime,
                o.inTime AS inTime,
               
                'outpass' AS type  
            FROM 
                users r
            JOIN 
                Outpass o ON r.studentId = o.roll_no
            WHERE 
                r.studentId = ? 
                AND ((DATE(o.outTime) BETWEEN ? AND ?) OR (DATE(o.inTime) BETWEEN ? AND ?));
        `;
    } else if (type === 'all') {
        // Fetch both Gatepass and Outpass data
        query = `
            SELECT 
                
                g.outTime AS outTime,
                g.inTime AS inTime,
                'Gatepass' AS type  
            FROM 
                users r
            JOIN 
                Gatepass g ON r.studentId = g.roll_no
            WHERE 
                r.studentId = ? 
                AND (DATE(g.outTime) BETWEEN ? AND ? OR DATE(g.inTime) BETWEEN ? AND ?)
            UNION ALL
            SELECT 
                
                o.outTime AS outTime,
                o.inTime AS inTime,
                'Outpass' AS type  
            FROM 
                users r
            JOIN 
                Outpass o ON r.studentId = o.roll_no
            WHERE 
                r.studentId = ? 
                AND (DATE(o.outTime) BETWEEN ? AND ? OR DATE(o.inTime) BETWEEN ? AND ?);
        `;
        params.push(rollNo, from, to, from, to); // Adding the params for the second query in the UNION
    } else {
        return res.status(400).send({ error: 'Invalid report type' });
    }

    try {
        const [rows] = await dbconnect.execute(query, params);
        
        // If there are no records, return a message instead of an empty array
        if (rows.length === 0) {
            return res.status(404).send({ error: 'No passes found for the given filters.' });
        }

        // Return the result rows
        res.json(rows);
    } catch (error) {
        console.error('Error fetching passes data:', error);
        res.status(500).send({ error: 'Failed to fetch filtered passes data' });
    }
});

app.get('/students-filtered-by-id', async (req, res) => {
    const { id } = req.query;
    let query;
    let params = [];

    if (id) {
        query = `
            SELECT sname, studentId, syear, branch, hostelblock, roomno, parentno
            FROM users
            WHERE studentId LIKE ?;
        `;
        params.push(`%${id}%`);
    } else {
        query = `
            SELECT sname, studentId, syear, branch, hostelblock, roomno, parentno
            FROM users;
        `;
    }

    try {
        const [rows] = await dbconnect.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send({ error: 'Failed to fetch students' });
    }
});
app.get('/present-students', async (req, res) => {
    try {
      const query = `
       SELECT DISTINCT u.sname, u.studentId, u.syear, u.branch, u.hostelblock, u.roomno, u.parentno
FROM users u
LEFT JOIN Gatepass g ON u.studentId = g.roll_no
LEFT JOIN Outpass o ON u.studentId = o.roll_no
WHERE 
   
    NOT EXISTS (
        SELECT 1
        FROM Gatepass g2
        WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
    )
   
    AND NOT EXISTS (
        SELECT 1
        FROM Outpass o2
        WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
    );


      `;
      
      const [students] = await dbconnect.execute(query);
      res.json(students);
    } catch (error) {
      console.error('Error fetching present students:', error);
      res.status(500).json({ error: 'Failed to fetch present students' });
    }
  });
  
  app.get('/present-student-filtered', async (req, res) => {
    const { gender, blockName } = req.query;
    
    let query = `
        SELECT DISTINCT u.sname, u.studentId, u.syear, u.branch, u.hostelblock, u.roomno, u.parentno
        FROM users u
        LEFT JOIN Gatepass g ON u.studentId = g.roll_no
        LEFT JOIN Outpass o ON u.studentId = o.roll_no
        WHERE 
            -- Only include students where all their Gatepass records have both outTime and inTime set
            NOT EXISTS (
                SELECT 1
                FROM Gatepass g2
                WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            -- Only include students where all their Outpass records have both outTime and inTime set
            AND NOT EXISTS (
                SELECT 1
                FROM Outpass o2
                WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            )
    `;

    let params = [];

    // Add conditions based on provided filters
    if (gender && gender !== 'all') {
        query += ' AND u.gender = ?';
        params.push(gender);
    }

    if (blockName && blockName !== 'all') {
        query += ' AND u.hostelblock = ?';
        params.push(blockName);
    }

    try {
        const [students] = await dbconnect.execute(query, params);
        res.json(students);
    } catch (error) {
        console.error('Error fetching filtered present students:', error);
        res.status(500).send({ error: 'Failed to fetch filtered present students' });
    }
});

app.get('/present-student-filtered-by-id', async (req, res) => {
    const { id } = req.query;
    let query = `
        SELECT DISTINCT u.sname, u.studentId, u.syear, u.branch, u.hostelblock, u.roomno, u.parentno
        FROM users u
        LEFT JOIN Gatepass g ON u.studentId = g.roll_no
        LEFT JOIN Outpass o ON u.studentId = o.roll_no
        WHERE 
            -- Only include students where all their Gatepass records have both outTime and inTime set
            NOT EXISTS (
                SELECT 1
                FROM Gatepass g2
                WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            -- Only include students where all their Outpass records have both outTime and inTime set
            AND NOT EXISTS (
                SELECT 1
                FROM Outpass o2
                WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            )
    `;

    let params = [];

    // If an ID is provided, filter by that ID
    if (id) {
        query += ' AND u.studentId LIKE ?';
        params.push(`%${id}%`);
    }

    try {
        const [students] = await dbconnect.execute(query, params);
        res.json(students);
    } catch (error) {
        console.error('Error fetching filtered present students by ID:', error);
        res.status(500).send({ error: 'Failed to fetch filtered present students by ID' });
    }
});

// Route to get all students who are not present in the hostel
app.get('/not-present-students', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT u.sname, u.studentId, u.syear, u.branch, u.hostelblock, u.roomno, u.parentno
            FROM users u
            LEFT JOIN Gatepass g ON u.studentId = g.roll_no
            LEFT JOIN Outpass o ON u.studentId = o.roll_no
            WHERE 
                -- Check for Gatepass records with outTime but no inTime
                EXISTS (
                    SELECT 1
                    FROM Gatepass g2
                    WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
                )
                -- Check for Outpass records with outTime but no inTime
                OR EXISTS (
                    SELECT 1
                    FROM Outpass o2
                    WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
                );
        `;

        const [students] = await dbconnect.execute(query);
        res.json(students);
    } catch (error) {
        console.error('Error fetching not-present students:', error);
        res.status(500).json({ error: 'Failed to fetch not-present students' });
    }
});

// Route to get filtered not-present students based on gender and blockName
app.get('/not-present-student-filtered', async (req, res) => {
    const { gender, blockName } = req.query;
    
    let query = `
        SELECT DISTINCT u.sname, u.studentId, u.syear, u.branch, u.hostelblock, u.roomno, u.parentno
        FROM users u
        LEFT JOIN Gatepass g ON u.studentId = g.roll_no
        LEFT JOIN Outpass o ON u.studentId = o.roll_no
        WHERE 
            -- Check for Gatepass records with outTime but no inTime
            EXISTS (
                SELECT 1
                FROM Gatepass g2
                WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            -- Check for Outpass records with outTime but no inTime
            OR EXISTS (
                SELECT 1
                FROM Outpass o2
                WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            )
    `;

    let params = [];

    // Add conditions based on provided filters
    if (gender && gender !== 'all') {
        query += ' AND u.gender = ?';
        params.push(gender);
    }

    if (blockName && blockName !== 'all') {
        query += ' AND u.hostelblock = ?';
        params.push(blockName);
    }

    try {
        const [students] = await dbconnect.execute(query, params);
        res.json(students);
    } catch (error) {
        console.error('Error fetching filtered not-present students:', error);
        res.status(500).send({ error: 'Failed to fetch filtered not-present students' });
    }
});

// Route to get filtered not-present students by studentId
app.get('/not-present-student-filtered-by-id', async (req, res) => {
    const { id } = req.query;
    let query = `
        SELECT DISTINCT u.sname, u.studentId, u.syear, u.branch, u.hostelblock, u.roomno, u.parentno
        FROM users u
        LEFT JOIN Gatepass g ON u.studentId = g.roll_no
        LEFT JOIN Outpass o ON u.studentId = o.roll_no
        WHERE 
            -- Check for Gatepass records with outTime but no inTime
            EXISTS (
                SELECT 1
                FROM Gatepass g2
                WHERE g2.roll_no = u.studentId AND g2.outTime IS NOT NULL AND g2.inTime IS NULL
            )
            -- Check for Outpass records with outTime but no inTime
            OR EXISTS (
                SELECT 1
                FROM Outpass o2
                WHERE o2.roll_no = u.studentId AND o2.outTime IS NOT NULL AND o2.inTime IS NULL
            )
    `;

    let params = [];

    // If an ID is provided, filter by that ID
    if (id) {
        query += ' AND u.studentId LIKE ?';
        params.push(`%${id}%`);
    }

    try {
        const [students] = await dbconnect.execute(query, params);
        res.json(students);
    } catch (error) {
        console.error('Error fetching filtered not-present students by ID:', error);
        res.status(500).send({ error: 'Failed to fetch filtered not-present students by ID' });
    }
});

app.get('/all-passes', async (req, res) => {
    try {
      const query = `
        SELECT 
        distinct
          u.sname, 
          u.studentId, 
          u.syear, 
          u.branch, 
          u.hostelblock, 
          u.roomno, 
          u.parentno, 
          COUNT(g.roll_no) AS gatepassCount, 
          COUNT(o.roll_no) AS outpassCount
        FROM users u
        LEFT JOIN Gatepass g ON u.studentId = g.roll_no AND g.outTime IS NOT NULL 
        LEFT JOIN Outpass o ON u.studentId = o.roll_no AND o.outTime IS NOT NULL 
        GROUP BY u.studentId
      `;
      
      const [students] = await dbconnect.execute(query);
      res.json(students);
    } catch (error) {
      console.error('Error fetching all passes data:', error);
      res.status(500).json({ error: 'Failed to fetch all passes data' });
    }
  });

  app.get('/passes-filtered', async (req, res) => {
    const { gender, blockName } = req.query;

    let query = `
        SELECT 
            distinct
            u.sname, 
            u.studentId, 
            u.syear, 
            u.branch, 
            u.hostelblock, 
            u.roomno, 
            u.parentno, 
            COUNT(g.roll_no) AS gatepassCount, 
            COUNT(o.roll_no) AS outpassCount
        FROM users u
        LEFT JOIN Gatepass g ON u.studentId = g.roll_no AND g.outTime IS NOT NULL
        LEFT JOIN Outpass o ON u.studentId = o.roll_no AND o.outTime IS NOT NULL
        WHERE 1=1
    `;

    // Add filters based on query parameters
    if (gender && gender !== 'all') {
        query += ` AND u.gender = '${gender}'`;
    }

    if (blockName && blockName !== 'all') {
        query += ` AND u.hostelblock = '${blockName}'`;
    }

    query += ' GROUP BY u.studentId';

    try {
        const [students] = await dbconnect.execute(query);
        res.json(students);
    } catch (error) {
        console.error('Error fetching filtered passes data:', error);
        res.status(500).json({ error: 'Failed to fetch filtered passes data' });
    }
});

app.get('/passes-filtered-by-id', async (req, res) => {
    const { id } = req.query;

    let query = `
        SELECT 
            distinct
            u.sname, 
            u.studentId, 
            u.syear, 
            u.branch, 
            u.hostelblock, 
            u.roomno, 
            u.parentno, 
            COUNT(g.roll_no) AS gatepassCount, 
            COUNT(o.roll_no) AS outpassCount
        FROM users u
        LEFT JOIN Gatepass g ON u.studentId = g.roll_no AND g.outTime IS NOT NULL
        LEFT JOIN Outpass o ON u.studentId = o.roll_no AND o.outTime IS NOT NULL
        WHERE u.studentId LIKE ?
        GROUP BY u.studentId
    `;

    try {
        const [students] = await dbconnect.execute(query, [`%${id}%`]);
        res.json(students);
    } catch (error) {
        console.error('Error fetching passes filtered by ID:', error);
        res.status(500).json({ error: 'Failed to fetch passes filtered by ID' });
    }
});


app.post('/send-report', async (req, res) => {
    const { fromDate, toDate,filterType } = req.body;
    try {
        await fetchAndEmailData(fromDate, toDate,filterType);
        res.status(200).send('Report sent successfully.');
    } catch (error) {
        console.error('Error sending report:', error);
        res.status(500).send('Failed to send report.');
    }
});





// Endpoint to download current gatepass report
app.get('/download-current-gatepass-report', async (req, res) => {
    const query = `
        SELECT 
            r.sname,
        r.studentId,
        r.syear,
        r.branch,
        r.hostelblock,
        r.roomno,
        r.parentno,
        g.outTime AS outTime,
        g.inTime AS inTime,
       'Gatepass' AS type
        FROM 
            users r
        JOIN 
            Gatepass g ON r.studentId = g.roll_no
        WHERE 
            (DATE(g.outTime) = CURDATE() OR DATE(g.inTime) = CURDATE())
        UNION ALL

    SELECT 
        r.sname,
        r.studentId,
        r.syear,
        r.branch,
        r.hostelblock,
        r.roomno,
        r.parentno,
        o.outTime AS outTime,
        o.inTime AS inTime,
        'Outpass' AS type
    FROM 
        users r
    JOIN 
        Outpass o ON r.studentId = o.roll_no
    WHERE 
        (DATE(o.outTime) = CURDATE() OR DATE(o.inTime) = CURDATE());
    `;

    try {
        const [rows] = await dbconnect.execute(query);
        
        // Create Excel file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Gatepass Data');

        // Add header row
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Roll No', key: 'roll_no', width: 15 },
            { header: 'Year', key: 'year', width: 10 },
            { header: 'Branch', key: 'branch', width: 20 },
            { header: 'Hostel Block Name', key: 'hostel_block_name', width: 25 },
            { header: 'Room No', key: 'room_no', width: 15 },
            { header: 'Parent No', key: 'parent_no', width: 15 },
            { header: 'Out Time', key: 'outTime', width: 20 },
            { header: 'In Time', key: 'inTime', width: 20 },
            { header: 'Type', key: 'type', width: 20 },

        ];

        // Add rows to the Excel file
        rows.forEach(row => {
            worksheet.addRow({
                name: row.sname,
                roll_no: row.studentId,
                year: row.syear,
                branch: row.branch,
                hostel_block_name: row.hostelblock,
                room_no: row.roomno,
                parent_no: row.parentno,
                outTime: row.outTime,
                inTime: row.inTime,
                type: row.type,
            });
        });

        // Get current date and time for the file name
        const now = new Date();
        const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeString = now.toISOString().split('T')[1].replace(/:/g, '-').split('.')[0]; // HH-MM-SS

        // Folder path to save Excel files
        const folderPath = path.join(__dirname, './Daily_report');
        
        // Create the folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Create file name with current date and time
        const fileName = path.join(folderPath,` ${dateString}_${timeString}.xlsx`);
        await workbook.xlsx.writeFile(fileName);

        // Set the file name dynamically in the download response
        const downloadFileName = `${dateString}_${timeString}.xlsx`;

        // Send the file as a download response
        res.download(fileName, downloadFileName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send({ error: 'Failed to download the file' });
            }
        });
    } catch (error) {
        console.error('Error downloading current gatepass report:', error);
        res.status(500).send({ error: 'Failed to download current gatepass report' });
    }
});


// Endpoint to save report time
function timeToCron(time) {
    const [hours, minutes] = time.split(':');
    return `${minutes} ${hours} * * *`;
}


app.get('/get-filtered-gatepasses/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required' });
    }

    try {
    
        const query = `
            SELECT * FROM Gatepass 
            WHERE roll_no = ? 
              AND YEAR(date) = ? 
              AND MONTH(date) = ?
        `;

        const [rows] = await dbconnect.execute(query, [rollNo, year, month]);

      
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No gatepass entries found for the specified month and year' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching filtered gatepasses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/get-filtered-outpasses/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required' });
    }

    try {
    
        const query = `
            SELECT * FROM Outpass 
            WHERE roll_no = ? 
              AND YEAR(date) = ? 
              AND MONTH(date) = ?
        `;

        const [rows] = await dbconnect.execute(query, [rollNo, year, month]);

      
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No outpass entries found for the specified month and year' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching filtered outpasses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Endpoint to save report time and schedule the cron job
app.post('/save-report-time', (req, res) => {
    const { time } = req.body; // Example: "10:00"

    // Convert time to a valid cron expression
    const cronExpression = timeToCron(time);

    // Schedule the report
    scheduleReportTime(cronExpression);

    res.send({ message: 'Report time saved successfully' });
});

//checkin
// Endpoint to check-in using roll number and update check-in time
const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

app.patch('/checkin/:roll_no', async (req, res) => {
    const { roll_no } = req.params;

    try {
        // Check if there's a pending checkout record for the student (roll_no)
        const checkQuery = `
            SELECT * FROM Gatepass 
            WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
        `;
        const [gatepassData] = await dbconnect.execute(checkQuery, [roll_no]);

        if (gatepassData.length === 0) {
            return res.status(404).send('No pending checkout record found');
        }

        // Update check-in time for the latest checkout record
        const currentDateTime = new Date();
        const formattedDateTime = formatDateTime(currentDateTime);  // Format the inTime before updating

        const updateQuery = `
            UPDATE Gatepass
            SET inTime = ?
            WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
        `;
        await dbconnect.execute(updateQuery, [formattedDateTime, roll_no]);
        const studentQuery = `
        SELECT sname,parentno FROM users WHERE studentId = ?
    `;
    const [studentData] = await dbconnect.execute(studentQuery, [roll_no]);

    if (studentData.length === 0) {
        return res.status(404).send('Student data not found');
    }

    // Send the student data along with success message
    const student = studentData[0];
    // console.log(`Parent Contact for student ${roll_no}: ${student.parentContact}`);
    
    res.status(200).json({
        parentno:student.parentno
    });
    } catch (dbError) {
        console.error('Database query failed:', dbError);
        res.status(500).send('Database query failed.');
    }
});

//checkin fingerprint

app.post('/run-jar-verify-checkin', async (req, res) => {
    // const jarPath = path.join(__dirname, '..', 'Verify.jar');
    const jarPath="Verify.jar";
    exec(`java -jar ${jarPath}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send(stderr);
        }

        console.log(`Output: ${stdout}`);
        const lines = stdout.split('\n');
        const id = lines[0].trim(); // Assuming the first line contains the studentId

        try {
            // Check if there's a pending checkout record for the student (roll_no)
            const checkQuery = `
                SELECT * FROM Gatepass 
                WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
            `;
            const [gatepassData] = await dbconnect.execute(checkQuery, [id]);
    
            if (gatepassData.length === 0) {
                return res.status(404).send('No pending checkout record found');
            }
    
            // Update check-in time for the latest checkout record
            const currentDateTime = new Date();
            const updateQuery = `
                UPDATE Gatepass
                SET inTime = ?
                WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
            `;
            await dbconnect.execute(updateQuery, [currentDateTime, id]);
            const studentQuery = `
            SELECT sname,parentno FROM users WHERE studentId = ?
        `;
        const [studentData] = await dbconnect.execute(studentQuery, [id]);

        if (studentData.length === 0) {
            return res.status(404).send('Student data not found');
        }

        const student = studentData[0];
        // console.log(`Parent Contact for student ${id}: ${student.parentContact}`);

        // Send the success message and student data back to the frontend
        res.status(200).json({
            parentno:student.parentno
        });
            
            // res.status(200).send({ message: 'Check-in time for gatepass updated successfully!' });
        } catch (dbError) {
            console.error('Database query failed:', dbError);
            res.status(500).send('Database query failed.');
        }
    });
});
//outpass
app.post('/run-jar-verify-checkin-out', async (req, res) => {
    // const jarPath = path.join(__dirname, '..', 'Verify.jar');
    const jarPath="Verify.jar";
    exec(`java -jar ${jarPath}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send(stderr);
        }

        console.log(`Output: ${stdout}`);
        const lines = stdout.split('\n');
        const id = lines[0].trim(); // Assuming the first line contains the studentId

        try {
            // Check if there's a pending checkout record for the student (roll_no)
            const checkQuery = `
                SELECT * FROM Outpass 
                WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
            `;
            const [gatepassData] = await dbconnect.execute(checkQuery, [id]);
    
            if (gatepassData.length === 0) {
                return res.status(404).send('No pending checkout record found');
            }
    
            // Update check-in time for the latest checkout record
            const currentDateTime = new Date();
            const updateQuery = `
                UPDATE Outpass
                SET inTime = ?
                WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
            `;
            await dbconnect.execute(updateQuery, [currentDateTime, id]);
            const studentQuery = `
            SELECT sname,parentno FROM users WHERE studentId = ?
        `;
        const [studentData] = await dbconnect.execute(studentQuery, [id]);

        if (studentData.length === 0) {
            return res.status(404).send('Student data not found');
        }

        const student = studentData[0];
        // console.log(`Parent Contact for student ${id}: ${student.parentContact}`);

        // Send the success message and student data back to the frontend
        res.status(200).json({
            parentno:student.parentno
        });
            
        } catch (dbError) {
            console.error('Database query failed:', dbError);
            res.status(500).send('Database query failed.');
        }
    });
});

app.patch('/checkin-out/:roll_no', async (req, res) => {
    const { roll_no } = req.params;

    try {
        // Check if there's a pending checkout record for the student (roll_no)
        const checkQuery = `
            SELECT * FROM Outpass 
            WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
        `;
        const [gatepassData] = await dbconnect.execute(checkQuery, [roll_no]);

        if (gatepassData.length === 0) {
            return res.status(404).send('No pending checkout record found');
        }

        // Update check-in time for the latest checkout record
        const currentDateTime = new Date();
        const formattedDateTime = formatDateTime(currentDateTime);  // Format the inTime before updating

        const updateQuery = `
            UPDATE Outpass
            SET inTime = ?
            WHERE roll_no = ? AND outTime IS NOT NULL AND inTime IS NULL
        `;
        await dbconnect.execute(updateQuery, [formattedDateTime, roll_no]);
        const studentQuery = `
        SELECT sname,parentno FROM users WHERE studentId = ?
    `;
    const [studentData] = await dbconnect.execute(studentQuery, [roll_no]);

    if (studentData.length === 0) {
        return res.status(404).send('Student data not found');
    }

    // Send the student data along with success message
    const student = studentData[0];
    // console.log(`Parent Contact for student ${roll_no}: ${student.parentContact}`);
    
    res.status(200).json({
        parentno:student.parentno
    });
        
    } catch (dbError) {
        console.error('Database query failed:', dbError);
        res.status(500).send('Database query failed.');
    }
});

//Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Default credentials
    const defaultUsername = 'admin';
    const df2='guard';
    const defaultPassword = 'admin';

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check for default credentials
    if (( username === defaultUsername   ) && password === defaultPassword) {
        const token = jwt.sign(
            { username: defaultUsername },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.json({ message: 'Login successful', token });
    }
    if ( username === df2   && password === defaultPassword) {
        const token = jwt.sign(
            { username: df2 },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.json({ message: 'Login successful', token });
    }
   

    // If the username and password do not match the default, return 401
    return res.status(401).json({ message: 'Invalid username or password' });
});


// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'Access denied, token missing!' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Protected route (example)
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'You have access to this protected route', user: req.user });
});


app.post('/verify-token', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Token is valid' ,username: req.user.username});
});


app.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: 'Logout successful' });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
