<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$mongoUri = "mongodb://127.0.0.1:27017";
$dbName = "cafeteria_kiosko";
$collectionName = "lattes";

try {
    $manager = new MongoDB\Driver\Manager($mongoUri);
    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

    if ($method === 'GET') {
        $query = new MongoDB\Driver\Query([], ['sort' => ['createdAt' => -1]]);
        $cursor = $manager->executeQuery("$dbName.$collectionName", $query);
        $items = [];
        foreach ($cursor as $doc) {
            $item = (array)$doc;
            if (isset($item['_id']) && is_object($item['_id'])) {
                $item['_id'] = (string)$item['_id'];
            }
            if (isset($item['createdAt']) && is_object($item['createdAt'])) {
                $item['createdAt'] = date('c');
            }
            $items[] = $item;
        }

        if (count($items) === 0) {
            $bulk = new MongoDB\Driver\BulkWrite();
            $defaultDoc = [
                '_id' => new MongoDB\BSON\ObjectId('6a9ecf625840bcc2b1397a70'),
                'name' => 'latte',
                'precio' => 40,
                'user' => '@anonimo',
                'createdAt' => date('c')
            ];
            $bulk->insert($defaultDoc);
            $manager->executeBulkWrite("$dbName.$collectionName", $bulk);
            $items[] = [
                '_id' => '6a9ecf625840bcc2b1397a70',
                'name' => 'latte',
                'precio' => 40,
                'user' => '@anonimo',
                'createdAt' => date('c')
            ];
        }

        echo json_encode(['success' => true, 'source' => 'mongodb', 'data' => $items]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $name = isset($input['name']) ? trim($input['name']) : '';
        $precio = isset($input['precio']) ? floatval($input['precio']) : 0;
        $user = isset($input['user']) && trim($input['user']) !== '' ? trim($input['user']) : '@anonimo';

        if (empty($name)) {
            echo json_encode(['success' => false, 'message' => 'El nombre es requerido']);
            exit;
        }

        $id = new MongoDB\BSON\ObjectId();
        $doc = [
            '_id' => $id,
            'name' => $name,
            'precio' => $precio,
            'user' => $user,
            'createdAt' => date('c')
        ];

        $bulk = new MongoDB\Driver\BulkWrite();
        $bulk->insert($doc);
        $manager->executeBulkWrite("$dbName.$collectionName", $bulk);

        $doc['_id'] = (string)$id;
        echo json_encode(['success' => true, 'source' => 'mongodb', 'data' => $doc]);
        exit;
    }

    if ($method === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete')) {
        $idStr = isset($_GET['id']) ? $_GET['id'] : '';
        if (empty($idStr) && isset($_SERVER['PATH_INFO'])) {
            $idStr = ltrim($_SERVER['PATH_INFO'], '/');
        }

        if (!empty($idStr)) {
            $bulk = new MongoDB\Driver\BulkWrite();
            try {
                $bulk->delete(['_id' => new MongoDB\BSON\ObjectId($idStr)]);
            } catch (Exception $e) {
                $bulk->delete(['_id' => $idStr]);
            }
            $manager->executeBulkWrite("$dbName.$collectionName", $bulk);
            echo json_encode(['success' => true, 'message' => 'Eliminado con éxito de MongoDB']);
            exit;
        }
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
