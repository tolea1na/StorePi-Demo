StorePi Demo - Vercel-ready package

Files:
- index.html            -> Frontend demo with forced mock Pi SDK (for testing)
- api/approve-payment.js-> Vercel serverless function that approves payments (GET ping, POST approve)
- package.json          -> Node engine set to 22.x and dependency node-fetch

Deployment (quick):
1. Create a new GitHub repo (or use your existing).
2. Upload all files and the api folder to the repo root.
3. Import the repo into Vercel (New Project -> Import Git Repository).
4. In Vercel project settings, add environment variable:
   PI_SERVER_API_KEY = <your server API key from developer.minepi.com> (optional for demo)
5. Deploy and visit https://<your-vercel-domain>/

Notes:
- The mock Pi makes the demo work in any browser. Remove the mock block (search for 'FORCED Mock Pi') before using the real Pi Browser SDK in production.
- If you want me to upload this repo for you, paste your GitHub repo URL and I will prepare a patch.
