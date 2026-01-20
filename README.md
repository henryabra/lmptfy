# Let Me Perplexity That For You (LMPTFY)

A passive-aggressive way to help people discover [Perplexity AI](https://perplexity.ai).

Inspired by [LMGTFY](https://lmgtfy.app) and [LMCTFY](https://github.com/henryabra/lmctfy).

## What is this?

When someone asks you a question they could have easily searched themselves, send them a LMPTFY link instead. They'll watch an animated tutorial showing them exactly how to use Perplexity AI to find their answer.

## Features

- **Animated Tutorial** - Shows a realistic Perplexity interface with cursor movement and typing animation
- **Share Modal** - Copy link or share directly to X/Twitter, LinkedIn, or Slack
- **Preview Mode** - See the animation before sharing
- **Dark Mode** - Automatic theme based on system preferences
- **Mobile Responsive** - Works on all screen sizes
- **Base64 URL Encoding** - Clean, shareable links with plaintext fallback

## How It Works

1. Enter the question on the homepage
2. Click "Generate Link" to create a shareable URL
3. Share the link with someone who needs a gentle nudge
4. They watch the animation showing how to use Perplexity
5. After 5 seconds, they're redirected to Perplexity with the query pre-filled

## Tech Stack

- Vanilla HTML, CSS, and JavaScript
- No frameworks or build tools required
- Deployable to any static hosting (GitHub Pages, Netlify, Vercel, etc.)

## Local Development

Simply open `index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## Project Structure

```
lmptfy/
├── index.html              # Main webpage
├── assets/
│   └── perplexity-logo.svg # Perplexity logo
├── scripts/
│   ├── main.js            # Core application logic
│   ├── animation.js       # Animation orchestration
│   ├── share.js           # Share modal & social sharing
│   └── analytics.js       # Google Analytics wrapper
└── styles/
    └── main.css           # Complete stylesheet
```

## Customization

### Colors

The Perplexity brand colors are defined as CSS variables in `styles/main.css`:

```css
:root {
    --color-primary: #20B8CD;      /* Perplexity turquoise */
    --color-primary-light: #BADFDE;
    --color-primary-dark: #1a9eb1;
}
```

## Disclaimer

This project is **not affiliated with Perplexity AI** in any way. It's a parody/educational project meant to encourage people to use AI search tools directly.

## License

MIT
