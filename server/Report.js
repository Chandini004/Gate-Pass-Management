import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import dbconnect from './database.js';
import cron from 'node-cron';

// Get the directory name (equivalent to __dirname in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let reportJob;

// Function to fetch data, create Excel report, and send it via email
export async function fetchAndEmailData(fromDate, toDate,filterType) {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const timeString = now.toISOString().split('T')[1].replace(/:/g, '-').split('.')[0]; // Format: HH-MM-SS

    // Folder path to save Excel files
    const folderPath = path.join(__dirname, './Daily_report'); // Adjust the path as needed

    // Check if the folder exists, create if it doesn't
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    let query;
    let params = [fromDate, toDate,fromDate,toDate];

    if (filterType === 'gatepass') {
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
       
    } else if (filterType=== 'outpass') {
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
       
    } else if (filterType === 'all') {
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
        params.push(fromDate, toDate,fromDate,toDate); // Add params for second query in the UNION
    } else {
        console.log("Invalid report type.");
        return;
    }

    // Query to fetch data
    const [rows] = await dbconnect.execute(query, params);

    if (rows.length > 0) {
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
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Fine', key: 'fine', width: 10 },
        ];

        // Add rows
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
                date: row.date,
                fine: row.fine,
            });
        });

        // Save Excel file in the specified folder with current date and time in the filename
        const fileName = path.join(folderPath, `${dateString}_${timeString}.xlsx`);
        await workbook.xlsx.writeFile(fileName);

        // Send email
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // For SSL
            secure: true, 
            service: 'gmail', // Or any email service you are using
            auth: {
                user: 'balakrishnamudila1230@gmail.com',
                pass: 'imaycqpcuamahcas' // Use environment variables for sensitive data
            }
        });

        let mailOptions = {
            from: 'accenture12days@gmail.com',
            to: 'lavetichandini123@gmail.com',
            subject: 'Daily Gatepass Data',
            text: 'Please find attached the daily gatepass data.',
            attachments: [
                {
                    path: fileName // Send the generated file with date and time
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } else {
        console.log("No data available for today's date.");
    }

    // Close the database connection
    // await dbconnect.end();
}

// Function to save the report time and schedule the cron job
export function scheduleReportTime(time) {
    // If a previous job exists, stop it
    if (reportJob) {
        reportJob.stop();
    }

    // Schedule a new cron job
    reportJob = cron.schedule(time, () => {
        console.log(`Running scheduled report at ${time}`);
        fetchAndEmailData(null,null,null);
    });

    console.log(`Report scheduled at ${time}`);
}
