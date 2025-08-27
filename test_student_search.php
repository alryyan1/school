<?php
// Simple test script to verify student search API
$baseUrl = 'http://localhost/school-backend/public/api';

// Test the search endpoint
$studentId = 1; // Assuming student with ID 1 exists
$url = $baseUrl . '/students/search/' . $studentId;

echo "Testing student search API...\n";
echo "URL: $url\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n";
echo "Response:\n";
echo $response . "\n";

if ($httpCode === 200) {
    echo "\n✅ API test successful!\n";
} else {
    echo "\n❌ API test failed!\n";
}
?>
