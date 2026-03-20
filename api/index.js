const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();

// 1. CORS Setup - इसे थोड़ा आसान बनाया है ताकि एरर न आए
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "https://shushantp.vercel.app",
            "https://shushantprojects.vercel.app",
            "http://127.0.0.1:5500",
            "http://localhost:3000"
        ];
        // origin.startsWith का यूज़ किया है ताकि सब-पेज (जैसे /projects) भी काम करें
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy says: Access Denied for origin: " + origin));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. Health Check Route
app.get('/', (req, res) => res.send('Universal Video API is Running!'));

// 3. Main API Endpoint
app.post('/api/resolve', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
    }

    try {
        console.log(`Processing URL: ${url}`);
        
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            format: 'b', // 'best' की जगह 'b' यूज़ करें (yt-dlp warning से बचने के लिए)
            // addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
            addHeader: [
                'X-Forwarded-For: 192.168.1.0', // किसी रैंडम पब्लिक आईपी का इस्तेमाल
                'referer:youtube.com',
                'user-agent:Mozilla/5.0'
            ]
        });

        let finalSrc = videoInfo.url;

        if (!finalSrc && videoInfo.formats) {
            // सबसे बढ़िया क्वालिटी वाला फॉर्मेट ढूँढना जिसमें ऑडियो+वीडियो दोनों हो
            const bestCombined = videoInfo.formats
                .filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.url)
                .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

            finalSrc = bestCombined ? bestCombined.url : null;
        }

        if (!finalSrc) throw new Error("Could not find a direct streamable link.");

        res.json({
            success: true,
            title: videoInfo.title,
            src: finalSrc,
            thumbnail: videoInfo.thumbnail
        });

    } catch (error) {
        console.error('SERVER SIDE ERROR:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 4. Port Listener - Render.com के लिए यह सबसे ज़रूरी है
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API is running on port ${PORT}`);
});

module.exports = app;
