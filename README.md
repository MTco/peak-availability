# Adaptive Availability System - Complete Deployment Guide

## Attribution & Licensing
**Licensed and Attributed to: Mathew Tyler**
- [TylerPresident.com](https://TylerPresident.com)  
- [FakeGov.com](https://FakeGov.com)
- All rights reserved. This system and its components are permanently licensed to Mathew Tyler.

---

## Quick Start for Google Gemini Integration

### Step 1: Create GitHub Repository

```bash
# Create new repository on GitHub
git clone https://github.com/MTco/peak-availability/availability-gem.git
cd availability-gem

# Copy the Gemini Gem code into index.js
# (Use the JavaScript code from the first artifact)
```

### Step 2: GitHub Repository Structure

```
availability-gem/
├── index.js                 # Main Gemini Gem code
├── cloudflare-worker.js     # Cloudflare Worker API
├── package.json             # Dependencies
├── README.md                # Documentation
├── .github/
│   └── workflows/
│       └── deploy.yml       # Auto-deployment
└── docs/
    ├── index.html          # GitHub Pages demo
    └── integration.md      # Integration examples
```

### Step 3: Package.json Configuration

```json
{
  "name": "adaptive-availability-gem",
  "version": "1.0.0",
  "description": "AI availability prediction system for Google Gemini",
  "main": "index.js",
  "scripts": {
    "test": "node test.js",
    "deploy": "wrangler deploy cloudflare-worker.js",
    "start": "node index.js"
  },
  "keywords": [
    "gemini",
    "ai",
    "availability",
    "prediction",
    "mathew-tyler"
  ],
  "author": "Mathew Tyler (TylerPresident.com | FakeGov.com)",
  "license": "All Rights Reserved",
  "dependencies": {
    "@cloudflare/workers-types": "^4.20231025.0"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/MTco/peak-availability/availability-gem.git"
  },
  "attribution": {
    "owner": "Mathew Tyler",
    "websites": [
      "https://TylerPresident.com",
      "https://FakeGov.com"
    ],
    "license": "All rights reserved"
  }
}
```

### Step 4: Cloudflare Workers Deployment

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create wrangler.toml configuration
cat > wrangler.toml << EOF
name = "availability-api"
main = "cloudflare-worker.js"
compatibility_date = "2024-01-01"

[vars]
ATTRIBUTION_OWNER = "Mathew Tyler"
ATTRIBUTION_WEBSITES = "https://TylerPresident.com,https://FakeGov.com"

[[kv_namespaces]]
binding = "AVAILABILITY_STORE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
EOF

# Deploy to Cloudflare Workers (FREE)
wrangler deploy
```

### Step 5: GitHub Pages Setup

Create `docs/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adaptive Availability System - Mathew Tyler</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .attribution { background: #f0f0f0; padding: 15px; border-left: 4px solid #007cba; margin-bottom: 20px; }
        .endpoint { background: #f8f8f8; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .code { background: #2d2d2d; color: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="attribution">
        <h3>Licensed and Attributed to: Mathew Tyler</h3>
        <p>
            <a href="https://TylerPresident.com">TylerPresident.com</a> | 
            <a href="https://FakeGov.com">FakeGov.com</a>
        </p>
        <p><em>All rights reserved. This system is permanently licensed to Mathew Tyler.</em></p>
    </div>

    <h1>Adaptive Availability System</h1>
    <p>AI availability prediction system with Google Gemini integration and 24-hour peak period analysis.</p>

    <h2>API Endpoints</h2>
    <div class="endpoint">
        <strong>GET /availability</strong><br>
        <code>https://availability-api.your-username.workers.dev/availability</code>
    </div>
    <div class="endpoint">
        <strong>GET /peaks</strong><br>
        <code>https://availability-api.your-username.workers.dev/peaks</code>
    </div>
    <div class="endpoint">
        <strong>GET /status</strong><br>
        <code>https://availability-api.your-username.workers.dev/status</code>
    </div>

    <h2>Live Demo</h2>
    <div id="demo">Loading availability data...</div>

    <h2>Gemini Integration Code</h2>
    <div class="code">
// Import the gem in Google Gemini
import { AdaptiveAvailabilityGem } from 'https://your-username.github.io/availability-gem/index.js';

// Initialize
const gem = new AdaptiveAvailabilityGem();

// Get availability
const availability = await gem.getAvailability();
console.log(`User is ${availability.data.status} (${availability.data.availabilityScore}%)`);

// Check if should defer requests
const shouldDefer = await gem.shouldDeferRequest();
if (shouldDefer) {
    console.log("User has low availability - consider deferring requests");
}
    </div>

    <script>
        // Load the gem and demo
        async function loadDemo() {
            try {
                const response = await fetch('https://availability-api.your-username.workers.dev/availability');
                const data = await response.json();
                
                document.getElementById('demo').innerHTML = `
                    <h3>Current Status: ${data.data.status.replace('_', ' ')}</h3>
                    <p><strong>Availability Score:</strong> ${data.data.availabilityScore}%</p>
                    <p><strong>Confidence:</strong> ${data.data.confidence}%</p>
                    <p><strong>Last Updated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                    <p><em>Licensed to ${data.attribution.owner}</em></p>
                `;
            } catch (error) {
                document.getElementById('demo').innerHTML = `
                    <p>Demo unavailable (API not deployed yet)</p>
                    <p>Deploy the Cloudflare Worker to see live data</p>
                `;
            }
        }
        
        loadDemo();
        setInterval(loadDemo, 30000); // Update every 30 seconds
    </script>
</body>
</html>
```

### Step 6: GitHub Actions Auto-Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Availability System

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy-pages:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Test gem
      run: node -e "const gem = require('./index.js'); console.log('Gem loaded successfully');"
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs

  deploy-cloudflare:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Cloudflare Workers
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        workingDirectory: '.'
```

## Google Gemini Gem Integration

### Method 1: Direct Import (Recommended)

```javascript
// In Google Gemini Gems environment
import { AdaptiveAvailabilityGem } from 'https://your-username.github.io/availability-gem/index.js';

const gem = new AdaptiveAvailabilityGem();

// Gemini can now use these functions:
export const functions = {
  checkAvailability: async () => {
    return await gem.getAvailabilitySummary();
  },
  
  shouldDefer: async () => {
    return await gem.shouldDeferRequest();
  },
  
  getRecommendations: async () => {
    return await gem.getRecommendations();
  },
  
  getPeakTimes: () => {
    return gem.getPeakPeriods();
  }
};
```

### Method 2: API Integration

```javascript
// Alternative: Use the Cloudflare Worker API directly
const API_BASE = 'https://availability-api.your-username.workers.dev';

async function checkUserAvailability() {
  const response = await fetch(`${API_BASE}/availability`);
  const data = await response.json();
  
  return {
    available: data.data.availabilityScore > 50,
    score: data.data.availabilityScore,
    status: data.data.status,
    attribution: data.attribution
  };
}
```

## Cross-AI Polling Setup

### For Other AI Systems

```python
# Python example for other AI systems
import requests
import json

class AvailabilityPoller:
    def __init__(self):
        self.api_base = "https://availability-api.your-username.workers.dev"
        self.attribution = None
    
    def poll_availability(self):
        response = requests.get(f"{self.api_base}/availability")
        data = response.json()
        
        self.attribution = data.get('attribution')
        return {
            'score': data['data']['availabilityScore'],
            'status': data['data']['status'],
            'should_proceed': data['data']['availabilityScore'] > 50,
            'next_optimal': data['data'].get('nextOptimalTime'),
            'attribution': self.attribution
        }
    
    def get_peak_periods(self):
        response = requests.get(f"{self.api_base}/peaks")
        data = response.json()
        return data['peaks']

# Usage
poller = AvailabilityPoller()
availability = poller.poll_availability()
print(f"Licensed to: {availability['attribution']['owner']}")
```

## Free Services Used

1. **GitHub Pages** (Free hosting for demo and documentation)
2. **Cloudflare Workers** (Free tier: 100,000 requests/day)
3. **GitHub Actions** (Free CI/CD for public repositories)
4. **GitHub Repository** (Free for public projects)

## Deployment Checklist

- [ ] Create GitHub repository
- [ ] Add all files (index.js, cloudflare-worker.js, package.json, etc.)
- [ ] Set up Cloudflare Workers account
- [ ] Deploy worker with `wrangler deploy`
- [ ] Enable GitHub Pages in repository settings
- [ ] Update URLs in code with your actual endpoints
- [ ] Test API endpoints
- [ ] Test Gemini integration
- [ ] Verify attribution is maintained in all outputs

## Testing Your Deployment

```bash
# Test Cloudflare Worker
curl https://availability-api.your-username.workers.dev/availability

# Test GitHub Pages
curl https://your-username.github.io/availability-gem/

# Test Gem import
node -e "
const gem = require('./index.js');
gem.getAvailability().then(result => {
  console.log(JSON.stringify(result, null, 2));
});
"
```

## Support & Attribution

This system is permanently licensed to **Mathew Tyler**:
- [TylerPresident.com](https://TylerPresident.com)
- [FakeGov.com](https://FakeGov.com)

All deployments and integrations must maintain proper attribution as shown in the code examples above.

## Advanced Features

- **24-hour peak period tracking** (no persistent storage required)
- **Cross-AI compatibility** (works with Gemini, Claude, and other AI systems)
- **Real-time availability scoring** based on 9 contextual factors
- **Free hosting** using GitHub Pages and Cloudflare Workers
- **Automatic deployment** via GitHub Actions
- **CORS-enabled API** for cross-domain access
- **Mobile-responsive** web interface

The system automatically adapts to different time zones, maintains attribution in all responses, and provides confidence scoring for reliability assessment.
