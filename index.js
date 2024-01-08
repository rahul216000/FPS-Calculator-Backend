const express = require('express');
const dotenv = require("dotenv");
const PORT = process.env.PORT || 3000;
const cheerio = require('cheerio');
const axios = require('axios');

dotenv.config({ path: './config.env' });
const Scraper_API_KEY = process.env.SCRAPER_API_KEY;

const app = express();

const SendEmail = require("./Messages/SendEmail")

const cors = require('cors');
app.use(cors({
    origin: [
        // 'http://localhost:5500',
        // 'https://airport-form.netlify.app',

    ]
}));
app.use(express.json())

app.get("/check", async (req, res) => {
    
    // let url = req.body.url;
    let url = "https://pc-builds.com/fps-calculator/result/1rV1fl/4N/bioshock-infinite/2560x1440/"
    let data = await webScraper(url)

    if (data == "Error") {
        return res.send("Error")
    }

    SendErrorEmail("functionName", "error", "query")


    res.send(data)

})

app.get("/", async (req, res) => {
    res.send("Not Allowed")

})


async function webScraper(url) {

    try {
        // url = "https://pc-builds.com/fps-calculator/result/1rV1fl/4N/bioshock-infinite/2560x1440/"

        let data = await axios.get(`http://api.scraperapi.com/?api_key=${Scraper_API_KEY}&url=${url}`)
        const $ = cheerio.load(data.data);

        var text = $($('script')).text();
        var FirstResult = findTextAndReturnRemainder(text, "var objCombinedBar =");
        var SecondResult = findTextAndReturnRemainder(text, "var obj =");

        let FirstResultArr = []

        FirstResultArr.push(PullArr(FirstResult, 4))
        FirstResultArr.push(PullArr(FirstResult, 5))
        FirstResultArr.push(PullArr(FirstResult, 6))

        let SecondResultArr = []

        SecondResultArr.push(PullArr(SecondResult, 4))
        SecondResultArr.push(PullArr(SecondResult, 5))
        SecondResultArr.push(PullArr(SecondResult, 6))

        return { FirstResultArr: FirstResultArr, SecondResultArr: SecondResultArr }

    } catch (error) {
        // Send Error Email
        console.log(error);
        return "Error"
    }

};

function findTextAndReturnRemainder(target, variable) {
    try {
        var chopFront = target.substring(target.search(variable) + variable.length, target.length);
        var result = chopFront.substring(0, chopFront.search(";"));

        return result;

    } catch (error) {
        // Send Error Email
        return "Error"
    }
}

function PullArr(text, number) {
    try {
        let newSubStr = text.split("\n")
        newSubStr = newSubStr[number]
        newSubStr = newSubStr.slice(0, -1);
        newSubStr = JSON.parse(newSubStr)
        newSubStr = ChangeFPSValuebySomePercent(newSubStr)

        return newSubStr

    } catch (error) {
        // Send Error Email
        // console.log(error);

        return "Error"
    }
}

function ChangeFPSValuebySomePercent(arr) {
    let FPSArr = []
    for (let i = 0; i < arr.length; i++) {
        let FPS = 0
        if (arr[i] < 100) {
            FPS = SetPercent(arr[i], 0.10)
        } else {
            FPS = SetPercent(arr[i], 0.05)
        }

        FPSArr.push(FPS)

    }

    return FPSArr
}

function SetPercent(number, percent) {
    return ((number * percent) / 100) + number
}
async function SendErrorEmail(functionName, error, query) {

    const sender = {
        email: 'ysertbas1907@gmail.com',
        name: `FPS Calculator`,
    }

    let Email = "rahul.rastogi.216000@gmail.com"

    let content = `here is error`
    await SendEmail(sender, Email, `Something went wrong in ${functionName}`, content)

}



app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    } else {
        console.log('Server not started ' + error);
    }

});

