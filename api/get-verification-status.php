<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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
    
    // Get verification status for all therapists
    $result = $conn->query("SELECT id, verified FROM models WHERE verified = 1");
    
    $verifiedIds = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $verifiedIds[] = $row['id'];
        }
    }
    
    // Debug: Also get all therapists to see what's in the database
    $allResult = $conn->query("SELECT id, name, verified FROM models ORDER BY id");
    $allTherapists = [];
    if ($allResult->num_rows > 0) {
        while($row = $allResult->fetch_assoc()) {
            $allTherapists[] = $row;
        }
    }
    
    echo json_encode([
        'success' => 1,
        'verified_ids' => $verifiedIds,
        'debug' => [
            'total_therapists' => count($allTherapists),
            'verified_count' => count($verifiedIds),
            'all_therapists' => $allTherapists
        ]
    ]);
    
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
