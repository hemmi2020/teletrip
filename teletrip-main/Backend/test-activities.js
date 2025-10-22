require('dotenv').config();
const activitiesService = require('./services/ActivitiesService');

async function testActivitiesAPI() {
  console.log('🔍 Testing Activities Service...');
  
  try {
    const data = await activitiesService.searchActivities({
      destination: 'Dubai',
      from: '2024-12-20',
      to: '2024-12-25',
      paxes: [{ age: 30 }]
    });
    
    console.log('✅ Success!');
    console.log('Activities found:', data.activities?.length || 0);
    if (data.activities?.[0]) {
      console.log('First activity:', data.activities[0].name);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testActivitiesAPI();
