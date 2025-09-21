import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import path from 'path';

export interface ConversionOptions {
    inputPath: string;
    outputPath: string;
    quality?: 'high' | 'medium' | 'low';
}

export async function convertVideoForWeb({ inputPath, outputPath, quality = 'medium' }: ConversionOptions): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Quality settings
        const qualitySettings = {
            high: ['-crf', '18', '-preset', 'medium'],
            medium: ['-crf', '23', '-preset', 'fast'],
            low: ['-crf', '28', '-preset', 'veryfast']
        };

        const ffmpegArgs = [
            '-i', inputPath,
            '-c:v', 'libx264',           // Use H.264 for web compatibility
            '-pix_fmt', 'yuv420p',       // Standard 8-bit color format
            '-c:a', 'aac',               // AAC audio codec
            '-b:a', '128k',              // Audio bitrate
            '-movflags', '+faststart',   // Optimize for web streaming
            '-f', 'mp4',                 // MP4 container format
            ...qualitySettings[quality],
            '-y',                        // Overwrite output file
            outputPath
        ];

        console.log(`🎬 Converting video: ${inputPath} -> ${outputPath}`);
        console.log(`📋 FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);

        const ffmpeg = spawn('ffmpeg', ffmpegArgs);

        let stderr = '';

        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString();
            // Log progress
            const progressMatch = stderr.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (progressMatch) {
                console.log(`⏳ Conversion progress: ${progressMatch[1]}`);
            }
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Video conversion completed successfully`);
                resolve(true);
            } else {
                console.error(`❌ Video conversion failed with code ${code}`);
                console.error(`FFmpeg stderr: ${stderr}`);
                reject(new Error(`FFmpeg conversion failed with code ${code}`));
            }
        });

        ffmpeg.on('error', (error) => {
            console.error(`❌ FFmpeg spawn error:`, error);
            reject(error);
        });
    });
}

export async function getWebCompatibleVideoPath(originalPath: string): Promise<string> {
    const dir = path.dirname(originalPath);
    const name = path.basename(originalPath, path.extname(originalPath));
    return path.join(dir, `${name}_web.mp4`);
}

export async function ensureWebCompatibleVideo(originalPath: string): Promise<string> {
    const webPath = await getWebCompatibleVideoPath(originalPath);

    try {
        // Check if web-compatible version already exists and is valid
        const stats = await fs.stat(webPath);
        if (stats.size > 0) {
            console.log(`✅ Web-compatible video already exists: ${webPath} (${Math.round(stats.size / 1024 / 1024 * 100) / 100}MB)`);
            return webPath;
        } else {
            console.log(`⚠️ Web-compatible video exists but is empty, reconverting...`);
            await fs.unlink(webPath); // Remove empty file
        }
    } catch (error) {
        console.log(`🔄 Web-compatible video not found, converting...`);
    }

    // Convert the video
    console.log(`🎬 Converting video to web-compatible format: ${originalPath} -> ${webPath}`);
    await convertVideoForWeb({
        inputPath: originalPath,
        outputPath: webPath,
        quality: 'medium'
    });

    // Verify the conversion was successful
    try {
        const convertedStats = await fs.stat(webPath);
        console.log(`✅ Conversion completed successfully: ${Math.round(convertedStats.size / 1024 / 1024 * 100) / 100}MB`);
        return webPath;
    } catch (error) {
        console.error(`❌ Conversion verification failed:`, error);
        throw new Error(`Video conversion failed: output file not created`);
    }
}

export async function updateCaseWithWebVideo(caseDir: string, originalVideoPath: string, webVideoPath: string): Promise<void> {
    const caseFile = path.join(caseDir, 'case.json');

    try {
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        // Add web video path to case data
        if (caseData.video_path === originalVideoPath) {
            caseData.web_video_path = webVideoPath;
        }
        if (caseData.processed_video_path === originalVideoPath) {
            caseData.processed_web_video_path = webVideoPath;
        }

        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));
        console.log(`📝 Updated case data with web video path: ${webVideoPath}`);
    } catch (error) {
        console.error(`❌ Failed to update case data:`, error);
        // Don't throw - this is not critical for video serving
    }
}
