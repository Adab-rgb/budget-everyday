// Global variables
let monthlyIncome = 0;
let dailyBudget = 0;
let totalSpent = 0;
let spendingHistory = [];
let spendingChart = null;

// DOM elements
const monthlyIncomeInput = document.getElementById('monthlyIncome');
const setIncomeBtn = document.getElementById('setIncomeBtn');
const dailyBalanceInput = document.getElementById('dailyBalance');
const addBalanceBtn = document.getElementById('addBalanceBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportDataBtn = document.getElementById('exportDataBtn');

// Display elements
const currentMonthSpan = document.getElementById('currentMonth');
const daysInMonthSpan = document.getElementById('daysInMonth');
const dailyBudgetSpan = document.getElementById('dailyBudget');
const remainingBudgetSpan = document.getElementById('remainingBudget');
const daysRemainingSpan = document.getElementById('daysRemaining');
const maxDailySpendSpan = document.getElementById('maxDailySpend');
const todaySpendingSpan = document.getElementById('todaySpending');
const totalSpentSpan = document.getElementById('totalSpent');
const spendingHistoryDiv = document.getElementById('spendingHistory');

// Maximum spending display elements
const maxTotalSpendSpan = document.getElementById('maxTotalSpend');
const daysRemainingTextSpan = document.getElementById('daysRemainingText');
const maxDailySpendBreakdownSpan = document.getElementById('maxDailySpendBreakdown');
const maxWeeklySpendSpan = document.getElementById('maxWeeklySpend');

// Daily budget grid element
const dailyBudgetGrid = document.getElementById('dailyBudgetGrid');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateMonthInfo();
    updateDisplay();
    initializeChart();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    setIncomeBtn.addEventListener('click', setMonthlyIncome);
    addBalanceBtn.addEventListener('click', updateDailyBalance);
    clearHistoryBtn.addEventListener('click', clearHistory);
    exportDataBtn.addEventListener('click', exportData);
    
    // Enter key support
    monthlyIncomeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') setMonthlyIncome();
    });
    
    dailyBalanceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') updateDailyBalance();
    });
}

// Set monthly income and calculate daily budget
function setMonthlyIncome() {
    const income = parseFloat(monthlyIncomeInput.value);
    
    if (isNaN(income) || income <= 0) {
        alert('Please enter a valid monthly income amount.');
        return;
    }
    
    monthlyIncome = income;
    const daysInMonth = getDaysInCurrentMonth();
    dailyBudget = monthlyIncome / daysInMonth;
    
    // Reset spending for new month
    totalSpent = 0;
    spendingHistory = [];
    
    saveData();
    updateDisplay();
    updateChart();
    
    monthlyIncomeInput.value = '';
    alert(`Monthly income set to $${income.toFixed(2)}. Daily budget: $${dailyBudget.toFixed(2)}`);
}

// Update daily balance and calculate spending
function updateDailyBalance() {
    if (monthlyIncome === 0) {
        alert('Please set your monthly income first.');
        return;
    }
    
    const currentBalance = parseFloat(dailyBalanceInput.value);
    
    if (isNaN(currentBalance) || currentBalance < 0) {
        alert('Please enter a valid balance amount.');
        return;
    }
    
    const today = new Date();
    const dateString = today.toLocaleDateString();
    
    // Calculate today's spending based on balance
    let todaySpending = 0;
    let previousBalance = monthlyIncome - totalSpent;
    
    // Check if we already have an entry for today
    const existingEntryIndex = spendingHistory.findIndex(entry => entry.date === dateString);
    
    if (existingEntryIndex !== -1) {
        // Update existing entry - calculate spending from balance change
        const previousTotalSpent = totalSpent - spendingHistory[existingEntryIndex].amount;
        const expectedBalance = monthlyIncome - previousTotalSpent;
        todaySpending = expectedBalance - currentBalance;
        
        spendingHistory[existingEntryIndex].amount = todaySpending;
        spendingHistory[existingEntryIndex].remaining = currentBalance;
    } else {
        // Add new entry - calculate spending from balance change
        const expectedBalance = monthlyIncome - totalSpent;
        todaySpending = expectedBalance - currentBalance;
        
        spendingHistory.push({
            date: dateString,
            amount: todaySpending,
            remaining: currentBalance
        });
    }
    
    // Recalculate total spent
    totalSpent = spendingHistory.reduce((sum, entry) => sum + entry.amount, 0);
    
    saveData();
    updateDisplay();
    updateChart();
    updateHistoryDisplay();
    
    dailyBalanceInput.value = '';
}

