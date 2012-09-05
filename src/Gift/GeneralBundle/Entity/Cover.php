<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\Cover
 */
class Cover
{
    private $thumbnail_upload;

    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var string $title
     */
    private $title;

    /**
     * @var integer $cost
     */
    private $cost;


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
     * Set title
     *
     * @param string $title
     * @return Cover
     */
    public function setTitle($title)
    {
        $this->title = $title;
    
        return $this;
    }

    /**
     * Get title
     *
     * @return string 
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set cost
     *
     * @param integer $cost
     * @return Cover
     */
    public function setCost($cost)
    {
        $this->cost = $cost;
    
        return $this;
    }

    /**
     * Get cost
     *
     * @return integer 
     */
    public function getCost()
    {
        return $this->cost;
    }

    public function getThumbnailUpload() {
        return $this->thumbnail_upload;
    }

    public function setThumbnailUpload($image_upload) {
        $this->thumbnail_upload = $image_upload;
    }

    /**
     * @ORM\PrePersist
     */
    public function processPrePersist()
    {
        // Add your code here
    }

    /**
     * @ORM\PostPersist
     */
    public function processPostPersist()
    {
        $this->uploadImage();
    }

    /**
     * @ORM\PostUpdate
     */
    public function processPostUpdate()
    {
        $this->uploadImage();
    }

    public function uploadImage() {
        if ($this->thumbnail_upload) {
            $this->thumbnail_upload->move(
                $this->getUploadRootDir('thumbs'),
                $this->getId().'.png');

            $this->thumbnail_upload = null;
        }
    }

    public function getAbsolutePath() {
        return $this->getUploadRootDir().'/'.$this->getId().'.png';
    }

    public function getWebPath() {
        return $this->getUploadDir().'/'.$this->getId().'.png';
    }

    protected function getUploadRootDir() {
        return __DIR__.'/../../../../web/'.$this->getUploadDir();
    }

    protected function getUploadDir() {
        return 'uploads/covers';
    }
}
