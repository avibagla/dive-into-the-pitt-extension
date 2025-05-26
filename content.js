// Dive into The Pitt Chrome Extension
// This script runs on Max video pages and provides real-time viewing experience

// console.log('🎬 Dive into The Pitt content script loaded!');
// console.log('🔍 Page URL:', window.location.href);
// console.log('🔍 Document ready state:', document.readyState);

class PittRealTime {
  constructor() {
    // console.log('🏗️ PittRealTime constructor called');
    this.isActive = false;
    this.shiftStartTime = null;
    this.currentEpisode = null;
    this.checkInterval = null;
    this.shiftTimer = null;
    this.currentTimeTimer = null;
    this.debugTime = null; // For time simulation
    this.debugTimeTimer = null; // For making debug time tick
    this.gapOverlay = null; // For full-screen gap timer
    this.gapUpdateTimer = null; // For updating gap timer every second
    this.shiftTimerShrunk = false; // For shift timer auto-shrink
    this.showDebugControls = false; // Set to true to show debug time controls
    this.enableConsoleLogging = false; // Set to true to enable console output
    
    // Restore debug state from localStorage
    this.restoreDebugState();
    
    // Set up URL change detection for SPA navigation
    this.setupUrlChangeDetection();
    
    this.init();
  }
  
  // Helper method for conditional console logging
  log(...args) {
    if (this.enableConsoleLogging) {
      console.log(...args);
    }
  }
  
  restoreDebugState() {
    const debugState = localStorage.getItem('pittRealTimeDebugState');
    if (debugState) {
      const { debugTime } = JSON.parse(debugState);
      if (debugTime) {
        this.debugTime = new Date(debugTime);
        this.log('🐛 Debug time restored:', this.debugTime.toLocaleString());
        this.startDebugTimeTicker();
      }
    }
  }
  
