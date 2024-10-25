const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const app = express();
const port = process.env.PORT || 3000;

// AWS Configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'your-region' // e.g., 'us-east-1'
});

const BUCKET_NAME = 'your-bucket-name';
const FILE_NAME = 'submissions.json';

app.use(cors());
app.use(express.json());

// Function to get submissions from S3
async function getSubmissions() {
    try {
        const data = await s3.getObject({
            Bucket: BUCKET_NAME,
            Key: FILE_NAME
        }).promise();
        
        return JSON.parse(data.Body.toString());
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            return [];
        }
        throw error;
    }
}

// Function to save submissions to S3
async function saveSubmissions(submissions) {
    await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: FILE_NAME,
        Body: JSON.stringify(submissions, null, 2),
        ContentType: 'application/json'
    }).promise();
}

app.post('/submit', async (req, res) => {
    try {
        const submissions = await getSubmissions();
        
        const submission = {
            choices: req.body.choices,
            timestamp: new Date().toISOString()
        };

        submissions.push(submission);
        await saveSubmissions(submissions);
        
        res.json({ message: 'Submission recorded successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

app.get('/results', async (req, res) => {
    try {
        const submissions = await getSubmissions();
        res.json(submissions);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
