import { useState } from 'react'
import './App.css'
import { Scanner } from './Scanner'
import { Generator } from './Generator'

type Tab = 'welcome' | 'scan' | 'generate'

export function App () {
  const [tab, setTab] = useState<Tab>('welcome')
  return (
    <>
      <Scanner welcome={tab === 'welcome'} />
      <Generator welcome={tab === 'welcome'} />
    </>
  )
}
