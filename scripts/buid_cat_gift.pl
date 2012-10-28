#!/usr/bin/perl

use strict;
use warnings;

use lib '/var/www/gift/main/scripts';

use API;
use Data::Dumper;

$|++;
my $SLEEP_TIME = 60;

my $TAG_ALL_GIFTS = 'all';

sub getGifts {
    my $r = {
        'call' => "gifts",
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

sub getCategories {
    my $r = {
        'call' => "categories",
    };

    my $api = API->new();
    my $ans = $api->request($r);

    return $ans;
}

sub saveGiftInCategory {
    my ($cid, $gid) = @_;

    my $r = {
        'call' => "category/$cid/gift/$gid/save",
    };

    my $api = API->new();
    my $ans = $api->request($r, 'post');

    return $ans;
}

sub getGiftsInCategory {
    my ($cid) = @_;

    my $r = {
        'call' => "category/$cid/gifts",
    };

    my $api = API->new();
    my $ans = $api->request($r, 'post');

    return $ans;
}

sub removeGiftFromCategory {
    my ($cid, $gid) = @_;

    my $r = {
        'call' => "category/$cid/gift/$gid/remove",
    };

    my $api = API->new();
    my $ans = $api->request($r, 'post');

    return $ans;
}

# MAIN 
print "\n\nWork start";

# Get all categories
print "\nGet categories... ";
my $cats = getCategories();
print "done";

# Get all gifts
print "\nGet gifts... ";
my $gifts = getGifts();
print "done";

# Sort gifts by tags
my %tag_gifts;
my %gift;

print "\nSort gifts... ";
foreach my $g (@$gifts) {
    my @tags = split(',', $g->{'tags'});
    $gift{ $g->{'id'} }= $g;

    foreach my $tag (@tags) {
        chomp($tag);
        push(@{ $tag_gifts{$tag} }, $g->{'id'});
    }
}

my %cat_gifts;
my %categories;

foreach my $c (@$cats) {
    my @tags = split(',', $c->{'tags'});
    $categories{ $c->{'id'} } = 1;

    foreach my $tag (@tags) {
        if (defined( $tag_gifts{$tag} ) || $tag eq $TAG_ALL_GIFTS) {

            if ($tag eq $TAG_ALL_GIFTS) {
                foreach my $g (@$gifts) {
                    $cat_gifts{ $c->{'id'} }{ $g->{'id'} } = 1;
                }
            } else {
                foreach my $gid ( @{ $tag_gifts{$tag} } ) {
                    $cat_gifts{ $c->{'id'} }{ $gid } = 1;
                }
            }
        }
    }
}

print "done";

# Generate category <-> gift
print "\nGenerate category <-> gifts";
print "\n================================\n";

my %old_pairs;
foreach my $cid (keys %categories) {
    print "\ncategory: $cid";

    my $pairs = getGiftsInCategory($cid); 

    foreach my $pair (@$pairs) {
        $old_pairs{ $pair->{'category_id'} }{ $pair->{'gift_id'} } = 1;
    }

    foreach my $gid (keys %{ $cat_gifts{$cid} }) {
        print "\n    gift: $gid";

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
            print "\n    gift: $gid -> delete!";
            removeGiftFromCategory($cid, $gid);        
        }
    }
}    

print "\n\nWork finish done!";
print "\n*************************************************\n";
