// Episode data for Dive into The Pitt extension
// Using "distance from end" to handle variable trailers/openings

const EPISODE_DATA = {
  episodes: [
    {
      episode: 1,
      title: "7:00 A.M.",
      maxUrl: "https://play.max.com/video/watch/e4b915fb-5e6b-42b8-97ac-90ec7d0e3147/00d49d4e-4f14-4b27-8c50-b01949609544",
      episodeStartFromEnd: 3284, // 54:44 from end
    },
    
    {
      episode: 2,
      title: "8:00 A.M.",
      maxUrl: "https://play.max.com/video/watch/e0c50a05-ba76-4599-875f-f5bdc7bdcc8c/0bb030e8-163a-4012-ae1a-89d9d2c5755e",
      episodeStartFromEnd: 3058, // 50:58 from end
    },
    
    {
      episode: 3,
      title: "9:00 A.M.",
      maxUrl: "https://play.max.com/video/watch/629e211d-f07b-4215-9113-2437cabbbf51/b16ebbaa-90b0-45c8-bd71-c34262c6b5a7",
      episodeStartFromEnd: 3055, // 50:55 from end
    },
    
    {
      episode: 4,
      title: "10:00 A.M.",
      maxUrl: "https://play.max.com/video/watch/3dec2a03-3f4a-4949-ad99-b056b665fbb6/df6fd944-9a47-43ae-a44d-3e7d75dfffdf",
      episodeStartFromEnd: 3031, // 50:31 from end
    },
    
    {
      episode: 5,
      title: "11:00 A.M.",
      maxUrl: "https://play.max.com/video/watch/4b9b46c8-73b5-4e1d-9c1b-5b63e4412f38/2bf2bd6f-b828-45fe-b317-3b13fdb96718",
      episodeStartFromEnd: 2887, // 48:07 from end
    },
    
    {
      episode: 6,
      title: "12:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/a1778c3f-da62-4131-9bcf-906b4796d62d/09222442-381c-4b73-a6e5-286f56a589b2",
      episodeStartFromEnd: 2827, // 47:07 from end
    },
    
    {
      episode: 7,
      title: "1:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/7da3fa49-f478-46f2-ac52-576c8433a39e/e263bd7e-caf2-472e-af45-550955589dea",
      episodeStartFromEnd: 2792, // 46:32 from end
    },
    
    {
      episode: 8,
      title: "2:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/27937357-1480-4a8e-9f78-ee43b906bab7/191f5be6-0c91-42bd-9a3b-bd987c44aee6",
      episodeStartFromEnd: 2902, // 48:22 from end
    },
    
    {
      episode: 9,
      title: "3:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/9f655072-6878-4a74-aff0-6c5fbadb84c3/d94c34dc-6bae-4f42-af10-0821cdf8d512",
      episodeStartFromEnd: 2733, // 45:33 from end
    },
    
    {
      episode: 10,
      title: "4:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/c37caa1f-37fb-4763-abef-b111eaa4b24c/d562cdb4-a7ec-403c-8d89-c40e23d9fc25",
      episodeStartFromEnd: 2998, // 49:58 from end
    },
    
    {
      episode: 11,
      title: "5:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/dcd766ed-f500-4790-b9c5-7b0387833dd3/9048e8df-15fe-40df-a799-66f16d4e2509",
      episodeStartFromEnd: 2956, // 49:16 from end
    },
    
    {
      episode: 12,
      title: "6:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/a476b216-d42d-4fdd-99f4-6fd2d9b1b55b/f25ebd06-4884-446b-b24d-671b7ed24e55",
      episodeStartFromEnd: 2442, // 40:42 from end
    },
    
    {
      episode: 13,
      title: "7:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/d5d58017-c7a1-478c-b7eb-f7cee4b9b9e9/4662e917-98c8-44c2-9f12-58a077cb7fb2",
      episodeStartFromEnd: 2642, // 44:02 from end
    },
    
    {
      episode: 14,
      title: "8:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/09b21541-0b5d-4709-90ce-961b17250d32/cad53400-f167-4af2-9439-e40d821c8f84",
      episodeStartFromEnd: 2706, // 45:06 from end
    },
    
    {
      episode: 15,
      title: "9:00 P.M.",
      maxUrl: "https://play.max.com/video/watch/9823e802-6d0d-468d-931d-135754bde581/925008ab-acfe-4bbe-a2fc-e085732db090",
      episodeStartFromEnd: 3599, // 59:59 from end (full hour episode)
    }
  ]
};

