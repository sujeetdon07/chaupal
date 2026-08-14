#!/usr/bin/env node

/**
 * Fetch YouTube Video Titles and Artist Names
 * Updates songs.js with actual video metadata from YouTube
 * Run: node scripts/fetch-song-titles.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsPath = path.join(__dirname, '../src/data/songs.js');

async function fetchVideoMetadata(videoId) {
  try {
    // Method 1: Try oEmbed API first (most reliable)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedResponse = await fetch(oembedUrl, { timeout: 5000 });
    
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      
      // Parse title to extract song name and artist
      let title = oembedData.title || 'Unknown Title';
      let artist = oembedData.author_name || 'Unknown Artist';
      
      // Clean up title - remove common suffixes
      title = title
        .replace(/\s*\(lyric video\)$/i, '')
        .replace(/\s*\(official video\)$/i, '')
        .replace(/\s*\(audio\)$/i, '')
        .replace(/\s*\(official audio\)$/i, '')
        .replace(/\s*\[.*?\]$/i, '')
        .trim();

      return {
        title: title || 'Unknown Title',
        artist: artist || 'Unknown Artist',
        success: true
      };
    }
  } catch (error) {
    console.error(`  ⚠ oEmbed fetch failed for ${videoId}:`, error.message);
  }

  return {
    title: 'Unknown Title',
    artist: 'Unknown Artist',
    success: false
  };
}

async function updateSongsFile() {
  try {
    // Read current songs.js
    let fileContent = fs.readFileSync(songsPath, 'utf-8');
    
    // Extract video IDs using regex
    const videoIdMatches = fileContent.match(/"youtubeId":\s*"([^"]+)"/g);
    if (!videoIdMatches) {
      console.log('❌ No video IDs found in songs.js');
      return;
    }

    const videoIds = videoIdMatches.map(match => match.match(/"youtubeId":\s*"([^"]+)"/)[1]);
    console.log(`\n🎵 Found ${videoIds.length} songs. Fetching metadata...\n`);

    const updatedSongs = [];
    
    for (let i = 0; i < videoIds.length; i++) {
      const videoId = videoIds[i];
      process.stdout.write(`[${String(i + 1).padStart(2, '0')}/${videoIds.length}] Fetching: ${videoId}... `);
      
      const metadata = await fetchVideoMetadata(videoId);
      updatedSongs.push({
        videoId,
        ...metadata
      });
      
      if (metadata.success) {
        console.log(`✓ "${metadata.title}" by ${metadata.artist}`);
      } else {
        console.log(`⚠ Partial data (will retry on next run)`);
      }
      
      // Rate limiting: 500ms between requests to avoid rate limiting
      if (i < videoIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Generate updated songs array
    const songsArray = updatedSongs.map((song, idx) => ({
      id: idx + 1,
      title: song.title || 'Unknown Title',
      artist: song.artist || 'Unknown Artist',
      youtubeId: song.videoId,
      duration: '--:--',
      mood: 'सुन'
    }));

    // Generate new file content
    const newContent = `/**
 * SONG DATABASE - Auto-generated from YouTube video metadata
 * 
 * To refresh titles, run: node scripts/fetch-song-titles.js
 * 
 * Each song has:
 * - id: unique number
 * - title: song name (fetched from YouTube)
 * - artist: singer/uploader (fetched from YouTube)
 * - youtubeId: YouTube video ID (11 characters)
 * - duration: "--:--" (auto-fills when playing)
 * - mood: vibe/mood tag
 */

export const songs = ${JSON.stringify(songsArray, null, 2)};
`;

    // Write updated songs.js
    fs.writeFileSync(songsPath, newContent, 'utf-8');
    
    console.log(`\n✅ Successfully updated ${songsPath}`);
    console.log(`   ${updatedSongs.length} songs with titles and artists!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateSongsFile();
