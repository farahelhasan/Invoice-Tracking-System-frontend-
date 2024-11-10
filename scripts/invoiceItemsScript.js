// Function to get URL parameters
function getInvoiceIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('invoiceId');
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
        
        if (!response.ok) {
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const items = data.items;
        populateItemsTable(items);

       calculateTotalPrice(invoiceId);
        //document.getElementById("totalPrice").textContent = totalPrice.toFixed(2);
      
    } catch (error) {
        console.error("Failed to fetch items:", error);
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
            <td>
                <button onclick="editQuantity(${item.id}, ${item.item.id})">Edit</button>
                <button onclick="deleteItem(${item.id}, ${item.item.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to edit the quantity of an item
function editQuantity(itemInvoiceId, itemId) {
    // const row = document.querySelector(`tr td:first-child:contains(${itemId})`).parentElement;
    // Find the row that has the item ID in the first cell
    const rows = document.querySelectorAll("#itemsTableBody tr");
    let targetRow = null;

    rows.forEach(row => {
        const firstCell = row.querySelector("td:first-child");
        if (firstCell && parseInt(firstCell.innerText) === itemId) {
            targetRow = row;
        }
    });

    if (!targetRow) {
        console.error(`Row for item ID ${itemId} not found.`);
        return;
    }

    const quantitySpan = targetRow.querySelector(".quantity");

    // Create an input for editing the quantity
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.value = parseInt(quantitySpan.innerText);
    quantityInput.min = 1;

    quantitySpan.replaceWith(quantityInput);

    // Add a save button to confirm the change
    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.onclick = async function() {
        const newQuantity = parseInt(quantityInput.value);
        await updateQuantity(itemId, newQuantity,itemInvoiceId);
        quantityInput.replaceWith(quantitySpan);
        saveButton.remove();
    };

    targetRow.appendChild(saveButton);
}

// Function to update quantity in the backend
async function updateQuantity(itemId, newQuantity, itemInvoiceId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const invoiceId = getInvoiceIdFromUrl();
        const response = await fetch(`http://localhost:8080/invoices/items`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({itemId: itemInvoiceId, quantity: newQuantity})
        });

        if (response.ok) {
            console.log(`Quantity updated for item with ID = ${itemId}`);
            fetchInvoiceItems(invoiceId); // Refresh the table to reflect the change
        } else {
            console.error("Failed to update quantity.");
        }
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}

// Function to delete an item from the invoice
async function deleteItem(itemInvoiceId, itemId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const invoiceId = getInvoiceIdFromUrl();
        const response = await fetch(`http://localhost:8080/invoices/items/${itemInvoiceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log(`Item with ID ${itemId} deleted`);
            fetchInvoiceItems(invoiceId); // Refresh the table to reflect the deletion
        } else {
            console.error("Failed to delete item.");
        }
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}

// Fetch and display items when the page loads
const invoiceId = getInvoiceIdFromUrl();
if (invoiceId) {
    fetchInvoiceItems(invoiceId);
} else {
    console.error("No invoice ID found in the URL.");
}


//
// Show the item selection modal
document.getElementById("addNewItemBtn").addEventListener("click", async () => {
    await fetchAvailableItems();
    document.getElementById("itemModal").style.display = "block";
});

// Close the modal
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("itemModal").style.display = "none";
});

// Fetch the list of items to add to the dropdown
async function fetchAvailableItems() {
    try {
        const invoiceId = getInvoiceIdFromUrl();
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/items/${invoiceId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const items = await response.json();
            populateItemDropdown(items);
        } else {
            console.error("Failed to fetch items list.");
        }
    } catch (error) {
        console.error("Error fetching items list:", error);
    }
}

// Populate the item dropdown with available items
function populateItemDropdown(items) {
    const itemSelect = document.getElementById("itemSelect");
    itemSelect.innerHTML = ""; // Clear previous options

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.text = `${item.itemName} - $${item.price}`;
        itemSelect.appendChild(option);
    });
}

// Add selected item to the invoice with specified quantity
document.getElementById("confirmAddItem").addEventListener("click", async () => {
    const itemId = document.getElementById("itemSelect").value;
    const quantity = document.getElementById("quantityInput").value;
    const invoiceId = getInvoiceIdFromUrl();
    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`http://localhost:8080/invoices/${invoiceId}/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemId: itemId, quantity: parseInt(quantity) }) // Use the specified quantity
        });

        if (response.ok) {
            console.log("Item added to invoice.");
            fetchInvoiceItems(invoiceId); // Refresh the table
            document.getElementById("itemModal").style.display = "none";
        } else {
            console.error("Failed to add item to invoice.");
        }
    } catch (error) {
        console.error("Error adding item to invoice:", error);
    }
});

