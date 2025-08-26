// Test the assignments API with term parameter
import { fetchAllAssignments } from '../api/assignmentService';

// Example test function to validate the API with term parameter
export const testAssignmentsAPIWithTerm = async () => {
  const testData = {
    apiKey: "1139~U6WBuPCryKDx9P2emeCAVCk8DmBuahHAmmXMfBF7C26Byr8WzuzxNTFXmVGXMvEL",
    baseUrl: "https://uk.instructure.com/api/v1",
    courseIds: ["2131024", "2145589", "2145620"],
    email: "student@university.edu",
    term: "2025 Fall"
  };

  console.log('Testing assignments API with term parameter:', testData);
  
  try {
    const result = await fetchAllAssignments(testData);
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ API call successful!');
      console.log('Number of assignments:', result.data?.length || 0);
      console.log('Sample assignment:', result.data?.[0]);
      console.log('Term used:', testData.term);
    } else {
      console.log('❌ API call failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error testing API:', error);
    throw error;
  }
};

// Example of the exact curl command this would generate:
export const getCurlCommand = () => {
  const command = `curl -X POST http://localhost:3000/api/assignments/db -H "Content-Type: application/json" -d "{\\"apiKey\\":\\"1139~U6WBuPCryKDx9P2emeCAVCk8DmBuahHAmmXMfBF7C26Byr8WzuzxNTFXmVGXMvEL\\",\\"baseUrl\\":\\"https://uk.instructure.com/api/v1\\",\\"courseIds\\":[\\"2131024\\",\\"2145589\\",\\"2145620\\"],\\"email\\":\\"student@university.edu\\",\\"term\\":\\"2025 Fall\\"}"`;
  
  console.log('Equivalent curl command:');
  console.log(command);
  return command;
};

// You can call these functions from the browser console:
// testAssignmentsAPIWithTerm()
// getCurlCommand()
