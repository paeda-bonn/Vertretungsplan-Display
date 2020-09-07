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

$jsonAushang = file_get_contents($config->api_url . '/aushang.php?aushang=1&secret=' . $config->api_secret);

echo $jsonAushang;