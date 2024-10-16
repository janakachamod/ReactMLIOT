import React, { useState, useEffect } from 'react';
import './PredictSensors.css';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase'; // Adjust the path as necessary

function PredictSensors() {
    const [inputData, setInputData] = useState({
        hour: '',
        day: '',
        weekday: '',
        CO2: '',
        Temperature: '',
        Humidity: ''
    });
    const [co2Prediction, setCo2Prediction] = useState(null);
    const [tempPrediction, setTempPrediction] = useState(null);
    const [humidityPrediction, setHumidityPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const now = new Date();
        setInputData(prevState => ({
            ...prevState,
            hour: now.getHours(),
            day: now.getDate(),
            weekday: now.getDay()
        }));

        const fetchData = async () => {
            const co2Ref = ref(database, 'CO2');
            const tempRef = ref(database, 'Temperature');
            const humidityRef = ref(database, 'Humidity');

            onValue(co2Ref, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setInputData(prevState => ({ ...prevState, CO2: data }));
                }
            });

            onValue(tempRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setInputData(prevState => ({ ...prevState, Temperature: data }));
                }
            });

            onValue(humidityRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setInputData(prevState => ({ ...prevState, Humidity: data }));
                }
            });
        };

        fetchData();
    }, []);

    const handlePrediction = async (endpoint, setPrediction, alertRef) => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const prediction = data['Isolation Forest Prediction'];

            setPrediction(prediction);
            
            if (prediction === -1) {
                await set(ref(database, alertRef), 1);
            } else {
                await set(ref(database, alertRef), 0);
            }
        } catch (error) {
            console.error("Error fetching prediction:", error);
            setPrediction(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <div className="predict-sensors-container">
            <h1>Real Time Anomaly Detection</h1>

            <div className="input-group">
                <label>Hour:</label>
                <input type="text" name="hour" value={inputData.hour} readOnly />
            </div>

            <div className="input-group">
                <label>Day of the Month:</label>
                <input type="text" name="day" value={inputData.day} readOnly />
            </div>

            <div className="input-group">
                <label>Weekday:</label>
                <input type="text" name="weekday" value={inputData.weekday} readOnly />
            </div>

            <div className="input-group">
                <label>CO2 Value (not ppm):</label>
                <input type="text" name="CO2" value={inputData.CO2} onChange={handleChange} />
            </div>

            <div className="input-group">
                <label>Temperature (°C):</label>
                <input type="text" name="Temperature" value={inputData.Temperature} onChange={handleChange} />
            </div>

            <div className="input-group">
                <label>Humidity (not %):</label>
                <input type="text" name="Humidity" value={inputData.Humidity} onChange={handleChange} />
            </div>

            <button onClick={() => handlePrediction('/predict/co2', setCo2Prediction, 'AlertCO2')}>Predict CO2</button>
            <button onClick={() => handlePrediction('/predict/temperature', setTempPrediction, 'AlertTemperature')}>Predict Temperature</button>
            <button onClick={() => handlePrediction('/predict/humidity', setHumidityPrediction, 'AlertHumidity')}>Predict Humidity</button>

            {loading && <p>Loading...</p>}

            <div className="prediction-box">
                {co2Prediction !== null ? (
                    <h2>CO2 Prediction: {co2Prediction === 1 ? 'Not Anomaly' : 'Anomaly'}</h2>
                ) : (
                    <h2>No CO2 Prediction</h2>
                )}
                {tempPrediction !== null ? (
                    <h2>Temperature Prediction: {tempPrediction === 1 ? 'Not Anomaly' : 'Anomaly'}</h2>
                ) : (
                    <h2>No Temperature Prediction</h2>
                )}
                {humidityPrediction !== null ? (
                    <h2>Humidity Prediction: {humidityPrediction === 1 ? 'Not Anomaly' : 'Anomaly'}</h2>
                ) : (
                    <h2>No Humidity Prediction</h2>
                )}
            </div>
        </div>
    );
}

export default PredictSensors;
