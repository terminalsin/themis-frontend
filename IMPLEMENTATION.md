# Themis Frontend Implementation

## Overview
A multi-step video analysis pipeline for accident case evaluation using Next.js, React, and Temporal workflows.

## Features Implemented

### 1. Video Upload & Case Creation
- **Start Case Button**: Appears when video is selected
- **File Upload**: Supports MP4, MOV, AVI formats
- **Case Management**: Each case gets unique ID and workspace directory

### 2. Multi-Step Analysis Pipeline
- **Processing**: Video upload and preparation
- **Analysis**: AI content analysis (mocked)
- **Timeline Analysis**: Duration-based analysis (mocked)
- **Resolution**: Determines if user has a case

### 3. Custom Video Player
- **Timeline Annotations**: Shows descriptions at specific timestamps
- **Interactive Navigation**: Click timestamps to jump to moments
- **Progress Control**: Seek through video with slider
- **Current Annotation Display**: Shows relevant description overlay

### 4. Case Resolution Flow

#### Has Case Path:
1. Shows "Generate My Case" button
2. Photo upload for user and other party
3. Document generation workflow
4. PDF case document download
5. Celebration meme generation

#### No Case Path:
1. Shows "Generate Sobs" button
2. Single photo upload
3. Funny meme generation

### 5. State Management
- **React Query**: Data fetching and caching
- **Zod Validation**: Type-safe schemas
- **Service Pattern**: Clean API abstraction
- **Local Storage**: Case data persistence in `/workspace/<id>/`

## API Routes

- `POST /api/cases` - Create new case
- `GET /api/cases/[caseId]` - Get case data
- `POST /api/cases/[caseId]/upload` - Upload video
- `POST /api/cases/[caseId]/analyze` - Start analysis
- `POST /api/cases/[caseId]/photo` - Upload photos
- `POST /api/cases/[caseId]/document` - Generate document
- `POST /api/cases/[caseId]/meme` - Generate meme
- `GET /api/cases/[caseId]/video` - Serve video file
- `GET /api/cases/[caseId]/document` - Download document
- `GET /api/cases/[caseId]/meme` - Serve meme image

## File Structure

```
/workspace/<caseId>/
  ├── case.json           # Case metadata and analysis
  ├── video.mp4           # Uploaded video
  ├── user_photo.jpg      # User photo
  ├── other_party_photo.jpg # Other party photo
  ├── case_document.html  # Generated case document
  └── celebration_meme.svg # Generated meme
```

## Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: HeroUI components, Tailwind CSS
- **State**: TanStack Query, Zod validation
- **Backend**: Next.js API routes
- **File Storage**: Local filesystem
- **Workflows**: Temporal (placeholder implementation)

## Mock Data Example

The system uses realistic mock data for analysis:

```json
{
  "timeline": [
    {
      "timestamp": "00:00",
      "description": "Vehicle traveling in middle lane..."
    }
  ],
  "parties": [
    { "party": "self", "at_fault": false },
    { "party": "other", "at_fault": true }
  ],
  "resolution": "other-at-fault",
  "resolution_details": "Other vehicle initiated unsafe lane change..."
}
```

## Next Steps for Production

1. **Temporal Integration**: Replace mock workflows with actual Temporal workers
2. **AI Integration**: Connect to real video analysis services
3. **Authentication**: Add user accounts and session management
4. **Database**: Replace file storage with proper database
5. **Cloud Storage**: Use S3/similar for video and document storage
6. **PDF Generation**: Replace HTML with proper PDF generation
7. **Testing**: Add comprehensive test suite
8. **Deployment**: Configure for production deployment

## Running the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the application.
