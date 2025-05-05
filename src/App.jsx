import { useState } from 'react'
import './App.css'
import P5Shader from './components/P5Shader'
import GreetText from './components/GreetText'

function App() {
  const [greetText] = useState("💚🧡   B06oo7   💜💛")

  return (
    <div className="app">
      <div className="shader-container">
        <P5Shader />
      </div>
      <GreetText text={greetText} />
    </div>
  )
}

export default App
