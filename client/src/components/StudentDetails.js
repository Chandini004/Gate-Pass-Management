import React, { useState } from 'react';
import './styles/StudentDetails.css';
import { Link } from 'react-router-dom';

function StudentDetails() {
    const [rollNo, setRollNo] = useState('');

    return (
        <div className="form-container">
            <div className="form-grid1">
                <label htmlFor="rollNo" className='text-center text-xl font-bold text-gray-700'>Enter Register ID:</label>
                <input
                    type="text"
                    id="rollNo"
                    placeholder="Enter Roll No"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="input-field"
                />
                {!rollNo && (
                    <p className="error-message">Please enter a roll number to view details.</p>
                )}
                <Link 
                    to={rollNo ? `/studentprofile/${rollNo}` : '#'}
                    className={`get-details-btn ${rollNo ? 'enabled' : 'disabled'}`}
                    style={{ marginTop: '1rem' }}
                    onClick={(e) => {
                        if (!rollNo) e.preventDefault();
                    }}
                >
                    Get Details
                </Link>
            </div>
        </div>
    );
}

export default StudentDetails;
