<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\BillingConfig
 */
class BillingConfig
{
    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var integer $service_id
     */
    private $service_id;

    /**
     * @var string $service_name
     */
    private $service_name;

    /**
     * @var integer $money
     */
    private $money;

    /**
     * @var integer $bonus
     */
    private $bonus;


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
     * Set service_id
     *
     * @param integer $serviceId
     * @return BillingConfig
     */
    public function setServiceId($serviceId)
    {
        $this->service_id = $serviceId;
    
        return $this;
    }

    /**
     * Get service_id
     *
     * @return integer 
     */
    public function getServiceId()
    {
        return $this->service_id;
    }

    /**
     * Set service_name
     *
     * @param string $serviceName
     * @return BillingConfig
     */
    public function setServiceName($serviceName)
    {
        $this->service_name = $serviceName;
    
        return $this;
    }

    /**
     * Get service_name
     *
     * @return string 
     */
    public function getServiceName()
    {
        return $this->service_name;
    }

    /**
     * Set money
     *
     * @param integer $money
     * @return BillingConfig
     */
    public function setMoney($money)
    {
        $this->money = $money;
    
        return $this;
    }

    /**
     * Get money
     *
     * @return integer 
     */
    public function getMoney()
    {
        return $this->money;
    }

    /**
     * Set bonus
     *
     * @param integer $bonus
     * @return BillingConfig
     */
    public function setBonus($bonus)
    {
        $this->bonus = $bonus;
    
        return $this;
    }

    /**
     * Get bonus
     *
     * @return integer 
     */
    public function getBonus()
    {
        return $this->bonus;
    }
    /**
     * @var integer $mailiki
     */
    private $mailiki;


    /**
     * Set mailiki
     *
     * @param integer $mailiki
     * @return BillingConfig
     */
    public function setMailiki($mailiki)
    {
        $this->mailiki = $mailiki;
    
        return $this;
    }

    /**
     * Get mailiki
     *
     * @return integer 
     */
    public function getMailiki()
    {
        return $this->mailiki;
    }
}