<?php
// Use environment variables for security
$servername = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? "localhost";
$username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?? "msgdbusr";
$password = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?? "t10f73&La";
$dbname = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? "msgdb";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
//echo "Connected successfully";

// ////
// $sql ="CREATE TABLE models (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     date_of_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
//     name VARCHAR(255) NOT NULL,
//     phone VARCHAR(20) NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     picture_url VARCHAR(255),
//     about TEXT NOT NULL,
//     service_area VARCHAR(255) NOT NULL,
//     services_prices VARCHAR(255),
//     gender VARCHAR(15),
//     height VARCHAR(15),
//     color VARCHAR(15),
//     availability VARCHAR(255),
//     password VARCHAR(255) NOT NULL
//   );";


// $sql = "CREATE TABLE customer (
//     Id INT AUTO_INCREMENT PRIMARY KEY,
//     date_of_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
//     Name VARCHAR(255) NOT NULL,
//     Phone VARCHAR(20) NOT NULL,
//     Email VARCHAR(255) NOT NULL,
//     Home_Address VARCHAR(255),
//     About TEXT NOT NULL,
//     Cardid VARCHAR(255) NOT NULL,
//     Password VARCHAR(255) NOT NULL
//   );";



// $sql = "CREATE TABLE orders (
//     Id INT AUTO_INCREMENT PRIMARY KEY,
//     date_of_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
//     customer_id VARCHAR(255) NOT NULL,
//     model_id VARCHAR(20) NOT NULL,
//     service_Address VARCHAR(255),
//     service_time VARCHAR(255),
//     amount_received VARCHAR(55),
//     Cardid VARCHAR(255) NOT NULL
//   );"; 


// $sql = "DROP TABLE models";

// if (mysqli_query($conn, $sql)) {
//     echo "Table user_info created successfully";
// } else {
//     echo "Error creating table: " . mysqli_error($conn);
// }

// mysqli_close($conn);

?>