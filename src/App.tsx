import React, { FC } from 'react'

interface IProps {
  visible: boolean
  data: any
}

const App: FC<IProps> = (props: IProps) => {
  console.log(props, 'props')
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  )
}

export default App
