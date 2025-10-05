<?php
// api/verification-webhook.php
// Handle webhook events from background check providers

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => 0,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Get headers and body
$provider = $_SERVER['HTTP_X_PROVIDER'] ?? 'unknown';
$signature = $_SERVER['HTTP_X_SIGNATURE'] ?? $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_TIMESTAMP'] ?? '';

$body = file_get_contents('php://input');
$event = json_decode($body, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => 0,
        'message' => 'Invalid JSON payload'
    ]);
    exit();
}

// Database configuration
$servername = "localhost";
$username = "msgdbusr";
$password = "t1.....La"; // Update with your actual password
$dbname = "msgdb";

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Store webhook event for audit trail
    $stmt = $conn->prepare("INSERT INTO verification_webhooks (
        provider, event_type, event_data, signature_header, is_verified
    ) VALUES (?, ?, ?, ?, ?)");
    
    $event_type = $event['type'] ?? 'unknown';
    $event_data_json = json_encode($event);
    $is_verified = false; // Will be verified later
    
    $stmt->bind_param("ssssi", $provider, $event_type, $event_data_json, $signature, $is_verified);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to store webhook event: " . $stmt->error);
    }
    
    $webhook_id = $conn->insert_id;
    
    // Verify webhook signature based on provider
    $isValidSignature = verifyWebhookSignature($provider, $body, $signature);
    
    // Update webhook verification status
    $update_stmt = $conn->prepare("UPDATE verification_webhooks SET is_verified = ? WHERE id = ?");
    $update_stmt->bind_param("ii", $isValidSignature, $webhook_id);
    $update_stmt->execute();
    
    if (!$isValidSignature) {
        error_log("Invalid webhook signature from $provider");
        http_response_code(400);
        echo json_encode([
            'success' => 0,
            'message' => 'Invalid signature'
        ]);
        exit();
    }
    
    // Process webhook based on provider and event type
    processWebhookEvent($conn, $provider, $event);
    
    // Return success response
    echo json_encode([
        'success' => 1,
        'message' => 'Webhook processed'
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Webhook processing error in verification-webhook.php: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => 0,
        'message' => 'Webhook processing failed',
        'error' => (isset($_ENV['NODE_ENV']) && $_ENV['NODE_ENV'] === 'development') ? $e->getMessage() : null
    ]);
}

function verifyWebhookSignature($provider, $payload, $signature) {
    $secret = null;
    
    switch ($provider) {
        case 'checkr':
            $secret = $_ENV['CHECKR_WEBHOOK_SECRET'] ?? null;
            break;
        case 'sterling':
            $secret = $_ENV['STERLING_WEBHOOK_SECRET'] ?? null;
            break;
        case 'truora':
            $secret = $_ENV['TRUORA_WEBHOOK_SECRET'] ?? null;
            break;
        default:
            return false;
    }
    
    if (!$secret) {
        return false;
    }
    
    try {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($signature, $expectedSignature);
    } catch (Exception $e) {
        error_log("Signature verification error for $provider: " . $e->getMessage());
        return false;
    }
}

function processWebhookEvent($conn, $provider, $event) {
    try {
        $eventType = $event['type'];
        $eventData = $event['data'] ?? $event;
        
        error_log("Processing $provider webhook: $eventType");
        
        switch ($eventType) {
            case 'report.completed':
            case 'report.complete':
                handleReportCompleted($conn, $provider, $eventData);
                break;
                
            case 'report.pending':
            case 'report.in_progress':
                handleReportPending($conn, $provider, $eventData);
                break;
                
            case 'report.failed':
            case 'report.error':
                handleReportFailed($conn, $provider, $eventData);
                break;
                
            case 'candidate.created':
                handleCandidateCreated($conn, $provider, $eventData);
                break;
                
            default:
                error_log("Unhandled webhook event type: $eventType");
        }
    } catch (Exception $e) {
        error_log("Webhook event processing error: " . $e->getMessage());
        throw $e;
    }
}

function handleReportCompleted($conn, $provider, $eventData) {
    $reportId = $eventData['id'] ?? $eventData['report_id'];
    $status = $eventData['status'] ?? 'completed';
    $adjudication = $eventData['adjudication'] ?? 'clear';
    $responseData = json_encode($eventData);
    
    $stmt = $conn->prepare("UPDATE therapist_verifications 
        SET status = ?, adjudication = ?, completed_at = NOW(), provider_response = ?
        WHERE provider_report_id = ? AND verification_provider = ?");
    
    $stmt->bind_param("sssss", $status, $adjudication, $responseData, $reportId, $provider);
    $stmt->execute();
    
    error_log("Report completed for $provider report $reportId: $adjudication");
}

function handleReportPending($conn, $provider, $eventData) {
    $reportId = $eventData['id'] ?? $eventData['report_id'];
    $status = $eventData['status'] ?? 'pending';
    $responseData = json_encode($eventData);
    
    $stmt = $conn->prepare("UPDATE therapist_verifications 
        SET status = ?, provider_response = ?
        WHERE provider_report_id = ? AND verification_provider = ?");
    
    $stmt->bind_param("ssss", $status, $responseData, $reportId, $provider);
    $stmt->execute();
    
    error_log("Report status updated to $status for $provider report $reportId");
}

function handleReportFailed($conn, $provider, $eventData) {
    $reportId = $eventData['id'] ?? $eventData['report_id'];
    $responseData = json_encode($eventData);
    
    $stmt = $conn->prepare("UPDATE therapist_verifications 
        SET status = 'failed', provider_response = ?
        WHERE provider_report_id = ? AND verification_provider = ?");
    
    $stmt->bind_param("sss", $responseData, $reportId, $provider);
    $stmt->execute();
    
    error_log("Report failed for $provider report $reportId");
}

function handleCandidateCreated($conn, $provider, $eventData) {
    $candidateId = $eventData['id'] ?? $eventData['candidate_id'];
    $reportId = $eventData['report_id'];
    $responseData = json_encode($eventData);
    
    if ($reportId) {
        $stmt = $conn->prepare("UPDATE therapist_verifications 
            SET provider_candidate_id = ?, provider_response = ?
            WHERE provider_report_id = ? AND verification_provider = ?");
        
        $stmt->bind_param("ssss", $candidateId, $responseData, $reportId, $provider);
        $stmt->execute();
        
        error_log("Candidate $candidateId created for $provider report $reportId");
    }
}
?>
