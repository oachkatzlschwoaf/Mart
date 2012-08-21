<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\UserGift
 */
class UserGift
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
}
