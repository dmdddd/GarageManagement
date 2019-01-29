let express = require('express');
// process.env.PORT Herokus env variable that heroku supplies for the port numer
let port = process.env.PORT || 3000;
let app = express();

var users = [];
users.push({'name': 'Dan', 'password': 123, 'email': 'dan@ggmail.com'});
users.push({'name': 'Yossi', 'password': 123, 'email': 'yossi@ggmail.com'});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/login.html');
});

app.post('/Login', function(req, res){
    var data = req.body;
    var found = {'success': false, 'message': 'User Name Or Password Not Valid'};
    users.forEach(function(user){
        if (user.name.toLowerCase() === data.name.toLowerCase() && parseInt(user.password) === parseInt(data.password)){
            found.success = true;
            found.message = 'Welcome';
	    res.sendFile(__dirname + '/ex1.html');
        }  
    });
    res.send(found);
});



app.listen(port, () => {
	console.log('Example app listening on port %d!', port);
});
