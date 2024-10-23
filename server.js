require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const app = express();

const port = process.env.PORT;
app.use(express.static("public"));
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const weatherSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
    },
    main: {
        type: String,
        required: true,
    },
    temp: {
        type: Number,
        required: true,
    },
    avg_temp: {
        type: Number,
        required: true,
    },
    min_temp: {
        type: Number,
        required: true,
    },
    max_temp: {
        type: Number,
        required: true,
    },
    threshold: {
        type: Number,
        required: false,
    },
    feels_like: {
        type: Number,
        required: true,
    },
    dt: {
        type: String,
        required: true,
    },
});
let timer = new Date();
const apiKey = process.env.API_KEY;
let date = `${timer.getDate()}/${timer.getMonth() + 1}/${timer.getFullYear()}`;
let Weather = {
    city: "",
    main: "",
    temp: 0,
    avg_temp: 0,
    min_temp: 0,
    max_temp: 0,
    feels_like: 0,
    threshold: 0,
    dt: "",
};
function CreateModel() {
    const Model = mongoose.model(`${date}`, weatherSchema);
    return Model;
}
const Cities = {
    Delhi: {},
    Mumbai: {},
    Chennai: {},
    Bangalore: {},
    Kolkata: {},
    Hyderabad: {},
};
Object.keys(Cities).forEach((key) => {
    Object.assign(Cities[key], {
        avg_temp: 0,
        max_temp: 0,
        min_temp: 100,
    });
});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});
app.get("/dailyChart", async (req, res) => {
    const data = await Model.find();
    console.log(data);
    res.json(data);
});
let count = 0;
let ThresholdCount = 0;
let ThresholdTemp = 35;
let Model = CreateModel();
function myWeather() {
    count++;
    Object.keys(Cities).forEach((city) => {
        function WeatherUpdate() {
            fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
            )
                .then((response) => response.json())
                .then((data) => {
                    const date = new Date(data.dt * 1000);
                    Cities[city].avg_temp =
                        (Cities[city].avg_temp * (count - 1) + data.main.temp) /
                        count;
                    Cities[city].min_temp = Math.min(
                        Cities[city].min_temp,
                        data.main.temp
                    );
                    Cities[city].max_temp = Math.max(
                        Cities[city].max_temp,
                        data.main.temp
                    );
                    if (data.main.temp > ThresholdTemp) ThresholdCount++;
                    else ThresholdCount = 0;
                    return {
                        ...Weather,
                        city: city,
                        main: data.weather[0].main,
                        temp: data.main.temp,
                        min_temp: Cities[city].min_temp,
                        max_temp: Cities[city].max_temp,
                        avg_temp: Cities[city].avg_temp,
                        feels_like: data.main.feels_like,
                        threshold: ThresholdTemp,
                        dt: data.main.dt,
                    };
                })
                .then(async (newWeather) => {
                    const cityWeather = await Model.findOneAndUpdate(
                        { city: newWeather.city },
                        newWeather
                    );
                    if (!cityWeather) {
                        const weatherinfo = new Model(newWeather);
                        await weatherinfo.save();
                        console.log("Can't find so saved!");
                    } else console.log("finded and updated!");
                    console.log(newWeather);
                });
        }
        WeatherUpdate();
    });
}
myWeather();
setInterval(() => {
    const time = new Date();
    const currDate = `${time.getDate()}/${
        time.getMonth() + 1
    }/${time.getFullYear()}`;
    if (date !== currDate) {
        date = currDate;
        Model = CreateModel();
        console.log("new Model Created!");
    }
    console.log(`SetInterval is called ${count} times`);
    myWeather();
    if (ThresholdCount == 2) {
        console.log(
            `Alert, Temperature has crossed the threshold ${ThresholdCount} times!`
        );
    }
}, 300000);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
