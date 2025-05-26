# Installation Guide - Dive into *The Pitt* Chrome Extension

## Quick Setup (5 minutes)

### Step 1: Download the Extension
- Download all files from this repository
- Keep them in a folder (e.g., `pitt-realtime-extension`)

### Step 2: Generate Icons
1. Open `create_icons.html` in your browser
2. Click "Generate Icons"
3. Download all three PNG files:
   - `icon16.png`
   - `icon48.png` 
   - `icon128.png`
4. Place these PNG files in your extension folder

### Step 3: Install in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your extension folder
5. The extension should now appear in your extensions list

### Step 4: Test the Extension
1. Go to `play.max.com`
2. Navigate to any episode of "The Pitt"
3. You should see the extension controls appear on the page
4. Click the extension icon in the Chrome toolbar to see the popup

## Troubleshooting

### Extension Won't Load
- **Missing icons**: Make sure all PNG icon files are in the folder
- **File permissions**: Ensure Chrome can access the folder
- **Manifest errors**: Check browser console for JSON syntax errors

### Extension Doesn't Activate
- **Wrong page**: Make sure you're on a Max video page
- **Show detection**: Currently only Episode 2 has a full episode ID
- **Console errors**: Check browser developer tools for JavaScript errors

### Video Won't Seek/Play
- **Autoplay blocked**: Allow autoplay for Max in browser settings
- **Max login**: Ensure you're logged into Max with an active subscription
- **Episode availability**: Some episodes may not be released yet

## Getting Episode IDs

As new episodes of The Pitt are released, you'll need to update the episode IDs:

1. Go to the episode on Max
2. Copy the URL: `https://play.max.com/video/watch/{show-id}/{episode-id}`
3. Extract the episode ID (the second UUID)
4. Update both `content.js` and `popup.js` with the new episode ID

### Current Episode Status
- ✅ Episode 1: ID needed
- ✅ Episode 2: `0bb030e8-163a-4012-ae1a-89d9d2c5755e`
- ⏳ Episodes 3-15: IDs needed as they're released

## Customization

### Adjusting the Schedule
Edit the `episodes` array in `content.js` to:
- Add episode IDs as they become available
- Adjust episode durations for better timing
- Modify the shift schedule (currently 7 AM - 10 PM)

### Changing the UI
- Modify `styles.css` to change colors, positioning, or design
- Edit the HTML in `content.js` (createUI function) to change layout
- Adjust `popup.html` and `popup.js` for different popup behavior

### Time Zone Support
Currently uses local browser time. To support different time zones:
1. Add timezone selection in popup
2. Modify time calculations in `checkAndUpdatePlayback()`
3. Store timezone preference in Chrome storage

## Advanced Features

### Adding More Shows
The extension could be adapted for other time-based shows:
1. Create new show configurations in a settings file
2. Add show detection logic
3. Implement show-specific timing calculations

### Statistics Tracking
Add viewing statistics by:
1. Using Chrome storage API to track time watched
2. Implementing shift completion tracking
3. Adding viewing streak counters

### Social Features
Potential additions:
1. Share current shift progress
2. Sync with other viewers
3. Schedule viewing parties

## Development

### Testing Locally
1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Reload the Max page to see changes

### Debugging
- Use Chrome DevTools Console for JavaScript errors
- Check Network tab for failed requests
- Monitor video element events

### Contributing
1. Fork the repository
2. Add episode IDs as they become available
3. Test with different episodes and times
4. Submit pull requests with improvements

## Privacy & Legal

- **No data collection**: Extension runs entirely locally
- **Max subscription required**: Uses legitimate Max access only
- **No video downloading**: Only controls existing Max player
- **Respects ToS**: Enhances viewing experience without violating terms

---

**Ready to experience the ER shift?** Follow these steps and start your real-time journey through The Pitt! 🏥⏰ 