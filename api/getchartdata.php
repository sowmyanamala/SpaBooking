<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require('dbconn.php');

try {
    // Get weekly user registrations (last 7 weeks)
    $weeklyUsersSql = "SELECT 
                        DATE_FORMAT(date_of_creation, '%Y-%u') AS week,
                        COUNT(*) AS user_count
                       FROM customers 
                       WHERE date_of_creation >= DATE_SUB(NOW(), INTERVAL 7 WEEK)
                       GROUP BY DATE_FORMAT(date_of_creation, '%Y-%u')
                       ORDER BY week DESC
                       LIMIT 7";
    
    // Get monthly revenue (last 6 months)
    $monthlyRevenueSql = "SELECT 
                            DATE_FORMAT(date_of_creation, '%Y-%m') AS month,
                            SUM(COALESCE(amount_received, 0)) AS revenue
                          FROM orders 
                          WHERE date_of_creation >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                          GROUP BY DATE_FORMAT(date_of_creation, '%Y-%m')
                          ORDER BY month DESC
                          LIMIT 6";
    
    // Get daily orders (last 30 days)
    $dailyOrdersSql = "SELECT 
                         DATE(date_of_creation) AS date,
                         COUNT(*) AS order_count,
                         SUM(COALESCE(amount_received, 0)) AS daily_revenue
                       FROM orders 
                       WHERE date_of_creation >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                       GROUP BY DATE(date_of_creation)
                       ORDER BY date DESC
                       LIMIT 30";
    
    $weeklyUsersResult = $conn->query($weeklyUsersSql);
    $monthlyRevenueResult = $conn->query($monthlyRevenueSql);
    $dailyOrdersResult = $conn->query($dailyOrdersSql);
    
    if (!$weeklyUsersResult || !$monthlyRevenueResult || !$dailyOrdersResult) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    // Process weekly users data
    $weeklyUsers = [];
    while ($row = $weeklyUsersResult->fetch_assoc()) {
        $weeklyUsers[] = [
            'week' => $row['week'],
            'count' => (int)$row['user_count']
        ];
    }
    
    // Process monthly revenue data
    $monthlyRevenue = [];
    while ($row = $monthlyRevenueResult->fetch_assoc()) {
        $monthlyRevenue[] = [
            'month' => $row['month'],
            'revenue' => (float)$row['revenue']
        ];
    }
    
    // Process daily orders data
    $dailyOrders = [];
    while ($row = $dailyOrdersResult->fetch_assoc()) {
        $dailyOrders[] = [
            'date' => $row['date'],
            'count' => (int)$row['order_count'],
            'revenue' => (float)$row['daily_revenue']
        ];
    }
    
    // Calculate totals for summary
    $totalWeeklyUsers = array_sum(array_column($weeklyUsers, 'count'));
    $totalMonthlyRevenue = array_sum(array_column($monthlyRevenue, 'revenue'));
    
    $chartData = [
        'weekly_users' => array_reverse($weeklyUsers), // Reverse to show chronological order
        'monthly_revenue' => array_reverse($monthlyRevenue), // Reverse to show chronological order
        'daily_orders' => array_reverse($dailyOrders), // Reverse to show chronological order
        'summary' => [
            'total_weekly_users' => $totalWeeklyUsers,
            'total_monthly_revenue' => $totalMonthlyRevenue,
            'avg_daily_orders' => count($dailyOrders) > 0 ? round(array_sum(array_column($dailyOrders, 'count')) / count($dailyOrders)) : 0
        ]
    ];
    
    echo json_encode($chartData);
    
} catch (Exception $e) {
    error_log("Error in getchartdata.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>
