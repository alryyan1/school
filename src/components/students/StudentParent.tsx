import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React from 'react'
import { Outlet } from 'react-router-dom'

function StudentParent() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ar'>StudentParent

        <Outlet/>
    </LocalizationProvider>
  )
}

export default StudentParent