// Get days in current month
function getDaysInCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return new Date(year, month, 0).getDate();
}

// Update month information display
function updateMonthInfo() {
    const now = new Date();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    currentMonthSpan.textContent = monthNames[now.getMonth()];
    daysInMonthSpan.textContent = getDaysInCurrentMonth();
    
    if (monthlyIncome > 0) {
        dailyBudgetSpan.textContent = `$${dailyBudget.toFixed(2)}`;
    }
}

// Update all display elements
function updateDisplay() {
    const daysInMonth = getDaysInCurrentMonth();
    const today = new Date().getDate();
    const daysRemaining = daysInMonth - today + 1;
    const remainingBudget = monthlyIncome - totalSpent;
    const maxDailySpend = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
    
    // Calculate today's spending
    const todayDate = new Date().toLocaleDateString();
    const todayEntry = spendingHistory.find(entry => entry.date === todayDate);
    const todaySpending = todayEntry ? todayEntry.amount : 0;
    
    // Update summary cards
    remainingBudgetSpan.textContent = `$${remainingBudget.toFixed(2)}`;
    daysRemainingSpan.textContent = daysRemaining;
    maxDailySpendSpan.textContent = `$${maxDailySpend.toFixed(2)}`;
    todaySpendingSpan.textContent = `$${todaySpending.toFixed(2)}`;
    totalSpentSpan.textContent = `$${totalSpent.toFixed(2)}`;
    
    // Update maximum spending alert
    maxTotalSpendSpan.textContent = `$${remainingBudget.toFixed(2)}`;
    daysRemainingTextSpan.textContent = daysRemaining;
    maxDailySpendBreakdownSpan.textContent = `$${maxDailySpend.toFixed(2)}`;
    maxWeeklySpendSpan.textContent = `$${(maxDailySpend * 7).toFixed(2)}`;
    
    // Generate daily budget cards
    generateDailyBudgetCards(remainingBudget, daysRemaining);
    
    // Color coding for budget status
    if (remainingBudget < 0) {
        remainingBudgetSpan.style.color = '#e53e3e';
    } else if (remainingBudget < monthlyIncome * 0.1) {
        remainingBudgetSpan.style.color = '#d69e2e';
    } else {
        remainingBudgetSpan.style.color = '#667eea';
    }
}

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('spendingChart').getContext('2d');
    
    spendingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Spending',
                data: [],
                backgroundColor: 'rgba(229, 62, 62, 0.8)',
                borderColor: '#e53e3e',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }, {
                label: 'Daily Budget',
                data: [],
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: '#667eea',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Daily Spending vs Budget'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Update chart with current data
function updateChart() {
    if (!spendingChart) return;
    
    const labels = spendingHistory.map(entry => entry.date);
    const spendingData = spendingHistory.map(entry => entry.amount);
    const budgetData = spendingHistory.map(() => dailyBudget);
    
    spendingChart.data.labels = labels;
    spendingChart.data.datasets[0].data = spendingData;
    spendingChart.data.datasets[1].data = budgetData;
    
    spendingChart.update();
}

// Update spending history display
function updateHistoryDisplay() {
    spendingHistoryDiv.innerHTML = '';
    
    if (spendingHistory.length === 0) {
        spendingHistoryDiv.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">No spending entries yet.</p>';
        return;
    }
    
    spendingHistory.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'spending-entry';
        
        entryDiv.innerHTML = `
            <div>
                <div class="spending-date">${entry.date}</div>
                <div class="spending-remaining">Balance: $${entry.remaining.toFixed(2)}</div>
            </div>
            <div class="spending-amount">Spent: $${entry.amount.toFixed(2)}</div>
        `;
        
        spendingHistoryDiv.appendChild(entryDiv);
    });
}

// Clear all history
function clearHistory() {
    if (confirm('Are you sure you want to clear all spending history?')) {
        spendingHistory = [];
        totalSpent = 0;
        saveData();
        updateDisplay();
        updateChart();
        updateHistoryDisplay();
    }
}

