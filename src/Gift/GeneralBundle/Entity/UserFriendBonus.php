<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\UserFriendBonus
 */
class UserFriendBonus
{
    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var integer $user_id
     */
    private $user_id;

    /**
     * @var integer $friend_id
     */
    private $friend_id;

    /**
     * @var \DateTime $created_at
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
     * @return UserFriendBonus
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
     * Set friend_id
     *
     * @param integer $friendId
     * @return UserFriendBonus
     */
    public function setFriendId($friendId)
    {
        $this->friend_id = $friendId;
    
        return $this;
    }

    /**
     * Get friend_id
     *
     * @return integer 
     */
    public function getFriendId()
    {
        return $this->friend_id;
    }

    /**
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return UserFriendBonus
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
    public function processPrePersist()
    {
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
}
