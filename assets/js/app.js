import { auth, db } from './firebase-config.js';

// --- UTILITIES ---
const formatLKR = (num) => 'LKR ' + parseFloat(num).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

// --- AUTHENTICATION ---
// Protect Admin Pages
export const requireAuth = () => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });
};

// Handle Login
export const loginAdmin = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
};

// Handle Logout
window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
};

// --- DATA LOGIC ---

// 1. Load Financial Summary (Used by both Admin & Public)
export const loadDashboardData = (callback) => {
    let totalIncome = 0;
    let totalExpense = 0;

    // Listener for Students (Income)
    db.ref('students').on('value', (snapshot) => {
        totalIncome = 0;
        const students = snapshot.val();
        if (students) {
            Object.values(students).forEach(student => {
                if (student.status === 'Paid') {
                    totalIncome += parseFloat(student.price || 0);
                }
            });
        }
        updateTotals(totalIncome, totalExpense, callback);
    });

    // Listener for Expenses
    db.ref('expenses').on('value', (snapshot) => {
        totalExpense = 0;
        const expenses = snapshot.val();
        let expenseArray = [];
        
        if (expenses) {
            Object.entries(expenses).forEach(([key, val]) => {
                totalExpense += parseFloat(val.amount || 0);
                expenseArray.push({ id: key, ...val });
            });
        }
        updateTotals(totalIncome, totalExpense, callback);
        if(callback.onExpenseList) callback.onExpenseList(expenseArray);
    });
};

const updateTotals = (income, expense, callback) => {
    const balance = income - expense;
    if(callback.onTotals) callback.onTotals(income, expense, balance);
};

// 2. Admin: Add Student
export const addStudent = (name, icbtId, price, status) => {
    if(!name || !icbtId || !price) return alert("Please fill all fields");
    db.ref('students').push().set({
        name, icbtId, price: parseFloat(price), status, timestamp: Date.now()
    }).then(() => { alert('Student Added!'); location.reload(); });
};

// 3. Admin: Add Expense
export const addExpense = (usageName, amount) => {
    if(!usageName || !amount) return alert("Please fill all fields");
    db.ref('expenses').push().set({
        usageName, amount: parseFloat(amount), timestamp: Date.now()
    }).then(() => { alert('Expense Added!'); location.reload(); });
};

// 4. Admin: Load Students Table
export const loadStudentsTable = (tableId, filter = 'All') => {
    db.ref('students').on('value', (snapshot) => {
        const tbody = document.getElementById(tableId);
        tbody.innerHTML = '';
        const data = snapshot.val();
        
        if (data) {
            Object.entries(data).forEach(([key, student]) => {
                // Filter Logic
                if (filter === 'Paid' && student.status !== 'Paid') return;
                if (filter === 'Pending' && student.status === 'Paid') return;

                const tr = document.createElement('tr');
                let badgeClass = student.status === 'Paid' ? 'bg-paid' : (student.status === 'Pending' ? 'bg-pending' : 'bg-not-paid');

                tr.innerHTML = `
                    <td>${student.icbtId}</td>
                    <td>${student.name}</td>
                    <td>${formatLKR(student.price)}</td>
                    <td><span class="badge ${badgeClass}">${student.status}</span></td>
                    <td>
                        <button onclick="window.delStudent('${key}')" class="btn-action btn-delete"><i class="bi bi-trash"></i> Del</button>
                        ${student.status !== 'Paid' ? `<button onclick="window.markPaid('${key}')" class="btn-action btn-success"><i class="bi bi-check"></i> Paid</button>` : ''}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    });
};

// --- GLOBAL HELPERS (Window Scope) ---

// UPDATED: Delete with Confirmation
window.delStudent = (id) => {
    if (confirm("⚠️ Are you sure you want to PERMANENTLY delete this record?")) {
        db.ref('students/' + id).remove()
            .catch((error) => alert("Error: " + error.message));
    }
};

// UPDATED: Mark Paid with Confirmation
window.markPaid = (id) => {
    if (confirm("Mark this student as PAID?")) {
        db.ref('students/' + id).update({ status: 'Paid' });
    }
};
