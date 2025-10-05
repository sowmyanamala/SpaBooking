<?php
// api/verification-checkout.php
// Process background check verification checkout and payment

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => 0,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['therapist_id', 'package_id', 'provider', 'candidate', 'disclosuresAccepted', 'authorizationAccepted', 'paymentMethodId'];
foreach ($required_fields as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => 0,
            'message' => 'Missing required field: ' . $field
        ]);
        exit();
    }
}

// Validate disclosures and authorization
if (!$input['disclosuresAccepted'] || !$input['authorizationAccepted']) {
    http_response_code(400);
    echo json_encode([
        'success' => 0,
        'message' => 'Disclosures and authorization must be accepted'
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
    
    // Get package pricing
    $package_id = $conn->real_escape_string($input['package_id']);
    $provider = $conn->real_escape_string($input['provider']);
    
    $sql = "SELECT * FROM verification_packages WHERE package_id = '$package_id' AND provider = '$provider' AND is_active = TRUE";
    $result = $conn->query($sql);
    
    if ($result === false || $result->num_rows === 0) {
        throw new Exception("Invalid verification package");
    }
    
    $pkg = $result->fetch_assoc();
    
    // TODO: Integrate with Stripe PHP SDK for payment processing
    // For now, we'll simulate successful payment
    $payment_intent_id = 'pi_test_' . uniqid();
    $amount_charged = $pkg['price'];
    $currency = $pkg['currency'];
    
    // Store verification record
    $candidate = $input['candidate'];
    $therapist_id = (int)$input['therapist_id'];
    
    $stmt = $conn->prepare("INSERT INTO therapist_verifications (
        therapist_id, verification_provider, verification_package,
        stripe_payment_intent_id, amount_charged, currency,
        first_name, last_name, email, phone, date_of_birth,
        ssn_last4, address_line1, address_line2, city, state,
        postal_code, country, disclosures_accepted, authorization_accepted,
        disclosures_timestamp, authorization_timestamp, ip_address, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, 'in_progress')");
    
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    
    $stmt->bind_param("issddsssssssssssssssss",
        $therapist_id,
        $provider,
        $package_id,
        $payment_intent_id,
        $amount_charged,
        $currency,
        $candidate['first_name'],
        $candidate['last_name'],
        $candidate['email'],
        $candidate['phone'],
        $candidate['date_of_birth'],
        $candidate['ssn_last4'] ?? null,
        $candidate['address_line1'],
        $candidate['address_line2'] ?? null,
        $candidate['city'],
        $candidate['state'],
        $candidate['postal_code'],
        $candidate['country'] ?? 'US',
        $input['disclosuresAccepted'],
        $input['authorizationAccepted'],
        $ip_address
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to create verification record: " . $stmt->error);
    }
    
    $verification_id = $conn->insert_id;
    
    // TODO: Call background check provider API here
    // For now, we'll simulate the API call
    error_log("Background check initiated for therapist $therapist_id with $provider package $package_id");
    
    // Close connection
    $conn->close();
    
    // Return success response
    echo json_encode([
        'success' => 1,
        'data' => [
            'verification_id' => $verification_id,
            'payment_intent_id' => $payment_intent_id,
            'status' => 'in_progress'
        ],
        'message' => 'Background check initiated successfully'
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Checkout error in verification-checkout.php: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => 0,
        'message' => 'Internal server error',
        'error' => (isset($_ENV['NODE_ENV']) && $_ENV['NODE_ENV'] === 'development') ? $e->getMessage() : null
    ]);
}
?>
