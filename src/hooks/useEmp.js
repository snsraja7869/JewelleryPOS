import React, { useState, useEffect } from 'react'

import HttpService from '../services/http_service'
import useServiceApi from './useServiceApi'

const tokenId = process.env.TOKEN_NAME

const useEmpAPI = () => {
  const [loading, setLoading] = useState(false)
  const [cartData, setCartData] = useState(null)
  const [error, setError] = useState(null)

  // const { APIService } = useServiceApi()

  const fetchCartData = async () => {
    try {
      setLoading(true)
      const response = await useServiceApi.index('admin/settings/users')

      setCartData(response.data)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartData()
  }, [])

  const storeItem = async payloadData => {
    try {
      setLoading(true)
      await useServiceApi.store(`admin/setting/users`, payloadData)

      // After storing the item, fetch updated cart data
      await fetchCartData()

      // localStorage.setItem('user_id', data.id)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async id => {
    try {
      setLoading(true)
      await useServiceApi.delete(`customer/${id}`)
      await fetchCartData()
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  return { loading, cartData, error, fetchCartData, storeItem, removeItem }
}

export default useEmpAPI
