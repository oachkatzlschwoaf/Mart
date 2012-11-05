<?php

namespace Gift\GeneralBundle;

use Symfony\Component\HttpFoundation\Request;

class SocialApi {

    private $network;
    private $settings;
    private $cache;

    public function __construct($args) {
        $this->settings = $args;
    }

    private function calcSecureSig($query) {
        ksort($query);

        $sig = '';
        foreach ($query as $v => $k) {
            $sig .= "$v=$k"; 
        }

        $sig .= $this->getSecretKey();

        return md5($sig);
    }

    private function getSecretKey() {
        return $this->settings[
            $this->network
        ]['secret_key']; 
    }        

    private function getApiUrl() {
        return $this->settings[
            $this->network
        ]['api_url']; 
    }        

    private function getAppId() {
        return $this->settings[
            $this->network
        ]['app_id']; 
    }        

    private function request($params, $opt) {

        if ($curl = curl_init()) {

                $url = $this->getApiUrl().'?'.http_build_query($params);

                $res  = null;
                $data = array();

                if (!isset($opt['not_cache'])) {
                    # Try find in cache 
                    $cache = $this->cache;
                    $md5_url = md5($url);
                    $res = $cache->get("api-$md5_url");
                    $out = '';

                    if ($res) {
                        # Get from cache
                        $data = json_decode($res);
                    } 
                }

                if (!$res || (!is_array($data) && $data->error->error_code)) {
                    # Process API request
                    curl_setopt($curl, CURLOPT_URL, $url);
                    curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
                    $out = curl_exec($curl);
                    curl_close($curl);

                    if (!isset($opt['not_cache'])) {
                        $cache->set("api-$md5_url", $out, 60 * 60);
                    }

                    $data = json_decode($out);
                }

                if (!is_array($data) && $data->error->error_code) {
                    return;
                }

                return $data;
        }


    }

    public function requestSecure($method, $params, $opt = array()) {

        $need_params = array(
            'method' => $method, 
            'app_id' => $this->settings['mm']['app_id'], 
            'secure' => 1,
        );

        $query = array_merge($need_params, $params); 
        $query['sig'] = $this->calcSecureSig($query);

        $data = $this->request($query, $opt);

        return $data;

    }

    public function setNetwork($arg) {
        $this->network = $arg;
        return 1;
    }


    public function setCache($cache) {
        $this->cache = $cache;
        return 1;
    }

    public function getUserInfo($uid) {
        $data = $this->requestSecure('users.getInfo', array('uids' => $uid)); 

        if ($data) {
            return $data[0];
        } else {
            return; 
        }
    }

    public function getUserFriendsBySk($sk) {
        $data = $this->requestSecure('friends.get', array('session_key' => $sk, "ext" => 1)); 

        if ($data) {
            usort($data, array("Gift\GeneralBundle\SocialApi", "cmpFriends"));
            return $data;
        } else {
            return array(); 
        }
    }

    public function cmpFriends($a, $b) {
        $pos1 = $a->{'first_name'};
        $pos2 = $b->{'first_name'};

        if ($pos1 == $pos2)
            return 0;
        else
            return ($pos1 < $pos2 ? -1 : 1);

    }

    public function get() {
        return 3;
    }

    public function sendNotify($uid, $text) {
        $data = $this->requestSecure(
            'notifications.send', 
            array('uids' => $uid, 'text' => $text),
            array('not_cache' => 1)
        ); 
    }
}

