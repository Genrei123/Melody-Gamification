<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$servername = "localhost";
$username = "root";
$password = ""; // Your MySQL password
$dbname = "melody_gamification"; // Your database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM compositions"; // Adjust the query as needed
$result = $conn->query($sql);

$compositions = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $compositions[] = $row;
    }
}

echo json_encode($compositions);
$conn->close();
?>