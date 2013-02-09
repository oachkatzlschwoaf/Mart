<?php

namespace Gift\GeneralBundle\Controller;

# General
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

# Entity
use Gift\GeneralBundle\Entity\Gift;
use Gift\GeneralBundle\Entity\CategoryGift;
use Gift\GeneralBundle\Entity\User;
use Gift\GeneralBundle\Entity\UserGift;
use Gift\GeneralBundle\Entity\Transaction;
use Gift\GeneralBundle\Entity\BillingConfig;
use Gift\GeneralBundle\Entity\UserFriendBonus;
use Gift\GeneralBundle\Entity\Notify;
use Gift\GeneralBundle\Entity\Holiday;
use Gift\GeneralBundle\Entity\UserHeart;
use Gift\GeneralBundle\Entity\UserHeartCount;

# Services
use Gift\GeneralBundle\SocialApi;

class DefaultController extends Controller
{
    public function decline($n, $forms) {
      return $n%10==1&&$n%100!=11?$forms[0]:($n%10>=2&&$n%10<=4&&($n%100<10||$n%100>=20)?$forms[1]:$forms[2]);
    }


    public function addFriendInviteBonus($uid, $fid) {
        # Lookup user by uid
        $em = $this->getDoctrine()->getEntityManager();
        
        $users = $em->createQuery("select p from GiftGeneralBundle:User p WHERE p.uid = :uid")
            ->setParameter('uid', $uid)
            ->getResult();

        if ($users && count($users) > 0) {
            $u = $users[0];

            # Check was bonus in present
            $ubp = $em->createQuery("select p from GiftGeneralBundle:UserFriendBonus p WHERE p.user_id = :uid and p.friend_id = :fid")
            ->setParameter('uid', $u->getId())
            ->setParameter('fid', $fid)
            ->getResult();

            if (!$ubp) {
                $config = $this->getConfig();         

                # Increase balance
                $balance = $u->getBalance();
                $u->setBalance( $balance + $config['invite_bonus'] );
                $em->persist($u);

                # Persist bonus 
                $ub = new UserFriendBonus;  

                $ub->setUserId( $u->getId() );
                $ub->setFriendId( $fid );
                $em->persist($ub);

                $em->flush();

                return 1;
            }
        }

        return;
    }

