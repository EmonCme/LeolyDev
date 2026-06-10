<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================
// KONFIGURASI DATABASE
// ============================================================
$host = '203.175.9.133';
$dbname = 'leoq2682_DB';
$username = 'leoq2682_leoly';
$password = 'Bangsat88.';

// Folder upload - gunakan path absolut
$uploadDir = __DIR__ . '/uploads/';

// Buat folder uploads jika belum ada
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// ============================================================
// KONEKSI DATABASE
// ============================================================
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    createTables($pdo);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// ============================================================
// FUNGSI UPLOAD FILE (untuk avatar, banner, project, shop, qris)
// ============================================================
function uploadFile($file, $uploadDir) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'No file uploaded or upload error'];
    }
    
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        return ['success' => false, 'error' => 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP'];
    }
    
    if ($file['size'] > 5 * 1024 * 1024) {
        return ['success' => false, 'error' => 'File too large. Max 5MB'];
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => true, 'path' => 'uploads/' . $filename];
    } else {
        return ['success' => false, 'error' => 'Failed to move uploaded file'];
    }
}

// ============================================================
// MEMBUAT TABEL
// ============================================================
function createTables($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS profile (
        id INT PRIMARY KEY DEFAULT 1,
        name VARCHAR(255) NOT NULL DEFAULT 'Leoly Hub',
        bio TEXT,
        tags TEXT,
        avatar TEXT,
        banner TEXT,
        qris_image TEXT DEFAULT ''
    )");
    
    // Tambah kolom qris_image jika belum ada (untuk keamanan)
    try {
        $pdo->exec("ALTER TABLE profile ADD COLUMN IF NOT EXISTS qris_image TEXT DEFAULT ''");
    } catch (Exception $e) {}
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM profile");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO profile (id, name, bio, tags, avatar, banner, qris_image) VALUES (1, 'Leoly Dev Platform', 'Front-end web engineer & Roblox Studio builder.', 'Roblox, HTML/CSS, Acode Mobile, MT Manager', '', '', '')");
    }
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        img TEXT,
        link TEXT
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS shop (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        description TEXT,
        img TEXT
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        amount INT NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Tabel uploads untuk file assets manager
    $pdo->exec("CREATE TABLE IF NOT EXISTS uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        size INT NOT NULL,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
}

// ============================================================
// ROUTING API
// ============================================================
$action = $_GET['action'] ?? '';
$response = [];

try {
    switch ($action) {
        case 'getProfile':
            $stmt = $pdo->query("SELECT * FROM profile WHERE id = 1");
            $profile = $stmt->fetch();
            echo json_encode($profile ?: ['name' => 'Leoly Hub', 'bio' => '', 'tags' => '', 'avatar' => '', 'banner' => '']);
            break;
        
        case 'updateProfile':
            $name = $_POST['name'] ?? '';
            $bio = $_POST['bio'] ?? '';
            $tags = $_POST['tags'] ?? '';
            
            $stmt = $pdo->prepare("SELECT avatar, banner FROM profile WHERE id = 1");
            $stmt->execute();
            $oldData = $stmt->fetch();
            
            $avatar = $oldData['avatar'] ?? '';
            $banner = $oldData['banner'] ?? '';
            
            if (isset($_FILES['avatar_file']) && $_FILES['avatar_file']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = uploadFile($_FILES['avatar_file'], $uploadDir);
                if ($uploadResult['success']) {
                    if ($avatar && file_exists(__DIR__ . '/' . $avatar)) {
                        unlink(__DIR__ . '/' . $avatar);
                    }
                    $avatar = $uploadResult['path'];
                } else {
                    echo json_encode(['success' => false, 'error' => $uploadResult['error']]);
                    break;
                }
            } elseif (isset($_POST['avatar_clear']) && $_POST['avatar_clear'] == '1') {
                if ($avatar && file_exists(__DIR__ . '/' . $avatar)) {
                    unlink(__DIR__ . '/' . $avatar);
                }
                $avatar = '';
            }
            
            if (isset($_FILES['banner_file']) && $_FILES['banner_file']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = uploadFile($_FILES['banner_file'], $uploadDir);
                if ($uploadResult['success']) {
                    if ($banner && file_exists(__DIR__ . '/' . $banner)) {
                        unlink(__DIR__ . '/' . $banner);
                    }
                    $banner = $uploadResult['path'];
                } else {
                    echo json_encode(['success' => false, 'error' => $uploadResult['error']]);
                    break;
                }
            } elseif (isset($_POST['banner_clear']) && $_POST['banner_clear'] == '1') {
                if ($banner && file_exists(__DIR__ . '/' . $banner)) {
                    unlink(__DIR__ . '/' . $banner);
                }
                $banner = '';
            }
            
            $stmt = $pdo->prepare("UPDATE profile SET name = ?, bio = ?, tags = ?, avatar = ?, banner = ? WHERE id = 1");
            $stmt->execute([$name, $bio, $tags, $avatar, $banner]);
            echo json_encode(['success' => true, 'avatar' => $avatar, 'banner' => $banner]);
            break;
        
        // QRIS: ambil gambar
        case 'getQris':
            $stmt = $pdo->prepare("SELECT qris_image FROM profile WHERE id = 1");
            $stmt->execute();
            $qris = $stmt->fetch();
            echo json_encode(['qris_image' => $qris['qris_image'] ?? '']);
            break;
        
        // QRIS: upload gambar
        case 'updateQris':
            if (isset($_FILES['qris_file']) && $_FILES['qris_file']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = uploadFile($_FILES['qris_file'], $uploadDir);
                if ($uploadResult['success']) {
                    $stmt = $pdo->prepare("SELECT qris_image FROM profile WHERE id = 1");
                    $stmt->execute();
                    $old = $stmt->fetch();
                    if ($old && $old['qris_image'] && file_exists(__DIR__ . '/' . $old['qris_image'])) {
                        unlink(__DIR__ . '/' . $old['qris_image']);
                    }
                    $stmt = $pdo->prepare("UPDATE profile SET qris_image = ? WHERE id = 1");
                    $stmt->execute([$uploadResult['path']]);
                    echo json_encode(['success' => true, 'qris_image' => $uploadResult['path']]);
                } else {
                    echo json_encode(['success' => false, 'error' => $uploadResult['error']]);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'No file uploaded']);
            }
            break;
        
        case 'getProjects':
            $stmt = $pdo->query("SELECT id, title, description as `desc`, img, link FROM projects ORDER BY id DESC");
            echo json_encode($stmt->fetchAll());
            break;
        
        case 'addProject':
            $title = $_POST['title'] ?? '';
            $desc = $_POST['desc'] ?? '';
            $link = $_POST['link'] ?? '#';
            $img = '';
            
            if (isset($_FILES['img_file']) && $_FILES['img_file']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = uploadFile($_FILES['img_file'], $uploadDir);
                if ($uploadResult['success']) {
                    $img = $uploadResult['path'];
                } else {
                    echo json_encode(['success' => false, 'error' => $uploadResult['error']]);
                    break;
                }
            }
            
            $stmt = $pdo->prepare("INSERT INTO projects (title, description, img, link) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $desc, $img, $link]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;
        
        case 'deleteProject':
            $id = $_GET['id'] ?? 0;
            $stmt = $pdo->prepare("SELECT img FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            $project = $stmt->fetch();
            if ($project && $project['img'] && file_exists(__DIR__ . '/' . $project['img'])) {
                unlink(__DIR__ . '/' . $project['img']);
            }
            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
        
        case 'getShop':
            $stmt = $pdo->query("SELECT id, title, price, description as `desc`, img FROM shop ORDER BY id DESC");
            echo json_encode($stmt->fetchAll());
            break;
        
        case 'addShop':
            $title = $_POST['title'] ?? '';
            $price = $_POST['price'] ?? 0;
            $desc = $_POST['desc'] ?? '';
            $img = '';
            
            if (isset($_FILES['img_file']) && $_FILES['img_file']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = uploadFile($_FILES['img_file'], $uploadDir);
                if ($uploadResult['success']) {
                    $img = $uploadResult['path'];
                } else {
                    echo json_encode(['success' => false, 'error' => $uploadResult['error']]);
                    break;
                }
            }
            
            $stmt = $pdo->prepare("INSERT INTO shop (title, price, description, img) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $price, $desc, $img]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;
        
        case 'deleteShop':
            $id = $_GET['id'] ?? 0;
            $stmt = $pdo->prepare("SELECT img FROM shop WHERE id = ?");
            $stmt->execute([$id]);
            $shop = $stmt->fetch();
            if ($shop && $shop['img'] && file_exists(__DIR__ . '/' . $shop['img'])) {
                unlink(__DIR__ . '/' . $shop['img']);
            }
            $stmt = $pdo->prepare("DELETE FROM shop WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
        
        case 'getDonations':
            $stmt = $pdo->query("SELECT id, name, amount, message as msg FROM donations ORDER BY id DESC");
            echo json_encode($stmt->fetchAll());
            break;
        
        case 'addDonation':
            $name = $_POST['name'] ?? 'Anonim';
            $amount = $_POST['amount'] ?? 0;
            $msg = $_POST['msg'] ?? '';
            
            $stmt = $pdo->prepare("INSERT INTO donations (name, amount, message) VALUES (?, ?, ?)");
            $stmt->execute([$name, $amount, $msg]);
            echo json_encode(['success' => true]);
            break;
        
        case 'getMessages':
            $stmt = $pdo->query("SELECT id, contact, subject, message FROM messages ORDER BY id DESC");
            echo json_encode($stmt->fetchAll());
            break;
        
        case 'addMessage':
            $contact = $_POST['contact'] ?? '';
            $subject = $_POST['subject'] ?? '';
            $message = $_POST['message'] ?? '';
            
            $stmt = $pdo->prepare("INSERT INTO messages (contact, subject, message) VALUES (?, ?, ?)");
            $stmt->execute([$contact, $subject, $message]);
            echo json_encode(['success' => true]);
            break;
        
        case 'deleteMessage':
            $id = $_GET['id'] ?? 0;
            $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
        
        // ==================== FILE ASSETS MANAGER ====================
        case 'uploadFile':
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
                break;
            }
            
            $file = $_FILES['file'];
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/zip', 'application/x-zip-compressed', 'text/plain'];
            $fileType = mime_content_type($file['tmp_name']);
            
            if (!in_array($fileType, $allowedTypes)) {
                echo json_encode(['success' => false, 'error' => 'File type not allowed']);
                break;
            }
            
            if ($file['size'] > 10 * 1024 * 1024) {
                echo json_encode(['success' => false, 'error' => 'File too large. Max 10MB']);
                break;
            }
            
            $uploadFileDir = __DIR__ . '/uploads/files/';
            if (!file_exists($uploadFileDir)) {
                mkdir($uploadFileDir, 0777, true);
            }
            
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $storedName = uniqid() . '.' . $extension;
            $targetPath = $uploadFileDir . $storedName;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $stmt = $pdo->prepare("INSERT INTO uploads (original_name, stored_name, file_path, size, mime_type) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$file['name'], $storedName, 'uploads/files/' . $storedName, $file['size'], $fileType]);
                echo json_encode([
                    'success' => true,
                    'id' => $pdo->lastInsertId(),
                    'original_name' => $file['name'],
                    'stored_name' => $storedName,
                    'size' => $file['size'],
                    'file_path' => 'uploads/files/' . $storedName
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
            }
            break;
        
        case 'getUploadedFiles':
            $stmt = $pdo->query("SELECT id, original_name, stored_name, file_path, size, mime_type, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at FROM uploads ORDER BY id DESC");
            echo json_encode($stmt->fetchAll());
            break;
        
        case 'deleteUploadedFile':
            $id = $_GET['id'] ?? 0;
            $stmt = $pdo->prepare("SELECT file_path FROM uploads WHERE id = ?");
            $stmt->execute([$id]);
            $file = $stmt->fetch();
            if ($file && file_exists(__DIR__ . '/' . $file['file_path'])) {
                unlink(__DIR__ . '/' . $file['file_path']);
            }
            $stmt = $pdo->prepare("DELETE FROM uploads WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
        
        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>