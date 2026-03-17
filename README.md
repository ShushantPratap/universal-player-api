# 🚀 Universal Video Resolver API

A robust, high-performance Node.js API designed to extract direct, streamable video URLs from over 1,000+ online platforms, including **YouTube, Instagram, Facebook, Vimeo, and TikTok**. 

This API acts as a "Video Link Bypass," allowing developers to fetch raw `.mp4` or `.m3u8` sources and integrate them into custom video players without using restrictive iframes or third-party players.

---

## 🌟 Key Features

- **Universal Compatibility:** Powered by `yt-dlp`, supporting virtually any video link on the internet.
- **Direct Stream Extraction:** Bypasses platform UIs to provide raw video sources for HTML5 `<video>` tags.
- **Smart Format Selection:** Automatically selects the best combined video and audio format (up to 1080p).
- **CORS Enabled:** Pre-configured for cross-origin requests, making it ready for frontend integration in any portfolio or web app.
- **Headless & Fast:** Optimized for low-latency metadata extraction.
- **Serverless Ready:** Configured to work seamlessly with platforms like Vercel, Render, and Railway.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v16+)
- **Framework:** Express.js
- **Extraction Engine:** `youtube-dl-exec` (Binary wrapper for `yt-dlp`)
- **Middleware:** `cors`, `body-parser`

---

## 📂 API Project Structure

```text
/universal-player-api
│
├── api/
│   └── index.js        # Main Serverless / Express Logic
├── vercel.json         # Vercel deployment configuration
├── package.json        # Dependencies & scripts
└── .gitignore          # Files to exclude from Git
```
---


### How to use the API:
```javascript
const response = await fetch('https://your-api.vercel.app/api/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'YOUR_LINK' })
});
const data = await response.json();
console.log(data.src); // Here is direct video link

```

<b>Developer:</b> Shushant
