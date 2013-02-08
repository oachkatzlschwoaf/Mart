<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\User
 */
class User
{
    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var string $uid
     */
    private $uid;

    /**
     * @var string $first_name
     */
    private $first_name;

    /**
     * @var string $last_name
     */
    private $last_name;

    /**
     * @var string $nick
     */
    private $nick;

    /**
     * @var string $email
     */
    private $email;

    /**
     * @var string $box
     */
    private $box;

    /**
     * @var string $login
     */
    private $login;

    /**
     * @var string $link
     */
    private $link;

    /**
     * @var string $ref_type
     */
    private $ref_type;

    /**
     * @var integer $ref_id
     */
    private $ref_id;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set uid
     *
     * @param string $uid
     * @return User
     */
    public function setUid($uid)
    {
        $this->uid = $uid;
    
        return $this;
    }

    /**
     * Get uid
     *
     * @return string 
     */
    public function getUid()
    {
        return $this->uid;
    }

    /**
     * Set first_name
     *
     * @param string $firstName
     * @return User
     */
    public function setFirstName($firstName)
    {
        $this->first_name = $firstName;
    
        return $this;
    }

    /**
     * Get first_name
     *
     * @return string 
     */
    public function getFirstName()
    {
        return $this->first_name;
    }

    /**
     * Set last_name
     *
     * @param string $lastName
     * @return User
     */
    public function setLastName($lastName)
    {
        $this->last_name = $lastName;
    
        return $this;
    }

    /**
     * Get last_name
     *
     * @return string 
     */
    public function getLastName()
    {
        return $this->last_name;
    }

    /**
     * Set nick
     *
     * @param string $nick
     * @return User
     */
    public function setNick($nick)
    {
        $this->nick = $nick;
    
        return $this;
    }

    /**
     * Get nick
     *
     * @return string 
     */
    public function getNick()
    {
        return $this->nick;
    }

    /**
     * Set email
     *
     * @param string $email
     * @return User
     */
    public function setEmail($email)
    {
        $this->email = $email;
    
        return $this;
    }

    /**
     * Get email
     *
     * @return string 
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set box
     *
     * @param string $box
     * @return User
     */
    public function setBox($box)
    {
        $this->box = $box;
    
        return $this;
    }

    /**
     * Get box
     *
     * @return string 
     */
    public function getBox()
    {
        return $this->box;
    }

    /**
     * Set login
     *
     * @param string $login
     * @return User
     */
    public function setLogin($login)
    {
        $this->login = $login;
    
        return $this;
    }

    /**
     * Get login
     *
     * @return string 
     */
    public function getLogin()
    {
        return $this->login;
    }

    /**
     * Set link
     *
     * @param string $link
     * @return User
     */
    public function setLink($link)
    {
        $this->link = $link;
    
        return $this;
    }

    /**
     * Get link
     *
     * @return string 
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * Set ref_type
     *
     * @param string $refType
     * @return User
     */
    public function setRefType($refType)
    {
        $this->ref_type = $refType;
    
        return $this;
    }

    /**
     * Get ref_type
     *
     * @return string 
     */
    public function getRefType()
    {
        return $this->ref_type;
    }

    /**
     * Set ref_id
     *
     * @param integer $refId
     * @return User
     */
    public function setRefId($refId)
    {
        $this->ref_id = $refId;
    
        return $this;
    }

    /**
     * Get ref_id
     *
     * @return integer 
     */
    public function getRefId()
    {
        return $this->ref_id;
    }
    /**
     * @var integer $country_id
     */
    private $country_id;

    /**
     * @var string $country_name
     */
    private $country_name;

    /**
     * @var integer $region_id
     */
    private $region_id;

    /**
     * @var string $region_name
     */
    private $region_name;

    /**
     * @var integer $city_id
     */
    private $city_id;

    /**
     * @var string $city_name
     */
    private $city_name;

    /**
     * @var \DateTime $created_at
     */
    private $created_at;


    /**
     * Set country_id
     *
     * @param integer $countryId
     * @return User
     */
    public function setCountryId($countryId)
    {
        $this->country_id = $countryId;
    
        return $this;
    }

    /**
     * Get country_id
     *
     * @return integer 
     */
    public function getCountryId()
    {
        return $this->country_id;
    }

    /**
     * Set country_name
     *
     * @param string $countryName
     * @return User
     */
    public function setCountryName($countryName)
    {
        $this->country_name = $countryName;
    
        return $this;
    }

    /**
     * Get country_name
     *
     * @return string 
     */
    public function getCountryName()
    {
        return $this->country_name;
    }

