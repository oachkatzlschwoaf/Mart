#!/usr/bin/perl

use strict;
use warnings;
use Data::Dumper;

use DBI;
use LWP::UserAgent;
use LWP;
use URI;
use Digest::MD5 qw(md5_hex);
use HTTP::Request;
use HTTP::Request::Common;
use JSON;

sub getHolidays {
    my $ua = LWP::UserAgent->new;
    my $key = '66ac3ebdcb215278bcc97f381d2f63b1';
    my $url = "http://my.mail.ru/cgi-bin/app/newapi";
    my $uri = URI->new($url);

    my $params = {
        method      => 'holiday.get',
        app_id      => 422248,
        uid         => '10410773191171615989',
        secure      => 1,
    };

    my $string_to_sig = "";

    $string_to_sig .=  join('', map { $_ .'='. $params->{$_} } sort {$a cmp $b} keys %$params) . $key;
    $params->{'sig'} = md5_hex($string_to_sig);

    # Make response
    $uri->query_form($params);
    my $preq = POST $url, Content_Type => 'form-data',
        Content      => [
            %$params,
        ];

    my $r = HTTP::Request->new('GET',$uri);
    my $response = $ua->request($r);

    return decode_json($response->content);
}

my $hs = getHolidays();
 
my $dbh = DBI->connect('DBI:mysql:GIFT:localhost', 'root', 'rjirftcn')
    or die "Couldn't connect to database: " . DBI->errstr;

$dbh->do("set names utf8");

foreach my $h (@$hs) {
    my $id = $h->{'id'};
    my $name = $h->{'name'};
    my $day = $h->{'date'}{'day'};
    my $month = $h->{'date'}{'month'};
    my $type = $h->{'type'};
    my $desc = $h->{'description'} || '';

    $dbh->do("insert into Holiday (`holiday_id`, `name`, `day`, `month`, `type`, `description`) values('$id', '$name', '$day', '$month', '$type', '$desc')");

    print "\n$id. $name ($day, $month) - $type - $desc";
}

