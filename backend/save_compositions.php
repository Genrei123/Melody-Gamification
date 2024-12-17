<?php
// CORS Configuration 
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


// Database Connection
$servername = "localhost";
$username = "root";
$password = ""; // Your MySQL password
$dbname = "melody_gamification"; // Your database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check Connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo json_encode(['status' => 'success', 'message' => 'Database connection established']);
}

// Handle Preflight Requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0); 
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get data from request body
    $composition_name = $_POST['compositionName'];
    $notes = $_POST['composition']; // Use 'notes' as the column name
    $user_email = $_POST['userEmail'];

    // Check if the user email exists in the database
    $checkSql = "SELECT 1 FROM compositions WHERE user_email = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("s", $userEmail);
    $checkStmt->execute();

    if ($checkStmt->fetch()) {
        // User email exists, proceed with saving composition
        $sql = "INSERT INTO compositions (user_email, composition_name, notes) VALUES (?, ?, ?)"; 
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $userEmail, $compositionName, $notes);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Composition saved successfully!']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error saving composition']);
        }
        $stmt->close();

    } else {
        // User email doesn't exist
        echo json_encode(['status' => 'error', 'message' => 'User email not found']);
    }
    $checkStmt->close();
}

$conn->close();
?>