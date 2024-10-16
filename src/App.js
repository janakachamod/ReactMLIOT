import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase';
import PredictSensors from './pages/PredictSensors';
import PredictRfModel from './pages/PredictRfModel';
import Header from './components/Header';
import './App.css';
import { Switch } from '@mui/material';

function App() {
    const [sensorData, setSensorData] = useState({
        AlertCO2: 0,
        AlertHumidity: 0,
        AlertOccupancy: 0,
        AlertTemperature: 0,
        CO2: '',
        Humidity: '',
        Temperature: '',
    });

    useEffect(() => {
        const alertCo2Ref = ref(database, 'AlertCO2');
        const alertHumidityRef = ref(database, 'AlertHumidity');
        const alertOccupancyRef = ref(database, 'AlertOccupancy');
        const alertTemperatureRef = ref(database, 'AlertTemperature');
        const co2Ref = ref(database, 'CO2');
        const humidityRef = ref(database, 'Humidity');
        const temperatureRef = ref(database, 'Temperature');

        onValue(alertCo2Ref, (snapshot) => {
            setSensorData(prevState => ({ ...prevState, AlertCO2: snapshot.val() }));
        });
        onValue(alertHumidityRef, (snapshot) => {
            setSensorData(prevState => ({ ...prevState, AlertHumidity: snapshot.val() }));
        });
        onValue(alertOccupancyRef, (snapshot) => {
            setSensorData(prevState => ({ ...prevState, AlertOccupancy: snapshot.val() }));
        });
        onValue(alertTemperatureRef, (snapshot) => {
            setSensorData(prevState => ({ ...prevState, AlertTemperature: snapshot.val() }));
        });
        onValue(co2Ref, (snapshot) => {
            setSensorData(prevState => ({ ...prevState, CO2: snapshot.val() }));
        });
        onValue(humidityRef, (snapshot) => {
            setSensorData(prevState => ({ ...prevState, Humidity: snapshot.val() }));
        });
        onValue(temperatureRef, (snapshot) => {
            setSensorData(prevState => ({ ...prevState, Temperature: snapshot.val() }));
        });
    }, []);

    return (
        <Router>
            <Header />
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <div className="page-container">
                            <h2>Welcome to AnomAlert: Your Trusted Anomaly Detection System</h2>
                            <div className="alerts-container">
                                <h3>Real-Time Alerts (Switches)</h3>
                                <div className="alert-item">
                                    <span>CO2 Alert:</span>
                                    <Switch 
                                        checked={sensorData.AlertCO2 === 1} 
                                        inputProps={{ 'aria-label': 'CO2 Alert' }} 
                                        disabled
                                    />
                                </div>
                                <div className="alert-item">
                                    <span>Humidity Alert:</span>
                                    <Switch 
                                        checked={sensorData.AlertHumidity === 1} 
                                        inputProps={{ 'aria-label': 'Humidity Alert' }} 
                                        disabled
                                    />
                                </div>
                                <div className="alert-item">
                                    <span>Occupancy Alert:</span>
                                    <Switch 
                                        checked={sensorData.AlertOccupancy === 1} 
                                        inputProps={{ 'aria-label': 'Occupancy Alert' }} 
                                        disabled
                                    />
                                </div>
                                <div className="alert-item">
                                    <span>Temperature Alert:</span>
                                    <Switch 
                                        checked={sensorData.AlertTemperature === 1} 
                                        inputProps={{ 'aria-label': 'Temperature Alert' }} 
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="sensor-data-container">
                                <h3>Real-Time Sensor Data</h3>
                                <p>CO2: {sensorData.CO2}</p>
                                <p>Humidity: {sensorData.Humidity}</p>
                                <p>Temperature: {sensorData.Temperature}</p>
                            </div>
                        </div>
                    }
                />
                <Route path="/predict-sensors" element={<div className="page-container"><PredictSensors /></div>} />
                <Route path="/predict-rf-model" element={<div className="page-container"><PredictRfModel /></div>} />
            </Routes>
        </Router>
    );
}

export default App;