    /**
     * Set region_id
     *
     * @param integer $regionId
     * @return User
     */
    public function setRegionId($regionId)
    {
        $this->region_id = $regionId;
    
        return $this;
    }

    /**
     * Get region_id
     *
     * @return integer 
     */
    public function getRegionId()
    {
        return $this->region_id;
    }

    /**
     * Set region_name
     *
     * @param string $regionName
     * @return User
     */
    public function setRegionName($regionName)
    {
        $this->region_name = $regionName;
    
        return $this;
    }

    /**
     * Get region_name
     *
     * @return string 
     */
    public function getRegionName()
    {
        return $this->region_name;
    }

    /**
     * Set city_id
     *
     * @param integer $cityId
     * @return User
     */
    public function setCityId($cityId)
    {
        $this->city_id = $cityId;
    
        return $this;
    }

    /**
     * Get city_id
     *
     * @return integer 
     */
    public function getCityId()
    {
        return $this->city_id;
    }

    /**
     * Set city_name
     *
     * @param string $cityName
     * @return User
     */
    public function setCityName($cityName)
    {
        $this->city_name = $cityName;
    
        return $this;
    }

    /**
     * Get city_name
     *
     * @return string 
     */
    public function getCityName()
    {
        return $this->city_name;
    }

    /**
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return User
     */
    public function setCreatedAt()
    {
        $this->created_at = new \DateTime;
    
        return $this;
    }

    /**
     * Get created_at
     *
     * @return \DateTime 
     */
    public function getCreatedAt()
    {
        return $this->created_at;
    }

    /**
     * @ORM\PrePersist
     */
    public function processPrePersist() {
        $this->setCreatedAt();
    }

    /**
     * @ORM\PostPersist
     */
    public function processPostPersist()
    {
        // Add your code here
    }

    /**
     * @ORM\PostUpdate
     */
    public function processPostUpdate()
    {
        // Add your code here
    }
    /**
     * @var boolean $gender
     */
    private $gender;


    /**
     * Set gender
     *
     * @param boolean $gender
     * @return User
     */
    public function setGender($gender)
    {
        $this->gender = $gender;
    
        return $this;
    }

    /**
     * Get gender
     *
     * @return boolean 
     */
    public function getGender()
    {
        return $this->gender;
    }
    /**
     * @var \DateTime $birthday
     */
    private $birthday;


    /**
     * Set birthday
     *
     * @param \DateTime $birthday
     * @return User
     */
    public function setBirthday($birthday) {
        if ($birthday) { 
            $dt = date_create($birthday);
            $this->birthday = $dt;
        }
    
        return $this;
    }

    /**
     * Get birthday
     *
     * @return \DateTime 
     */
    public function getBirthday()
    {
        return $this->birthday;
    }
    /**
     * @var integer $balance
     */
    private $balance;


    /**
     * Set balance
     *
     * @param integer $balance
     * @return User
     */
    public function setBalance($balance)
    {
        $this->balance = $balance;
    
        return $this;
    }

    /**
     * Get balance
     *
     * @return integer 
     */
    public function getBalance()
    {
        return $this->balance;
    }

    public function getAge() {
        if ($this->birthday) {
            $date = $this->birthday;
            $now = new \DateTime;
            $interval = $now->diff($date);
            return $interval->y;
        } else {
            return 0;
        }
    }

    public function getAgeInterval() {
        $age = $this->getAge();

        if ($age) {
            if ($age < 10) {
                return "_10";
            } else if ($age >= 10 && $age < 15) {
                return "10_15";
            } else if ($age >= 15 && $age < 20) {
                return "15_20";
            } else if ($age >= 20 && $age < 25) {
                return "20_25";
            } else if ($age >= 25 && $age < 30) {
                return "25_30";
            } else if ($age >= 30 && $age < 35) {
                return "30_35";
            } else if ($age >= 35 && $age < 40) {
                return "35_40";
            } else if ($age >= 40 && $age < 45) {
                return "40_45";
            } else if ($age >= 45 && $age < 50) {
                return "45_50";
            } else if ($age >= 50 && $age < 55) {
                return "50_55";
            } else if ($age >= 55) {
                return "55_";
            }
        } else {
            return 0;
        }
    }
    /**
     * @var integer
     */
    public $hearts;


    /**
     * Set hearts
     *
     * @param integer $hearts
     * @return User
     */
    public function setHearts($hearts)
    {
        $this->hearts = $hearts;
    
        return $this;
    }

    /**
     * Get hearts
     *
     * @return integer 
     */
    public function getHearts()
    {
        return $this->hearts;
    }
}