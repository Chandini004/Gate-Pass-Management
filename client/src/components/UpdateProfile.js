import React, { useState,useEffect } from 'react';
import axios from 'axios';
import './styles/Registration.css';
import { useParams, useNavigate } from 'react-router-dom';
const UpdateProfile = () => {
    const { rollNo } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        roll_no: '',
       
        year: '',
        branch: '',
        hostel_block_name: '',
        room_no: '',
        parent_no: '',
        gender:''
    });
    const [userData, setUserData] = useState(null);
    const [errors, setErrors] = useState({});
  
    const validateForm = () => {
        const newErrors = {};
        const phoneRegex = /^[0-9]{10}$/; // Regex for a 10-digit phone number

        // Validate year
        if (!Number.isInteger(Number(formData.year))) {
            newErrors.year = 'Year must be an integer';
        }

        // Validate room number
        if (!Number.isInteger(Number(formData.room_no))) {
            newErrors.room_no = 'Room number must be an integer';
        }

        // Validate parent phone number
        if (!phoneRegex.test(formData.parent_no)) {
            newErrors.parent_no = 'Parent number must be a valid 10-digit phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };
    useEffect(() => {
    const handleVerifyRollNo = async () => {
        try {
          const response = await axios.get(`http://localhost:3300/verify-rollupdate/${rollNo}`);
          if (response.data.length > 0) {
            const user = response.data[0];
            setUserData(user);
            setFormData({
              name: user.sname,
              roll_no: user.studentId,
              gender:user.gender,
              year: user.syear,
              branch: user.branch,
              hostel_block_name: user.hostelblock,
              room_no: user.roomno,
              parent_no: user.parentno
            });
          } else {
            alert("No user found with that roll number.");
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          alert('Failed to verify roll number.');
        }
      };
      handleVerifyRollNo();
    }, [rollNo]);
      const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
          alert('Please correct the errors in the form.');
          return;
        }
    
        try {
          const response = await axios.put(`http://localhost:3300/update-user`, formData);
          alert(response.data.message);
          setUserData(null); // Clear user data after updating
          setFormData({ // Reset form data
            name: '',
            roll_no: '',
            year: '',
            branch: '',
            hostel_block_name: '',
            room_no: '',
            parent_no: '',
            gender:''
          });
          navigate(-1);
        } catch (error) {
          console.error('Error updating user:', error);
          alert('Update failed. Please try again.');
        }
      };
    
  return (
    <div className="registration-container">
          
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Profile</h2>

   



<div>
       

  {userData && (
    <form className="max-w-md mx-auto mt-4" onSubmit={handleUpdateUser}>
      <div className="relative z-0 w-full mb-5 group">
<input
type="text"
name="name"
value={formData.name}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
placeholder=" "
required
/>
<label
htmlFor="name"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Name
</label>
</div>

<div className="relative z-0 w-full mb-5 group">
<input
type="text"
name="roll_no"
value={formData.roll_no}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
placeholder=" "
required
/>
<label
htmlFor="roll_no"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Roll No
</label>
</div>
<div className="relative z-0 w-full mb-5 group">
<select
name="gender"
value={formData.gender}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
required
>
<option value="" disabled hidden></option>
<option value="1" className='opt'>Male</option>
<option value="2" className='opt'>Female</option>
<option value="3" className='opt'>Others</option>
</select>
<label
htmlFor="gender"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Gender
</label>
</div>
<div className="relative z-0 w-full mb-5 group">
<select
name="year"
value={formData.year}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
required
>
<option value="" disabled hidden></option>
<option value="1" className='opt'>1st Year</option>
<option value="2" className='opt'>2nd Year</option>
<option value="3" className='opt'>3rd Year</option>
<option value="4" className='opt'>4th Year</option>

</select>
<label
htmlFor="year"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Year
</label>
</div>

<div className="relative z-0 w-full mb-5 group">
<select
name="branch"
value={formData.branch}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
required
>
<option value="" disabled hidden></option>
<option value="CSE" className='opt'>CSE</option>
<option value="ECE" className='opt'>ECE</option>
<option value="IT" className='opt'>IT</option>
<option value="MECH" className='opt'>MECH</option>
<option value="CIVIL" className='opt'>CIVIL</option>
<option value="CHEM" className='opt'>CHEM</option>
<option value="EEE" className='opt'>EEE</option>
</select>
<label
htmlFor="branch"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Branch
</label>
</div>

<div className="relative z-0 w-full mb-5 group">
<select
name="hostel_block_name"
value={formData.hostel_block_name}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
required
>
<option value="" disabled hidden></option>
<option value="Satpura" className='opt ml-5'>SATPURA</option>
<option value="Himalaya" className='opt'>HIMALAYA</option>
<option value="Aravali" className='opt'>ARAVALI</option>
<option value="Nilagiri" className='opt'>NILAGIRI</option>
<option value="Vindhya" className='opt'>VINDHYA</option>
<option value="Vamsadhara" className='opt'>VAMSADHARA</option>
<option value="Nagavali" className='opt'>NAGAVALI</option>
</select>
<label
htmlFor="hostel_block_name"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Hostel Block Name
</label>
</div>


<div className="relative z-0 w-full mb-5 group">
<input
type="number"
name="room_no"
value={formData.room_no}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
placeholder=" "
required
/>
<label
htmlFor="room_no"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Room No
</label>
</div>

<div className="relative z-0 w-full mb-5 group">
<input
type="text"
name="parent_no"
value={formData.parent_no}
onChange={handleChange}
className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
placeholder=" "
required
/>
<label
htmlFor="parent_no"
className="peer-focus:font-medium absolute text-sm text-gray-800 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
>
Parent No
</label>
{errors.parent_no && <p className="text-red-600 text-xs italic">{errors.parent_no}</p>} {/* Display error message */}
{/* {errors.parent_no && <p className="error-message">{errors.parent_no}</p>} */}
</div>
      

      <button type="submit" className="bg-gray-800 text-white font-semibold py-2 px-4 rounded w-24 mx-auto block hover:bg-gray-700 transition duration-200">Update</button>
    </form>
  )}
</div>

</div>



  )
}

export default UpdateProfile