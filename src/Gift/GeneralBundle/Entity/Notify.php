<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\Notify
 */
class Notify
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
     * @var integer $text_id
     */
    private $text_id;


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
     * @return Notify
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
     * Set text_id
     *
     * @param integer $textId
     * @return Notify
     */
    public function setTextId($textId)
    {
        $this->text_id = $textId;
    
        return $this;
    }

    /**
     * Get text_id
     *
     * @return integer 
     */
    public function getTextId()
    {
        return $this->text_id;
    }
    /**
     * @var \DateTime $created_at
     */
    private $created_at;


    /**
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return Notify
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
