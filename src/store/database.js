import { reactive, watch } from 'vue';
import { Octokit } from '@octokit/core';

export const state = reactive({
  records: [],
  settings: {
    height: 181,
    targetWeight: 72.1,
    averageIntake: 2000,
    githubToken: '',
    repoName: '', // e.g., "username/repo"
    filePath: 'data/inbody.json',
  },
  status: {
    loading: false,
    error: null,
    lastSync: null
  }
});

// Load from LocalStorage
const loadLocal = () => {
  const localData = localStorage.getItem('inbody_records');
  if (localData) {
    try {
      state.records = JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse local records', e);
    }
  }
  const localSettings = localStorage.getItem('inbody_settings');
  if (localSettings) {
    try {
      state.settings = { ...state.settings, ...JSON.parse(localSettings) };
    } catch (e) {
      console.error('Failed to parse local settings', e);
    }
  }
};

// Save to LocalStorage
const saveLocal = () => {
  localStorage.setItem('inbody_records', JSON.stringify(state.records));
  localStorage.setItem('inbody_settings', JSON.stringify(state.settings));
};

// Sync from GitHub
export const syncFromGitHub = async () => {
  if (!state.settings.githubToken || !state.settings.repoName || !state.settings.filePath) return;
  
  state.status.loading = true;
  state.status.error = null;
  try {
    const octokit = new Octokit({ auth: state.settings.githubToken });
    const [owner, repo] = state.settings.repoName.split('/');
    
    if (!owner || !repo) {
       throw new Error('Invalid repository name format. Use "username/repo"');
    }

    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: state.settings.filePath,
      headers: { 'X-GitHub-Api-Version': '2022-11-28' }
    });

    const content = atob(response.data.content);
    state.records = JSON.parse(content);
    state.status.lastSync = new Date().toISOString();
    saveLocal();
  } catch (error) {
    if (error.status === 404) {
      // File doesn't exist, we will create it on the next save
      console.log('File not found on GitHub, it will be created on next save.');
    } else {
      state.status.error = 'GitHub Sync Failed: ' + error.message;
      console.error(error);
    }
  } finally {
    state.status.loading = false;
  }
};

// Sync to GitHub
export const syncToGitHub = async () => {
  if (!state.settings.githubToken || !state.settings.repoName || !state.settings.filePath) return;
  
  state.status.loading = true;
  state.status.error = null;
  try {
    const octokit = new Octokit({ auth: state.settings.githubToken });
    const [owner, repo] = state.settings.repoName.split('/');
    
    if (!owner || !repo) {
       throw new Error('Invalid repository name format. Use "username/repo"');
    }

    // First try to get the file's SHA
    let sha = undefined;
    try {
      const getResponse = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: state.settings.filePath,
      });
      sha = getResponse.data.sha;
    } catch (e) {
      if (e.status !== 404) throw e;
    }

    // Encode to base64 properly supporting utf-8
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(state.records, null, 2))));
    
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: state.settings.filePath,
      message: 'Update InBody data',
      content,
      sha,
      headers: { 'X-GitHub-Api-Version': '2022-11-28' }
    });
    
    state.status.lastSync = new Date().toISOString();
  } catch (error) {
    state.status.error = 'GitHub Save Failed: ' + error.message;
    console.error(error);
  } finally {
    state.status.loading = false;
  }
};

export const addRecord = async (record) => {
  // Check if a record with the same date exists
  const existingIndex = state.records.findIndex(r => r.date === record.date);
  if (existingIndex >= 0) {
    state.records[existingIndex] = record;
  } else {
    state.records.push(record);
  }
  // Sort by date ascending
  state.records.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  saveLocal();
  await syncToGitHub();
};

export const deleteRecord = async (date) => {
  state.records = state.records.filter(r => r.date !== date);
  saveLocal();
  await syncToGitHub();
};

// Watchers for automatic local saving
watch(() => state.settings, saveLocal, { deep: true });

// Initialize
export const initApp = () => {
  loadLocal();
  // Automatically try to sync from github if token exists on load
  syncFromGitHub();
};
