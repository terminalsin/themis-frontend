# Meme Generation with Google Gemini API

This document explains how the meme generation feature works using Google Gemini API to create humorous content by combining ID pictures with the maniac.jpg reference image.

## Overview

The meme generation system takes an ID picture from a case's workspace directory and combines it conceptually with the maniac.jpg image from the public folder using Google Gemini's vision capabilities to generate creative meme descriptions.

## API Endpoints

### POST `/api/cases/[caseId]/meme`

Initiates meme generation for a specific case.

**Requirements:**
- `GEMINI_API_KEY` environment variable must be set
- Case must have a `user_photo.png` file in its workspace directory
- `maniac.jpg` must exist in the `/public` folder

**Process:**
1. Reads the ID picture from `workspace/[caseId]/user_photo.png`
2. Reads the maniac reference image from `public/maniac.jpg`
3. Sends both images to Google Gemini API with a creative prompt
4. Generates an SVG meme containing the AI's response
5. Saves the meme and response to the case data

**Response:**
```json
{
  "success": true
}
```

### GET `/api/cases/[caseId]/meme`

Retrieves the generated meme or Gemini response.

**Default behavior:** Returns the SVG meme
```
Content-Type: image/svg+xml
```

**With `?type=response` query parameter:** Returns JSON with Gemini's response
```json
{
  "gemini_response": "AI-generated meme description",
  "case_status": "HAS CASE",
  "resolution": "settlement"
}
```

## Setup

1. Get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it to your `.env.local` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Ensure the `maniac.jpg` image exists in the `/public` folder
4. Cases with ID pictures should have `user_photo.png` in their workspace directory

## Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- API key validation
- Successful meme generation
- SVG meme retrieval
- Gemini response retrieval
- Error handling for missing files

## File Structure

```
workspace/
  [caseId]/
    user_photo.png    # ID picture for meme generation
    case.json         # Updated with gemini_meme_response
    celebration_meme.svg  # Generated SVG meme

public/
  maniac.jpg          # Reference image for meme creation
```

## AI Prompt

The system uses this prompt with Gemini:

> Look at these two images. The first image is an ID picture of someone involved in a legal case. The second image is a "maniac" reference image.
> 
> Create a humorous meme description that combines these images in a funny way, as if the person from the ID picture should be placed into the maniac picture scenario. Make it witty and appropriate for a legal case context. The meme should be about making the ID picture person appear in the wanted maniac picture style.
> 
> Respond with a creative, funny meme caption or description that would work well for this combination.

## Error Handling

- Missing API key: Returns 500 with error message
- Missing images: Returns descriptive error in meme content
- API failures: Logs error and returns fallback message
- File not found: Returns 404 for GET requests
