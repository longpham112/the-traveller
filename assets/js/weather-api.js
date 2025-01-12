var apiKey = "2f8fa537b9d9c6dee91715b6634d3f8e"; // The personal API Key


// Handles the submit button, which fetches the city name that the user input and get the coordinates of the city
function formSubmitHandler(event) {
    event.preventDefault();

    let city = $("#city-name").val();
  
    if (city) {
        //Check local storage and get the savedCities value
        let cityList = JSON.parse(localStorage.getItem('savedCities'));
        //If cityList is not empty and contains the 
        if (cityList !== null && cityList.some(element => element.cityName.toLowerCase() === city.toLowerCase()))
        {
            const i = cityList.findIndex(element => element.cityName.toLowerCase() === city.toLowerCase()); 
            getCityWeather(cityList[i].cityLat, cityList[i].cityLon, cityList[i].cityName);
        }
        else {
            getCityCoords(city);
        }
    } 
    else {
        $("#weather-hint").html("Please enter a city name!");
    }
};

// Calling the OpenWeather Direct geocoding API to get the latitude and longitude of the given city name
function getCityCoords(name) {
    let apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + name + "&appid=" + apiKey;
  
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                // console.log(response);
                response.json().then(function (data) {
                    console.log(data);
                    // Check if the API has returned any results
                    if (data.length !== 0) {
                        $(".forecast-div").addClass("columns");
                        $("#weather-hint").hide();
                        let lat = data[0].lat;
                        let lon = data[0].lon;

                        //Saves city name and city coordinates to local storage
                      
                        var cityList = [];
                        
                        var citySearch = {
                            cityName: name,
                            cityLat: lat,
                            cityLon: lon,
                            poi:{},
                            myToDoList:[],
                        };
                        
                            var storedCityList = JSON.parse(localStorage.getItem("savedCities"));
                            if(storedCityList !== null){
                            cityList = storedCityList;}
                            cityList.push(citySearch);
                        
                        localStorage.setItem("savedCities",JSON.stringify(cityList));

                        getCityWeather(lat, lon, name);
                    }
                    else {
                        $("#weather-hint").html("No results are found for " + '"' + name + '"' + "!");
                    }
                });
            } 
            else {
                $("#weather-hint").html("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            $("#weather-hint").html("Unable to connect to OpenWeather");
        });
};

// Calling the OpenWeather 7 days daily forecast API to get the weather of the given city's latitude and longitude
function getCityWeather(lat, lon, name) {
    let apiUrl = "https://api.openweathermap.org/data/3.0/onecall?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + apiKey;
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                // console.log(response);
                response.json().then(function (data) {
                    // console.log(data);
                    displayWeather(data, name);
                    
                });
                renderEvents(lat, lon);
            } 
            else {
                $("#weather-hint").textContent = "Error: " + response.statusText;
            }
        })
        .catch(function (error) {
            $("#weather-hint").textContent = "Unable to connect to OpenWeather";
        });

}

// Displays the weather data fetched from the API
function displayWeather(weather, city) {
    // Clear the innerHTML of the previous results, if there are
    document.querySelector(".forecast-div").innerHTML = "";

    // Capitalize the first letter of each word in the city's name
    city = capitalizeWords(city);

    // Rendering the weather for today and the next 6 days
    for (let i = 0; i < weather.daily.length - 1; i++) {
        renderTodayWeather(i, weather, city);
    }
}

// Creates and renders the HTML for the next 7 days' weather
function renderTodayWeather(i, weather, city) {
    let months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    let DT = new Date(weather.daily[i].dt * 1000); 

    let temp = weather.daily[i].temp.day;
    let precipitation = weather.daily[i].pop;
    let humid = weather.daily[i].humidity;

    let weatherEl = document.createElement("div");
    weatherEl.setAttribute("class", "column mr-3 weather-div");
    let titleEl = document.createElement("h2"); // e.g. Atlanta (DD/MM/YYYY)
    titleEl.textContent = city + " (" + DT.getDate() + "/" + months[DT.getMonth()] + "/" + DT.getFullYear() + ") ";
    let iconEl = document.createElement("img"); // e.g. 🔆
    iconEl.setAttribute("src", "http://openweathermap.org/img/wn/" + weather.daily[i].weather[0].icon + "@2x.png");
    let tempEl = document.createElement("p");
    tempEl.textContent = "Temperature: " + temp + "°C";
    let popEl = document.createElement("p");
    popEl.textContent = "Precipitation: " + precipitation + "%";
    let humidEl = document.createElement("p");
    humidEl.textContent = "Humidity: " + humid + "%";

    let forecastEl = document.querySelector(".forecast-div");
    forecastEl.appendChild(weatherEl);
    weatherEl.appendChild(titleEl);
    weatherEl.appendChild(iconEl);
    weatherEl.appendChild(tempEl);
    weatherEl.appendChild(popEl);
    weatherEl.appendChild(humidEl);
}

// Capitalize the first letter of each word
function capitalizeWords(sentence) {
    sentence = sentence.toLowerCase();
    const words = sentence.split(" ");

    return words.map((word) => { 
        return word[0].toUpperCase() + word.substring(1); 
    }).join(" ");
}

// Initialize the page by adding the event listener to the submit buttons
function init() {
    $("#input-form").on("submit", formSubmitHandler);
   
}

init();