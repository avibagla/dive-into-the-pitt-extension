# Dive into *The Pitt* Chrome Extension

Experience "*The Pitt*" TV show in real-time! This extension synchronizes your viewing with the show's 15-hour emergency room shift timeline.

## Features

- **Real-Time Synchronization**: Automatically navigates to the correct episode and timestamp based on the current time
- **Shift Timer**: Shows elapsed time into the emergency room shift
- **Episode Navigation**: Seamlessly switches between episodes as the "shift" progresses
- **Gap Handling**: Shows full-screen countdown timer between episodes with automatic video pausing
- **Debug Mode**: Time simulation feature for testing different scenarios
- **Ad Detection**: Waits for ads to complete before seeking to correct timestamp

## How It Works

The extension maps real-world time to the show's timeline:
- **7:00 AM** = Start of shift (Episode 1: "7:00 A.M.")
- **8:00 AM** = Episode 2: "8:00 A.M."
- **9:00 AM** = Episode 3: "9:00 A.M."
- ... and so on until ...
- **9:00 PM** = Episode 15: "9:00 P.M."
- **10:00 PM** = End of shift

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked" and select the extension folder
5. Navigate to any "*The Pitt*" episode on Max (play.max.com)
6. Click "Start Real-Time" in the extension popup

## Debug Features

### Time Simulation
- Use the debug time input in the control panel
- Enter time in HH:MM format (e.g., "14:30" for 2:30 PM)
- Perfect for testing gap periods between episodes
- Shows "(DEBUG)" indicator when active

### Gap Experience
- When between episodes, shows full-screen countdown timer
- Video automatically pauses during breaks
- Displays next episode information
- Automatically resumes when new episode starts

## Controls

- **Start/Stop Real-Time**: Toggle the real-time experience
- **Draggable Shift Timer**: Move the red timer overlay around the screen
- **Debug Time Simulator**: Test different times without waiting

## Technical Details

### Episode Data
- Uses "time from end" calculations to handle variable trailers
- Accounts for credits and content gaps
- Precise timestamp calculations for seamless viewing

### Ad Handling
- Detects ad states and waits for completion
- Automatically seeks to correct position after ads
- Minimal disruption to viewing experience

## Troubleshooting

1. **Extension not working**: Make sure you're on a Max video page for "*The Pitt*"
2. **Seeking not working**: Check browser console for debug logs
3. **Wrong episode**: Verify the current time matches the shift schedule
4. **Debug mode stuck**: Click "Clear" button to return to real time

## Development

The extension consists of:
- `content.js`: Main functionality and UI
- `episode-data.js`: Episode information and timing calculations  
- `styles.css`: Visual styling
- `manifest.json`: Extension configuration

## Support

For issues or feature requests, check the browser console for debug logs and report any problems with detailed information about your current time, episode, and any error messages.

## 🚨 What is Dive into *The Pitt*?

"*The Pitt*" is a groundbreaking HBO series where each episode represents one hour of a single emergency room shift, running from 7:00 AM to 10:00 PM (15 episodes total). This extension allows you to:

- **Watch in real-time**: If it's 2:30 PM in real life, you'll be watching the appropriate part of the 2:00-3:00 PM episode
- **Seamless transitions**: Automatic navigation between episodes with countdown timers during gaps
- **Authentic experience**: Feel like you're actually working the ER shift alongside the characters
- **Shift timer**: Track how long you've been "on shift" with a persistent timer

## 🎯 Features

- ✅ **Real-time synchronization** with current time
- ✅ **Automatic episode navigation** based on time of day  
- ✅ **Countdown timers** during episode gaps
- ✅ **Draggable shift timer** showing elapsed time
- ✅ **Smart seeking** within episodes based on current time
- ✅ **Fully legitimate** - uses Max's official player, requires Max subscription
- ✅ **Responsive design** that hides during fullscreen
- ✅ **Episode overview** popup with navigation

## 📋 Requirements

- Chrome browser
- Active Max (formerly HBO Max) subscription
- Access to "*The Pitt*" on Max

## 🎬 How to Use

### Starting Your Shift

