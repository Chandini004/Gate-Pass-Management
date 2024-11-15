<div className="max-w-6xl mx-auto p-6">
        <div className="flex space-x-8">
          {/* Left Profile Information */}
          <div className="flex justify-center bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen mt-2">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
      <Link to="/" className='text-left mt-3'>
        <svg class="w-6 h-6 text-blue-800 dark:text-white  ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
</svg>
</Link>
        <div className="flex flex-col items-center p-6 space-y-4">
          
          {/* Profile Image */}
          <div className="bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full w-32 h-32 flex items-center justify-center shadow-md">
            
            <img
              src={studentData.imageUrl} 
              alt="Profile"
              className="rounded-full border-4 border-white w-full h-full object-cover"
            />
          </div>

          {/* Name and Username */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold text-gray-800">{studentData ? studentData.sname : 'Loading...'}</h2>
            <p className="text-sm text-gray-500">@{studentData ? studentData.studentId : 'loading'}</p>
          </div>

         


        </div>

        {/* Personal Information */}
        <div className="bg-gray-100 p-6 rounded-b-lg">
          <h3 className="flex gap-4 text-lg font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Personal Information
            {/* Edit Icon */}
            <Link to="/user/profile/edit">
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
          

          <ul className="mt-4 space-y-2 text-gray-700">
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

            {/* Experience Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
  <h3 className="text-xl font-semibold text-blue-700">Experience</h3>
  <p>
   hghkkkkkkkkkkkkkkkkk
   ggggggggggggggg
   hhhhhhhhhh
   h
  </p>
  <div className="flex flex-wrap gap-4">
    
    
  </div>
  
  
</div>



          </div>
        </div>
      </div>