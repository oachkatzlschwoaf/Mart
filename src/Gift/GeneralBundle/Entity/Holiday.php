<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Holiday
 */
class Holiday
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var integer
     */
    private $holiday_id;

    /**
     * @var string
     */
    private $name;

    /**
     * @var integer
     */
    private $day;

    /**
     * @var integer
     */
    private $month;

    /**
     * @var integer
     */
    private $type;

    /**
     * @var string
     */
    private $description;


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
     * Set holiday_id
     *
     * @param integer $holidayId
     * @return Holiday
     */
    public function setHolidayId($holidayId)
    {
        $this->holiday_id = $holidayId;
    
        return $this;
    }

    /**
     * Get holiday_id
     *
     * @return integer 
     */
    public function getHolidayId()
    {
        return $this->holiday_id;
    }

    /**
     * Set name
     *
     * @param string $name
     * @return Holiday
     */
    public function setName($name)
    {
        $this->name = $name;
    
        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set day
     *
     * @param integer $day
     * @return Holiday
     */
    public function setDay($day)
    {
        $this->day = $day;
    
        return $this;
    }

    /**
     * Get day
     *
     * @return integer 
     */
    public function getDay()
    {
        return $this->day;
    }

    /**
     * Set month
     *
     * @param integer $month
     * @return Holiday
     */
    public function setMonth($month)
    {
        $this->month = $month;
    
        return $this;
    }

    /**
     * Get month
     *
     * @return integer 
     */
    public function getMonth()
    {
        return $this->month;
    }

    /**
     * Set type
     *
     * @param integer $type
     * @return Holiday
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

    /**
     * Set description
     *
     * @param string $description
     * @return Holiday
     */
    public function setDescription($description)
    {
        $this->description = $description;
    
        return $this;
    }

    /**
     * Get description
     *
     * @return string 
     */
    public function getDescription()
    {
        return $this->description;
    }
}
