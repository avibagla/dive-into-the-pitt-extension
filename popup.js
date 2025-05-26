// Popup script for Dive into The Pitt extension

document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    
    // Use episode data from episode-data.js
    const episodes = EPISODE_DATA.episodes;
    
    // Check if we're on a Max page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        if (!currentTab.url.includes('play.max.com')) {
            showNotOnMaxPage();
            return;
        }
        
        if (currentTab.url.includes('/video/watch/')) {
            showExtensionContent();
        } else {
            showNavigateToEpisode();
        }
    });
    
    function showNotOnMaxPage() {
        contentDiv.innerHTML = `
            <div class="not-on-max">
                <p>📺 Navigate to a Max video page to use this extension</p>
                <div class="instructions">
                    Go to <strong>play.max.com</strong> and start watching <em>The Pitt</em> to experience the real-time emergency room shift.
                </div>
            </div>
            ${getFooter()}
        `;
    }
    
    function showNavigateToEpisode() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentEpisode = getCurrentEpisodeForTime(currentHour);
        
        if (!currentEpisode) {
            // Outside shift hours (10 PM - 7 AM)
            contentDiv.innerHTML = `
                <div class="status-card">
                    <div class="status-title">Dive into <em>The Pitt</em></div>
                    <div class="current-time">${now.toLocaleTimeString()}</div>
                    <div class="shift-info">The emergency room shift is over</div>
                </div>
                
                <div class="instructions">
                    The 15-hour emergency room shift runs from <strong>7:00 AM to 10:00 PM</strong> daily.
                    <br><br>
                    Come back during shift hours to experience <em>The Pitt</em> in real-time!
                </div>
                
                ${getFooter()}
            `;
            return;
        }
        
        // During shift hours - show go to real-time button
        contentDiv.innerHTML = `
            <div class="status-card">
                <div class="status-title">Dive into <em>The Pitt</em></div>
                <div class="current-time">${now.toLocaleTimeString()}</div>
                <div class="shift-info">
                    Should be watching: <strong>${currentEpisode.title}</strong>
                </div>
            </div>
            
            <div class="instructions">
                Experience The Pitt's emergency room shift in real time, as it happens.
            </div>
            
            <button id="go-realtime-btn" class="realtime-button">
                Dive Into The Pitt
            </button>
            
            <div class="episode-info">
                <div class="current-episode">
                    <strong>Episode ${currentEpisode.episode}:</strong> ${currentEpisode.title}
                </div>
                <div class="episode-time">
                    ${getTimeDescription(currentHour)}
                </div>
            </div>
            
            ${getFooter()}
        `;
        
        // Add click listener for the real-time button
        document.getElementById('go-realtime-btn').addEventListener('click', function() {
            // Check if we're on a video page or need to navigate to one
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                const currentTab = tabs[0];
                
                if (currentTab.url.includes('/video/watch/')) {
                    // We're on a video page, add autostart and reload
                    const currentUrl = new URL(currentTab.url);
                    currentUrl.searchParams.set('autostart', 'true');
                    chrome.tabs.update({url: currentUrl.toString()});
                } else {
                    // We're not on a video page, navigate to the current episode
                    chrome.tabs.update({url: currentEpisode.maxUrl + '?autostart=true'});
                }
                window.close();
            });
        });
    }
    
    function getTimeDescription(hour) {
        const hourIn12 = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hourIn12 === 0 ? 12 : hourIn12;
        
        return `${displayHour}:00 ${ampm} - Hour ${hour - 6} of the emergency room shift`;
    }
    
    function showExtensionContent() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentEpisode = getCurrentEpisodeForTime(currentHour);
        
        if (!currentEpisode) {
            // Outside shift hours (10 PM - 7 AM)
            contentDiv.innerHTML = `
                <div class="status-card">
                    <div class="status-title">Dive into <em>The Pitt</em></div>
                    <div class="current-time">${now.toLocaleTimeString()}</div>
                    <div class="shift-info">The emergency room shift is over</div>
                </div>
                
                <div class="instructions">
                    The 15-hour emergency room shift runs from <strong>7:00 AM to 10:00 PM</strong> daily.
                    <br><br>
                    Come back during shift hours to experience <em>The Pitt</em> when it actually happens.
                </div>
                
                ${getFooter()}
            `;
            return;
        }
        
        // During shift hours - show the real-time button
        contentDiv.innerHTML = `
            <div class="status-card">
                <div class="status-title">Dive into <em>The Pitt</em></div>
                <div class="current-time">${now.toLocaleTimeString()}</div>
                <div class="shift-info">
                    You'll be watching: <strong>${currentEpisode.title}</strong>
                </div>
            </div>
            
            <div class="instructions">
                Truly experience The Pitt's emergency room shift as it happens.
            </div>
            
            <button id="go-realtime-btn" class="realtime-button">
                Dive Into The Pitt
            </button>
            
            <div class="episode-info">
                <div class="current-episode">
                    <strong>Episode ${currentEpisode.episode}:</strong> ${currentEpisode.title}
                </div>
                <div class="episode-time">
                    ${getTimeDescription(currentHour)}
                </div>
            </div>
            
            <div class="instructions">
                <strong>How it works:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Each episode represents one hour (7 AM - 10 PM)</li>
                    <li>Episodes play in real-time with your current time</li>
                    <li>Gaps between episodes show countdown timers to the next one</li>
                    <li>The shift timer shows total time elapsed in the shift</li>
                </ul>
            </div>
            
            ${getFooter()}
        `;
        
        // Add click listener for the real-time button
        document.getElementById('go-realtime-btn').addEventListener('click', function() {
            // Check if we're on a video page or need to navigate to one
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                const currentTab = tabs[0];
                
                if (currentTab.url.includes('/video/watch/')) {
                    // We're on a video page, add autostart and reload
                    const currentUrl = new URL(currentTab.url);
                    currentUrl.searchParams.set('autostart', 'true');
                    chrome.tabs.update({url: currentUrl.toString()});
                } else {
                    // We're not on a video page, navigate to the current episode
                    chrome.tabs.update({url: currentEpisode.maxUrl + '?autostart=true'});
                }
                window.close();
            });
        });
    }
    
    function getCurrentEpisodeForTime(hour) {
        if (hour >= 7 && hour < 22) {
            const episodeIndex = hour - 7;
            return episodes[episodeIndex];
        }
        return null;
    }
    
    function getFooter() {
        return `
            <div class="footer">
                This is an extremely unofficial Extension<br>
                You can experience the emergency room shift as it happens, because I'm a really big fan of this show.<br>
                <br>
                Made by <a href="https://www.avibagla.com" target="_blank" style="color: #00d4ff; text-decoration: none;">Avi Bagla</a>
            </div>
        `;
    }
});