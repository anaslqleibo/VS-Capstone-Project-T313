function LoginPage() {
    return (
        <div className="login-container">
            <h2>2 Bent Rods - Login</h2>
            <form>
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" required />

                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" required />

                <button type="submit">Login</button>
            </form>
        </div>
    );
  }
  
  export default LoginPage;
  