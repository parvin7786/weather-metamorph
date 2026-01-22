import React, { useEffect, useState } from "react";
import "./Weather.css";

const BACKEND_URL = "http://localhost:8080/api/weather";

const TOP_CITIES = [
  "New York",
  "London",
  "Tokyo",
  "Paris",
  "Dubai",
  "Singapore",
  "Sydney",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
];

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  /* ================= LOAD RECENT SEARCHES ================= */
  useEffect(() => {
    const r = JSON.parse(localStorage.getItem("recent")) || [];
    setRecent(r);
  }, []);

  /* ================= BACKEND API CALL ================= */
  const fetchWeather = (cityName, fromRecent = false) => {
    if (!cityName || !cityName.trim()) return;

    setError("");

    fetch(`${BACKEND_URL}?city=${encodeURIComponent(cityName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then((data) => {
        const uiData = {
          id: Date.now(),
          name: data.city,
          sys: { country: data.country },
          main: {
            temp: data.temperature,
            humidity: data.humidity,
            pressure: data.pressure,
          },
          wind: { speed: data.windSpeed },
          visibility: data.visibility * 1000,
          weather: [{ main: data.condition, description: data.condition }],
        };

        setWeather(uiData);
        updateBackground(Math.round(data.temperature), data.condition);

        if (!fromRecent) saveRecent(uiData);
      })
      .catch(() => {
        setError("City not found. Please enter a valid city name.");
      });
  };

  /* ================= SEARCH ================= */
  const searchCity = () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    fetchWeather(city);
    setCity("");
  };

  /* ================= RECENT CACHE ================= */
  const saveRecent = (data) => {
    let r = JSON.parse(localStorage.getItem("recent")) || [];
    r = r.filter((x) => x.name !== data.name);
    r.unshift(data);
    r = r.slice(0, 6);
    localStorage.setItem("recent", JSON.stringify(r));
    setRecent(r);
  };

  /* ================= ICON MAPPING ================= */
  const getIcon = (condition) => {
    condition = condition.toLowerCase();
    if (condition.includes("rain")) return "rainy-3.svg";
    if (condition.includes("cloud")) return "cloudy-day-2.svg";
    if (condition.includes("snow")) return "snowy-3.svg";
    if (condition.includes("thunder")) return "thunder.svg";
    if (condition.includes("clear")) return "day.svg";
    return "day.svg";
  };

  /* ================= BACKGROUND ================= */
  const updateBackground = (temp, condition) => {
    document.body.className = "";
    condition = condition.toLowerCase();

    if (condition.includes("rain")) document.body.classList.add("rain");
    else if (condition.includes("cloud")) document.body.classList.add("cloudy");
    else if (temp <= 15) document.body.classList.add("cold");
    else if (temp < 30) document.body.classList.add("normal");
    else document.body.classList.add("hot");
  };

  return (
    <>
      {/* CLOUDS */}
      <div className="cloud slow" style={{ top: "15%" }} />
      <div className="cloud medium" style={{ top: "35%" }} />
      <div className="cloud fast" style={{ top: "55%" }} />

      {/* HEADER */}
      <header className="app-header glass">
        <span className="app-name">🌤 Smart Weather App</span>
      </header>

      {/* MAIN */}
      <div id="weather-container" className="glass">
        {/* LEFT PANEL */}
        <div className="left-panel">

      
          <div className="search-row">
            <input
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchCity()}
            />
            <button onClick={searchCity}>Search</button>
          </div>

          {/* ERROR MESSAGE */}
          {error && <p className="error-text">{error}</p>}

          {/* WEATHER DISPLAY */}
          {weather && (
            <div className="temp-box">
              <img
                src={`/animated/${getIcon(weather.weather[0].main)}`}
                alt="weather"
              />
              <div className="temp">
                {Math.round(weather.main.temp)}°C
              </div>
              <div className="city">
                {weather.name}, {weather.sys.country}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {weather &&
            [
              ["Humidity", weather.main.humidity + "%"],
              ["Pressure", weather.main.pressure + " hPa"],
              ["Wind", weather.wind.speed + " m/s"],
              ["Visibility", weather.visibility / 1000 + " km"],
            ].map(([label, value]) => (
              <div className="info-card" key={label}>
                <div className="info-text">
                  {label}
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* RECENT SEARCHES */}
      <h3 className="section-title">Recent Searches</h3>
      <div className="cards-wrapper">
        <div className="cards">
          {recent.map((r) => (
            <div
              key={r.id}
              className="weather-card small"
              onClick={() => fetchWeather(r.name, true)}
            >
              <img
                className="icon"
                src={`/animated/${getIcon(r.weather[0].main)}`}
                alt="icon"
              />
              <h4>{r.name}</h4>
              <div className="temp">
                {Math.round(r.main.temp)}°C
              </div>
              <p className="desc">{r.weather[0].description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TOP CITIES */}
      <h3 className="section-title">Top Cities</h3>
      <div className="cards-wrapper">
        <div className="cards carousel">
          {[...TOP_CITIES, ...TOP_CITIES].map((c, i) => (
            <div
              key={i}
              className="weather-card small"
              onClick={() => fetchWeather(c)}
            >
              <img className="icon" src="/animated/day.svg" alt="icon" />
              <h4>{c}</h4>
              <p className="desc">Tap to view weather</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="app-footer glass">
        © 2026 • Smart Weather App
      </footer>
    </>
  );
}
