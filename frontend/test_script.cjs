const axios = require('axios');

async function testFetch() {
  try {
    const u = await axios.get('http://localhost:8000/users/Marky');
    console.log("User:", JSON.stringify(u.data).substring(0, 50));
    const c = await axios.get('http://localhost:8000/users/Marky/circuits');
    console.log("Circ:", JSON.stringify(c.data).substring(0, 50));
  } catch (err) {
    console.error("Error:", err.message, err.response?.status, err.response?.data);
  }
}
testFetch();
