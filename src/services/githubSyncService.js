import { buildBackupObject } from '../utils/exportImport.js'

const GITHUB_CONFIG_KEY = 'spendwise_github_sync_config'
const GITHUB_STATUS_KEY = 'spendwise_github_sync_status'

export function getGithubConfig() {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  const defaultToken = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GITHUB_TOKEN) || ''
  return {
    repoUrl: 'https://github.com/Kowshiek/Expense-Tracker-',
    owner: 'Kowshiek',
    repo: 'Expense-Tracker-',
    branch: 'main',
    token: defaultToken,
    autoSync: true,
    syncPath: 'data/expenses-database.json',
  }
}

export function saveGithubConfig(config) {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config))
}

export function getGithubSyncStatus() {
  try {
    const raw = localStorage.getItem(GITHUB_STATUS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return {
    lastSyncedAt: null,
    status: 'idle', // 'idle' | 'syncing' | 'success' | 'error'
    lastCommitUrl: null,
    errorMessage: null,
  }
}

function setGithubSyncStatus(status) {
  localStorage.setItem(GITHUB_STATUS_KEY, JSON.stringify(status))
  window.dispatchEvent(new CustomEvent('spendwise:github-status-updated', { detail: status }))
}

// Unicode safe base64 encoder
function utf8ToBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode('0x' + p1)
    )
  )
}

/**
 * Pushes the latest mobile IndexedDB transactions & budgets to the GitHub repo.
 */
export async function syncDatabaseToGithub() {
  const config = getGithubConfig()
  if (!config.token || !config.token.trim()) {
    // No token provided yet
    return {
      success: false,
      skipped: true,
      reason: 'GitHub Personal Access Token not configured yet. Configure in Settings.',
    }
  }

  setGithubSyncStatus({
    ...getGithubSyncStatus(),
    status: 'syncing',
    errorMessage: null,
  })

  try {
    const backup = await buildBackupObject()
    const contentStr = JSON.stringify(backup, null, 2)
    const base64Content = utf8ToBase64(contentStr)

    const owner = config.owner || 'Kowshiek'
    const repo = config.repo || 'Expense-Tracker-'
    const path = config.syncPath || 'data/expenses-database.json'
    const branch = config.branch || 'main'

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    const headers = {
      Authorization: `Bearer ${config.token.trim()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }

    // Step 1: Check if file already exists to get its SHA
    let existingSha = null
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
      method: 'GET',
      headers,
    })

    if (getRes.status === 200) {
      const fileData = await getRes.json()
      existingSha = fileData.sha
    } else if (getRes.status !== 404 && getRes.status !== 401) {
      // ignore other errors for now
    } else if (getRes.status === 401) {
      throw new Error('Invalid GitHub Personal Access Token. Please verify permissions in Settings.')
    }

    // Step 2: Commit file to GitHub repository
    const nowStr = new Date().toLocaleString()
    const txCount = backup.data.transactions?.length || 0
    const commitBody = {
      message: `SpendWise auto-sync: ${txCount} transactions updated on ${nowStr} [skip ci]`,
      content: base64Content,
      branch,
    }
    if (existingSha) {
      commitBody.sha = existingSha
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(commitBody),
    })

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}))
      throw new Error(errJson.message || `GitHub API error (HTTP ${putRes.status})`)
    }

    const putData = await putRes.json()
    const commitUrl = putData?.commit?.html_url || `https://github.com/${owner}/${repo}/commits/${branch}`

    const newStatus = {
      lastSyncedAt: new Date().toISOString(),
      status: 'success',
      lastCommitUrl: commitUrl,
      errorMessage: null,
    }
    setGithubSyncStatus(newStatus)

    return {
      success: true,
      lastSyncedAt: newStatus.lastSyncedAt,
      commitUrl,
    }
  } catch (err) {
    const errorStatus = {
      ...getGithubSyncStatus(),
      status: 'error',
      errorMessage: err.message,
    }
    setGithubSyncStatus(errorStatus)
    throw err
  }
}
