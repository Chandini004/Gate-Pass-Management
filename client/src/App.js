import React,{useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Pass from './components/Pass';
import AdminPass from './components/AdminPass';

import Registration from './components/Registration';
import Reports from './components/Reports';
import StudentDetails from './components/StudentDetails';
import Checkingate from './components/Checkingate';
import Outpass from './components/Outpass';
import Checkinout from './components/Checkinout';
import Dashboard from './components/Dashboard';
import PrivateRoute from './PrivateRoute';
import Login from './components/Login';
import Home from './components/Home';
import { FaUserCircle } from 'react-icons/fa';
import './App.css';  // Import the App styles
import AdminOutpass from './components/AdminOutpass';
import AllStudents from './components/AllStudents';
import Present from './components/Present';
import NotReturned from './components/NotReturned';
import AllPasses from './components/AllPasses';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import { SnackbarProvider } from 'notistack';

function App() {
  const [username, setUsername] = useState('');
  return (
    <Router><SnackbarProvider
      maxSnack={3}
        anchorOrigin={{
            vertical:'top',
            horizontal:'center'
        }}>
      <div>
        <Routes>
          {/* Public Route */}
          <Route path='/login' element={<Login />} />

          {/* Protected Routes */}
          <Route 
            path="/pass" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"Verdana, Geneva, Tahoma, sans-serif"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Pass />
                </div>
              </PrivateRoute>
            } 
          />
          

          <Route 
            path="/AdminPass" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"Verdana, Geneva, Tahoma, sans-serif"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <AdminPass />
                </div>
              </PrivateRoute>
            } 
          />
          

          <Route 
            path="/Adminoutpass" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <AdminOutpass />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/outpass" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Outpass />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold">Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                      
                    </div>
                  </div>
                  <Navbar username={username} />
                  <Home />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/registration/singleUser" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Registration type="singleUser" />
                </div>
              </PrivateRoute>
            } 
          />
           <Route 
            path="/dashboard" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Dashboard/>
                </div>
              </PrivateRoute>
            } 
          />
           <Route 
            path="/updateprofile/:rollNo" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <UpdateProfile/>
                </div>
              </PrivateRoute>
            } 
          />
           <Route 
            path="/getStudents" 
            element={
              <PrivateRoute setUsername={setUsername}>
                {/* <div className="fullscreen-bg"></div>  */}
                <div className="overlay1"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <AllStudents/>
                </div>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/present" 
            element={
              <PrivateRoute setUsername={setUsername}>
                {/* <div className="fullscreen-bg"></div>  */}
                <div className="overlay1"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Present/>
                </div>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/notpresent" 
            element={
              <PrivateRoute setUsername={setUsername}>
                {/* <div className="fullscreen-bg"></div>  */}
                <div className="overlay1"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <NotReturned/>
                </div>
              </PrivateRoute>
            } 
          />
<Route 
            path="/passes" 
            element={
              <PrivateRoute setUsername={setUsername}>
                {/* <div className="fullscreen-bg"></div>  */}
                <div className="overlay1"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <AllPasses/>
                </div>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/studentProfile/:rollNo" 
            element={
              <PrivateRoute setUsername={setUsername}>
                {/* <div className="fullscreen-bg"></div>  */}
                <div className="overlay1"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Profile/>
                </div>
              </PrivateRoute>
            } 
          />
<Route 
            path="/registration/updateUser" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Registration type="updateUser" />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/registration/addFingerprint" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Registration type="addFingerprint" />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/registration/updateFingerprint" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username} />
                  <Registration type="updateFingerprint" />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/registration/moreUsers" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Registration type="moreUsers" />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/registration/moreImages" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username} />
                  <Registration type="moreImages" />
                </div>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/checkingate" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Checkingate />
                </div>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/checkinout" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Checkinout />
                </div>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <PrivateRoute setUsername={setUsername}>
                {/* <div className="fullscreen-bg"></div>  */}
                <div className="overlay1"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <Reports />
                </div>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/student-details" 
            element={
              <PrivateRoute setUsername={setUsername}>
                <div className="fullscreen-bg"></div> 
                <div className="overlay"></div> 
                <div className="content">
                  <div className="header flex justify-between items-center p-4">
                    <h1 className="text-2xl font-bold" style={{fontFamily:"lucida"}}>Gate Pass Generation</h1>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{username}</span>
                      <FaUserCircle className="text-3xl" />
                    </div>
                  </div>
                  <Navbar username={username}/>
                  <StudentDetails />
                </div>
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </SnackbarProvider>
    </Router>
    
  );
}

export default App;
