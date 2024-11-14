// Function to get URL parameters
function getInvoiceIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('invoiceId');
}

// Fetch and display items for a given invoiceId
async function fetchInvoiceItems(invoiceId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/invoices/${invoiceId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
       if(response.status == 401){

        console.error('Please login first');
        window.location.href = `login.html`;
       }else if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const items = data.items;
        populateItemsTable(items);
    } catch (error) {
        console.error("Failed to fetch items:", error);
    }
}

// Featch total price.
async function calculateTotalPrice(invoiceId){
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/invoices/${invoiceId}/calculateTotal`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if(response.status == 401){
        console.error('Please login first');
        window.location.href = `login.html`;

        } else if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById("totalPrice").textContent = data.toFixed(2);

        //const items = data.items;
      // return data;
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

// Populate the table with items data
function populateItemsTable(items) {
    const tableBody = document.getElementById("itemsTableBody");
    tableBody.innerHTML = ""; // Clear previous data

    items.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.item.id}</td>
            <td>${item.item.itemName}</td>
            <td>${item.item.price ? item.item.price.toFixed(2) : "-"}</td>
            <td><span class="quantity">${item.quantity}</span></td>
           
        `;

        tableBody.appendChild(row);
        calculateTotalPrice(invoiceId);

    });
}

// Fetch and display items when the page loads
const invoiceId = getInvoiceIdFromUrl();
if (invoiceId) {
    fetchInvoiceItems(invoiceId);
} else {
    console.error("No invoice ID found in the URL.");
}
