let express = require('express');
// process.env.PORT Herokus env variable that heroku supplies for the port numer
let port = process.env.PORT || 3000;
let app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended: true})); // to support URL-encoded bodies
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.REC_MAIL,
    pass: process.env.REC_MAIL_PW
  }
});

// Initialize databasse
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: "https://garageinc-fe238.firebaseio.com"
});
// var serviceAccount = require(__dirname + "/serviceAccountKey.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://garageinc-fe238.firebaseio.com"
// });

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/login.html');
});


app.get('/Main', (req, res) => {
	res.sendFile(__dirname + '/main.html');
});

app.get('/NewJob', (req, res) => {
	res.sendFile(__dirname + '/new_job.html');
});

app.get('/AllJobs', (req, res) => {
  var jobsRef = admin.firestore().collection("Jobs");
  const jobs = [];
  var allJobs = jobsRef.get().then(snapshot => {
    snapshot.forEach(doc => {
      var item = doc.data();
      item.id = doc.id;
      jobs.push(item);
    });
    res.send(jobs);
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });
});

app.post('/Login', function(req, res){
  var username = req.body.name;
  var password = req.body.password;
  var found = {'success': false, 'message': 'Username or password are wrong'};
  var usersRef = admin.firestore().collection('Users').doc(username);
  var serDoc = usersRef.get()
    .then(doc => {
      if (doc.exists && doc.data().password == password){
        found.success = true;
        found.message = "/Main";
        found.name=doc.data().name;
        res.send(found);
      } else {
        res.send(found);
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
});


app.post('/addJob', function(req, res){
  console.log("addjob");
  var found = {'success': false, 'message': 'Could not delete data.'};
  var new_job = {
  'car_number': req.body.car_number,
  'car_type': req.body.car_type,
  'client_name': req.body.client_name,
  'client_phone': req.body.client_phone,
  'job_desc': req.body.job_desc,
  'date': req.body.date,
  'cost': req.body.cost,
  'type': req.body.type
  }
  var found = {'success': false, 'message': 'Could add a job.'};
  var jobsRef = admin.firestore().collection('Jobs');
  jobsRef.add(new_job);

  found.success = true;
  found.redirect = "/Main";
  res.send(found);



});

app.post('/removeJob', function(req, res){
  var answer = {'success': false, 'message': 'Could not delete the job.'};
  var id_to_remove = req.body.id_to_remove;
  var jobsRef = admin.firestore().collection('Jobs');
  jobsRef.doc(id_to_remove).delete();
  answer.success = true;
  answer.message = "Job deleted";
  res.send(answer);
});

app.post('/Register', function(req, res){
  var data = req.body;
  var register_new_user = false;
  var username = req.body.username;
  var found = {'success': false, 'message': 'Username or password are wrong'};
  var usersRef = admin.firestore().collection('Users').doc(username);
  var serDoc = usersRef.get()
    .then(doc => {
      if (!doc.exists) {
        // here we start regestering the user
        register_new_user = true;
        var setDoc = admin.firestore().collection('Users').doc(username).set(data);
        found.success  = true;
        found.message = "/Main";
        res.send(found);

      } else {
        found.message = "User name is taken";
        res.send(found);
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
});

app.get('/Register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.get('/ForgotPassword', (req, res) => {
  res.sendFile(__dirname + '/retrieve_pass.html');
});

app.post('/ForgotPassword', function(req, res){
  var answer = {'success': false, 'message': 'Error.'};
  var username = req.body.username;
  var name = req.body.name;
  var email = req.body.email;
  var usersRef = admin.firestore().collection('Users').doc(username);
  var serDoc = usersRef.get()
    .then(doc => {
      if (doc.exists){
        // user found
        if (doc.data().name == name && doc.data().email == email){
          //send password
          var mailOptions = {
            from: 'zegarageze@gmail.com',
            to: email,
            subject: 'Your password',
            text: 'Hello ' + name + ', your password is: ' + doc.data().password
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              answer.message = "Could not send email, please contact support.";
              res.send(answer);
            } else {
              answer.success = true;
              answer.message = "Email containing your password has been sent to " + email;
              res.send(answer);
            }
          });
        } else {
          //wrong name or pw
          answer.message= "Wrong details provided.";
          res.send(answer);
        }
      } else {
        answer.message = "Could not find user for username: " + username;
        res.send(answer);
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
});


app.get('/LogOut', (req, res) => {
	res.sendFile(__dirname + '/login.html');
});

app.get('/styles.css', (req, res) => {
	res.sendFile(__dirname + '/styles.css');
});

app.get('/Users', (req, res) => {
  var users = [];
  admin.firestore().collection("Users").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      var user = doc.data().username;
      users.push(user);
    });
    res.send(users);
  });
});


app.get('/EditJob', (req, res) => {
  res.sendFile(__dirname + '/edit_job.html');
});

app.post('/GetJobById', (req, res) => {
  var job_id = req.body.job_id;
	var jobRef = admin.firestore().collection('Jobs').doc(job_id);
  var jobDoc = jobRef.get()
  .then(doc => {
    if (doc.exists){
      res.send(doc.data());
    } else {
      res.send("No data found");
    }
  })
  .catch(err => {
    console.log('Error getting document', err);
  });
});

app.post('/SaveJobChanges', (req, res) => {
  var found = {'success': false, 'message': 'Could not save changes.'};
  var updated_job = req.body; 
  var jobRef = admin.firestore().collection('Jobs').doc(updated_job.job_id);
  jobRef.set({
    car_number: req.body.car_number,
    car_type: req.body.car_type,
    client_name: req.body.client_name,
    client_phone: req.body.client_phone,
    job_desc: req.body.job_desc,
    date: req.body.date,
    cost: req.body.cost,
    type: req.body.type}, { merge: true });

  found.success = true;
  found.redirect = "/Main";
  res.send(found);

});


app.get('/ResetDB', (req, res) => {
  var new_users = [
    {'email': "admin@admin.admin", 'name': "Admin user", 'password': "admin", 'username': "admin"},
    {'email': "dan@blabla.com", 'name': "Daniel K", 'password': "123", 'username': "dan"}];
  var new_jobs = [
    {'car_number': "12-333-43", 'car_type': "Batmobile", 'client_name': "Bruce Wayne", 'client_phone': "0547-456-234", 'type': "Routine Checkup", 'cost': "123", 'date': '2019-02-17', 'job_desc': "123"},  
    {'car_number': "14-654-23", 'car_type': "Tesla", 'client_name': "Elon Musk", 'client_phone': "0547-456-234", 'type': "Sending to Mars", 'cost': "123", 'date': '2019-02-17', 'job_desc': "123"},
    {'car_number': "345-65-234", 'car_type': "Yello Submarine", 'client_name': "The Beatles", 'client_phone': "0547-456-234", 'type': "Fixing", 'cost': "123", 'date': '2019-02-17', 'job_desc': "123"},
    {'car_number': "735-23-245", 'car_type': "Toyota", 'client_name': "Hipster", 'client_phone': "0547-456-234", 'type': "Routine Checkup", 'cost': "123", 'date': '2019-02-17', 'job_desc': "123"}];

    // Users
    var usersRef = admin.firestore().collection("Users");
    var allUsers = usersRef.get().then(snapshot => {
      snapshot.forEach(user => {
        admin.firestore().collection("Users").doc(user.id).delete();
      });
    })

    new_users.forEach(function(user) {
      admin.firestore().collection('Users').doc(user.username).set(user);
    });



    // Jobs
    var jobsRef = admin.firestore().collection("Jobs");
    var allJobs = jobsRef.get().then(snapshot => {
      snapshot.forEach(job => {
        admin.firestore().collection("Jobs").doc(job.id).delete();
      });
    })

    new_jobs.forEach(function(job) {
      admin.firestore().collection('Jobs').add(job);
    });
    res.send({'success' : true});
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
      return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}



app.listen(port, () => {
	console.log('Example app listening on port %d!', port);
});
