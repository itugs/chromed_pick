var TwitterLib = {
  URLS: {
    BASE: 'http://twitter.com/',
    SEARCH: 'http://twitter.com/search?q='
  }
};

var Renderer = {
  nameAttribute: null,
  fadeTimeout: null,

  getTimestampText: function (inputTimestampStr) {
    var inputTimestamp = Date.parse(inputTimestampStr);
    var nowTimestamp = new Date().getTime();

    var diff = (nowTimestamp - inputTimestamp) / 1000;
    if(diff < 15) {
      return "just now";
    } else if(diff < 60) {
      return "less than 1 minute ago";
    } else if(diff < 60 * 60) {
      var minutes = parseInt(diff / 60);
      return minutes + " minute" + ((minutes > 1) ? "s" : "") + " ago";
    } else if(diff < 60 * 60 * 24) {
      var hours = parseInt(diff / (60 * 60));
      return "about " + hours + " hour" + ((hours > 1) ? "s" : "") + " ago";
    } else if(diff < 60 * 60 * 24 * 30) {
      var days = parseInt(diff / (60 * 60 * 24));
      return "about " + days + " day" + ((days > 1) ? "s" : "") + " ago";
    } else if(diff < 60 * 60 * 24 * 30 * 12) {
      var months = parseInt(diff / (60 * 60 * 24 * 30));
      return "about " + months + " month" + ((months > 1) ? "s" : "") + " ago";
    } else {
      return "years ago";
    }
  },

  getTimestampAltText: function (inputTimestampStr) {
    var inputTimestamp = Date.parse(inputTimestampStr);
    return new Date(inputTimestamp).toLocaleDateString() + " " + new Date(inputTimestamp).toLocaleTimeString();
  },

  transformTweetText: function(oldText) {
    var transformList = [
      {
        //create links
        'expression': /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
        'replacement': "<a href='$1'>$1</a>"
      },
      {
        //create hash search links
        'expression': /(#(\w*))((?=.*?<a)|(?!.*?<\/a>))/ig,
        'replacement': "<a href='" + TwitterLib.URLS.SEARCH + "%23$2'>$1</a>"
      },
      {
        //create users links
        'expression': /(@(\w*))((?=.*?<a)|(?!.*?<\/a>))/ig,
        'replacement': "@<a href='" + TwitterLib.URLS.BASE + "$2' onclick=\"openTab('" + TwitterLib.URLS.BASE + "$2')\">$2</a>"
      },
      {
        //line breaks
        'expression': /\r?\n/g,
        'replacement': "<br />"
      }
    ];

    var newText = oldText;
    for(var i = 0; i < transformList.length; ++i) {
      newText = newText.replace(transformList[i]['expression'], transformList[i]['replacement']);
    }
    return newText;
  },

  renderTweet: function (tweet) {
    var user = tweet.user;
    var text = tweet.text;
    var tweetId = tweet.id;
    if(tweet.retweeted_status) {
      user = tweet.retweeted_status.user
      text = tweet.retweeted_status.text
      tweetId = tweet.retweeted_status.id;
    }
    text = this.transformTweetText(text);

    var tweetClass = 'chrome_bird_tweet';

    var from = tweet.source;
    var inReply = null;
    if(tweet.in_reply_to_status_id) {
      var linkDst = TwitterLib.URLS.BASE + tweet.in_reply_to_screen_name + '/status/' + tweet.in_reply_to_status_id;
      inReply = '<a href="' + linkDst + '">in reply to ' + tweet.in_reply_to_screen_name + '</a> ';
    }

    var nameAttribute = this.nameAttribute;
    var tweetUserName;
    var tweetTitleUserName;
    if(nameAttribute == "screen_name") {
      tweetUserName = user.screen_name;
      tweetTitleUserName = user.name;
    } else if(nameAttribute == "name") {
      tweetUserName = user.name;
      tweetTitleUserName = user.screen_name;
    } else if(nameAttribute == "both") {
      tweetUserName = user.screen_name + ' (' + user.name + ')';
      tweetTitleUserName = '';
    }

    var str = '<div tweetid="' + tweet.id + '" class="' + tweetClass + '">';
    str += '<img class="profile" src="' + user.profile_image_url + '" onclick="window.open(\'' + TwitterLib.URLS.BASE + user.screen_name + '\')"></img>';
    str += '<a href="' + TwitterLib.URLS.BASE + user.screen_name + '" class="user" screen_name="' + user.screen_name + '" title="' + tweetTitleUserName + '">' + tweetUserName + '</a>';

    str += '<div class="text">';
    if(tweet.retweeted_status) {
      str += '<img class="retweet" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACFklEQVR42o2Ty2saURTGz1QEiwsf4EZt8S/IJlDpXmh1k0W7LkQKYmlIJMQOpCLSRmJDsZJSRcRK1y3YldGVuBGCQcjCBypCqyAUoRutz9LvDIxoTUgGDnfmzjm/8/juFegWTyAQEMfj8UkwGJz//0+4DUAUxUsAzsPh8PNrAYlE4t50On0ymUwewTYRYIARm8FgIOxRo9GIpFKpvTVAPB5/iOBXOp1uS61Wk0qlIkEQaD6f02w2k4wB5XKZarXaUTqdfr0AxGIxznxqNpu3NBoNjUajlWD8W7yXSiWq1+snmUzGuwBEIpE9ZA4bjUbJaTgcUrPZpFarJZXPQJPJJIEQ/DGbze6stBAKhTIWi+Uxl87BhULhB4K+Yib7spPD4bgE/CKXy22vDdHv9/eQSQv7i8A/WD8lk0nfspPNZjsE4Nhutz/jiuThsgler3d7eZPf4fgFfYtOp/NoGYRkb+DzAnYXfnew/r7yHKD8z+h50+12b8h7Pp/vPQKeWq3W+wqFgnq9HuXz+bM1ACQ91Wq1L3lonU6H5Or4LPAwlUqlNGyWtFKpeFYAkPQdpDxgRVg6WT55HQwGxNnb7TYVi8XvSLKzAoCkbwE45EzLAFnefr9P3W6XqtUqB4cgaXGtBVycD3q9fpdPHmeSW8D3L6wXWLMAfoOkP6+9TB6PJ4HAB9FodINueK4EuFwuBbId4OIc3wT4B9uSeeoVBrUyAAAAAElFTkSuQmCC">'
    }
    str += text + '</div>';

    str += '<div class="footer">';
    var statusLinkDst = TwitterLib.URLS.BASE + user.screen_name + '/status/' + tweetId;
    str += '<a href="' + statusLinkDst + '"><span class="timestamp" title="' + Renderer.getTimestampAltText(tweet.created_at) + '">' + Renderer.getTimestampText(tweet.created_at) + '</span></a> ';
    if(inReply) {
      str += inReply;
    } else if(tweet.retweeted_status) {
      str += 'retweeted by <a href="' + TwitterLib.URLS.BASE + tweet.user.screen_name + '">' + tweet.user.screen_name + '</a> ';
    }
    if(from) {
      str += 'from ' + from;
    }
    str += '</div>';

    str += '<div style="clear: both;"></div>';

    str += '</div>'
    return str;
  },

  simpleAssemblyTweets: function (tweets) {
    var tweetsStr = '';
    for(var i = 0; i < tweets.length; ++i) {
      tweetsStr += Renderer.renderTweet(tweets[i]);
    }
    return tweetsStr;
  },

  assemblyTweets: function (tweets) {
    var tweetsArray = [];
    for(var i = 0; i < tweets.length; ++i) {
      tweetsArray[i] = Renderer.renderTweet(tweets[i]);
    }

    var existingDestination = $("#chromed_bird_container");
    if(existingDestination.length == 1) {
      existingDestination.append(tweetsArray.join(''));
    } else {
      var destination = $("<div id='chromed_bird_container'>");

      var controlBar = '<div id="chromed_bird_control">';
      controlBar += '&nbsp;You can change notification settings in the options page'
      controlBar += '<a href="javascript:var el = document.getElementById(\'chromed_bird_container\'); el.parentNode.removeChild(el);">Close</a>'
      controlBar += '</div>';

      destination.html(controlBar + tweetsArray.join(''));
      destination.hide();
      $(document.body).prepend(destination);

      var removeElement = function() {
        destination.remove();
      }

      destination.slideDown('fast', function(){
        $(this).fadeOut(Renderer.fadeTimeout, removeElement).hover(
          function() {
            $(this).stop().show().css('opacity', '1.0');
          },
          function() {
            $(this).fadeOut(Renderer.fadeTimeout, removeElement);
          }
        );
      });
    }
  }
}

if(location.protocol != 'chrome-extension:' && document.body.tagName != 'FRAMESET') {
  chrome.extension.sendRequest({
    cb_requesting_tweets: true,
    frame_area: $(window).width() * $(window).height()
  }, function(response) {
    var tweets = response.tweets;
    if(tweets && tweets.length > 0) {
      Renderer.nameAttribute = response.nameAttribute;
      Renderer.fadeTimeout = response.fadeTimeout;
      Renderer.assemblyTweets(tweets);
    }
  });
}