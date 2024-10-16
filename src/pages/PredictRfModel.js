import React, { useState, useEffect } from 'react';
import './PredictRfModel.css'; // Import your custom CSS file
import { ref, onValue, set } from 'firebase/database'; // Import Firebase methods
import { database } from '../firebase'; // Adjust the path to your Firebase config

function PredictRfModel() {
    const [inputData, setInputData] = useState({
        Temperature: '',
        Humidity: '',
        CO2: '',
        HumidityRatio: ''
    });
    const [prediction, setPrediction] = useState(null);

    // Fetch Temperature, Humidity, and CO2 values from Firebase in real-time
    useEffect(() => {
        const fetchData = async () => {
            const tempRef = ref(database, 'Temperature'); // Path to Temperature in Firebase
            const humidityRef = ref(database, 'Humidity'); // Path to Humidity in Firebase
            const co2Ref = ref(database, 'CO2'); // Path to CO2 in Firebase

            // Fetch and listen for changes to Temperature
            onValue(tempRef, (snapshot) => {
                const data = snapshot.val();
                setInputData(prevState => ({ ...prevState, Temperature: data }));
            });

            // Fetch and listen for changes to Humidity
            onValue(humidityRef, (snapshot) => {
                const data = snapshot.val();
                setInputData(prevState => ({ ...prevState, Humidity: data }));
            });

            // Fetch and listen for changes to CO2
            onValue(co2Ref, (snapshot) => {
                const data = snapshot.val();
                setInputData(prevState => ({ ...prevState, CO2: data }));
            });
        };

        fetchData();
    }, []); // Empty dependency array ensures this runs once on mount

    // Function to calculate Humidity Ratio
    const calculateHumidityRatio = (temperature, humidity) => {
        const P_atm = 1013.25; // Atmospheric pressure in hPa
        const saturation_pressure = 6.1078 * Math.pow(10, (7.5 * temperature) / (237.3 + temperature));
        const P_w = (humidity / 100) * saturation_pressure;
        const humidity_ratio = 0.62198 * P_w / (P_atm - P_w);
        return humidity_ratio.toFixed(4);
    };

    // Update HumidityRatio when Temperature or Humidity changes
    useEffect(() => {
        if (inputData.Temperature && inputData.Humidity) {
            const calculatedHumidityRatio = calculateHumidityRatio(parseFloat(inputData.Temperature), parseFloat(inputData.Humidity));
            setInputData(prevState => ({ ...prevState, HumidityRatio: calculatedHumidityRatio }));
        }
    }, [inputData.Temperature, inputData.Humidity]);

    // Handle form submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        const dataToSend = {
            Temperature: inputData.Temperature,
            Humidity: inputData.Humidity,
            CO2: inputData.CO2,
            HumidityRatio: inputData.HumidityRatio
        };

        // Call Flask API to predict
        const response = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        const data = await response.json();
        setPrediction(data.prediction);

        // Update AlertOccupancy in Firebase based on prediction
        const alertOccupancyRef = ref(database, 'AlertOccupancy');
        if (data.prediction === 1) {
            await set(alertOccupancyRef, 1); // Set AlertOccupancy to 1 if prediction is Occupied
        } else {
            await set(alertOccupancyRef, 0); // Set AlertOccupancy to 0 if prediction is Not Occupied
        }
    };

    return (
        <div className="predict-container">
            <h1 className="predict-title">Predict Occupancy</h1>
            <form onSubmit={handleSubmit} className="predict-form">
                <div className="form-group">
                    <label htmlFor="temperature">Temperature (from Firebase):</label>
                    <input 
                        type="text" 
                        name="Temperature" 
                        id="temperature"
                        value={inputData.Temperature} 
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="humidity">Humidity (from Firebase):</label>
                    <input 
                        type="text" 
                        name="Humidity" 
                        id="humidity"
                        value={inputData.Humidity} 
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="co2">CO2 (from Firebase):</label>
                    <input 
                        type="text" 
                        name="CO2" 
                        id="co2"
                        value={inputData.CO2} 
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="humidity-ratio">Humidity Ratio (Auto-calculated):</label>
                    <input 
                        type="text" 
                        name="HumidityRatio" 
                        id="humidity-ratio"
                        value={inputData.HumidityRatio} 
                        readOnly
                    />
                </div>
                <button type="submit" className="predict-button">Predict</button>
            </form>

            {/* Display prediction result */}
            {prediction !== null && (
                <h2 className="predict-result">
                    Prediction: {prediction === 1 ? 'Occupied' : 'Not Occupied'}
                </h2>
            )}
        </div>
    );
}

export default PredictRfModel;
