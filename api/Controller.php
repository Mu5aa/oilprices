<?php

namespace Sssd;

use Flight;
use PDO;
use PDOException;
use Exception;
use OpenApi\Annotations as OA;

class Controller {
    private $conn;

    public function __construct() {
        $host = '127.0.0.1';
        $schema = 'oil_data';
        $username = 'root';
        $password = '';
        $port = '3306';

        try {
            $this->conn = new PDO("mysql:host=$host;port=$port;dbname=$schema", $username, $password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            Flight::halt(500, json_encode(['error' => true, 'message' => 'Database connection failed: ' . $e->getMessage()]));
        }
    }

    /**
     * Check Database Connection
     *
     * @OA\GET(
     *     path="/check_connection",
     *     summary="Check Database Connection",
     *     description="Checks the connection to the database.",
     *     tags={"database"},
     *     @OA\Response(
     *         response=200,
     *         description="Database connection is successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Database connection is successful")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Database connection failed",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Database connection failed")
     *         )
     *     )
     * )
     */
    public function checkConnection() {
        try {
            $this->conn->query('SELECT 1');
            echo json_encode(['success' => true, 'message' => 'Database connection is successful']);
        } catch (PDOException $e) {
            echo json_encode(['error' => true, 'message' => 'Database connection failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetch Data and Store it in the Database
     *
     * @OA\POST(
     *     path="/fetch_data_and_store",
     *     summary="Fetch Data and Store it in the Database",
     *     description="Fetches data from an external source and stores it in the database.",
     *     tags={"data"},
     *     @OA\Response(
     *         response=200,
     *         description="Data fetched and stored successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Data fetched and stored successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Failed to fetch and store data",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Failed to fetch and store data")
     *         )
     *     )
     * )
     */
    public function fetchGasStationDataAndStore() {
        $apiBaseUrl = 'https://bps-mtt.vladars.rs:5101/api';
    
        // Helper function to execute queries
        function executeQuery($conn, $query, $params) {
            $stmt = $conn->prepare($query);
            if ($stmt === false) {
                throw new Exception('Prepare failed: ' . implode(", ", $conn->errorInfo()));
            }
    
            if ($params) {
                $stmt->execute($params);
            } else {
                $stmt->execute();
            }
    
            return $stmt;
        }
    
        try {
            // Retrieve municipality ID from the database
            $query = 'SELECT id FROM cities ORDER BY id DESC LIMIT 1'; // Adjust this query to fit your table structure
            $stmt = executeQuery($this->conn, $query, []);
            $municipality = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$municipality || !isset($municipality['id'])) {
                throw new Exception('Failed to retrieve municipality ID');
            }
    
            // Fetch gas station data using the retrieved municipality ID
            $municipalityId = $municipality['id'];
            $gasStationResponse = file_get_contents("$apiBaseUrl/gasStationBusinessUnits/city/$municipalityId/1");
    
            // Check if response is valid
            if ($gasStationResponse === false) {
                throw new Exception('Failed to fetch gas station data');
            }
    
            // Check if response is in JSON format
            $jsonDecoded = json_decode($gasStationResponse, true);
            if ($jsonDecoded === null && json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON format');
            }
    
            // Check for required keys in gas station data
            $requiredKeys = ['id', 'fullName', 'gasStationCompanyImageUrl', 'fullAddress', 'webAddress', 'phoneNumber', 'latitude', 'longitude', 'openDaysString', 'openHours', 'closeHours'];
            foreach ($requiredKeys as $key) {
                if (!array_key_exists($key, $jsonDecoded)) {
                    throw new Exception("Missing expected key '$key' in gas station data");
                }
            }
    
            // Insert or update gas station business units
            $query = 'INSERT INTO gas_station_business_units (id, city_id, fullName, gasStationCompanyImageUrl, fullAddress, webAddress, phoneNumber, latitude, longitude, openDaysString, openHours, closeHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE city_id=?, fullName=?, gasStationCompanyImageUrl=?, fullAddress=?, webAddress=?, phoneNumber=?, latitude=?, longitude=?, openDaysString=?, openHours=?, closeHours=?';
            $params = [
                $jsonDecoded['id'], $municipalityId, $jsonDecoded['fullName'], $jsonDecoded['gasStationCompanyImageUrl'], $jsonDecoded['fullAddress'], $jsonDecoded['webAddress'], $jsonDecoded['phoneNumber'], $jsonDecoded['latitude'], $jsonDecoded['longitude'], $jsonDecoded['openDaysString'], $jsonDecoded['openHours'], $jsonDecoded['closeHours'],
                $municipalityId, $jsonDecoded['fullName'], $jsonDecoded['gasStationCompanyImageUrl'], $jsonDecoded['fullAddress'], $jsonDecoded['webAddress'], $jsonDecoded['phoneNumber'], $jsonDecoded['latitude'], $jsonDecoded['longitude'], $jsonDecoded['openDaysString'], $jsonDecoded['openHours'], $jsonDecoded['closeHours']
            ];
            executeQuery($this->conn, $query, $params);
    
            // Insert or update price details
            foreach ($jsonDecoded['priceDetails'] as $priceDetail) {
                if (!isset($priceDetail['currentPrice']) || !isset($priceDetail['oilDerivateType']) || !isset($priceDetail['oilDerivateName'])) {
                    throw new Exception('Missing expected keys in price detail');
                }
    
                $query = 'INSERT INTO price_details (gas_station_id, currentPrice, oilDerivateType, oilDerivateName) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE currentPrice=?, oilDerivateType=?, oilDerivateName=?';
                $params = [
                    $jsonDecoded['id'], $priceDetail['currentPrice'], $priceDetail['oilDerivateType'], $priceDetail['oilDerivateName'],
                    $priceDetail['currentPrice'], $priceDetail['oilDerivateType'], $priceDetail['oilDerivateName']
                ];
                $stmt = executeQuery($this->conn, $query, $params);
                $priceDetailId = $this->conn->lastInsertId() ?: $priceDetail['id'];
    
                // Insert price history
                foreach ($priceDetail['history'] as $history) {
                    if (!isset($history['date']) || !isset($history['price']) || !isset($history['ascending'])) {
                        throw new Exception('Missing expected keys in price history');
                    }
    
                    $query = 'INSERT INTO price_history (price_detail_id, date, price, ascending) VALUES (?, ?, ?, ?)';
                    $params = [$priceDetailId, $history['date'], $history['price'], $history['ascending']];
                    executeQuery($this->conn, $query, $params);
                }
            }
    
            echo json_encode(['success' => true, 'message' => 'Gas station data fetched and stored successfully']);
        } catch (Exception $e) {
            echo json_encode(['error' => true, 'message' => 'Failed to fetch and store gas station data: ' . $e->getMessage()]);
        }
    }

    /**
 * Get Cities
 *
 * @OA\GET(
 *     path="/cities",
 *     summary="Get all cities",
 *     description="Fetches a list of all cities from the database.",
 *     tags={"cities"},
 *     @OA\Response(
 *         response=200,
 *         description="List of cities",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="cities", type="array", @OA\Items(
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Sarajevo")
 *             ))
 *         )
 *     )
 * )
 */
public function getCities() {
    try {
        $query = 'SELECT id, name FROM cities';
        $stmt = $this->conn->query($query);
        $cities = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'cities' => $cities]);
    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Failed to fetch cities: ' . $e->getMessage()]);
    }
}


/**
 * Get Oil Types
 *
 * @OA\GET(
 *     path="/oil_types",
 *     summary="Get all oil types",
 *     description="Fetches a list of all oil derivative types from the database.",
 *     tags={"oil"},
 *     @OA\Response(
 *         response=200,
 *         description="List of oil types",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="oil_types", type="array", @OA\Items(
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Diesel")
 *             ))
 *         )
 *     )
 * )
 */
public function getOilTypes() {
    try {
        $query = 'SELECT id, name FROM oil_derivates';
        $stmt = $this->conn->query($query);
        $oilTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'oil_types' => $oilTypes]);
    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Failed to fetch oil types: ' . $e->getMessage()]);
    }
}