  init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupExtension());
    } else {
      this.setupExtension();
    }
  }
  
  setupExtension() {
    this.log('🎬 Dive into The Pitt: Setting up extension...');
    this.log('🔍 Current URL:', window.location.href);
    
    // Check if we're on a Pitt episode page
    if (this.isPittEpisode()) {
      this.log('✅ Detected Pitt episode page');
      this.createUI();
      this.detectCurrentEpisode();
      this.log('📺 Current episode detected:', this.currentEpisode);
      
      // Check for autostart parameter from popup
      const urlParams = new URLSearchParams(window.location.search);
      const shouldAutostart = urlParams.get('autostart') === 'true';
      
      if (shouldAutostart) {
        this.log('🚀 Autostart detected from popup, starting real-time mode');
        // Small delay to ensure UI is ready
        setTimeout(() => {
          this.startRealTime();
        }, 1500);
      } else {
        // Check if we should auto-restore real-time mode after navigation
        const debugState = localStorage.getItem('pittRealTimeDebugState');
        if (debugState) {
          const { wasActive } = JSON.parse(debugState);
          if (wasActive && !this.isActive) {
            this.log('🔄 Auto-restoring real-time mode after navigation');
            // Small delay to ensure UI is ready
            setTimeout(() => {
              this.startRealTime();
            }, 1000);
          }
        }
      }
    } else {
      this.log('❌ Not a Pitt episode page');
    }
  }
  
  isPittEpisode() {
    // Check URL and page content to determine if this is a Pitt episode
    const url = window.location.href;
    const isMaxVideoPage = url.includes('play.max.com/video/watch');
    
    this.log('🔍 Checking if Pitt episode:', { url, isMaxVideoPage });
    
    if (!isMaxVideoPage) return false;
    
    // Check if the page title or content indicates this is The Pitt
    const title = document.title;
    const episodeTitle = document.querySelector('[data-testid="player-ux-asset-title"]');
    
    this.log('📄 Page info:', { title, episodeTitle: episodeTitle?.textContent });
    
    if (title.includes('The Pitt') || 
        (episodeTitle && episodeTitle.textContent.includes('The Pitt'))) {
      this.log('✅ Found "The Pitt" in title/content');
      return true;
    }
    
    // Check if URL matches any episode from our data
    const episodeByUrl = getEpisodeByUrl(url);
    this.log('🔍 Episode by URL:', episodeByUrl);
    return episodeByUrl !== undefined;
  }
  
  detectCurrentEpisode() {
    // Try to identify current episode by URL first
    const url = window.location.href;
    this.currentEpisode = getEpisodeByUrl(url);
    
    if (!this.currentEpisode) {
      // Fallback: Extract current episode info from the page
      const seasonEpisode = document.querySelector('[data-testid="player-ux-season-episode"]');
      const episodeTitle = document.querySelector('[data-testid="player-ux-asset-subtitle"]');
      
      if (seasonEpisode && episodeTitle) {
        const episodeText = seasonEpisode.textContent;
        const titleText = episodeTitle.textContent;
        
        // Extract episode number (e.g., "S1 E2:" -> 2)
        const episodeMatch = episodeText.match(/E(\d+)/);
        if (episodeMatch) {
          const episodeNum = parseInt(episodeMatch[1]);
          this.currentEpisode = getEpisode(episodeNum);
        }
      }
    }
  }
  
  createUI() {
    // Create the main control panel
    const controlPanel = document.createElement('div');
    controlPanel.id = 'pitt-realtime-control';
    controlPanel.innerHTML = `
      <div class="pitt-control-header">
        <h3>Dive into <em>The Pitt</em></h3>
        <div class="header-buttons">
          <button id="pitt-toggle">${this.isActive ? 'Stop' : 'Start'} Real-Time</button>
        </div>
      </div>
      <div id="pitt-control-content" class="pitt-control-content">
        <div class="pitt-status">
          <div id="pitt-current-time">Current Time: --:--</div>
          <div id="pitt-episode-info">Episode: --</div>
          <div id="pitt-next-episode" style="display: none;">Next: --</div>
        </div>
        ${this.showDebugControls ? `
        <div id="pitt-debug-simulator">
          <label for="pitt-debug-time">Debug Time Simulation (HH:MM format):</label>
          <input type="text" id="pitt-debug-time" placeholder="e.g., 14:30 for 2:30 PM" />
          <button id="pitt-debug-apply">Apply Debug Time</button>
          <button id="pitt-debug-clear" style="margin-left: 5px; background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">Clear</button>
        </div>
        ` : ''}
      </div>
    `;
    
    // Create shift timer with auto-shrink functionality
    const shiftTimer = document.createElement('div');
    shiftTimer.id = 'pitt-shift-timer';
    shiftTimer.innerHTML = '<div class="timer-content">00:00:00 into the emergency room shift</div>';
    
    document.body.appendChild(controlPanel);
    document.body.appendChild(shiftTimer);
    
    // Add auto-shrink behavior to shift timer
    setTimeout(() => {
      this.shrinkShiftTimer();
    }, 5000);
    
    // Add hover behavior to shift timer
    shiftTimer.addEventListener('mouseenter', () => this.expandShiftTimer());
    shiftTimer.addEventListener('mouseleave', () => this.shrinkShiftTimer());
    
    // Restore debug time input field if we have debug time set and debug controls are shown
    if (this.debugTime && this.showDebugControls) {
      const debugInput = document.getElementById('pitt-debug-time');
      if (debugInput) {
        const hours = this.debugTime.getHours().toString().padStart(2, '0');
        const minutes = this.debugTime.getMinutes().toString().padStart(2, '0');
        debugInput.value = `${hours}:${minutes}`;
      }
    }
    
    // Add event listeners
    document.getElementById('pitt-toggle').addEventListener('click', () => this.toggleRealTime());
    
    // Add debug event listeners only if debug controls are shown
    if (this.showDebugControls) {
      document.getElementById('pitt-debug-apply').addEventListener('click', () => this.applyDebugTime());
      document.getElementById('pitt-debug-clear').addEventListener('click', () => this.clearDebugTime());
    }
  }
  
  shrinkShiftTimer() {
    const timer = document.getElementById('pitt-shift-timer');
    if (timer) {
      timer.classList.add('shrunk');
      this.shiftTimerShrunk = true;
      
      // Update content to short format
      const timerContent = timer.querySelector('.timer-content');
      if (timerContent && this.isActive) {
        this.updateShiftTimer(); // This will use the short format
      }
    }
  }

  expandShiftTimer() {
    const timer = document.getElementById('pitt-shift-timer');
    if (timer) {
      timer.classList.remove('shrunk');
      this.shiftTimerShrunk = false;
      
      // Update content to long format
      const timerContent = timer.querySelector('.timer-content');
      if (timerContent && this.isActive) {
        this.updateShiftTimer(); // This will use the long format
      }
    }
  }
  
  toggleRealTime() {
    if (this.isActive) {
      this.stopRealTime();
    } else {
      this.startRealTime();
    }
  }
  
  startRealTime() {
    this.log('🚀 Starting Dive into The Pitt...');
    this.isActive = true;
    
    // Remove autostart parameter from URL to avoid issues with refreshes
    this.removeAutostartParameter();
    
    // Get current time (or debug time)
    const now = this.debugTime || new Date();
    this.log('⏰ Current time:', now.toLocaleString());
    this.log('⏰ Current hour:', now.getHours());
    if (this.debugTime) this.log('🐛 Using debug time');
    
    // Set shift start time to 7:00 AM today
    this.shiftStartTime = new Date();
    this.shiftStartTime.setHours(7, 0, 0, 0);
    
    // If current time is before 7 AM, set to yesterday's 7 AM
    if (now.getHours() < 7) {
      this.shiftStartTime.setDate(this.shiftStartTime.getDate() - 1);
      this.log('⏰ Before 7 AM, using yesterday\'s shift start');
    }
    
    // If current time is after 10 PM, we're past the shift but can still show it
    if (now.getHours() >= 22) {
      this.log('⏰ After 10 PM, shift is over but showing it');
    }
    
    this.log('⏰ Shift start time set to:', this.shiftStartTime.toLocaleString());
    
    // Calculate initial shift elapsed
    const initialElapsed = (now - this.shiftStartTime) / 1000;
    this.log('⏰ Initial shift elapsed:', Math.floor(initialElapsed), 'seconds');
    this.log('⏰ That\'s', (initialElapsed / 3600).toFixed(2), 'hours into shift');
    
    const toggleButton = document.getElementById('pitt-toggle');
    toggleButton.textContent = 'Stop Real-Time';
    toggleButton.classList.add('active');
    
    // Start the checking interval (every 1 second for current time, every 5 seconds for playback)
    this.checkInterval = setInterval(() => this.checkAndUpdatePlayback(), 5000);
    
    // Start the shift timer (every second)
    this.shiftTimer = setInterval(() => this.updateShiftTimer(), 1000);
    
    // Start current time updater (every second)
    this.currentTimeTimer = setInterval(() => this.updateCurrentTime(), 1000);
    
    // Initial check
    setTimeout(() => {
      this.log('🔄 Running initial check...');
      this.checkAndUpdatePlayback();
    }, 1000);
    
    this.log('✅ Dive into The Pitt started');
  }
  
  removeAutostartParameter() {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('autostart')) {
      currentUrl.searchParams.delete('autostart');
      // Use replaceState to update URL without triggering a page reload
      window.history.replaceState({}, '', currentUrl.toString());
      this.log('🧹 Removed autostart parameter from URL');
    }
  }
  
  stopRealTime() {
    this.isActive = false;
    const toggleButton = document.getElementById('pitt-toggle');
    toggleButton.textContent = 'Start Real-Time';
    toggleButton.classList.remove('active');
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.shiftTimer) {
      clearInterval(this.shiftTimer);
      this.shiftTimer = null;
    }
    
    if (this.currentTimeTimer) {
      clearInterval(this.currentTimeTimer);
      this.currentTimeTimer = null;
    }
    
    if (this.gapUpdateTimer) {
      clearInterval(this.gapUpdateTimer);
      this.gapUpdateTimer = null;
    }
    
    // Stop debug time ticker
    this.stopDebugTimeTicker();
    
    // Remove gap overlay if it exists
    this.removeGapOverlay();
    
    // Clear persisted debug state when manually stopping
    localStorage.removeItem('pittRealTimeDebugState');
    
    this.log('Dive into The Pitt stopped');
  }
  
  checkAndUpdatePlayback() {
    if (!this.isActive) {
      this.log('⏸️ Real-time not active, skipping check');
      return;
    }
    
    // Always check for and cancel Max's autoplay when active
    this.cancelMaxAutoplay();
    
    const now = this.debugTime || new Date();
    const shiftStart = new Date(this.shiftStartTime);
    let shiftElapsed = (now - shiftStart) / 1000; // seconds since shift start
    
    // Normalize to 24-hour cycle - at 7:00 AM it should always be start of shift
    shiftElapsed = shiftElapsed % 86400; // 86400 seconds = 24 hours
    if (shiftElapsed < 0) shiftElapsed += 86400; // Handle negative values
    
    this.log('⏰ Real-time check:', {
      currentTime: now.toLocaleTimeString(),
      shiftStart: shiftStart.toLocaleTimeString(),
      shiftElapsed: Math.floor(shiftElapsed),
      shiftElapsedHours: (shiftElapsed / 3600).toFixed(2),
      debugMode: !!this.debugTime
    });
    
    // Check for overnight period (10 PM - 7 AM)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour >= 22 || currentHour < 7) {
      this.log('🌙 In overnight period (10 PM - 7 AM)');
      this.showShiftOverScreen();
      return;
    }
    
    // Handle pre-shift time (6:55 AM - 7:00 AM) - navigate to Episode 1
    if (currentHour === 6 && currentMinute >= 55) {
      this.log('🌅 Pre-shift time (6:55-7:00 AM), navigating to Episode 1');
      const episode1 = getEpisode(1);
      if (episode1) {
        this.removeGapOverlay();
        this.navigateToEpisode(episode1, 0); // Start at beginning of episode
        this.updateStatus(now, episode1, 0, false);
        return;
      }
    }
    
    // Shift runs from 7 AM to 10 PM (15 hours = 54000 seconds)
    if (shiftElapsed < 0) {
      this.log('🕐 Shift hasn\'t started yet, showing countdown');
      this.showCountdown(Math.abs(shiftElapsed));
      this.removeGapOverlay();
      return;
    }
    
    if (shiftElapsed > 54000) { // 15 hours
      this.log('🏁 Shift complete');
      this.showShiftOverScreen();
      return;
    }
    
    // Calculate which episode and timestamp
    const { episode, timestamp, isGap } = this.calculateEpisodePosition(shiftElapsed);
    
    this.log('📺 Episode calculation result:', {
      episode: episode ? `EP${episode.episode}: ${episode.title}` : 'null',
      timestamp: Math.floor(timestamp),
      isGap
    });
    
    if (isGap) {
      this.log('⏳ In gap, showing countdown');
      this.showGapCountdown(episode, timestamp);
      this.showFullScreenGapTimer(episode, timestamp);
    } else {
      this.log('🎬 Should be watching episode, attempting navigation');
      this.removeGapOverlay();
      this.navigateToEpisode(episode, timestamp);
    }
    
    this.updateStatus(now, episode, timestamp, isGap);
  }
  
  calculateEpisodePosition(shiftElapsed) {
    this.log('🧮 calculateEpisodePosition called with shiftElapsed:', shiftElapsed);
    
    // Convert shift elapsed time to which episode hour we're in
    const hoursIntoShift = shiftElapsed / 3600; // hours since 7 AM
    const currentEpisodeNumber = Math.floor(hoursIntoShift) + 1; // episodes 1-15
    const secondsIntoCurrentHour = shiftElapsed % 3600; // seconds into this hour
    
    this.log('🧮 Calculation details:', {
      hoursIntoShift: hoursIntoShift.toFixed(2),
      currentEpisodeNumber,
      secondsIntoCurrentHour
    });
    
    if (currentEpisodeNumber > 15) {
      this.log('🏁 Episode number > 15, shift is over');
      return { episode: null, timestamp: 0, isGap: true };
    }
    
    const episode = getEpisode(currentEpisodeNumber);
    this.log('📺 Retrieved episode:', episode);
    
    if (!episode) {
      this.log('❌ No episode found for number:', currentEpisodeNumber);
      return { episode: null, timestamp: 0, isGap: true };
    }
    
    // Check if we're in a gap (episode ended but hour hasn't)
    const inGap = isInGap(episode, secondsIntoCurrentHour);
    this.log('🕳️ Gap check:', { inGap, secondsIntoCurrentHour, episodeStartFromEnd: episode.episodeStartFromEnd });
    
    if (inGap) {
      const nextEpisode = getEpisode(currentEpisodeNumber + 1);
      const secondsUntilNextHour = 3600 - secondsIntoCurrentHour;
      this.log('⏳ In gap - next episode:', nextEpisode?.episode, 'in', secondsUntilNextHour, 'seconds');
      return {
        episode: nextEpisode,
        timestamp: secondsUntilNextHour, // countdown to next episode
        isGap: true
      };
    }
    
    this.log('🎬 In episode content - should seek to:', secondsIntoCurrentHour, 'seconds');
    // We're in the episode content
    return {
      episode: episode,
      timestamp: secondsIntoCurrentHour, // how far into episode content we should be
      isGap: false
    };
  }
  
  navigateToEpisode(episode, timestamp) {
    if (!episode || !episode.maxUrl) {
      this.log('❌ Cannot navigate: no episode or URL', { episode });
      return;
    }
    
    const currentUrl = window.location.href;
    const targetEpisodeId = episode.maxUrl.split('/')[5]; // Get the episode UUID
    
    this.log('🧭 Navigation check:', {
      currentUrl,
      targetUrl: episode.maxUrl,
      targetEpisodeId,
      currentlyOnTargetEpisode: currentUrl.includes(targetEpisodeId)
    });
    
    // Check if we're on the right episode by comparing URLs
    if (!currentUrl.includes(targetEpisodeId)) {
      this.log(`🚀 Navigating to episode ${episode.episode}: ${episode.title}`);
      
      // Add autostart parameter to continue real-time mode on the new episode
      const targetUrl = episode.maxUrl + '?autostart=true';
      this.log('🔗 Target URL with autostart:', targetUrl);
      
      // Add a small delay to ensure any ads have time to process
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);
      return;
    }
    
    this.log('✅ Already on correct episode, seeking to timestamp');
    // We're on the right episode, seek to the correct time
    this.seekToTimestamp(episode, timestamp);
  }
  
  seekToTimestamp(episode, targetSecondsIntoContent) {
    this.log('🎯 seekToTimestamp called:', { episode: episode.episode, targetSecondsIntoContent });
    
    const videoElement = document.querySelector('[data-testid="VideoElement"]');
    if (!videoElement) {
      this.log('❌ Video element not found');
      return;
    }
    this.log('✅ Video element found:', { currentTime: videoElement.currentTime, duration: videoElement.duration });

    // Check if we're in an ad by looking for ad indicators
    const adIndicators = [
      '[data-testid="ad-countdown"]',
      '[data-testid="ad-overlay"]',
      '.ad-container',
      '[aria-label*="advertisement"]'
    ];
    
    const isInAd = adIndicators.some(selector => document.querySelector(selector));
    if (isInAd) {
      this.log('📺 Ad detected, waiting for ad to complete...');
      // Check again in 5 seconds
      setTimeout(() => this.seekToTimestamp(episode, targetSecondsIntoContent), 5000);
      return;
    }

    // Calculate episode start time using video duration (not scrubber text)
    const episodeStartTime = getEpisodeStartTime(episode, videoElement);
    this.log('⏰ Episode start time calculated:', episodeStartTime);
    
    if (episodeStartTime === null) {
      this.log('❌ Could not calculate episode start time');
      return;
    }

    // Calculate where we should be: episode start + how far into content
    const targetTime = episodeStartTime + targetSecondsIntoContent;
    this.log('🎬 Target seek time:', { episodeStartTime, targetSecondsIntoContent, targetTime });
    
    // Only seek if we're not close to the target time (within 10 seconds)
    const timeDifference = Math.abs(videoElement.currentTime - targetTime);
    this.log('📏 Time difference:', { currentTime: videoElement.currentTime, targetTime, difference: timeDifference });
    
    if (timeDifference > 10) {
      this.log('⏭️ Seeking to:', targetTime);
      videoElement.currentTime = targetTime;
    } else {
      this.log('✅ Already close to target time, no seek needed');
    }

    // Ensure video is playing
    if (videoElement.paused) {
      this.log('▶️ Video was paused, attempting to play');
      videoElement.play().catch(e => this.log('Auto-play blocked:', e));
    } else {
      this.log('▶️ Video is already playing');
    }
  }
  
  showCountdown(secondsUntilStart) {
    const hours = Math.floor(secondsUntilStart / 3600);
    const minutes = Math.floor((secondsUntilStart % 3600) / 60);
    const seconds = Math.floor(secondsUntilStart % 60);
    
    document.getElementById('pitt-current-time').textContent = 
      `Shift starts in: ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  showGapCountdown(nextEpisode, secondsUntilNext) {
    if (!nextEpisode) return;
    
    const minutes = Math.floor(secondsUntilNext / 60);
    const seconds = Math.floor(secondsUntilNext % 60);
    
    document.getElementById('pitt-episode-info').textContent = 
      `Break time - Next: ${nextEpisode.title} in ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  showFullScreenGapTimer(nextEpisode, secondsUntilNext) {
    if (!nextEpisode) return;
    
    const minutes = Math.floor(secondsUntilNext / 60);
    const seconds = Math.floor(secondsUntilNext % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Create or update gap overlay
    if (!this.gapOverlay) {
      this.gapOverlay = document.createElement('div');
      this.gapOverlay.id = 'pitt-gap-overlay';
      this.gapOverlay.innerHTML = `
        <div class="gap-timer-label">The next hour starts in:</div>
        <div class="gap-timer-main">${timeStr}</div>
        <div class="gap-timer-next"> Episode: ${nextEpisode.title}</div>
      `;
      
      document.body.appendChild(this.gapOverlay);
      
      // Start gap timer that updates every second
      this.gapUpdateTimer = setInterval(() => {
        this.updateGapTimer();
      }, 1000);
      
      // Pause the video when entering gap
      const videoElement = document.querySelector('[data-testid="VideoElement"]');
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
        this.log('⏸️ Video paused for break time');
      }
    } else {
      // Update existing overlay
      const timerMain = this.gapOverlay.querySelector('.gap-timer-main');
      const timerNext = this.gapOverlay.querySelector('.gap-timer-next');
      if (timerMain) timerMain.textContent = timeStr;
      if (timerNext) timerNext.textContent = ` Episode: ${nextEpisode.title}`;
    }
  }
  
  updateGapTimer() {
    if (!this.gapOverlay || !this.isActive) return;
    
    // Recalculate the time until next episode
    const now = this.debugTime || new Date();
    const shiftStart = new Date(this.shiftStartTime);
    const shiftElapsed = (now - shiftStart) / 1000;
    
    const { episode, timestamp, isGap } = this.calculateEpisodePosition(shiftElapsed);
    
    if (isGap && episode) {
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      const timerMain = this.gapOverlay.querySelector('.gap-timer-main');
      if (timerMain) {
        timerMain.textContent = timeStr;
      }
    } else {
      // Gap is over, remove overlay
      this.removeGapOverlay();
    }
  }
  
  removeGapOverlay() {
    if (this.gapOverlay) {
      this.gapOverlay.remove();
      this.gapOverlay = null;
    }
    
    if (this.gapUpdateTimer) {
      clearInterval(this.gapUpdateTimer);
      this.gapUpdateTimer = null;
    }
  }
  
  updateCurrentTime() {
    if (!this.isActive) return;
    
    const now = this.debugTime || new Date();
    const timeStr = now.toLocaleTimeString();
    const debugSuffix = this.debugTime ? ' (DEBUG)' : '';
    document.getElementById('pitt-current-time').textContent = `Current Time: ${timeStr}${debugSuffix}`;
  }
  
  showShiftComplete() {
    document.getElementById('pitt-current-time').textContent = 'Shift Complete!';
    document.getElementById('pitt-episode-info').textContent = 'The 15-hour emergency room shift is over.';
  }
  
  showShiftOver() {
    const now = this.debugTime || new Date();
    const timeStr = now.toLocaleTimeString();
    const debugSuffix = this.debugTime ? ' (DEBUG)' : '';
    
    document.getElementById('pitt-current-time').textContent = `Current Time: ${timeStr}${debugSuffix}`;
    document.getElementById('pitt-episode-info').textContent = 'The Pitt shift is over, but they\'ll be right back at it again at 7 AM.';
    
    // Update shift timer to show overnight message
    const timerElement = document.querySelector('#pitt-shift-timer .timer-content');
    if (timerElement) {
      timerElement.textContent = 'Shift is over - back at 7 AM';
    }
  }
  
  showShiftOverScreen() {
    const now = this.debugTime || new Date();
    const timeStr = now.toLocaleTimeString();
    const debugSuffix = this.debugTime ? ' (DEBUG)' : '';
    
    // Update control panel
    document.getElementById('pitt-current-time').textContent = `Current Time: ${timeStr}${debugSuffix}`;
    document.getElementById('pitt-episode-info').textContent = 'The 15-hour emergency room shift is over.';
    
    // Update shift timer
    const timerElement = document.querySelector('#pitt-shift-timer .timer-content');
    if (timerElement) {
      timerElement.textContent = 'SHIFT OVER';
    }
    
    // Show full-screen overlay
    if (!this.gapOverlay) {
      this.gapOverlay = document.createElement('div');
      this.gapOverlay.id = 'pitt-gap-overlay';
      this.gapOverlay.classList.add('shift-over-screen');
      this.gapOverlay.innerHTML = `
        <div class="shift-over-label">This shift is over</div>
        <div class="shift-over-message">But they'll be right back at it again at 7 AM</div>
      `;
      document.body.appendChild(this.gapOverlay);
      
      // Pause the video
      const videoElement = document.querySelector('[data-testid="VideoElement"]');
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
        this.log('⏸️ Video paused - shift is over');
      }
    }
  }
  
  updateStatus(currentTime, episode, timestamp, isGap) {
    const timeStr = currentTime.toLocaleTimeString();
    document.getElementById('pitt-current-time').textContent = `Current Time: ${timeStr}`;
    
    if (!isGap && episode) {
      const episodeText = `Episode ${episode.episode}: ${episode.title}`;
      document.getElementById('pitt-episode-info').textContent = episodeText;
    }
  }
  
  updateShiftTimer() {
    if (!this.shiftStartTime || !this.isActive) return;
    
    const now = this.debugTime || new Date();
    const currentHour = now.getHours();
    
    // Don't show timer during off-hours
    if (currentHour >= 22 || currentHour < 7) {
      return; // Timer will be updated by showShiftOverScreen
    }
    
    let elapsed = Math.max(0, (now - this.shiftStartTime) / 1000);
    
    // Normalize to 24-hour cycle - same as in checkAndUpdatePlayback
    elapsed = elapsed % 86400; // 86400 seconds = 24 hours
    if (elapsed < 0) elapsed += 86400; // Handle negative values
    
    // Cap at 15 hours (54000 seconds)
    const cappedElapsed = Math.min(elapsed, 54000);
    
    const hours = Math.floor(cappedElapsed / 3600);
    const minutes = Math.floor((cappedElapsed % 3600) / 60);
    const seconds = Math.floor(cappedElapsed % 60);
    
    const timerElement = document.querySelector('#pitt-shift-timer .timer-content');
    if (timerElement) {
      if (this.shiftTimerShrunk) {
        // Short format when shrunk - just HH:MM
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        // Long format when expanded - HH:MM:SS with full text
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} into the emergency room shift`;
      }
    }
  }
  
  applyDebugTime() {
    const debugInput = document.getElementById('pitt-debug-time');
    const timeStr = debugInput.value.trim();
    
    if (!timeStr.match(/^\d{1,2}:\d{2}$/)) {
      alert('Please enter time in HH:MM format (e.g., 14:30)');
      return;
    }
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      alert('Please enter a valid time (hours 0-23, minutes 0-59)');
      return;
    }
    
    // Create debug time for today
    this.debugTime = new Date();
    this.debugTime.setHours(hours, minutes, 0, 0);
    
    // Recalculate shift start time based on the new debug time
    // This ensures proper timing when restarting after shift has ended
    this.shiftStartTime = new Date(this.debugTime);
    this.shiftStartTime.setHours(7, 0, 0, 0);
    
    // If debug time is before 7 AM, set to yesterday's 7 AM
    if (this.debugTime.getHours() < 7) {
      this.shiftStartTime.setDate(this.shiftStartTime.getDate() - 1);
      this.log('⏰ Debug time before 7 AM, using yesterday\'s shift start');
    }
    
    this.log('⏰ Shift start time recalculated to:', this.shiftStartTime.toLocaleString());
    
    // Start the debug time ticker to make it advance like a real clock
    this.startDebugTimeTicker();
    
    // Persist debug state
    localStorage.setItem('pittRealTimeDebugState', JSON.stringify({
      debugTime: this.debugTime.toISOString(),
      wasActive: this.isActive
    }));
    
    this.log('🐛 Debug time set to:', this.debugTime.toLocaleString());
    
    // Start real-time if not already active
    if (!this.isActive) {
      this.startRealTime();
    } else {
      // Immediately run a check if real-time is already active
      this.checkAndUpdatePlayback();
    }
  }

  clearDebugTime() {
    this.debugTime = null;
    
    // Only try to clear the input if debug controls are shown
    if (this.showDebugControls) {
      const debugInput = document.getElementById('pitt-debug-time');
      if (debugInput) {
        debugInput.value = '';
      }
    }
    
    // Stop the debug time ticker
    this.stopDebugTimeTicker();
    
    // Clear persisted debug state
    localStorage.removeItem('pittRealTimeDebugState');
    
    this.log('🐛 Debug time cleared');
    
    // Immediately run a check if real-time is active
    if (this.isActive) {
      this.checkAndUpdatePlayback();
    }
  }

  setupUrlChangeDetection() {
    // Listen for URL changes in SPAs
    let lastUrl = location.href;
    
    const urlChangeHandler = () => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        this.log('🔄 URL changed from', lastUrl, 'to', currentUrl);
        lastUrl = currentUrl;
        
        // Small delay to let the page update
        setTimeout(() => {
          if (this.isPittEpisode()) {
            this.detectCurrentEpisode();
            this.log('📺 Current episode updated after navigation:', this.currentEpisode);
          }
        }, 1000);
      }
    };
    
    // Use multiple methods to detect URL changes
    new MutationObserver(urlChangeHandler).observe(document, { subtree: true, childList: true });
    window.addEventListener('popstate', urlChangeHandler);
    
    // Also override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(urlChangeHandler, 100);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(urlChangeHandler, 100);
    };
  }

  startDebugTimeTicker() {
    if (this.debugTimeTimer) {
      clearInterval(this.debugTimeTimer);
    }
    
    // Make debug time tick like a real clock
    this.debugTimeTimer = setInterval(() => {
      if (this.debugTime) {
        this.debugTime.setSeconds(this.debugTime.getSeconds() + 1);
        
        // Update localStorage with the new time
        localStorage.setItem('pittRealTimeDebugState', JSON.stringify({
          debugTime: this.debugTime.toISOString(),
          wasActive: this.isActive
        }));
      }
    }, 1000);
  }

  stopDebugTimeTicker() {
    if (this.debugTimeTimer) {
      clearInterval(this.debugTimeTimer);
      this.debugTimeTimer = null;
    }
  }

  cancelMaxAutoplay() {
    // Look for Max's "Cancel autoplay" button that appears near the end of episodes
    const cancelButton = document.querySelector('button[data-testid="player-ux-up-next-dismiss"][aria-label="Cancel autoplay"]');
    
    if (cancelButton) {
      this.log('🚫 Found Max autoplay button, clicking to cancel auto-advance');
      try {
        cancelButton.click();
        this.log('✅ Successfully cancelled Max autoplay');
      } catch (error) {
        this.log('❌ Error clicking cancel autoplay button:', error);
      }
    }
  }
}

// Initialize when script loads
const pittRealTime = new PittRealTime(); 