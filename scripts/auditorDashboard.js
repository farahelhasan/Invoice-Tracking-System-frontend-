// Display the user's email
document.getElementById("userEmail").innerText = localStorage.getItem("email");
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
            `
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
    } else if(response.status == 401){

        console.error('Please login first');
        window.location.href = `login.html`;

    } else {
        console.error('Search failed');
    }
}

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
    window.location.href = `invoiceItemAuditor.html?invoiceId=${invoiceId}`;
}

// View invoice history
function viewHistory(invoiceId) {
    window.location.href = `history.html?invoiceId=${invoiceId}`; 
}


// Initialize by fetching the first page
fetchInvoices(currentPage);
