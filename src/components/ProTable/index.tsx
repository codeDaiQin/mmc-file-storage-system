import React from 'react'

interface ProTableType {
  columns: {
    title: string
    key: string
    dataIndex: string
    render?: (text?: string, record?: any, index?: number) => React.ReactNode
  }[]
  loading?: boolean
  total?: number
  current?: number
  pageSize?: number
  dataSource?: any[]
  // 
}

const ProTable: React.FC<ProTableType> = (props) => {
  const {} = props
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ProTable