// Parse Max scrubber timestamp (e.g., "-54:12" or "-1:23:45")
function parseTimeFromEnd(scrubberText) {
  if (!scrubberText || !scrubberText.startsWith('-')) return null;
  
  const timeStr = scrubberText.substring(1); // Remove the '-'
  const parts = timeStr.split(':').reverse(); // [seconds, minutes, hours?]
  
  let totalSeconds = 0;
  if (parts[0]) totalSeconds += parseInt(parts[0]); // seconds
  if (parts[1]) totalSeconds += parseInt(parts[1]) * 60; // minutes
  if (parts[2]) totalSeconds += parseInt(parts[2]) * 3600; // hours
  
  return totalSeconds;
}

// Calculate where episode content starts from beginning of video
function getEpisodeStartTime(episode, videoElement) {
  if (!episode.episodeStartFromEnd || !videoElement || !videoElement.duration) return null;
  
  // Calculate absolute episode start time using total video duration
  const totalDuration = videoElement.duration;
  const episodeStartFromBeginning = totalDuration - episode.episodeStartFromEnd;
  
  // console.log('📊 Episode start calculation:', {
  //   totalDuration,
  //   episodeStartFromEnd: episode.episodeStartFromEnd,
  //   episodeStartFromBeginning: Math.max(0, episodeStartFromBeginning)
  // });
  
  return Math.max(0, episodeStartFromBeginning);
}

// Calculate where we should be in the episode based on real time
function calculateTargetPosition(episode, currentRealTime) {
  if (!episode.episodeStartFromEnd) return null;
  
  const shiftStartHour = 7; // 7 AM
  const episodeHour = shiftStartHour + (episode.episode - 1);
  
  // Create target time for when this episode's "hour" started
  const today = new Date(currentRealTime);
  const episodeStartTime = new Date(today);
  episodeStartTime.setHours(episodeHour, 0, 0, 0);
  
  // If current time is before episode hour, we're not ready yet
  if (currentRealTime < episodeStartTime) return null;
  
  // Calculate how many seconds into the episode's "hour" we are
  const secondsIntoEpisodeHour = (currentRealTime - episodeStartTime) / 1000;
  
  // We want to be this many seconds into the actual episode content
  return secondsIntoEpisodeHour;
}

// Get episode by number
function getEpisode(episodeNumber) {
  return EPISODE_DATA.episodes.find(ep => ep.episode === episodeNumber);
}

// Get episode by URL
function getEpisodeByUrl(currentUrl) {
  return EPISODE_DATA.episodes.find(ep => 
    ep.maxUrl && currentUrl.includes(ep.maxUrl)
  );
}

// Check if we're in a gap between episodes (episode ended but hour hasn't)
function isInGap(episode, secondsIntoHour) {
  if (!episode.episodeStartFromEnd) return false;
  
  // Assume credits are about 2:30 from end, plus an extra 5 seconds buffer
  // to let credits and music finish before showing "next hour starts"
  const creditsBuffer = 130; // 2:35 in seconds (was 150, added 5 for music/credits)
  const episodeContentDuration = episode.episodeStartFromEnd - creditsBuffer;
  
  return secondsIntoHour > episodeContentDuration;
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    EPISODE_DATA, 
    parseTimeFromEnd, 
    getEpisodeStartTime, 
    calculateTargetPosition,
    getEpisode, 
    getEpisodeByUrl,
    isInGap
  };
} 