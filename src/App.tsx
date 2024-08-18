import { useState } from 'react'
import styles from './App.module.css'
import { Generator } from './generator'
import './global.css'
import { Scanner } from './scanner'

type Tab = 'welcome' | 'scan' | 'generate'

export function App () {
  const [tab, setTab] = useState<Tab>('welcome')
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  return (
    <main className={`${styles.main} ${tab === 'welcome' ? 'welcome' : ''}`}>
      {tab !== 'welcome' && !keyboardVisible ? (
        <div className={`${styles.tabs} ${styles[`tabSelected-${tab}`]}`}>
          <button
            className={`${styles.tab} ${styles.tabScan}`}
            onClick={() => setTab('scan')}
          >
            Scan
          </button>
          <button
            className={`${styles.tab} ${styles.tabGenerate}`}
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
        <div className={styles.orWrapper}>
          <div className={styles.or}>or</div>
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
