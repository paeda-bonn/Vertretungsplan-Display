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