1. Go to any episode of *The Pitt* on Max
2. Look for the **"Dive into *The Pitt*"** control panel (top right)
3. Click **"Start Real-Time"** to begin the experience
4. The extension will automatically navigate to the correct episode and timestamp

### During Your Shift

- **Shift Timer**: Draggable timer (top left) shows how long you've been "on shift"
- **Automatic Navigation**: Extension handles episode changes and seeking
- **Break Periods**: When episodes end before the hour, you'll see countdown timers
- **Manual Control**: You can pause/stop real-time mode anytime

### Episode Schedule

| Time | Episode | Title |
|------|---------|-------|
| 7:00 AM | Episode 1 | 7:00 A.M. |
| 8:00 AM | Episode 2 | 8:00 A.M. |
| 9:00 AM | Episode 3 | 9:00 A.M. |
| ... | ... | ... |
| 9:00 PM | Episode 15 | 9:00 P.M. |

## ⚙️ Technical Details

### How It Works

1. **Time Mapping**: Real-world time (7 AM - 10 PM) maps to episodes 1-15
2. **Episode Detection**: Identifies "*The Pitt*" episodes via URL patterns and page content
3. **Smart Seeking**: Calculates correct timestamp within each episode
4. **Gap Handling**: Shows countdowns during the time between episode end and next hour
5. **URL Navigation**: Automatically switches episodes when needed

### Episode Timing Logic

Since episodes are typically 40-50 minutes (except the last which is 60 minutes), there are natural gaps. The extension:
- Plays the episode content during the "active" portion of each hour
- Shows countdown timers during gaps
- Ensures episodes end at the top of each hour (credits time)

### Episode IDs

Currently, we have the episode ID for Episode 2. As more episodes are released, we'll need to update the `episodes` array in both `content.js` and `popup.js` with the correct episode IDs from Max URLs.

## 🛠️ Development

### File Structure

```
├── manifest.json          # Extension manifest
├── content.js             # Main extension logic
├── styles.css             # UI styling
├── popup.html             # Extension popup
├── popup.js               # Popup functionality
└── README.md              # This file
```

### Adding New Episodes

When new episodes are released, update the `episodeId` field in the `episodes` array:

```javascript
{ episode: 3, title: "9:00 A.M.", episodeId: "NEW_EPISODE_ID_HERE", duration: 2640 }
```

You can find episode IDs from the Max URL when watching an episode:
`https://play.max.com/video/watch/{show-id}/{episode-id}`

### Customization

- **Shift Start Time**: Modify `shiftStartTime` logic in `startRealTime()`
- **Check Interval**: Adjust `checkInterval` timing (currently 5 seconds)
- **Episode Durations**: Update duration estimates for better seeking accuracy

## 🚀 Future Enhancements

- [ ] **Episode duration detection** from video metadata
- [ ] **Timezone support** for different viewing times
- [ ] **Weekend/holiday scheduling** options  
- [ ] **Rewind capability** to replay parts of the shift
- [ ] **Statistics tracking** (total shifts worked, favorite episodes)
- [ ] **Social features** (share your shift progress)

## ⚠️ Important Notes

- **Requires Max subscription**: This extension only works with legitimate Max access
- **Episode availability**: Some episodes may not be available yet (check episode IDs)
- **Browser support**: Currently Chrome only (Firefox version possible)

## 🎭 The Experience

This isn't just watching TV - it's about experiencing the intensity, rhythm, and humanity of a real emergency room shift. You'll feel the ebb and flow of the department, the quick breaks between cases, and the relentless progression of time that healthcare workers face every day.

Whether you're a medical professional, a fan of the show, or someone who wants a completely new way to experience television, Dive into *The Pitt* transforms passive viewing into an immersive experience.

## 📄 License

This project is for educational and entertainment purposes. Respect Max's terms of service and copyright. The extension doesn't modify, download, or redistribute any video content - it simply enhances the legitimate viewing experience.

## 🤝 Contributing

Found a bug? Have an idea? Want to help add episode IDs as they're released? Contributions are welcome!

---

**Ready to start your shift?** Install the extension and experience emergency medicine like never before! 🏥⏰ 