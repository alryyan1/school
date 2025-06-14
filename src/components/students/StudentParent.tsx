import React from 'react'
import { Outlet } from 'react-router-dom'

function StudentParent() {
  return (
    <div dir="rtl">
      <Outlet />
    </div>
  )
}

export default StudentParent