<?php


namespace Sssd;
use OTPHP\TOTP;

use OpenApi\Annotations as OA;
use Flight as Flight;
use PDO;
use PDOException;


class Controller {
    private $conn;

    public function __construct() {
        // Connect to the database
        $host = '127.0.0.1';
        $schema = 'oilprices';
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
 * Get Oil Prices for Gas Stations
 *
 * @OA\GET(
 *     path="/gas_station_oil_prices",
 *     summary="Get Oil Prices for Gas Stations",
 *     description="Retrieve oil prices for gas stations from the database.",
 *     tags={"oilprices"},
 *     @OA\Response(
 *         response=200,
 *         description="Oil prices retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="oil_prices", type="array", @OA\Items(type="object"))
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Failed to retrieve oil prices",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Failed to retrieve oil prices")
 *         )
 *     )
 * )
 */

 public function getGasStationOilPrices() {
    try {
        // Execute SQL query to select oil prices for gas stations
        $query = "SELECT * FROM GasStations";
        $stmt = $this->conn->query($query);

        // Debug: Check if the query executed successfully
        if (!$stmt) {
            $errorInfo = $this->conn->errorInfo();
            throw new PDOException("Query execution failed: " . $errorInfo[2]);
        }

        // Fetch data from the result set
        $oil_prices = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Debug: Check if any rows were fetched
        if (empty($oil_prices)) {
            echo json_encode(['error' => true, 'message' => 'No oil prices found']);
            return; // Return to exit the function after sending the response
        }

        // Debug: Log fetched oil prices for inspection
        error_log('Fetched oil prices: ' . print_r($oil_prices, true));

        // Return oil prices
        echo json_encode(['oil_prices' => $oil_prices]);
    } catch (PDOException $e) {
        // Handle database connection or query errors
        Flight::halt(500, json_encode(['error' => true, 'message' => 'Failed to retrieve oil prices: ' . $e->getMessage()]));
    }
}



/**
 * Get Gas Station Details with Oil Prices
 *
 * @OA\GET(
 *     path="/gas_station_oil_pricesid/{stationId}",
 *     summary="Get Gas Station Details with Oil Prices",
 *     description="Retrieve gas station details along with oil prices for a specific gas station by ID.",
 *     tags={"oilprices"},
 *     @OA\Parameter(
 *         name="stationId",
 *         in="path",
 *         required=true,
 *         description="ID of the gas station",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gas station details with oil prices retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="gas_station_details", type="object",
 *                 @OA\Property(property="station_id", type="integer"),
 *                 @OA\Property(property="station_name", type="string"),
 *                 @OA\Property(property="municipality_id", type="integer"),
 *                 @OA\Property(property="address", type="string"),
 *                 @OA\Property(property="contact_info", type="string"),
 *                 @OA\Property(property="facilities", type="object",
 *                     @OA\Property(property="cafe_bar", type="boolean"),
 *                     @OA\Property(property="toilet", type="boolean"),
 *                     @OA\Property(property="parking", type="boolean"),
 *                     @OA\Property(property="car_wash", type="boolean")
 *                 )
 *             ),
 *             @OA\Property(property="oil_prices", type="array", @OA\Items(type="object",
 *                 @OA\Property(property="oil_type", type="string"),
 *                 @OA\Property(property="octane_rating", type="string"),
 *                 @OA\Property(property="price", type="number"),
 *                 @OA\Property(property="last_updated", type="string", format="date-time")
 *             ))
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Failed to retrieve gas station details or oil prices",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Failed to retrieve gas station details")
 *         )
 *     )
 * )
 */

public function getGasStationByIdWithPrices($stationId) {
    try {
        // Prepare SQL query to fetch gas station details and oil prices
        $query = "SELECT gs.*, o.OilType, o.OctaneRating, gso.Price, gso.LastUpdated
                  FROM GasStations gs
                  LEFT JOIN GasStationOils gso ON gs.StationID = gso.StationID
                  LEFT JOIN Oils o ON gso.OilID = o.OilID
                  WHERE gs.StationID = :stationId";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':stationId', $stationId);
        $stmt->execute();

        // Fetch gas station details and oil prices
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Organize fetched data
        $gasStation = [
            'gas_station_details' => [
                'station_id' => $result[0]['StationID'],
                'station_name' => $result[0]['StationName'],
                'municipality_id' => $result[0]['MunicipalityID'],
                'address' => $result[0]['Address'],
                'contact_info' => $result[0]['ContactInfo'],
                'facilities' => [
                    'cafe_bar' => (bool)$result[0]['CafeBar'],
                    'toilet' => (bool)$result[0]['Toilet'],
                    'parking' => (bool)$result[0]['Parking'],
                    'car_wash' => (bool)$result[0]['CarWash']
                ]
            ],
            'oil_prices' => []
        ];

        foreach ($result as $row) {
            // Add oil prices to the gas station details
            $gasStation['oil_prices'][] = [
                'oil_type' => $row['OilType'],
                'octane_rating' => $row['OctaneRating'],
                'price' => $row['Price'],
                'last_updated' => $row['LastUpdated']
            ];
        }

        // Return gas station details with oil prices
        echo json_encode($gasStation, JSON_PRETTY_PRINT);
    } catch (PDOException $e) {
        Flight::halt(500, json_encode(['error' => true, 'message' => 'Failed to retrieve gas station details: ' . $e->getMessage()]));
    }
}


