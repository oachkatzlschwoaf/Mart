<?php

namespace Gift\GeneralBundle\Controller;

# General
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

# Entity
use Gift\GeneralBundle\Entity\CategoryGift;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('GiftGeneralBundle:Default:index.html.twig', array('name' => $name));
    }

    public function adminAction()
    {
        $name = 123;
        return $this->render('GiftGeneralBundle:Default:index.html.twig', array('name' => $name));
    }

    # API
    public function giftsAction() {
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Gift');
        
        $gifts = $rep->findAll();

        $serializer = $this->get('serializer');
        $json = $serializer->serialize($gifts, 'json');
        $response = new Response($json);

        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function categoriesAction() {
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Category');
        
        $cats = $rep->findAll();

        $serializer = $this->get('serializer');
        $json = $serializer->serialize($cats, 'json');
        $response = new Response($json);

        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function saveCategoryGiftAction(Request $request) {
        $cid = $request->get('cid');
        $gid = $request->get('gid');

        $answer = array('error' => 'cannot find category or gift');

        # Lookup cateogry
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Category');

        $category = $rep->find($cid);

        # Lookup gift
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Gift');

        $gift = $rep->find($gid);

        if ($category && $gift) {

            # Is exist?
            $rep = $this->getDoctrine()
                ->getRepository('GiftGeneralBundle:CategoryGift');

            $q = $rep->createQueryBuilder('p')
                ->where('p.category_id = :cid and p.gift_id = :gid')
                ->setParameters(array(
                    'cid' => $cid,
                    'gid' => $gid
                ))
                ->getQuery();
                
            $pair = $q->getResult();

            $answer = array('error' => 'pair exists');

            if (!$pair) {
                $answer = array('done' => 'pair created');
                $cat_gift = new CategoryGift();
                $cat_gift->setCategoryId( $cid );
                $cat_gift->setGiftId( $gid );

                $em = $this->getDoctrine()->getEntityManager();
                $em->persist($cat_gift);
                $em->flush();
            }
        }
        
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function categoryGiftsAction(Request $request) {
        $cid = $request->get('cid');

        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:CategoryGift');

        $q = $rep->createQueryBuilder('p')
            ->where('p.category_id = :cid')
            ->setParameters(array(
                'cid' => $cid,
            ))
            ->getQuery();
            
        $pairs = $q->getResult();

        $answer = array();
        $response = new Response(json_encode($answer));

        if ($pairs && count($pairs > 0)) {

            $serializer = $this->get('serializer');
            $json = $serializer->serialize($pairs, 'json');
            $response = new Response($json);

        }

        return $response;
    }

    public function removeCategoryGiftAction(Request $request) {
        $cid = $request->get('cid');
        $gid = $request->get('gid');

        $answer = array('error' => 'cannot find category or gift');

        if ($cid && $gid) {

            # Is exist?
            $rep = $this->getDoctrine()
                ->getRepository('GiftGeneralBundle:CategoryGift');

            $q = $rep->createQueryBuilder('p')
                ->where('p.category_id = :cid and p.gift_id = :gid')
                ->setParameters(array(
                    'cid' => $cid,
                    'gid' => $gid
                ))
                ->getQuery();
                
            $pair = $q->getResult();

            $answer = array('error' => 'pair not exists');

            if ($pair) {
                $pair = $pair[0];
                $answer = array('done' => 'pair removed');

                $em = $this->getDoctrine()->getEntityManager();
                $em->remove($pair);
                $em->flush();
            }
        }
        
        $response = new Response(json_encode($answer));
        return $response;
    }
}
