<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Allow both PUT and GET requests (GET for testing)
if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'GET'])) {
    http_response_code(405);
    echo json_encode(['success' => 0, 'message' => 'Method not allowed']);
    exit();
}

// Get the request body
$input = json_decode(file_get_contents('php://input'), true);
$therapist_id = $_GET['id'] ?? '';

if (empty($therapist_id) || !is_numeric($therapist_id)) {
    http_response_code(400);
    echo json_encode(['success' => 0, 'message' => 'Invalid therapist ID']);
    exit();
}

$verified = $input['verified'] ?? null;

// For GET requests (testing), use a default value
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $verified = true; // Default to true for testing
} else if (!is_bool($verified)) {
    http_response_code(400);
    echo json_encode(['success' => 0, 'message' => 'Invalid verified status. Must be true or false']);
    exit();
}

// Debug output
error_log("Toggle verification request - ID: $therapist_id, Verified: " . ($verified ? 'true' : 'false'));

// Database configuration
$servername = "localhost";
$username = "msgdbusr";
$password = "t10f73&La";
$dbname = "msgdb";

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Check if verified column exists
    $result = $conn->query("SHOW COLUMNS FROM models LIKE 'verified'");
    if ($result->num_rows === 0) {
        // Add verified column if it doesn't exist
        $conn->query("ALTER TABLE models ADD COLUMN verified TINYINT(1) DEFAULT 0 COMMENT 'Whether the therapist is verified (0 = not verified, 1 = verified)'");
    }
    
    // Check if therapist exists
    $stmt = $conn->prepare("SELECT id, name FROM models WHERE id = ?");
    $stmt->bind_param("i", $therapist_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => 0, 'message' => 'Therapist not found']);
        exit();
    }
    
    $therapist = $result->fetch_assoc();
    
    // Update verification status
    $verified_value = $verified ? 1 : 0;
    $stmt = $conn->prepare("UPDATE models SET verified = ? WHERE id = ?");
    $stmt->bind_param("ii", $verified_value, $therapist_id);
    
    if ($stmt->execute()) {
        // Verify the update was successful
        $checkStmt = $conn->prepare("SELECT id, name, verified FROM models WHERE id = ?");
        $checkStmt->bind_param("i", $therapist_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $updatedTherapist = $result->fetch_assoc();
        
        echo json_encode([
            'success' => 1,
            'data' => [
                'verified' => $verified,
                'updated_therapist' => $updatedTherapist
            ],
            'message' => "Therapist " . ($verified ? "verified" : "unverified") . " successfully"
        ]);
    } else {
        throw new Exception("Update failed: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => 0,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
