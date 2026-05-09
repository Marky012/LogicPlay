# How to Test LogicPlay Live on Your Physical Mobile Phone

By running a "Live Server" over your local Wi-Fi, you can open your LogicPlay app directly on your physical smartphone and watch your UI/UX changes update in real-time as you code on your PC!

Follow these 3 easy steps:

## Step 1: Ensure both devices are on the same Wi-Fi
Make sure both your PC and your mobile phone are connected to the exact same Wi-Fi router network.

## Step 2: Start the Backend on your Local Network
By default, your FastAPI server only listens to `localhost` (your PC itself). We need to tell it to listen to all connections on your local network.

Open a terminal in your `backend` folder and run this:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*(The `--host 0.0.0.0` part explicitly tells FastAPI to accept traffic from other devices on your network like your phone).*

## Step 3: Start your Frontend with the "Host" flag
Now we need to do the exact same thing for the Vite React frontend.

Open a second terminal in your `frontend` folder and run:
```bash
npm run dev -- --host
```
*(Or if you prefer `npx vite --host`)*

Once you press enter, **Vite will print out a green URL that looks like this in your terminal:**
`➜  Network: http://192.168.XX.XX:5173/`

## Step 4: Open that exact URL on your phone's browser!
1. Open Safari, Chrome, or any browser on your phone.
2. Type the exact `Network:` IP address and port that Vite gave you (e.g., `http://192.168.1.15:5173`).
3. Press Go.

### That's it! 
You now have the **Live View** on your phone! 
Every time you hit save on a file on your PC, your phone screen will automatically and instantly refresh to show the new layout. You can now use your browser for the "Desktop View" and your phone for the "Mobile View" simultaneously with no duplicate tabs required on your PC.

> **Note:** We already updated your frontend `api.js` file automatically. When your phone reaches the frontend on `192.168.x.x`, the frontend will smartly know to send login and save requests to `192.168.x.x:8000` (your PC backend) instead of breaking!
