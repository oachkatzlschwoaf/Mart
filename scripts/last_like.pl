#!/usr/bin/perl

use strict;
use warnings;

use API;
use Data::Dumper;

$|++;

sub getConfig {
    my $r = {
        'call' => "config",
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

sub getLastUsers {
    my $r = {
        'last' => 500,
        'call' => "users/last",
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

sub sendHeart {
    my ($from, $to) = @_;

    my $r = {
        'call' => "heart/send",
        'from' => $from,
        'to' => $to,
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

# Get likers
my $config = getConfig();

my @likers = split(',', $config->{'like_users'}); 

# Last users 
my $last_users = getLastUsers();

foreach my $u (@$last_users) {
    my $to = $u->{'uid'};

    my $liker = $likers[ int(rand(scalar(@likers))) ];
    print "\nto: $to, from: $liker";

    my $get = int(rand(2));

    print " $get ";

    if ($get) {
        print " -> send heart!";
        sendHeart($liker, $to);
    }
}

