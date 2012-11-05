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
        'call'    => "user/$uid/notify/push",
        'text_id' => $tid,
    };

    my $api = API->new();
    my $ans = $api->request($r, 'post');

    if ($ans && $ans->{'done'}) {
        return 1;
    }

    return;
}

sub getNotify {
    my ($l, $o) = @_;

    my $r = {
        'call' => "notify",
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

# MAIN

# Get options

# Main 

print "\nGet notifications... ";

my $notify = getNotify();

print "done: ".scalar(@$notify);

foreach my $n (@$notify) {
    my $uid = $n->{'user_id'};
    my $tid = $n->{'text_id'};

    print "\n\tSend notify ($tid) to $uid... ";

    my $res = sendNotify($uid, $tid);

    if ($res) {
        print "done!";
    } else {
        print "fail";
    }
}

