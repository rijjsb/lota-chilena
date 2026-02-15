import React, { useState, useEffect } from 'react';
import { cartones } from './cartones'; 
import './App.css';

function App() {
  // Memory: Load saved name and skin from the browser
  const [userName, setUserName] = useState(localStorage.getItem('lota-name') || '');
  const [skin, setSkin] = useState(localStorage.getItem('lota-skin') || 'classic');
  
  const [marked, setMarked] = useState([]);
  const [cartonIndex, setCartonIndex] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Persistence: Save name and skin whenever they change
  useEffect(() => {
    localStorage.setItem('lota-name', userName);
    localStorage.setItem('lota-skin', skin);
  }, [userName, skin]);

  const skinList = [
    { name: 'Clásico', value: 'classic' },
    { name: 'Poroto 1', value: 'Poroto1.jpg' },
    { name: 'Poroto 2', value: 'Poroto2.jpg' },
    { name: 'Poroto 3', value: 'Poroto3.jpg' },
    { name: '$1 Cara', value: 'peso1a.jpg' },
    { name: '$1 Sello', value: 'Peso1b.jpg' },
    { name: '$5 Cara', value: 'peso5a.jpg' },
    { name: '$5 Sello', value: 'peso5b.jpg' },
    { name: 'Escudo', value: 'Escudo.jpg' },
    { name: 'Cheque', value: 'cheque.jpg' },
    { name: '20 Lucas', value: '20lucas.jpg' }
  ];

  const toggleNumber = (num) => {
    if (num === 0) return;
    if (marked.includes(num)) {
      setMarked(marked.filter(n => n !== num));
    } else {
      setMarked([...marked, num]);
    }
  };

  const handleCartonChange = (e) => {
    setCartonIndex(Number(e.target.value));
    setMarked([]); 
  };

  return (
    <div className="main-wrapper">
      <header className="game-header">
        <img src="/lota-logo.png" alt="Lota Chilena" className="logo" />
        <h1>¡Lota Chilena!</h1>
      </header>

      <main className="game-container">
        
        {!isGameStarted ? (
          /* LOBBY SCREEN */
          <div className="setup-card">
            <h3>Configuración</h3>
            
            <div className="input-group">
              <label>Tu Nombre:</label>
              <input 
                type="text" 
                placeholder="Ej: Tío Lucho" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                maxLength={15}
              />
            </div>

            <div className="controls-row">
              <div className="control-group">
                <label>Cartón:</label>
                <select value={cartonIndex} onChange={handleCartonChange}>
                  {cartones.map((c, index) => (
                    <option key={c.id} value={index}>#{c.id}</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label>Skin Inicial:</label>
                <select value={skin} onChange={(e) => setSkin(e.target.value)}>
                  {skinList.map((s) => (
                    <option key={s.value} value={s.value}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              className="start-btn" 
              disabled={userName.trim().length < 2}
              onClick={() => setIsGameStarted(true)}
            >
              {userName.trim().length < 2 ? 'Escribe tu nombre...' : '¡A Jugar!'}
            </button>
          </div>
        ) : (
          /* IN-GAME SCREEN */
          <div className="ingame-status">
            <h2>¡Suerte, {userName}!</h2>
            <p>Jugando con Cartón <strong>#{cartones[cartonIndex].id}</strong></p>
            
            <div className="mid-game-skin">
              <label>Cambiar Skin:</label>
              <select value={skin} onChange={(e) => setSkin(e.target.value)}>
                {skinList.map((s) => (
                  <option key={s.value} value={s.value}>{s.name}</option>
                ))}
              </select>
            </div>

            <button className="reset-btn" onClick={() => setIsGameStarted(false)}>
              Cambiar Cartón / Salir
            </button>
          </div>
        )}
        
        {/* THE BOARD */}
        <div className="carton-wrapper">
          <div className="carton">
            {cartones[cartonIndex].rows.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((num, colIndex) => (
                  <div 
                    key={colIndex} 
                    className={`cell ${num === 0 ? 'empty' : ''}`}
                    onClick={() => toggleNumber(num)}
                  >
                    {num !== 0 && <span className="number-text">{num}</span>}

                    {marked.includes(num) && (
                      <div className="marker-container">
                        {skin === 'classic' ? (
                          <div className="classic-dot"></div>
                        ) : (
                          <img src={`/skins/${skin}`} alt="skin" className="skin-img" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;