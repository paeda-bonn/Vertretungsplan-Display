<?php
/*
 * Copyright (c) 2020.
 */

require_once('../config.php');
$config = new Config;

$authkeys = $config->authkey;

$key = $_GET["key"];
if (!in_array($key, $authkeys)) {
    die("no auth");
}

$jsonKlausuren = file_get_contents($config->api_url . 'klausuren.php?active&upcoming&secret=' . $config->api_secret);
$data = json_decode($jsonKlausuren, true);

$output = array();

foreach ($data as $klausur) {
    $date = $klausur["Datum"];
    $grade = $klausur["Stufe"];
    $output[$date][$grade][] = $klausur;
}

$json = json_encode($output);
echo $json;

