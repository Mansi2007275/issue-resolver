'use client'

import React, { useState } from 'react'
import Navbar from './Navbar'

export default function LayoutWrapper({ children }) {
  const [activeTab, setActiveTab] = useState('analyze')

  // Inject activeTab and setActiveTab into page children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, setActiveTab })
    }
    return child
  })

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ minHeight: 'calc(100vh - 56px)', position: 'relative' }}>
        {childrenWithProps}
      </main>
    </>
  )
}
