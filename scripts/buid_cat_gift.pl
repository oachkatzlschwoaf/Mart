#!/usr/bin/perl

use strict;
use warnings;

use URI;
use LWP::UserAgent;
use JSON;
use Data::Dumper;

my $api_url = 'http://localhost.dev/gift/app_dev.php/api/';

sub request {
    my ($p, $method) = (@_);

    return unless ($p->{'call'});

    my $url = $api_url.$p->{'call'};
    delete($p->{'call'});

    my $ua = LWP::UserAgent->new();

    my $response;

    if (!$method || $method eq 'get') {
        my $uri = URI->new($url);
        $uri->query_form($p);
        $response = $ua->get($uri);
    } elsif ($method eq 'post') {
        $response = $ua->post($url, $p);
    }

    if ($response->is_success()) {
        my $res;
        eval { $res = decode_json( $response->content ) };

        if (!$@) {
            return $res;
        } else {
            return;
        }

    } else {
        return;
    }
}

sub getGifts {
    my $r = {
        'call' => "gifts",
    };

    my $ans = request($r);

    return $ans;
}

sub getCategories {
    my $r = {
        'call' => "categories",
    };

    my $ans = request($r);

    return $ans;
}

sub saveGiftInCategory {
    my ($cid, $gid) = @_;

    my $r = {
        'call' => "category/$cid/gift/$gid/save",
    };

    my $ans = request($r, 'post');

    return $ans;
}

sub getGiftsInCategory {
    my ($cid) = @_;

    my $r = {
        'call' => "category/$cid/gifts",
    };

    my $ans = request($r, 'post');

    return $ans;
}

sub removeGiftFromCategory {
    my ($cid, $gid) = @_;

    my $r = {
        'call' => "category/$cid/gift/$gid/remove",
    };

    my $ans = request($r, 'post');

    return $ans;
}


# Get all categories
my $cats = getCategories();

# Get all gifts
my $gifts = getGifts();

# Sort gifts by tags
my %tag_gifts;
my %gift;

foreach my $g (@$gifts) {
    my @tags = split(',', $g->{'tags'});
    $gift{ $g->{'id'} }= $g;

    foreach my $tag (@tags) {
        chomp($tag);
        push(@{ $tag_gifts{$tag} }, $g->{'id'});
    }
}

my %cat_gifts;

foreach my $c (@$cats) {
    my @tags = split(',', $c->{'tags'});

    foreach my $tag (@tags) {
        if (defined( $tag_gifts{$tag} )) {
            foreach my $gid ( @{ $tag_gifts{$tag} } ) {
                $cat_gifts{ $c->{'id'} }{ $gid } = 1;
            }
        }
    }
}


# Generate category <-> gift
print "\nGenerate category <-> gifts";
print "\n================================\n";

my %old_pairs;
foreach my $cid (keys %cat_gifts) {
    print "\ncategory: $cid";

    my $pairs = getGiftsInCategory($cid); 

    foreach my $pair (@$pairs) {
        $old_pairs{ $pair->{'category_id'} }{ $pair->{'gift_id'} } = 1;
    }

    foreach my $gid (keys %{ $cat_gifts{$cid} }) {
        print "\n\tgift: $gid";

        if (!$old_pairs{$cid}{$gid}) {
            print " -> save!";
            saveGiftInCategory($cid, $gid);        
        } else {
            print " -> exists!";
        }

    }
}

# Remove old category <-> gift
print "\n\nRemove out of date category <-> gifts";
print "\n================================\n";

foreach my $cid (keys %old_pairs) {
    print "\ncategory: $cid";
    foreach my $gid (keys %{ $old_pairs{$cid} }) {
        if (!$cat_gifts{$cid}{$gid}) {
            print "\n\tgift: $gid -> delete!";
            removeGiftFromCategory($cid, $gid);        
        }
    }
}    

