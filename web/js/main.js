var purchase      = { };
var view          = { };
var user          = { };
var gifts         = { };
var gifts_catalog = { };

var util = {
    api_url: { },
};

$(document).ready(function() {

    // Gifts Catalog
    gifts_catalog = {
        emitter: $(document),

        gifts: new Array(),

        setCategory: function(id) {
            this.cat_id = id;
            this.emitter.trigger('gift_catalog.set_category', this);
        },

        getGiftsByCategory: function(id, sort) {
            dfd = $.Deferred();

            $.getJSON(util.api_url.category_gifts, { 
                cid:     id, 
                ext:     1,
                sort_by: sort
            }, function(data) {
                this.gifts = data;
                dfd.resolve(this.gifts);
            }.bind(this));

            return dfd.promise();
        },

        sortGifts: function(sort) {
            this.getGiftsByCategory(this.cat_id, sort).done(function(gifts) {
                this.emitter.trigger('gift_catalog.sort_gifts', { 'gifts': gifts });
            }.bind(this));
        },

    };

    // Gifts My
    gifts.my = {
        emitter: $(document),

        open:    new Array(),
        newest:  new Array(),

        // Methods
        init: function (view) {
            // Choose Friend
            view.emitter.on('view.open_gift', function (e, input) { 
                this.openGift(input);
            }.bind(this));
        },

        getList: function() {
            dfd = $.Deferred();

            if (this.open.length == 0 || this.newest.length == 0) {
                $.getJSON(util.api_url.my_gifts, function(data) {
                    $.each(data, function(k, v) {
                        if (v.is_open) {
                            this.open.push(v);
                        } else {
                            this.newest.push(v);
                        }
                    }.bind(this));

                    dfd.resolve(this);
                }.bind(this));
            } else {
                dfd.resolve(this);
            }

            return dfd.promise();
        },

        openGift: function(id) {
            $.post(util.api_url.open_gift, {
                    ugid: id,
                },
                function(data) { },
                "json"
            );
        }
    };

    // Purchase
    purchase = {
        emitter: $(document),
        cost: 0,

        // Methods
        init: function (view) {
            // Choose Friend
            view.emitter.on('view.friend_choose', function (e, input) { 
                this.setFriend(input);
            }.bind(this));

            // Choose Description
            view.emitter.on('view.desc_choose', function (e, input) { 
                this.setDescription(input);
            }.bind(this));
        },

        setGift: function (gid, premium) {
            this.gift_selected = gid;

            if (typeof(premium) === 'undefined' || premium == 0) {
                this.cost += util.price.gift;
            } else if (premium > 0) {
                this.cost += util.price.gift_premium;
            }

            this.emitter.trigger('purchase.gift_selected', this);
        },

        setFriend: function (u) {
            this.friend_selected = u;

            this.emitter.trigger('purchase.friend_selected', this);
        },

        setDescription: function(p) {
            this.privacy = p.privacy;
            this.incognito = p.incognito;
            this.text = p.text;

            if (this.privacy == 1) {
                this.cost += util.price.private;
            }

            if (this.incognito == 1) {
                this.cost += util.price.incognito;
            }

            this.emitter.trigger('purchase.desc_selected', this);
        },

        setCover: function (cvid, cvcost) {
            this.cover_selected = cvid;
            this.cost += cvcost;

            this.emitter.trigger('purchase.cover_selected', this);
        },


        process: function() {
            $.post(util.api_url.purchase, {
                    gift:      this.gift_selected,
                    receiver:  this.friend_selected.uid,
                    text:      this.text,
                    privacy:   this.privacy,
                    incognito: this.incognito,
                    cover:     this.cover_selected
                },
                function(data) {
                    if (data.done == 'gift sended') {
                        this.emitter.trigger('purchase.done', this);
                    } else if (data.balance_error == 'need more money') {
                        this.emitter.trigger('purchase.error_balance', this);
                    }
                }.bind(this),
                "json"
            );
        }
    }

    // User
    user = {
        friends: new Array(), 
        api: util.api_url,
        emitter: $(document),

        // Methods
        getFriends: function () {
            dfd = $.Deferred();

            if (this.friends.length == 0) {
                $.getJSON(this.api.friends_get, function(data) {
                    this.friends = data;
                    dfd.resolve(data);
                }.bind(this));
            } else {
                dfd.resolve(this.friends);
            }

            return dfd.promise();
        },

        searchFriend: function(query) {
            serp = new Array();

            $.each(this.friends, function(k, v) {
                if ( v.nick.match(query, 'i') ) {
                    serp.push(v);
                } else if ( v.first_name.match(query, 'i') ) {
                    serp.push(v);
                } else if ( v.last_name.match(query, 'i') ) {
                    serp.push(v);
                } else if ( v.link.match(query, 'i') ) {
                    serp.push(v);
                }
            });

            this.emitter.trigger('user.search_friend', { 'result' : serp });
        }
    };

    // Views 
    view.hide = function(v) {
        $.each(this, function(name, obj) {
            if (typeof(obj) === 'object') {
                if (obj != v) {
                    obj.hide();
                }
            }
        });

    };

    view.gifts_catalog = {
        emitter:           $(document),

        cost:              $("#cost"),
        container:         $('#gifts_catalog'),

        gifts_container:   $('#gifts_block'),
        gifts_list:        $('#gifts_list'),
        gifts_to_show:     5,

        friends_container: $('#friends_block'),
        friends_list:      $('#friends'),
        friends_search:    $('#friend_search_query'),
        friends_to_show:   8,

        desc_container:    $('#description_block'),
        desc_gift:         $('#gift_show'),
        desc_gift_for:     $('#gift_for'),
        desc_text:         $('#desc_text'),
        desc_is_private:   $('#is_private'),
        desc_incognito:    $('#incognito'),

        covers_container:  $('#covers_block'),

        done_container:    $('#done'),
        
        // Methods
        init: function (purchase, user, gifts_catalog) {
            // Set Gift
            purchase.emitter.on('purchase.gift_selected', function (e, input) { 
                this.cost.text(input.cost);
                this.gifts_container.hide();

                if (typeof input.friend_selected === 'undefined') {
                    this.showFriendsSelector(user); 
                } else {
                    this.showDescriptionBlock(purchase);
                }
            }.bind(this));

            // Friends search
            user.emitter.on('user.search_friend', function (e, input) { 
                this.pos = 0;
                this.users = input.result;
                this.scrollFriends();
            }.bind(this));

            // Set Friend
            purchase.emitter.on('purchase.friend_selected', function (e, input) { 
                if (typeof input.gift_selected === 'undefined') {
                    // TODO: Show gifts container
                } else {
                    this.friends_container.hide();
                    this.showDescriptionBlock(purchase);
                }
            }.bind(this));

            // Set Description
            purchase.emitter.on('purchase.desc_selected', function (e, input) { 
                this.cost.text(input.cost);
                this.desc_container.hide();
                this.showCoverBlock();
            }.bind(this));

            // Set Cover 
            purchase.emitter.on('purchase.cover_selected', function (e, input) { 
                this.cost.text(input.cost);
                this.covers_container.hide();

                input.process();
            }.bind(this));

            // Purchase done 
            purchase.emitter.on('purchase.done', function (e, input) { 
                this.done_container.text('Подарок отправлен!');
                this.done_container.show();
            }.bind(this));

            // Purchase balance error 
            purchase.emitter.on('purchase.error_balance', function (e, input) { 
                this.done_container.text('Не хватает денег!');
                this.done_container.show();
            }.bind(this));

            // Set category 
            gifts_catalog.emitter.on('gift_catalog.set_category', function (e, input) { 
                input.getGiftsByCategory(input.cat_id, 'popularity').done(function(gifts) {
                    this.gifts = gifts;
                    this.gpos = 0;
                    this.scrollGifts();
                }.bind(this));
        
            }.bind(this));

            // Sort gifts 
            gifts_catalog.emitter.on('gift_catalog.sort_gifts', function (e, input) { 
                this.gifts = input.gifts;
                this.gpos = 0;
                this.scrollGifts();
            }.bind(this));
        },

        scrollGifts: function(direction) {
            if (direction == 'forward') {
                this.gpos += this.gifts_to_show;

                if (this.gpos > (this.gifts.length - 1)) {
                    this.gpos = 0;
                }
            } else if (direction == 'back') {
                this.gpos -= this.gifts_to_show;

                if (this.gpos < 0) {
                    this.gpos = 
                        Math.floor((this.gifts.length - 1) / this.gifts_to_show) * this.gifts_to_show;
                }
            }

            cnt = this.gifts_to_show;
            pos = this.gpos;

            this.gifts_list.html(''); 

            for (i = pos; i < (pos + cnt); i++) {
                var v = this.gifts[i];

                if (typeof(v) === 'object') {
                    img_path = util.thumbs_path+"/"+v.id+".png";

                    this.gifts_list.append(
                        "<a onclick='purchase.setGift("+v.id+", "+v.premium+")' href='#'><img src='"+img_path+"' /></a>"
                    );
                }
            }
        },

        showFriendsSelector: function(u) {
            u.getFriends().done(function(friends) {
                this.users = friends;
                this.pos = 0;

                this.scrollFriends();

                this.friends_container.show();

            }.bind(this));
        },

        scrollFriends: function(direction) {
            if (direction == 'forward') {
                this.pos += this.friends_to_show;

                if (this.pos > (this.users.length - 1)) {
                    this.pos = 0;
                }
            } else if (direction == 'back') {
                this.pos -= this.friends_to_show;

                if (this.pos < 0) {
                    this.pos = 
                        Math.floor((this.users.length - 1) / this.friends_to_show) * this.friends_to_show;
                }
            }

            cnt = this.friends_to_show;
            pos = this.pos;

            this.friends_list.html("");

            for (i = pos; i < (pos + cnt); i++) {
                var v = this.users[i];

                if (typeof(v) === 'object') {
                    name = htmlEncode(v.first_name + " " + v.last_name);
                    
                    if (name.length === 1) {
                        name = v.nick;
                    }

                    this.users[i].name = name;

                    this.friends_list.append(
                        "<div><a href='#' onclick='view.gifts_catalog.chooseFriend(\""+i+"\")'><img src='"+
                        v.pic+"' /><br />"+i+". "+name+"</a></div>");    
                }
            }
        },

        searchFriend: function() {
            var query = this.friends_search.val();  
            user.searchFriend(query);
        },

        showDescriptionBlock: function() {
            this.desc_gift.attr("src", util.images_path+"/"+purchase.gift_selected+".png");
            this.desc_gift_for.text( purchase.friend_selected.name );

            this.desc_text.val("");
            this.desc_is_private.removeAttr("checked");
            this.desc_incognito.removeAttr("checked");

            this.desc_container.show();
        },

        chooseFriend: function(id) {
            var u = this.users[id];

            this.emitter.trigger('view.friend_choose', u);
        },

        chooseDescription: function() {
            var desc = {};

            desc.text = this.desc_text.val(); 
            
            desc.privacy = 0;
            if (this.desc_is_private.is(':checked')) {
                desc.privacy = 1;
            }

            desc.incognito = 0;
            if (this.desc_incognito.is(':checked')) {
                desc.incognito = 1;
            }
            
            this.emitter.trigger('view.desc_choose', desc);
        },

        showCoverBlock: function() {
            this.covers_container.show();
        },

        hide: function () {
            this.container.hide();
        }
    };

    view.my_gifts = {
        emitter:   $(document),

        container: $('#gifts_my_block'),
        
        gifts_container: {
            open:   $('#gifts_my'),
            newest: $('#gifts_my_new')
        },

        gift_img:    $("#show_gift_img"),
        gift_text:   $("#show_gift_text"),
        gift_from:   $("#show_gift_from"),
        gift_avatar: $("#show_gift_from_img"),

        count: {
            open:   3,
            newest: 3,
        },

        pos: {
            open: 0,
            newest: 0
        },

        gifts: { },

        showGiftsBlock: function(g) {
            g.getList().done(function(list) {
                this.gifts.open = list.open;
                this.gifts.newest = list.newest;

                this.scrollGifts('open');
                this.scrollGifts('newest');
                this.container.show();
            }.bind(this));
        },

        scrollGifts: function(type, direction) {
            if (direction == 'forward') {
                this.pos[type] += this.count[type];

                if (this.pos[type] > (this.gifts[type].length - 1)) {
                    this.pos[type] = 0;
                }
            } else if (direction == 'back') {
                this.pos[type] -= this.count[type];


                if (this.pos[type] < 0) {
                    this.pos[type] = Math.floor((this.gifts[type].length - 1) / this.count[type]) 
                        * this.count[type];
                }
            }

            pos       = this.pos[type];
            cnt       = this.count[type]; 
            container = this.gifts_container[type];
            gifts     = this.gifts[type];

            container.html("");

            for (i = pos; i < (pos + cnt); i++) {
                var v = gifts[i];

                if (typeof(v) === 'object') {
                    var path = util.thumbs_path+'/'+v.gift_id+'.png';
                    if (type == 'new') {
                        path = util.covers_path+'/'+v.cover_id+'.png';
                    }

                    user_name = v.user_name;
                    if (v.incognito) {
                        user_name = 'Инкогнито';
                    }

                    container.append("<div><a class='inline' onclick='view.my_gifts.showGift("+i+", \""+type+"\")' href='#data'><img src='"+
                        path+"' /></a><br />"+
                        user_name+"<br />"+
                        v.created_date
                        +"</div>");    
                }
            }

            // Show dialog
            $(".inline").fancybox();
        },

        showGift: function(id, type) {
            // Customize dialog
            gift        = this.gifts[type][id]; 
            avatar_path = 'http://avt.appsmail.ru/'+gift.user_box+'/'+gift.user_login+'/_avatarsmall';

            this.gift_img.attr("src", 
                util.images_path+"/"+gift.gift_id+".png");
            this.gift_text.text(gift.text);

            if (gift.incognito) {
                this.gift_from.text('Инкогнито');
            } else {
                this.gift_from.text(gift.user_name);
                this.gift_avatar.attr("src", avatar_path);
            }

            if (type == 'newest') {
                this.emitter.trigger('view.open_gift', gift.id);
            }
        },

        hide: function() {
            this.container.hide();
        }
    };

    // Main init
    $.ajaxSetup({ cache: false });

    // Init views
    view.gifts_catalog.init(purchase, user, gifts_catalog);

    purchase.init(view.gifts_catalog);
    gifts.my.init(view.my_gifts);

    // Start work
    view.my_gifts.showGiftsBlock(gifts.my);
});

// Util 

function htmlEncode(value){
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

