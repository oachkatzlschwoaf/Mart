<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * UserHeart
 */
class UserHeart
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var integer
     */
    private $user_id;

    /**
     * @var string
     */
    private $user_name;

    /**
     * @var string
     */
    private $user_box;

    /**
     * @var string
     */
    private $user_login;

    /**
     * @var string
     */
    private $receiver;

    /**
     * @var \DateTime
     */
    private $created_at;


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
     * @return UserHeart
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
     * Set user_name
     *
     * @param string $userName
     * @return UserHeart
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
     * Set user_box
     *
     * @param string $userBox
     * @return UserHeart
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
     * @return UserHeart
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

    /**
     * Set receiver
     *
     * @param string $receiver
     * @return UserHeart
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
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return UserHeart
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
     * @var integer
     */
    private $type;


    /**
     * Set type
     *
     * @param integer $type
     * @return UserHeart
     */
    public function setType($type)
    {
        $this->type = $type;
    
        return $this;
    }

    /**
     * Get type
     *
     * @return integer 
     */
    public function getType()
    {
        return $this->type;
    }
}