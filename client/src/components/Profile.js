import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './styles/Profile.css';

const Profile = () => {
  const { rollNo } = useParams(); // Get studentId from the URL
  const [loading, setLoading] = useState(true);
 
 
  const [studentData, setStudentData] = useState(null);
  const [passes, setPasses] = useState([]);
  const [filteredoutData, setFilteredOutData] = useState([]);

  const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all'); // State for dropdown

  const [currentPage, setCurrentPage] = useState(1);
  const [outcurrentPage, setOutCurrentPage] = useState(1);

  const itemsPerPage = 5;
 
  useEffect(() => {
    const fetchStudentDetails = async () => {
      setLoading(true);
        try {
            const response = await fetch(`http://localhost:3300/get-student-details-profile/${rollNo}`);
            if (!response.ok) {
                throw new Error('User not found');
            }
            const data = await response.json();
            setStudentData(data);
            setError(''); // Clear any previous errors

            // Combine gatepasses and outpasses into a single passes array
            setPasses(data.passes); 
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setStudentData(null); // Reset student data on error
        }
    };

    fetchStudentDetails();
}, [rollNo]);

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner border-t-4 border-gray-800 rounded-full w-16 h-16 animate-spin"></div>
      </div>
    );

  }

  const fetchData = async (from, to) => {
    setLoading(true);
    try {
        const response = await axios.get(`http://localhost:3300/current-passes-filtered/${rollNo}`, {
            params: { from, to, type: filterType } 
        });
        setPasses(response.data);
        setCurrentPage(1);
    } catch (error) {
        console.error('Error fetching pass data:', error);
    } finally {
        setLoading(false);
    }
};

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


  return (
    <div className="max-w-6xl mx-auto p-6">
    <div className="flex space-x-8">
      {/* Left Profile Information */}
      <div className="flex justify-center bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen mt-2">
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
  <Link to="/getStudents" className='text-left mt-3'>
    <svg class="w-6 h-6 text-gray-800 dark:text-white  ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
</svg>
</Link>
    <div className="flex flex-col items-center p-6 space-y-4">
      
      {/* Profile Image */}
      <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-full w-32 h-32 flex items-center justify-center shadow-md">
        
        <img
          src={studentData.imageUrl} 
          alt=""
          className="rounded-full border-4 border-white w-full h-full object-cover"
        />
      </div>

      {/* Name and Username */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold text-gray-800">{studentData ? studentData.sname : 'Loading...'}</h2>
        <p className="text-sm font-bold text-gray-500">{studentData ? studentData.studentId : 'loading'}</p>
      </div>

     


    </div>

    {/* Personal Information */}
    <div className="bg-gray-100 p-6  rounded-b-lg">
      <h3 className="flex gap-4 text-lg font-semibold   border-b border-blue-200 pb-2">
      <span style={{marginLeft:"60px"}} className='text-gray-900'>Details</span>
        {/* Edit Icon */}
        <Link to={rollNo ? `/updateprofile/${rollNo}` : '#'}>
        <svg 
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          
        >
          <path
            stroke="currentColor"
            strokeLinecap="square"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z"
          />
        </svg>
        </Link>
      </h3>
      

      <ul className="mt-4 space-y-2 text-gray-500">
        <li><span className="font-semibold">Branch:</span> {studentData ? studentData.branch : 'Loading...'}</li>
        <li><span className="font-semibold">Year:</span> {studentData ? studentData.syear : 'Loading...'}</li>
        <li><span className="font-semibold">Block:</span> {studentData ? studentData.hostelblock : 'Loading...'}</li>
        <li><span className="font-semibold">Room No:</span> {studentData ? studentData.roomno: 'Loading...'}</li>
        <li><span className="font-semibold">Parent Mobile No:</span> {studentData ? studentData.parentno : 'Loading...'}</li>
      </ul>
      
    </div>
  </div>
</div>


      {/* Right Content Area */}
      <div className="w-3/4 space-y-8 mt-2">

      
        <div className="bg-white p-6 rounded-lg shadow-lg">
<h3 className="text-xl font-bold text-center text-Gray-700 mb-4">Passes</h3>
<div className="flex justify-center ">
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
                    className="mr-2 px-5 border border-gray-300 rounded text-center"
                >
                    <option value="all">All</option>
                    <option value="gatepass">Gatepass</option>
                    <option value="outpass">Outpass</option>
                </select>
                <button
                    className="bg-gray-800 text-white font-bold mr-2 py-2 px-8 rounded shadow-md hover:bg-gray-600 transition duration-200"
                    onClick={handleFilter}
                >
                    Filter
                </button>
               
            </div>

            <table className="w-full border border-gray-200">
  <thead>
    <tr className="bg-gray-200">
      <th className="p-2 border-b">Date</th>
      <th className="p-2 border-b">Out Time</th>
      <th className="p-2 border-b">In Time</th>
      <th className="p-2 border-b">Type</th>
    </tr>
  </thead>
  <tbody>
    {passes.map((pass, index) => {
      const date = new Date(pass.outTime);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      return (
        <tr key={index} className="text-center">
          <td className="p-2 border-b">{formattedDate}</td>
          <td className="p-2 border-b">{pass.outTime}</td>
          <td className="p-2 border-b">{pass.inTime}</td>
          <td className="p-2 border-b">{pass.type}</td>
        </tr>
      );
    })}
  </tbody>
</table>

          

</div>



      </div>
    </div>
  </div>
  );
};

export default Profile;
