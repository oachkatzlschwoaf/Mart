#!/usr/bin/perl

use strict;
use warnings;

use API;
use DateTime;
use Daemon::Generic;
use Data::Dumper;

$|++;
my $DAY_AGO = 7;
my $SLEEP_TIME = 60*60;

sub getGiftPurchases {
    my ($from, $to) = @_;

    my $r = {
        'call' => "purchases",
        'from' => $from,
        'to' => $to,
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

sub setPopularity {
    my ($gid, $popularity) = @_;

    my $r = {
        'call' => "gift/$gid/popularity/set",
        'popularity' => $popularity,
    };

    my $api = API->new();
    my $ans = $api->request($r, 'post');

    return $ans;
}

sub getGifts {
    my $r = {
        'call' => "gifts",
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

# MAIN

newdaemon(
    progname   => 'calc_gift_pop',
    pidfile    => '/tmp/build_cat.pid',
);

sub gd_preconfig {
    my ($self) = @_;
    return ();
}

# MAIN LOOP

sub gd_run {

    while(42) {
        print "\n\nWork start";

        # Get gifts users by days 
        my $dt = DateTime->now();
        my $gift_stat;

        print "\n\nGifts stat day by day";
        print "\n================================\n";

        for (my $i = 0; $i < $DAY_AGO; $i++) {
            my $from = $dt->clone()->subtract( days => $i );
            my $to   = $from->clone()->add( days => 1 );

            my $ps = getGiftPurchases($from->ymd(), $to->ymd());

            foreach my $p (@$ps) {
                $gift_stat->{ $p->{'gift_id'} }++;
            }

            print "\n".$from->ymd()." gifts: ".scalar(@$ps);
        }

        print "\n\nGifts stat summary";
        print "\n================================\n";

        my $gifts = getGifts();
        my %gift;

        foreach my $g (@$gifts) {
            $gift{ $g->{'id'} }= $g;
        }

        foreach my $gid (sort { $gift_stat->{$b} <=> $gift_stat->{$a} } keys %$gift_stat) {
            delete($gift{$gid});

            print "\nGift $gid: ".$gift_stat->{$gid};
            setPopularity($gid, $gift_stat->{$gid});
        }

        foreach my $gid (keys %gift) {
            print "\nGift $gid: 0";
            setPopularity($gid, 0);
        }

        print "\n\nWork finish done!";
        print "\n*************************************************\n";

        sleep($SLEEP_TIME);
    }
}




