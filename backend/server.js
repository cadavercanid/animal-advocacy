const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Store submissions in a JSON file
const dataFile = 'submissions.json';

// Initialize empty JSON file if it doesn't exist
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
}

app.post('/submit', (req, res) => {
    const submission = {
        choices: req.body.choices,
        timestamp: new Date().toISOString()
    };

    // Read existing data
    const data = JSON.parse(fs.readFileSync(dataFile));
    
    // Add new submission
    data.push(submission);
    
    // Write back to file
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Submission recorded successfully' });
});

app.get('/results', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFile));
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
