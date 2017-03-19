$(document).ready(function(){
    var id = $('#receiverId').val();
    
    $('#message').click(function(){
        var message = $.trim($('#msg').val());
        
        if(message != ''){
            $.post('/company/message/'+id, {
                message: message,
                id: id
            }, function(data){
                $('#msg').val('');
            });
        }
    });
    
    setInterval(function(){
        $('.msg').load(location.href + ' .msg');
    }, 200);
});