// Export data as CSV
function exportData() {
    if (spendingHistory.length === 0) {
        alert('No data to export.');
        return;
    }
    
    let csv = 'Date,Spent,Current Balance\n';
    spendingHistory.forEach(entry => {
        csv += `${entry.date},${entry.amount},${entry.remaining}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spending_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Save data to localStorage
function saveData() {
    const data = {
        monthlyIncome,
        dailyBudget,
        totalSpent,
        spendingHistory
    };
    localStorage.setItem('budgetTrackerData', JSON.stringify(data));
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('budgetTrackerData');
    if (savedData) {
        const data = JSON.parse(savedData);
        monthlyIncome = data.monthlyIncome || 0;
        dailyBudget = data.dailyBudget || 0;
        totalSpent = data.totalSpent || 0;
        spendingHistory = data.spendingHistory || [];
        
        // Check if we're in a new month and reset if necessary
        const lastEntry = spendingHistory[spendingHistory.length - 1];
        if (lastEntry) {
            const lastDate = new Date(lastEntry.date);
            const currentDate = new Date();
            
            if (lastDate.getMonth() !== currentDate.getMonth() || lastDate.getFullYear() !== currentDate.getFullYear()) {
                // New month, reset data
                totalSpent = 0;
                spendingHistory = [];
                if (monthlyIncome > 0) {
                    dailyBudget = monthlyIncome / getDaysInCurrentMonth();
                }
            }
        }
    }
}

// Auto-save data periodically
setInterval(saveData, 30000); // Save every 30 seconds

// Generate daily budget cards for remaining days
function generateDailyBudgetCards(remainingBudget, daysRemaining) {
    dailyBudgetGrid.innerHTML = '';
    
    if (daysRemaining <= 0 || remainingBudget <= 0) {
        dailyBudgetGrid.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic; grid-column: 1 / -1;">No remaining days or budget available.</p>';
        return;
    }
    
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = getDaysInCurrentMonth();
    
    // Calculate budget per day (equal distribution)
    const budgetPerDay = remainingBudget / daysRemaining;
    
    for (let i = 0; i < daysRemaining; i++) {
        const dayNumber = currentDay + i;
        const dayDate = new Date(today.getFullYear(), today.getMonth(), dayNumber);
        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = i === 0;
        
        const card = document.createElement('div');
        card.className = `daily-budget-card ${isToday ? 'today' : ''}`;
        
        card.innerHTML = `
            <div class="day-label">${dayName}</div>
            <div class="day-number">${dayNumber}</div>
            <div class="budget-amount">$${budgetPerDay.toFixed(2)}</div>
        `;
        
        // Add click event to show more details
        card.addEventListener('click', function() {
            showDayDetails(dayNumber, dayName, budgetPerDay, isToday);
        });
        
        dailyBudgetGrid.appendChild(card);
    }
}

// Show detailed information for a specific day
function showDayDetails(dayNumber, dayName, budgetAmount, isToday) {
    const today = new Date();
    const dayDate = new Date(today.getFullYear(), today.getMonth(), dayNumber);
    const fullDate = dayDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const message = isToday ? 
        `Today (${fullDate})\nBudget: $${budgetAmount.toFixed(2)}` :
        `${fullDate}\nBudget: $${budgetAmount.toFixed(2)}`;
    
    alert(message);
}

// Update display when window gains focus (in case user switches tabs)
window.addEventListener('focus', function() {
    updateMonthInfo();
    updateDisplay();
});

// Mobile-specific improvements
document.addEventListener('DOMContentLoaded', function() {
    // Prevent zoom on input focus for iOS
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Set font size to prevent zoom on iOS
            this.style.fontSize = '16px';
        });
        
        input.addEventListener('blur', function() {
            // Reset font size after blur
            this.style.fontSize = '';
        });
    });
    
    // Add touch feedback for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // Add touch feedback for daily budget cards
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.daily-budget-card')) {
            e.target.closest('.daily-budget-card').style.transform = 'scale(0.95)';
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (e.target.closest('.daily-budget-card')) {
            e.target.closest('.daily-budget-card').style.transform = '';
        }
    });
}); 