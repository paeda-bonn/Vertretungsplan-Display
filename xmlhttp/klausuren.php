<?php
/*
 * Copyright (c) 2020. Witt, Nils
 * MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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

