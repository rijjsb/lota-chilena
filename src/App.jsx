import React, { useState } from 'react';
import { cartones } from './cartones'; 
import './App.css';

function App() {
  const [marked, setMarked] = useState([]);
  const [skin, setSkin] = useState('classic');

  // List of all your images based on your folder screenshot
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
    { name: 'Cheque', value: 'cheque.jpg' }
  ];

  const toggleNumber = (num) => {
    if (num === 0) return;
    if (marked.includes(num)) {
      setMarked(marked.filter(n => n !== num));
    } else {
      setMarked([...marked, num]);
    }
  };

  // 1. Add this new Memory Chip at the top with your other states
  const [cartonIndex, setCartonIndex] = useState(0); 

  // 2. We should also add a function to "Clear" the markers 
  // when we switch cards, so the old markers don't stay on the new card.
  const switchCarton = (index) => {
    setCartonIndex(index);
    setMarked([]); // This "cleans" the board
  };

  return (
    <div className="lota-container">
      <h1>¡Lota Chilena!</h1>

      {/* 3. Add buttons to switch between Card 1 and Card 2 */}
      <div className="carton-selector">
        <button onClick={() => switchCarton(0)}>Cartón 1</button>
        <button onClick={() => switchCarton(1)}>Cartón 2</button>
      </div>

      <div className="skin-selector">
        {skinList.map((s) => (
          <button 
            key={s.value} 
            onClick={() => setSkin(s.value)}
            className={skin === s.value ? 'active' : ''}
          >
            {s.name}
          </button>
        ))}
      </div>
      
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
  );
}

export default App;