<?php

namespace Gift\GeneralBundle\Controller;

# General
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

# Entity
use Gift\GeneralBundle\Entity\CategoryGift;
use Gift\GeneralBundle\Entity\User;
use Gift\GeneralBundle\Entity\UserGift;

# Services
use Gift\GeneralBundle\SocialApi;

class DefaultController extends Controller
{
    public function fetchUser(Request $r) {
        $sk  = $r->get('session_key');
        $uid = $r->get('oid');

        $mc = $this->get('beryllium_cache');
        
        $em = $this->getDoctrine()->getEntityManager();

        # Request user from session
        $user;
        $suid = $mc->get("sk_u-$sk");

        if ($suid) { 
            # We got a session!
            $uid = $suid;

            $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
            $user = $rep->find($uid);

            if (!$user) {
                throw new \Exception('User from session not correct');
            }

        } else {
            # Lookup user in DB
            $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
            $q = $rep->createQueryBuilder('p')
                ->where('p.uid = :uid')
                ->setParameters(array(
                    'uid'     => $uid
                ))
                ->getQuery();

            $user = $q->getResult();

            if (!$user) {
                # Fetch user via API
                $api = $this->get('social_api');
                $api->setNetwork('mm');
                $api->setCache($mc);
                $uinfo = $api->getUserInfo( $uid );

                if ($uinfo && $uinfo->uid == $uid) {
                    $email_arr = array();
                    preg_match("/my.mail.ru\/(\w+)\/(\w+)/", $uinfo->link, $email_arr);
                    $box   = $email_arr[1];
                    $login = $email_arr[2];
                    $email = '';

                    if ('corp' == $box) {
                        $email = "$login@corp.mail.ru"; 
                    } else {
                        $email = "$login@$box.ru"; 
                    }

                    # Save user 
                    $user = new User;

                    $user->setUid($uid);

                    $user->setGender( $uinfo->sex );
                    $user->setBirthday( $uinfo->birthday );

                    $user->setFirstName( $uinfo->first_name );
                    $user->setLastName( $uinfo->last_name );
                    $user->setNick( $uinfo->nick );

                    $user->setEmail( $email );
                    $user->setBox( $box );
                    $user->setLogin( $login );
                    $user->setLink( $uinfo->link );

                    $user->setRefType( $uinfo->referer_type );
                    $user->setRefId( $uinfo->referer_id );

                    $user->setCountryId( $uinfo->location->country->id );
                    $user->setCountryName( $uinfo->location->country->name );
                    $user->setCityId( $uinfo->location->city->id );
                    $user->setCityName( $uinfo->location->city->name );
                    $user->setRegionId( $uinfo->location->region->id );
                    $user->setRegionName( $uinfo->location->region->name );

                    $user->setBalance(0); # Default balance value for newbie

                    $em->persist($user);
                    $em->flush();

                } else {
                    throw new \Exception('User from API not correct');
                }

            } else {
                $user = $user[0];
            }
        }

        # Here we got a User

        # Set session
        $mc->set("u_sk-".$user->getId(), $sk, 86400);
        $mc->set("sk_u-$sk", $user->getId(), 86400);

        return $user;
    }

    public function getConfig() {
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Config');
        
        $conf = $rep->findAll();

        $config = array();
        foreach ($conf as $c) {
            $config[ $c->getName() ] = $c->getValue();
        }

        return $config;
    }

    public function indexAction(Request $r) {
        $sk  = $r->get('session_key');
        $uid = $r->get('oid');

        # Fetch user
        $user = $this->fetchUser($r);

        # Get gifts 
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Gift');
        
        $gifts = $rep->findAll();
        
        # Get covers 
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Cover');
        
        $covers = $rep->findAll();

        # Get config
        $config = $this->getConfig();         

        # Prepare template
        $name = $user->getNick();

        return $this->render('GiftGeneralBundle:Default:index.html.twig', 
            array(
                'sk'    => $sk,
                'user'  => $user,
                'gifts' => $gifts,
                'covers' => $covers,
                'config' => $config,
        ));
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

    public function getUserFriendsAction(Request $request) {
        $answer = array( 'error' => 'something wrong' );

        $sk = $request->get('sk');

        $mc  = $this->get('beryllium_cache');
        $uid = $mc->get("sk_u-$sk");

        if ($uid) {

            $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
            $user = $rep->find($uid);

            if ($user) {
                # Fetch user via API
                $api = $this->get('social_api');
                $api->setNetwork('mm');
                $api->setCache($mc);
                $friends = $api->getUserFriendsBySk( $sk );

                $answer = $friends;
            }
        }

        $response = new Response(json_encode($answer));
        #$response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function purchaseAction(Request $request) {
        $answer = array( 'error' => 'something wrong' );

        // Check session
        $sk = $request->get('sk');

        $mc  = $this->get('beryllium_cache');
        $uid = $mc->get("sk_u-$sk");

        if (!$uid) {
            $answer = array( 'error' => 'no user id' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $rep_user = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
        $user = $rep_user->find($uid);

        if (!$user) {
            $answer = array( 'error' => 'no user' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        // Check gift 
        $gid = $request->get('gift'); 

        if (!$gid) {
            $answer = array( 'error' => 'no gift id' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $rep_gift = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Gift');

        $gift = $rep_gift->find($gid);
        
        if (!$gift) {
            $answer = array( 'error' => 'no gift' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        // Check cover
        $cvid = $request->get('cover'); 

        if (!$cvid) {
            $answer = array( 'error' => 'no cover id' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $rep_cover = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Cover');

        $cover = $rep_cover->find($cvid);
        
        if (!$cover) {
            $answer = array( 'error' => 'no cover' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        // Check receiver 
        $rid = $request->get('receiver'); 

        $q = $rep_user->createQueryBuilder('p')
            ->where('p.uid = :uid')
            ->setParameters(array(
                'uid' => $rid
            ))
            ->getQuery();

        $receiver = $q->getResult();

        $no_app_user = 0;
        if (!$receiver) {
            $no_app_user = 1;
        }

        // Get text, privacy, incognito
        $text = $request->get('text');
        $privacy = $request->get('privacy');
        $incognito = $request->get('incognito');

        // Calculate Cost
        $config = $this->getConfig();         

        $cost = 0;

        $is_premium = $gift->getPremium();

        if ($is_premium > 0) {
            $cost = $config['gift_price_premium']; // Premium
        } elseif ($is_premium < 0) {
            $cost = 0; // Free
        } else {
            $cost = $config['gift_price']; // Normal
        }

        if (1 == $privacy) {
            $cost += $config['private_cost'];
        }

        if (1 == $incognito) {
            $cost += $config['incognito_cost'];
        }

        $cost += $cover->getCost(); 

        // Check balance
        if ($user->getBalance() >= $cost) {
            // OK
            $user->setBalance( $user->getBalance() - $cost );

            $ug = new UserGift();
            $ug->setGiftId($gid);
            $ug->setUserId($uid);
            $ug->setReceiver($rid);
            $ug->setPrivacy($privacy);
            $ug->setIncognito($incognito);
            $ug->setText($text);
            $ug->setCoverId($cvid);
            $ug->setIsOpen(0);

            $em = $this->getDoctrine()->getEntityManager();

            $em->persist($user);
            $em->persist($ug);

            $em->flush();

            $answer = array('no_app_user' => $no_app_user, 'done' => 'gift sended', 'balance' => $user->getBalance());

        } else {
            // Need more money
            $answer = array('no_app_user' => $no_app_user, 'balance_error' => 'need more money');

        }

        $response = new Response(json_encode($answer));
        #$response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
