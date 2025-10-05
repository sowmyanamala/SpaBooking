<?php
// api/verification-packages.php
// Get available verification packages

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
    
    // Get all active verification packages
    $sql = "SELECT * FROM verification_packages WHERE is_active = TRUE ORDER BY provider, price";
    $result = $conn->query($sql);
    
    if ($result === false) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $packages = [];
    while ($row = $result->fetch_assoc()) {
        $packages[] = $row;
    }
    
    // Close connection
    $conn->close();
    
    // Return success response
    echo json_encode([
        'success' => 1,
        'data' => $packages,
        'message' => 'Verification packages loaded successfully'
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Database error in verification-packages.php: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => 0,
        'message' => 'Database error occurred',
        'error' => (isset($_ENV['NODE_ENV']) && $_ENV['NODE_ENV'] === 'development') ? $e->getMessage() : null
    ]);
}
?>
