<?php

namespace Gift\GeneralBundle\Controller;

# General
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

# Entity
use Gift\GeneralBundle\Entity\Gift;
use Gift\GeneralBundle\Entity\Category;

# Forms
use Gift\GeneralBundle\Form\GiftType; 
use Gift\GeneralBundle\Form\CategoryType; 

class AdminController extends Controller {

    public function adminAction() {
        return $this->render('GiftGeneralBundle:Admin:index.html.twig');
    }

    public function giftAction(Request $request) {

        $gid = $request->get('gid');
        $gift = new Gift(); 

        if ($gid) {
            //Edit
            $rep = $this->getDoctrine()
                ->getRepository('GiftGeneralBundle:Gift');

            $gift = $rep->find($gid);
        }

        $form = $this->createForm(new GiftType(), $gift);

        # Process form
        if ($request->getMethod() == 'POST') {
            $form->bindRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getEntityManager();
                $em->persist($gift);
                $em->flush();

                return $this->redirect($this->generateUrl('adminEditGift', array('gid' => $gift->getId())));
            }
        }

        return $this->render('GiftGeneralBundle:Admin:gift.html.twig',
            array(
                'form' => $form->createView(),    
                'gid'  => $gid,
                'gift' => $gift,
        ));
    }

    public function giftsAction() {
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Gift');
        
        $gifts = $rep->findAll();

        return $this->render('GiftGeneralBundle:Admin:gifts.html.twig',
            array(
                'gifts' => $gifts
        ));
    }

    public function deleteGiftAction(Request $request) {
        $gid = $request->get('gid');

        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Gift');

        $gift = $rep->find($gid);
        
        if ($gift) {
            $em = $this->getDoctrine()->getEntityManager();
            $em->remove($gift);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('adminGifts'));
    }

    public function categoryAction(Request $request) {

        $cid = $request->get('cid');
        $category = new Category(); 

        if ($cid) {
            //Edit
            $rep = $this->getDoctrine()
                ->getRepository('GiftGeneralBundle:Category');

            $category = $rep->find($cid);
        }

        $form = $this->createForm(new CategoryType(), $category);

        # Process form
        if ($request->getMethod() == 'POST') {
            $form->bindRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getEntityManager();
                $em->persist($category);
                $em->flush();

                return $this->redirect($this->generateUrl('adminEditCategory', array('cid' => $category->getId())));
            }
        }

        return $this->render('GiftGeneralBundle:Admin:category.html.twig',
            array(
                'form'     => $form->createView(),    
                'cid'      => $cid,
                'category' => $category,
        ));
    }

    public function categoriesAction() {
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Category');
        
        $categories = $rep->findAll();

        return $this->render('GiftGeneralBundle:Admin:categories.html.twig',
            array(
                'categories' => $categories
        ));
    }

    public function deleteCategoryAction(Request $request) {
        $cid = $request->get('cid');

        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Category');

        $category = $rep->find($cid);
        
        if ($category) {
            # Delete category
            $em = $this->getDoctrine()->getEntityManager();
            $em->remove($category);

            # Delete category <-> gifts
            $rep = $this->getDoctrine()
                ->getRepository('GiftGeneralBundle:CategoryGift');

            $q = $rep->createQueryBuilder('p')
                ->where('p.category_id = :cid')
                ->setParameters(array(
                    'cid' => $cid,
                ))
                ->getQuery();
                
            $pairs = $q->getResult();

            foreach ($pairs as $pair) {
                $em->remove($pair);
            }
            

            $em->flush();
        }

        return $this->redirect($this->generateUrl('adminCategories'));
    }
}
