
$( document ).ready(function() {
  var socket = io();
  var userInfo = {
    name: null,
  }
  window.history.replaceState(null, null, '/');
  $('.login ').show();
  $('.signout').hide();

  $('.signout').on('click', function() {
    $.removeCookie("oi.username")
    location.reload();
  })

  $('.group-nav').on('click', function(e) {
    if(!!userInfo.name) {
    var view_group = $(this).attr('href')

    $('.login').hide();
    $('.chat-online').show();
      if(view_group == '/chat') {
        window.history.replaceState(null, null, view_group);
        $('.chat').show()
        $('.news').hide()
      } else {

        // $('.news').show()
        // $('.chat').hide()
      }
    } else {
      $('.msg-notice').css({color: 'red'})
      $('.msg-notice').text("Login first.")
    }
    return false;
  })

  $('#login-form').submit(function(){
    userInfo.name = $('#login').val();
    if(userInfo.name !== '') {
      socket.emit('new user', userInfo.name);
      $.cookie('oi.username', userInfo.name);
      $('#login-form').hide()
      $('.msg-notice').css({color: '#464646'})
      $('.msg-notice').text("Select room to join.")
      $('.signout').text(userInfo.name + ": Sign out")
      $('.signout').show();
    }

    $('#login').val('');
    return false;
  });

  $('#chat-form').keypress(function(e){
    socket.emit('message typing', userInfo.name);
    if (e.keyCode == 13 && !e.shiftKey) {
      var group = $(this).data('id');
      var msg = $('#composer').val();
      console.log(group);
      if(msg) {
        socket.emit('send message', msg);
        $('#composer').val('');
      }
      return false;
    }
  });
  
  $('#composer').blur(function(e){
    socket.emit('message not typing', userInfo.name);
    $('.chat-typing').hide();
  })

  // typing message 
  socket.on('typing', function(data){
    if(data !== userInfo.name) {
      $('.chat-typing').text(data + ' is typing...');
      $('.chat-typing').show();
    }
  });

  // typing message 
  socket.on('not typing', function(data){
      $('.chat-typing').text('');
  });

  // receive data and append to chat box, scroll down to bottom if convo is long
  socket.on('new message', function(data){
    let user = 'them';
    let username = data.user + ': '
    if(data.user === userInfo.name) {
      user = 'me'
      username = ''
    }
    $('.chat-box').append('<p class="chat-msg '+user+'"><strong>'+username+'</strong>'+data.message + '</div>');
    $('.chat-box').scrollTop($('.chat-box')[0].scrollHeight);
  });

  // notify on new user joined.
  socket.on('new user join notify', function(data){
    if(data !== userInfo.name)  {
      $('.chat-box').append('<p class="chat-msg new">'+data+' has joined. Say Hi!'+'</div>');
      $('.chat-box').scrollTop($('.chat-box')[0].scrollHeight);
    }
  });

  // notify on user leave.
  socket.on('user leaved', function(data){
    console.log("leave" + data)
    if(data !== userInfo.name)  {
      $('.chat-box').append('<p class="chat-msg leave">'+data+' has leaved. :('+'</div>');
      $('.chat-box').scrollTop($('.chat-box')[0].scrollHeight);
    }
  });

  // receive data and append to chat box, scroll down to bottom if convo is long
  socket.on('get users', function(data){
    let html = ''
    for(i = 0; i < data.length; i++) {
      html += '<p class="user">'+data[i].username+'</p>'
    }
    $('.user-list').html(html)
  });
})
