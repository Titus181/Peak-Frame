import { reactive, watch } from 'vue';
import { Octokit } from '@octokit/core';
import { state as inbodyState } from './database';

export const danceState = reactive({
  logs: [],
  skills_mastery: {
    "Breaking": ["Power Move", "Freeze", "Footwork"],
    "Jazz": ["Isolation", "Wave", "Turn"],
    "Hip Hop": ["Bounce", "Groove", "Isolation"]
  },
  status: {
    loading: false,
    error: null,
    lastSync: null
  }
});

const DANCE_FILE_PATH = 'data/dance_logs.json';

// Load from LocalStorage
const loadLocalDance = () => {
  const localData = localStorage.getItem('dance_logs');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (parsed.logs) danceState.logs = parsed.logs;
      if (parsed.skills_mastery) danceState.skills_mastery = parsed.skills_mastery;
    } catch (e) {
      console.error('Failed to parse local dance logs', e);
    }
  }
};

// Save to LocalStorage
const saveLocalDance = () => {
  const dataToSave = {
    logs: danceState.logs,
    skills_mastery: danceState.skills_mastery
  };
  localStorage.setItem('dance_logs', JSON.stringify(dataToSave));
};

// Sync from GitHub
export const syncDanceFromGitHub = async () => {
  const token = inbodyState.settings.githubToken;
  const repoName = inbodyState.settings.repoName;
  
  if (!token || !repoName) return;
  
  danceState.status.loading = true;
  danceState.status.error = null;
  
  try {
    const octokit = new Octokit({ auth: token });
    const [owner, repo] = repoName.split('/');
    
    if (!owner || !repo) throw new Error('Invalid repository name format.');

    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: DANCE_FILE_PATH,
      headers: { 'X-GitHub-Api-Version': '2022-11-28' }
    });

    const content = atob(response.data.content);
    const parsed = JSON.parse(content);
    
    if (parsed.logs) danceState.logs = parsed.logs;
    if (parsed.skills_mastery) danceState.skills_mastery = parsed.skills_mastery;
    
    danceState.status.lastSync = new Date().toISOString();
    saveLocalDance();
  } catch (error) {
    if (error.status === 404) {
      console.log('Dance file not found on GitHub, it will be created on next save.');
    } else {
      danceState.status.error = 'GitHub Sync Failed: ' + error.message;
      console.error(error);
    }
  } finally {
    danceState.status.loading = false;
  }
};

// Sync to GitHub
export const syncDanceToGitHub = async () => {
  const token = inbodyState.settings.githubToken;
  const repoName = inbodyState.settings.repoName;
  
  if (!token || !repoName) return;
  
  danceState.status.loading = true;
  danceState.status.error = null;
  
  try {
    const octokit = new Octokit({ auth: token });
    const [owner, repo] = repoName.split('/');
    
    let sha = undefined;
    try {
      const getResponse = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: DANCE_FILE_PATH,
      });
      sha = getResponse.data.sha;
    } catch (e) {
      if (e.status !== 404) throw e;
    }

    const dataToSave = {
      logs: danceState.logs,
      skills_mastery: danceState.skills_mastery
    };
    
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(dataToSave, null, 2))));
    
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: DANCE_FILE_PATH,
      message: 'Update Dance Journal data',
      content,
      sha,
      headers: { 'X-GitHub-Api-Version': '2022-11-28' }
    });
    
    danceState.status.lastSync = new Date().toISOString();
  } catch (error) {
    danceState.status.error = 'GitHub Save Failed: ' + error.message;
    console.error(error);
  } finally {
    danceState.status.loading = false;
  }
};

export const addDanceLog = async (log) => {
  danceState.logs.push(log);
  // Sort descending by date so newest is first
  danceState.logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  saveLocalDance();
  await syncDanceToGitHub();
};

export const deleteDanceLog = async (id) => {
  danceState.logs = danceState.logs.filter(l => l.id !== id);
  saveLocalDance();
  await syncDanceToGitHub();
};

// Initialize
export const initDanceApp = () => {
  loadLocalDance();
  syncDanceFromGitHub();
};
