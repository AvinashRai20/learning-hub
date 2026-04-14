const sessionKey = 'learningHubSession';
const accountKey = 'learningHubAccount';
const loginHistoryKey = 'learningHubLoginHistory';

function getStoredAccount() {
    return JSON.parse(localStorage.getItem(accountKey) || 'null');
}

function setStoredAccount(account) {
    localStorage.setItem(accountKey, JSON.stringify(account));
}

function clearSession() {
    localStorage.removeItem(sessionKey);
}

function setSession(session) {
    localStorage.setItem(sessionKey, JSON.stringify(session));
}

function getSession() {
    return JSON.parse(localStorage.getItem(sessionKey) || 'null');
}

function getLoginHistory() {
    return JSON.parse(localStorage.getItem(loginHistoryKey) || '[]');
}

function addToHistory(userData) {
    let history = getLoginHistory();
    history.unshift({
        ...userData,
        timestamp: new Date().toISOString()
    });
    // Keep last 50 logins
    history = history.slice(0, 50);
    localStorage.setItem(loginHistoryKey, JSON.stringify(history));
}

function updateSignInStatus() {
    const statusText = document.getElementById('statusText');
    const statusBadge = document.getElementById('statusBadge');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const session = getSession();

    if (!statusText || !statusBadge) {
        return;
    }

    if (session && session.signedIn) {
        statusText.textContent = `You are signed in as ${session.name}.`;
        statusBadge.textContent = 'Signed in';
        statusBadge.style.background = 'rgba(77, 193, 129, 0.18)';
        profileName.textContent = session.name || '-';
        profileEmail.textContent = session.email || '-';
    } else {
        statusText.textContent = 'You are not signed in yet.';
        statusBadge.textContent = 'Not signed in';
        statusBadge.style.background = 'rgba(91,156,255,0.12)';
        profileName.textContent = '-';
        profileEmail.textContent = '-';
    }

    // Update history display if on SignInOut page
    if (document.getElementById('historyList')) {
        displayHistory();
    }
}

window.displayHistory = function() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const history = getLoginHistory();
    historyList.innerHTML = history.map(entry => `
        <div class="history-item">
            <span class="history-user">${entry.name}</span>
            <span class="history-email">${entry.email}</span>
            <span class="history-type">${entry.loginType.toUpperCase()}</span>
            <span class="history-time">${new Date(entry.timestamp).toLocaleString()}</span>
        </div>
    `).join('');

    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No logins yet. Sign in to see history!</div>';
    }
};

function handleAuth(action) {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const passwordInput = document.getElementById('userPassword');
    const rememberInput = document.getElementById('rememberMe');

    if (action === 'signin') {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name || !email || !password) {
            alert('Please complete all fields before signing in.');
            return;
        }

        const account = {
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        setStoredAccount(account);
        setSession({ signedIn: true, name, email, timestamp: new Date().toISOString() });
        addToHistory({ name, email, loginType: 'signin' });

        if (rememberInput.checked) {
            localStorage.setItem('learningHubRemember', 'true');
        } else {
            localStorage.removeItem('learningHubRemember');
        }

        alert('Sign in successful. Ab aap signed in hain. History updated!');
        updateSignInStatus();
        return;
    }

    if (action === 'signout') {
        const session = getSession();
        if (!session || !session.signedIn) {
            alert('Aap abhi signed in nahin hain.');
            return;
        }

        clearSession();
        alert('Sign out successful. Aap ab now signed out ho gaye hain.');
        updateSignInStatus();
    }
}

function handleLogin() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginMessage = document.getElementById('loginMessage');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const account = getStoredAccount();

    if (!email || !password) {
        loginMessage.textContent = 'Please enter both email and password.';
        loginMessage.style.color = '#f7c6c7';
        return;
    }

    if (!account || account.email !== email) {
        loginMessage.textContent = 'Account not found. Pehle sign in page par register kijiye.';
        loginMessage.style.color = '#f7c6c7';
        return;
    }

    if (account.password !== password) {
        loginMessage.textContent = 'Password incorrect. Dobara check kijiye.';
        loginMessage.style.color = '#f7c6c7';
        return;
    }

    setSession({ signedIn: true, name: account.name, email: account.email, timestamp: new Date().toISOString() });
    addToHistory({ name: account.name, email: account.email, loginType: 'login' });
    loginMessage.textContent = 'Login successful! Check SignInOut.html for history.';
    loginMessage.style.color = '#b9f7c6';
}

window.addEventListener('DOMContentLoaded', () => {
    updateSignInStatus();
});