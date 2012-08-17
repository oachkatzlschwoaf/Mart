<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\CategoryGift
 */
class CategoryGift
{
    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var integer $category_id
     */
    private $category_id;

    /**
     * @var integer $gift_id
     */
    private $gift_id;


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
     * Set category_id
     *
     * @param integer $categoryId
     * @return CategoryGift
     */
    public function setCategoryId($categoryId)
    {
        $this->category_id = $categoryId;
    
        return $this;
    }

    /**
     * Get category_id
     *
     * @return integer 
     */
    public function getCategoryId()
    {
        return $this->category_id;
    }

    /**
     * Set gift_id
     *
     * @param integer $giftId
     * @return CategoryGift
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
}
