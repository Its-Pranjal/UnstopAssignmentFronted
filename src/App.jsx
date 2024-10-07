import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; 

const App = () => {

  const serverUrl = import.meta.env.VITE_BACKEND_URL ;
  const [numSeats, setNumSeats] = useState(1); // Minimum number of seats to reserve is 1
  const [seats, setSeats] = useState([]); // All seats data from the backend this endpoint api/seats/getseats
  const [reservedSeats, setReservedSeats] = useState([]); // Seats reserved in the current request
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all seats on component mount
  useEffect(() => {
    fetchSeats();
  }, []);

  // Fetch seats data from the server
  const fetchSeats = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/getseats`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response data:", response.data);

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format: Expected an array of seats.");
      }

      setSeats(response.data);
      setErrorMessage(""); 
    } catch (error) {
      console.error("Error fetching seats:", error);
      setErrorMessage(error.message || "Error fetching seat data"); 
    }
  };

  // Reserve seats request
  const handleReserveSeats = async () => {
    if (numSeats < 1 || numSeats > 7) {
      setErrorMessage("You can only reserve between 1 and 7 seats.");
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/reserve-seats`,
        { numSeats },
        {
          headers: {
            "Content-Type": "application/json", 
          },
        }
      );

      const reserved = response.data.seats;
      setReservedSeats(reserved); // Update with the newly reserved seats
      fetchSeats(); // Refresh seat layout
      setErrorMessage(""); // Clear any previous errors
    } catch (error) {
      console.error("Error reserving seats:", error);
      setErrorMessage(error.response?.data?.message || "Error reserving seats");
    }
  };

  // Render seat grid available seats with green color and non-available seats with red color first digit show row number and second digit show the seats number of that row 
  const renderSeats = () => {
    if (errorMessage) {
      return <p className="error">{errorMessage}</p>; // Display error message if there's an error
    }

    if (!Array.isArray(seats)) {
      return <p>No seats available</p>; // Safety fallback, in case data is still invalid
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
          onChange={(e) =>
            setNumSeats(Math.min(7, Math.max(1, Number(e.target.value))))
          }
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
