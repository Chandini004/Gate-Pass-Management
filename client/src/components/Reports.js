import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Registration.css';

function Reports() {
    const [gatepassData, setGatepassData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportTime, setReportTime] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState('all'); // State for dropdown
    const rowsPerPage = 10;
    
    const handleFilter = () => {
        // If fromDate or toDate is not selected, set them to current date
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const selectedFromDate = fromDate || today;
        const selectedToDate = toDate || today;

        if (selectedFromDate && selectedToDate) {
            setFromDate(selectedFromDate);
            setToDate(selectedToDate);
            fetchData(selectedFromDate, selectedToDate);
        } else {
            alert("Please select both 'From' and 'To' dates.");
        }
    };

    const fetchData = async (from, to) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3300/current-gatepass-report-filtered', {
                params: { from, to, type: filterType } 
            });
            setGatepassData(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching gatepass data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3300/current-gatepass-report');
                setGatepassData(response.data);
            } catch (error) {
                console.error('Error fetching gatepass data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownload = async () => {
        try {
            const response = await axios.get('http://localhost:3300/download-current-gatepass-report', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'CurrentGatepassData.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    const handleSaveTime = async () => {
        try {
            await axios.post('http://localhost:3300/save-report-time', { time: reportTime });
            alert('Report time saved successfully!');
        } catch (error) {
            console.error('Error saving report time:', error);
        }
    };

    const handleSendReport = async () => {
        setLoading(true);
        try {
            // Prepare the data to send
            const reportData = {
                fromDate: fromDate || new Date().toISOString().split('T')[0], // Default to today if not set
                toDate: toDate || new Date().toISOString().split('T')[0],     // Default to today if not set
                filterType: filterType
            };
    
            // Make the POST request to send the report
            await axios.post('http://localhost:3300/send-report', reportData);
            alert('Report sent successfully!');
        } catch (error) {
            console.error('Error sending report:', error);
            alert('Failed to send report. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = gatepassData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(gatepassData.length / rowsPerPage);
    if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="spinner border-t-4 border-gray-800 rounded-full w-16 h-16 animate-spin"></div>
          </div>
        );
    
      }

    return (
        <div>
            <h1 className="text-center font-bold  text-gray-800 mb-4 mt-4">Current Report</h1>
            <div className="flex justify-center mb-4 ml-56 mr-56">
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="mr-2 text-center"
                />
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="mr-2 text-center"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="mr-2 border border-gray-300 rounded text-center"
                >
                    <option value="all">All</option>
                    <option value="gatepass">Gatepass</option>
                    <option value="outpass">Outpass</option>
                </select>
                <button
                    className="bg-gray-800 text-white font-bold mr-2 py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200"
                    onClick={handleFilter}
                >
                    Filter
                </button>
                <button
                    className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200 ml-2"
                    onClick={handleSendReport}
                >
                    <FontAwesomeIcon icon={faPaperPlane} /> Send Report
                </button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className=' text-gray-900 text-center '>
                    <thead>
                        <tr>
                            <th className='text-center'>Name</th>
                            <th className='text-center'>Roll No</th>
                            <th className='text-center'>Year</th>
                            <th className='text-center'>Branch</th>
                            <th className='text-center'>Hostel Block Name</th>
                            <th className='text-center'>Room No</th>
                            <th className='text-center'>Parent No</th>
                            <th className='text-center'>Out Time</th>
                            <th className='text-center'>In Time</th>
                            <th className='text-center'>Date</th>
                           
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row, index) => (
                            <tr key={index}>
                                <td>{row.sname}</td>
                                <td>{row.studentId}</td>
                                <td>{row.syear}</td>
                                <td>{row.branch}</td>
                                <td>{row.hostelblock}</td>
                                <td>{row.roomno}</td>
                                <td>{row.parentno}</td>
                                <td>{row.outTime}</td>
                                <td>{row.inTime}</td>
                                <td>{row.date}</td>
                               
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div className="flex justify-between mt-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className={`text-gray font-bold py-2 px-3 rounded shadow-md  transition duration-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <span className='text-gray'>Page {currentPage} of {totalPages}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className={`text-gray font-bold py-2 px-3 rounded shadow-md  transition duration-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            </div>
            <div className="flex items-center justify-between mt-4">
                <button className="bg-gray-900 text-white  ml-3 font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200" onClick={handleDownload}>
                    Download Current Report
                </button>
                <div className="flex items-center">
                    <input
                        type="time" 
                        value={reportTime}
                        onChange={(e) => setReportTime(e.target.value)}
                        className="mr-2 w-30 bg-transparent outline-none text-gray"
                    />
                    <button className="bg-gray-800 text-white font-bold py-2 px-4 mr-3 rounded shadow-md hover:bg-gray-600 transition duration-200" onClick={handleSaveTime}>
                        Save time to send report
                    </button>
                </div>
            </div>
            <br></br>
        </div>
    );
}

export default Reports;
