<?php
require '../vendor/autoload.php'; 


Flight::route('GET /connection-check', function()  {

  $controller = new Sssd\Controller();
  
}); 




Flight::route('GET /gas_station_oil_prices', function() {
 
  $controller = new Sssd\Controller();

  $controller->getGasStationOilPrices();


});

Flight::route('GET /gas_station_oil_pricesid/@id', function($id) {
 
  $controller = new Sssd\Controller();

  $controller->getGasStationByIdWithPrices($id);


});


Flight::route('GET /gas_stations_maunicipality/@id', function($id) {
 
  $controller = new Sssd\Controller();

  $controller->getGasStationsByMunicipalityId($id);


});

Flight::route('GET /gas_stations_oilinfo/@id', function($id) {
 
  $controller = new Sssd\Controller();

  $controller->getOilPricesAndNameByStationId($id);


});










Flight::start();

?>