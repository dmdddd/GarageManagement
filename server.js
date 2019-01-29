let express = require('express');
// process.env.PORT Herokus env variable that heroku supplies for the port numer
let port = process.env.PORT || 3000;
let app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended: true})); // to support URL-encoded bodies


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


app.post('/Users', function(req, res){
    var data = req.body;
    var exist = false;
    users.forEach(function(user){
        if (user.name.toLowerCase() === data.name.toLowerCase()){
            exist = true;
        }  
    });
    var msg = 'User ' + data.name + ' ';
    if (!exist){
        users.push(data);
        msg += 'Was Added Successfully';
    }  
    else
        msg += 'Alredy exist In Data Base';
    res.send({'success': !exist, 'message': msg});
});

app.get('/Users', function(req, res){
    var response = 'Data Base Users: ';
    users.forEach(function(user){
       response += user.name + ' ';
    });
    res.send({'success': true, 'message' : response});
});



app.listen(port, () => {
	console.log('Example app listening on port %d!', port);
});
