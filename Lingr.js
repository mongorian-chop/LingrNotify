function Lingr() {
  var tm_offset = new Date().getTimezoneOffset()*-1;
  var __URL__     = 'http://lingr.com/api/';
  var __OBSERVE__ = 'http://lingr.com:8080/api/';
  var nickname;
  var res;
  var session = '';
  var rooms;
  var room_detail = new Array();
  var request = {
    create_session: 'session/create',
    verify_session: 'session/verify',
    room_list:      'user/get_rooms',
    get_rooms:      'room/show',
    subscribe:      'room/subscribe',
    observe:        'event/observe',
    destroy:        'session/destroy'
  };
  var timeout = (localStorage.timeout) ? parseInt(localStorage.timeout)*1000 : 5000;

  var create_session = function() {
    $.post(
      __URL__ + request['create_session'],
      {'user': localStorage.user, 'password': localStorage.password},
      function(res, status) {
        if(res.status == 'ok') {
          session = localStorage.session = res.session;
          nickname = res.nickname;
          debug("Login.");
          room_list();
          localStorage.status = false;
        }else{
          setTimeout(function(){
            create_session();
          }, 15000);
          error('create_session');
        }
      },
      'json'
    );
  };
  var verify_session = function() {
    session = localStorage.session;
    $.post(
      __URL__ + request['verify_session'],
      {'session': session},
      function(res, status) {
        if(res.status == 'ok') {
          session = res.session;
          nickname = res.nickname;
          debug("Login.");
          room_list();
        }else{
          session = localStorage.session = "";
          create_session();
        }
      },
      'json'
    );
  };
  var room_list = function() {
    $.get(
      __URL__ + request['room_list'],
      {'session': session},
      function(res, status) {
        if(res.status == 'ok') {
          rooms = res.rooms;
          get_rooms();
          subscribe();
        }else{
          error('room_list');
        }
      },
      'json'
    );
  };
  var get_rooms = function() {
    r = rooms.join(',');
    $.get(
      __URL__ + request['get_rooms'],
      {'session': session, "rooms": r},
      function(res, status) {
        if(res.status == 'ok') {
          room_detail = res.rooms
        }else{
          error('get_rooms');
        }
      },
      'json'
    );
  };
  var subscribe = function() {
    r = rooms.join(',');
    $.post(
      __URL__ + request['subscribe'],
      {'session': session, 'room': r, 'reset': 'true'},
      function(res, status) {
        if(res.status == 'ok') {
          counter = res.counter;
          observe();
        }else{
          error('subscribe');
        }
      },
      'json'
    );
  };
  var observe = function() {
    $.get(
      __OBSERVE__ + request['observe'],
      {'session': session, 'counter':counter},
      function(res, status) {
        if(res.status == 'ok') {
          if(res.events) {
            show(res);
            if(localStorage.status) {
              counter = res.counter;
              observe();
            }else{
              destroy();
              create_session();
            }
          }
        }else{
          error('observe');
        }
      },
      'json'
    );
  };
  var show = function(res) {
    message = res.events[0].message;
    if(message.nickname == nickname) return;
    room = get_roomname(message.room);
    notification = webkitNotifications.createNotification(
      message.icon_url,
      message.nickname + ' ' + room + ' ',
      message.text
    );
    notification.ondisplay = function(){
      setTimeout(function(){
        notification.cancel();
      }, timeout);
    };
    notification.show();
  };
  var destroy = function() {
    $.get(
      __URL__ + request['destroy'],
      {'session': session},
      function(res, status) {
        if(res.status == 'ok') {
          session = localStorage.session = "";
          debug("Logout.");
        }
      },
      'json'
    );
  };
  var error = function(step) {
    if(step == 'create_session') {
      message = "";
    }else{
      message = "";
    }
    localStorage.status = true;
    notification = webkitNotifications.createNotification(
      'http://www.gravatar.com/avatar/40433b7db09be3bad59a00158d6da3ee.jpg',
      'error:' + message,
      ''
    );
    notification.ondisplay = function(){
      setTimeout(function(){
        notification.cancel();
      }, timeout);
    };
    notification.show();
  }

  var time_format = function(accept_date) {
    split_date  = accept_date.split('T');
    sp_day      = split_date[0].split('-');
    sp_time     = split_date[1].split(':');
    new_year    = sp_day[0];
    new_month   = sp_day[1];
    new_day     = sp_day[2];
    new_hour    = sp_time[0];
    new_min     = parseInt(sp_time[1])+tm_offset;
    new_sec     = sp_time[2].replace('Z','');
    new_date = new Date(new_year, new_month, new_day, new_hour, new_min, new_sec);
    return new_date.getHours()+':'+new_date.getMinutes()+':'+new_date.getSeconds();
  };

  var get_roomname = function(room) {
    for(var i in room_detail) {
      if(room_detail[i].id == room) {
        return room_detail[i].name;
      }
    }
  };

  var debug = function(msg) {
    notification = webkitNotifications.createNotification(
      'http://www.gravatar.com/avatar/40433b7db09be3bad59a00158d6da3ee.jpg',
      'msg ' + msg,
      ''
    );
    notification.ondisplay = function(){
      setTimeout(function(){
        notification.cancel();
      }, timeout);
    };
    notification.show();
  }

  return {
    varsion: '0.1',
    start: function() {
      if(localStorage.session && localStorage.session.length > 0) {
        verify_session();
      }else{
        create_session();
      }
    }
  };
}
