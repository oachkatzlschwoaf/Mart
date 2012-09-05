<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\UserGift
 */
class UserGift
{
    public $created_date;

    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var integer $user_id
     */
    private $user_id;

    /**
     * @var string $receiver
     */
    private $receiver;

    /**
     * @var integer $gift_id
     */
    private $gift_id;

    /**
     * @var integer $privacy
     */
    private $privacy;

    /**
     * @var boolean $incognito
     */
    private $incognito;

    /**
     * @var string $text
     */
    private $text;

    /**
     * @var integer $cover_id
     */
    private $cover_id;

    /**
     * @var boolean $is_open
     */
    private $is_open;

    /**
     * @var \DateTime $created_at
     */
    private $created_at;

    public function getCreatedDate() {
        return $this->created_date;
    }

    public function setCreatedDate() {
        $this->created_date = $this->created_at->format("Y-m-d");
        return $this;
    }

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
     * Set user_id
     *
     * @param integer $userId
     * @return UserGift
     */
    public function setUserId($userId)
    {
        $this->user_id = $userId;
    
        return $this;
    }

    /**
     * Get user_id
     *
     * @return integer 
     */
    public function getUserId()
    {
        return $this->user_id;
    }

    /**
     * Set receiver
     *
     * @param string $receiver
     * @return UserGift
     */
    public function setReceiver($receiver)
    {
        $this->receiver = $receiver;
    
        return $this;
    }

    /**
     * Get receiver
     *
     * @return string 
     */
    public function getReceiver()
    {
        return $this->receiver;
    }

    /**
     * Set gift_id
     *
     * @param integer $giftId
     * @return UserGift
     */
    public function setGiftId($giftId)
    {
        $this->gift_id = $giftId;
    
        return $this;
    }

    /**
     * Get gift_id
     *
     * @return integer 
     */
    public function getGiftId()
    {
        return $this->gift_id;
    }

    /**
     * Set privacy
     *
     * @param integer $privacy
     * @return UserGift
     */
    public function setPrivacy($privacy)
    {
        $this->privacy = $privacy;
    
        return $this;
    }

    /**
     * Get privacy
     *
     * @return integer 
     */
    public function getPrivacy()
    {
        return $this->privacy;
    }

    /**
     * Set incognito
     *
     * @param boolean $incognito
     * @return UserGift
     */
    public function setIncognito($incognito)
    {
        $this->incognito = $incognito;
    
        return $this;
    }

    /**
     * Get incognito
     *
     * @return boolean 
     */
    public function getIncognito()
    {
        return $this->incognito;
    }

    /**
     * Set text
     *
     * @param string $text
     * @return UserGift
     */
    public function setText($text)
    {
        $this->text = $text;
    
        return $this;
    }

    /**
     * Get text
     *
     * @return string 
     */
    public function getText()
    {
        return $this->text;
    }

    /**
     * Set cover_id
     *
     * @param integer $coverId
     * @return UserGift
     */
    public function setCoverId($coverId)
    {
        $this->cover_id = $coverId;
    
        return $this;
    }

    /**
     * Get cover_id
     *
     * @return integer 
     */
    public function getCoverId()
    {
        return $this->cover_id;
    }

    /**
     * Set is_open
     *
     * @param boolean $isOpen
     * @return UserGift
     */
    public function setIsOpen($isOpen)
    {
        $this->is_open = $isOpen;
    
        return $this;
    }

    /**
     * Get is_open
     *
     * @return boolean 
     */
    public function getIsOpen()
    {
        return $this->is_open;
    }

    /**
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return UserGift
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
    public function getCreatedAt($format = null) {
        if ($format === "date") {
            return $this->created_at->format("Y-m-d");
        } elseif ($format === "date_time") {
            return $this->created_at->format("Y-m-d H:i");
        } 

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
     * @var string $user_name
     */
    private $user_name;


    /**
     * Set user_name
     *
     * @param string $userName
     * @return UserGift
     */
    public function setUserName($userName)
    {
        $this->user_name = $userName;
    
        return $this;
    }

    /**
     * Get user_name
     *
     * @return string 
     */
    public function getUserName()
    {
        return $this->user_name;
    }
    /**
     * @var string $user_box
     */
    private $user_box;

    /**
     * @var string $user_login
     */
    private $user_login;


    /**
     * Set user_box
     *
     * @param string $userBox
     * @return UserGift
     */
    public function setUserBox($userBox)
    {
        $this->user_box = $userBox;
    
        return $this;
    }

    /**
     * Get user_box
     *
     * @return string 
     */
    public function getUserBox()
    {
        return $this->user_box;
    }

    /**
     * Set user_login
     *
     * @param string $userLogin
     * @return UserGift
     */
    public function setUserLogin($userLogin)
    {
        $this->user_login = $userLogin;
    
        return $this;
    }

    /**
     * Get user_login
     *
     * @return string 
     */
    public function getUserLogin()
    {
        return $this->user_login;
    }
}