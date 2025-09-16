/* --------- Simple SPA routing & UI logic --------- */
    const routes = ['home','alerts','resources','login'];
    document.querySelectorAll('[data-route]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.route)));
    document.getElementById('signinBtn').addEventListener('click',()=>openModal());
    document.getElementById('closeModal').addEventListener('click',()=>closeModal());
    document.getElementById('confirmModal').addEventListener('click',()=>{alert('OTP sent (demo)');closeModal();});

    function navigate(route){
      routes.forEach(r=>{
        const el = document.getElementById('page-'+r);
        if(el) el.style.display = (r===route? 'block':'none');
      });
      // if route not found, go home
      if(!routes.includes(route)) navigate('home');
    }

    /* Unit toggle */
    document.querySelectorAll('.chip').forEach(ch=>ch.addEventListener('click',()=>{
      document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      localStorage.setItem('units', ch.dataset.unit);
      // re-render if value present
    }));

    /* Sign-in modal */
    function openModal(){document.getElementById('modal').style.display='flex';document.getElementById('modalPhone').focus();}
    function closeModal(){document.getElementById('modal').style.display='none';}

    /* Simple mock API integration -- replace with real provider (OpenWeatherMap / WeatherAPI)
       For production: store API key on server; here we simulate data and show where to plug fetch.
    */

    const mockData = {
      name: 'Nearby Village',
      temp: 29,
      feels_like:30,
      desc:'Partly cloudy with scattered showers',
      humidity:72,
      wind:3.4,
      precip:20,
      updated: new Date().toLocaleString(),
      forecast: [
        {d:'Today',min:26,max:31,desc:'Scattered storms'},
        {d:'Tomorrow',min:25,max:32,desc:'Showers'},
        {d:'Day 3',min:24,max:30,desc:'Sunny spells'},
        {d:'Day 4',min:23,max:29,desc:'Cloudy'},
      ],
      alerts: [
        {id:1,type:'Flood Warning',msg:'Heavy rain expected. Move livestock and store seeds higher.'},
      ]
    };

    function renderCurrent(data){
      const units = localStorage.getItem('units') || 'metric';
      const temp = units==='metric'? data.temp : Math.round(data.temp*9/5+32);
      document.getElementById('locName').textContent = data.name;
      document.getElementById('tempVal').textContent = temp + (units==='metric'? '°C' : '°F');
      document.getElementById('weatherDesc').textContent = data.desc;
      document.getElementById('humidity').textContent = data.humidity + '%';
      document.getElementById('wind').textContent = data.wind + ' m/s';
      document.getElementById('feels').textContent = data.feels_like + (units==='metric'? '°C' : '°F');
      document.getElementById('precip').textContent = data.precip + '%';
      document.getElementById('updatedAt').textContent = 'Updated: ' + data.updated;

      // forecast
      const fbox = document.getElementById('forecastList'); fbox.innerHTML = '';
      data.forecast.forEach(f=>{
        const el = document.createElement('div'); el.className='glass card-small small'; el.style.minWidth='110px';
        el.innerHTML = `<div style="font-weight:600">${f.d}</div><div class="muted small">${f.desc}</div><div style=\"margin-top:6px\">${f.min}° / ${f.max}°</div>`;
        fbox.appendChild(el);
      });

      // alerts
      const aBox = document.getElementById('alertsBox'); aBox.innerHTML='';
      if(data.alerts && data.alerts.length){
        data.alerts.forEach(a=>{
          const ai = document.createElement('div'); ai.className='alert-item'; ai.innerHTML = `<strong>${a.type}</strong><div class=\"small muted\">${a.msg}</div>`;
          aBox.appendChild(ai);
        });
      } else { aBox.innerHTML='<div class="muted">No alerts for this location</div>' }
    }

    // search button: in production call your weather API here. The function below is where to plug fetch.
    document.getElementById('searchBtn').addEventListener('click',()=>{
      const q = document.getElementById('searchInput').value.trim();
      if(!q){alert('Please enter a location or use GPS');return}
      // For demo: simulate fetch by showing mock
      simulateFetch(q);
    });

    document.getElementById('gpsBtn').addEventListener('click',()=>{
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
          const {latitude,longitude} = pos.coords;
          // In production: call reverse-geocoding + weather API using coords
          simulateFetch(`Lat:${latitude.toFixed(2)}, Lon:${longitude.toFixed(2)}`);
        }, err=>{alert('Could not get location — allow GPS from browser.')});
      } else alert('Geolocation not supported');
    });

    function simulateFetch(q){
      // show loading
      document.getElementById('locName').textContent = 'Loading: ' + q;
      setTimeout(()=>{
        // adjust name
        mockData.name = q;
        mockData.updated = new Date().toLocaleString();
        // optionally add or remove alerts based on keyword
        if(q.toLowerCase().includes('flood') || Math.random()<0.25){
          mockData.alerts = [{id:1,type:'Flood Warning',msg:'Possible flash floods in low-lying areas — move supplies to higher ground.'}]
        } else mockData.alerts = [];
        renderCurrent(mockData);
      },700);
    }

    // small utilities
    document.getElementById('prepGuide').addEventListener('click',()=>alert('Open downloadable guide (demo)'));
    document.getElementById('sosBtn').addEventListener('click',()=>alert('SOS sent to farmer group (demo)'));

    // initial render with cached units
    if(localStorage.getItem('units')==='imperial'){
      document.querySelectorAll('.chip').forEach(c=>{if(c.dataset.unit==='imperial') c.classList.add('active'); else c.classList.remove('active')});
    }
    renderCurrent(mockData);

    // Accessibility: keyboard route navigation
    document.addEventListener('keydown',e=>{
      if(e.key==='1') navigate('home');
      if(e.key==='2') navigate('alerts');
      if(e.key==='3') navigate('resources');
    });

    /* --------- Where to plug a real API (example pseudo) ---------
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=YOUR_KEY&units=metric`)
        .then(r=>r.json()).then(data=>{ // transform and call renderCurrent(transformed) })
    -------------------------------------------------------------- */


    // new section for advice to farmers
    let currentWeather = "rain"; // options: sunny, rain, cloudy, storm

const statusEl = document.getElementById("weather-status");
const adviceEl = document.getElementById("advisory-box");

function showAdvice(weather) {
  let advice = "";
  switch(weather) {
    case "sunny":
      statusEl.innerText = "☀ Weather: Sunny";
      advice = "Ensure irrigation, apply fertilizer carefully, and use pesticide spray during calm hours.";
      break;
    case "rain":
      statusEl.innerText = "🌧 Weather: Rainy";
      advice = "Avoid fertilizer application, protect stored grains, and ensure proper drainage in fields.";
      break;
    case "cloudy":
      statusEl.innerText = "☁ Weather: Cloudy";
      advice = "Monitor for pests, prepare for possible rainfall, and plan irrigation cautiously.";
      break;
    case "storm":
      statusEl.innerText = "🌪 Weather: Storm Alert";
      advice = "Secure animals indoors, cover young crops, and avoid field work until safe.";
      break;
    default:
      statusEl.innerText = "ℹ Weather: Not Available";
      advice = "Check local updates for better farming guidance.";
  }
  adviceEl.innerHTML = `<p>${advice}</p>`;
}

// Call function
showAdvice(currentWeather);