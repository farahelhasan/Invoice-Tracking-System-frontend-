// login 
document.getElementById("loginForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        const token = data.token; 
        console.log(token);

        // Store the token in localStorage 
        localStorage.setItem('jwtToken', token);

        alert('Login successful!');
        console.log(getUserInfoFromToken());
        const role = getUserInfoFromToken().role;
        const email = getUserInfoFromToken().email;
        localStorage.setItem('role', role);
        localStorage.setItem('email', email);

      if(role == "USER"){
        window.location.href = 'userDashboard.html'; 

      }else if(role == "SUPERUSER"){
        window.location.href = 'superuserDashboard.html'; 

      }else if(role == "AUDITOR"){
        window.location.href = 'auditorDashboard.html'; 
      }

    }  else {
        const data = await response.json();
        alert('Login failed. Please check your credentials.\n'+ data.message+ "\n"+ data.statusCode );
    }
});

// Signup
document.getElementById("signupForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password })
    });

    if (response.ok) {
        alert('Sign up successful! Please log in.');
        window.location.href = 'login.html'; // Redirect to login
    } else {
        const data = await response.json();
        console.log(data)
        alert('Sign up failed. Please try again. \n'+ data.message+ "\n"+ data.statusCode);
    }
});

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = 'login.html';
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        alert("User not authenticated.");
        window.location.href = 'login.html';
        return;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(url, options);
    return response;
}


function getUserInfoFromToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    try {
        const decoded = jwt_decode(token); 
       // console.log(decoded);
        return {
            email: decoded.sub,
            role: decoded.role
        };
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}
