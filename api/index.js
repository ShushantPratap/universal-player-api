const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();

// CORS को कन्फिगर करें ताकि आपके दोस्त की वेबसाइट इसे एक्सेस कर सके
app.use(cors({
    origin: (origin, callback) => {
        // अगर कोई ओरिजिन नहीं है (जैसे Postman) या वो हमारी लिस्ट में है, तो Allow करें
        const allowedOrigins = [
            "https://shushantp.vercel.app/projects",
            "https://shushantprojects.vercel.app",
            "http://127.0.0.1:5500"
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy says: Access Denied!"));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Endpoint
app.post('/api/resolve', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            format: 'best',
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });

        let finalSrc = videoInfo.url;

        if (!finalSrc && videoInfo.formats) {
            const bestCombined = videoInfo.formats
                .filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.url)
                .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

            finalSrc = bestCombined ? bestCombined.url : null;
        }

        res.json({
            success: true,
            title: videoInfo.title,
            src: finalSrc
        });

        // api/index.js के अंदर catch वाले हिस्से को ऐसे बदलें:
    } catch (error) {
        console.error('SERVER SIDE ERROR:', error); // यह टर्मिनल में असली एरर दिखाएगा
        res.status(500).json({
            success: false,
            error: error.message,
            details: "Check terminal for more info"
        });
    }
});

// डिफ़ॉल्ट रूट
app.get('/', (req, res) => res.send('Universal Video API is Running!'));

module.exports = app;