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

sub getCircle {
    my $r = {
        'call' => "circle",
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

# Circle likes
my $minimum = 0;
my $range = 5;
my $circle = getCircle();

foreach my $u (@$circle) {
    my $to = $u->{'uid'};

    my $liker = $likers[ int(rand(scalar(@likers))) ];
    my $hearts_count = int(rand($range)) + $minimum;
    print "\nto: $to, hearts: $hearts_count, from: $liker";
    
    for (my $i = 0; $i < $hearts_count; $i++) {
        sendHeart($liker, $to);
        print "\n\t$i. send heart";
    }
}

