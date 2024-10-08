import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; 

const App = () => {
  const serverUrl = import.meta.env.VITE_BACKEND_URL;
  const [numSeats, setNumSeats] = useState(""); // Allow any value input
  const [seats, setSeats] = useState([]); // All seats data
  const [reservedSeats, setReservedSeats] = useState([]); // Reserved seats
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all seats on component mount
  useEffect(() => {
    fetchSeats();
  }, []);

  // Fetch seats data from the server
  const fetchSeats = async () => {
    try {
      const response = await axios.get(`${serverUrl}/getseats`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format: Expected an array of seats.");
      }

      setSeats(response.data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Error fetching seat data");
    }
  };

  // Reserve seats request
  const handleReserveSeats = async () => {
    const seatsNumber = parseInt(numSeats);

    // Validate the input number
    if (!seatsNumber || seatsNumber < 1 || seatsNumber > 7) {
      setErrorMessage("Please enter a valid number of seats between 1 and 7.");
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/reserve-seats`,
        { numSeats: seatsNumber },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const reserved = response.data.seats;
      setReservedSeats(reserved);
      fetchSeats(); // Refresh seat layout
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error reserving seats");
    }
  };

  // Render seat grid available seats with green color and non-available seats with red color
  const renderSeats = () => {
    if (errorMessage) {
      return <p className="error">{errorMessage}</p>;
    }

    return (
      <div className="seat-grid">
        {seats.map((seat) => (
          <div
            key={`${seat.row}-${seat.seatNumber}`}
            className={`seat ${seat.isBooked ? "booked" : "available"}`}
          >
            {seat.row}-{seat.seatNumber}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <h1>Seat Reservation System</h1>

      <div className="seat-input">
        <label htmlFor="numSeats">Number of seats to reserve (max 7): </label>
        <input
          type="number"
          id="numSeats"
          value={numSeats}
          onChange={(e) => setNumSeats(e.target.value)} // Allow user input freely
        />
        <button onClick={handleReserveSeats}>Reserve Seats</button>
      </div>

      {errorMessage && <div className="error">{errorMessage}</div>}

      <h2>Seat Layout</h2>
      {renderSeats()}

      {reservedSeats.length > 0 && (
        <div className="reserved-info">
          <h3>Seats reserved:</h3>
          <p>
            {reservedSeats
              .map((seat) => `Row ${seat.row}, Seat ${seat.seatNumber}`)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
