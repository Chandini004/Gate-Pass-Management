import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css';
import { FaCaretDown , FaArrowRight } from 'react-icons/fa';
import { useSnackbar } from 'notistack';

const Navbar = ({ username }) => {
  const navigate = useNavigate();
  const {enqueueSnackbar} =useSnackbar();

  const handleDashboardClick = () => {
    navigate('/dashboard'); 
    window.location.reload(); 
  };


  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3300/logout', {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies)
      });

      if (response.ok) {
        enqueueSnackbar('Logout successful', { 
          variant: 'success', 
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          autoHideDuration: 3000 
        });
        navigate('/login'); // Redirect to login page
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      enqueueSnackbar('Error during logout', { 
        variant: 'error', 
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        autoHideDuration: 3000 
      });
      console.error('Error during logout:', error);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <ul className="flex justify-center space-x-10 text-lg font-semibold font-sans relative">
          {/* If the user is admin, show the Registration menu */}
          {username === 'admin' && (
            <li className="dropdown">
              <Link to="/registration/singleUser">
                <span className='flex items-center'>Registration<FaCaretDown className="ml-1" /></span>
              </Link>
              <div className="dropdown-content">
                <Link to="/registration/singleUser" style={{ fontSize: '13px'}}>Add User</Link>
                <Link to="/registration/updateUser" style={{ fontSize: '13px' }}>Update User</Link>
                <Link to="/registration/addFingerprint" style={{ fontSize: '13px' }}>Add Fingerprint</Link>
                <Link to="/registration/updateFingerprint" style={{ fontSize: '13px' }}>Update Fingerprint</Link>
                <Link to="/registration/moreUsers" style={{ fontSize: '13px' }}>Add More Users</Link>
                <Link to="/registration/moreImages" style={{ fontSize: '13px' }}>Student Images</Link>
              </div>
            </li>

            


          )}
           {username === 'admin' && (
            <li className="dropdown">
              <Link to="/dashboard" onClick={handleDashboardClick}>
                <span className='flex items-center'>Dashboard</span>
              </Link>
              
            </li>

            


          )}
  {/* admin checkout */}
{username === 'admin' && (
<li className="dropdown">
            <Link to="/AdminPass">
              <span className='flex items-center'>CheckOut<FaCaretDown className="ml-1" /></span>
            </Link>
            <div className="dropdown-content">
              <Link to="/AdminPass" style={{ fontSize: '13px' }}>PinkPass</Link>
              <Link to="/Adminoutpass" style={{ fontSize: '13px' }}>OutPass</Link>
            </div>
          </li>
 )}
 {username === 'guard' && (
          <li className="dropdown">
            <Link to="/Pass">
              <span className='flex items-center'>CheckOut<FaCaretDown className="ml-1" /></span>
            </Link>
            <div className="dropdown-content">
              <Link to="/Pass" style={{ fontSize: '13px' }}>PinkPass</Link>
              <Link to="/outpass" style={{ fontSize: '13px' }}>OutPass</Link>
            </div>
          </li>
 )}
          <li className="dropdown">
            <Link to="/Checkingate">
              <span className='flex items-center'>CheckIn<FaCaretDown className="ml-1" /></span>
            </Link>
            <div className="dropdown-content">
              <Link to="/checkingate" style={{ fontSize: '13px' }}>Pinkpass</Link>
              <Link to="/checkinout" style={{ fontSize: '13px' }}>Outpass</Link>
            </div>
          </li>

          <li><Link to="/reports">Reports</Link></li>
          <li><Link to="/student-details">Student Details</Link></li>

          {/* Logout Button */}
          <li className="logout-button">
            <button onClick={handleLogout} className="logout-btn"><span className='flex items-center justify-center'>Logout<FaArrowRight className="ml-1" /></span></button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;