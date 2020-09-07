<?php
/*
 * Copyright (c) 2020.
 */

require_once('../config.php');
$config = new Config;

$authkeys = $config->authkey;

$key = $_GET["key"];
if (!in_array($key, $authkeys)) {
    http_response_code(401);
    die("no auth");
}

$url = $config->api_url . '/vertretungsplan.php?active&order=Lehrer,Stunde&secret=' . $config->api_secret;
$json = file_get_contents($url);

$data = json_decode($json, true);

function compareObj($firstObj, $secondObj)
{
    if ($firstObj['Kurs'] == $secondObj['Kurs']) {
        if ($firstObj['Fach'] == $secondObj['Fach']) {
            if ($firstObj['FachNew'] == $secondObj['FachNew']) {
                if ($firstObj['LehrerNeu'] == $secondObj['LehrerNeu']) {
                    if ($firstObj['RaumNew'] == $secondObj['RaumNew']) {
                        if ($firstObj['info'] == $secondObj['info']) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

if (isset($data["data"])) {
    if (isset($data["data"]["vertretungen"])) {

        $vertretungen = $data["data"]["vertretungen"];
        $keys = array_keys($data["data"]["vertretungen"]);
        for ($k = 0; $k < sizeof($keys); $k++) {

            $dateNew = array();
            $date = $data["info"]["days"][$k];
            if (is_array($data["data"]["vertretungen"][$keys[$k]])) {
                for ($i = 0; $i < sizeof($data["data"]["vertretungen"][$keys[$k]]); $i++) {

                    if ($i > 0) {

                        $currentObj = $data["data"]["vertretungen"][$keys[$k]][$i];
                        $privObj = $data["data"]["vertretungen"][$keys[$k]][$i - 1];
                        if (compareObj($currentObj, $privObj)) {

                            $privObj["Stunde"] = $privObj["Stunde"] . " / " . $currentObj["Stunde"];
                            array_splice($data["data"]["vertretungen"][$keys[$k]], $i, 1);
                            $data["data"]["vertretungen"][$keys[$k]][$i - 1] = $privObj;

                        } else {

                            $data["data"]["vertretungen"][$keys[$k]][$i] = $currentObj;

                        }
                    }
                }
            }
        }
    }
}
$json = json_encode($data);
echo $json;