import { useEffect, useState } from "react";
import io from "socket.io-client";
import Loader from "./components/Loader";
import "./style.scss";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [deviceID, setDeviceID] = useState("");
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  useEffect(() => {
    const generatedDeviceID = uuidv4();
    setDeviceID(generatedDeviceID);
  }, []);

  console.log("deviceId", deviceID);

  const handleSocket = () => {
    const socket = io("http://localhost:5000", {
      query: {
        deviceId: deviceID,
      },
    });

    socket.on("parse:excel", (data) => {
      console.log("Received data:", data);
      setExcelData(data);
      if (data) {
        setIsLoading(false);
        socket.disconnect();
      }
    });
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("csv", selectedFile);
      fetch("http://localhost:8080/upload-excel", {
        method: "POST",
        headers: { deviceId: deviceID },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Upload successful:", data);
          setIsLoading(true);
          handleSocket();
          setIsDataAvailable(true);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    } else {
      console.error("No file selected.");
    }
  };

  const renderTable = () => {
    if (excelData.length === 0 || !excelData[selectedSheet]) {
      return null;
    }

    const headers = Object.keys(excelData[selectedSheet][0]);

    return (
      <table className="myTable">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {excelData[selectedSheet].map((item, itemIndex) => (
            <tr key={itemIndex}>
              {headers.map((header) => (
                <td key={header}>{item[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="home-wrapper">
      <div className="home-container">
        <div className="home-content">
          <div className="home-header">
            <h1>Internal Demo</h1>
          </div>
          <div className="home-add-excel">
            <label htmlFor="fileInput">
              <p>
                {selectedFile && excelData.length !== 0
                  ? `${selectedFile?.name}`
                  : "Select an Excel File"}
              </p>
              <input
                accept=".xlsx"
                type="file"
                id="fileInput"
                onChange={handleFileChange}
              />
            </label>
            <button disabled={isDataAvailable} onClick={handleUpload}>
              Upload
            </button>
            {isDataAvailable && (
              <button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Generate Another One
              </button>
            )}
          </div>
          <div className="home-table-wrapper">
            <div className="sheet-buttons">
              {excelData?.map((_, index) => (
                <button key={index} onClick={() => setSelectedSheet(index)}>
                  Sheet {index + 1}
                </button>
              ))}
            </div>
            {isLoading && <Loader />}
            <div className="table-wrapper">{renderTable()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
