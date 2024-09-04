// navigations between pages
function navigateTo(page) {
    window.location.href = page;
}

// Create and Store groups
let groups = JSON.parse(window.localStorage.getItem('groups')) || []

function createGroup() {
    const groupName = document.getElementById("groupName").value
    const friends = document.getElementById("groupFriends").value.split(",").map(friends => friends.trim())

    if(groupName && friends.length > 0){
        const group = {
            name: groupName,
            friends: friends,
            expenses: []
        };
        groups.push(group)
        window.localStorage.setItem("groups",JSON.stringify(groups));
        navigateTo('index.html');
    }
    else {
        alert("Please fill in all fields.")
    }
}

function displayGroups() {
    const groupList = document.getElementById("groupList");
    groupList.innerHTML = "";

    groups.forEach((item, index) => {
        const groupItem = document.createElement("div");
        groupItem.className = "group-item";
    
        const groupButton = document.createElement("button");
        groupButton.className = "group-button";
        groupButton.innerHTML = `<strong>${item.name}</strong><br><span class="group-friends">${item.friends.join(", ")}</span>`;
        groupButton.onclick = () => viewGroup(index);
    
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.innerHTML = "<i class=\"fa fa-trash\"></i>";
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering groupButton's onclick
            deleteGroup(index);
        };
    
        groupItem.appendChild(groupButton);
        groupButton.appendChild(deleteButton);
        groupList.appendChild(groupItem);
    });
}

function deleteGroup(index) {
    groups.splice(index, 1);
    window.localStorage.setItem("groups", JSON.stringify(groups));
    displayGroups();
}

function viewGroup(index) {
    localStorage.setItem('currentGroup', index);
    navigateTo('group-view.html');
}

function displayFriendsInDropdown(){
    const groupIndex = localStorage.getItem('currentGroup');
    const group = groups[groupIndex];
    const payerSelect = document.getElementById("expensePayer");
    payerSelect.innerHTML = '';

    group.friends.forEach(friend => {
        const option = document.createElement("option");
        option.value = friend;
        option.innerText = friend;
        payerSelect.appendChild(option);
    });
}

function addExpense() {
    const expenseName = document.getElementById("expenseName").value;
    const expenseAmount = parseFloat(document.getElementById("expenseAmount").value);
    const payer = document.getElementById("expensePayer").value;
    const splitType = document.getElementById("expenseType").value;
    const groupIndex = window.localStorage.getItem("currentGroup");
    const group = groups[groupIndex];

    if (expenseName && !isNaN(expenseAmount) && payer) {
        const splitAmounts = {};

        if (splitType === "Split Equally") {
            const splitAmount = (expenseAmount / group.friends.length).toFixed(2);
            group.friends.forEach((friend) => {
                splitAmounts[friend] = parseFloat(splitAmount);
            });
        } else if (splitType === "Custom Split") {
            group.friends.forEach(friend => {
                const customAmount = parseFloat(document.getElementById(`split-${friend}`).value);
                splitAmounts[friend] = customAmount;
            });
        }

        const expense = {
            name: expenseName,
            amount: expenseAmount,
            payer: payer,
            splitAmounts: splitAmounts
        };

        group.expenses.push(expense);
        window.localStorage.setItem("groups", JSON.stringify(groups));
        navigateTo('group-view.html');  // Navigate back to the group view after adding the expense
    } else {
        alert("Please fill in all fields.");
    }
}

function toggleCustomSplitFields(){
    const splitType = document.getElementById("expenseType").value;
    const customSplitFields = document.querySelector(".hidden");

    if(splitType === "Custom Split"){
        customSplitFields.style.display ="block";
        const groupIndex = window.localStorage.getItem("currentGroup");
        const group = groups[groupIndex];

        customSplitFields.innerHTML = "";
        group.friends.forEach(friend => {
            customSplitFields.innerHTML += `
                <label for="split-${friend}">${friend}'s Share:</label>
                <input type="number" id="split-${friend}" required><br>
            `;
        });
    }
    else {
        customSplitFields.style.display = "none";
        customSplitFields.innerHTML = "";
    }
}

function displayExpenses() {
    const groupIndex = window.localStorage.getItem("currentGroup");
    const group = groups[groupIndex];
    const expenseList = document.getElementById("expenseList");
    const balanceDiv = document.getElementById("balance");
    let balances = {};

    expenseList.innerHTML = "";
    group.expenses.forEach((expense, expenseIndex) => {
        const expenseItem = document.createElement("div");
        expenseItem.className = "expense-item";

        let expenseText = `<strong>${expense.name}</strong> Total - ₹${expense.amount.toFixed(2)}<br>Payer: ${expense.payer}<br>Split: `;
        Object.keys(expense.splitAmounts).forEach(friend => {
            expenseText += `<br>${friend} - ₹${expense.splitAmounts[friend].toFixed(2)} `;
            if (friend !== expense.payer) {
                if (!balances[friend]) balances[friend] = 0;
                balances[friend] -= expense.splitAmounts[friend];
            }
            if (!balances[expense.payer] && friend !== expense.payer) balances[expense.payer] = 0;
            balances[expense.payer] += expense.splitAmounts[friend];
        });

        // Add Delete Button to the expense item
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.innerHTML = "<i class=\"fa fa-trash\"></i>";
        deleteButton.onclick = () => deleteExpense(expenseIndex);

        expenseItem.innerHTML = expenseText;
        expenseItem.appendChild(deleteButton); // Append delete button to expense item
        expenseList.appendChild(expenseItem);
    });

    balanceDiv.innerHTML = "";
    Object.keys(balances).forEach(friend => {
        const balanceItem = document.createElement("div");
        balanceItem.className = "balance-item";
        balanceItem.innerHTML = `<br>${friend} ${balances[friend] < 0 ? 'owes' : 'is owed'} ₹${Math.abs(balances[friend]).toFixed(2)}`;
        balanceDiv.appendChild(balanceItem);
    });
}

// Function to delete an expense
function deleteExpense(expenseIndex) {
    const groupIndex = window.localStorage.getItem("currentGroup");
    groups[groupIndex].expenses.splice(expenseIndex, 1);
    window.localStorage.setItem("groups", JSON.stringify(groups));
    displayExpenses(); // Refresh the list of expenses after deletion
}



if (document.getElementById("groupList")) displayGroups();
if (document.getElementById("expensePayer")) displayFriendsInDropdown();
if (document.getElementById("expenseList")) displayExpenses();
