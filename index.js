const express = require('express');
const fs = require('fs');
const request = require('request');
const { v4: uuidv4 } = require('uuid'); // Import UUID module

const app = express();
const PORT = process.env.PORT || 3000;

// Function to download video from URL
const downloadVideo = (url, fileName) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(fileName);
        const videoRequest = request.get({ url: url, encoding: null });

        videoRequest.on('response', (response) => {
            response.pipe(file);

            file.on('finish', () => {
                file.close(() => resolve());
            });
        });

        videoRequest.on('error', (err) => {
            fs.unlink(fileName, () => reject(err));
        });
    });
};

// Route to handle the download request
app.get('/', async (req, res) => {
    const videoUrl = req.query.link;
    const uniqueId = uuidv4(); // Generate a unique ID
    const videoFileName = `video_${uniqueId}.mp4`; // Append the unique ID to the filename

    try {
        // Download video
        await downloadVideo(videoUrl, videoFileName);
        console.log('Download complete.');

        // Generate direct playback link
        // For demonstration purposes, let's assume the server address is localhost
        const directLink = `https://storagebyronok-da857e72ed19.herokuapp.com/${videoFileName}`;

        // Automatically delete the video after 10 minutes
        setTimeout(() => {
            fs.unlink(videoFileName, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted:', videoFileName);
                }
            });
        }, 10 * 60 * 1000); // 10 minutes

        res.send(directLink);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).send('Error downloading video');
    }
});

// Serve the video file
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
