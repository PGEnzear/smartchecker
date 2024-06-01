import axios from "axios"
import { useAccessToken } from './useAccessToken'

export const useAxiosInstance = () => {
  const runtimeConfig = useRuntimeConfig()
  const accessToken = useAccessToken()

  return axios.create({
    baseURL: runtimeConfig.public.apiBaseurl,
    headers: {
      ...accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : undefined
    },
  })
}
