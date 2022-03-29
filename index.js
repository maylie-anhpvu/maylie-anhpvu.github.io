var express = require('express'),
    bodyParser = require('body-parser'),
    alert = require('alert'),
    request = require('request');

var app = express();
app.use(express.urlencoded({extended: true}))

var openweatherID = '4aed79a9343fa3db29c98df71346404b';

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mayanhvu:bobo35VL%40@cluster0.7vur6.mongodb.net/project-530?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.set('view engine', 'ejs');
app.set("views", "./views");

// ROUTING //
// Home page //
app.get('/home', function(req, res) {
    res.render('home');
});

// Login page //
app.get('/login', function(req, res) {
    res.render('login');
});

// Register page //
app.get('/register', function(req, res) {
    res.render('register');
});

// Handling register - No input conditions atm
app.post('/register', function(req, res) {


    var account = {
        username: req.body.username,
        password: req.body.password
    }
    var query = { username: account.username, password: account.password };

    client.connect(err => {
        const collection = client.db("project-530").collection("Accounts");
        collection.find(query).toArray(function (err, document) {
            if (err) throw err;
            console.log(document);
            if (document.length != 0) {
                alert("Account already exist, please log in");  
            } else {
                collection.insertOne(account);
                console.log('Item inserted');
                alert("Account created, please log in");  
            }
        })
    })
});

// Handling login - No input conditions atm
app.post('/login', function(reqlogin, reslogin){
    var uname = reqlogin.body.username;
    var pw = reqlogin.body.password;

    var query = { username: uname, password: pw };
    
    client.connect(err => {
        if (err) throw err;
        
        const collection = client.db("project-530").collection("Accounts");

        collection.find(query).toArray(function (err, document) {
            if (err) throw err;
            console.log(document);
            if (document.length == 0) {
                console.log("Wrong input");
                alert("Invalid credentials, please try again");  
            }
            else {
                console.log(document);
                reslogin.redirect('/view_weather');
                // reslogin.send("<html> <a href='/view_weather'>View weather</a></html>");
            };
            
        });
    });
});

app.get("/view_weather", function (req, res) {
    // This will not fetch and display any data in the index page
    res.render("view_weather", { weather: null, error: null });
});


// Get data from OpenWeatherMap API and display on View_weather
app.post('/view_weather', function(req, res){

    var city = req.body.city;
    var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openweatherID}`;

    request(url, function (err, respone, body){
        if(err) {
            res.render('view_weather',  { weather: null, error: 'Error, please try again' });
        } else {
            let weather = JSON.parse(body);
            console.log(weather);

            if (weather.main == undefined) {
                res.render('view_weather', { weather: null, error: 'Error, please try again' })
            } else {
                let place = `${weather.name}, ${weather.sys.country}`,
                    weatherTimezone = `${new Date(weather.dt * 1000 - weather.timezone * 1000)}`;
                let weatherTemp = `${weather.main.temp}`,
                    weatherPressure = `${weather.main.pressure}`,

                  /* Fetch the weather icon and its size using the icon data*/
                    weatherIcon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                    weatherDescription = `${weather.weather[0].description}`,
                    humidity = `${weather.main.humidity}`,
                    clouds = `${weather.clouds.all}`,
                    visibility = `${weather.visibility}`,
                    main = `${weather.weather[0].main}`,
                    weatherFahrenheit = (weatherTemp * 9) / 5 + 32;
                
                // Function to round off the value of the degrees fahrenheit calculated into two decimal places
                function roundToTwo(num) {
                    return +(Math.round(num + "e+2") + "e-2");
                }
                weatherFahrenheit = roundToTwo(weatherFahrenheit);



                res.render('view_weather', {
                    weather: weather,
                    place: place,
                    temp: weatherTemp,
                    pressure: weatherPressure,
                    icon: weatherIcon,
                    description: weatherDescription,
                    timezone: weatherTimezone,
                    humidity: humidity,
                    fahrenheit: weatherFahrenheit,
                    clouds: clouds,
                    visibility: visibility,
                    main: main,
                    error: null,
                  });
            }
        }
    })
})
        
    

app.listen(3000);


