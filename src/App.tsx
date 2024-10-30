import { FC, useEffect, useState } from 'react'
const { VITE_DATA_URL: backendUrl } = import.meta.env

interface DateItem {
  amount: number
}

interface Item extends DateItem {
  date: string
}

interface MonthItem extends DateItem {
  month: string
}

interface YearItem extends DateItem {
  year: number
}

interface TableProps<T extends DateItem> {
  list: T[]
}

function YearTable(props: TableProps<YearItem>) {
  return (
    <div>
      <h2>Year Table</h2>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.list.map((item, index) => (
            <tr key={index}>
              <td>{item.year}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SortTable(props: TableProps<Item>) {
  return (
    <div>
      <h2>Sort Table</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.list.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MonthTable(props: TableProps<MonthItem>) {
  return (
    <div>
      <h2>Month Table</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.list.map((item, index) => (
            <tr key={index}>
              <td>{item.month}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DateTable<T extends DateItem>(
  Component: FC<TableProps<T>>,
  aggregateFn: (list: Item[]) => T[]
) {
  return function DateTableWrapper(props: TableProps<Item>) {
    return <Component {...props} list={aggregateFn(props.list)} />
  }
}

const aggregateByYear = (list: Item[]): YearItem[] => {
  const result: Record<number, number> = {}

  list.forEach(({ date, amount }) => {
    const year = new Date(date).getFullYear()
    result[year] = (result[year] || 0) + amount
  })

  return Object.entries(result).map(([year, amount]) => ({
    year: parseInt(year),
    amount,
  }))
}

const aggregateByMonth = (list: Item[]): MonthItem[] => {
  const result: Record<string, number> = {}

  list.forEach(({ date, amount }) => {
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      new Date(date)
    )
    result[month] = (result[month] || 0) + amount
  })

  return Object.entries(result).map(([month, amount]) => ({
    month,
    amount,
  }))
}

const AggregateMonthTable = DateTable(MonthTable, aggregateByMonth)
const AggregateYearTable = DateTable(YearTable, aggregateByYear)
const AggregateSortTable = DateTable(SortTable, (list) => list)

const App = () => {
  const [list, setList] = useState<Item[]>([])

  useEffect(() => {
    fetch(backendUrl)
      .then((response) => response.json())
      .then(({ list }) => setList(list))
      .catch((error) => console.log(error))
  }, [])

  const sortedList = list
    ? list.sort(
        (a: Item, b: Item) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : list

  return (
    list && (
      <div id="app">
        <AggregateMonthTable list={sortedList} />
        <AggregateYearTable list={sortedList} />
        <AggregateSortTable list={sortedList} />
      </div>
    )
  )
}

export default App
