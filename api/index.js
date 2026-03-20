const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/resolve', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL missing' });

    try {
        // 'b' format सबसे स्टेबल है
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            format: 'b',
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });

        res.json({
            success: true,
            title: info.title,
            src: info.url || info.formats[0].url
        });
    } catch (error) {
        // अगर यूट्यूब ब्लॉक करे तो यहाँ पता चलेगा
        res.status(500).json({ success: false, error: "YouTube Blocked this Request" });
    }
});

app.listen(process.env.PORT || 3000);
