import { z } from 'zod';

export const TimelineItemSchema = z.object({
    timestamp: z.string(),
    description: z.string(),
});

export const PartySchema = z.object({
    party: z.enum(['self', 'other']),
    at_fault: z.boolean(),
});

export const VideoAnalysisSchema = z.object({
    timeline: z.array(TimelineItemSchema),
    parties: z.array(PartySchema),
    resolution: z.enum(['self-at-fault', 'other-at-fault', 'no-fault', 'unclear']),
    resolution_details: z.string(),
});

export const CaseStepSchema = z.enum([
    'upload',
    'processing',
    'processed',
    'analysis',
    'timeline_analysis',
    'resolution',
    'document_generation',
    'completed'
]);

export const CaseSchema = z.object({
    id: z.string(),
    step: CaseStepSchema,
    video_path: z.string().optional(),
    processed_video_path: z.string().optional(),
    temporal_output_path: z.string().optional(),
    processing_summary: z.record(z.any()).optional(),
    analysis: VideoAnalysisSchema.optional(),
    has_case: z.boolean().optional(),
    user_photo: z.string().optional(),
    other_party_photo: z.string().optional(),
    document_path: z.string().optional(),
    meme_path: z.string().optional(),
    processing_completed_at: z.date().optional(),
    processing_error: z.string().optional(),
    created_at: z.date(),
    updated_at: z.date(),
});

export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type Party = z.infer<typeof PartySchema>;
export type VideoAnalysis = z.infer<typeof VideoAnalysisSchema>;
export type CaseStep = z.infer<typeof CaseStepSchema>;
export type Case = z.infer<typeof CaseSchema>;
