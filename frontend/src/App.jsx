// frontend/src/App.jsx
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'

const BASE_URL = "http://127.0.0.1:8000/api/grocery"

function App() {
  const [items, setItems] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editId, setEditId] = useState(null)

  // Load items from server on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${BASE_URL}/`)
        if (!res.ok) throw new Error("Failed to fetch items")
        const data = await res.json()
        setItems(data)
      } catch (err) {
        toast.error("Could not load grocery list")
      }
    }
    fetchItems()
  }, [])

  // Add new item
  const addItem = async (itemName) => {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: itemName, completed: false }),
      })
      if (!res.ok) throw new Error()
      const newItem = await res.json()
      setItems((prev) => [...prev, newItem.data])
      toast.success("Grocery item added")
    } catch {
      toast.error("Could not add item")
    }
  }

  // Toggle completed status
  const editCompleted = async (itemId) => {
    try {
      const res = await fetch(`${BASE_URL}/${itemId}/toggle/`, {
        method: "POST",
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? updated.data : item)),
      )
    } catch {
      toast.error("Could not update item")
    }
  }

  // Remove item
  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`${BASE_URL}/${itemId}/`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success("Item deleted")
    } catch {
      toast.error("Could not delete item")
    }
  }

  // Update item name
  const updateItemName = async (newName) => {
    try {
      const res = await fetch(`${BASE_URL}/${editId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setItems((prev) =>
        prev.map((item) => (item.id === editId ? updated.data : item)),
      )
      setEditId(null)
      toast.success("Item updated")
    } catch {
      toast.error("Could not update item")
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) {
      toast.error("Please enter an item")
      return
    }

    if (editId) {
      updateItemName(inputValue)
    } else {
      addItem(inputValue)
    }
    setInputValue('')
  }

  // Start editing an item
  const startEditing = (item) => {
    setEditId(item.id)
    setInputValue(item.name)
  }

  return (
    <div className="app">
      <Toaster position="top-center" />
      <div className="container">
        <h1>Grocery Bud</h1>
        
        <form onSubmit={handleSubmit} className="grocery-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. eggs"
            className="grocery-input"
          />
          <button type="submit" className="submit-btn">
            {editId ? 'Edit' : 'Submit'}
          </button>
        </form>

        <div className="grocery-list">
          {items.map((item) => (
            <article key={item.id} className="grocery-item">
              <div className="item-info">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => editCompleted(item.id)}
                  className="item-checkbox"
                />
                <p style={{ 
                  textDecoration: item.completed ? 'line-through' : 'none',
                  opacity: item.completed ? 0.7 : 1
                }}>
                  {item.name}
                </p>
              </div>
              <div className="item-actions">
                <button 
                  onClick={() => startEditing(item)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        {items.length > 0 && (
          <button 
            onClick={async () => {
              // Clear all items
              for (const item of items) {
                await removeItem(item.id)
              }
            }}
            className="clear-btn"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}

export default App