/**
 * Get Oil Prices
 *
 * @OA\GET(
 *     path="/oil_prices",
 *     summary="Get oil prices",
 *     description="Fetches the current prices of oil derivatives along with their history.",
 *     tags={"oil"},
 *     @OA\Response(
 *         response=200,
 *         description="List of oil prices",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="prices", type="array", @OA\Items(
 *                 @OA\Property(property="gas_station_id", type="integer", example=1),
 *                 @OA\Property(property="currentPrice", type="float", example=2.50),
 *                 @OA\Property(property="oilDerivateType", type="string", example="Diesel"),
 *                 @OA\Property(property="history", type="array", @OA\Items(
 *                     @OA\Property(property="date", type="string", format="date", example="2023-09-01"),
 *                     @OA\Property(property="price", type="float", example=2.45),
 *                     @OA\Property(property="ascending", type="boolean", example=true)
 *                 ))
 *             ))
 *         )
 *     )
 * )
 */
public function getOilPrices() {
    try {
        $query = 'SELECT g.id AS gas_station_id, p.currentPrice, p.oilDerivateType, p.oilDerivateName, h.date, h.price, h.ascending
                  FROM price_details p
                  JOIN gas_station_business_units g ON p.gas_station_id = g.id
                  LEFT JOIN price_history h ON h.price_detail_id = p.id';
        $stmt = $this->conn->query($query);
        $oilPrices = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'prices' => $oilPrices]);
    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Failed to fetch oil prices: ' . $e->getMessage()]);
    }
}


/**
 * Get Gas Station Details
 *
 * @OA\GET(
 *     path="/gas_station/{id}",
 *     summary="Get gas station details",
 *     description="Fetches detailed information about a specific gas station.",
 *     tags={"gas_station"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gas station details",
 *         @OA\JsonContent(
 *             @OA\Property(property="id", type="integer", example=1),
 *             @OA\Property(property="city_id", type="integer", example=1),
 *             @OA\Property(property="fullName", type="string", example="Shell Sarajevo"),
 *             @OA\Property(property="fullAddress", type="string", example="Main St, Sarajevo"),
 *             @OA\Property(property="phoneNumber", type="string", example="+38761000111"),
 *             @OA\Property(property="latitude", type="float", example=43.85),
 *             @OA\Property(property="longitude", type="float", example=18.41)
 *         )
 *     )
 * )
 */
public function getGasStationDetails($id) {
    try {
        $query = 'SELECT * FROM gas_station_business_units WHERE id = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        $gasStation = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($gasStation) {
            echo json_encode(['success' => true, 'gas_station' => $gasStation]);
        } else {
            echo json_encode(['error' => true, 'message' => 'Gas station not found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Failed to fetch gas station details: ' . $e->getMessage()]);
    }
}


    
}    