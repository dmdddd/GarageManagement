let express = require('express');
// process.env.PORT Herokus env variable that heroku supplies for the port numer
let port = process.env.PORT || 3000;
let app = express();
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/ex1.html');
});
app.listen(port, () => {
	console.log('Example app listening on port %d!', port);
});
