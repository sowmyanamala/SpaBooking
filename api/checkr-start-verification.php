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
$checkr_api_key = $_ENV['CHECKR_API_KEY'] ?? getenv('CHECKR_API_KEY') ?? 'your_checkr_api_key_here';

// Check if we have a valid API key
if (!$checkr_api_key || $checkr_api_key === 'your_checkr_api_key_here') {
    // Return mock response for testing when API key is not configured
    $input = json_decode(file_get_contents('php://input'), true);
    
    echo json_encode([
        'success' => true,
        'invitation_url' => 'https://checkr.com/mock-invitation-url',
        'candidate_id' => 'mock_candidate_id',
        'invitation_id' => 'mock_invitation_id',
        'message' => 'Mock response - Checkr API key not configured'
    ]);
    exit();
}

try {
    // Get request data
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? '';
    $first_name = $input['first_name'] ?? '';
    $last_name = $input['last_name'] ?? '';
    $package = $input['package'] ?? 'tasker_standard'; // Default Checkr package
    $work_state = $input['work_state'] ?? 'NY'; // Default state
    $work_city = $input['work_city'] ?? 'New York'; // Default city
    $therapist_id = $input['therapist_id'] ?? '';
    
    // Validate required fields
    if (empty($email) || empty($first_name) || empty($last_name) || empty($therapist_id)) {
        throw new Exception("Missing required fields: email, first_name, last_name, therapist_id");
    }
    
    // 1) Create or find candidate
    $candidate = ensureCandidate($checkr_api_key, $email, $first_name, $last_name, $therapist_id);
    
    if (!$candidate || !isset($candidate['id'])) {
        throw new Exception("Failed to create or find candidate. Checkr API key may be invalid.");
    }
    
    // 2) Create invitation
    $invitation = createInvitation($checkr_api_key, $candidate['id'], $package, $work_state, $work_city);
    
    if (!$invitation || !isset($invitation['invitation_url'])) {
        throw new Exception("Failed to create invitation. Checkr API response: " . json_encode($invitation));
    }
    
    // Check if therapist_verifications table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'therapist_verifications'");
    
    if ($tableCheck->num_rows === 0) {
        throw new Exception("Verification system not yet set up. Please run database schema.");
    }
    
    // 3) Store verification record in database (compatible with existing structure)
    $sql = "INSERT INTO therapist_verifications 
            (therapist_id, verification_provider, verification_package, provider_candidate_id, 
             first_name, last_name, email, status, created_at) 
            VALUES (?, 'checkr', ?, ?, ?, ?, ?, 'pending', NOW())
            ON DUPLICATE KEY UPDATE 
            provider_candidate_id = VALUES(provider_candidate_id),
            verification_package = VALUES(verification_package),
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            email = VALUES(email),
            status = 'pending',
            updated_at = NOW()";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $therapist_id, $candidate['id'], $invitation['id'], $package);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'invitation_url' => $invitation['invitation_url'],
        'candidate_id' => $candidate['id'],
        'invitation_id' => $invitation['id']
    ]);
    
} catch (Exception $e) {
    error_log("Checkr verification error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

function ensureCandidate($api_key, $email, $first_name, $last_name, $custom_id) {
    $checkr_api = "https://api.checkr.com/v1";
    
    // Try to find existing candidate by email
    $url = $checkr_api . "/candidates?email=" . urlencode($email);
    $response = makeCheckrRequest($api_key, $url);
    
    if (!empty($response['data']) && count($response['data']) > 0) {
        return $response['data'][0];
    }
    
    // Create new candidate
    $url = $checkr_api . "/candidates";
    $payload = [
        'email' => $email,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'custom_id' => (string)$custom_id
    ];
    
    $response = makeCheckrRequest($api_key, $url, 'POST', $payload);
    return $response;
}

function createInvitation($api_key, $candidate_id, $package, $work_state, $work_city) {
    $checkr_api = "https://api.checkr.com/v1";
    
    $url = $checkr_api . "/invitations";
    $payload = [
        'candidate_id' => $candidate_id,
        'package' => $package,
        'work_locations' => [
            [
                'state' => $work_state,
                'city' => $work_city
            ]
        ]
    ];
    
    $response = makeCheckrRequest($api_key, $url, 'POST', $payload);
    return $response;
}

function makeCheckrRequest($api_key, $url, $method = 'GET', $data = null) {
    $ch = curl_init();
    
    $headers = [
        'Authorization: Basic ' . base64_encode($api_key . ':'),
        'Content-Type: application/json'
    ];
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code >= 400) {
        throw new Exception("Checkr API error: HTTP $http_code - $response");
    }
    
    return json_decode($response, true);
}
?>
