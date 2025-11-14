import { DashboardData } from '@/hooks/useAdminDashboard'

export function exportToCSV(data: DashboardData | null, filename: string = 'dashboard-data.csv') {
  if (!data) return

  // Prepare CSV content
  let csvContent = 'Dashboard Export\n\n'

  // Statistics Section
  csvContent += 'STATISTICS\n'
  csvContent += 'Metric,Value,Change,Trend\n'
  
  if (data.stats) {
    csvContent += `Total Users,${data.stats.totalUsers.total},${data.stats.totalUsers.change}%,${data.stats.totalUsers.trend}\n`
    csvContent += `- Students,${data.stats.totalUsers.students},,\n`
    csvContent += `- Teachers,${data.stats.totalUsers.teachers},,\n`
    csvContent += `- Parents,${data.stats.totalUsers.parents},,\n`
    csvContent += `Total Revenue,$${data.stats.totalRevenue.current},${data.stats.totalRevenue.change}%,${data.stats.totalRevenue.trend}\n`
    csvContent += `Active Courses,${data.stats.activeCourses.total},${data.stats.activeCourses.change}%,${data.stats.activeCourses.trend}\n`
    csvContent += `Pending Approvals,${data.stats.pendingApprovals.total},${data.stats.pendingApprovals.change}%,${data.stats.pendingApprovals.trend}\n`
    csvContent += `New Registrations,${data.stats.newRegistrations.total},${data.stats.newRegistrations.change}%,${data.stats.newRegistrations.trend}\n`
    csvContent += `Live Classes Today,${data.stats.liveClassesToday.total},${data.stats.liveClassesToday.change}%,${data.stats.liveClassesToday.trend}\n`
    csvContent += `Support Tickets,${data.stats.supportTickets.total},${data.stats.supportTickets.change}%,${data.stats.supportTickets.trend}\n`
    csvContent += `Platform Usage,${data.stats.platformUsage.total}h,${data.stats.platformUsage.change}%,${data.stats.platformUsage.trend}\n`
  }

  // Revenue Data
  csvContent += '\n\nREVENUE DATA (Last 12 Months)\n'
  csvContent += 'Month,Revenue\n'
  data.revenueData.forEach(item => {
    csvContent += `${item.month},$${item.revenue}\n`
  })

  // User Growth Data
  csvContent += '\n\nUSER GROWTH (Last 6 Months)\n'
  csvContent += 'Month,Users\n'
  data.userGrowthData.forEach(item => {
    csvContent += `${item.month},${item.users}\n`
  })

  // Course Enrollments
  csvContent += '\n\nTOP COURSE ENROLLMENTS\n'
  csvContent += 'Course,Enrollments\n'
  data.courseEnrollmentData.forEach(item => {
    csvContent += `"${item.course}",${item.enrollments}\n`
  })

  // Recent Activities
  csvContent += '\n\nRECENT ACTIVITIES\n'
  csvContent += 'Type,Message,Time\n'
  data.recentActivities.forEach(item => {
    csvContent += `${item.type},"${item.message}",${item.time}\n`
  })

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(data: DashboardData | null, filename: string = 'dashboard-data.json') {
  if (!data) return

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportToPDF(data: DashboardData | null) {
  if (!data) return

  // For PDF export, we'll create a printable HTML version
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          color: #1e40af;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 10px;
        }
        h2 {
          color: #3b82f6;
          margin-top: 30px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card {
          border: 1px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
        }
        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>Admin Dashboard Report</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

      <h2>Key Statistics</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Total Users</div>
          <div class="stat-value">${data.stats?.totalUsers.total || 0}</div>
          <div>${data.stats?.totalUsers.students || 0} students, ${data.stats?.totalUsers.teachers || 0} teachers</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">$${data.stats?.totalRevenue.current || 0}</div>
          <div>${data.stats?.totalRevenue.change || 0}% change</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Courses</div>
          <div class="stat-value">${data.stats?.activeCourses.total || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pending Approvals</div>
          <div class="stat-value">${data.stats?.pendingApprovals.total || 0}</div>
        </div>
      </div>

      <h2>Revenue Trend (Last 12 Months)</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${data.revenueData.map(item => `
            <tr>
              <td>${item.month}</td>
              <td>$${item.revenue.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Top Course Enrollments</h2>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Enrollments</th>
          </tr>
        </thead>
        <tbody>
          ${data.courseEnrollmentData.map(item => `
            <tr>
              <td>${item.course}</td>
              <td>${item.enrollments}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Recent Activities</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Message</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${data.recentActivities.map(item => `
            <tr>
              <td>${item.type}</td>
              <td>${item.message}</td>
              <td>${item.time}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
