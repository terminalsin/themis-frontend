import { z } from 'zod';

// Video Processing Request Schema - matches Python worker interface
export const VideoProcessingRequestSchema = z.object({
    input_video: z.string(),
    output_video: z.string().optional(),
    model_path: z.string().default('yolo11n.pt'),
    confidence_threshold: z.number().default(0.4),
    collision_distance_threshold: z.number().default(45.0),
    overlap_threshold: z.number().default(0.12),
    display_realtime: z.boolean().default(false),
});

// Video Processing Result Schema - matches Python worker interface
export const VideoProcessingResultSchema = z.object({
    success: z.boolean(),
    output_file: z.string(),
    processing_summary: z.record(z.any()),
    error_message: z.string().optional(),
});

// Validation Result Schema
export const ValidationResultSchema = z.object({
    valid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()).optional(),
});

// Processing Summary Schema - matches Python worker interface
export const ProcessingSummarySchema = z.object({
    total_frames: z.number().optional(),
    processing_time: z.string().optional(),
    average_fps: z.number().optional(),
    unique_vehicles_detected: z.number().optional(),
    total_collision_events: z.number().optional(),
    collision_details: z.array(z.object({
        timestamp: z.string(),
        vehicles: z.array(z.string()),
        severity: z.enum(['low', 'medium', 'high']),
        description: z.string(),
    })).optional(),
});

// Type exports
export type VideoProcessingRequest = z.infer<typeof VideoProcessingRequestSchema>;
export type VideoProcessingResult = z.infer<typeof VideoProcessingResultSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type ProcessingSummary = z.infer<typeof ProcessingSummarySchema>;

// Note: No TypeScript activities needed - we call Python workflows directly

// Workflow execution options
export interface WorkflowExecutionOptions {
    taskQueue: string;
    workflowId: string;
    startToCloseTimeout?: string;
    scheduleToCloseTimeout?: string;
}

// Constants - matches Python worker interface
export const TEMPORAL_CONSTANTS = {
    TASK_QUEUE: 'vehicle-tracking',
    PROCESSING_TIMEOUT_MINUTES: 30,
    DEFAULT_MODEL_PATH: 'yolo11n.pt',
    DEMO_MODE_SETTINGS: {
        confidence_threshold: 0.25,
        collision_distance_threshold: 60.0,
        overlap_threshold: 0.08,
    },
    STANDARD_MODE_SETTINGS: {
        confidence_threshold: 0.4,
        collision_distance_threshold: 45.0,
        overlap_threshold: 0.12,
    },
} as const;
