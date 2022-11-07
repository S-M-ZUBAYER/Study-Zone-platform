const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('volunteer server site is running')
})
app.listen(port, () => {
    console.log(`volunteer server is running on port: ${port}`)
})
