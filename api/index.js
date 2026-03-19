const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. YouTube URL से ID निकालने वाला फंक्शन
const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// 2. पब्लिक Invidious Instances की लिस्ट (ताकि अगर एक डाउन हो तो दूसरा चले)
const instances = [
    'https://inv.tux.rs',
    'https://invidious.snopyta.org',
    'https://invidious.kavin.rocks',
    'https://vid.puffyan.us'
];

app.get('/', (req, res) => res.send('Invidious Resolver is Active!'));

app.post('/api/resolve', async (req, res) => {
    const { url } = req.body;
    const videoId = getYouTubeID(url);

    if (!videoId) {
        return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
    }

    // बारी-बारी से अलग-अलग सर्वर ट्राई करना
    for (let instance of instances) {
        try {
            console.log(`Trying instance: ${instance}`);
            const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, { timeout: 5000 });
            const data = response.data;

            // सबसे अच्छी क्वालिटी वाला फॉर्मेट ढूंढना (जिसमें ऑडियो और वीडियो दोनों हो)
            const bestFormat = data.formatStreams.find(f => f.qualityLabel === '720p') || data.formatStreams[0];

            if (bestFormat) {
                return res.json({
                    success: true,
                    title: data.title,
                    src: bestFormat.url,
                    thumbnail: data.videoThumbnails.find(t => t.quality === 'maxresdefault')?.url || data.videoThumbnails[0].url
                });
            }
        } catch (err) {
            console.log(`${instance} failed, trying next...`);
            continue; // अगर एक सर्वर फेल हुआ तो अगले पर जाओ
        }
    }

    res.status(500).json({ success: false, error: 'All instances are busy. Try again later.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
