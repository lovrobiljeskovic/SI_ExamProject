const express = require('express')
const app = express();
var fs = require('fs');
const port = 3007
app.use(express.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', function (req, res) {
    try{
        var number = parseInt(fs.readFileSync("eventid.txt"));
        console.log(number);
        var newNumber = number+1;
        fs.writeFile("eventid.txt",newNumber , (err) => {
            if (err) throw err;
            console.log("succes overwriting file")
        });
        res.send({id: number})

    }catch(e){
        console.log(e)
        res.send({message: "Error occured"})
    }
})

app.listen(port, () => console.log(`Event is running!`))