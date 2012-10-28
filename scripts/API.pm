package API;

use strict;
use warnings;

use URI;
use LWP::UserAgent;
use YAML::Tiny;
use JSON;
use Data::Dumper;

sub new {
    my ($class) = @_;

    my $path = './';

    my $y = YAML::Tiny->new();
    my $conf = $y->read($path.'config.yml');
    $conf = $conf->[0];

    my $self = {
        api_url => $conf->{'api_url'}, 
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
