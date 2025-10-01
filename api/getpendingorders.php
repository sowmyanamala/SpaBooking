<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require('dbconn.php');

// Get and validate modelId
$modelId = isset($_GET['modelid']) ? trim($_GET['modelid']) : '';

// Debug: Log the received modelId
error_log("Received modelId: " . $modelId);

// If modelId is provided, filter by model; otherwise return all orders (for admin)
if (!empty($modelId)) {
    // Convert to integer to ensure proper type matching with database
    $modelId = (int)$modelId;
    
    // Debug: Log the converted modelId
    error_log("Converted modelId (int): " . $modelId);
    
    $sql = "SELECT 
                id,
                date_of_creation AS request_time,
                service_address AS address,
                service_type AS call_type,
                service_time,
                order_status AS status,
                customer_id
            FROM orders
            WHERE model_id = ?
            ORDER BY date_of_creation DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $modelId);
} else {
    // Admin view: return all orders with customer and model names
    error_log("No modelId provided, returning all orders for admin");
    
    $sql = "SELECT 
                o.id,
                o.date_of_creation AS request_time,
                o.service_address AS address,
                o.service_type AS call_type,
                o.service_time,
                o.order_status AS status,
                o.customer_id,
                o.model_id,
                o.amount_received AS amount,
                c.name AS customer_name,
                m.name AS model_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN models m ON o.model_id = m.id
            ORDER BY o.date_of_creation DESC";
    
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

// Debug: Log the number of rows returned
$rowCount = $result->num_rows;
error_log("Query returned {$rowCount} rows for modelId {$modelId}");

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

echo json_encode($rows);

