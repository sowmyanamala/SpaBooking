<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require('dbconn.php');

// Get environment variables
$checkr_webhook_secret = $_ENV['CHECKR_WEBHOOK_SECRET'] ?? getenv('CHECKR_WEBHOOK_SECRET') ?? 'your_webhook_secret_here';

try {
    // Get the raw POST body
    $payload = file_get_contents('php://input');
    
    // Verify webhook signature (if you have one set up)
    $signature = $_SERVER['HTTP_X_CHECKR_SIGNATURE'] ?? '';
    if (!verifyWebhookSignature($payload, $signature, $checkr_webhook_secret)) {
        throw new Exception("Invalid webhook signature");
    }
    
    $data = json_decode($payload, true);
    
    if (!$data) {
        throw new Exception("Invalid JSON payload");
    }
    
    // Log the webhook for debugging
    error_log("Checkr webhook received: " . json_encode($data));
    
    // Handle different webhook types
    $type = $data['type'] ?? '';
    
    switch ($type) {
        case 'invitation.completed':
            handleInvitationCompleted($conn, $data);
            break;
            
        case 'report.updated':
            handleReportUpdated($conn, $data);
            break;
            
        case 'candidate.created':
            handleCandidateCreated($conn, $data);
            break;
            
        default:
            error_log("Unhandled webhook type: $type");
    }
    
    echo json_encode(['status' => 'success']);
    
} catch (Exception $e) {
    error_log("Webhook error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleInvitationCompleted($conn, $data) {
    $invitation_id = $data['data']['id'] ?? '';
    $candidate_id = $data['data']['candidate_id'] ?? '';
    
    if (empty($invitation_id)) {
        throw new Exception("Missing invitation_id in webhook data");
    }
    
    // Update verification status
    $sql = "UPDATE therapist_verifications 
            SET status = 'completed', 
                completed_at = NOW(),
                updated_at = NOW()
            WHERE invitation_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $invitation_id);
    $stmt->execute();
    
    error_log("Invitation completed: $invitation_id");
}

function handleReportUpdated($conn, $data) {
    $report_id = $data['data']['id'] ?? '';
    $status = $data['data']['status'] ?? '';
    $candidate_id = $data['data']['candidate_id'] ?? '';
    
    if (empty($report_id) || empty($candidate_id)) {
        throw new Exception("Missing report_id or candidate_id in webhook data");
    }
    
    // Map Checkr status to our status
    $our_status = mapCheckrStatus($status);
    
    // Update verification status
    $sql = "UPDATE therapist_verifications 
            SET status = ?, 
                report_id = ?,
                updated_at = NOW()
            WHERE candidate_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $our_status, $report_id, $candidate_id);
    $stmt->execute();
    
    // If verification is approved, update the models table to mark therapist as verified
    if ($our_status === 'approved') {
        $update_models_sql = "UPDATE models 
                             SET verified = 1, 
                                 updated_at = NOW()
                             WHERE id = (
                                 SELECT therapist_id 
                                 FROM therapist_verifications 
                                 WHERE candidate_id = ?
                             )";
        
        $update_stmt = $conn->prepare($update_models_sql);
        $update_stmt->bind_param("s", $candidate_id);
        $update_stmt->execute();
        
        error_log("Therapist marked as verified for candidate: $candidate_id");
    }
    
    error_log("Report updated: $report_id, status: $status -> $our_status");
}

function handleCandidateCreated($conn, $data) {
    $candidate_id = $data['data']['id'] ?? '';
    $email = $data['data']['email'] ?? '';
    
    error_log("Candidate created: $candidate_id, email: $email");
    // Could store additional candidate info if needed
}

function mapCheckrStatus($checkr_status) {
    $status_map = [
        'pending' => 'pending',
        'in_progress' => 'in_progress',
        'complete' => 'approved',
        'consider' => 'needs_review',
        'clear' => 'approved',
        'suspended' => 'suspended',
        'canceled' => 'cancelled'
    ];
    
    return $status_map[$checkr_status] ?? 'pending';
}

function verifyWebhookSignature($payload, $signature, $secret) {
    if (empty($signature) || empty($secret)) {
        // If no signature verification is set up, skip verification
        return true;
    }
    
    $expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($expected_signature, $signature);
}
?>
