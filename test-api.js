require('dotenv').config();
const axios = require('axios');

async function testApi() {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  const modelName = process.env.AI_MODEL_NAME || 'moonshot-v1-8k';

  console.log('Testing API with:');
  console.log('URL:', apiUrl);
  console.log('Model:', modelName);
  console.log('Key:', apiKey ? apiKey.substring(0, 10) + '***' : 'Missing');

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: modelName,
        messages: [{ role: 'user', content: 'Say "hello" and nothing else.' }],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    console.log('\n✅ Success! API is working.');
    console.log('Response content:', response.data.choices[0].message.content);
  } catch (error) {
    console.log('\n❌ Error: API request failed.');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Message:', error.message);
    }
  }
}

testApi();
