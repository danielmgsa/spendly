document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded successfully!");

    const form = document.getElementById("expenseForm");
    const categorySelect = document.getElementById("category");
    const amountInput = document.getElementById("amount");
    const notesInput = document.getElementById("notes");
    const monthFilter = document.getElementById("monthFilter");
    const yearFilter = document.getElementById("yearFilter");
    const applyFilterButton = document.getElementById("applyFilter");
    const spendingChartCanvas = document.getElementById("spendingChart");
    const totalSpentDiv = document.getElementById("totalSpent");
    const expenseTableBody = document.querySelector("#expenseTable tbody");

    let transactions = []; // Store transactions locally
    let spendingChart = null; // Chart.js instance

    // Populate the year filter dropdown
    function populateYearFilter() {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 10; // Go back 10 years for options
        const endYear = currentYear + 5; // Add 5 years for options

        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true; // Select current year by default
            }
            yearFilter.appendChild(option);
        }
    }

    // Call the function to populate the year filter on page load
    populateYearFilter();

    // Add Expense Form Submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Get form values
        const category = categorySelect.value;
        const amount = parseFloat(amountInput.value);
        const notes = notesInput.value.trim();
        const date = new Date();

        // Validate inputs
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        // Add the transaction to the local list
        transactions.push({ category, amount, notes, date });

        // Clear the form
        form.reset();

        alert("Expense added successfully!");
        populateExpenseTable(transactions); // Refresh the table
    });

    // Apply Filter by Month and Year
    applyFilterButton.addEventListener("click", () => {
        const filterMonth = monthFilter.value;
        const filterYear = yearFilter.value;

        if (!filterMonth || !filterYear) {
            alert("Please select both a month and a year to filter.");
            return;
        }

        // Filter transactions by the selected month and year
        const filteredTransactions = transactions.filter((transaction) => {
            const transactionDate = new Date(transaction.date);
            const transactionMonth = String(transactionDate.getMonth() + 1).padStart(2, "0"); // Format MM
            const transactionYear = transactionDate.getFullYear();
            return transactionMonth === filterMonth && transactionYear.toString() === filterYear;
        });

        console.log("Filtered transactions:", filteredTransactions);

        // Update total spent
        const totalSpent = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        totalSpentDiv.textContent = `Total Spent: $${totalSpent.toFixed(2)}`;

        // Populate the table with filtered transactions
        populateExpenseTable(filteredTransactions);

        // Visualize the filtered transactions
        visualizeExpensesByCategory(filteredTransactions);
    });

    // Populate the Expense Table
    function populateExpenseTable(transactionList) {
        // Clear existing table rows
        expenseTableBody.innerHTML = "";

        // Add rows for each transaction
        transactionList.forEach((transaction, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="false">${new Date(transaction.date).toLocaleDateString()}</td>
                <td contenteditable="false">${transaction.category}</td>
                <td contenteditable="false">$${transaction.amount.toFixed(2)}</td>
                <td contenteditable="false">${transaction.notes}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="save-btn" data-index="${index}" style="display: none;">Save</button>
                </td>
            `;
            expenseTableBody.appendChild(row);
        });

        // Attach event listeners for edit and save buttons
        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const index = event.target.getAttribute("data-index");
                enableEditing(index);
            });
        });

        document.querySelectorAll(".save-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const index = event.target.getAttribute("data-index");
                saveEditing(index);
            });
        });
    }

    // Enable Editing
    function enableEditing(index) {
        const row = expenseTableBody.children[index];
        row.cells[0].contentEditable = true; // Date
        row.cells[1].contentEditable = true; // Category
        row.cells[2].contentEditable = true; // Amount
        row.cells[3].contentEditable = true; // Notes

        // Show Save button, hide Edit button
        row.querySelector(".save-btn").style.display = "inline-block";
        row.querySelector(".edit-btn").style.display = "none";
    }

    // Save Edited Row
    function saveEditing(index) {
        const row = expenseTableBody.children[index];

        // Update transaction in the array
        const updatedTransaction = {
            date: new Date(row.cells[0].textContent), // Parse the date
            category: row.cells[1].textContent,
            amount: parseFloat(row.cells[2].textContent.replace("$", "")), // Remove the $ symbol
            notes: row.cells[3].textContent,
        };

        // Validate the updated amount
        if (isNaN(updatedTransaction.amount) || updatedTransaction.amount <= 0) {
            alert("Invalid amount entered. Please try again.");
            return;
        }

        transactions[index] = updatedTransaction;

        // Lock the cells
        row.cells[0].contentEditable = false;
        row.cells[1].contentEditable = false;
        row.cells[2].contentEditable = false;
        row.cells[3].contentEditable = false;

        // Show Edit button, hide Save button
        row.querySelector(".save-btn").style.display = "none";
        row.querySelector(".edit-btn").style.display = "inline-block";

        alert("Expense updated successfully!");
        console.log("Updated transactions:", transactions);
    }

    // Visualize Expenses by Category
    function visualizeExpensesByCategory(filteredTransactions) {
        // Aggregate expenses by category
        const categoryTotals = {};
        filteredTransactions.forEach((transaction) => {
            categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        });

        // Prepare data for the chart
        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);

        // Destroy the existing chart if it exists
        if (spendingChart) {
            spendingChart.destroy();
        }

        // Create a new pie chart
        spendingChart = new Chart(spendingChartCanvas, {
            type: "pie",
            data: {
                labels: categories,
                datasets: [
                    {
                        label: "Expenses by Category",
                        data: amounts,
                        backgroundColor: [
                            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#FF6347",
                        ],
                    },
                ],
            },
        });
    }
});
