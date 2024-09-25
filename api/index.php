<?php
require '../vendor/autoload.php'; 


Flight::route('GET /connection-check', function()  {

  $controller = new Sssd\Controller();
  $controller->checkConnection();
}); 


  Flight::route('POST /fetch_data_and_store', function(){
    $controller = new Sssd\Controller();
    $controller->fetchGasStationDataAndStore();
  });


  Flight::route('GET /cities', function() {
    $controller = new Sssd\Controller();
    $controller->getCities();
});

Flight::route('GET /oil_types', function() {
    $controller = new Sssd\Controller();
    $controller->getOilTypes();
});

Flight::route('GET /oil_prices', function() {
    $controller = new Sssd\Controller();
    $controller->getOilPrices();
});

Flight::route('GET /gas_station/@id', function($id) {
    $controller = new Sssd\Controller();
    $controller->getGasStationDetails($id);
});








Flight::start();

?>