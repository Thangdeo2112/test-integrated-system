// src/pages/HomePage.js
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 1. SETUP LEAFLET ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 11);
    return null;
}

// --- 2. HELPER FUNCTIONS ---
const getWeatherStatus = (code) => {
    if (code === undefined) return ""; if (code === 0) return "Trời quang"; if (code <= 3) return "Có mây"; if (code <= 48) return "Sương mù"; if (code <= 67) return "Mưa"; if (code >= 95) return "Giông"; return "Mưa";
};
const getWindDirection = (degree) => {
    if (degree === undefined) return ""; const d = ['Bắc', 'ĐB', 'Đông', 'ĐN', 'Nam', 'TN', 'Tây', 'TB']; return d[Math.round(degree/45)%8];
};
const formatDate = (dateStr) => { if(!dateStr) return ""; const [y,m,d] = dateStr.split("-"); return `${d}/${m}`; };
const getWeatherIcon = (code) => {
    if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png"; 
    if (code <= 3) return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
    if (code <= 67) return "https://cdn-icons-png.flaticon.com/512/1163/1163627.png";
    return "https://cdn-icons-png.flaticon.com/512/1163/1163636.png";
};

// --- 3. CSS STYLES ---
const styles = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
    .dashboard-container { min-height: 100vh; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: #fff; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
    
    /* Header */
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .search-wrap { flex: 1; max-width: 500px; }
    .search-bar { display: flex; align-items: center; background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 30px; backdrop-filter: blur(5px); }
    .search-bar input { background: transparent; border: none; color: #fff; width: 100%; outline: none; margin-left: 10px; font-size: 16px; }
    .search-bar button { background: transparent; border: none; cursor: pointer; font-size: 18px; }
    .auth-section { display: flex; gap: 15px; align-items: center; }
    .logout-btn { background: #ff6b6b; border: none; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: bold; }
    .auth-link { color: #fff; text-decoration: none; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 20px; }

    /* Layout */
    .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .weather-main-card { background: linear-gradient(145deg, rgba(30,60,114,0.6), rgba(42,82,152,0.6)); border-radius: 25px; padding: 30px; display: flex; flex-direction: column; justify-content: space-between; backdrop-filter: blur(10px); min-height: 350px; box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3); }
    .weather-header { display: flex; justify-content: space-between; }
    
    /* NÚT LƯU NỔI BẬT */
    .save-btn { 
        background: #ff7675; /* Màu hồng đậm cho dễ thấy */
        border: none; 
        color: #fff; 
        padding: 8px 20px; 
        border-radius: 20px; 
        cursor: pointer; 
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        transition: transform 0.2s;
    }
    .save-btn:hover { transform: scale(1.05); background: #d63031; }
    .save-btn:active { transform: scale(0.95); }

    .temp-section { display: flex; align-items: center; margin: 20px 0; }
    .temp-number { font-size: 80px; font-weight: 300; line-height: 1; }
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 15px; margin-top: auto; }
    .metric-item { text-align: center; } .metric-value { font-weight: bold; }
    .map-card { background: rgba(255,255,255,0.05); border-radius: 25px; overflow: hidden; height: 100%; min-height: 350px; border: 1px solid rgba(255,255,255,0.1); }

    /* Forecast & Chart */
    .forecast-section { margin-top: 20px; }
    .forecast-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
    .forecast-item { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; transition: all 0.2s; cursor: pointer; border: 1px solid transparent; }
    .forecast-item:hover { transform: translateY(-5px); background: rgba(255,255,255,0.15); }
    .forecast-item.active { background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 0 15px rgba(255,255,255,0.2); }

    .hourly-section { margin-top: 20px; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; }
    .hourly-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .hourly-scroll { display: flex; overflow-x: auto; gap: 0; padding-bottom: 10px; align-items: flex-end; height: 180px; }
    .hourly-scroll::-webkit-scrollbar { height: 5px; }
    .hourly-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 5px; }
    .hour-item { min-width: 70px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; }
    .chart-bar { display: flex; flex-direction: column; align-items: center; gap: 5px; transition: all 0.5s ease-out; }
    .grid-line { position: absolute; left: 0; right: 0; border-top: 1px dashed rgba(255,255,255,0.1); pointer-events: none; }

    /* Favorites */
    .favorites-bar { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
    .fav-tags { display: flex; gap: 10px; flex-wrap: wrap; }
    .fav-tag { background: rgba(255,255,255,0.15); padding: 8px 15px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
    .fav-tag:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
    .delete-x { color: #ff6b6b; font-weight: bold; cursor: pointer; margin-left: 5px; padding: 0 5px;}

    @media (max-width: 768px) {
        .main-grid { grid-template-columns: 1fr; }
        .metrics-row { grid-template-columns: repeat(2, 1fr); }
        .forecast-row { display: flex; overflow-x: auto; }
        .forecast-item { min-width: 80px; }
    }
`;

const HomePage = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [citySearch, setCitySearch] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [mapCenter, setMapCenter] = useState([21.02, 105.85]); 
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (user) fetchFavorites();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(p => getWeatherByCoords(p.coords.latitude, p.coords.longitude));
        }
    }, [user]);

    useEffect(() => {
        if (weatherData && weatherData.forecast.length > 0) {
            setSelectedDate(weatherData.forecast[0].date);
        }
    }, [weatherData]);

    // --- HÀM LẤY DANH SÁCH YÊU THÍCH ---
    const fetchFavorites = async () => {
        try {
            const res = await api.get('favorites/');
            // Lấy thêm nhiệt độ hiện tại cho từng địa điểm trong list
            const listWithTemp = await Promise.all(res.data.map(async (item) => {
                try {
                    const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${item.latitude}&longitude=${item.longitude}&current=temperature_2m`);
                    const j = await w.json();
                    return { ...item, current_temp: j.current.temperature_2m };
                } catch {
                    return { ...item, current_temp: null };
                }
            }));
            setFavorites(listWithTemp);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const resGeo = await api.get(`search-city/?city=${citySearch}`);
            if (resGeo.data.length > 0) getWeatherByCoords(resGeo.data[0].latitude, resGeo.data[0].longitude, resGeo.data[0].name, resGeo.data[0].country);
            else alert("Không tìm thấy!");
        } catch { alert("Lỗi!"); } setLoading(false);
    };

    const getWeatherByCoords = async (lat, lon, name="Vị trí của bạn", country="") => {
        try {
            const res = await api.get(`weather/?lat=${lat}&lon=${lon}`);
            setWeatherData({ ...res.data, city_name: name, country: country, lat: lat, lon: lon });
            setMapCenter([lat, lon]);
        } catch { console.error("Err"); }
    };
    
    // --- SỬA LẠI HÀM ADD TO FAVORITES ---
    const addToFavorites = async () => {
        // 1. Kiểm tra đăng nhập
        if (!user) { 
            alert("Bạn cần đăng nhập để lưu!"); 
            return; 
        }
        // 2. Kiểm tra dữ liệu
        if (!weatherData) return;

        // 3. Chuẩn bị dữ liệu gửi lên server
        const payload = {
            city_name: weatherData.city_name,
            latitude: weatherData.lat,
            longitude: weatherData.lon
        };

        console.log("Đang gửi dữ liệu:", payload); // Debug xem gửi gì

        try {
            await api.post('favorites/', payload);
            alert(`Đã lưu "${weatherData.city_name}" thành công!`);
            
            // 4. QUAN TRỌNG: Load lại danh sách ngay lập tức
            fetchFavorites(); 
        } catch (error) {
            // In lỗi ra console để check
            console.error("Lỗi khi lưu:", error.response);
            if (error.response && error.response.status === 400) {
                alert("Địa điểm này có thể đã có trong danh sách rồi!");
            } else {
                alert("Có lỗi xảy ra khi lưu. Vui lòng thử lại.");
            }
        }
    };

    const removeFavorite = async (id, e) => { 
        e.stopPropagation(); 
        if(!window.confirm("Xóa địa điểm này?")) return; 
        try{ 
            await api.delete(`favorites/${id}/`); 
            fetchFavorites(); 
        } catch { alert("Lỗi xóa!"); } 
    };

    const getHourlyForSelectedDate = () => {
        if (!weatherData || !weatherData.hourly || !selectedDate) return [];
        return weatherData.hourly.filter(h => h.full_time.startsWith(selectedDate));
    };
    const hourlyDisplay = getHourlyForSelectedDate();

    return (
        <div className="dashboard-container">
            <style>{styles}</style>
            <header className="dashboard-header">
                <div className="search-wrap">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <button disabled={loading}>🔍</button>
                        <input type="text" placeholder="Tìm thành phố..." value={citySearch} onChange={e=>setCitySearch(e.target.value)} />
                    </form>
                </div>
                <div className="auth-section">
                    {user ? <><span style={{fontWeight:'bold'}}>{user.username}</span><button onClick={logoutUser} className="logout-btn">Out</button></> 
                          : <><Link to="/login" className="auth-link">Login</Link><Link to="/register" className="auth-link">Reg</Link></>}
                </div>
            </header>

            {weatherData ? (
                <>
                    <div className="main-grid">
                        <div className="weather-main-card">
                            <div className="weather-header">
                                <div><h2>📍 {weatherData.city_name}</h2><p>{weatherData.country}</p></div>
                                
                                {/* NÚT LƯU ĐÃ ĐƯỢC FIX */}
                                <button onClick={addToFavorites} className="save-btn">
                                    ❤️ Lưu
                                </button>
                            </div>
                            <div className="temp-section">
                                <img src={getWeatherIcon(weatherData.current.weathercode)} width="100" alt="icon"/>
                                <div className="temp-details">
                                    <span className="temp-number">{weatherData.current.temperature}°</span>
                                    <div style={{fontSize:'20px'}}>{getWeatherStatus(weatherData.current.weathercode)}</div>
                                </div>
                            </div>
                            <div className="metrics-row">
                                <div className="metric-item"><div style={{fontSize:12}}>Gió</div><div className="metric-value">{weatherData.current.windspeed} km/h</div></div>
                                <div className="metric-item"><div style={{fontSize:12}}>Độ ẩm</div><div className="metric-value">{weatherData.current.humidity}%</div></div>
                                <div className="metric-item"><div style={{fontSize:12}}>Áp suất</div><div className="metric-value">{weatherData.current.pressure} hPa</div></div>
                                <div className="metric-item"><div style={{fontSize:12}}>Mưa</div><div className="metric-value">{weatherData.current.precipitation} mm</div></div>
                            </div>
                        </div>
                        <div className="map-card">
                            <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                <ChangeView center={mapCenter} />
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={mapCenter}><Popup>{weatherData.city_name}</Popup></Marker>
                            </MapContainer>
                        </div>
                    </div>

                    <div className="forecast-section">
                        <h3 style={{marginBottom:15}}>📅 Dự báo 7 ngày</h3>
                        <div className="forecast-row">
                            {weatherData.forecast.map((day, index) => (
                                <div 
                                    key={index} 
                                    className={`forecast-item ${selectedDate === day.date ? 'active' : ''}`}
                                    onClick={() => setSelectedDate(day.date)}
                                >
                                    <span style={{fontWeight:'bold'}}>{formatDate(day.date)}</span>
                                    <img src={getWeatherIcon(day.weathercode || 3)} width="40" style={{margin:'10px 0'}} alt="d"/>
                                    <b>{day.max_temp}°</b>
                                    <span style={{fontSize:12, opacity:0.7}}>{day.min_temp}°</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {hourlyDisplay.length > 0 && (
                        <div className="hourly-section">
                            <div className="hourly-header">
                                <h3>🕑 Diễn biến 24h ngày {formatDate(selectedDate)}</h3>
                            </div>
                            <div className="hourly-scroll">
                                <div className="grid-line" style={{bottom: '50px'}}></div>
                                <div className="grid-line" style={{bottom: '100px'}}></div>
                                {hourlyDisplay.map((h, index) => {
                                    const heightOffset = (h.temp * 3) + 'px'; 
                                    return (
                                        <div key={index} className="hour-item">
                                            <div className="chart-bar" style={{marginBottom: heightOffset}}>
                                                <span style={{fontSize:11, opacity:0.8}}>{h.rain > 0 ? `${h.rain}mm` : ''}</span>
                                                <img src={getWeatherIcon(h.code)} width="30" alt="i"/>
                                                <span style={{fontWeight:'bold', fontSize:16}}>{h.temp}°</span>
                                            </div>
                                            <div style={{fontSize:12, marginTop: 10, opacity:0.6, borderTop:'1px solid rgba(255,255,255,0.1)', width:'100%', paddingTop:5}}>
                                                {h.time}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div style={{textAlign:'center', marginTop: 80, opacity: 0.6}}><h2>Nhập tên thành phố...</h2></div>
            )}

            {/* DANH SÁCH YÊU THÍCH - NẾU CÓ DỮ LIỆU THÌ MỚI HIỆN */}
            {user && favorites.length > 0 && (
                <div className="favorites-bar">
                    <h4>⭐ Đã lưu ({favorites.length})</h4>
                    <div className="fav-tags">
                        {favorites.map(fav => (
                            <div key={fav.id} className="fav-tag" onClick={() => getWeatherByCoords(fav.latitude, fav.longitude, fav.city_name)}>
                                {fav.city_name} <b>{fav.current_temp ? fav.current_temp : '--'}°</b> 
                                <span className="delete-x" onClick={(e)=>removeFavorite(fav.id,e)}>×</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;