/**
 * Get Gas Stations by Municipality ID
 *
 * @OA\GET(
 *     path="/gas_stations_maunicipality/{municipality_id}",
 *     summary="Get Gas Stations by Municipality ID",
 *     description="Retrieve all gas stations in a municipality based on the municipality ID.",
 *     tags={"gas_stations"},
 *     @OA\Parameter(
 *         name="municipality_id",
 *         in="path",
 *         required=true,
 *         description="ID of the municipality",
 *         @OA\Schema(type="integer", format="int64")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gas stations retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="gas_stations", type="array", @OA\Items(type="object"))
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Failed to retrieve gas stations",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Failed to retrieve gas stations")
 *         )
 *     )
 * )
 */
public function getGasStationsByMunicipalityId($municipalityId) {
    try {
        // Prepare SQL query to select gas stations by municipality ID
        $query = "SELECT * FROM GasStations WHERE MunicipalityID = :municipalityId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':municipalityId', $municipalityId, PDO::PARAM_INT);
        $stmt->execute();

        // Fetch data from the result set
        $gasStations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Debug: Check if any gas stations were fetched
        if (empty($gasStations)) {
            echo json_encode(['error' => true, 'message' => 'No gas stations found for the specified municipality ID']);
            return; // Return to exit the function after sending the response
        }

        // Debug: Log fetched gas stations for inspection
        error_log('Fetched gas stations: ' . print_r($gasStations, true));

        // Return gas stations
        echo json_encode(['gas_stations' => $gasStations],JSON_PRETTY_PRINT);
    } catch (PDOException $e) {
        // Handle database connection or query errors
        Flight::halt(500, json_encode(['error' => true, 'message' => 'Failed to retrieve gas stations: ' . $e->getMessage()]));
    }
}


/**
 * Get Oil Prices and Gas Station Name for a Specific Gas Station
 *
 * @OA\GET(
 *     path="/gas_stations_oilinfo/{stationId}",
 *     summary="Get Oil Prices and Gas Station Name for a Specific Gas Station",
 *     description="Retrieve oil prices, oil type, octane rating, and the name of the gas station by ID from the database.",
 *     tags={"oilprices"},
 *     @OA\Parameter(
 *         name="stationId",
 *         in="path",
 *         required=true,
 *         description="ID of the gas station",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Oil prices, oil type, octane rating, and gas station name retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="gas_station_name", type="string", description="Name of the gas station"),
 *             @OA\Property(property="oil_prices", type="array", @OA\Items(
 *                 @OA\Property(property="oil_type", type="string", description="Type of the oil"),
 *                 @OA\Property(property="octane_rating", type="string", description="Octane rating of the oil"),
 *                 @OA\Property(property="price", type="number", format="float", description="Price of the oil"),
 *                 @OA\Property(property="last_updated", type="string", format="date-time", description="Date and time when the oil price was last updated")
 *             ))
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Gas station not found",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Gas station not found")
 *         )
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Failed to retrieve oil prices and gas station name",
 *         @OA\JsonContent(
 *             @OA\Property(property="error", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Failed to retrieve oil prices and gas station name")
 *         )
 *     )
 * )
 */
public function getOilPricesAndNameByStationId($stationId) {
    try {
        // Prepare SQL query to fetch gas station name, oil prices, oil type, and octane rating
        $query = "SELECT gs.StationName, o.OilType, o.OctaneRating, gso.Price, gso.LastUpdated
                  FROM GasStations gs
                  LEFT JOIN GasStationOils gso ON gs.StationID = gso.StationID
                  LEFT JOIN Oils o ON gso.OilID = o.OilID
                  WHERE gs.StationID = :stationId";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':stationId', $stationId, PDO::PARAM_INT);
        $stmt->execute();

        // Fetch gas station name and oil prices
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Check if gas station exists
        if (empty($result)) {
            Flight::halt(404, json_encode(['error' => true, 'message' => 'Gas station not found']));
        }

        // Organize fetched data
        $gasStationData = [
            'gas_station_name' => $result[0]['StationName'],
            'oil_prices' => []
        ];

        foreach ($result as $row) {
            // Add oil prices, oil type, and octane rating to the gas station data
            $gasStationData['oil_prices'][] = [
                'oil_type' => $row['OilType'],
                'octane_rating' => $row['OctaneRating'],
                'price' => $row['Price'],
                'last_updated' => $row['LastUpdated']
            ];
        }

        // Return gas station name and oil prices
        echo json_encode($gasStationData, JSON_PRETTY_PRINT);
    } catch (PDOException $e) {
        Flight::halt(500, json_encode(['error' => true, 'message' => 'Failed to retrieve gas station details: ' . $e->getMessage()]));
    }
}




}






    

