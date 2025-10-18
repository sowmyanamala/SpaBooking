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

try {
    $therapist_id = $_GET['therapist_id'] ?? '';
    
    if (empty($therapist_id)) {
        throw new Exception("Missing therapist_id parameter");
    }
    
    // Check if therapist_verifications table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'therapist_verifications'");
    
    if ($tableCheck->num_rows === 0) {
        // Table doesn't exist yet - return no verification found
        echo json_encode([
            'success' => false,
            'message' => 'Verification system not yet set up. Please run database schema.'
        ]);
        exit;
    }
    
    // Get verification status for therapist (compatible with existing table structure)
    $sql = "SELECT 
                tv.id,
                tv.therapist_id,
                tv.provider_candidate_id as candidate_id,
                tv.provider_report_id as report_id,
                tv.verification_package as package,
                tv.status,
                tv.created_at,
                tv.updated_at,
                tv.completed_at,
                m.name as therapist_name
            FROM therapist_verifications tv
            LEFT JOIN models m ON tv.therapist_id = m.id
            WHERE tv.therapist_id = ? AND tv.verification_provider = 'checkr'
            ORDER BY tv.created_at DESC
            LIMIT 1";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $therapist_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'No verification found for this therapist'
        ]);
        exit;
    }
    
    $verification = $result->fetch_assoc();
    
    // Convert timestamps to readable format
    $verification['created_at'] = $verification['created_at'] ?? null;
    $verification['updated_at'] = $verification['updated_at'] ?? null;
    $verification['completed_at'] = $verification['completed_at'] ?? null;
    
    echo json_encode([
        'success' => true,
        'data' => $verification
    ]);
    
} catch (Exception $e) {
    error_log("Error fetching verification status: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
