# Temporal Video Tracking Implementation (Python Worker Client)

This directory contains a Temporal workflow implementation that delegates video tracking and collision detection to Python workers via Temporal.

## 🏗️ Architecture

The implementation follows Temporal best practices as a client that calls Python workers:

```
temporal/
├── workflows/           # Workflow definitions (delegates to Python)
├── activities/          # Activity implementations (calls Python worker)
├── client/             # Client for executing workflows
├── worker/             # Worker configuration
├── cli/                # Command-line interface
└── index.ts            # Main exports
```

## 🚀 Quick Start

### 1. Start Temporal Server

```bash
# Install Temporal CLI if not already installed
# https://docs.temporal.io/cli#install

# Start Temporal development server
temporal server start-dev
```

### 2. Start Python Worker

Make sure your Python worker is running and registered with Temporal on the `vehicle-tracking` task queue.

### 3. Start the TypeScript Worker

```bash
# In a separate terminal
npm run temporal:worker
```

### 4. Run Video Tracking

```bash
# Process a video with standard settings
npm run temporal:track my-video.mp4

# Process with demo mode (more sensitive collision detection)
npm run temporal:track -- --demo my-video.mp4

# See all options
npm run temporal:track -- --help
```

### 5. Development Mode

```bash
# Run both worker and Next.js dev server
npm run temporal:dev
```

## 📋 Components

### Workflows

**`videoTrackingWorkflow`** - Main workflow that delegates to Python worker:
- Calls Python worker via Temporal
- Monitors execution status
- Returns results from Python worker

### Activities

**`executeVideoTrackingActivity`** - Calls Python worker via Temporal:
- Connects to Temporal server
- Executes Python workflow
- Returns processing results

### Client

**`VideoTrackingClient`** - High-level client for workflow execution:
- Connection management
- Workflow execution
- Status monitoring
- Error handling

### Worker

**`video-tracking-worker`** - Temporal worker configuration:
- Activity registration
- Timeout configuration
- Retry policies
- Graceful shutdown

## 🎯 Usage Examples

### Basic Usage

```typescript
import { runVideoTrackingWorkflow, createStandardModeRequest } from './temporal';

// Create request (matches Python worker interface)
const request = createStandardModeRequest('video.mp4');

// Execute workflow (delegates to Python worker)
const result = await runVideoTrackingWorkflow(request);

if (result.success) {
  console.log('Processing completed:', result.output_file);
  console.log('Collisions detected:', result.processing_summary.total_collision_events);
}
```

### Advanced Usage with Client

```typescript
import { VideoTrackingClient } from './temporal';

const client = new VideoTrackingClient();
await client.connect();

// Start workflow
const handle = await client.startWorkflow(request);

// Monitor progress
const status = await client.getProcessingStatus(handle.workflowId);
const phase = await client.getCurrentPhase(handle.workflowId);

// Wait for completion
const result = await handle.result();

await client.disconnect();
```

### API Integration

The workflow is automatically integrated with the existing API routes:

```typescript
// app/api/cases/[caseId]/process/route.ts
// Automatically starts Temporal workflow when processing is requested
POST /api/cases/{caseId}/process
```

## ⚙️ Configuration

### Workflow Settings

```typescript
// Standard mode (default)
const request = createStandardModeRequest('video.mp4');
// - Confidence threshold: 0.4
// - Collision distance: 45.0
// - Overlap threshold: 0.12

// Demo mode (more sensitive)
const request = createDemoModeRequest('video.mp4');
// - Confidence threshold: 0.25
// - Collision distance: 60.0
// - Overlap threshold: 0.08
```

### Worker Configuration

```typescript
// temporal/worker/video-tracking-worker.ts
const worker = await createVideoTrackingWorker({
  serverAddress: 'localhost:7233',
  taskQueue: 'vehicle-tracking',
  maxConcurrentActivityTaskExecutions: 5,
  maxConcurrentWorkflowTaskExecutions: 10,
});
```

## 🔧 CLI Options

```bash
npm run temporal:track [options] [input-video]

Options:
  --demo                    Run in DEMO mode with sensitive collision detection
  -i, --input <file>        Input video file (default: demo.mov)
  -o, --output <file>       Output video file (auto-generated if not specified)
  -m, --model <path>        AI model path (default: yolo11n.pt)
  -s, --server <address>    Temporal server address (default: localhost:7233)
  -h, --help                Show help message
```

## 📊 Processing Results

The workflow returns comprehensive processing results from the Python worker:

```typescript
interface VideoProcessingResult {
  success: boolean;
  output_file: string;
  processing_summary: {
    total_frames?: number;
    processing_time?: string;
    average_fps?: number;
    unique_vehicles_detected?: number;
    total_collision_events?: number;
    collision_details?: Array<{
      timestamp: string;
      vehicles: string[];
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  error_message?: string;
}
```

## 🔍 Monitoring

### Workflow Queries

Monitor workflow progress in real-time:

```typescript
// Get current processing status
const status = await client.getProcessingStatus(workflowId);

// Get current phase
const phase = await client.getCurrentPhase(workflowId);
```

### Temporal Web UI

Access the Temporal Web UI at `http://localhost:8233` to monitor:
- Workflow executions
- Activity progress
- Error details
- Performance metrics

## 🚨 Error Handling

The implementation includes comprehensive error handling:

- **Connection Errors**: Temporal server connection issues
- **Python Worker Errors**: Python workflow execution failures
- **Timeout Errors**: Activity and workflow timeouts
- **Retry Logic**: Automatic retries with exponential backoff

## 🔗 Integration Points

### With Python Worker

- Calls Python worker via Temporal `VideoTrackingWorkflow.run`
- Uses `vehicle-tracking` task queue
- Passes request parameters matching Python interface
- Returns results in Python worker format

### With Existing API

- Automatically integrates with `/api/cases/[caseId]/process`
- Updates case files with processing results
- Maintains existing case flow and state management

### With File System

- Processes videos from specified paths
- Updates case metadata with processing results

## 📚 Dependencies

- `@temporalio/workflow` - Workflow definitions
- `@temporalio/activity` - Activity implementations
- `@temporalio/client` - Client SDK
- `@temporalio/worker` - Worker runtime

## 🎯 Prerequisites

1. **Temporal Server**: Running on localhost:7233
2. **Python Worker**: Running and registered with Temporal
3. **Task Queue**: Python worker listening on `vehicle-tracking` queue
4. **Python Workflow**: Implements `VideoTrackingWorkflow.run` method

## 📖 Resources

- [Temporal Documentation](https://docs.temporal.io/)
- [TypeScript SDK Guide](https://docs.temporal.io/typescript)
- [Workflow Patterns](https://docs.temporal.io/workflows)
- [Activity Best Practices](https://docs.temporal.io/activities)