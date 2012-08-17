<?php

namespace Gift\GeneralBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class GiftType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title')
            ->add('tags')
            ->add('image_upload', 'file')
            ->add('thumbnail_upload', 'file')
        ;
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Gift\GeneralBundle\Entity\Gift'
        ));
    }

    public function getName()
    {
        return 'gift_generalbundle_gifttype';
    }
}
