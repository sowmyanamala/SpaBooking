<?php
// api/verification-status.php
// Get verification status for therapists

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => 0,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Get query parameters
$therapist_id = isset($_GET['therapist_id']) ? (int)$_GET['therapist_id'] : null;
$verification_id = isset($_GET['verification_id']) ? (int)$_GET['verification_id'] : null;

// Validate that at least one parameter is provided
if (!$therapist_id && !$verification_id) {
    http_response_code(400);
    echo json_encode([
        'success' => 0,
        'message' => 'Either therapist_id or verification_id is required'
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
    
    // Build WHERE clause based on provided parameters
    $where_clause = '';
    $params = [];
    
    if ($verification_id) {
        $where_clause = 'WHERE v.id = ?';
        $params[] = $verification_id;
    } else if ($therapist_id) {
        $where_clause = 'WHERE v.therapist_id = ?';
        $params[] = $therapist_id;
    }
    
    // Query to get verification records with package details
    $sql = "SELECT 
        v.*,
        p.package_name,
        p.description as package_description
    FROM therapist_verifications v
    LEFT JOIN verification_packages p ON v.verification_package = p.package_id AND v.verification_provider = p.provider
    $where_clause
    ORDER BY v.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param('i', ...$params);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Query failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $verifications = [];
    
    while ($row = $result->fetch_assoc()) {
        $verifications[] = $row;
    }
    
    // Close connection
    $conn->close();
    
    // Return success response
    echo json_encode([
        'success' => 1,
        'data' => $verifications,
        'message' => 'Verification status retrieved successfully'
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Database error in verification-status.php: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => 0,
        'message' => 'Database error occurred',
        'error' => (isset($_ENV['NODE_ENV']) && $_ENV['NODE_ENV'] === 'development') ? $e->getMessage() : null
    ]);
}
?>
