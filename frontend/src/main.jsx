import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const API_URL = 'http://localhost:8080/api/cars'

function App() {
  const [cars, setCars] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadCars() {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Unable to load cars')
      setCars(await response.json())
    } catch (loadError) {
      setError(`${loadError.message}. Is the backend running on port 8080?`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCars()
  }, [])

  async function createCar(car) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    })
    if (!response.ok) throw new Error('Unable to create car')
    const newCar = await response.json()
    setCars((currentCars) => [...currentCars, newCar])
    setIsModalOpen(false)
    setError('')
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Fleet workspace</p>
          <h1>Car registry</h1>
        </div>
        <button className="primary-button" onClick={() => setIsModalOpen(true)}>
          <span aria-hidden="true">+</span> Create car
        </button>
      </header>

      <section className="summary-row" aria-label="Registry summary">
        <div className="summary-item">
          <span className="summary-label">Vehicles registered</span>
          <strong>{cars.length}</strong>
        </div>
        <div className="summary-item summary-accent">
          <span className="summary-label">Connection</span>
          <strong>{error ? 'Offline' : 'Live'}</strong>
        </div>
      </section>

      <section className="table-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Inventory</p>
            <h2>All cars</h2>
          </div>
          <button className="refresh-button" onClick={loadCars} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>ID</th><th>Model</th><th>Year</th><th>Color</th></tr>
            </thead>
            <tbody>
              {!isLoading && cars.length === 0 && (
                <tr><td className="empty-state" colSpan="4">No cars yet. Add the first one.</td></tr>
              )}
              {cars.map((car) => (
                <tr key={car.id}>
                  <td className="id-cell">#{car.id}</td>
                  <td className="model-cell">{car.model}</td>
                  <td>{car.year}</td>
                  <td><span className="color-dot" style={{ backgroundColor: car.color }} />{car.color}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && <CreateCarModal onClose={() => setIsModalOpen(false)} onCreate={createCar} />}
    </main>
  )
}

function CreateCarModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ model: '', year: '', color: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.model.trim() || !form.year || !form.color) {
      setFormError('Please complete every field.')
      return
    }
    setIsSaving(true)
    setFormError('')
    try {
      await onCreate({ model: form.model.trim(), year: Number(form.year), color: form.color })
    } catch (saveError) {
      setFormError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div><p className="eyebrow">New record</p><h2 id="modal-title">Create a car</h2></div>
          <button className="close-button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Model<input name="model" value={form.model} onChange={updateField} placeholder="e.g. Civic Sport" autoFocus /></label>
          <label>Year<input name="year" type="number" min="1886" max="2100" value={form.year} onChange={updateField} placeholder="e.g. 2024" /></label>
          <label>Color<input name="color" value={form.color} onChange={updateField} placeholder="e.g. Red" /></label>
          {formError && <p className="error-message" role="alert">{formError}</p>}
          <div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save car'}</button></div>
        </form>
      </section>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
