/**
 * Temporal Video Tracking Implementation
 * 
 * This module provides a complete Temporal workflow implementation for video tracking
 * and collision detection, similar to the Python implementation provided.
 */

// Export types
export * from '../types/temporal';

// Export workflow
export { videoTrackingWorkflow } from './workflows/video-tracking-workflow';

// Export activities
export * from './activities/video-processing-activities';

// Export client
export {
    VideoTrackingClient,
    runVideoTrackingWorkflow,
    createDemoModeRequest,
    createStandardModeRequest,
} from './client/video-tracking-client';

// Export worker
export {
    createVideoTrackingWorker,
    startVideoTrackingWorker,
} from './worker/video-tracking-worker';

// Re-export Temporal constants
export { TEMPORAL_CONSTANTS } from '../types/temporal';
