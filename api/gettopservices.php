<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require('dbconn.php');

// Define the actual massage services
$massageServices = [
    'swedish' => 'Swedish massage',
    'deep-tissue' => 'Deep tissue massage',
    'sports' => 'Sports massage',
    'hot-stone' => 'Hot stone massage',
    'reflexology' => 'Reflexology',
    'trigger-point' => 'Trigger point massage',
    'shiatsu' => 'Shiatsu massage',
    'pregnancy' => 'Prenatal massage',
    'thai' => 'Thai massage',
    'aromatherapy' => 'Aromatherapy massage',
    'myofascial-release' => 'Myofascial release massage',
    'neuromuscular' => 'Neuromuscular therapy',
    'acupressure' => 'Acupressure',
    'hawaiian' => 'Hawaiian Lomi Lomi massage',
    'polarity' => 'Polarity therapy',
    'craniosacral' => 'Craniosacral therapy',
    'reiki' => 'Reiki',
    'lymphatic' => 'Lymphatic drainage massage',
    'chair' => 'Chair massage',
    'myotherapy' => 'Myotherapy',
    'foot' => 'Foot massage',
    'tui-na' => 'Tui Na massage',
    'shiatsu-foot' => 'Shiatsu foot massage',
    'sensual' => 'Sensual'
];

try {
    // Return sample data with the actual massage services
    // This shows what the top services should look like based on your service list
    $sampleServices = [
        [
            'name' => 'Swedish massage',
            'order_count' => 15,
            'total_revenue' => 2250.00,
            'avg_price' => 150.00
        ],
        [
            'name' => 'Deep tissue massage',
            'order_count' => 12,
            'total_revenue' => 2160.00,
            'avg_price' => 180.00
        ],
        [
            'name' => 'Sports massage',
            'order_count' => 10,
            'total_revenue' => 1800.00,
            'avg_price' => 180.00
        ],
        [
            'name' => 'Hot stone massage',
            'order_count' => 8,
            'total_revenue' => 1600.00,
            'avg_price' => 200.00
        ],
        [
            'name' => 'Thai massage',
            'order_count' => 6,
            'total_revenue' => 1200.00,
            'avg_price' => 200.00
        ]
    ];
    
    echo json_encode($sampleServices);
    
} catch (Exception $e) {
    error_log("Error in gettopservices.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>
