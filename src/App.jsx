
import { useState, useEffect } from 'react'
import './App.css'

const initialTransactions = [
  { id: 1, title: 'Groceries', category: 'Food', amount: 1200, date: 'Today' },
  { id: 2, title: 'Uber Ride', category: 'Transport', amount: 450, date: 'Yesterday' },
  { id: 3, title: 'Shopping', category: 'Shopping', amount: 2500, date: 'Yesterday' },
  { id: 4, title: 'Electricity Bill', category: 'Bills', amount: 1800, date: '28 Sep' },
]

function getSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function App() {

  // NAVIGATION

  const [activePage, setActivePage] = useState('Dashboard')

  // TRANSACTIONS

  const [transactions, setTransactions] = useState(() =>
    getSavedData('spendly_transactions', initialTransactions)
  )

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  // USER SETTINGS

  const [income, setIncome] = useState(() =>
    Number(getSavedData('spendly_income', 50000))
  )

  const [currency, setCurrency] = useState(() =>
    getSavedData('spendly_currency', '₹')
  )

  const [userName, setUserName] = useState(() =>
    getSavedData('spendly_username', 'Charu')
  )

  // SAVE DATA AUTOMATICALLY

  useEffect(() => {
    localStorage.setItem(
      'spendly_transactions',
      JSON.stringify(transactions)
    )
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('spendly_income', JSON.stringify(income))
  }, [income])

  useEffect(() => {
    localStorage.setItem('spendly_currency', JSON.stringify(currency))
  }, [currency])

  useEffect(() => {
    localStorage.setItem('spendly_username', JSON.stringify(userName))
  }, [userName])

  // CALCULATIONS

  const totalExpense = transactions.reduce(
    (total, item) => total + Number(item.amount),
    0
  )

  const balance = income - totalExpense

  const formatMoney = (value) =>
    `${currency}${Number(value).toLocaleString('en-IN')}`

  // ADD EXPENSE

  function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !amount || Number(amount) <= 0) {
      alert('Please enter valid expense details')
      return
    }

    const newTransaction = {
      id: Date.now(),
      title: title.trim(),
      category,
      amount: Number(amount),
      date: 'Today',
    }

    setTransactions(prev => [newTransaction, ...prev])

    setTitle('')
    setAmount('')
    setCategory('Food')
  }

  // DELETE EXPENSE

  function deleteTransaction(id) {
    setTransactions(prev =>
      prev.filter(item => item.id !== id)
    )
  }

  // FILTER TRANSACTIONS

  const filteredTransactions = transactions.filter(item => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      filter === 'All' || item.category === filter

    return matchesSearch && matchesCategory
  })

  // CATEGORIES

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Other',
  ]

  // ANALYTICS

  const categoryTotals = categories.map(cat => ({
    name: cat,
    amount: transactions
      .filter(item => item.category === cat)
      .reduce((total, item) => total + item.amount, 0),
  }))

  const maxExpense = Math.max(
    ...categoryTotals.map(item => item.amount),
    1
  )

  // SIDEBAR

  const navItems = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Transactions', icon: '↗' },
    { name: 'Analytics', icon: '▤' },
    { name: 'Settings', icon: '⚙' },
  ]

  return (

    <div className="app-container">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          ◈ Spendly
        </div>

        <p className="menu-label">MENU</p>

        <nav>

          {navItems.map(item => (

            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'active' : ''
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>

          ))}

        </nav>

        <div className="sidebar-profile">

          <div className="avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{userName}</strong>
            <p>Personal Account</p>
          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>{activePage}</h1>
            <p>Welcome back! Here's your financial overview.</p>
          </div>

          <div className="date-badge">
            📅 {new Date().toLocaleDateString('en-IN', {
              month: 'long',
              year: 'numeric',
            })}
          </div>

        </header>

        {/* DASHBOARD */}

        {activePage === 'Dashboard' && (

          <>

            <section className="summary-grid">

              <div className="summary-card balance-card">
                <p>Total Balance</p>
                <h2>{formatMoney(balance)}</h2>
                <span>Available balance</span>
              </div>

              <div className="summary-card">
                <p>Total Income</p>
                <h2>{formatMoney(income)}</h2>
                <span>↗ Monthly income</span>
              </div>

              <div className="summary-card">
                <p>Total Expenses</p>
                <h2>{formatMoney(totalExpense)}</h2>
                <span>↘ Money spent</span>
              </div>

            </section>

            <section className="dashboard-grid">

              {/* RECENT TRANSACTIONS */}

              <div className="content-card">

                <div className="card-heading">

                  <div>
                    <h3>Recent Transactions</h3>
                    <p>Your latest spending activity</p>
                  </div>

                  <button
                    className="small-button"
                    onClick={() => setActivePage('Transactions')}
                  >
                    {transactions.length} records
                  </button>

                </div>

                <div className="transaction-list">

                  {transactions.slice(0, 5).map(item => (

                    <div className="transaction-item" key={item.id}>

                      <div className="transaction-icon">
                        {item.category === 'Food' ? '🍔' :
                         item.category === 'Transport' ? '🚗' :
                         item.category === 'Shopping' ? '🛍️' :
                         item.category === 'Bills' ? '⚡' : '💳'}
                      </div>

                      <div className="transaction-info">
                        <strong>{item.title}</strong>
                        <p>{item.category} · {item.date}</p>
                      </div>

                      <div className="transaction-amount">
                        -{formatMoney(item.amount)}
                      </div>

                    </div>

                  ))}

                  {transactions.length === 0 && (
                    <p>No transactions yet. Add your first expense!</p>
                  )}

                </div>

              </div>

              {/* ADD EXPENSE */}

              <div className="content-card">

                <div className="card-heading">

                  <div>
                    <h3>Add Expense</h3>
                    <p>Record a new transaction</p>
                  </div>

                  <span className="add-icon">＋</span>

                </div>

                <form onSubmit={handleSubmit} className="expense-form">

                  <label>Expense Name</label>

                  <input
                    type="text"
                    placeholder="e.g. Dinner"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />

                  <label>Amount ({currency})</label>

                  <input
                    type="number"
                    placeholder="e.g. 500"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />

                  <label>Category</label>

                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <button type="submit" className="primary-button">
                    + Add Expense
                  </button>

                </form>

              </div>

            </section>

          </>

        )}

        {/* TRANSACTIONS PAGE */}

        {activePage === 'Transactions' && (

          <section className="content-card full-card">

            <div className="card-heading">

              <div>
                <h3>All Transactions</h3>
                <p>Manage and track your spending</p>
              </div>

              <span className="small-button">
                {filteredTransactions.length} records
              </span>

            </div>

            <div className="transaction-controls">

              <input
                type="text"
                placeholder="🔍 Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="All">All Categories</option>

                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}

              </select>

            </div>

            <div className="transaction-list">

              {filteredTransactions.map(item => (

                <div className="transaction-item" key={item.id}>

                  <div className="transaction-icon">
                    {item.category === 'Food' ? '🍔' :
                     item.category === 'Transport' ? '🚗' :
                     item.category === 'Shopping' ? '🛍️' :
                     item.category === 'Bills' ? '⚡' : '💳'}
                  </div>

                  <div className="transaction-info">
                    <strong>{item.title}</strong>
                    <p>{item.category} · {item.date}</p>
                  </div>

                  <div className="transaction-amount">
                    -{formatMoney(item.amount)}
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => deleteTransaction(item.id)}
                  >
                    Delete
                  </button>

                </div>

              ))}

              {filteredTransactions.length === 0 && (
                <p>No matching transactions found.</p>
              )}

            </div>

          </section>

        )}

        {/* ANALYTICS PAGE */}

        {activePage === 'Analytics' && (

          <>

            <section className="summary-grid">

              <div className="summary-card balance-card">
                <p>Total Spending</p>
                <h2>{formatMoney(totalExpense)}</h2>
                <span>Across all categories</span>
              </div>

              <div className="summary-card">
                <p>Transactions</p>
                <h2>{transactions.length}</h2>
                <span>Total records</span>
              </div>

              <div className="summary-card">
                <p>Average Expense</p>
                <h2>
                  {formatMoney(
                    transactions.length
                      ? Math.round(totalExpense / transactions.length)
                      : 0
                  )}
                </h2>
                <span>Per transaction</span>
              </div>

            </section>

            <section className="content-card full-card">

              <h3>Spending by Category</h3>

              <p className="muted-text">
                Understand where your money goes.
              </p>

              <div className="analytics-list">

                {categoryTotals.map(item => (

                  <div className="analytics-item" key={item.name}>

                    <div className="analytics-label">
                      <strong>{item.name}</strong>
                      <span>{formatMoney(item.amount)}</span>
                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${(item.amount / maxExpense) * 100}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </section>

          </>

        )}

        {/* SETTINGS PAGE */}

        {activePage === 'Settings' && (

          <section className="content-card full-card">

            <h3>Account Settings</h3>

            <p className="muted-text">
              Customize your Spendly experience.
            </p>

            <form
              className="expense-form settings-form"
              onSubmit={e => {
                e.preventDefault()
                alert('Settings saved successfully!')
              }}
            >

              <label>Display Name</label>

              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
              />

              <label>Monthly Income ({currency})</label>

              <input
                type="number"
                min="0"
                value={income}
                onChange={e => setIncome(Number(e.target.value))}
                required
              />

              <label>Currency</label>

              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="₹">Indian Rupee (₹)</option>
                <option value="$">US Dollar ($)</option>
                <option value="€">Euro (€)</option>
                <option value="£">British Pound (£)</option>
              </select>

              <button type="submit" className="primary-button">
                Save Settings
              </button>

            </form>

          </section>

        )}

        <footer>
          Spendly © 2026 · Manage your money smarter.
        </footer>

      </main>

    </div>

  )
}

export default App
