<?php
header("content-type:application/json");
require_once '../tools/main.php';

if ((!isset($_REQUEST["serialids"]) || !is_array(json_decode($_REQUEST["serialids"]))) && (!isset($_REQUEST["mids"]) || !is_array(json_decode($_REQUEST["mids"])))){
    echo json_encode(array(
        "result" => null,
        "status" => false,
        "error" => "请提交正确的参数"
    ));
    exit;
}

$finalResult = array();

if (isset($_REQUEST["serialids"])){
    foreach (json_decode($_REQUEST["serialids"]) as $sid) {
        $options = array(
            'http' => array(
                'method' => 'POST',
                'header' => 'Content-type:application/x-www-form-urlencoded',
                'content' => http_build_query(array('serialid' => $sid)),
            )
        );
        $context = stream_context_create($options);
        $result = file_get_contents('http://'.PHP_HOST.'/media/songid.php', false, $context);
        $dic = (array)json_decode(preg_replace('/[^(\x20-\x7F)]*/','', $result));
        $output = (array)$dic['result'];
        $song = array(
        "serialid" => $sid,
        "song" => (array)$output['song'],
        );
        array_push($finalResult, $song);
    }

    formatResult($finalResult);
} else {
    foreach (json_decode($_REQUEST["mids"]) as $mid) {
        $options = array(
            'http' => array(
                'method' => 'POST',
                'header' => 'Content-type:application/x-www-form-urlencoded',
                'content' => http_build_query(array('mid' => $mid)),
            )
        );
        $context = stream_context_create($options);
        $result = file_get_contents('http://'.PHP_HOST.'/media/songid.php', false, $context);
        $dic = (array)json_decode(preg_replace('/[^(\x20-\x7F)]*/','', $result));
        $output = (array)$dic['result'];
        $song = array(
            "mid" => $mid,
            "song" => (array)$output['song'],
        );
        array_push($finalResult, $song);
    }

    formatResult($finalResult);
}

?>