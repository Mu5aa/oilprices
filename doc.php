<?php
require("vendor/autoload.php");
$openapi = \OpenApi\Generator::scan(['/Applications/XAMPP/xamppfiles/htdocs/cijenegorivabih/api']);
header('Content-Type: application/json');
echo $openapi->toJson();