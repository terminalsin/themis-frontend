import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
        const caseFile = path.join(caseDir, 'case.json');

        // Update case step to analysis
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
        caseData.step = 'analysis';
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        // Start Temporal workflow (placeholder for now)
        // TODO: Implement actual Temporal workflow
        setTimeout(async () => {
            try {
                // Generate varied mock analysis results
                const mockAnalysisOptions = [
                    {
                        timeline: [
                            {
                                timestamp: "00:00",
                                description: "The self-driving vehicle (red car, dashcam perspective) is traveling in the middle lane of a multi-lane highway. There are multiple vehicles ahead. Weather conditions appear clear with good visibility."
                            },
                            {
                                timestamp: "00:04",
                                description: "The silver SUV (other car A) in the rightmost lane begins to drift left without signaling, initiating an unsafe lane change into the middle lane where the dashcam vehicle is located."
                            },
                            {
                                timestamp: "00:07",
                                description: "The silver SUV (other car A) completes its unsafe lane change directly into the middle lane, cutting off the dashcam car. A 'Status: COLLISION' alert appears on the dashcam screen, indicating an imminent or actual collision."
                            },
                            {
                                timestamp: "00:08",
                                description: "The dashcam car is now closely behind the silver SUV which is fully in the middle lane. The dashcam car's speed has decreased significantly from approximately 68 MPH to 53 MPH, confirming a braking maneuver."
                            },
                            {
                                timestamp: "00:14",
                                description: "The dashcam car continues to follow the silver SUV at a reduced speed (approximately 49 MPH). The 'Status: COLLISION' warning remains visible, suggesting the system detected a collision or prolonged dangerous proximity."
                            }
                        ],
                        parties: [
                            { party: "self", at_fault: false },
                            { party: "other", at_fault: true }
                        ],
                        resolution: "other-at-fault",
                        resolution_details: "The other vehicle, a silver SUV, initiated an unsafe and abrupt lane change from the rightmost lane into the middle lane without proper signaling, directly cutting off the self-driving vehicle. This action forced the self-driving vehicle to brake sharply, resulting in a detected collision by the dashcam system. The other vehicle is solely responsible for the incident due to failure to execute a safe lane change."
                    },
                    {
                        timeline: [
                            {
                                timestamp: "00:00",
                                description: "The dashcam vehicle is following too closely behind another vehicle in heavy traffic conditions. The following distance appears to be less than the recommended 3-second rule."
                            },
                            {
                                timestamp: "00:03",
                                description: "Traffic ahead begins to slow down suddenly due to congestion. The lead vehicle's brake lights activate."
                            },
                            {
                                timestamp: "00:05",
                                description: "The dashcam vehicle fails to react in time to the sudden braking ahead, resulting in a rear-end collision. Impact occurs at approximately 25 MPH."
                            }
                        ],
                        parties: [
                            { party: "self", at_fault: true },
                            { party: "other", at_fault: false }
                        ],
                        resolution: "self-at-fault",
                        resolution_details: "The dashcam vehicle was following too closely and failed to maintain a safe following distance. When traffic conditions required sudden braking, the driver was unable to stop in time, resulting in a rear-end collision. The dashcam vehicle is at fault for not maintaining proper following distance and failing to react appropriately to changing traffic conditions."
                    }
                ];

                // Randomly select one of the mock analyses for variety
                const randomIndex = Math.floor(Math.random() * mockAnalysisOptions.length);
                const mockAnalysis = mockAnalysisOptions[randomIndex];

                // Update case with analysis
                const updatedCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                updatedCaseData.analysis = mockAnalysis;
                updatedCaseData.step = 'timeline_analysis';
                updatedCaseData.updated_at = new Date().toISOString();

                await fs.writeFile(caseFile, JSON.stringify(updatedCaseData, null, 2));

                // Simulate timeline analysis completion
                setTimeout(async () => {
                    const finalCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                    finalCaseData.step = 'resolution';
                    finalCaseData.has_case = mockAnalysis.resolution === 'other-at-fault';
                    finalCaseData.updated_at = new Date().toISOString();

                    await fs.writeFile(caseFile, JSON.stringify(finalCaseData, null, 2));
                }, 3000);

            } catch (error) {
                console.error('Failed to complete analysis:', error);
            }
        }, 2000);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to start analysis:', error);
        return NextResponse.json(
            { error: 'Failed to start analysis' },
            { status: 500 }
        );
    }
}
