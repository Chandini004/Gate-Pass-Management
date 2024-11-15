import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import { FaUser } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash.debounce';
const AllPasses= () => {
  
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [id, setId] = useState('');
    const [blockName, setBlockName] = useState('all');
    const [gender,setGender]=useState('all');
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    
    const handleFilter = () => {
        // If fromDate or toDate is not selected, set them to current date
       if(id){
        fetchId();
       }
       else{
        fetchData();
       }
      
    };
 const fetchId = async()=>{

 }
 useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3300/all-passes');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching gatepass data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);
 const fetchStudentsById = async (searchId) => {
    if (searchId) {
        try {
            const response = await axios.get('http://localhost:3300/passes-filtered-by-id', {
                params: { id: searchId || ''}
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students by ID:', error);
        }
    } else {
        setStudents([]); // Clear results if input is empty
    }
};
const fetchDataAll = async () => {
    try {
        const response = await axios.get('http://localhost:3300/all-passes');
        setStudents(response.data);
    } catch (error) {
        console.error('Error fetching gatepass data:', error);
    } finally {
        setLoading(false);
    }
};
const handleInputChange = (e) => {
    const searchId = e.target.value;
    setId(searchId);

    if (searchId) {
        fetchStudentsById(searchId); // Fetch students by ID if search ID is not empty
    } else {
        fetchDataAll(); // Fetch all students if search ID is cleared
    }
};


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3300/passes-filtered', {
                params: { gender, blockName} 
            });
            setStudents(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching gatepass data:', error);
        } finally {
            setLoading(false);
        }
    };

   

    

   
   
    

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = students.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(students.length / rowsPerPage);
     if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner border-t-4 border-gray-800 rounded-full w-16 h-16 animate-spin"></div>
      </div>
    );

  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md text-center">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

    return (
        <div>
            <h1 className="text-center font-bold text-gray-800 mb-4 mt-4">Student Details</h1>
            <div className="flex justify-center mb-4 ml-56 mr-56">
            <input
                type="text"
                    value={id}
                    style={{width:"150px"}}
                    onChange={handleInputChange}
                    className=" mr-2"
                   
                    placeholder='Registration Number'
                />
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className=" mr-2 border border-gray-300 rounded text-center "
                    style={{width:"150px"}}
                >
                    <option value="all"><span className='text-gray-300'>-Gender-</span></option>

                    <option value="Female">Girls</option>
                    <option value="Male">Boys</option>
                  
                </select>
                <select
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    className=" mr-2 border border-gray-300 rounded text-center"
                    style={{width:"150px"}}
                >
                    <option value="all"><span className='opt text-gray-300'>-Block-</span></option>
                    <option value="Satpura" className='opt '>SATPURA</option>
    <option value="Himalaya" className='opt'>HIMALAYA</option>
    <option value="Aravali" className='opt'>ARAVALI</option>
    <option value="Nilagiri" className='opt'>NILAGIRI</option>
    <option value="Vindhya" className='opt'>VINDHYA</option>
    <option value="Vamsadhara" className='opt'>VAMSADHARA</option>
    <option value="Nagavali" className='opt'>NAGAVALI</option>
                  
                </select>
                <button
                    className="bg-gray-800 text-white font-bold mr-2 py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200"
                    onClick={handleFilter}
                >
                    Filter
                </button>
               
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className='bg-white text-gray bg-opacity-5 text-center'>
                    <thead >
                        <tr >
                            <th className='text-center'>Name</th>
                            <th className='text-center'>Roll No</th>
                            <th className='text-center'>Year</th>
                            <th className='text-center'>Branch</th>
                            <th className='text-center'>Hostel Block Name</th>
                            <th className="text-center">Gatepasses Issued</th>
                            <th className="text-center">Outpasses Issued</th>
                            <th className='text-center'>View</th>
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
                               
                                <td>{row.gatepassCount}</td>
                                <td>{row.outpassCount}</td>
                                <td className="text-center">
        <Link to={`/studentProfile/${row.studentId}`} className="flex justify-center items-center text-gray-500">
           View<FaUser className="ml-1 w-4 h-3" />
        </Link>
      </td>
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
           
          
        </div>
    );
}


export default AllPasses;