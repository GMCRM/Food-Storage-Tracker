// Initialize items array
// This line looks in localStorage (a built-in browser storage area)
// and retrieves any previously saved items. If none exist, it starts with an empty array.
// Where I learned it:
// - JSON.parse(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
// - localStorage.getItem(): https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem
// - Web Storage API overview: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

// Commenting out localStorage for now to focus on server integration
// let items = JSON.parse(localStorage.getItem("items")) || [];
let items = []; // Start with an empty array (will fetch from backend)

// Track which item is being edited (null means we're adding a new item)
let editingItemId = null;

// Fetch items from the backend server
// Where I learned it: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function fetchItems() {
  try {
    const response = await fetch("http://localhost:3000/items");
    items = await response.json();
    renderTable();
  } catch (err) {
    console.error("Error fetching items:", err);
  }
}

// Fetch items when the page loads
fetchItems();

// Implement "Add or Update Item" function
// Added async to function to use await inside it
async function addItem(event) {
  // Prevent the default form submission (which refreshes the page)
  // Where I learned it: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
  event.preventDefault();

  // Capture form inputs using their IDs
  // Where I learned it: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
  const itemName = document.getElementById("item-name").value;
  const itemDescription = document.getElementById("item-description").value;
  const itemStorageType = document.getElementById("item-storage-type").value;
  const dateStored = document.getElementById("dateStored").value;
  const useByDate = document.getElementById("useByDate").value;

  // Calculate days left until expiration
  // Where I learned it: Date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  const today = new Date();
  const useBy = new Date(useByDate);
  const daysLeft = Math.ceil((useBy - today) / (1000 * 60 * 60 * 24));

  // Build an object representing one food item
  // Where I learned it: objects: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Basics
  const itemData = {
    name: itemName,
    description: itemDescription,
    storageType: itemStorageType,
    dateStored: dateStored,
    useByDate: useByDate,
    daysLeft: daysLeft,
  };

  // Determine if we're creating a new item or updating an existing one
  try {
    if (editingItemId !== null) {
      // Update existing item via PUT request
      // Where I learned it: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
      const response = await fetch(
        `http://localhost:3000/items/${editingItemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        }
      );
      const updatedItem = await response.json();
      console.log("Item updated:", updatedItem);

      // Reset editing state
      editingItemId = null;
      updateSubmitButton();
    } else {
      // Create new item via POST request
      const response = await fetch("http://localhost:3000/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      const savedItem = await response.json();
      console.log("Item saved:", savedItem);
    }

    // Fetch updated items from backend
    await fetchItems();

    // Clear form inputs for the next entry
    // Where I learned it: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
    document.getElementById("item-form").reset();
  } catch (err) {
    console.error("Error saving item:", err);
  }
}

// Helper function to format date as MM/DD/YYYY (changed from MM-DD-YYYY)
// function formatDate(dateString) {
//   const date = new Date(dateString);
//   const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 because months are 0-indexed
//   const day = String(date.getDate()).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${month}/${day}/${year}`; // Changed from dashes to slashes
// }

// Helper function to format date as MM/DD/YYYY using moment.js
function formatDate(dateString) {
  return moment(dateString).format("MM/DD/YYYY");
}

// Helper function to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Render the table — dynamically updates the HTML table with stored items
function renderTable() {
  const tableBody = document.getElementById("item-table-body");
  if (!tableBody) {
    console.error('tbody with id "item-table-body" not found');
    return;
  }

  // Clear the current table content
  tableBody.innerHTML = "";

  // Loop through the items array
  // Where I learned it: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
  items.forEach((item, index) => {
    const row = document.createElement("tr");

    // Add cells for each property
    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;
    row.appendChild(nameCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = item.description;
    row.appendChild(descriptionCell);

    const storageCell = document.createElement("td");
    storageCell.textContent = capitalize(item.storage_type || item.storageType); // Capitalize storage type
    row.appendChild(storageCell);

    const dateStoredCell = document.createElement("td");
    dateStoredCell.textContent = formatDate(
      item.date_stored || item.dateStored
    ); // Format with slashes
    row.appendChild(dateStoredCell);

    const useByDateCell = document.createElement("td");
    useByDateCell.textContent = formatDate(item.use_by_date || item.useByDate); // Format with slashes
    row.appendChild(useByDateCell);

    const daysLeftCell = document.createElement("td");
    daysLeftCell.textContent = item.days_left || item.daysLeft;
    row.appendChild(daysLeftCell);

    // Add action buttons (Edit and Delete)
    const actionsCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    // Use the backend id (not the array index) so delete/edit calls target the correct DB row
    editButton.onclick = () => editItem(item.id);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    // Use the backend id (not the array index)
    deleteButton.onclick = () => deleteItem(item.id);

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });

  // Count and log items expiring in the next 7 days
  const expiringCount = countExpiringItems(items, 7);
  console.log(`${expiringCount} items expiring soon!`);
}

// Recursive function to count items expiring within X days
function countExpiringItems(itemsArray, daysThreshold, index = 0, count = 0) {
  // Base case: if we've checked all items
  if (index >= itemsArray.length) {
    return count;
  }

  // Check if current item expires within threshold
  const daysLeft = itemsArray[index].days_left || itemsArray[index].daysLeft;
  if (daysLeft <= daysThreshold && daysLeft >= 0) {
    count++;
  }

  // Recursive call with next index
  return countExpiringItems(itemsArray, daysThreshold, index + 1, count);
}

// Delete an item
//
// function deleteItem(index) {
// Remove one element from the array
// Where I learned it: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
// items.splice(index, 1);

// Update localStorage
// Commenting out localStorage to focus on server integration
// localStorage.setItem("items", JSON.stringify(items));

// Re-render the updated table
// renderTable();
// }

// Modified deleteItem to work with backend
// Where I learned it: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function deleteItem(id) {
  try {
    await fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" });
    fetchItems(); // Refresh table from backend
  } catch (err) {
    console.error("Error deleting item:", err);
  }
}

// Edit an existing item (by loading it back into the form)
function editItem(id) {
  // Find the item by its backend id
  const item = items.find((it) => String(it.id) === String(id));
  if (!item) {
    console.error(`Item with id ${id} not found`);
    return;
  }

  // Set editing state
  editingItemId = id;

  // Pre-fill the form fields with the existing data
  document.getElementById("item-name").value = item.name;
  document.getElementById("item-description").value = item.description;
  document.getElementById("item-storage-type").value =
    item.storage_type || item.storageType;
  document.getElementById("dateStored").value = (
    item.date_stored || item.dateStored
  ).split("T")[0];
  document.getElementById("useByDate").value = (
    item.use_by_date || item.useByDate
  ).split("T")[0];

  // Update the submit button to show we're editing
  updateSubmitButton();

  // Scroll to the form so user can see they're editing
  document.getElementById("item-form").scrollIntoView({ behavior: "smooth" });
}

// Helper function to update the submit button text based on editing state
function updateSubmitButton() {
  const submitButton = document.querySelector(
    '#item-form button[type="submit"]'
  );
  const cancelButton = document.getElementById("cancel-btn");

  if (submitButton) {
    if (editingItemId !== null) {
      submitButton.textContent = "Update Item";
      submitButton.style.backgroundColor = "#ff9800"; // Orange for update
      if (cancelButton) cancelButton.style.display = "inline-block";
    } else {
      submitButton.textContent = "Add Item";
      submitButton.style.backgroundColor = ""; // Reset to default
      if (cancelButton) cancelButton.style.display = "none";
    }
  }
}

// Function to cancel editing and reset form
function cancelEdit() {
  editingItemId = null;
  document.getElementById("item-form").reset();
  updateSubmitButton();
}

// Attach an event listener so the form calls addItem() when submitted
// Where I learned it: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
document.getElementById("item-form").addEventListener("submit", addItem);

// No need to call renderTable() here — fetchItems() (called on load) already renders the table
