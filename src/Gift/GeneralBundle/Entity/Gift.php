<?php

namespace Gift\GeneralBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Gift\GeneralBundle\Entity\Gift
 */
class Gift
{
    private $image_upload;
    private $thumbnail_upload;


    /**
     * @var \DateTime $created_at
     */
    private $created_at;

    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var string $title
     */
    private $title;

    /**
     * @var string $tags
     */
    private $tags;


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
     * @return Gift
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
     * Set tags
     *
     * @param string $tags
     * @return Gift
     */
    public function setTags($tags)
    {
        $this->tags = $tags;
    
        return $this;
    }

    /**
     * Get tags
     *
     * @return string 
     */
    public function getTags()
    {
        return $this->tags;
    }


    public function getImageUpload() {
        return $this->image_upload;
    }

    public function setImageUpload($image_upload) {
        $this->image_upload = $image_upload;
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
    public function processPrePersist() {
        $this->setCreatedAt();
    }

    /**
     * @ORM\PostPersist
     */
    public function processPostPersist() {
        $this->uploadImage();
    }


    /**
     * Set created_at
     *
     * @param \DateTime $createdAt
     * @return Gift
     */
    public function setCreatedAt() {
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

    public function uploadImage() {
        if ($this->image_upload) {

            $this->image_upload->move(
                $this->getUploadRootDir('images'), 
                $this->getId().'.png');

            $this->image_upload = null;
        }

        if ($this->thumbnail_upload) {
            $this->thumbnail_upload->move(
                $this->getUploadRootDir('thumbs'),
                $this->getId().'.png');

            $this->thumbnail_upload = null;
        }
    }

    public function getImageAbsolutePath() {
        return $this->getUploadRootDir('images').'/'.$this->getId().'.png';
    }

    public function getImageWebPath() {
        return $this->getUploadDir('images').'/'.$this->getId().'.png';
    }

    public function getThumbAbsolutePath() {
        return $this->getUploadRootDir('thumbs').'/'.$this->getId().'.png';
    }

    public function getThumbWebPath() {
        return $this->getUploadDir('thumbs').'/'.$this->getId().'.png';
    }

    protected function getUploadRootDir($type) {
        return __DIR__.'/../../../../web/'.$this->getUploadDir($type);
    }

    protected function getUploadDir($type) {
        return 'uploads/'.$type;
    }

    /**
     * @ORM\PostUpdate
     */
    public function processPostUpdate() {
        $this->uploadImage();
    }
    /**
     * @var integer $premium
     */
    private $premium;


    /**
     * Set premium
     *
     * @param integer $premium
     * @return Gift
     */
    public function setPremium($premium)
    {
        $this->premium = $premium;
    
        return $this;
    }

    /**
     * Get premium
     *
     * @return integer 
     */
    public function getPremium()
    {
        return $this->premium;
    }
}