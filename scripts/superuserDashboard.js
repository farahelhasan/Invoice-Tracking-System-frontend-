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
        } else if(response.status == 401){

            console.error('Please login first');
            window.location.href = `login.html`;
    
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
    const response = await fetch(`http://localhost:8080/invoices?page=${page}`, {
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
    } else if(response.status == 401){

        console.error('Please login first');
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
        console.log(invoices);
        populateInvoiceTable(invoices);
        setupPaginationSearch(totalPages);  
    } else if(response.status == 401){

        console.error('Please login first');
        window.location.href = `login.html`;

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
        console.log(invoices);
        const totalPages = data.totalPages;
        populateInvoiceTable(invoices);
        setupPaginationSearch(totalPages);  
    } else if(response.status == 401){

        console.error('Please login first');
        window.location.href = `login.html`;

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
    } else if(response.status == 401){

        console.error('Please login first');
        window.location.href = `login.html`;

    } else {
        console.error('Failed to delete invoice');
    }
}

// Open "Add Invoice for Specific User" modal
document.getElementById("addInvoiceForUserBtn").addEventListener("click", function() {
    // Clear previous items and show user email input
    document.getElementById("itemsContainer").innerHTML = "";
    document.getElementById("userEmailContainer").style.display = "block"; // Show the email input
    document.getElementById("addInvoiceModal").style.display = "block";
});

// Open "Add Invoice" modal without email input
document.getElementById("addInvoiceBtn").addEventListener("click", function() {
    document.getElementById("itemsContainer").innerHTML = "";
    document.getElementById("userEmailContainer").style.display = "none"; // Hide the email input
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
    itemDiv.innerHTML = `<label> Item: </label>`;
    itemDiv.appendChild(select);
    itemDiv.innerHTML += `<label> Quantity: </label>`;
    itemDiv.appendChild(quantityInput);

    // Append the item row to the items container
    itemsContainer.appendChild(itemDiv);
});

// Submit the invoice with optional email for a specific user
document.getElementById("submitInvoiceBtn").addEventListener("click", async function() {
    const token = localStorage.getItem('jwtToken');
    const itemSelects = document.querySelectorAll(".itemIdSelect");
    const quantities = document.querySelectorAll(".quantityInput");

    // Get email input (if provided)
    const userEmail = document.getElementById("specificUserEmail").value || null;

    // Build the invoiceItemsDto array
    const invoiceItems = [];
    for (let i = 0; i < itemSelects.length; i++) {
        const itemId = itemSelects[i].value;
        const quantity = quantities[i].value;

        if (itemId) {
            if(quantity){
            invoiceItems.push({
                itemId: parseInt(itemId),
                quantity: parseInt(quantity)
            });
            }else{
                invoiceItems.push({
                    itemId: parseInt(itemId),
                    quantity: 1
                });
            }
           
        }
    }

    // Prepare the JSON payload, adding the user email if provided
const payload = {
    invoiceItemsDto: invoiceItems,
};

if (userEmail) {
    payload.email = userEmail;
}

// Set the URL based on the presence of userEmail
const url = userEmail 
    ? 'http://localhost:8080/invoices/superuser'  // URL when email is provided
    : 'http://localhost:8080/invoices';         // Default URL when no email is provided

try {
    const response = await fetch(url, {
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
    } else if(response.status == 401){

        console.error('Please login first');
        window.location.href = `login.html`;

    } else {
        const data = await response.json();
        alert("Failed to add invoice.\n"+ data.message+ "\n"+ data.statusCode);    }
} catch (error) {
    console.error("Error adding invoice:", error);
}

});
//////////
// Function to fetch all roles
async function fetchRoles() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/user/roles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const roles = await response.json();
            console.log(roles);
            populateRoleDropdown(roles);
        } else {
            console.error("Failed to fetch roles");
        }
    } catch (error) {
        console.error("Error fetching roles:", error);
    }
}

// Function to populate roles in the dropdown
function populateRoleDropdown(roles) {
    const roleSelect = document.getElementById("userRoleSelect");
    roleSelect.innerHTML = ""; // Clear previous options
    roles.forEach(role => {
        const option = document.createElement("option");
        option.value = role.id; // Assuming 'name' is the role's identifier
        console.log(role.name);
        option.textContent = role.name; // Assuming 'displayName' is the user-friendly name
        roleSelect.appendChild(option);
    });
}

// Event listener to open the Change Role modal
document.getElementById("changeUserRoleBtn").addEventListener("click", () => {
    fetchRoles(); // Populate roles before displaying the modal
    document.getElementById("changeUserRoleModal").style.display = "block";
});

// Event listener to close the modal
document.getElementById("closeRoleModalBtn").addEventListener("click", () => {
    document.getElementById("changeUserRoleModal").style.display = "none";
});

// Function to change user role
async function changeUserRole() {
    const selectedRole = document.getElementById("userRoleSelect").value;
    const email = document.getElementById("userEmailInput").value; // Get email from the input field
    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`http://localhost:8080/user/roles`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,  // Send the email with the request
                roleId: selectedRole  // Send the selected role
            })
        });

        if (response.ok) {
            alert("User role changed successfully");
            document.getElementById("changeUserRoleModal").style.display = "none";
        } else {
            console.error("Failed to change user role");
        }
    } catch (error) {
        console.error("Error changing user role:", error);
    }
}

// Event listener to submit the role change request
document.getElementById("submitRoleChangeBtn").addEventListener("click", () => {
    changeUserRole(); // Call the function to change the role with email and selected role
});

///////////

// Initialize by fetching the first page
fetchInvoices(currentPage);
