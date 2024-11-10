// Display the user's email
document.getElementById("userEmail").innerText = localStorage.getItem("email");

let itemsList = [];

// Fetch items from the backend
async function fetchItems() {
    try {
        const token = localStorage.getItem('jwtToken');

        const response = await fetch(`http://localhost:8080/items`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        

        if (response.ok) {
            itemsList = await response.json();
        } else {
            console.error("Failed to fetch items");
        }
    } catch (error) {
        console.error("Error fetching items:", error);
    }
}

// Call fetchItems when the page loads
fetchItems();

let currentPage = 0; // Track the current page
const itemsPerPage = 10; // Set items per page as 10

// Fetch and display invoices for the specified page
async function fetchInvoices(page = 0) {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(`http://localhost:8080/invoices/user?page=${page}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const data = await response.json();
        const invoices = data.content;
        const totalPages = data.totalPages;
        console.log(totalPages);
        populateInvoiceTable(invoices);
        setupPagination(totalPages);
    } else if(response.status == 403){

        console.error('Failed to fetch invoices, please login first');
        window.location.href = `login.html`;

    }else{
        console.error(response.error);

    }
}

// Populate the invoice table with data
function populateInvoiceTable(invoices) {
    const tableBody = document.getElementById("invoiceTableBody");
    tableBody.innerHTML = ""; // Clear previous data

    invoices.forEach(invoice => {
        const row = document.createElement("tr");
        var htmlRow = `<td>${invoice.id}</td>
            <td>${invoice.user.fullName}</td>`;
        if(invoice.deleted === true){
            row.style.backgroundColor = "#fbb4b4";
    
            htmlRow = htmlRow + 
             `<td></td>
            <td><button class="buttonInsidTable"  onclick="viewHistory(${invoice.id})">View History</button></td>
            <td></td>`
        }else {
            htmlRow = htmlRow +  
            `<td><button class="buttonInsidTable" onclick="showItems(${invoice.id})">Show Items</button></td>
            <td><button class="buttonInsidTable"  onclick="viewHistory(${invoice.id})">View History</button></td>
            <td><button class="buttonInsidTable" onclick="deleteInvoice(${invoice.id})">Delete</button></td>`
        }
        row.innerHTML = htmlRow;
      
        tableBody.appendChild(row);
    });
}

// Set up pagination buttons
function setupPagination(totalPages) {
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = ""; // Clear previous buttons

    for (let i = 0; i < totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i + 1;
        pageButton.onclick = () => {
            fetchInvoices(i);
            currentPage =i;
        }
        if (i === currentPage) {
            pageButton.classList.add("active"); // Highlight the current page
        }
        paginationContainer.appendChild(pageButton);
    }
}

// Set up pagination buttons in search.
function setupPaginationSearch(totalPages) {
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = ""; // Clear previous buttons

    for (let i = 0; i < totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i + 1;
        pageButton.onclick = () => {
            search(i);
            currentPage =i;
        }
        if (i === currentPage) {
            pageButton.classList.add("active"); // Highlight the current page
        }
        paginationContainer.appendChild(pageButton);
    }
}

// Search invoices by keyword
async function search(page = 0){
    const keyword = document.getElementById("searchInput").value;
    const token = localStorage.getItem('jwtToken');

    let queryParam = '';
    if (isNaN(keyword)) {
        // If keyword is not a number, assume it's a username
        queryParam = `username=${encodeURIComponent(keyword)}`;
    } else {
        // If keyword is a number, assume it's an invoiceId
        queryParam = `invoiceId=${encodeURIComponent(keyword)}`;
    }
    const response = await fetch(`http://localhost:8080/invoices/search?${queryParam}&page=${page}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const data = await response.json();
        const invoices = data.content;
        const totalPages = data.totalPages;
        console.log(totalPages);
        populateInvoiceTable(invoices);
        setupPaginationSearch(totalPages);  
    } else {
        console.error('Search failed');
    }
}


// Search invoices by keyword
document.getElementById("searchBtn").addEventListener("click", async function() {
    const keyword = document.getElementById("searchInput").value;
    const token = localStorage.getItem('jwtToken');
    let queryParam = '';
    if (isNaN(keyword)) {
        // If keyword is not a number, assume it's a username
        queryParam = `username=${encodeURIComponent(keyword)}`;
    } else {
        // If keyword is a number, assume it's an invoiceId
        queryParam = `invoiceId=${encodeURIComponent(keyword)}`;
    }
    const response = await fetch(`http://localhost:8080/invoices/search?${queryParam}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });


    if (response.ok) {
        const data = await response.json();
        const invoices = data.content;
        const totalPages = data.totalPages;
        console.log(totalPages);
        populateInvoiceTable(invoices);
        setupPaginationSearch(totalPages);  
      } else {
        console.error('Search failed');
    }
});



// Show invoice items
function showItems(invoiceId) {
    // Logic to show items (e.g., open a modal or navigate to another page)
    window.location.href = `invoiceItems.html?invoiceId=${invoiceId}`;
}

// View invoice history
function viewHistory(invoiceId) {
    window.location.href = `history.html?invoiceId=${invoiceId}`; 
}

// Delete an invoice
async function deleteInvoice(invoiceId) {
    const token = localStorage.getItem('jwtToken');

    const response = await fetch(`http://localhost:8080/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        alert("Invoice deleted successfully.");
        fetchInvoices(); // Refresh the table
    } else {
        console.error('Failed to delete invoice');
    }
}


// Open "Add Invoice" modal
document.getElementById("addInvoiceBtn").addEventListener("click", function() {
        // Clear itemsContainer to remove previous item components
        document.getElementById("itemsContainer").innerHTML = ""; 
    document.getElementById("addInvoiceModal").style.display = "block";
});

// Close modal
document.getElementById("closeModalBtn").addEventListener("click", function() {
    document.getElementById("addInvoiceModal").style.display = "none";
});

// Dynamically add item fields
document.getElementById("addItemBtn").addEventListener("click", function() {
    const itemsContainer = document.getElementById("itemsContainer");

    const itemDiv = document.createElement("div");
    itemDiv.className = "itemRow";

    // Create a dropdown for item selection
    const select = document.createElement("select");
    select.className = "itemIdSelect";
    select.required = true;

    // Add a placeholder option
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select Item";
    select.appendChild(placeholderOption);

    // Populate dropdown with items from itemsList
    itemsList.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;  // Use the item ID as the value
        option.textContent = item.itemName; // Display item name in the dropdown
        select.appendChild(option);
    });

    // Create input for quantity
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.className = "quantityInput";
    quantityInput.placeholder = "Quantity";
    quantityInput.required = true;

    // Append elements to the item row
    itemDiv.innerHTML = `<label>Item:</label>`;
    itemDiv.appendChild(select);
    itemDiv.innerHTML += `<label>Quantity:</label>`;
    itemDiv.appendChild(quantityInput);

    // Append the item row to the items container
    itemsContainer.appendChild(itemDiv);
});


// Submit the invoice
document.getElementById("submitInvoiceBtn").addEventListener("click", async function() {
    const token = localStorage.getItem('jwtToken');
    const itemSelects = document.querySelectorAll(".itemIdSelect"); // Updated selector for dropdowns
    const quantities = document.querySelectorAll(".quantityInput");

    // Build the invoiceItemsDto array
    const invoiceItems = [];
    for (let i = 0; i < itemSelects.length; i++) {
        const itemId = itemSelects[i].value;
        const quantity = quantities[i].value;

        if (itemId && quantity) {
            invoiceItems.push({
                itemId: parseInt(itemId), // Item ID from the dropdown
                quantity: parseInt(quantity) // Quantity from the input field
            });
        }
    }

    // Prepare the JSON payload
    const payload = {
        invoiceItemsDto: invoiceItems
    };

    try {
        const response = await fetch('http://localhost:8080/invoices', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Invoice added successfully!");
            document.getElementById("addInvoiceModal").style.display = "none";
            fetchInvoices(); // Refresh the table
        } else {
            alert("Failed to add invoice.");
        }
    } catch (error) {
        console.error("Error adding invoice:", error);
    }
});



// Initialize by fetching the first page
fetchInvoices(currentPage);
