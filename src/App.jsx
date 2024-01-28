import { useEffect, useState } from "react";
import "./style.scss";
import io from "socket.io-client";
import Loader from "./components/Loader";
function App() {
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const showSheet = (index) => {
    setSelectedSheet(index);
  };
  const [excelData, setExcelData] = useState([]);
  // const socketConnection = () => {

  // };

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("parse:excel", async (data) => {
      console.log("Received data:", data);
      setExcelData(data);
      if (data) {
        setIsLoading(false);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);
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
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Upload successful:", data);
          setIsLoading(true);
          // socketConnection();
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    } else {
      console.error();
      ("No file selected.");
    }
  };
  console.log(excelData);

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
                {selectedFile && excelData.length !==0
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
            <button onClick={() => handleUpload()}>Upload</button>
          </div>
          <div className="home-table-wrapper">
            <div className="sheet-buttons">
              {excelData?.map((_, index) => (
                <button key={index} onClick={() => showSheet(index)}>
                  Sheet {index + 1}
                </button>
              ))}
            </div>
            {isLoading && <Loader />}
            {excelData.length!==0 && (
              <table className="myTable">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {excelData[selectedSheet]?.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td>{item.product}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
