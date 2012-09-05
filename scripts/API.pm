package API;

use strict;
use warnings;

use URI;
use LWP::UserAgent;
use JSON;
use Data::Dumper;

sub new {
    my ($class) = @_;

    my $self = {
        api_url => 'http://10.211.55.7/gift/app_dev.php/api/'
    };

    bless($self, $class);

    return $self;
}

sub request {
    my ($self, $p, $method) = (@_);

    return unless ($p->{'call'});

    my $url = $self->{api_url}.$p->{'call'};

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

1;
