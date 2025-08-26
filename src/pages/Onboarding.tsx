import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../api/authService';
import { useAppDispatch } from '../store/hooks';
import { setAuthenticated } from '../store/slices/authSlice';
import type { CreateUserData } from '../api/userApi';

const school_options = [
  {
    school_name: "University of Kentucky",
    school_url_key: 'https://uk.instructure.com/api/v1',
    school_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Kentucky_Wildcats_logo.svg/1200px-Kentucky_Wildcats_logo.svg.png'
  },
  {
    school_name: "State College",
    school_url_key: 'https://statecollege.instructure.com/api/v1',
    school_image: 'https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_2/v1718801487/scasdorg/ly3gtlomrnd26doittoj/Slogo.png'
  },
  {
    school_name: "Stanford",
    school_url_key: 'https://stanford.instructure.com/api/v1',
    school_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/1200px-Stanford_Cardinal_logo.svg.png'
  }
];

function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    email: '',
    canvasApiKey: '',
    school: '', // This will store the school_url_key
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get selected school object
  const selectedSchool = school_options.find(school => school.school_url_key === formData.school);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare user data for API
      const userData: CreateUserData = {
        email: formData.email,
        canvasApiKey: formData.canvasApiKey,
        school: formData.school,
        fullName: formData.name,
        scheduleIds: [],
      };
      
      // Authenticate user (create or login)
      const authResult = await authenticateUser(userData);
      
      if (authResult.success && authResult.user) {
        console.log(authResult.isNewUser ? 'New user created!' : 'Existing user logged in!');
        
        // Update Redux state
        dispatch(setAuthenticated({ 
          user: authResult.user, 
          isNewUser: authResult.isNewUser || false 
        }));
        
        navigate('/main');
      } else {
        setError(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600 mb-4">
            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to DueMate</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect your Canvas account to manage your assignments
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email" 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="canvasApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Canvas API Key
              </label>
              <input 
                id="canvasApiKey"
                type="password" 
                name="canvasApiKey"
                value={formData.canvasApiKey}
                onChange={handleChange}
                placeholder="Enter your Canvas API Key" 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can find this in your Canvas account settings
              </p>
            </div>
            
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {selectedSchool ? (
                      <>
                        <img 
                          src={selectedSchool.school_image} 
                          alt={selectedSchool.school_name}
                          className="w-6 h-6 mr-3 object-contain"
                        />
                        <span>{selectedSchool.school_name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Select your school</span>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {school_options.map(school => (
                      <button
                        key={school.school_url_key}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, school: school.school_url_key }));
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center"
                      >
                        <img 
                          src={school.school_image} 
                          alt={school.school_name}
                          className="w-6 h-6 mr-3 object-contain"
                        />
                        <span>{school.school_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input 
                id="name"
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name" 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </div>
              ) : (
                'Get Started'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
