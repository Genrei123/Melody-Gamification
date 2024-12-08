<?php
// addItem.php
require_once '../config/db.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method. Use POST.");
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['name']) || !isset($data['description'])) {
        throw new Exception("Missing required fields: 'name' and 'description'.");
    }

    $name = htmlspecialchars(trim($data['name']));
    $description = htmlspecialchars(trim($data['description']));

    if (empty($name) || empty($description)) {
        throw new Exception("Both 'name' and 'description' are required.");
    }

    $sql = "INSERT INTO items (name, description) VALUES (:name, :description)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Item added successfully!",
        "item_id" => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
