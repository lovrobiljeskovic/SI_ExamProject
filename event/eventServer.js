const express = require('express')
var cors = require('cors')
const app = express();
var fs = require('fs');
const port = 3001;
app.use(express.json())
app.use(cors());

let events = []
app.get('/event/', function (req, res) {
    try {
        console.log(process.cwd())
        var data = fs.readFileSync('number.txt', { encoding: 'utf8' })
        console.log(data);
        var number = parseInt(data);
        events.push(number)
        var newNumber = number+1;
        fs.writeFile("number.txt",newNumber , (err) => {
            if (err) throw err;
            console.log("succes overwriting file")
        });
        res.send({id: number});
        

    } catch (e) {
        console.log(e)
        res.send({ message: "Error occured" })
    }
})

app.get('/event/all', function (req, res) {
    res.send(JSON.stringify(events))
})

app.listen(port, () => console.log(`Event is running!`))