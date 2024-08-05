import { useState } from 'react'
import './App.css'
import { Scanner } from './Scanner'
import { Generator } from './Generator'

type Tab = 'welcome' | 'scan' | 'generate'

export function App () {
  const [tab, setTab] = useState<Tab>('welcome')
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  return (
    <main className={`main ${tab === 'welcome' ? 'welcome' : ''}`}>
      {tab !== 'welcome' && !keyboardVisible ? (
        <div className={`tabs tab-selected-${tab}`}>
          <button className='tab tab-scan' onClick={() => setTab('scan')}>
            Scan
          </button>
          <button
            className='tab tab-generate'
            onClick={() => setTab('generate')}
          >
            Generate
          </button>
        </div>
      ) : null}
      <Scanner
        welcome={tab === 'welcome'}
        hidden={tab === 'generate'}
        onUse={() => setTab('scan')}
      />
      {tab === 'welcome' ? (
        <div className='or-wrapper'>
          <div className='or'>or</div>
        </div>
      ) : null}
      <Generator
        welcome={tab === 'welcome'}
        hidden={tab === 'scan'}
        onUse={() => setTab('generate')}
        onKeyboard={setKeyboardVisible}
      />
    </main>
  )
}
