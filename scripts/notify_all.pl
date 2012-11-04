#!/usr/bin/perl

use strict;
use warnings;

use lib '/var/www/gift/main/scripts';

use API;
use Data::Dumper;
use Getopt::Long;
use DateTime;
use DateTime::Format::Strptime;
use DateTime::Duration;

$|++;

sub sendNotify {
    my ($uid, $tid) = @_;

    my $r = {
        'call'    => "user/$uid/notify",
        'text_id' => $tid,
    };

    my $api = API->new();
    my $ans = $api->request($r, 'post');

    if ($ans && $ans->{'done'}) {
        return 1;
    }

    return;
}

sub getUsersCount {
    my $r = {
        'call' => "users/count",
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans->{'count'};
}

sub getUsers {
    my ($l, $o) = @_;

    my $r = {
        'call' => "users",
        'limit'  => $l,
        'offset' => $o,
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

# MAIN

# Get options
my $limit  = 1000;
my $offset = 0;

my $age;
my $gender;
my $country;

my $text_id;

GetOptions (
    "limit=i"   => \$limit,    
    "offset=i"  => \$offset,    
    "age=s"     => \$age,    
    "gender=s"  => \$gender,    
    "country=s" => \$country,    
    "text_id=i" => \$text_id,    
);  

my $criteria;

if ($age && $age =~ /(\d+)_(\d+)/) {
    $criteria->{'age'}{'from'} = $1;
    $criteria->{'age'}{'to'}   = $2;
}

if ($gender) {
    my (@sex) = split(',', $gender); 

    foreach (@sex) {
        if ($_ eq 'm') {
            $criteria->{'gender'}{'male'} = 1;
        } elsif ($_ eq 'f') {
            $criteria->{'gender'}{'female'} = 1;
        }
    }
}


if ($country) {
    my (@countries) = split(',', $country); 

    foreach (@countries) {
        $criteria->{'country'}{$_} = 1;
    }
}

# Main 
my $users_count = getUsersCount($limit, $offset);

print "\nUsers count: $users_count";

my $users;

my $fmt = DateTime::Format::Strptime->new(
    pattern => '%Y-%m-%d',
);

my $dt = DateTime->now();

for (my $i = $offset; $i < $users_count; $i += $limit) {

    my $us = getUsers($limit, $i);
    print "\n$i. Get Users...";

    foreach my $u (@$us) {
        my $start = $fmt->parse_datetime($u->{'birthday'});
        if ($start) {

            # Age criteria
            my $uage = $dt->year() - $start->year();

            if (defined($criteria->{'age'}) &&
                ($uage < $criteria->{'age'}{'from'} ||
                $uage > $criteria->{'age'}{'to'})) {
                
                next;
            }    

            # Gender criteria
            my $g = $u->{'gender'};
            
            if (defined($criteria->{'gender'})) {
                if (defined($criteria->{'gender'}{'male'}) && 
                    $criteria->{'gender'}{'male'} == 1 && 
                    defined($g) && $g == 1) {

                    next;
                }

                if (defined($criteria->{'gender'}{'female'}) && 
                    $criteria->{'gender'}{'female'} == 1 && 
                    (!defined($g) || $g == 0)) {

                    next;
                }
            }

            # Geo criteria
            my $cid = $u->{'country_id'}; 

            if (defined($criteria->{'country'}) &&
                (!defined($cid) || !defined($criteria->{'country'}{$cid}))) {
                next;
            }

            # Notify
            print "\n\t".$u->{'id'}." ";

            if (sendNotify($u->{'id'}, $text_id)) {
                print " -> done";
            } else {
                print " -> fail";
            }
        }
    }
}


