// Test file to demonstrate the progress indicator functionality
import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAssignmentDetails } from '../store/slices/assignmentsSlice';
import { selectAssignmentLoadingStates } from '../store/selectors';

// Mock assignments for testing progress
const mockAssignments = [
  { id: '1', name: 'Assignment 1', description: 'Test 1', due_at: '2024-12-31', course_id: '100', points_possible: 10, html_url: 'http://test1.com', submission_types: ['online'], workflow_state: 'published' },
  { id: '2', name: 'Assignment 2', description: 'Test 2', due_at: '2024-12-31', course_id: '101', points_possible: 20, html_url: 'http://test2.com', submission_types: ['online'], workflow_state: 'published' },
  { id: '3', name: 'Assignment 3', description: 'Test 3', due_at: '2024-12-31', course_id: '102', points_possible: 30, html_url: 'http://test3.com', submission_types: ['online'], workflow_state: 'published' },
  { id: '4', name: 'Assignment 4', description: 'Test 4', due_at: '2024-12-31', course_id: '103', points_possible: 40, html_url: 'http://test4.com', submission_types: ['online'], workflow_state: 'published' },
  { id: '5', name: 'Assignment 5', description: 'Test 5', due_at: '2024-12-31', course_id: '104', points_possible: 50, html_url: 'http://test5.com', submission_types: ['online'], workflow_state: 'published' },
];

// Component to test progress functionality
export const ProgressTestComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const loadingStates = useAppSelector(selectAssignmentLoadingStates);

  const testProgressFunctionality = async () => {
    console.log('Testing progress functionality...');
    
    // This would normally use real API credentials
    // For demonstration purposes only
    const mockApiData = {
      apiKey: 'test-key',
      baseUrl: 'https://test.instructure.com',
      assignments: mockAssignments,
    };

    try {
      await dispatch(fetchAssignmentDetails(mockApiData));
      console.log('Progress test completed!');
    } catch (error) {
      console.log('Progress test failed (expected with mock data):', error);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Progress Indicator Test</h3>
      
      <div className="mb-4">
        <p><strong>Loading Assignments:</strong> {loadingStates.isLoadingAssignments ? 'Yes' : 'No'}</p>
        <p><strong>Loading Details:</strong> {loadingStates.isLoadingDetails ? 'Yes' : 'No'}</p>
        <p><strong>Details Progress:</strong> {loadingStates.detailsProgress.current}/{loadingStates.detailsProgress.total}</p>
        <p><strong>Details Fetched:</strong> {loadingStates.hasDetailsFetched ? 'Yes' : 'No'}</p>
      </div>

      <button
        onClick={testProgressFunctionality}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        disabled={loadingStates.isLoadingDetails}
      >
        {loadingStates.isLoadingDetails ? 'Testing Progress...' : 'Test Progress Indicator'}
      </button>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Note: This test uses mock data and will demonstrate the progress indicator UI.</p>
        <p>The actual API calls will fail with mock credentials, but the progress UI will work.</p>
      </div>
    </div>
  );
};

export default ProgressTestComponent;
