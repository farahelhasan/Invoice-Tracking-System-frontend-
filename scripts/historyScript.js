  // Function to get URL parameters
  function getInvoiceIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('invoiceId');
}
async function fetchHistory(invoiceId) {
   try {
    const token = localStorage.getItem('jwtToken');

       const response = await fetch(`http://localhost:8080/invoices/${invoiceId}/history`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
       console.log(response);

       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }
       const data = await response.json();
       viewHistory(data);
   } catch (error) {
       console.error("Failed to fetch history:", error);
   }
}

//genarate table 
function viewHistory(data) {
   const tableBody = document.getElementById("historyTable").querySelector("tbody");
   tableBody.innerHTML = ""; // Clear previous data
   var i = 1;
   data.forEach(entry => {
       const row = document.createElement("tr");
       
       // Extract relevant fields
       const id = i++;
       const action = entry.action;
       const description = entry.description;
       const price = entry.price ? entry.price.toFixed(2) : "-";
       const quantity = entry.quantity;
       const status = entry.status === 0 ? "Invalid" : "Valid";
       const timestamp = new Date(entry.timestamp).toLocaleString();
       const type = entry.type;
       const invoiceId = entry.invoice ? entry.invoice.id : "-";
       const itemName = entry.item ? entry.item.itemName : "-";
       const userName = entry.user ? entry.user.fullName : "-";

        // Set background color if status is "Invalid"
        if (status === "Invalid") {
            row.style.backgroundColor = "#fbb4b4";
        }
        
       // Append fields to the row
       row.innerHTML = `
           <td>${id}</td>
           <td>${invoiceId}</td>
           <td>${userName}</td>
           <td>${action}</td>
           <td>${description}</td>
           <td>${itemName}</td>
           <td>${price}</td>
           <td>${quantity}</td>
           <td>${timestamp}</td>
           <td>${status}</td>
       `;

       tableBody.appendChild(row);
   });
}

// Fetch and display data on page load
fetchHistory(getInvoiceIdFromUrl());