    public function fetchUser(Request $r, $config) {
        $sk  = $r->get('session_key');
        $uid = $r->get('oid');

        $mc = $this->get('beryllium_cache');
        
        $em = $this->getDoctrine()->getEntityManager();

        # Request user from session
        $user;
        $suid = $mc->get("sk_u-$sk");
        $is_install = 0;

        if ($suid) { 
            # We got a session!
            $uid = $suid;

            $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
            $user = $rep->find($uid);

            if (!$user) {
                $mc->delete("sk_u-$sk");
                throw new \Exception('User from session not correct');
            }

        } else {
            # Lookup user in DB
            $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
            $q = $rep->createQueryBuilder('p')
                ->where('p.uid = :uid')
                ->setParameters(array(
                    'uid' => $uid
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
                    preg_match("/my.mail.ru\/(\S+)\/(\S+)\//", $uinfo->link, $email_arr);
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

                    if (isset($uinfo->location)) {

                        if (isset($uinfo->location->country)) {
                            $user->setCountryId( $uinfo->location->country->id );
                            $user->setCountryName( $uinfo->location->country->name );
                        }

                        if (isset($uinfo->location->city)) {
                            $user->setCityId( $uinfo->location->city->id );
                            $user->setCityName( $uinfo->location->city->name );
                        }

                        if (isset($uinfo->location->region)) {
                            $user->setRegionId( $uinfo->location->region->id );
                            $user->setRegionName( $uinfo->location->region->name );
                        }
                    }

                    $user->setBalance($config['start_bonus']); # Default balance value for newbie

                    $em->persist($user);
                    $em->flush();

                    // Check if HeartCount exists
                    $hc = $this->getDoctrine()->getEntityManager()
                        ->createQuery('select p FROM GiftGeneralBundle:UserHeartCount p where p.uid = :uid')
                        ->setParameter('uid', $uid)
                        ->getResult();
                    
                    if (count($hc) == 0) {
                        $uh_count = new UserHeartCount; 
                        $uh_count->setUid( $uid );
                        $uh_count->setCount( $config['hearts_start_count'] );

                        $em->persist($uh_count);
                        $em->flush();
                    }

                    $is_install = 1;

                    # Check friend invite bonus
                    if ($user->getRefType() == 'invitation' && $user->getRefId()) {
                        # Add bonus to inviter
                        if ( $this->addFriendInviteBonus($user->getRefId(), $user->getId()) ) {
                        }
                    }

                } else {
                    throw new \Exception('User from API not correct');
                }

            } else {
                $user = $user[0];
            }
        }

        # Set session
        $mc->set("u_sk-".$user->getId(), $sk, 86400);
        $mc->set("sk_u-$sk", $user->getId(), 86400);

        return array($user, $is_install);
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
        $ref = $r->get('referer_type');

        $dt = new \DateTime;
        $today = $dt->format("Y-m-d");

        # Get config
        $config = $this->getConfig();         

        # Fetch user
        list($user, $is_install) = $this->fetchUser($r, $config);

        # Get hearts count
        $hc = $this->getDoctrine()->getEntityManager()
            ->createQuery('select p FROM GiftGeneralBundle:UserHeartCount p where p.uid = :uid')
            ->setParameter('uid', $user->getUid())
            ->getResult();
        
        $hearts_count = 0;
        if (count($hc) > 0) {
            $hearts_count = $hc[0]->getCount(); 
        }
        
        # Get hearts count for Today
        $hc_today_cnt = $this->getDoctrine()->getEntityManager()
            ->createQuery('select count(p) FROM GiftGeneralBundle:UserHeart p where p.created_at > :dt and p.receiver = :uid')
            ->setParameter('uid', $user->getUid())
            ->setParameter('dt', $today)
            ->getSingleScalarResult();

        # Get hearts limit
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:UserHeart');

        $q = $rep->createQueryBuilder('p')
            ->where('p.user_id = :uid and p.type = :type')
            ->setParameters(array(
                'uid' => $user->getId(),
                'type' => 0 // free
            ))
            ->orderBy('p.id', 'DESC')
            ->setMaxResults(1)
            ->getQuery();
            
        $user_hearts = $q->getResult();

        $now = new \DateTime;
        $now->modify("-1 hour");

        $hearts_limit = array();
        $hearts_limit['y'] = $now->format('Y');
        $hearts_limit['m'] = $now->format('n');
        $hearts_limit['d'] = $now->format('j');
        $hearts_limit['h'] = $now->format('G');
        $hearts_limit['i'] = round($now->format('i'));

        if (count($user_hearts) > 0) {
            $now = new \DateTime;
            $created = $user_hearts[0]->getCreatedAt();
            
            $diff = round($now->format('U')) - round($created->format('U'));
            if ($diff <= $config['heart_interval']) {
                $created->modify("+".($config['heart_interval'] / (60 * 60))." hours");

                $hearts_limit['y'] = $created->format('Y');
                $hearts_limit['m'] = $created->format('n');
                $hearts_limit['d'] = $created->format('j');
                $hearts_limit['h'] = $created->format('G');
                $hearts_limit['i'] = round($created->format('i'));
            }
        }

        # Get covers 
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Cover');
        
        $covers = $rep->findAll();

        # Get categories in rotation
        $categories = $this->getDoctrine()->getEntityManager()
            ->createQuery('select p FROM GiftGeneralBundle:Category p where p.rotation > 0 order by p.rotation ASC')
            ->getResult();

        $bconfig = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:BillingConfig')
            ->findAll();

        # Prepare template
        $name = $user->getNick();
        $gift = new Gift;

        # User config
        $sex = 'male';
        if ($user->getGender() == 1) {
            $sex = 'female';
        }

        $age = $user->getAge();
        $age_interval = $user->getAgeInterval();

        return $this->render('GiftGeneralBundle:Default:index.html.twig', array(
            'sk'           => $sk,
            'user'         => $user,
            'sex'          => $sex,
            'age'          => $age,
            'age_interval' => $age_interval,
            'covers'       => $covers,
            'categories'   => $categories,
            'config'       => $config,
            'bconfig'      => $bconfig,
            'gift'         => $gift,
            'is_install'   => $is_install,
            'ref'          => $ref,
            'today'        => $today,
            'hearts_count' => $hearts_count,
            'hc_today_cnt' => $hc_today_cnt,
            'hc_today_wrd' => $this->decline($hc_today_cnt, array('сердечко', 'сердечка', 'сердечек')),
            'hearts_limit' => $hearts_limit,
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
        $cid    = $request->get('cid');
        $limit  = $request->get('limit');
        $sortby = $request->get('sort_by');
        $ext    = $request->get('ext');

        if (!$sortby) {
            $sortby = 'created_at';
        }

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

            if ($ext) {
                # Get gifts 
                $rep = $this->getDoctrine()
                    ->getRepository('GiftGeneralBundle:Gift');
                
                $gifts = $rep->findAll();

                $gift_hash = array();
                foreach ($gifts as $gift) {
                    $gift_hash[$gift->getId()] = $gift; 
                }

                $res = array();
                $i = 1;
                foreach ($pairs as $pair) {
                    array_push($res, $gift_hash[ $pair->getGiftId() ]); 

                    $i++;

                    if ($limit > 0 && $i > $limit) {
                        break;
                    }
                }

                if ($sortby == 'created_at') {
                    usort($res, function($a, $b) {
                        return $b->getId()-$a->getId(); 
                    }); 
                } elseif ($sortby == 'popularity') {
                    usort($res, function($a, $b) {
                        return $b->getPopularity7()-$a->getPopularity7(); 
                    }); 
                }

                $serializer = $this->get('serializer');
                $json = $serializer->serialize($res, 'json');
                $response = new Response($json);

                return $response;
            }

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
                # Fetch friends  via API
                $api = $this->get('social_api');
                $api->setNetwork('mm');
                $api->setCache($mc);
                $friends = $api->getUserFriendsBySk( $sk );

                $answer = $friends;
            }
        }

        $response = new Response(json_encode($answer));

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
        // no cover, sorry :-)
        $cvid = 0;

        /*
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
        */

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

        //$cost += $cover->getCost(); 

        // Check balance
        if ($user->getBalance() >= $cost) {
            // OK
            $user->setBalance( $user->getBalance() - $cost );

            $name = $user->getFirstName().' '.$user->getLastName();
            if (strlen($name) < 3) {
                $name = $user->getNick();
            }

            $ug = new UserGift();
            $ug->setGiftId($gid);
            $ug->setUserId($uid);
            $ug->setUserName($name);
            $ug->setUserBox($user->getBox());
            $ug->setUserLogin($user->getLogin());
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

            // Increase hearts count
            for ($i = 0; $i < $config['gift_hearts_count']; $i++) {  
                $this->sendHeart($user, $rid, 1);
            }

            $answer = array('no_app_user' => $no_app_user, 'done' => 'gift sended', 'balance' => $user->getBalance());

        } else {
            // Need more money
            $answer = array('no_app_user' => $no_app_user, 'balance_error' => 'need more money', 'need' => abs($cost - $user->getBalance()));
        }

        $response = new Response(json_encode($answer));
        #$response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function sendNotifyAction(Request $r) {
        $uid = $r->get('uid');
        $tid = $r->get('text_id');

        $em = $this->getDoctrine()->getEntityManager();

        $user = $em->createQuery('select p FROM GiftGeneralBundle:User p where p.uid = :uid')
            ->setParameter('uid', $uid)
            ->getResult();

        $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:NotifyText');
        $text = $rep->find($tid);

        if ($user && $text) {
            $user = $user[0];

            $n = new Notify;
            $n->setUserId($user->getId());
            $n->setTextId($text->getId());
            
            $em->persist($n);
            $em->flush();

            $answer = array( 'done' => 'sended' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $answer = array( 'error' => 'no user' );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function getUserGiftsAction(Request $request) {
        // Check session
        $sk      = $request->get('sk');
        $user_id = $request->get('uid');

        $sel_user_id = '';

        if ($user_id) {
            $sel_user_id = $user_id;
                
        } else if ($sk) {
            $mc  = $this->get('beryllium_cache');
            $uid = $mc->get("sk_u-$sk");

            $rep_user = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
            $user = $rep_user->find($uid);

            if (!$user) {
                $answer = array( 'error' => "no user" );
                $response = new Response(json_encode($answer));
                return $response;
            }

            $sel_user_id = $user->getUid();
        }

        // Get user gifts
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:UserGift');

        $q = $rep->createQueryBuilder('p')
            ->where('p.receiver = :uid')
            ->setParameters(array(
                'uid'     => $sel_user_id,
            ))
            ->orderBy('p.id', 'DESC')
            ->getQuery();
            
        $user_gifts = $q->getResult();

        foreach ($user_gifts as $ug) {
            $ug->setCreatedDate();
            if ($ug->getIncognito()) {
                $ug->setUserName('');
                $ug->setUserBox('');
                $ug->setUserLogin('');
                //$ug->setUserId('');
            }
        }

        $serializer = $this->get('serializer');
        $json = $serializer->serialize($user_gifts, 'json');

        $response = new Response($json);
        #$response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function openGiftAction(Request $request) {
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

        // Get user gift pair
        $ugid = $request->get('ugid');

        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:UserGift');

        $ug = $rep->find($ugid);

        if ($ug) {
            // Open it
            $em = $this->getDoctrine()->getEntityManager();

            $first_time = 0;
            if (!$ug->getIsOpen()) {
                $first_time = 1;
            }

            $ug->setIsOpen(1);

            $em->persist($ug);
            $em->flush();

            $answer = array( 'open' => 'done', 'first_time' => $first_time );
            $response = new Response(json_encode($answer));
            return $response;

        } else {
            $answer = array( 'error' => 'no user gift' );
            $response = new Response(json_encode($answer));
            return $response;
        }
    }

    public function purchasesAction(Request $request) {
        $from = $request->get('from');
        $to   = $request->get('to');

        if (!$from || !$to) {
            $answer = array( 'error' => 'no date' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $em = $this->getDoctrine()->getEntityManager();
        $query = $em->createQuery(
            "select p from GiftGeneralBundle:UserGift p WHERE p.created_at > :from and p.created_at < :to")
        ->setParameter('from', $from)
        ->setParameter('to', $to);

        $ps = $query->getResult();

        $serializer = $this->get('serializer');
        $json = $serializer->serialize($ps, 'json');
        $response = new Response($json);
        return $response;
    }

    public function setGiftPopularityAction(Request $request) {
        $gid = $request->get('gid'); 
        $pop = $request->get('popularity'); 

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
        
        $gift->setPopularity7( $pop ); 

        $em = $this->getDoctrine()->getEntityManager();

        $em->persist($gift);
        $em->flush();

        $answer = array( 'done' => 'popularity saved' );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function increaseBalanceAction(Request $r) {
        $app_id = $r->get('app_id');
        $tid    = $r->get('transaction_id');
        $sid    = $r->get('service_id');
        $uid    = $r->get('uid');
        $sig    = $r->get('sig');

        $price   = round($r->get('mailiki_price'));
        $o_price = round($r->get('other_price'));
        $profit  = round($r->get('profit'));
        $debug   = round($r->get('debug'));

        $user = $this->getDoctrine()->getEntityManager()
            ->createQuery('select p FROM GiftGeneralBundle:User p where p.uid = :uid')
            ->setParameter('uid', $uid)
            ->getResult();

        if (!$user) {
            $answer = array( 'status' => 2, 'error_code' => 701 );
            $response = new Response(json_encode($answer));
            return $response;
        } else {
            $user = $user[0];
        }

        // Check payment 
        $bcs = $this->getDoctrine()->getEntityManager()
            ->createQuery('select p from GiftGeneralBundle:BillingConfig p where p.service_id = :sid')
            ->setParameter('sid', $sid)
            ->getResult();

        if (!$bcs) {
            $answer = array( 'status' => 2, 'error_code' => 701 );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $bc = $bcs[0];

        if ($sid != $bc->getServiceId() || $price != $bc->getMailiki()) {
            $answer = array( 'status' => 2, 'error_code' => 701 );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $config = $this->getConfig();         
        
        $balance = $user->getBalance();

        // Transaction

        $t = new Transaction;
        $t->setTid( $tid );
        $t->setServiceId( $sid );
        $t->setUid( $uid );
        $t->setMailikiPrice( $price );
        $t->setOtherPrice( $o_price );
        $t->setProfit( $profit );
        $t->setDebug( $debug );

        // Increase user balance

        $user->setBalance($balance + $bc->getMoney() + $bc->getBonus()); 
        
        $em = $this->getDoctrine()->getEntityManager();
        $em->persist($user);
        $em->persist($t);
        $em->flush();

        $answer = array( 'status' => 1 );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function getUsersCountAction() {
        $em = $this->getDoctrine()->getEntityManager();

        $count = $em->createQuery("select count(p.id) from GiftGeneralBundle:User p")
            ->getSingleResult();

        $answer = array( 'count' => $count[1] );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function getUsersAction(Request $r) {
        $limit = $r->get('limit');
        $offset = $r->get('offset');

        $em = $this->getDoctrine()->getEntityManager();

        $users = $this->getDoctrine()->getRepository('GiftGeneralBundle:User')
            ->findBy(array(), array(), $limit, $offset);        
        
        $serializer = $this->get('serializer');
        $json = $serializer->serialize($users, 'json');
        $response = new Response($json);
        return $response;
    }

    public function notifyAction(Request $r) {
        $uid = $r->get('uid');
        $tid = $r->get('text_id');

        # Get user
        $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
        $user = $rep->find($uid);

        if (!$user) {
            $answer = array( 'error' => 'user not found' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        # Get text
        $rep = $this->getDoctrine()->getRepository('GiftGeneralBundle:NotifyText');
        $text = $rep->find($tid);

        if (!$text) {
            $answer = array( 'error' => 'text not found' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $mess = $text->getText();

        $mess = preg_replace('/\%user\%/', $user->getNick(), $mess);

        $api = $this->get('social_api');
        $api->setNetwork('mm');
        $uinfo = $api->sendNotify( $user->getUid(), $mess );
        
        $answer = array( 'done' => 'sended' );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function getNotifyAction(Request $r) {
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:Notify');
        
        $notify = $rep->findAll();

        $serializer = $this->get('serializer');
        $json = $serializer->serialize($notify, 'json');
        $response = new Response($json);

        $em = $this->getDoctrine()->getEntityManager();

        foreach ($notify as $n) {
            $em->remove($n);
            $em->flush();
        }

        return $response;
    }

    public function getUidAction(Request $r) {
        $id = $r->get('id'); 

        $rep_user = $this->getDoctrine()->getRepository('GiftGeneralBundle:User');
        $user = $rep_user->find($id);
        
        $answer = array( 'uid' => $user->getUid() );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function getBalanceAction(Request $request) {
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

        $answer = array( 'balance' => $user->getBalance() );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function _get_holidays($month, $day) {
        $em = $this->getDoctrine()->getEntityManager();

        $holidays = $em->createQuery("select p from GiftGeneralBundle:Holiday p WHERE p.month = :month and p.day = :day")
            ->setParameter('month', $month)
            ->setParameter('day', $day)
            ->getResult();

        return $holidays;
    }

    public function getHolidaysAction(Request $request) {
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

        $now = new \DateTime;

        # Birthdays: Friends fetch via API
        $api = $this->get('social_api');
        $api->setNetwork('mm');
        $api->setCache($mc);
        $friends = $api->getUserFriendsBySk( $sk );

        $fr_array = array();

        foreach ($friends as $f) {
            if ($f->{'birthday'}) {
                $date = \DateTime::createFromFormat('d.m.Y', $f->{'birthday'});

                $interval = $now->diff($date);

                $f->{'name'} = $f->{'nick'};
                if ($f->{'first_name'} && $f->{'last_name'}) {
                    $f->{'name'} = $f->{'first_name'}.' '.$f->{'last_name'};
                } 
                
                # Get users, with bday in next ten days
                if ($interval->m == 0 && $interval->d < 5 &&
                    $now->format('j') <= $date->format('j')) {

                    $d = $date->format('m-d');
                    $fr_array[$d][ $f->uid ] = $f;
                }
            }
        }

        # Answer prepare
        $res_array = array();
        $dt = $now;

        $months = array(1 => 'января', 2 => 'февраля', 3 => 'марта', 4 => 'апреля', 
        5 => 'мая', 6 => 'июня', 7 => 'июля', 8 => 'августа', 
        9 => 'сентября', 10 => 'октября', 11 => 'ноября', 12 => 'декабря');

        for ($i = 0; $i < 5; $i++) {
            $ymd = $dt->format('Y-m-d');
            $md = $dt->format('m-d');

            $res_array[$ymd] = array();

            # birthdays
            $res_array[$ymd]['friends'] = array();

            if (isset($fr_array[$md])) {
                $res_array[$ymd]['friends'] = $fr_array[$md];
            }

            # rus month
            $month = $dt->format('m');
            $day = $dt->format('d');
            $rus_month = $months[ $month ];    

            $res_array[$ymd]['dname'] = $day.' '.$months[ $month ];

            # holidays
            $res_array[$ymd]['holidays'] = array();
            $holidays = $this->_get_holidays($month, $day);
            
            foreach ($holidays as $h) {
                $res_array[$ymd]['holidays'][$h->getHolidayId()] = array(
                    'name' => $h->getName(),
                    'desc' => $h->getDescription()
                );  
            }

            # next
            $dt->modify("+1 day");
        }

        $response = new Response(json_encode($res_array));

        return $response;
    }

    public function getUserInfoAction(Request $request) {
        $uid = $request->get('uid');

        if (!$uid) {
            $answer = array( 'error' => 'no user id' );
            $response = new Response(json_encode($answer));
            return $response;
        }
        
        $em = $this->getDoctrine()->getEntityManager();
        $users = $em->createQuery("select p from GiftGeneralBundle:User p WHERE p.uid = :uid")
            ->setParameter('uid', $uid)
            ->getResult();

        if ($users && count($users) > 0) {
            $u = $users[0];

            // Prepare API answer
            $serializer = $this->get('serializer');
            $json = $serializer->serialize($u, 'json');
            $response = new Response($json);
            return $response;
            
        } else {
            $mc = $this->get('beryllium_cache');
            $api = $this->get('social_api');
            $api->setNetwork('mm');
            $api->setCache($mc);
            $uinfo = $api->getUserInfo( $uid );
            $response = new Response(json_encode($uinfo));
            return $response;
        }

    }

    public function sendHeartAction(Request $request) {
        // Check user 
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

        // Check receiver 
        $em = $this->getDoctrine()->getEntityManager();

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

        // 1. Check: have user sent gift today?
        // Get hearts, tha user sent
        $rep = $this->getDoctrine()
            ->getRepository('GiftGeneralBundle:UserHeart');

        $q = $rep->createQueryBuilder('p')
            ->where('p.user_id = :uid and p.type = :type')
            ->setParameters(array(
                'uid' => $user->getId(),
                'type' => 0 // free
            ))
            ->orderBy('p.id', 'DESC')
            ->setMaxResults(1)
            ->getQuery();
            
        $user_hearts = $q->getResult();
        $config = $this->getConfig();         
        $free = 1;

        if (count($user_hearts) > 0) {
            $now = new \DateTime;
            $created = $user_hearts[0]->getCreatedAt();

            $diff = round($now->format('U')) - round($created->format('U'));
            if ($diff > $config['heart_interval']) {
                // OK
                $this->sendHeart($user, $rid, 0);
            } else {
                // 2. Check balance
                $cost = $config['heart_cost'];
                if ($user->getBalance() >= $cost) {
                    // Decrease balance
                    $user->setBalance( $user->getBalance() - $cost );
                    $this->sendHeart($user, $rid, 1);
                    $free = 0;
                } else {
                    // Need more money
                    $answer = array('no_app_user' => $no_app_user, 'balance_error' => 'need more money', 'need' => abs($cost - $user->getBalance()));
                    $response = new Response(json_encode($answer));
                    return $response;
                }
            }
        } else {
            // OK
            $this->sendHeart($user, $rid, 0);
        }

        $answer = array( 'done' => 'heart_sended', 'free' => $free, 'no_app_user' => $no_app_user, 'balance' => $user->getBalance() );
        $response = new Response(json_encode($answer));
        return $response;
    }

    private function sendHeart($user, $rid, $type) {
        $em = $this->getDoctrine()->getEntityManager();

        $name = $user->getFirstName().' '.$user->getLastName();
        if (strlen($name) < 3) {
            $name = $user->getNick();
        }

        $hc = $this->getDoctrine()->getEntityManager()
            ->createQuery('select p FROM GiftGeneralBundle:UserHeartCount p where p.uid = :uid')
            ->setParameter('uid', $rid)
            ->getResult();
        
        $recv_hc = '';
        if (count($hc) > 0) {
            $recv_hc = $hc[0]; 
            $recv_hc->setCount( $recv_hc->getCount() + 1 );
        } else {
            $recv_hc = new UserHeartCount; 
            $recv_hc->setUid( $rid );
            $recv_hc->setCount( 1 );
        }

        $uh = new UserHeart();
        $uh->setUserId($user->getId());
        $uh->setUserName($name);
        $uh->setUserBox($user->getBox());
        $uh->setUserLogin($user->getLogin());
        $uh->setType($type);
        $uh->setReceiver($rid);

        $em->persist($recv_hc);
        $em->persist($uh);

        $em->flush();
    }

    public function getFriendsHeartsTopAction(Request $request) {
        $config = $this->getConfig();         

        // Check user 
        $sk = $request->get('sk');

        $mc  = $this->get('beryllium_cache');
        $uid = $mc->get("sk_u-$sk");

        if (!$uid) {
            $answer = array( 'error' => 'no user id' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        // Get friends
        # Fetch friends  via API
        $api = $this->get('social_api');
        $api->setNetwork('mm');
        $api->setCache($mc);
        $friends = $api->getUserFriendsBySk( $sk );

        if (count($friends) == 0) {
            $result = array();
            $response = new Response(json_encode($result));
            return $response;
        }

        $friend_arr = array();
        $friend_str = '';
        foreach ($friends as $f) {
            $name = $f->first_name.' '.$f->last_name;
            if (strlen($name) < 3) {
                $name = $f->nick;
            }
            $f->name = $name;

            $friend_arr[ $f->uid ] = $f;
            $friend_str .= "'".$f->uid."', ";
        }

        $friend_str = substr($friend_str, 0, -2);

        $em = $this->getDoctrine()->getEntityManager();

        $users = $em->createQuery("select p from GiftGeneralBundle:UserHeartCount p where p.uid in ($friend_str) order by p.count desc")
            ->setMaxResults($config['top_people_count'])
            ->getResult();

        // Prepare answer
        $i = 0;
        $result = array();
        foreach ($users as $u) {
            $result[ $u->getUid() ]['count'] = $u->getCount();
            $result[ $u->getUid() ]['user'] = $friend_arr[ $u->getUid() ];

            $i++;
            if ($i == $config['top_people_count']) {
                break; 
            }
        }

        $response = new Response(json_encode($result));
        return $response;
    }


    public function getHeartsAction(Request $request) {
        // Check user 
        $uid = $request->get('uid');

        if (!$uid) {
            $answer = array( 'error' => 'no user id' );
            $response = new Response(json_encode($answer));
            return $response;
        }

        $hc = $this->getDoctrine()->getEntityManager()
            ->createQuery('select p FROM GiftGeneralBundle:UserHeartCount p where p.uid = :uid')
            ->setParameter('uid', $uid)
            ->getResult();

        $hearts = 0;
        if (count($hc) > 0) {
            $hearts = $hc[0]->getCount();
        } 

        $answer = array( 'hearts' => $hearts );
        $response = new Response(json_encode($answer));
        return $response;
    }

    public function getTopHeartsAction(Request $request) {
        $config = $this->getConfig();         

        $res = $this->getDoctrine()->getEntityManager()
            ->createQuery('select p FROM GiftGeneralBundle:UserHeartCount p order by p.count desc')
            ->setMaxResults($config['top_people_count'])
            ->getResult();
        
        $friends_uids = array();
        $uhash = array();
        foreach ($res as $uh) {
            $uhash[ $uh->getUid() ] = $uh->getCount();
            array_push($friends_uids, $uh->getUid());
        }
        
        # Fetch user via API
        $mc = $this->get('beryllium_cache');
        $api = $this->get('social_api');
        $api->setNetwork('mm');
        $api->setCache($mc);
        $uinfo = $api->getMultiUserInfo( join(',', $friends_uids) );


        // Prepare answer
        $i = 0;
        $result = array();
        foreach ($uinfo as $u) {
            $name = $u->first_name.' '.$u->last_name;
            if (strlen($name) < 3) {
                $name = $u->nick;
            }

            $result[$u->uid]['count'] = $uhash[ $u->uid ];
            $result[$u->uid]['user'] = $u;

            $i++;
            if ($i == $config['top_people_count']) {
                break; 
            }
        }

        $response = new Response(json_encode($result));
        return $response;
    }
}
