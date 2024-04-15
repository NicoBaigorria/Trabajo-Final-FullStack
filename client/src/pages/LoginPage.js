import { useState } from "react";
import { useAuth } from "../components/AuthProvider";

const LoginPage = () => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const auth = useAuth();

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (input.username !== "" && input.password !== "") {
      try {
        console.log(input)
        const response = await fetch("http://localhost:8000/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(input).toString(),
        });
        if (response.ok) {
          const data = await response.json();
          // Set bearer token in cookie
          document.cookie = `token=${data.token}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`; // Adjust expiry as per your requirement
          auth.loginAction(); // No need to pass input data
        } else {
          alert("Invalid credentials");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while logging in");
      }
    } else {
      alert("Please provide valid input");
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <form onSubmit={handleSubmitEvent}>
      <div className="form_control">
        <label htmlFor="user-email">Email:</label>
        <input
          type="email"
          id="user-username"
          name="username"
          placeholder="example@yahoo.com"
          aria-describedby="user-email"
          aria-invalid="false"
          onChange={handleInput}
        />
        <div id="user-username" className="sr-only">
          Please enter a valid username. It must contain at least 6 characters.
        </div>
      </div>
      <div className="form_control">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          aria-describedby="user-password"
          aria-invalid="false"
          onChange={handleInput}
        />
        <div id="user-password" className="sr-only">
          your password should be more than 6 character
        </div>
      </div>
      <button className="btn-submit">Login</button>
    </form>
  );
};

export default LoginPage;