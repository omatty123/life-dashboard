const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { exec } = require('child_process')
const readline = require('readline')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#09090B',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle opening folders/files
ipcMain.handle('open-path', async (event, filePath) => {
  const expandedPath = filePath.replace(/^~/, os.homedir())
  return new Promise((resolve, reject) => {
    exec(`open "${expandedPath}"`, (error) => {
      if (error) reject(error)
      else resolve(true)
    })
  })
})

// Handle opening URLs
ipcMain.handle('open-url', async (event, url) => {
  shell.openExternal(url)
  return true
})

// Read Claude Code data
ipcMain.handle('get-claude-data', async () => {
  const claudeDir = path.join(os.homedir(), '.claude')
  const projectsDir = path.join(claudeDir, 'projects')

  const result = {
    totalMessages: 0,
    totalSessions: 0,
    projects: [],
    recentConversations: [],
    dailyActivity: []
  }

  try {
    // Read stats cache for daily activity
    const statsPath = path.join(claudeDir, 'stats-cache.json')
    if (fs.existsSync(statsPath)) {
      const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8'))
      if (statsData.daily) {
        result.dailyActivity = Object.entries(statsData.daily)
          .map(([date, data]) => ({
            date,
            messages: data.messages || 0,
            sessions: data.sessions || 0,
            toolCalls: data.toolCalls || 0
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30) // Last 30 days

        // Calculate totals from daily
        result.totalMessages = result.dailyActivity.reduce((sum, d) => sum + d.messages, 0)
        result.totalSessions = result.dailyActivity.reduce((sum, d) => sum + d.sessions, 0)
      }
    }

    // Read projects directory to get project stats
    if (fs.existsSync(projectsDir)) {
      const projectFolders = fs.readdirSync(projectsDir)
      const projectMap = new Map()

      for (const folder of projectFolders) {
        const folderPath = path.join(projectsDir, folder)
        const stat = fs.statSync(folderPath)

        if (stat.isDirectory()) {
          // Decode folder name (it's URL encoded path)
          const decodedPath = decodeURIComponent(folder).replace(/-/g, '/')
          const projectName = decodedPath.split('/').pop() || folder

          // Count session files in this project
          const sessionFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.jsonl'))

          let messageCount = 0
          let lastActivity = null
          let recentMessages = []

          for (const sessionFile of sessionFiles) {
            const sessionPath = path.join(folderPath, sessionFile)
            const sessionStat = fs.statSync(sessionPath)

            if (!lastActivity || sessionStat.mtime > lastActivity) {
              lastActivity = sessionStat.mtime
            }

            // Read session file to count messages and get conversation info
            try {
              const content = fs.readFileSync(sessionPath, 'utf8')
              const lines = content.trim().split('\n').filter(l => l.trim())

              for (const line of lines) {
                try {
                  const entry = JSON.parse(line)
                  if (entry.type === 'human' || entry.type === 'assistant') {
                    messageCount++
                  }

                  // Track recent human messages for conversation titles
                  if (entry.type === 'human' && entry.message?.content) {
                    const content = typeof entry.message.content === 'string'
                      ? entry.message.content
                      : entry.message.content[0]?.text || ''

                    if (content.length > 10) {
                      recentMessages.push({
                        content: content.slice(0, 100),
                        timestamp: entry.timestamp || sessionStat.mtime.toISOString(),
                        sessionId: sessionFile.replace('.jsonl', ''),
                        projectPath: decodedPath,
                        projectName
                      })
                    }
                  }
                } catch (e) {
                  // Skip malformed lines
                }
              }
            } catch (e) {
              // Skip unreadable files
            }
          }

          if (sessionFiles.length > 0) {
            projectMap.set(decodedPath, {
              id: folder,
              name: projectName,
              path: decodedPath.startsWith('/') ? decodedPath : '~/' + decodedPath,
              sessions: sessionFiles.length,
              messages: messageCount,
              lastActivity: lastActivity?.toISOString(),
              recentMessages
            })
          }
        }
      }

      // Convert to array and sort by message count
      result.projects = Array.from(projectMap.values())
        .sort((a, b) => b.messages - a.messages)

      // Get recent conversations from all projects
      const allRecentMessages = result.projects
        .flatMap(p => p.recentMessages || [])
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20)

      result.recentConversations = allRecentMessages.map(msg => ({
        title: msg.content.replace(/\n/g, ' ').slice(0, 80) + (msg.content.length > 80 ? '...' : ''),
        projectName: msg.projectName,
        projectPath: msg.projectPath,
        timestamp: msg.timestamp,
        sessionId: msg.sessionId
      }))

      // Recalculate totals from projects
      result.totalMessages = result.projects.reduce((sum, p) => sum + p.messages, 0)
      result.totalSessions = result.projects.reduce((sum, p) => sum + p.sessions, 0)
    }
  } catch (error) {
    console.error('Error reading Claude data:', error)
  }

  return result
})

// Open project in Claude Code
ipcMain.handle('open-in-claude', async (event, projectPath) => {
  const expandedPath = projectPath.replace(/^~/, os.homedir())
  return new Promise((resolve, reject) => {
    exec(`cd "${expandedPath}" && claude`, (error) => {
      if (error) reject(error)
      else resolve(true)
    })
  })
})
