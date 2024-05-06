/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader } from '@mui/material'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'

import HttpService from '@/services/http_service'

export default function Summary({ isRefreshOrderSummary, setIsRefreshOrderSummary, cart, setCart }) {
  const [data, setData] = useState(() => [])

  const refreshOrderSummary = async props => {
    try {
      var resultData = null

      var tokenId = 'user-token'

      var current_cart_id = localStorage.getItem('current_cart_id')

      await new HttpService()
        .getData(`checkout/cart?current_cart_id=${current_cart_id}`, tokenId)
        .then(response => response)
        .then(response => (resultData = response))

      return resultData
    } catch (error) {
      return error
    }
  }

  const updateCartItems = async itempayload => {
    try {
      var resultData = null

      var tokenId = 'user-token'

      var current_cart_id = localStorage.getItem('current_cart_id')

      await new HttpService()
        .putData(itempayload, `checkout/cart?current_cart_id=${current_cart_id}`, tokenId)
        .then(response => response)
        .then(response => (resultData = response))

      return resultData
    } catch (error) {
      return error
    }
  }

  useEffect(() => {
    if (isRefreshOrderSummary === true) {
      async function fetchNow() {
        try {
          const res = await refreshOrderSummary()

          setCart(res.data)
          setData(res.data.items)
          setIsRefreshOrderSummary(false)
        } catch (error) {
          console.error('Error refreshing order summary:', error)
        }
      }

      fetchNow()
    }
  }, [isRefreshOrderSummary, setCart, setIsRefreshOrderSummary])

  useEffect(() => {
    async function updateCartItemsNow() {
      try {
        const updatePayload = {}

        data.forEach(item => {
          updatePayload.qty = {
            ...updatePayload.qty,
            [item.id]: {
              quantity: parseInt(item.quantity),
              making_charges_amount: parseFloat(item.making_charges_amount),
              weight: parseFloat(item.weight),
              other_amount: parseFloat(item.other_amount),
              price: parseFloat(item.formatted_price.replace('$', ''))
            }
          }
        })

        const res = await updateCartItems(updatePayload)

        const res2 = await refreshOrderSummary()

        // console.log(res2)

        // setCart(res2.data)

        // setData(res2.data.items)

        console.log(res)
      } catch (error) {
        console.error('Error updating cart items:', error)
      }
    }

    if (isRefreshOrderSummary === false) {
      updateCartItemsNow()
    }
  }, [data, isRefreshOrderSummary])

  // Column Definitions
  const columnHelper = createColumnHelper()

  const columns = [
    columnHelper.accessor('name', {
      header: 'Item'
    }),
    columnHelper.accessor('purity', {
      header: 'Purity (K)'
    }),
    columnHelper.accessor('formatted_price', {
      header: 'Rate/gm'
    }),
    columnHelper.accessor('weight', {
      header: 'Wt (gm)'
    }),
    columnHelper.accessor('quantity', {
      header: 'Pcs'
    }),
    columnHelper.accessor('making_charges_amount', {
      header: 'Making Amt'
    }),
    columnHelper.accessor('other_amount', {
      header: 'Other Amt'
    }),
    columnHelper.accessor('formatted_total', {
      header: 'Total Amt'
    })
  ]

  const EditableCell = ({ getValue, row, column, table }) => {
    // Vars
    const initialValue = getValue()

    // States
    const [value, setValue] = useState(initialValue)

    const onBlur = () => {
      table.options.meta?.updateData(row.index, column.id, value)
    }

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return <input value={value} onChange={e => setValue(e.target.value)} onBlur={onBlur} />
  }

  // Give our default column cell renderer editing superpowers!
  const defaultColumn = {
    cell: ({ getValue, row, column, table }) => {
      return <EditableCell getValue={getValue} row={row} column={column} table={table} />
    }
  }

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    },

    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value
              }
            }

            return row
          })
        )
      }
    }
  })

  return (
    <Card>
      <CardHeader title='Order Summary' />
      <CardContent>
        <div className='overflow-x-auto' style={{ maxHeight: '300px' }}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getTotalSize() > 0 ? (
                table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => {
                        return (
                          <td key={cell.id} className={styles.cellWithInput}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td rowSpan={'100%'}>Your Cart Is Empty</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <hr></hr>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th style={{ textAlign: 'start' }}>Sub Total</th>
              <td style={{ textAlign: 'end' }}>{cart?.formatted_sub_total}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'start' }}>CSGT (7.5%)</th>
              <td style={{ textAlign: 'end' }}>{cart?.sub_total}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'start' }}>SGST (7.5%)</th>
              <td style={{ textAlign: 'end' }}>{cart?.sub_total}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'start' }}>Total Tax Amount</th>
              <td style={{ textAlign: 'end' }}>{cart?.formatted_tax_total}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'start' }}>Taxable Value</th>
              <td style={{ textAlign: 'end' }}>{cart?.formatted_grand_total}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}